import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { sendEnrollmentEmails } from "../server/lib/email.js";
import { EnrollmentDatabase } from "../server/lib/enrollmentDb.js";
import {
  REFERRAL_CREDIT_CENTS,
  REFERRAL_REWARD_CENTS,
  evaluateReferralCode,
  generateReferralCode,
  normalizeReferralCode,
} from "../server/lib/referrals.js";
import { getPaymentPlanTerms } from "../server/lib/stripe.js";

function seedEnrollment(db, { id, name, email, referralCode, referredByCode = null, credit = 0 }) {
  return db.createEnrollment({
    id,
    studentFullName: name,
    email,
    phone: "949-555-0100",
    dateOfBirth: "2000-01-01",
    addressLine1: "100 Referral Way",
    city: "Irvine",
    state: "CA",
    postalCode: "92614",
    emergencyContactName: "Emergency Contact",
    emergencyContactPhone: "949-555-0101",
    programId: "referral-program",
    cohortId: "referral-cohort",
    notes: "",
    status: "payment_setup",
    paymentStatus: "payment_setup",
    paymentOption: "full",
    paymentAmountCents: 200_000 - credit,
    tuitionTotalCents: 200_000 - credit,
    balanceDueCents: 0,
    amountPaidCents: 0,
    paymentInstallmentsTotal: 1,
    paymentInstallmentsPaid: 0,
    paymentInterval: null,
    referralCode,
    referredByCode,
    referralCreditCents: credit,
  });
}

async function createDb(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "first-step-referral-test-"));
  const db = new EnrollmentDatabase(path.join(dir, "enrollment.db"));

  db.createProgram({
    id: "referral-program",
    title: "Certified Nurse Assistant",
    summary: "Program used to verify the referral program.",
    duration: "6 weeks",
    schedule: "Weekday",
    isActive: true,
    sortOrder: 1,
  });
  db.createCohort({
    id: "referral-cohort",
    programId: "referral-program",
    title: "CNA Weekday",
    startDate: "2026-10-19",
    endDate: "2026-11-13",
    scheduleLabel: "Weekday",
    meetingPattern: "Monday to Friday",
    tuitionCents: 200_000,
    allowPaymentPlan: true,
    paymentPlanDepositCents: 25_000,
    capacity: 20,
    isActive: true,
    sortOrder: 1,
  });

  t.after(async () => {
    db.close();
    await rm(dir, { recursive: true, force: true });
  });

  return db;
}

test("the registration email tells the student the code they can share", async () => {
  const messages = [];
  const emailer = {
    enabled: true,
    adminEmail: "admissions@example.com",
    async send(message) {
      messages.push(message);
      return true;
    },
  };

  sendEnrollmentEmails(emailer, {
    enrollment: {
      id: "enrollment-referral-email",
      studentFullName: "Jon Diaz",
      email: "jon@example.com",
      phone: "949-555-0100",
      programId: "cna",
      cohortId: "cna-weekday",
      paymentStatus: "checkout_pending",
      paymentAmountCents: 25_000,
      balanceDueCents: 165_000,
      referralCode: "FSHA-7K2MA",
      referredByCode: "FSHA-99XYZ",
      referralCreditCents: REFERRAL_CREDIT_CENTS,
    },
    program: { title: "Certified Nurse Assistant" },
    cohort: { title: "Weekday Cohort", meetingPattern: "Monday to Friday" },
    paymentRequired: true,
  });

  await new Promise((resolve) => setImmediate(resolve));

  const studentEmail = messages.find((message) => message.to === "jon@example.com");
  assert.ok(studentEmail, "the student must receive a registration email");
  // A code nobody is told about cannot be shared.
  assert.match(studentEmail.text, /Your referral code: FSHA-7K2MA/);
  assert.match(studentEmail.text, /\$100 check once both of you fully attend/);
  assert.match(studentEmail.text, /Referral credit applied: \$100\.00/);

  const adminEmail = messages.find((message) => message.to === "admissions@example.com");
  assert.ok(adminEmail, "admissions must be notified");
  assert.match(adminEmail.text, /Referred by code: FSHA-99XYZ/);
});

test("referral codes survive however a student retypes them", () => {
  const code = generateReferralCode();

  assert.match(code, /^FSHA-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/);
  // A code gets read aloud and written down, so casing, spacing and the dash
  // must all be forgiven on the way back in.
  assert.equal(normalizeReferralCode(code.toLowerCase()), code);
  assert.equal(normalizeReferralCode(code.replace("-", "")), code);
  assert.equal(normalizeReferralCode(`  ${code.replace("-", " ")}  `), code);

  // Ambiguous glyphs are never issued, so they can never be valid.
  assert.equal(normalizeReferralCode("FSHA-0O1IL"), null);
  assert.equal(normalizeReferralCode("NOTACODE"), null);
  assert.equal(normalizeReferralCode(""), null);
  assert.equal(normalizeReferralCode(null), null);
});

test("every enrollment is issued its own unique shareable code", async (t) => {
  const db = await createDb(t);
  const codes = new Set();

  for (let index = 0; index < 25; index += 1) {
    const code = db.issueReferralCode();
    assert.equal(normalizeReferralCode(code), code);
    codes.add(code);
    seedEnrollment(db, {
      id: randomUUID(),
      name: `Student ${index}`,
      email: `student${index}@example.com`,
      referralCode: code,
    });
  }

  assert.equal(codes.size, 25, "issued codes must not collide");
});

test("a referred student is found by code and cannot refer themselves", async (t) => {
  const db = await createDb(t);
  const code = db.issueReferralCode();
  seedEnrollment(db, {
    id: randomUUID(),
    name: "Maria Santos",
    email: "maria@example.com",
    referralCode: code,
  });

  const referrer = db.getEnrollmentByReferralCode(code.toLowerCase());
  assert.equal(referrer.email, "maria@example.com");

  assert.equal(
    evaluateReferralCode({ submittedCode: code, referrer, referredEmail: "jon@example.com" }).ok,
    true
  );

  const selfReferral = evaluateReferralCode({
    submittedCode: code,
    referrer,
    referredEmail: "MARIA@example.com",
  });
  assert.equal(selfReferral.ok, false);
  assert.match(selfReferral.reason, /own enrollment/);

  const unknown = evaluateReferralCode({
    submittedCode: "FSHA-22222",
    referrer: null,
    referredEmail: "jon@example.com",
  });
  assert.equal(unknown.ok, false);
  assert.match(unknown.reason, /not found/);
});

test("a code stops working once its own enrollment dies, but keeps working through a live payment plan", async (t) => {
  const db = await createDb(t);

  // A code is issued the moment the row is created, before anyone has paid anything.
  // If that student abandons checkout or Stripe never manages to create their session,
  // their code must stop working -- otherwise it stays redeemable forever, discounting
  // real students $100 against a referrer who never became a paying prospect.
  for (const deadStatus of ["checkout_expired", "payment_failed"]) {
    const code = db.issueReferralCode();
    seedEnrollment(db, {
      id: randomUUID(),
      name: "Abandoned Cart",
      email: `abandoned-${deadStatus}@example.com`,
      referralCode: code,
    });
    db.db.prepare(`UPDATE enrollments SET payment_status = ? WHERE referral_code = ?`).run(deadStatus, code);

    const referrer = db.getEnrollmentByReferralCode(code);
    const result = evaluateReferralCode({ submittedCode: code, referrer, referredEmail: "jon@example.com" });
    assert.equal(result.ok, false, `a ${deadStatus} referrer's code should be rejected`);
    assert.match(result.reason, /not found/);
  }

  // installment_failed means a payment plan is running with a hiccup -- that referrer
  // is a real enrolled student and their code must keep working.
  const activeCode = db.issueReferralCode();
  seedEnrollment(db, {
    id: randomUUID(),
    name: "Mid Plan",
    email: "midplan@example.com",
    referralCode: activeCode,
  });
  db.db.prepare(`UPDATE enrollments SET payment_status = 'installment_failed' WHERE referral_code = ?`).run(activeCode);

  const activeReferrer = db.getEnrollmentByReferralCode(activeCode);
  const activeResult = evaluateReferralCode({
    submittedCode: activeCode,
    referrer: activeReferrer,
    referredEmail: "jon@example.com",
  });
  assert.equal(activeResult.ok, true);
});

test("the $100 credit comes off the deposit and the total, leaving installments unchanged", () => {
  const creditedTuition = 200_000 - REFERRAL_CREDIT_CENTS;
  const creditedDeposit = 25_000 - REFERRAL_CREDIT_CENTS;

  assert.equal(creditedDeposit, 15_000, "the student pays $150 today instead of $250");

  // The whole point of moving the credit onto the deposit: installments stay at the
  // published amounts, and only the amount due today changes.
  const weekly = getPaymentPlanTerms("weekly", creditedTuition, creditedDeposit);
  assert.equal(weekly.installmentAmountCents, 14_583);
  assert.equal(weekly.finalInstallmentAmountCents, 14_587);
  assert.equal(weekly.regularInstallmentsTotal, 11);
  assert.equal(
    creditedDeposit + weekly.installmentAmountCents * 11 + weekly.finalInstallmentAmountCents,
    creditedTuition
  );

  const biweekly = getPaymentPlanTerms("biweekly", creditedTuition, creditedDeposit);
  assert.equal(biweekly.installmentAmountCents, 29_166);
  assert.equal(biweekly.finalInstallmentAmountCents, 29_170);
  assert.equal(biweekly.regularInstallmentsTotal, 5);
  assert.equal(
    creditedDeposit + biweekly.installmentAmountCents * 5 + biweekly.finalInstallmentAmountCents,
    creditedTuition
  );

  // A referred student pays $100 less overall, not $100 later.
  const uncredited = getPaymentPlanTerms("weekly", 200_000, 25_000);
  assert.equal(uncredited.installmentAmountCents, weekly.installmentAmountCents);
  assert.equal(200_000 - creditedTuition, REFERRAL_CREDIT_CENTS);
});

test("a reward stays pending until attendance is confirmed, then becomes payable and paid", async (t) => {
  const db = await createDb(t);
  const referrerCode = db.issueReferralCode();
  const referrerId = randomUUID();
  const referredId = randomUUID();

  seedEnrollment(db, {
    id: referrerId,
    name: "Maria Santos",
    email: "maria@example.com",
    referralCode: referrerCode,
  });
  const referred = seedEnrollment(db, {
    id: referredId,
    name: "Jon Diaz",
    email: "jon@example.com",
    referralCode: db.issueReferralCode(),
    referredByCode: referrerCode,
    credit: REFERRAL_CREDIT_CENTS,
  });

  assert.equal(referred.referredByCode, referrerCode);
  assert.equal(referred.referralCreditCents, REFERRAL_CREDIT_CENTS);
  assert.equal(referred.tuitionTotalCents, 190_000);

  const rewardId = randomUUID();
  const created = db.createReferralReward({
    id: rewardId,
    referrerEnrollmentId: referrerId,
    referredEnrollmentId: referredId,
    referralCode: referrerCode,
    amountCents: REFERRAL_REWARD_CENTS,
  });

  assert.equal(created.status, "pending");
  assert.equal(created.amountCents, 10_000);

  // Paying before attendance is confirmed must not be possible.
  assert.equal(db.markReferralRewardPaid(rewardId).status, "pending");

  // Both sides must fully attend their first week, so one confirmation is not enough.
  assert.equal(db.confirmReferralAttendance(rewardId).status, "pending");
  assert.equal(db.markReferralRewardPaid(rewardId).status, "pending");
  assert.equal(db.confirmReferrerAttendance(rewardId).status, "payable");
  // Rewards go out as checks, so the check number is the audit trail.
  const paid = db.markReferralRewardPaid(rewardId, { payoutReference: "check 10482" });
  assert.equal(paid.status, "paid");
  assert.equal(paid.payoutReference, "check 10482");
  assert.ok(paid.paidAt);

  // Paying twice must not overwrite the original check number or timestamp.
  const replayed = db.markReferralRewardPaid(rewardId, { payoutReference: "check 99999" });
  assert.equal(replayed.payoutReference, "check 10482");
  assert.equal(replayed.paidAt, paid.paidAt);

  // One reward per referred student, no matter how often the event is replayed.
  db.createReferralReward({
    id: randomUUID(),
    referrerEnrollmentId: referrerId,
    referredEnrollmentId: referredId,
    referralCode: referrerCode,
    amountCents: REFERRAL_REWARD_CENTS,
  });
  assert.equal(db.listReferralRewards().length, 1);
  assert.equal(db.listReferralRewards()[0].status, "paid");
});

test("a graduate referrer has no first week, so only the referred student gates the reward", async (t) => {
  const db = await createDb(t);
  const referrerId = randomUUID();
  const referredId = randomUUID();
  const code = db.issueReferralCode();

  seedEnrollment(db, { id: referrerId, name: "Grad Referrer", email: "grad@example.com", referralCode: code });
  seedEnrollment(db, {
    id: referredId,
    name: "New Student",
    email: "new@example.com",
    referralCode: db.issueReferralCode(),
    referredByCode: code,
    credit: REFERRAL_CREDIT_CENTS,
  });

  const rewardId = randomUUID();
  db.createReferralReward({
    id: rewardId,
    referrerEnrollmentId: referrerId,
    referredEnrollmentId: referredId,
    referralCode: code,
    amountCents: REFERRAL_REWARD_CENTS,
  });

  db.waiveReferrerAttendance(rewardId);
  assert.equal(db.getReferralRewardById(rewardId).status, "pending");
  assert.equal(db.confirmReferralAttendance(rewardId).status, "payable");
});

test("a referrer who does not finish their own first week loses every unpaid reward", async (t) => {
  const db = await createDb(t);
  const referrerId = randomUUID();
  const code = db.issueReferralCode();
  seedEnrollment(db, { id: referrerId, name: "Maria Santos", email: "maria@example.com", referralCode: code });

  const rewardIds = [];

  for (let index = 0; index < 3; index += 1) {
    const referredId = randomUUID();
    seedEnrollment(db, {
      id: referredId,
      name: `Referred ${index}`,
      email: `referred${index}@example.com`,
      referralCode: db.issueReferralCode(),
      referredByCode: code,
      credit: REFERRAL_CREDIT_CENTS,
    });

    const rewardId = randomUUID();
    db.createReferralReward({
      id: rewardId,
      referrerEnrollmentId: referrerId,
      referredEnrollmentId: referredId,
      referralCode: code,
      amountCents: REFERRAL_REWARD_CENTS,
    });
    rewardIds.push(rewardId);
  }

  // One is already paid out before the referrer withdraws.
  db.confirmReferralAttendance(rewardIds[0]);
  db.confirmReferrerAttendance(rewardIds[0]);
  db.markReferralRewardPaid(rewardIds[0], { payoutReference: "check 1001" });

  const result = db.forfeitAllRewardsForReferrer(referrerId, "Referrer withdrew during first week.");

  assert.equal(result.forfeited, 2, "both unpaid rewards are forfeited");
  // Money already sent is not clawed back here.
  assert.equal(db.getReferralRewardById(rewardIds[0]).status, "paid");
  assert.equal(db.getReferralRewardById(rewardIds[1]).status, "forfeited");
  assert.equal(db.getReferralRewardById(rewardIds[2]).status, "forfeited");
  assert.match(db.getReferralRewardById(rewardIds[1]).forfeitReason, /withdrew/);

  // A forfeited reward can never be paid.
  assert.equal(db.markReferralRewardPaid(rewardIds[1], { payoutReference: "check 9" }).status, "forfeited");
});

test("one referred student failing their first week forfeits only that reward", async (t) => {
  const db = await createDb(t);
  const referrerId = randomUUID();
  const referredId = randomUUID();
  const code = db.issueReferralCode();

  seedEnrollment(db, { id: referrerId, name: "Referrer", email: "ref@example.com", referralCode: code });
  seedEnrollment(db, {
    id: referredId,
    name: "No Show",
    email: "noshow@example.com",
    referralCode: db.issueReferralCode(),
    referredByCode: code,
    credit: REFERRAL_CREDIT_CENTS,
  });

  const rewardId = randomUUID();
  db.createReferralReward({
    id: rewardId,
    referrerEnrollmentId: referrerId,
    referredEnrollmentId: referredId,
    referralCode: code,
    amountCents: REFERRAL_REWARD_CENTS,
  });

  const forfeited = db.forfeitReferralReward(rewardId, "Referred student withdrew in week one.");
  assert.equal(forfeited.status, "forfeited");
  assert.ok(forfeited.forfeitedAt);
  // Confirming attendance afterwards must not resurrect it.
  assert.equal(db.confirmReferralAttendance(rewardId).status, "forfeited");
});
