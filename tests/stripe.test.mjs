import assert from "node:assert/strict";
import test from "node:test";
import {
  WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
  ensureFiniteWeeklySchedule,
  getPaymentPlanTerms,
  getSubscriptionNextPaymentAt,
} from "../server/lib/stripe.js";

test("published weekly and biweekly terms allocate the exact tuition total to the final installment", () => {
  assert.deepEqual(getPaymentPlanTerms("weekly", 200_000, 25_000), {
    paymentOption: "weekly",
    installmentsTotal: 12,
    interval: "week",
    intervalCount: 1,
    trialDays: 7,
    registrationFeeCents: 25_000,
    tuitionBalanceCents: 175_000,
    installmentAmountCents: 14_583,
    finalInstallmentAmountCents: 14_587,
    installmentRemainderCents: 4,
    hasFinalInstallmentAdjustment: true,
    regularInstallmentsTotal: 11,
    paymentInterval: "week",
    regularPhaseDurationWeeks: 12,
    finalPhaseDurationWeeks: 1,
    scheduleDurationWeeks: 13,
  });
  assert.deepEqual(getPaymentPlanTerms("biweekly", 200_000, 25_000), {
    paymentOption: "biweekly",
    installmentsTotal: 6,
    interval: "week",
    intervalCount: 2,
    trialDays: 14,
    registrationFeeCents: 25_000,
    tuitionBalanceCents: 175_000,
    installmentAmountCents: 29_166,
    finalInstallmentAmountCents: 29_170,
    installmentRemainderCents: 4,
    hasFinalInstallmentAdjustment: true,
    regularInstallmentsTotal: 5,
    paymentInterval: "2_weeks",
    regularPhaseDurationWeeks: 12,
    finalPhaseDurationWeeks: 2,
    scheduleDurationWeeks: 14,
  });
});

test("weekly Stripe schedules charge twelve tuition installments after registration and then cancel", async () => {
  const calls = { create: [], update: [] };
  const subscription = {
    id: "sub_weekly_test",
    customer: "cus_weekly_test",
    latest_invoice: "in_weekly_1",
    created: 1_800_000_000,
    trial_end: 1_800_604_800,
    schedule: null,
    items: {
      data: [
        {
          price: { id: "price_weekly_test", product: "prod_weekly_test" },
          quantity: 1,
          current_period_end: 1_800_604_800,
        },
      ],
    },
  };
  const stripeClient = {
    subscriptions: {
      retrieve: async (subscriptionId) => {
        assert.equal(subscriptionId, subscription.id);
        return subscription;
      },
    },
    subscriptionSchedules: {
      create: async (payload, options) => {
        calls.create.push({ payload, options });
        return {
          id: "sub_sched_weekly_test",
          end_behavior: "release",
          metadata: {},
          phases: [
            {
              start_date: subscription.created,
              trial_end: 1_800_604_800,
              items: [{ price: "price_weekly_test", quantity: 1 }],
            },
          ],
        };
      },
      retrieve: async () => {
        throw new Error("No existing schedule should be retrieved in this test.");
      },
      update: async (scheduleId, payload) => {
        calls.update.push({ scheduleId, payload });
        return { id: scheduleId, ...payload };
      },
    },
  };

  const result = await ensureFiniteWeeklySchedule(stripeClient, {
    subscriptionId: subscription.id,
    enrollmentId: "enrollment_weekly_test",
    cohortId: "cna-weekday",
    programId: "cna",
  });

  assert.equal(calls.create.length, 1);
  assert.equal(calls.create[0].payload.from_subscription, subscription.id);
  assert.equal(calls.create[0].options.idempotencyKey, `first-step-schedule-${subscription.id}`);
  assert.equal(calls.update.length, 1);
  assert.equal(calls.update[0].scheduleId, "sub_sched_weekly_test");
  assert.equal(calls.update[0].payload.end_behavior, "cancel");
  // Losing this would bill installment one on the day of registration.
  assert.equal(calls.update[0].payload.phases[0].trial_end, 1_800_604_800);
  assert.equal(calls.update[0].payload.phases[0].metadata.checkoutPurpose, "payment_plan");
  assert.equal(calls.update[0].payload.phases[0].metadata.installmentAmountCents, "14583");
  assert.equal(calls.update[0].payload.phases[1].metadata.finalInstallmentAmountCents, "14587");
  assert.deepEqual(calls.update[0].payload.phases[0].duration, {
    interval: "week",
    interval_count: 12,
  });
  assert.deepEqual(calls.update[0].payload.phases[0].items, [
    { price: "price_weekly_test", quantity: 1 },
  ]);
  assert.deepEqual(calls.update[0].payload.phases[1].duration, {
    interval: "week",
    interval_count: 1,
  });
  assert.deepEqual(calls.update[0].payload.phases[1].items, [
    {
      price_data: {
        currency: "usd",
        product: "prod_weekly_test",
        unit_amount: 14_587,
        recurring: { interval: "week", interval_count: 1 },
      },
      quantity: 1,
    },
  ]);
  assert.equal(result.scheduleId, "sub_sched_weekly_test");
  assert.equal(result.customerId, "cus_weekly_test");
  assert.equal(result.latestInvoiceId, "in_weekly_1");
  assert.equal(result.nextPaymentDueAt, "2027-01-22T08:00:00.000Z");
});

test("subscription next-payment date uses the earliest active item period", () => {
  assert.equal(
    getSubscriptionNextPaymentAt({
      items: {
        data: [
          { current_period_end: 1_900_000_100 },
          { current_period_end: 1_900_000_000 },
        ],
      },
    }),
    new Date(1_900_000_000 * 1000).toISOString()
  );
  assert.equal(getSubscriptionNextPaymentAt({ items: { data: [] } }), null);
});
