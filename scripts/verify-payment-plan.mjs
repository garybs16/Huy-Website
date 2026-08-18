// Read-only verification of a real Stripe payment plan created by Checkout.
//
// Mocked tests cannot prove how Stripe itself behaves. This script inspects a
// subscription that Checkout actually created and confirms the assumptions the
// integration depends on -- above all that the first invoice collected only the
// registration fee while tuition sat in its trial.
//
// Usage:
//   node scripts/verify-payment-plan.mjs sub_123
//   node scripts/verify-payment-plan.mjs --latest
//   node scripts/verify-payment-plan.mjs sub_123 --tuition 200000
//
// The registration fee is derived from the schedule unless --registration is given,
// so cohorts priced differently from the $2,000 default still verify correctly.

import { config } from "../server/config.js";
import {
  createStripeClient,
  getPaymentPlanTerms,
  getStripeResourceId,
} from "../server/lib/stripe.js";

const SECONDS_PER_DAY = 86_400;
const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;

function parseArgs(argv) {
  const args = { subscriptionId: null, tuitionCents: 200_000, registrationCents: null };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--tuition") {
      args.tuitionCents = Number(argv[index + 1]);
      index += 1;
    } else if (value === "--registration") {
      args.registrationCents = Number(argv[index + 1]);
      index += 1;
    } else if (!value.startsWith("--")) {
      args.subscriptionId = value;
    }
  }

  return args;
}

const results = [];

function check(label, passed, detail) {
  results.push({ label, passed, detail });
  console.log(`  [${passed ? "PASS" : "FAIL"}] ${label}${detail ? ` -- ${detail}` : ""}`);
}

function note(message) {
  console.log(`         ${message}`);
}

function money(cents) {
  return `$${(Number(cents ?? 0) / 100).toFixed(2)}`;
}

async function resolveSubscription(stripe, subscriptionId) {
  if (subscriptionId) {
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  const recent = await stripe.subscriptions.list({ limit: 1, status: "all" });

  if (!recent.data[0]) {
    throw new Error("No subscriptions exist on this Stripe account yet.");
  }

  console.log(`Using most recent subscription: ${recent.data[0].id}`);
  return recent.data[0];
}

async function findFirstInvoice(stripe, subscriptionId) {
  const invoices = await stripe.invoices.list({ subscription: subscriptionId, limit: 100 });
  const ordered = [...invoices.data].sort((left, right) => Number(left.created) - Number(right.created));

  return ordered.find((invoice) => invoice.billing_reason === "subscription_create") ?? ordered[0] ?? null;
}

// Stripe returns schedule phase items with `price` as an ID string, and never returns
// the `price_data` used to create them, so the amount has to be fetched.
async function resolvePhaseAmount(stripe, phase, cache) {
  const raw = phase?.items?.[0]?.price;
  const priceId = typeof raw === "string" ? raw : raw?.id;

  if (!priceId) {
    return null;
  }

  if (!cache.has(priceId)) {
    cache.set(priceId, await stripe.prices.retrieve(priceId));
  }

  return cache.get(priceId);
}

async function run() {
  if (!config.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  const isLive = config.stripeSecretKey.startsWith("sk_live_");

  if (isLive) {
    console.log("NOTE: reading LIVE mode. All calls here are read-only.\n");
  }

  const args = parseArgs(process.argv.slice(2));
  const stripe = createStripeClient(config.stripeSecretKey);
  const priceCache = new Map();
  const subscription = await resolveSubscription(stripe, args.subscriptionId);
  const paymentOption = subscription.metadata?.paymentOption ?? "weekly";
  const scheduleId = getStripeResourceId(subscription.schedule);
  const schedule = scheduleId ? await stripe.subscriptionSchedules.retrieve(scheduleId) : null;

  // Prefer what the app recorded on the schedule; fall back to recomputing.
  const recordedInstallment = Number(schedule?.metadata?.installmentAmountCents ?? 0);
  const recordedFinal = Number(schedule?.metadata?.finalInstallmentAmountCents ?? 0);
  const recordedTotal = Number(schedule?.metadata?.installmentsTotal ?? 0);
  const scheduledBalanceCents =
    recordedInstallment > 0 && recordedTotal > 0
      ? recordedInstallment * (recordedTotal - 1) + (recordedFinal || recordedInstallment)
      : 0;
  const registrationCents =
    args.registrationCents ?? (scheduledBalanceCents > 0 ? args.tuitionCents - scheduledBalanceCents : 25_000);
  const terms = getPaymentPlanTerms(paymentOption, args.tuitionCents, registrationCents);

  console.log(`Subscription : ${subscription.id}  (${isLive ? "LIVE" : "test"} mode, status ${subscription.status})`);
  console.log(`Plan         : ${paymentOption} -- ${terms.installmentsTotal} installments`);
  console.log(`Derived      : ${money(args.tuitionCents)} tuition, ${money(registrationCents)} registration`);
  console.log(`Expecting    : ${terms.regularInstallmentsTotal} x ${money(terms.installmentAmountCents)}` +
    (terms.hasFinalInstallmentAdjustment ? ` then ${money(terms.finalInstallmentAmountCents)}` : ""));

  console.log("\nThe critical assumption");
  const firstInvoice = await findFirstInvoice(stripe, subscription.id);

  if (!firstInvoice) {
    check("First invoice exists", false, "no invoices found");
  } else {
    const amountPaid = Number(firstInvoice.amount_paid ?? 0);
    check(
      "First invoice collected only the registration fee",
      amountPaid === registrationCents,
      `${firstInvoice.id} collected ${money(amountPaid)}, expected ${money(registrationCents)}`
    );

    if (amountPaid !== registrationCents) {
      note("If tuition was billed here too, the webhook rejects the session and the");
      note("enrollment never activates even though the card was charged.");
    }
  }

  console.log("\nTrial that defers installment one");
  const trialEnd = Number(subscription.trial_end ?? 0);
  check("Subscription carries a trial_end", trialEnd > 0);

  if (trialEnd > 0) {
    const trialDays = Math.round((trialEnd - Number(subscription.created)) / SECONDS_PER_DAY);
    check(`Trial is ${terms.trialDays} days`, trialDays === terms.trialDays, `measured ${trialDays} days`);
    note(`First tuition charge due ${new Date(trialEnd * 1000).toISOString().slice(0, 10)}`);
  }

  console.log("\nRecurring item");
  const items = subscription.items?.data ?? [];
  check("Exactly one recurring tuition item", items.length === 1, `found ${items.length}`);

  if (items.length === 1) {
    const recurring = items[0].price?.recurring ?? {};
    check(
      `Billing interval is every ${terms.intervalCount} ${terms.interval}(s)`,
      recurring.interval === terms.interval && Number(recurring.interval_count) === terms.intervalCount,
      `got ${recurring.interval_count} ${recurring.interval}`
    );
    check(
      "Installment amount matches the published plan",
      Number(items[0].price?.unit_amount) === terms.installmentAmountCents,
      `${money(items[0].price?.unit_amount)} vs ${money(terms.installmentAmountCents)}`
    );
  }

  console.log("\nFinite schedule");
  check("A subscription schedule is attached", Boolean(schedule), scheduleId ?? "none");

  if (schedule) {
    check(
      "Schedule cancels itself when it ends",
      schedule.end_behavior === "cancel",
      `end_behavior is "${schedule.end_behavior}"`
    );

    const phases = schedule.phases ?? [];
    const expectedPhases = terms.hasFinalInstallmentAdjustment ? 2 : 1;
    check(`Schedule has ${expectedPhases} phase(s)`, phases.length === expectedPhases, `found ${phases.length}`);

    const firstPhaseWeeks = Math.round((Number(phases[0]?.end_date) - Number(phases[0]?.start_date)) / SECONDS_PER_WEEK);
    check(
      `First phase spans ${terms.regularPhaseDurationWeeks} weeks`,
      firstPhaseWeeks === terms.regularPhaseDurationWeeks,
      `measured ${firstPhaseWeeks} weeks`
    );

    const regularPrice = await resolvePhaseAmount(stripe, phases[0], priceCache);
    check(
      "Regular phase bills the standard installment",
      Number(regularPrice?.unit_amount) === terms.installmentAmountCents,
      `${money(regularPrice?.unit_amount)} vs ${money(terms.installmentAmountCents)}`
    );

    if (phases.length === 2) {
      const finalPrice = await resolvePhaseAmount(stripe, phases[1], priceCache);
      check(
        "Final phase bills the adjusted last installment",
        Number(finalPrice?.unit_amount) === terms.finalInstallmentAmountCents,
        `${money(finalPrice?.unit_amount)} vs ${money(terms.finalInstallmentAmountCents)}`
      );

      const collected =
        registrationCents +
        terms.installmentAmountCents * terms.regularInstallmentsTotal +
        Number(finalPrice?.unit_amount ?? 0);
      check(
        "Everything scheduled sums to the tuition total",
        collected === args.tuitionCents,
        `${money(collected)} vs ${money(args.tuitionCents)}`
      );
    }

    // Only subscriptions created after the metadata widening carry the full set.
    const phaseMetadata = phases[0]?.metadata ?? {};
    const hasFullMetadata =
      phaseMetadata.checkoutPurpose === "payment_plan" &&
      Number(phaseMetadata.installmentAmountCents ?? 0) === terms.installmentAmountCents;

    if (!hasFullMetadata) {
      console.log("\nPhase metadata (informational)");
      note("This plan predates the phase-metadata fix, so recurring invoices report a");
      note("narrowed set and skip the deeper amount validation. Existing plans keep");
      note("billing correctly; plans created after the fix carry the full detail.");
    } else {
      check("Phase metadata carries the full plan detail", true, "deeper amount validation stays active");
    }
  }

  const failed = results.filter((result) => !result.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);

  if (failed.length > 0) {
    console.log("\nFailed:");
    for (const result of failed) {
      console.log(`  - ${result.label}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Stripe is behaving the way the integration expects.");
}

run().catch((error) => {
  console.error(`\nVerification could not complete: ${error.message}`);
  process.exitCode = 1;
});
