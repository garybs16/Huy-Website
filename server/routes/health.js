import { Router } from "express";
import { config } from "../config.js";

export function createHealthRouter() {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      staticApp: config.serveStaticApp,
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  return router;
}
