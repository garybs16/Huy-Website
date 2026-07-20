import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const CSRF_COOKIE_NAME = "public_csrf";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const ENROLLMENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") {
    return false;
  }

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getCookieValue(headerValue, name) {
  if (typeof headerValue !== "string" || headerValue.length > 8192) {
    return null;
  }

  const matches = [];

  for (const chunk of headerValue.split(";")) {
    const separatorIndex = chunk.indexOf("=");

    if (separatorIndex < 1) {
      continue;
    }

    if (chunk.slice(0, separatorIndex).trim() === name) {
      matches.push(chunk.slice(separatorIndex + 1).trim());
    }
  }

  // Duplicate cookies are ambiguous and can indicate cookie tossing.
  if (matches.length !== 1) {
    return null;
  }

  try {
    return decodeURIComponent(matches[0]);
  } catch {
    return null;
  }
}

function sign(secret, purpose, value) {
  return createHmac("sha256", secret).update(`${purpose}:${value}`).digest("base64url");
}

function buildCookie(name, value, { secure, maxAgeSeconds, path = "/", sameSite = "Lax" }) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    "HttpOnly",
    `SameSite=${sameSite}`,
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function enrollmentCookieName(enrollmentId) {
  return `enrollment_access_${enrollmentId.replaceAll("-", "_")}`;
}

export function createPublicCsrfProtection({ secret, secure }) {
  function issueToken(req, res) {
    if (req.get("sec-fetch-site") === "cross-site") {
      return res.status(403).json({ error: "Cross-site request denied." });
    }

    const nonce = randomBytes(32).toString("base64url");
    const csrfToken = sign(secret, "public-csrf", nonce);

    res.setHeader(
      "Set-Cookie",
      buildCookie(CSRF_COOKIE_NAME, nonce, {
        secure,
        maxAgeSeconds: 2 * 60 * 60,
        sameSite: "Strict",
      })
    );
    res.json({ csrfToken });
  }

  function requireToken(req, res, next) {
    if (req.get("sec-fetch-site") === "cross-site") {
      return res.status(403).json({ error: "Cross-site request denied." });
    }

    const nonce = getCookieValue(req.get("cookie"), CSRF_COOKIE_NAME);
    const providedToken = req.get("x-public-csrf-token");

    if (
      !nonce ||
      !TOKEN_PATTERN.test(nonce) ||
      !providedToken ||
      !TOKEN_PATTERN.test(providedToken) ||
      !constantTimeEqual(providedToken, sign(secret, "public-csrf", nonce))
    ) {
      return res.status(403).json({ error: "Invalid or missing request verification token." });
    }

    return next();
  }

  return { issueToken, requireToken };
}

export function createEnrollmentAccessCookie(enrollmentId, { secret, secure }) {
  if (!ENROLLMENT_ID_PATTERN.test(enrollmentId)) {
    throw new TypeError("A valid enrollment ID is required.");
  }

  const nonce = randomBytes(32).toString("base64url");
  const signature = sign(secret, `enrollment-access:${enrollmentId}`, nonce);

  return buildCookie(enrollmentCookieName(enrollmentId), `${nonce}.${signature}`, {
    secure,
    maxAgeSeconds: 30 * 24 * 60 * 60,
    path: `/api/enrollments/${enrollmentId}`,
  });
}

export function hasEnrollmentAccess(req, enrollmentId, secret) {
  if (!ENROLLMENT_ID_PATTERN.test(enrollmentId)) {
    return false;
  }

  const rawCookie = getCookieValue(req.get("cookie"), enrollmentCookieName(enrollmentId));

  if (!rawCookie) {
    return false;
  }

  const [nonce, providedSignature, extra] = rawCookie.split(".");

  if (
    extra !== undefined ||
    !nonce ||
    !TOKEN_PATTERN.test(nonce) ||
    !providedSignature ||
    !TOKEN_PATTERN.test(providedSignature)
  ) {
    return false;
  }

  return constantTimeEqual(
    providedSignature,
    sign(secret, `enrollment-access:${enrollmentId}`, nonce)
  );
}
