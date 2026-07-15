import { createHash, createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "admin_session";
const PASSWORD_HASH_PREFIX = "pbkdf2_sha256";
const PASSWORD_HASH_DIGEST = "sha256";
const PASSWORD_HASH_KEY_LENGTH = 32;
const DEFAULT_PASSWORD_ITERATIONS = 210_000;
const MAX_PASSWORD_ITERATIONS = 1_000_000;

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
  if (!headerValue) {
    return {};
  }

  return headerValue.split(";").reduce((cookies, chunk) => {
    const [rawName, ...rawValueParts] = chunk.split("=");
    const name = rawName?.trim();

    if (!name) {
      return cookies;
    }

    cookies[name] = decodeURIComponent(rawValueParts.join("=").trim());
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

  if (!sessionId || !signature) {
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
