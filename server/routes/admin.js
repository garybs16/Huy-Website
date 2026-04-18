import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ZodError } from "zod";
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminSessionIdFromRequest,
  verifyPassword,
} from "../lib/adminSecurity.js";
import { requireAdminAccess } from "../middleware/requireAdminAccess.js";
import { adminCohortSchema, adminLoginSchema, adminProgramSchema } from "../validation/schemas.js";

function buildSessionPayload({ req, session, sessionAuthConfigured, apiKeySupported, adminAuthMode }) {
  return {
    authenticated: Boolean(session),
    username: session?.username ?? null,
    expiresAt: session?.expiresAt ?? null,
    sessionAuthConfigured,
    apiKeySupported,
    adminAuthMode,
    authMethod: req.adminAuth?.method ?? (session ? "session" : null),
  };
}

function getIpAddress(req) {
  return req.ip || req.socket?.remoteAddress || null;
}

function getSessionCookieOptions(req, { nodeEnv, adminSessionCookieSameSite, adminSessionTtlHours }) {
  return {
    sameSite: adminSessionCookieSameSite,
    secure: nodeEnv === "production",
    maxAgeSeconds: adminSessionTtlHours * 60 * 60,
  };
}

function writeAdminAuditEvent(enrollmentDb, req, action, detail) {
  enrollmentDb.insertAdminAuditEvent({
    id: randomUUID(),
    actor: req.adminAuth?.actor ?? "unknown",
    action,
    detail,
    ipAddress: getIpAddress(req),
    createdAt: new Date().toISOString(),
  });
}

export function createAdminRouter({
  adminKey,
  adminUsername,
  adminPasswordHash,
  adminSessionSecret,
  adminSessionCookieSameSite,
  adminSessionTtlHours,
  nodeEnv,
  adminAuthMode,
  sessionAuthConfigured,
  enrollmentDb,
  loginLimiter,
}) {
  const router = Router();

  router.get("/session", (req, res) => {
    const sessionId = getAdminSessionIdFromRequest(req, adminSessionSecret);
    const session = sessionId ? enrollmentDb.getAdminSessionById(sessionId) : null;

    if (session?.id) {
      enrollmentDb.touchAdminSession(session.id);
    }

    if (sessionId && !session) {
      res.setHeader(
        "Set-Cookie",
        clearAdminSessionCookie(getSessionCookieOptions(req, {
          nodeEnv,
          adminSessionCookieSameSite,
          adminSessionTtlHours,
        }))
      );
    }

    res.json(
      buildSessionPayload({
        req,
        session,
        sessionAuthConfigured,
        apiKeySupported: Boolean(adminKey),
        adminAuthMode,
      })
    );
  });

  router.post("/login", loginLimiter, (req, res, next) => {
    try {
      if (!sessionAuthConfigured) {
        return res.status(503).json({
          error: "Session-based admin login is not configured on this server.",
        });
      }

      const payload = adminLoginSchema.parse(req.body);
      const credentialsValid =
        payload.username === adminUsername && verifyPassword(payload.password, adminPasswordHash);

      if (!credentialsValid) {
        enrollmentDb.insertAdminAuditEvent({
          id: randomUUID(),
          actor: payload.username,
          action: "admin.login.failed",
          detail: "Invalid username or password.",
          ipAddress: getIpAddress(req),
          createdAt: new Date().toISOString(),
        });

        return res.status(401).json({ error: "Invalid username or password." });
      }

      const expiresAt = new Date(Date.now() + adminSessionTtlHours * 60 * 60 * 1000).toISOString();
      const session = enrollmentDb.createAdminSession({
        id: randomUUID(),
        username: adminUsername,
        ipAddress: getIpAddress(req),
        userAgent: req.get("user-agent"),
        expiresAt,
      });

      enrollmentDb.insertAdminAuditEvent({
        id: randomUUID(),
        actor: adminUsername,
        action: "admin.login.succeeded",
        detail: "Session created successfully.",
        ipAddress: getIpAddress(req),
        createdAt: new Date().toISOString(),
      });

      res.setHeader(
        "Set-Cookie",
        createAdminSessionCookie(session.id, {
          sessionSecret: adminSessionSecret,
          ...getSessionCookieOptions(req, {
            nodeEnv,
            adminSessionCookieSameSite,
            adminSessionTtlHours,
          }),
        })
      );

      return res.json(
        buildSessionPayload({
          req: { adminAuth: { method: "session" } },
          session,
          sessionAuthConfigured,
          apiKeySupported: Boolean(adminKey),
          adminAuthMode,
        })
      );
    } catch (error) {
      return next(error);
    }
  });

  router.post("/logout", (req, res) => {
    const sessionId = getAdminSessionIdFromRequest(req, adminSessionSecret);
    const session = sessionId ? enrollmentDb.getAdminSessionById(sessionId) : null;

    if (sessionId) {
      enrollmentDb.deleteAdminSession(sessionId);
    }

    if (session) {
      enrollmentDb.insertAdminAuditEvent({
        id: randomUUID(),
        actor: session.username,
        action: "admin.logout",
        detail: "Session closed by user.",
        ipAddress: getIpAddress(req),
        createdAt: new Date().toISOString(),
      });
    }

    res.setHeader(
      "Set-Cookie",
      clearAdminSessionCookie(getSessionCookieOptions(req, {
        nodeEnv,
        adminSessionCookieSameSite,
        adminSessionTtlHours,
      }))
    );
    res.status(204).end();
  });

  router.use(
    requireAdminAccess({
      adminKey,
      adminSessionSecret,
      enrollmentDb,
    })
  );

  router.get("/overview", (_req, res) => {
    res.json(enrollmentDb.getAdminOverview());
  });

  router.get("/programs", (_req, res) => {
    res.json({ items: enrollmentDb.listPrograms({ includeInactive: true }) });
  });

  router.post("/programs", (req, res, next) => {
    try {
      const payload = adminProgramSchema.parse(req.body);
      const item = enrollmentDb.createProgram(payload);
      writeAdminAuditEvent(enrollmentDb, req, "admin.program.created", `Program ${item.id} created.`);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/programs/:id", (req, res, next) => {
    try {
      const payload = adminProgramSchema.parse({ ...req.body, id: req.params.id });
      const item = enrollmentDb.updateProgram(req.params.id, payload);
      writeAdminAuditEvent(enrollmentDb, req, "admin.program.updated", `Program ${item.id} updated.`);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/programs/:id", (req, res, next) => {
    try {
      enrollmentDb.deleteProgram(req.params.id);
      writeAdminAuditEvent(enrollmentDb, req, "admin.program.deleted", `Program ${req.params.id} deleted.`);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.get("/cohorts", (_req, res) => {
    res.json({ items: enrollmentDb.listCohortsForAdmin() });
  });

  router.post("/cohorts", (req, res, next) => {
    try {
      const payload = adminCohortSchema.parse(req.body);
      const item = enrollmentDb.createCohort(payload);
      writeAdminAuditEvent(enrollmentDb, req, "admin.cohort.created", `Cohort ${item.id} created.`);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/cohorts/:id", (req, res, next) => {
    try {
      const payload = adminCohortSchema.parse({ ...req.body, id: req.params.id });
      const item = enrollmentDb.updateCohort(req.params.id, payload);
      writeAdminAuditEvent(enrollmentDb, req, "admin.cohort.updated", `Cohort ${item.id} updated.`);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/cohorts/:id", (req, res, next) => {
    try {
      enrollmentDb.deleteCohort(req.params.id);
      writeAdminAuditEvent(enrollmentDb, req, "admin.cohort.deleted", `Cohort ${req.params.id} deleted.`);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.use((error, _req, res, next) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (typeof error?.message === "string" && /not found|already exists|dependent cohorts|Existing enrollments/i.test(error.message)) {
      const statusCode = /not found/i.test(error.message) ? 404 : 409;
      return res.status(statusCode).json({ error: error.message });
    }

    return next(error);
  });

  return router;
}
