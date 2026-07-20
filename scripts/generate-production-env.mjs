import { randomBytes } from "node:crypto";
import { createPasswordHash } from "../server/lib/adminSecurity.js";

function secret(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

const adminPassword = process.argv[2] ?? "";
const publicAppUrl = process.argv[3] ?? "https://your-domain.com";

if (!adminPassword) {
  console.error('Usage: npm run env:production -- "AdminPasswordHere" "https://your-domain.com"');
  process.exit(1);
}

const lines = [
  "NODE_ENV=production",
  "PORT=4000",
  "SERVE_STATIC_APP=true",
  "TRUST_PROXY=true",
  "STATIC_DIR=dist",
  "DATA_DIR=/var/data",
  "DATABASE_URL=/var/data/enrollment.db",
  "CORS_ORIGINS=",
  `PUBLIC_APP_URL=${publicAppUrl.replace(/\/+$/, "")}`,
  "ADMIN_USERNAME=admin",
  `ADMIN_PASSWORD_HASH=${createPasswordHash(adminPassword)}`,
  `ADMIN_SESSION_SECRET=${secret(48)}`,
  `REQUEST_SECURITY_SECRET=${secret(48)}`,
  "ADMIN_SESSION_COOKIE_SAME_SITE=lax",
  "ADMIN_SESSION_TTL_HOURS=12",
  "ADMIN_TOTP_SECRET=",
  `API_ADMIN_KEY=${secret(48)}`,
  "STRIPE_SECRET_KEY=",
  "STRIPE_WEBHOOK_SECRET=",
  "VITE_STRIPE_PUBLISHABLE_KEY=",
  "NOTIFICATION_WEBHOOK_URL=",
  `NOTIFICATION_WEBHOOK_SECRET=${secret(32)}`,
  "RESEND_API_KEY=",
  "EMAIL_FROM=\"First Step Healthcare Academy <admissions@firststepha.com>\"",
  "EMAIL_REPLY_TO=huyh@firststepha.org",
  "ADMIN_NOTIFICATION_EMAIL=huyh@firststepha.org",
  "TURNSTILE_SECRET_KEY=",
  "VITE_TURNSTILE_SITE_KEY=",
];

console.log(lines.join("\n"));
