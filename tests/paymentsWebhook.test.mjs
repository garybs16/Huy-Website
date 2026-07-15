import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import express from "express";
import { EnrollmentDatabase } from "../server/lib/enrollmentDb.js";
import { createStripePaymentsRouter } from "../server/routes/payments.js";

function createEnrollment(db) {
  db.createProgram({
    id: "webhook-program",
    title: "Certified Nurse Assistant",
    summary: "Program used to verify weekly Stripe webhooks.",
    duration: "5 weeks",
    schedule: "Weekday",
    isActive: true,
    sortOrder: 1,
  });
  db.createCohort({
    id: "webhook-cohort",
    programId: "webhook-program",
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
    id: "enrollment_webhook_test",
    studentFullName: "Weekly Student",
    email: "weekly-student@example.com",
    phone: "949-555-0100",
    dateOfBirth: "2000-01-01",
    addressLine1: "100 Weekly Way",
    city: "Irvine",
    state: "CA",
    postalCode: "92614",
    emergencyContactName: "Weekly Contact",
    emergencyContactPhone: "949-555-0101",
    programId: "webhook-program",
    cohortId: "webhook-cohort",
    notes: "Webhook integration test.",
    status: "payment_setup",
    paymentStatus: "payment_setup",
    paymentOption: "deposit",
    paymentAmountCents: 25_000,
    tuitionTotalCents: 200_000,
    balanceDueCents: 175_000,
    amountPaidCents: 0,
    paymentInstallmentsTotal: 8,
    paymentInstallmentsPaid: 0,
    paymentInterval: "week",
    seatHoldExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
  return db.markCheckoutPending({
    enrollmentId: enrollment.id,
    sessionId: "cs_weekly_test",
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    purpose: "payment_plan",
  });
}

function invoiceEvent({ id, type, invoiceId, amountPaid = 25_000, amountDue = 25_000 }) {
  return {
    id,
    type,
    created: 1_800_000_000,
    data: {
      object: {
        id: invoiceId,
        currency: "usd",
        amount_paid: amountPaid,
        amount_due: amountDue,
        attempt_count: 1,
        hosted_invoice_url: `https://invoice.stripe.test/${invoiceId}`,
        status_transitions: { paid_at: type === "invoice.paid" ? 1_800_000_000 : null },
        lines: { data: [{ period: { end: 1_800_604_800 } }] },
        parent: {
          subscription_details: {
            subscription: "sub_weekly_test",
            metadata: {
              enrollmentId: "enrollment_webhook_test",
              cohortId: "webhook-cohort",
              programId: "webhook-program",
              paymentOption: "deposit",
            },
          },
        },
      },
    },
  };
}

test("Stripe webhooks activate, advance, and flag a weekly tuition plan", async (t) => {
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "first-step-webhook-test-"));
  const enrollmentDb = new EnrollmentDatabase(path.join(tempDataDir, "enrollment.db"));
  createEnrollment(enrollmentDb);

  const subscription = {
    id: "sub_weekly_test",
    customer: "cus_weekly_test",
    latest_invoice: "in_weekly_1",
    created: 1_800_000_000,
    schedule: null,
    items: {
      data: [{ price: "price_weekly_test", quantity: 1, current_period_end: 1_800_604_800 }],
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
          id: "sub_sched_weekly_test",
          end_behavior: "release",
          metadata: {},
          phases: [{ start_date: subscription.created, items: [{ price: "price_weekly_test", quantity: 1 }] }],
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
  const emails = [];
  const notifier = { enabled: true, send: async (message) => notifications.push(message) };
  const emailer = {
    enabled: true,
    adminEmail: "admissions@example.com",
    send: async (message) => emails.push(message),
  };
  const app = express();
  app.use(
    "/api/payments/stripe/webhook",
    createStripePaymentsRouter({
      stripeClient,
      webhookSecret: "whsec_test",
      enrollmentDb,
      notifier,
      emailer,
    })
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const endpoint = `http://127.0.0.1:${address.port}/api/payments/stripe/webhook`;

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
    assert.equal(response.status, 200, await response.text());
  }

  const checkoutEvent = {
    id: "evt_checkout_weekly",
    type: "checkout.session.completed",
    created: 1_800_000_000,
    data: {
      object: {
        id: "cs_weekly_test",
        mode: "subscription",
        payment_status: "paid",
        currency: "usd",
        amount_total: 25_000,
        subscription: subscription.id,
        invoice: "in_weekly_1",
        metadata: {
          enrollmentId: "enrollment_webhook_test",
          cohortId: "webhook-cohort",
          programId: "webhook-program",
          checkoutPurpose: "payment_plan",
        },
      },
    },
  };
  await deliver(checkoutEvent);
  await deliver(checkoutEvent);

  let enrollment = enrollmentDb.getEnrollmentById("enrollment_webhook_test");
  assert.equal(enrollment.paymentStatus, "payment_plan_active");
  assert.equal(enrollment.paymentInstallmentsPaid, 1);
  assert.equal(enrollment.amountPaidCents, 25_000);
  assert.equal(enrollment.stripeSubscriptionScheduleId, "sub_sched_weekly_test");
  assert.equal(schedule.end_behavior, "cancel");
  assert.deepEqual(schedule.phases[0].duration, { interval: "week", interval_count: 8 });

  await deliver(
    invoiceEvent({
      id: "evt_invoice_weekly_2",
      type: "invoice.paid",
      invoiceId: "in_weekly_2",
    })
  );
  enrollment = enrollmentDb.getEnrollmentById("enrollment_webhook_test");
  assert.equal(enrollment.paymentInstallmentsPaid, 2);
  assert.equal(enrollment.amountPaidCents, 50_000);

  await deliver(
    invoiceEvent({
      id: "evt_invoice_weekly_3_failed",
      type: "invoice.payment_failed",
      invoiceId: "in_weekly_3",
      amountPaid: 0,
    })
  );
  enrollment = enrollmentDb.getEnrollmentById("enrollment_webhook_test");
  assert.equal(enrollment.paymentStatus, "installment_failed");
  assert.equal(enrollment.amountPaidCents, 50_000);
  assert.equal(enrollmentDb.listEnrollmentPayments(enrollment.id).length, 3);
  assert.ok(notifications.some((message) => message.type === "payment.failed"));
  assert.ok(emails.some((message) => message.subject.includes("Payment received")));
  assert.ok(emails.some((message) => message.subject.includes("Weekly payment needs attention")));
});
