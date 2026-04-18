import "dotenv/config";
import path from "node:path";

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

export const config = {
  port: parsePort(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  adminKey: process.env.API_ADMIN_KEY ?? "",
  adminUsername: (process.env.ADMIN_USERNAME ?? "").trim(),
  adminPasswordHash: (process.env.ADMIN_PASSWORD_HASH ?? "").trim(),
  adminSessionSecret: (process.env.ADMIN_SESSION_SECRET ?? "").trim(),
  adminSessionCookieSameSite: parseSameSite(process.env.ADMIN_SESSION_COOKIE_SAME_SITE, "lax"),
  adminSessionTtlHours: parsePositiveInteger(process.env.ADMIN_SESSION_TTL_HOURS, 12),
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGINS ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173")
  ),
  dataDir,
  databasePath,
  staticDir,
  publicAppUrl: (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/+$/, ""),
  stripeSecretKey: (process.env.STRIPE_SECRET_KEY ?? "").trim(),
  stripeWebhookSecret: (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim(),
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
    currentConfig.adminPasswordHash ? "ADMIN_PASSWORD_HASH" : null,
    currentConfig.adminSessionSecret ? "ADMIN_SESSION_SECRET" : null,
  ].filter(Boolean);
  const sessionAuthPartial = sessionPiecesConfigured.length > 0 && !sessionAuthConfigured;
  const adminProtectionConfigured = Boolean(currentConfig.adminKey || sessionAuthConfigured);

  if (sessionAuthPartial) {
    issues.push(
      "ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and ADMIN_SESSION_SECRET must all be configured together to enable session-based admin login."
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

  if (!sessionAuthConfigured && currentConfig.adminKey) {
    warnings.push("Session-based admin login is not configured. The admin dashboard falls back to raw API key access.");
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
    sessionAuthConfigured,
    adminAuthMode,
    paymentsEnabled: stripeConfigured && Boolean(currentConfig.stripeWebhookSecret && currentConfig.publicAppUrl),
  };
}
