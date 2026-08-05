import Stripe from "stripe";
import { config } from "../server/config.js";
import { createStripeClient, STRIPE_API_VERSION } from "../server/lib/stripe.js";

const REQUIRED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.expired",
  "invoice.paid",
  "invoice.payment_failed",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function stripeMode(key, kind) {
  if (key.startsWith(`${kind}_live_`)) {
    return "live";
  }

  if (key.startsWith(`${kind}_test_`)) {
    return "test";
  }

  return "unknown";
}

async function run() {
  assert(config.stripeSecretKey, "STRIPE_SECRET_KEY is not configured.");
  assert(config.stripePublishableKey, "VITE_STRIPE_PUBLISHABLE_KEY is not configured.");
  assert(config.stripeWebhookSecret, "STRIPE_WEBHOOK_SECRET is not configured.");
  assert(config.publicAppUrl, "PUBLIC_APP_URL is not configured.");

  const secretMode = stripeMode(config.stripeSecretKey, "sk");
  const publishableMode = stripeMode(config.stripePublishableKey, "pk");
  assert(secretMode !== "unknown", "STRIPE_SECRET_KEY format is not recognized.");
  assert(secretMode === publishableMode, "Stripe secret and publishable keys use different modes.");
  assert(config.stripeWebhookSecret.startsWith("whsec_"), "STRIPE_WEBHOOK_SECRET format is not recognized.");

  const stripe = createStripeClient(config.stripeSecretKey);
  const [account, balance, webhookEndpoints] = await Promise.all([
    stripe.accounts.retrieve(),
    stripe.balance.retrieve(),
    stripe.webhookEndpoints.list({ limit: 100 }),
  ]);

  assert(account.charges_enabled, "Stripe account charges are not enabled.");
  assert(account.details_submitted, "Stripe account onboarding details are incomplete.");
  assert(Boolean(balance.livemode) === (secretMode === "live"), "Stripe API mode did not match the configured key.");

  const expectedUrl = `${config.publicAppUrl}/api/payments/stripe/webhook`;
  const endpoint = webhookEndpoints.data.find((item) => item.url === expectedUrl);
  assert(endpoint, `Stripe webhook endpoint is missing: ${expectedUrl}`);
  assert(endpoint.status === "enabled", "Stripe webhook endpoint is disabled.");
  assert(endpoint.api_version === STRIPE_API_VERSION, "Stripe webhook and server API versions do not match.");
  assert(
    endpoint.enabled_events.includes("*") ||
      REQUIRED_WEBHOOK_EVENTS.every((eventType) => endpoint.enabled_events.includes(eventType)),
    "Stripe webhook endpoint is missing one or more required event types."
  );

  const payload = JSON.stringify({ id: "evt_local_readiness", object: "event" });
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: config.stripeWebhookSecret,
  });
  Stripe.webhooks.constructEvent(payload, signature, config.stripeWebhookSecret);

  console.log(
    `Stripe readiness check passed (${secretMode} mode, ${account.default_currency?.toUpperCase() ?? "currency unknown"}, webhook ${STRIPE_API_VERSION}).`
  );
}

run().catch((error) => {
  console.error(`Stripe readiness check failed: ${error.message}`);
  process.exit(1);
});
