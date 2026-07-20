import "dotenv/config";
import { randomBytes } from "node:crypto";
import path from "node:path";
import {
  createPasswordHash,
  isAdminTotpSecretValid,
  isPasswordHashProductionReady,
} from "./lib/adminSecurity.js";

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

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

const dataDir = path.resolve(process.cwd(), process.env.DATA_DIR ?? "server/data");
const staticDir = path.resolve(process.cwd(), process.env.STATIC_DIR ?? "dist");
const databasePath = path.resolve(process.cwd(), process.env.DATABASE_URL ?? "server/data/enrollment.db");
const adminPassword = (process.env.ADMIN_PASSWORD ?? "").trim();
const adminPasswordHash = (process.env.ADMIN_PASSWORD_HASH ?? "").trim() || (adminPassword ? createPasswordHash(adminPassword) : "");
const adminSessionSecret = (process.env.ADMIN_SESSION_SECRET ?? "").trim();
const adminKey = (process.env.API_ADMIN_KEY ?? "").trim();
const configuredRequestSecuritySecret = (process.env.REQUEST_SECURITY_SECRET ?? "").trim();
const requestSecuritySecret =
  configuredRequestSecuritySecret || adminSessionSecret || adminKey || randomBytes(48).toString("base64url");
const adminTotpSecret = (process.env.ADMIN_TOTP_SECRET ?? "").trim();

export const config = {
  port: parsePort(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  adminKey,
  adminUsername: (process.env.ADMIN_USERNAME ?? "").trim(),
  adminPasswordHash,
  adminPasswordProvided: Boolean(adminPassword),
  adminSessionSecret,
  adminSessionCookieSameSite: parseSameSite(process.env.ADMIN_SESSION_COOKIE_SAME_SITE, "lax"),
  adminSessionTtlHours: parsePositiveInteger(process.env.ADMIN_SESSION_TTL_HOURS, 12),
  adminTotpSecret,
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
  stripePublishableKey: (process.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "").trim(),
  notificationWebhookUrl: (process.env.NOTIFICATION_WEBHOOK_URL ?? "").trim(),
  notificationWebhookSecret: (process.env.NOTIFICATION_WEBHOOK_SECRET ?? "").trim(),
  resendApiKey: (process.env.RESEND_API_KEY ?? "").trim(),
  emailFrom: (process.env.EMAIL_FROM ?? "").trim(),
  emailReplyTo: (process.env.EMAIL_REPLY_TO ?? "").trim(),
  adminNotificationEmail: (process.env.ADMIN_NOTIFICATION_EMAIL ?? "").trim(),
  turnstileSecretKey: (process.env.TURNSTILE_SECRET_KEY ?? "").trim(),
  turnstileSiteKey: (process.env.VITE_TURNSTILE_SITE_KEY ?? "").trim(),
  requestSecuritySecret,
  requestSecuritySecretProvided: Boolean(configuredRequestSecuritySecret),
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
  const requestSecuritySecret =
    currentConfig.requestSecuritySecret || currentConfig.adminSessionSecret || currentConfig.adminKey || "";
  const adminMfaConfigured = Boolean(currentConfig.adminTotpSecret);

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

  if (
    currentConfig.nodeEnv === "production" &&
    sessionAuthConfigured &&
    currentConfig.adminSessionSecret.length < 32
  ) {
    issues.push("ADMIN_SESSION_SECRET must be at least 32 characters in production.");
  }

  if (
    currentConfig.nodeEnv === "production" &&
    sessionAuthConfigured &&
    !isPasswordHashProductionReady(currentConfig.adminPasswordHash)
  ) {
    warnings.push(
      "ADMIN_PASSWORD_HASH predates the current 600,000-iteration policy. Regenerate it with npm run admin:hash; the existing hash remains usable during the credential rollout."
    );
  }

  if (currentConfig.adminKey && currentConfig.adminKey.length < 32) {
    issues.push("API_ADMIN_KEY must be at least 32 characters when configured.");
  }

  if (currentConfig.nodeEnv === "production" && requestSecuritySecret.length < 32) {
    issues.push("REQUEST_SECURITY_SECRET must resolve to at least 32 characters in production.");
  }

  if (adminMfaConfigured && !isAdminTotpSecretValid(currentConfig.adminTotpSecret)) {
    issues.push("ADMIN_TOTP_SECRET must be a Base32 secret containing at least 160 bits.");
  }

  if (currentConfig.nodeEnv === "production" && currentConfig.adminSessionCookieSameSite === "none") {
    issues.push("ADMIN_SESSION_COOKIE_SAME_SITE must be lax or strict in production.");
  }

  if (stripeConfigured && !currentConfig.publicAppUrl) {
    issues.push("PUBLIC_APP_URL is required when Stripe Checkout is enabled.");
  }

  if (stripeConfigured && !currentConfig.stripePublishableKey) {
    issues.push("VITE_STRIPE_PUBLISHABLE_KEY is required when Stripe Checkout is enabled.");
  }

  const publicAppUrl = currentConfig.publicAppUrl ? parseUrl(currentConfig.publicAppUrl) : null;

  if (currentConfig.publicAppUrl && !publicAppUrl) {
    issues.push("PUBLIC_APP_URL must be a valid absolute URL.");
  }

  if (
    currentConfig.nodeEnv === "production" &&
    publicAppUrl &&
    publicAppUrl.protocol !== "https:"
  ) {
    issues.push("PUBLIC_APP_URL must use HTTPS in production.");
  }

  for (const origin of currentConfig.corsOrigins ?? []) {
    const parsedOrigin = parseUrl(origin);

    if (!parsedOrigin || !["http:", "https:"].includes(parsedOrigin.protocol) || parsedOrigin.origin !== origin) {
      issues.push(`CORS_ORIGINS contains an invalid origin: ${origin}`);
    }
  }

  if (
    currentConfig.nodeEnv === "production" &&
    stripeConfigured &&
    !currentConfig.stripeSecretKey.startsWith("sk_live_")
  ) {
    issues.push("STRIPE_SECRET_KEY must be a live secret key in production.");
  }

  if (
    currentConfig.nodeEnv === "production" &&
    currentConfig.stripePublishableKey &&
    !currentConfig.stripePublishableKey.startsWith("pk_live_")
  ) {
    issues.push("VITE_STRIPE_PUBLISHABLE_KEY must be a live publishable key in production.");
  }

  if (stripeConfigured && !currentConfig.stripeWebhookSecret) {
    issues.push("STRIPE_WEBHOOK_SECRET is required when Stripe Checkout is enabled.");
  }

  if (
    currentConfig.stripeWebhookSecret &&
    (!currentConfig.stripeWebhookSecret.startsWith("whsec_") || currentConfig.stripeWebhookSecret.length < 20)
  ) {
    issues.push("STRIPE_WEBHOOK_SECRET format is invalid.");
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

  if (currentConfig.nodeEnv === "production" && sessionAuthConfigured && !adminMfaConfigured) {
    warnings.push("ADMIN_TOTP_SECRET is not configured. Admin password login does not yet require MFA.");
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
    adminMfaConfigured,
    adminAuthMode,
    paymentsEnabled: stripeConfigured && Boolean(
      currentConfig.stripeWebhookSecret &&
      currentConfig.stripePublishableKey &&
      currentConfig.publicAppUrl
    ),
  };
}
