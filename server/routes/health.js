import { Router } from "express";
import { config } from "../config.js";

export function createHealthRouter({ enrollmentDb, configReport }) {
  const router = Router();

  router.get("/", (_req, res) => {
    let database = "ok";

    try {
      enrollmentDb.ping();
    } catch {
      database = "error";
    }

    const status = database === "ok" && (configReport?.issues.length ?? 0) === 0 ? "ok" : "degraded";

    const response = {
      status,
      timestamp: new Date().toISOString(),
    };

    if (config.nodeEnv !== "production") {
      response.environment = config.nodeEnv;
      response.staticApp = config.serveStaticApp;
      response.uptimeSeconds = Math.round(process.uptime());
      response.services = {
        database,
        payments: configReport?.paymentsEnabled ? "configured" : "manual",
        notifications: configReport?.notificationsConfigured ? "configured" : "manual",
        email: configReport?.emailConfigured ? "configured" : "manual",
        botProtection: configReport?.turnstileConfigured ? "configured" : "rate-limited",
        admin: configReport?.adminAuthMode ?? (config.adminKey ? "api-key" : "disabled"),
      };
      response.warnings = configReport?.warnings ?? [];
    }

    res.set("Cache-Control", "no-store");
    res.json(response);
  });

  return router;
}
