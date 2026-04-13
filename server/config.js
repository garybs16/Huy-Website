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

const dataDir = path.resolve(process.cwd(), process.env.DATA_DIR ?? "server/data");
const staticDir = path.resolve(process.cwd(), process.env.STATIC_DIR ?? "dist");
const databasePath = path.resolve(process.cwd(), process.env.DATABASE_URL ?? "server/data/enrollment.db");

export const config = {
  port: parsePort(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  adminKey: process.env.API_ADMIN_KEY ?? "",
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

  if (currentConfig.nodeEnv === "production" && !currentConfig.adminKey) {
    issues.push("API_ADMIN_KEY is required in production so the admin endpoints stay protected and usable.");
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

  return {
    issues,
    warnings,
    stripeConfigured,
    paymentsEnabled: stripeConfigured && Boolean(currentConfig.stripeWebhookSecret && currentConfig.publicAppUrl),
  };
}
