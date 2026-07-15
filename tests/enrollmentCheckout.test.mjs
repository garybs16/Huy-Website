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
      paymentOption: "deposit",
      paymentAmountCents: 25_000,
      tuitionTotalCents: 200_000,
      balanceDueCents: 175_000,
      paymentInstallmentsTotal: 8,
      paymentInterval: "week",
      checkoutLabel: "Weekly tuition payment plan",
    },
    purpose: "payment_plan",
  });

  assert.equal(capturedPayload.mode, "subscription");
  assert.equal(capturedPayload.submit_type, undefined);
  assert.deepEqual(capturedPayload.line_items[0].price_data.recurring, {
    interval: "week",
    interval_count: 1,
  });
  assert.equal(capturedPayload.metadata.installmentsTotal, "8");
  assert.equal(capturedPayload.subscription_data.metadata.paymentInterval, "week");
});
