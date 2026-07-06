import "dotenv/config";
import path from "node:path";
import { createPasswordHash } from "./lib/adminSecurity.js";

function parsePort(value, fallback) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parseOrigins(value) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

function parseSameSite(value, fallback = "lax") {
  const normalized = (value ?? fallback).trim().toLowerCase();

  if (["lax", "strict", "none"].includes(normalized)) {
    return normalized;
  }

  return fallback;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

const dataDir = path.resolve(process.cwd(), process.env.DATA_DIR ?? "server/data");
const staticDir = path.resolve(process.cwd(), process.env.STATIC_DIR ?? "dist");
const databasePath = path.resolve(process.cwd(), process.env.DATABASE_URL ?? "server/data/enrollment.db");
const adminPassword = (process.env.ADMIN_PASSWORD ?? "").trim();
const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH ?? "").trim() || (adminPassword ? createPasswordHash(adminPassword) : "");

export const config = {
  port: parsePort(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  adminKey: process.env.API_ADMIN_KEY ?? "",
  adminUsername: (process.env.ADMIN_USERNAME ?? "").trim(),
  adminPasswordHash,
  adminPasswordProvided: Boolean(adminPassword),
  adminSessionSecret: (process.env.ADMIN_SESSION_SECRET ?? "").trim(),
  adminSessionCookieSameSite: parseSameSite(process.env.ADMIN_SESSION_COOKIE_SAME_SITE, "lax"),
  adminSessionTtlHours: parsePositiveInteger(process.env.ADMIN_SESSION_TTL_HOURS, 12),
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGINS ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173")
  ),
  dataDir,
  databasePath,
  staticDir,
  host: (process.env.HOST ?? "0.0.0.0").trim() || "0.0.0.0",
  publicAppUrl: (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/+$/, ""),
  stripeSecretKey: (process.env.STRIPE_SECRET_KEY ?? "").trim(),
  stripeWebhookSecret: (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim(),
  notificationWebhookUrl: (process.env.NOTIFICATION_WEBHOOK_URL ?? "").trim(),
  notificationWebhookSecret: (process.env.NOTIFICATION_WEBHOOK_SECRET ?? "").trim(),
  resendApiKey: (process.env.RESEND_API_KEY ?? "").trim(),
  emailFrom: (process.env.EMAIL_FROM ?? "").trim(),
  emailReplyTo: (process.env.EMAIL_REPLY_TO ?? "").trim(),
  adminNotificationEmail: (process.env.ADMIN_NOTIFICATION_EMAIL ?? "").trim(),
  turnstileSecretKey: (process.env.TURNSTILE_SECRET_KEY ?? "").trim(),
  turnstileSiteKey: (process.env.VITE_TURNSTILE_SITE_KEY ?? "").trim(),
  serveStaticApp: parseBoolean(
    process.env.SERVE_STATIC_APP,
    (process.env.NODE_ENV ?? "development") === "production"
  ),
  trustProxy: parseBoolean(process.env.TRUST_PROXY, (process.env.NODE_ENV ?? "development") === "production"),
};

export function getRuntimeConfigReport(currentConfig = config) {
  const issues = [];
  const warnings = [];
  const stripeConfigured = Boolean(currentConfig.stripeSecretKey);
  const sessionAuthConfigured = Boolean(
    currentConfig.adminUsername && currentConfig.adminPasswordHash && currentConfig.adminSessionSecret
  );
  const sessionPiecesConfigured = [
    currentConfig.adminUsername ? "ADMIN_USERNAME" : null,
    currentConfig.adminPasswordHash
      ? currentConfig.adminPasswordProvided
        ? "ADMIN_PASSWORD"
        : "ADMIN_PASSWORD_HASH"
      : null,
    currentConfig.adminSessionSecret ? "ADMIN_SESSION_SECRET" : null,
  ].filter(Boolean);
  const sessionAuthPartial = sessionPiecesConfigured.length > 0 && !sessionAuthConfigured;
  const adminProtectionConfigured = Boolean(currentConfig.adminKey || sessionAuthConfigured);
  const emailConfigured = Boolean(currentConfig.resendApiKey && currentConfig.emailFrom);
  const emailPartiallyConfigured = Boolean(currentConfig.resendApiKey || currentConfig.emailFrom) && !emailConfigured;
  const turnstileConfigured = Boolean(currentConfig.turnstileSecretKey && currentConfig.turnstileSiteKey);
  const turnstilePartiallyConfigured =
    Boolean(currentConfig.turnstileSecretKey || currentConfig.turnstileSiteKey) && !turnstileConfigured;

  if (sessionAuthPartial) {
    issues.push(
      "ADMIN_USERNAME, ADMIN_SESSION_SECRET, and either ADMIN_PASSWORD_HASH or ADMIN_PASSWORD must all be configured together to enable session-based admin login."
    );
  }

  if (currentConfig.nodeEnv === "production" && !adminProtectionConfigured) {
    issues.push(
      "Configure either ADMIN_USERNAME + ADMIN_PASSWORD_HASH + ADMIN_SESSION_SECRET, or API_ADMIN_KEY, so admin endpoints stay protected in production."
    );
  }

  if (stripeConfigured && !currentConfig.publicAppUrl) {
    issues.push("PUBLIC_APP_URL is required when Stripe Checkout is enabled.");
  }

  if (stripeConfigured && !currentConfig.stripeWebhookSecret) {
    issues.push("STRIPE_WEBHOOK_SECRET is required when Stripe Checkout is enabled.");
  }

  if (!stripeConfigured) {
    warnings.push("Stripe is not configured. Enrollments will be created in manual payment mode.");
  }

  if (!currentConfig.notificationWebhookUrl) {
    warnings.push("Admissions notification webhook is not configured. Staff must monitor the admin dashboard directly.");
  }

  if (emailPartiallyConfigured) {
    issues.push("RESEND_API_KEY and EMAIL_FROM must be configured together to enable automatic emails.");
  }

  if (!emailConfigured) {
    warnings.push("Automatic email confirmations are not configured. Student and admin emails will not be sent.");
  }

  if (emailConfigured && !currentConfig.adminNotificationEmail) {
    warnings.push("ADMIN_NOTIFICATION_EMAIL is not configured. Student confirmations will send, but admin email alerts will be skipped.");
  }

  if (!turnstileConfigured) {
    warnings.push("Turnstile bot protection is not configured. Public forms rely on rate limits only.");
  }

  if (turnstilePartiallyConfigured) {
    issues.push("TURNSTILE_SECRET_KEY and VITE_TURNSTILE_SITE_KEY must be configured together to enable Turnstile bot protection.");
  }

  if (!sessionAuthConfigured && currentConfig.adminKey) {
    warnings.push("Session-based admin login is not configured. The admin dashboard falls back to raw API key access.");
  }

  if (currentConfig.adminPasswordProvided) {
    warnings.push("ADMIN_PASSWORD is set directly. Prefer ADMIN_PASSWORD_HASH when you want a pre-hashed credential at rest.");
  }

  if (sessionAuthConfigured && !currentConfig.adminKey) {
    warnings.push("API_ADMIN_KEY is not configured. Session login works, but scripted admin access must use browser sessions only.");
  }

  const adminAuthMode = sessionAuthConfigured && currentConfig.adminKey
    ? "hybrid"
    : sessionAuthConfigured
      ? "session"
      : currentConfig.adminKey
        ? "api-key"
        : "disabled";

  return {
    issues,
    warnings,
    stripeConfigured,
    notificationsConfigured: Boolean(currentConfig.notificationWebhookUrl),
    emailConfigured,
    turnstileConfigured,
    sessionAuthConfigured,
    adminAuthMode,
    paymentsEnabled: stripeConfigured && Boolean(currentConfig.stripeWebhookSecret && currentConfig.publicAppUrl),
  };
}
