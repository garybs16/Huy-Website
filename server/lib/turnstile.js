import { randomUUID } from "node:crypto";

const TURNSTILE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_TOKEN_LENGTH = 2048;

export function createTurnstileVerifier({ secretKey, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const enabled = Boolean(secretKey);

  async function verify(token, remoteIp) {
    if (!enabled) {
      return { success: true, skipped: true };
    }

    if (!token || typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) {
      return { success: false, errorCodes: ["missing-or-invalid-token"] };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const body = new URLSearchParams({
        secret: secretKey,
        response: token,
        idempotency_key: randomUUID(),
      });

      if (remoteIp) {
        body.set("remoteip", remoteIp);
      }

      const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));

      return {
        success: Boolean(response.ok && result.success),
        errorCodes: result["error-codes"] ?? [],
        hostname: result.hostname,
        challengeTs: result.challenge_ts,
      };
    } catch (error) {
      return {
        success: false,
        errorCodes: [error.name === "AbortError" ? "validation-timeout" : "validation-error"],
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    enabled,
    verify,
  };
}
