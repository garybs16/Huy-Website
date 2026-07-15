import assert from "node:assert/strict";
import test from "node:test";
import { getRuntimeConfigReport } from "../server/config.js";

function productionConfig(overrides = {}) {
  return {
    nodeEnv: "production",
    adminKey: "a".repeat(64),
    adminUsername: "site-admin",
    adminPasswordHash: "configured-password-hash",
    adminPasswordProvided: false,
    adminSessionSecret: "s".repeat(64),
    adminSessionCookieSameSite: "strict",
    corsOrigins: [],
    publicAppUrl: "https://firststepha.com",
    stripeSecretKey: "sk_live_" + "x".repeat(32),
    stripeWebhookSecret: "whsec_" + "y".repeat(32),
    stripePublishableKey: "pk_live_" + "z".repeat(32),
    notificationWebhookUrl: "",
    resendApiKey: "",
    emailFrom: "",
    adminNotificationEmail: "",
    turnstileSecretKey: "",
    turnstileSiteKey: "",
    ...overrides,
  };
}

test("production configuration accepts strong authentication and live Stripe secrets", () => {
  const report = getRuntimeConfigReport(productionConfig());
  assert.deepEqual(report.issues, []);
  assert.equal(report.paymentsEnabled, true);
  assert.equal(report.adminAuthMode, "hybrid");
});

test("production configuration rejects weak secrets and unsafe origins", () => {
  const report = getRuntimeConfigReport(
    productionConfig({
      adminKey: "short-key",
      adminSessionSecret: "short-session-secret",
      adminSessionCookieSameSite: "none",
      publicAppUrl: "http://firststepha.com",
      corsOrigins: ["*"],
      stripeSecretKey: "sk_test_unsafe",
      stripePublishableKey: "pk_test_unsafe",
      stripeWebhookSecret: "invalid",
    })
  );
  const issues = report.issues.join(" ");

  assert.match(issues, /ADMIN_SESSION_SECRET/);
  assert.match(issues, /API_ADMIN_KEY/);
  assert.match(issues, /COOKIE_SAME_SITE/);
  assert.match(issues, /HTTPS/);
  assert.match(issues, /CORS_ORIGINS/);
  assert.match(issues, /live secret key/);
  assert.match(issues, /live publishable key/);
  assert.match(issues, /WEBHOOK_SECRET format/);
});
