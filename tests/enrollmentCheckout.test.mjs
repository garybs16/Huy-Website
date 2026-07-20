import assert from "node:assert/strict";
import test from "node:test";
import { createEnrollmentCheckoutSession } from "../server/routes/enrollments.js";

test("weekly checkout uses a Stripe-compatible subscription payload", async () => {
  let capturedPayload;
  const stripeClient = {
    checkout: {
      sessions: {
        async create(payload) {
          capturedPayload = payload;
          return { id: "cs_weekly_payload_test" };
        },
      },
    },
  };

  await createEnrollmentCheckoutSession({
    req: {
      get(name) {
        return name === "host" ? "firststepha.com" : undefined;
      },
      protocol: "https",
    },
    stripeClient,
    publicAppUrl: "https://firststepha.com",
    enrollment: {
      id: "enrollment_payload_test",
      email: "student@example.com",
    },
    program: {
      title: "Certified Nurse Assistant",
    },
    cohort: {
      id: "cohort_payload_test",
      programId: "cna",
      title: "Weekly cohort",
      meetingPattern: "Monday through Friday",
    },
    pricing: {
      paymentOption: "weekly",
      paymentAmountCents: 25_000,
      installmentAmountCents: 13_750,
      tuitionTotalCents: 190_000,
      balanceDueCents: 165_000,
      paymentInstallmentsTotal: 12,
      paymentInterval: "week",
      interval: "week",
      intervalCount: 1,
      trialDays: 7,
      checkoutLabel: "12-payment weekly tuition plan",
    },
    purpose: "payment_plan",
  });

  assert.equal(capturedPayload.mode, "subscription");
  assert.equal(capturedPayload.submit_type, undefined);
  assert.equal(capturedPayload.line_items[0].price_data.recurring, undefined);
  assert.deepEqual(capturedPayload.line_items[1].price_data.recurring, {
    interval: "week",
    interval_count: 1,
  });
  assert.equal(capturedPayload.metadata.installmentsTotal, "12");
  assert.equal(capturedPayload.subscription_data.metadata.paymentInterval, "week");
  assert.equal(capturedPayload.subscription_data.trial_period_days, 7);
});
