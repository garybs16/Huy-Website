import Stripe from "stripe";

export const WEEKLY_PAYMENT_PLAN_INSTALLMENTS = 8;
export const WEEKLY_PAYMENT_PLAN_INTERVAL = "week";

export function createStripeClient(secretKey) {
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

export function getStripeResourceId(value) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id ?? null;
}

export function getSubscriptionNextPaymentAt(subscription) {
  const periodEnds = (subscription?.items?.data ?? [])
    .map((item) => Number(item.current_period_end ?? 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (periodEnds.length === 0) {
    return null;
  }

  return new Date(Math.min(...periodEnds) * 1000).toISOString();
}

function scheduleIsConfigured(schedule, enrollmentId, installmentsTotal) {
  return (
    schedule?.end_behavior === "cancel" &&
    schedule?.metadata?.enrollmentId === enrollmentId &&
    Number(schedule?.metadata?.installmentsTotal ?? 0) === installmentsTotal &&
    schedule?.metadata?.interval === WEEKLY_PAYMENT_PLAN_INTERVAL
  );
}

function buildScheduleItems(phase, subscription) {
  const sourceItems = phase?.items?.length ? phase.items : subscription?.items?.data ?? [];

  return sourceItems.map((item) => {
    const priceId = getStripeResourceId(item.price ?? item.plan);

    if (!priceId) {
      throw new Error("Stripe subscription schedule did not include a reusable price.");
    }

    return {
      price: priceId,
      quantity: item.quantity ?? 1,
    };
  });
}

export async function ensureFiniteWeeklySchedule(
  stripeClient,
  {
    subscriptionId,
    enrollmentId,
    cohortId,
    programId,
    installmentsTotal = WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
  }
) {
  if (!stripeClient || !subscriptionId || !enrollmentId) {
    throw new Error("Stripe subscription schedule details are incomplete.");
  }

  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  let scheduleId = getStripeResourceId(subscription.schedule);
  let schedule = scheduleId
    ? await stripeClient.subscriptionSchedules.retrieve(scheduleId)
    : await stripeClient.subscriptionSchedules.create(
        { from_subscription: subscriptionId },
        { idempotencyKey: `first-step-schedule-${subscriptionId}` }
      );
  scheduleId = schedule.id;

  if (!scheduleIsConfigured(schedule, enrollmentId, installmentsTotal)) {
    const phase = schedule.phases?.[0];
    const startDate = phase?.start_date ?? subscription.created;
    const items = buildScheduleItems(phase, subscription);

    if (!startDate || items.length === 0) {
      throw new Error("Stripe subscription schedule could not determine its billing phase.");
    }

    schedule = await stripeClient.subscriptionSchedules.update(scheduleId, {
      end_behavior: "cancel",
      metadata: {
        enrollmentId,
        cohortId,
        programId,
        installmentsTotal: String(installmentsTotal),
        interval: WEEKLY_PAYMENT_PLAN_INTERVAL,
      },
      proration_behavior: "none",
      phases: [
        {
          start_date: startDate,
          duration: {
            interval: WEEKLY_PAYMENT_PLAN_INTERVAL,
            interval_count: installmentsTotal,
          },
          items,
          metadata: {
            enrollmentId,
            cohortId,
            programId,
            paymentOption: "deposit",
          },
          proration_behavior: "none",
        },
      ],
    });
  }

  return {
    subscription,
    schedule,
    scheduleId,
    customerId: getStripeResourceId(subscription.customer),
    latestInvoiceId: getStripeResourceId(subscription.latest_invoice),
    nextPaymentDueAt: getSubscriptionNextPaymentAt(subscription),
  };
}
