import assert from "node:assert/strict";
import test from "node:test";
import {
  createAdminCsrfToken,
  createAdminSessionCookie,
  createPasswordHash,
  getAdminSessionIdFromRequest,
  verifyAdminCsrfToken,
  verifyPassword,
} from "../server/lib/adminSecurity.js";

test("admin password hashing verifies only the correct password", () => {
  const hash = createPasswordHash("StrongPassword123!", {
    iterations: 10_000,
    salt: "fixed-test-salt",
  });

  assert.equal(verifyPassword("StrongPassword123!", hash), true);
  assert.equal(verifyPassword("WrongPassword123!", hash), false);
  assert.equal(verifyPassword("StrongPassword123!", "invalid-format"), false);
});

test("signed admin cookies and CSRF tokens reject tampering", () => {
  const sessionSecret = "test-session-secret";
  const sessionId = "session-123";
  const cookie = createAdminSessionCookie(sessionId, {
    sessionSecret,
    sameSite: "lax",
    secure: true,
    maxAgeSeconds: 3600,
  });
  const cookieValue = cookie.split(";")[0];
  const request = {
    get(name) {
      return name.toLowerCase() === "cookie" ? cookieValue : "";
    },
  };

  assert.equal(getAdminSessionIdFromRequest(request, sessionSecret), sessionId);
  assert.equal(
    getAdminSessionIdFromRequest(
      {
        get() {
          return `${cookieValue}tampered`;
        },
      },
      sessionSecret
    ),
    null
  );

  const csrfToken = createAdminCsrfToken(sessionId, sessionSecret);

  assert.equal(verifyAdminCsrfToken(sessionId, csrfToken, sessionSecret), true);
  assert.equal(verifyAdminCsrfToken(sessionId, `${csrfToken}tampered`, sessionSecret), false);
});
