import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "admin_session";
const PASSWORD_HASH_PREFIX = "pbkdf2_sha256";
const PASSWORD_HASH_DIGEST = "sha256";
const PASSWORD_HASH_KEY_LENGTH = 32;
const DEFAULT_PASSWORD_ITERATIONS = 210_000;

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

function buildCookieString(name, value, { maxAgeSeconds, secure }) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
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

  if (!Number.isInteger(iterations) || iterations <= 0) {
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

export function createAdminSessionCookie(sessionId, { sessionSecret, secure, maxAgeSeconds }) {
  return buildCookieString(
    SESSION_COOKIE_NAME,
    `${sessionId}.${signSessionId(sessionId, sessionSecret)}`,
    {
      secure,
      maxAgeSeconds,
    }
  );
}

export function clearAdminSessionCookie({ secure }) {
  return buildCookieString(SESSION_COOKIE_NAME, "", {
    secure,
    maxAgeSeconds: 0,
  });
}
