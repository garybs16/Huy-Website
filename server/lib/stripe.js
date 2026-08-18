import Stripe from "stripe";

// Keep API reads aligned with the production webhook endpoint's snapshot shape.
// Upgrade this together with the Stripe Workbench event destination version.
export const STRIPE_API_VERSION = "2026-05-27.dahlia";
export const REGISTRATION_FEE_CENTS = 25_000;

// Stripe rejects USD charges under $0.50, so an installment below that floor would fail at
// collection time instead of at configuration time.
export const MINIMUM_STRIPE_CHARGE_CENTS = 50;

// Raised for payment-plan inputs that can never succeed on a retry: impossible plan amounts,
// enrollment metadata that does not match, or a subscription that lost the trial separating
// the registration fee from installment one. Webhook callers answer Stripe with a 2xx for
// these instead of inviting three days of pointless redelivery.
export class PaymentPlanValidationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = "PaymentPlanValidationError";
    this.context = context;
  }
}

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

  const normalizedTuitionTotalCents = Number(tuitionTotalCents);
  const normalizedRegistrationFeeCents = Number(registrationFeeCents);
  const tuitionBalanceCents = normalizedTuitionTotalCents - normalizedRegistrationFeeCents;
  const installmentAmountCents = Math.floor(tuitionBalanceCents / option.installmentsTotal);

  if (
    !Number.isInteger(normalizedTuitionTotalCents) ||
    !Number.isInteger(normalizedRegistrationFeeCents) ||
    installmentAmountCents <= 0
  ) {
    throw new PaymentPlanValidationError(`The ${paymentOption} plan amounts are invalid.`);
  }

  if (installmentAmountCents < MINIMUM_STRIPE_CHARGE_CENTS) {
    throw new PaymentPlanValidationError(
      `The ${paymentOption} plan amounts are invalid: every installment must be at least ${MINIMUM_STRIPE_CHARGE_CENTS} cents for Stripe to collect it.`
    );
  }

  const installmentRemainderCents = tuitionBalanceCents - installmentAmountCents * option.installmentsTotal;
  const finalInstallmentAmountCents = installmentAmountCents + installmentRemainderCents;
  const hasFinalInstallmentAdjustment = installmentRemainderCents > 0;
  const regularInstallmentsTotal = hasFinalInstallmentAdjustment
    ? option.installmentsTotal - 1
    : option.installmentsTotal;
  const trialWeeks = option.trialDays / 7;

  return {
    ...option,
    paymentOption,
    registrationFeeCents: normalizedRegistrationFeeCents,
    tuitionBalanceCents,
    installmentAmountCents,
    finalInstallmentAmountCents,
    installmentRemainderCents,
    hasFinalInstallmentAdjustment,
    regularInstallmentsTotal,
    paymentInterval: option.intervalCount === 1 ? "week" : "2_weeks",
    regularPhaseDurationWeeks: trialWeeks + regularInstallmentsTotal * option.intervalCount,
    finalPhaseDurationWeeks: hasFinalInstallmentAdjustment ? option.intervalCount : 0,
    scheduleDurationWeeks: trialWeeks + option.installmentsTotal * option.intervalCount,
  };
}

export function createStripeClient(secretKey) {
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
    maxNetworkRetries: 2,
    timeout: 10_000,
  });
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

function buildPlanMetadata({ enrollmentId, cohortId, programId, terms }) {
  return {
    enrollmentId,
    cohortId,
    programId,
    paymentOption: terms.paymentOption,
    checkoutPurpose: "payment_plan",
    installmentsTotal: String(terms.installmentsTotal),
    paymentInterval: terms.paymentInterval,
    installmentAmountCents: String(terms.installmentAmountCents),
    finalInstallmentAmountCents: String(terms.finalInstallmentAmountCents),
  };
}

function scheduleIsConfigured(schedule, enrollmentId, terms) {
  return (
    schedule?.end_behavior === "cancel" &&
    schedule?.metadata?.enrollmentId === enrollmentId &&
    Number(schedule?.metadata?.installmentsTotal ?? 0) === terms.installmentsTotal &&
    schedule?.metadata?.paymentOption === terms.paymentOption &&
    Number(schedule?.metadata?.installmentAmountCents ?? 0) === terms.installmentAmountCents &&
    Number(schedule?.metadata?.finalInstallmentAmountCents ?? 0) === terms.finalInstallmentAmountCents
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

async function getSubscriptionProductId(stripeClient, subscription) {
  const subscriptionItems = subscription?.items?.data ?? [];

  if (subscriptionItems.length !== 1) {
    throw new Error("Stripe payment plan must contain exactly one recurring tuition item.");
  }

  const price = subscriptionItems[0].price ?? subscriptionItems[0].plan;
  let productId = typeof price === "object" ? getStripeResourceId(price.product) : null;

  if (!productId) {
    const priceId = getStripeResourceId(price);

    if (!priceId || !stripeClient.prices?.retrieve) {
      throw new Error("Stripe payment plan could not determine its tuition product.");
    }

    const retrievedPrice = await stripeClient.prices.retrieve(priceId);
    productId = getStripeResourceId(retrievedPrice.product);
  }

  if (!productId) {
    throw new Error("Stripe payment plan did not include a reusable tuition product.");
  }

  return productId;
}

export async function ensureFinitePaymentSchedule(
  stripeClient,
  {
    subscriptionId,
    enrollmentId,
    cohortId,
    programId,
    paymentOption = "weekly",
    tuitionTotalCents = 200_000,
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
    const trialEnd = phase?.trial_end ?? subscription.trial_end ?? null;

    if (!startDate || items.length === 0) {
      throw new Error("Stripe subscription schedule could not determine its billing phase.");
    }

    if (items.length !== 1) {
      throw new Error("Stripe payment plan must contain exactly one recurring tuition item.");
    }

    // Every plan opens with a trial so the registration fee sits alone on the first invoice.
    // Rebuilding the phases without that trial_end would bill installment one immediately and
    // pull every later charge forward, so refuse rather than silently recharge the student.
    if (terms.trialDays > 0 && !trialEnd) {
      throw new PaymentPlanValidationError(
        "Stripe payment plan is missing the trial that separates the registration fee from installment one.",
        { subscriptionId, enrollmentId }
      );
    }

    const planMetadata = buildPlanMetadata({ enrollmentId, cohortId, programId, terms });
    const phases = [
      {
        start_date: startDate,
        duration: {
          interval: "week",
          interval_count: terms.hasFinalInstallmentAdjustment
            ? terms.regularPhaseDurationWeeks
            : terms.scheduleDurationWeeks,
        },
        items,
        ...(trialEnd ? { trial_end: trialEnd } : {}),
        metadata: { ...planMetadata, installmentType: "regular" },
        proration_behavior: "none",
      },
    ];

    if (terms.hasFinalInstallmentAdjustment) {
      const productId = await getSubscriptionProductId(stripeClient, subscription);
      phases.push({
        duration: { interval: "week", interval_count: terms.finalPhaseDurationWeeks },
        items: [
          {
            price_data: {
              currency: "usd",
              product: productId,
              unit_amount: terms.finalInstallmentAmountCents,
              recurring: {
                interval: terms.interval,
                interval_count: terms.intervalCount,
              },
            },
            quantity: 1,
          },
        ],
        metadata: { ...planMetadata, installmentType: "final" },
        proration_behavior: "none",
      });
    }

    schedule = await stripeClient.subscriptionSchedules.update(scheduleId, {
      end_behavior: "cancel",
      metadata: { ...planMetadata, interval: terms.paymentInterval },
      proration_behavior: "none",
      phases,
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
