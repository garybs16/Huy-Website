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

    res.json({
      status,
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      staticApp: config.serveStaticApp,
      uptimeSeconds: Math.round(process.uptime()),
      services: {
        database,
        payments: configReport?.paymentsEnabled ? "configured" : "manual",
        notifications: configReport?.notificationsConfigured ? "configured" : "manual",
        admin: configReport?.adminAuthMode ?? (config.adminKey ? "api-key" : "disabled"),
      },
      warnings: configReport?.warnings ?? [],
    });
  });

  return router;
}
