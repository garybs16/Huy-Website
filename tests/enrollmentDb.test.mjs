import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { EnrollmentDatabase } from "../server/lib/enrollmentDb.js";

function enrollmentInput(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    studentFullName: "Test Student",
    email: `student-${crypto.randomUUID()}@example.com`,
    phone: "949-555-0100",
    dateOfBirth: "2001-02-03",
    addressLine1: "100 Test Avenue",
    city: "Irvine",
    state: "CA",
    postalCode: "92614",
    emergencyContactName: "Test Contact",
    emergencyContactPhone: "949-555-0101",
    programId: "test-program",
    cohortId: "test-cohort",
    notes: "Automated enrollment database test.",
    status: "payment_setup",
    paymentStatus: "payment_setup",
    paymentOption: "weekly",
    paymentAmountCents: 25_000,
    tuitionTotalCents: 85_000,
    balanceDueCents: 60_000,
    paymentInstallmentsTotal: 12,
    paymentInterval: "week",
    policyAcknowledgedAt: new Date().toISOString(),
    automaticPaymentAuthorizedAt: new Date().toISOString(),
    seatHoldExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

test("EnrollmentDatabase stores enrollment records and protects cohort capacity", async (t) => {
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "first-step-db-test-"));
  const db = new EnrollmentDatabase(path.join(tempDataDir, "enrollment.db"));

  t.after(async () => {
    db.close();
    await rm(tempDataDir, { recursive: true, force: true });
  });

  db.createProgram({
    id: "test-program",
    title: "Test Program",
    summary: "Program for database tests.",
    duration: "4 weeks",
    schedule: "Weekday",
    isActive: true,
    sortOrder: 1,
  });

  db.createCohort({
    id: "test-cohort",
    programId: "test-program",
    title: "Test Cohort",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    scheduleLabel: "Weekday",
    meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM",
    tuitionCents: 100_000,
    allowPaymentPlan: true,
    paymentPlanDepositCents: 25_000,
    capacity: 1,
    isActive: true,
    sortOrder: 1,
  });

  const enrollment = db.createEnrollment(enrollmentInput());

  assert.equal(enrollment.paymentOption, "weekly");
  assert.equal(enrollment.paymentAmountCents, 25_000);
  assert.equal(enrollment.balanceDueCents, 60_000);

  assert.throws(
    () => db.createEnrollment(enrollmentInput({ id: crypto.randomUUID() })),
    /This cohort is full/
  );

  db.markPaymentSetupFailed(enrollment.id, "Release hold for test.");
  const replacement = db.createEnrollment(
    enrollmentInput({
      id: crypto.randomUUID(),
      paymentInstallmentsTotal: 12,
    })
  );

  assert.equal(replacement.paymentStatus, "payment_setup");

  db.attachStripeSubscription({
    enrollmentId: replacement.id,
    customerId: "cus_weekly_test",
    subscriptionId: "sub_weekly_test",
    scheduleId: "sub_sched_weekly_test",
    nextPaymentDueAt: "2026-08-08T12:00:00.000Z",
    installmentsTotal: 12,
    interval: "week",
  });

  db.markPaymentPlanRegistrationPaid({
    enrollmentId: replacement.id,
    subscriptionId: "sub_weekly_test",
    paidAt: "2026-08-01T12:00:00.000Z",
    nextPaymentDueAt: "2026-08-08T12:00:00.000Z",
  });

  const firstPayment = db.recordSubscriptionPayment({
    enrollmentId: replacement.id,
    invoiceId: "in_weekly_1",
    subscriptionId: "sub_weekly_test",
    amountCents: 5_000,
    paidAt: "2026-08-01T12:00:00.000Z",
    nextPaymentDueAt: "2026-08-08T12:00:00.000Z",
  });
  assert.equal(firstPayment.applied, true);
  assert.equal(firstPayment.enrollment.paymentStatus, "payment_plan_active");
  assert.equal(firstPayment.enrollment.amountPaidCents, 30_000);
  assert.equal(firstPayment.enrollment.balanceDueCents, 55_000);
  assert.equal(firstPayment.enrollment.paymentInstallmentsPaid, 1);

  const replayedPayment = db.recordSubscriptionPayment({
    enrollmentId: replacement.id,
    invoiceId: "in_weekly_1",
    subscriptionId: "sub_weekly_test",
    amountCents: 5_000,
  });
  assert.equal(replayedPayment.applied, false);
  assert.equal(replayedPayment.enrollment.amountPaidCents, 30_000);

  const failedPayment = db.recordSubscriptionPaymentFailed({
    enrollmentId: replacement.id,
    invoiceId: "in_weekly_2",
    subscriptionId: "sub_weekly_test",
    amountCents: 5_000,
    attemptCount: 1,
    failedAt: "2026-08-08T12:00:00.000Z",
  });
  assert.equal(failedPayment.enrollment.paymentStatus, "installment_failed");
  assert.equal(failedPayment.enrollment.amountPaidCents, 30_000);

  for (let installment = 2; installment <= 12; installment += 1) {
    db.recordSubscriptionPayment({
      enrollmentId: replacement.id,
      invoiceId: `in_weekly_${installment}`,
      subscriptionId: "sub_weekly_test",
      amountCents: 5_000,
      paidAt: new Date(Date.UTC(2026, 7, 1 + installment * 7, 12)).toISOString(),
      nextPaymentDueAt: "2026-08-29T12:00:00.000Z",
    });
  }

  const completedPlan = db.getEnrollmentById(replacement.id);
  assert.equal(completedPlan.paymentStatus, "paid");
  assert.equal(completedPlan.amountPaidCents, 85_000);
  assert.equal(completedPlan.balanceDueCents, 0);
  assert.equal(completedPlan.paymentInstallmentsPaid, 12);
  assert.equal(db.listEnrollmentPayments(replacement.id).length, 12);

  const exportData = db.exportOperationalData();
  assert.equal(exportData.enrollments.length, 2);
  assert.ok(exportData.programs.some((program) => program.id === "test-program"));
});
