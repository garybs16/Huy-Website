import assert from "node:assert/strict";
import test from "node:test";
import { createEnrollmentCheckoutSession } from "../server/routes/enrollments.js";

test("weekly checkout uses a Stripe-compatible subscription payload", async () => {
  let capturedPayload;
  let capturedOptions;
  const stripeClient = {
    checkout: {
      sessions: {
        async create(payload, options) {
          capturedPayload = payload;
          capturedOptions = options;
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
      paymentAmountCents: 1_000,
      installmentAmountCents: 16_583,
      finalInstallmentAmountCents: 16_587,
      regularInstallmentsTotal: 11,
      tuitionTotalCents: 200_000,
      balanceDueCents: 199_000,
      paymentInstallmentsTotal: 12,
      paymentInterval: "week",
      interval: "week",
      intervalCount: 1,
      trialDays: 7,
      checkoutLabel: "12-payment weekly program balance plan",
    },
    purpose: "payment_plan",
  });

  assert.equal(capturedPayload.mode, "subscription");
  assert.equal(capturedPayload.client_reference_id, "enrollment_payload_test");
  assert.equal(capturedPayload.submit_type, undefined);
  assert.equal(capturedPayload.line_items[0].price_data.recurring, undefined);
  assert.equal(capturedPayload.line_items[0].price_data.unit_amount, 1_000);
  assert.match(capturedPayload.line_items[0].price_data.product_data.name, /temporary test down payment/i);
  assert.deepEqual(capturedPayload.line_items[1].price_data.recurring, {
    interval: "week",
    interval_count: 1,
  });
  assert.equal(capturedPayload.metadata.installmentsTotal, "12");
  assert.equal(capturedPayload.metadata.installmentAmountCents, "16583");
  assert.equal(capturedPayload.metadata.finalInstallmentAmountCents, "16587");
  assert.equal(capturedPayload.subscription_data.metadata.paymentInterval, "week");
  assert.deepEqual(capturedPayload.subscription_data.billing_mode, { type: "flexible" });
  assert.equal(capturedPayload.subscription_data.trial_period_days, 7);
  assert.deepEqual(capturedPayload.subscription_data.trial_settings, {
    end_behavior: { missing_payment_method: "cancel" },
  });
  assert.match(
    capturedOptions.idempotencyKey,
    /^first-step-checkout-enrollment_payload_test-[0-9a-f-]{36}$/
  );
});
