import { createHmac } from "node:crypto";

const DEFAULT_TIMEOUT_MS = 5000;

function signBody(body, secret) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function createNotifier({ webhookUrl, signingSecret, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!webhookUrl) {
    return {
      enabled: false,
      send: async () => false,
    };
  }

  return {
    enabled: true,
    async send(event) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const body = JSON.stringify({
        ...event,
        sentAt: new Date().toISOString(),
      });
      const headers = {
        "Content-Type": "application/json",
      };

      if (signingSecret) {
        headers["x-first-step-signature"] = signBody(body, signingSecret);
      }

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers,
          body,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Notification webhook returned ${response.status}`);
        }

        return true;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export function notifyAdmissions(notifier, event) {
  if (!notifier?.enabled) {
    return;
  }

  notifier.send(event).catch((error) => {
    console.error(`Admissions notification failed: ${error.message}`);
  });
}
