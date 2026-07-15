import assert from "node:assert/strict";
import test from "node:test";
import {
  WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
  ensureFiniteWeeklySchedule,
  getSubscriptionNextPaymentAt,
} from "../server/lib/stripe.js";

test("weekly Stripe schedules charge eight installments and then cancel", async () => {
  const calls = { create: [], update: [] };
  const subscription = {
    id: "sub_weekly_test",
    customer: "cus_weekly_test",
    latest_invoice: "in_weekly_1",
    created: 1_800_000_000,
    schedule: null,
    items: {
      data: [
        {
          price: { id: "price_weekly_test" },
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
  assert.deepEqual(calls.update[0].payload.phases[0].duration, {
    interval: "week",
    interval_count: WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
  });
  assert.deepEqual(calls.update[0].payload.phases[0].items, [
    { price: "price_weekly_test", quantity: 1 },
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
