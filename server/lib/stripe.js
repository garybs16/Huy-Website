import Stripe from "stripe";

export const REGISTRATION_FEE_CENTS = 25_000;
export const PAYMENT_PLAN_OPTIONS = {
  weekly: {
    installmentsTotal: 12,
    interval: "week",
    intervalCount: 1,
    trialDays: 7,
  },
  biweekly: {
    installmentsTotal: 6,
    interval: "week",
    intervalCount: 2,
    trialDays: 14,
  },
};

export const WEEKLY_PAYMENT_PLAN_INSTALLMENTS = PAYMENT_PLAN_OPTIONS.weekly.installmentsTotal;
export const WEEKLY_PAYMENT_PLAN_INTERVAL = PAYMENT_PLAN_OPTIONS.weekly.interval;

export function isPaymentPlanOption(paymentOption) {
  return Boolean(PAYMENT_PLAN_OPTIONS[paymentOption]);
}

export function getPaymentPlanTerms(paymentOption, tuitionTotalCents, registrationFeeCents = REGISTRATION_FEE_CENTS) {
  const option = PAYMENT_PLAN_OPTIONS[paymentOption];

  if (!option) {
    return null;
  }

  const tuitionBalanceCents = Number(tuitionTotalCents) - Number(registrationFeeCents);
  const installmentAmountCents = tuitionBalanceCents / option.installmentsTotal;

  if (!Number.isInteger(installmentAmountCents) || installmentAmountCents <= 0) {
    throw new Error(`The ${paymentOption} plan cannot divide the tuition balance into equal payments.`);
  }

  return {
    ...option,
    paymentOption,
    registrationFeeCents: Number(registrationFeeCents),
    tuitionBalanceCents,
    installmentAmountCents,
    paymentInterval: option.intervalCount === 1 ? "week" : "2_weeks",
    scheduleDurationWeeks: option.trialDays / 7 + option.installmentsTotal * option.intervalCount,
  };
}

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

function scheduleIsConfigured(schedule, enrollmentId, terms) {
  return (
    schedule?.end_behavior === "cancel" &&
    schedule?.metadata?.enrollmentId === enrollmentId &&
    Number(schedule?.metadata?.installmentsTotal ?? 0) === terms.installmentsTotal &&
    schedule?.metadata?.paymentOption === terms.paymentOption
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

export async function ensureFinitePaymentSchedule(
  stripeClient,
  {
    subscriptionId,
    enrollmentId,
    cohortId,
    programId,
    paymentOption = "weekly",
    tuitionTotalCents = 190_000,
    registrationFeeCents = REGISTRATION_FEE_CENTS,
  }
) {
  if (!stripeClient || !subscriptionId || !enrollmentId) {
    throw new Error("Stripe subscription schedule details are incomplete.");
  }

  const terms = getPaymentPlanTerms(paymentOption, tuitionTotalCents, registrationFeeCents);
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  let scheduleId = getStripeResourceId(subscription.schedule);
  let schedule = scheduleId
    ? await stripeClient.subscriptionSchedules.retrieve(scheduleId)
    : await stripeClient.subscriptionSchedules.create(
        { from_subscription: subscriptionId },
        { idempotencyKey: `first-step-schedule-${subscriptionId}` }
      );
  scheduleId = schedule.id;

  if (!scheduleIsConfigured(schedule, enrollmentId, terms)) {
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
        installmentsTotal: String(terms.installmentsTotal),
        interval: terms.paymentInterval,
        paymentOption,
      },
      proration_behavior: "none",
      phases: [
        {
          start_date: startDate,
          duration: { interval: "week", interval_count: terms.scheduleDurationWeeks },
          items,
          ...(phase?.trial_end ? { trial_end: phase.trial_end } : {}),
          metadata: {
            enrollmentId,
            cohortId,
            programId,
            paymentOption,
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

export async function ensureFiniteWeeklySchedule(stripeClient, details) {
  return ensureFinitePaymentSchedule(stripeClient, { ...details, paymentOption: "weekly" });
}
