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
  serveStaticApp:
    process.env.SERVE_STATIC_APP === "true" ||
    (process.env.NODE_ENV === "production" && process.env.SERVE_STATIC_APP !== "false"),
  trustProxy:
    process.env.TRUST_PROXY === "true" ||
    (process.env.NODE_ENV === "production" && process.env.TRUST_PROXY !== "false"),
};
