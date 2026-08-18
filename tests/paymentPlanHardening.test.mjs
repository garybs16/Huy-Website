import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import express from "express";
import { EnrollmentDatabase } from "../server/lib/enrollmentDb.js";
import { PaymentPlanValidationError, ensureFinitePaymentSchedule } from "../server/lib/stripe.js";
import { createEnrollmentCheckoutSession } from "../server/routes/enrollments.js";
import { createStripePaymentsRouter } from "../server/routes/payments.js";
import { adminCohortSchema } from "../server/validation/schemas.js";

const BIWEEKLY_METADATA = {
  enrollmentId: "enrollment_biweekly_test",
  cohortId: "biweekly-cohort",
  programId: "biweekly-program",
  paymentOption: "biweekly",
  checkoutPurpose: "payment_plan",
  installmentsTotal: "6",
  paymentInterval: "2_weeks",
  installmentAmountCents: "29166",
  finalInstallmentAmountCents: "29170",
};

function seedBiweeklyEnrollment(db) {
  db.createProgram({
    id: "biweekly-program",
    title: "Certified Nurse Assistant",
    summary: "Program used to verify biweekly Stripe webhooks.",
    duration: "5 weeks",
    schedule: "Weekday",
    isActive: true,
    sortOrder: 1,
  });
  db.createCohort({
    id: "biweekly-cohort",
    programId: "biweekly-program",
    title: "CNA Weekday",
    startDate: "2026-08-01",
    endDate: "2026-09-01",
    scheduleLabel: "Weekday",
    meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM",
    tuitionCents: 200_000,
    allowPaymentPlan: true,
    paymentPlanDepositCents: 25_000,
    capacity: 20,
    isActive: true,
    sortOrder: 1,
  });
  const enrollment = db.createEnrollment({
    id: "enrollment_biweekly_test",
    studentFullName: "Biweekly Student",
    email: "biweekly-student@example.com",
    phone: "949-555-0100",
    dateOfBirth: "2000-01-01",
    addressLine1: "100 Biweekly Way",
    city: "Irvine",
    state: "CA",
    postalCode: "92614",
    emergencyContactName: "Biweekly Contact",
    emergencyContactPhone: "949-555-0101",
    programId: "biweekly-program",
    cohortId: "biweekly-cohort",
    notes: "Webhook integration test.",
    status: "payment_setup",
    paymentStatus: "payment_setup",
    paymentOption: "biweekly",
    paymentAmountCents: 25_000,
    tuitionTotalCents: 200_000,
    balanceDueCents: 175_000,
    amountPaidCents: 0,
    paymentInstallmentsTotal: 6,
    paymentInstallmentsPaid: 0,
    paymentInterval: "2_weeks",
    seatHoldExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  return db.markCheckoutPending({
    enrollmentId: enrollment.id,
    sessionId: "cs_biweekly_test",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    purpose: "payment_plan",
  });
}

function biweeklyInvoiceEvent({ id, invoiceId, amountCents, billingReason = "subscription_cycle" }) {
  return {
    id,
    type: "invoice.paid",
    created: 1_800_000_000,
    data: {
      object: {
        id: invoiceId,
        currency: "usd",
        amount_paid: amountCents,
        amount_due: amountCents,
        billing_reason: billingReason,
        attempt_count: 1,
        hosted_invoice_url: `https://invoice.stripe.test/${invoiceId}`,
        status_transitions: { paid_at: 1_800_000_000 },
        lines: { data: [{ period: { end: 1_801_209_600 } }] },
        parent: {
          subscription_details: {
            subscription: "sub_biweekly_test",
            metadata: BIWEEKLY_METADATA,
          },
        },
      },
    },
  };
}

async function startBiweeklyHarness(t) {
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "first-step-biweekly-test-"));
  const enrollmentDb = new EnrollmentDatabase(path.join(tempDataDir, "enrollment.db"));
  seedBiweeklyEnrollment(enrollmentDb);

  const subscription = {
    id: "sub_biweekly_test",
    customer: "cus_biweekly_test",
    latest_invoice: "in_biweekly_1",
    created: 1_800_000_000,
    trial_end: 1_801_209_600,
    schedule: null,
    items: {
      data: [
        {
          price: { id: "price_biweekly_test", product: "prod_biweekly_test" },
          quantity: 1,
          current_period_end: 1_801_209_600,
        },
      ],
    },
  };
  let schedule = null;
  let currentEvent = null;
  const stripeClient = {
    webhooks: { constructEvent: () => currentEvent },
    subscriptions: { retrieve: async () => subscription },
    subscriptionSchedules: {
      create: async () => {
        schedule = {
          id: "sub_sched_biweekly_test",
          end_behavior: "release",
          metadata: {},
          phases: [
            {
              start_date: subscription.created,
              trial_end: subscription.trial_end,
              items: [{ price: "price_biweekly_test", quantity: 1 }],
            },
          ],
        };
        subscription.schedule = schedule.id;
        return schedule;
      },
      retrieve: async () => schedule,
      update: async (_id, payload) => {
        schedule = { ...schedule, ...payload };
        return schedule;
      },
    },
  };

  const notifications = [];
  const app = express();
  app.use(
    "/api/payments/stripe/webhook",
    createStripePaymentsRouter({
      stripeClient,
      webhookSecret: "whsec_test",
      enrollmentDb,
      notifier: { enabled: true, send: async (message) => notifications.push(message) },
      emailer: { enabled: true, adminEmail: "admissions@example.com", send: async () => {} },
    })
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/api/payments/stripe/webhook`;

  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    enrollmentDb.close();
    await rm(tempDataDir, { recursive: true, force: true });
  });

  async function deliver(event) {
    currentEvent = event;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": "test_signature" },
      body: JSON.stringify(event),
    });

    return { status: response.status, body: await response.json() };
  }

  return { deliver, enrollmentDb, notifications, getSchedule: () => schedule };
}

const biweeklyCheckoutEvent = {
  id: "evt_checkout_biweekly",
  type: "checkout.session.completed",
  created: 1_800_000_000,
  data: {
    object: {
      id: "cs_biweekly_test",
      mode: "subscription",
      payment_status: "paid",
      currency: "usd",
      amount_total: 25_000,
      subscription: "sub_biweekly_test",
      invoice: "in_biweekly_1",
      metadata: BIWEEKLY_METADATA,
    },
  },
};

test("biweekly Stripe webhooks collect six tuition installments and settle the exact tuition total", async (t) => {
  const { deliver, enrollmentDb, getSchedule } = await startBiweeklyHarness(t);

  assert.equal((await deliver(biweeklyCheckoutEvent)).status, 200);

  let enrollment = enrollmentDb.getEnrollmentById("enrollment_biweekly_test");
  assert.equal(enrollment.paymentStatus, "payment_plan_active");
  assert.equal(enrollment.amountPaidCents, 25_000);
  assert.equal(enrollment.paymentInstallmentsPaid, 0);
  assert.equal(enrollment.paymentInterval, "2_weeks");

  const schedule = getSchedule();
  assert.equal(schedule.end_behavior, "cancel");
  // Five two-week cycles after a two-week trial, then one final cycle for the remainder.
  assert.deepEqual(schedule.phases[0].duration, { interval: "week", interval_count: 12 });
  assert.equal(schedule.phases[0].trial_end, 1_801_209_600);
  assert.deepEqual(schedule.phases[1].duration, { interval: "week", interval_count: 2 });
  assert.equal(schedule.phases[1].items[0].price_data.unit_amount, 29_170);
  assert.deepEqual(schedule.phases[1].items[0].price_data.recurring, {
    interval: "week",
    interval_count: 2,
  });

  for (let installment = 1; installment <= 6; installment += 1) {
    const amountCents = installment === 6 ? 29_170 : 29_166;
    const result = await deliver(
      biweeklyInvoiceEvent({
        id: `evt_invoice_biweekly_${installment}`,
        invoiceId: `in_biweekly_${installment + 1}`,
        amountCents,
      })
    );
    assert.equal(result.status, 200);
  }

  enrollment = enrollmentDb.getEnrollmentById("enrollment_biweekly_test");
  assert.equal(enrollment.paymentStatus, "paid");
  assert.equal(enrollment.paymentInstallmentsPaid, 6);
  assert.equal(enrollment.amountPaidCents, 200_000);
  assert.equal(enrollment.balanceDueCents, 0);
  assert.equal(enrollment.nextPaymentDueAt, null);
  assert.equal(enrollmentDb.listEnrollmentPayments(enrollment.id).length, 6);
});

test("a terminal webhook mismatch is acknowledged once and escalated instead of retried forever", async (t) => {
  const { deliver, enrollmentDb, notifications } = await startBiweeklyHarness(t);

  await deliver(biweeklyCheckoutEvent);

  const result = await deliver(
    biweeklyInvoiceEvent({
      id: "evt_invoice_biweekly_wrong_amount",
      invoiceId: "in_biweekly_wrong",
      amountCents: 12_345,
    })
  );

  // A 2xx retires the event: redelivering it would fail identically every time.
  assert.equal(result.status, 200);
  assert.equal(result.body.ignored, true);

  const alert = notifications.find((message) => message.type === "payment.validation_failed");
  assert.ok(alert, "admissions must be paged when an event is dropped");
  assert.equal(alert.eventType, "invoice.paid");
  assert.equal(alert.invoiceId, "in_biweekly_wrong");
  assert.match(alert.reason, /did not match the selected tuition installment/);

  const enrollment = enrollmentDb.getEnrollmentById("enrollment_biweekly_test");
  assert.equal(enrollment.amountPaidCents, 25_000);
  assert.equal(enrollment.paymentInstallmentsPaid, 0);
});

test("a checkout session that is not yet bound to an enrollment stays retryable", async (t) => {
  const { deliver, notifications } = await startBiweeklyHarness(t);

  const result = await deliver({
    ...biweeklyCheckoutEvent,
    id: "evt_checkout_unbound",
    data: {
      object: { ...biweeklyCheckoutEvent.data.object, id: "cs_not_recorded_yet" },
    },
  });

  // Stripe can beat the database write, so this must fail and be redelivered.
  assert.equal(result.status, 500);
  assert.equal(notifications.filter((message) => message.type === "payment.validation_failed").length, 0);
});

test("a payment plan is never rebuilt without the trial that defers installment one", async () => {
  const subscription = {
    id: "sub_no_trial",
    customer: "cus_no_trial",
    created: 1_800_000_000,
    schedule: null,
    items: {
      data: [{ price: { id: "price_no_trial", product: "prod_no_trial" }, quantity: 1, current_period_end: 1_800_604_800 }],
    },
  };
  const stripeClient = {
    subscriptions: { retrieve: async () => subscription },
    subscriptionSchedules: {
      create: async () => ({
        id: "sched_no_trial",
        end_behavior: "release",
        metadata: {},
        phases: [{ start_date: subscription.created, items: [{ price: "price_no_trial", quantity: 1 }] }],
      }),
      retrieve: async () => {
        throw new Error("No existing schedule should be retrieved in this test.");
      },
      update: async () => {
        throw new Error("The schedule must not be rewritten without a trial.");
      },
    },
  };

  await assert.rejects(
    () =>
      ensureFinitePaymentSchedule(stripeClient, {
        subscriptionId: "sub_no_trial",
        enrollmentId: "enrollment_no_trial",
        cohortId: "cna-weekday",
        programId: "cna",
        paymentOption: "weekly",
        tuitionTotalCents: 200_000,
        registrationFeeCents: 25_000,
      }),
    (error) => error instanceof PaymentPlanValidationError && /missing the trial/.test(error.message)
  );
});

test("checkout sessions clear the Stripe minimum lifetime with room for request latency", async () => {
  let capturedPayload;
  const createdAtSeconds = Math.floor(Date.now() / 1000);

  await createEnrollmentCheckoutSession({
    req: { get: (name) => (name === "host" ? "firststepha.com" : undefined), protocol: "https" },
    stripeClient: {
      checkout: {
        sessions: {
          async create(payload) {
            capturedPayload = payload;
            return { id: "cs_expiry_test" };
          },
        },
      },
    },
    publicAppUrl: "https://firststepha.com",
    enrollment: { id: "enrollment_expiry_test", email: "student@example.com" },
    program: { title: "Certified Nurse Assistant" },
    cohort: { id: "cohort_expiry", programId: "cna", title: "Weekly cohort", meetingPattern: "Monday through Friday" },
    pricing: {
      paymentOption: "weekly",
      paymentAmountCents: 25_000,
      installmentAmountCents: 14_583,
      finalInstallmentAmountCents: 14_587,
      regularInstallmentsTotal: 11,
      tuitionTotalCents: 200_000,
      balanceDueCents: 175_000,
      paymentInstallmentsTotal: 12,
      paymentInterval: "week",
      interval: "week",
      intervalCount: 1,
      trialDays: 7,
      checkoutLabel: "12-payment weekly tuition plan",
    },
    purpose: "payment_plan",
  });

  // Stripe rejects anything under 30 minutes measured from when it receives the request,
  // so the value has to clear that floor even after the round trip and any clock skew.
  assert.ok(
    capturedPayload.expires_at - createdAtSeconds >= 31 * 60,
    `expires_at must leave margin above the 30 minute floor, got ${capturedPayload.expires_at - createdAtSeconds}s`
  );
});

test("cohorts cannot offer installments below the amount Stripe will charge", () => {
  const base = {
    id: "tiny-installment-cohort",
    programId: "cna",
    title: "Tiny Installment Cohort",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    scheduleLabel: "Weekday",
    meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM",
    tuitionCents: 30_000,
    allowPaymentPlan: true,
    paymentPlanDepositCents: 29_900,
    capacity: 20,
  };

  assert.throws(() => adminCohortSchema.parse(base), /at least 50 cents/);
  assert.doesNotThrow(() => adminCohortSchema.parse({ ...base, paymentPlanDepositCents: 25_000 }));
});

test("a Stripe subscription is never attached without its plan cadence", async (t) => {
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "first-step-attach-test-"));
  const enrollmentDb = new EnrollmentDatabase(path.join(tempDataDir, "enrollment.db"));
  const enrollment = seedBiweeklyEnrollment(enrollmentDb);

  t.after(async () => {
    enrollmentDb.close();
    await rm(tempDataDir, { recursive: true, force: true });
  });

  assert.throws(
    () =>
      enrollmentDb.attachStripeSubscription({
        enrollmentId: enrollment.id,
        customerId: "cus_x",
        subscriptionId: "sub_x",
        scheduleId: "sched_x",
        nextPaymentDueAt: null,
      }),
    /must include the plan installment count and interval/
  );
});

test("installments still validate against metadata Stripe copies from the schedule phase", async (t) => {
  const { deliver, enrollmentDb, getSchedule, notifications } = await startBiweeklyHarness(t);

  await deliver(biweeklyCheckoutEvent);

  // Entering a phase overwrites the subscription metadata with that phase's metadata, and
  // every later invoice reports it. If the phase carried only a subset, the amount checks
  // in validateEnrollmentMetadata would quietly stop running.
  const phaseMetadata = getSchedule().phases[0].metadata;
  assert.equal(phaseMetadata.checkoutPurpose, "payment_plan");
  assert.equal(phaseMetadata.installmentsTotal, "6");
  assert.equal(phaseMetadata.paymentInterval, "2_weeks");
  assert.equal(phaseMetadata.installmentAmountCents, "29166");
  assert.equal(phaseMetadata.finalInstallmentAmountCents, "29170");

  const event = biweeklyInvoiceEvent({
    id: "evt_invoice_phase_metadata",
    invoiceId: "in_biweekly_phase",
    amountCents: 29_166,
  });
  event.data.object.parent.subscription_details.metadata = phaseMetadata;

  assert.equal((await deliver(event)).status, 200);
  assert.equal(notifications.filter((message) => message.type === "payment.validation_failed").length, 0);

  const enrollment = enrollmentDb.getEnrollmentById("enrollment_biweekly_test");
  assert.equal(enrollment.paymentInstallmentsPaid, 1);
  assert.equal(enrollment.amountPaidCents, 54_166);
});
