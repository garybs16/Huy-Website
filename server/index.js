import path from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { JsonStore } from "./lib/jsonStore.js";
import { createHealthRouter } from "./routes/health.js";
import { createInquiriesRouter } from "./routes/inquiries.js";
import { createProgramsRouter } from "./routes/programs.js";
import { createWaitlistRouter } from "./routes/waitlist.js";

function isSameOriginRequest(origin, req) {
  if (!origin) {
    return true;
  }

  const protocol = req.protocol;
  const host = req.get("host");

  if (!host) {
    return false;
  }

  return origin === `${protocol}://${host}`;
}

function isAllowedOrigin(origin, req) {
  return !origin || isSameOriginRequest(origin, req) || config.corsOrigins.includes(origin);
}

export function createApp() {
  const app = express();

  if (config.trustProxy) {
    app.set("trust proxy", 1);
  }

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many submissions. Please try again in a few minutes." },
  });
  const inquiryStore = new JsonStore(path.join(config.dataDir, "inquiries.json"));
  const waitlistStore = new JsonStore(path.join(config.dataDir, "waitlist.json"));

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors((req, callback) => {
      const origin = req.header("Origin");

      if (isAllowedOrigin(origin, req)) {
        callback(null, { origin: origin || true });
        return;
      }

      callback(new Error("CORS origin not allowed"));
    })
  );
  app.use(express.json({ limit: "50kb" }));
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
  app.use("/api", generalLimiter);
  app.use("/api/health", createHealthRouter());
  app.use("/api/programs", createProgramsRouter());
  app.use(
    "/api/inquiries",
    createInquiriesRouter({
      store: inquiryStore,
      submissionLimiter,
      adminKey: config.adminKey,
    })
  );
  app.use(
    "/api/waitlist",
    createWaitlistRouter({
      store: waitlistStore,
      submissionLimiter,
      adminKey: config.adminKey,
    })
  );

  if (config.serveStaticApp && existsSync(config.staticDir)) {
    app.use(express.static(config.staticDir));
    app.get("/{*splat}", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        next();
        return;
      }

      res.sendFile(path.join(config.staticDir, "index.html"));
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  app.use((error, _req, res, _next) => {
    if (error.message === "CORS origin not allowed") {
      return res.status(403).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

export function startServer(port = config.port) {
  const app = createApp();
  const server = app.listen(port, () => {
    const mode = config.serveStaticApp ? "API + frontend" : "API";
    console.log(`${mode} listening on http://localhost:${port}`);
  });

  return { app, server };
}

const entryPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (entryPath && import.meta.url === entryPath) {
  const { server } = startServer();
  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down API server...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
