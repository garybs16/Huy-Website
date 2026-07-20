import { createHash, createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import * as OTPAuth from "otpauth";

const SESSION_COOKIE_NAME = "admin_session";
const PASSWORD_HASH_PREFIX = "pbkdf2_sha256";
const PASSWORD_HASH_DIGEST = "sha256";
const PASSWORD_HASH_KEY_LENGTH = 32;
// OWASP's current PBKDF2-HMAC-SHA256 guidance calls for at least 600,000
// iterations. Existing valid hashes continue to verify during a rollout.
const DEFAULT_PASSWORD_ITERATIONS = 600_000;
const MAX_PASSWORD_ITERATIONS = 1_000_000;
const TOTP_CODE_PATTERN = /^\d{6}$/;
const TOTP_SECRET_PATTERN = /^[A-Z2-7]{32,}$/;
const COOKIE_NAME_PATTERN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SIGNATURE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function normalizeTotpSecret(secret) {
  return typeof secret === "string" ? secret.replace(/[\s-]+/g, "").toUpperCase() : "";
}

export function isAdminTotpSecretValid(secret) {
  const normalized = normalizeTotpSecret(secret);

  if (!TOTP_SECRET_PATTERN.test(normalized)) {
    return false;
  }

  try {
    OTPAuth.Secret.fromBase32(normalized);
    return true;
  } catch {
    return false;
  }
}

export function verifyAdminTotpCode(code, secret, timestamp = Date.now()) {
  const normalizedSecret = normalizeTotpSecret(secret);

  if (!TOTP_CODE_PATTERN.test(code ?? "") || !isAdminTotpSecretValid(normalizedSecret)) {
    return false;
  }

  const totp = new OTPAuth.TOTP({
    issuer: "First Step Healthcare Academy",
    label: "Admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(normalizedSecret),
  });

  return totp.validate({ token: code, timestamp, window: 1 }) !== null;
}

export function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") {
    return false;
  }

  const leftDigest = createHash("sha256").update(left, "utf8").digest();
  const rightDigest = createHash("sha256").update(right, "utf8").digest();

  return timingSafeEqual(leftDigest, rightDigest);
}

export function adminSessionMatchesUserAgent(session, userAgent) {
  return Boolean(session && constantTimeEqual(session.userAgent ?? "", userAgent ?? ""));
}

function parseCookies(headerValue) {
  if (typeof headerValue !== "string" || headerValue.length > 8192) {
    return {};
  }

  const duplicates = new Set();

  return headerValue.split(";").reduce((cookies, chunk) => {
    const [rawName, ...rawValueParts] = chunk.split("=");
    const name = rawName?.trim();

    if (!name || !COOKIE_NAME_PATTERN.test(name) || duplicates.has(name)) {
      return cookies;
    }

    if (Object.hasOwn(cookies, name)) {
      delete cookies[name];
      duplicates.add(name);
      return cookies;
    }

    const encodedValue = rawValueParts.join("=").trim();

    if (encodedValue.length > 4096) {
      return cookies;
    }

    try {
      cookies[name] = decodeURIComponent(encodedValue);
    } catch {
      return cookies;
    }

    return cookies;
  }, {});
}

function signSessionId(sessionId, secret) {
  return createHmac("sha256", secret).update(sessionId).digest("base64url");
}

export function createAdminCsrfToken(sessionId, secret) {
  if (!sessionId || !secret) {
    return "";
  }

  return createHmac("sha256", secret).update(`csrf:${sessionId}`).digest("base64url");
}

function formatSameSite(value) {
  const normalized = (value ?? "Lax").toLowerCase();

  if (normalized === "strict") {
    return "Strict";
  }

  if (normalized === "none") {
    return "None";
  }

  return "Lax";
}

function buildCookieString(name, value, { maxAgeSeconds, sameSite = "Lax", secure }) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${formatSameSite(sameSite)}`,
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function createPasswordHash(password, { iterations = DEFAULT_PASSWORD_ITERATIONS, salt } = {}) {
  const normalizedSalt = salt ?? randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(
    password,
    normalizedSalt,
    iterations,
    PASSWORD_HASH_KEY_LENGTH,
    PASSWORD_HASH_DIGEST
  ).toString("hex");

  return `${PASSWORD_HASH_PREFIX}$${iterations}$${normalizedSalt}$${hash}`;
}

export function isPasswordHashProductionReady(storedHash) {
  if (typeof storedHash !== "string") {
    return false;
  }

  const [prefix, iterationText, salt, hashHex, extra] = storedHash.split("$");
  const iterations = Number(iterationText);

  return (
    extra === undefined &&
    prefix === PASSWORD_HASH_PREFIX &&
    Number.isInteger(iterations) &&
    iterations >= DEFAULT_PASSWORD_ITERATIONS &&
    iterations <= MAX_PASSWORD_ITERATIONS &&
    /^[a-f0-9]{32,}$/i.test(salt ?? "") &&
    /^[a-f0-9]{64}$/i.test(hashHex ?? "")
  );
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }

  const [prefix, iterationText, salt, hashHex] = storedHash.split("$");

  if (prefix !== PASSWORD_HASH_PREFIX || !iterationText || !salt || !hashHex) {
    return false;
  }

  const iterations = Number(iterationText);

  if (!Number.isInteger(iterations) || iterations <= 0 || iterations > MAX_PASSWORD_ITERATIONS) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/i.test(hashHex)) {
    return false;
  }

  const expectedHash = Buffer.from(hashHex, "hex");
  const actualHash = pbkdf2Sync(password, salt, iterations, expectedHash.length, PASSWORD_HASH_DIGEST);

  if (expectedHash.length !== actualHash.length) {
    return false;
  }

  return timingSafeEqual(expectedHash, actualHash);
}

export function getAdminSessionIdFromRequest(req, sessionSecret) {
  if (!sessionSecret) {
    return null;
  }

  const cookies = parseCookies(req.get("cookie"));
  const rawCookie = cookies[SESSION_COOKIE_NAME];

  if (!rawCookie) {
    return null;
  }

  const [sessionId, signature] = rawCookie.split(".");

  if (
    !sessionId ||
    !SESSION_ID_PATTERN.test(sessionId) ||
    !signature ||
    !SIGNATURE_PATTERN.test(signature)
  ) {
    return null;
  }

  const expectedSignature = signSessionId(sessionId, sessionSecret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== providedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
    return null;
  }

  return sessionId;
}

export function verifyAdminCsrfToken(sessionId, providedToken, secret) {
  if (!sessionId || !providedToken || !secret) {
    return false;
  }

  const expectedToken = createAdminCsrfToken(sessionId, secret);
  const expectedBuffer = Buffer.from(expectedToken);
  const providedBuffer = Buffer.from(providedToken);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function createAdminSessionCookie(sessionId, { sessionSecret, sameSite, secure, maxAgeSeconds }) {
  return buildCookieString(
    SESSION_COOKIE_NAME,
    `${sessionId}.${signSessionId(sessionId, sessionSecret)}`,
    {
      sameSite,
      secure,
      maxAgeSeconds,
    }
  );
}

export function clearAdminSessionCookie({ sameSite, secure }) {
  return buildCookieString(SESSION_COOKIE_NAME, "", {
    sameSite,
    secure,
    maxAgeSeconds: 0,
  });
}
