import path from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { config, getRuntimeConfigReport } from "./config.js";
import { EnrollmentDatabase } from "./lib/enrollmentDb.js";
import { createStripeClient } from "./lib/stripe.js";
import { createAdminRouter } from "./routes/admin.js";
import { createCohortsRouter } from "./routes/cohorts.js";
import { createEnrollmentsRouter } from "./routes/enrollments.js";
import { createHealthRouter } from "./routes/health.js";
import { createInquiriesRouter } from "./routes/inquiries.js";
import { createStripePaymentsRouter } from "./routes/payments.js";
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
  const configReport = getRuntimeConfigReport(config);

  if (configReport.issues.length > 0) {
    throw new Error(`Invalid runtime configuration: ${configReport.issues.join(" ")}`);
  }

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
  const enrollmentDb = new EnrollmentDatabase(config.databasePath);
  const stripeClient = createStripeClient(config.stripeSecretKey);
  const paymentsEnabled = Boolean(stripeClient && configReport.paymentsEnabled);
  app.locals.enrollmentDb = enrollmentDb;
  app.locals.configReport = configReport;

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
  app.use(
    "/api/payments/stripe/webhook",
    createStripePaymentsRouter({
      stripeClient,
      webhookSecret: config.stripeWebhookSecret,
      enrollmentDb,
    })
  );
  app.use(express.json({ limit: "50kb" }));
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
  app.use("/api", generalLimiter);
  app.use("/api/health", createHealthRouter({ enrollmentDb, configReport }));
  app.use("/api/programs", createProgramsRouter());
  app.use("/api/cohorts", createCohortsRouter({ enrollmentDb }));
  app.use("/api/admin", createAdminRouter({ adminKey: config.adminKey, enrollmentDb }));
  app.use(
    "/api/enrollments",
    createEnrollmentsRouter({
      enrollmentDb,
      adminKey: config.adminKey,
      stripeClient: paymentsEnabled ? stripeClient : null,
      publicAppUrl: config.publicAppUrl,
    })
  );
  app.use(
    "/api/inquiries",
    createInquiriesRouter({
      store: {
        insert: (record) => enrollmentDb.insertInquiry(record),
        list: (options) => enrollmentDb.listInquiries(options),
      },
      submissionLimiter,
      adminKey: config.adminKey,
    })
  );
  app.use(
    "/api/waitlist",
    createWaitlistRouter({
      store: {
        insert: (record) => enrollmentDb.insertWaitlist(record),
        list: (options) => enrollmentDb.listWaitlist(options),
      },
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

    for (const warning of app.locals.configReport?.warnings ?? []) {
      console.warn(`Configuration warning: ${warning}`);
    }
  });

  server.on("close", () => {
    app.locals.enrollmentDb?.close();
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
