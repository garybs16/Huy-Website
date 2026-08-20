import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ZodError } from "zod";
import {
  adminSessionMatchesUserAgent,
  clearAdminSessionCookie,
  constantTimeEqual,
  createAdminCsrfToken,
  createAdminSessionCookie,
  getAdminSessionIdFromRequest,
  verifyAdminTotpCode,
  verifyAdminCsrfToken,
  verifyPassword,
} from "../lib/adminSecurity.js";
import { requireAdminAccess } from "../middleware/requireAdminAccess.js";
import { preventSensitiveCaching } from "../middleware/securityHeaders.js";
import { REFERRAL_REWARD_CENTS } from "../lib/referrals.js";
import {
  adminCohortSchema,
  adminLoginSchema,
  adminProgramSchema,
  adminResourceIdSchema,
  referralForfeitSchema,
  referralPayoutSchema,
  referralRewardIdSchema,
} from "../validation/schemas.js";

function buildSessionPayload({
  req,
  session,
  adminSessionSecret,
  sessionAuthConfigured,
  apiKeySupported,
  adminAuthMode,
  adminMfaConfigured,
}) {
  return {
    authenticated: Boolean(session),
    username: session?.username ?? null,
    expiresAt: session?.expiresAt ?? null,
    sessionAuthConfigured,
    apiKeySupported,
    adminAuthMode,
    adminMfaConfigured,
    authMethod: req.adminAuth?.method ?? (session ? "session" : null),
    csrfToken: session?.id ? createAdminCsrfToken(session.id, adminSessionSecret) : "",
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
  adminTotpSecret,
  nodeEnv,
  adminAuthMode,
  sessionAuthConfigured,
  adminMfaConfigured,
  enrollmentDb,
  loginLimiter,
  publicCsrfProtection = (_req, _res, next) => next(),
}) {
  const router = Router();

  router.use(preventSensitiveCaching);

  router.get("/session", (req, res) => {
    const sessionId = getAdminSessionIdFromRequest(req, adminSessionSecret);
    let session = sessionId ? enrollmentDb.getAdminSessionById(sessionId) : null;

    if (session && !adminSessionMatchesUserAgent(session, req.get("user-agent"))) {
      enrollmentDb.deleteAdminSession(sessionId);
      session = null;
    }

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
        adminSessionSecret,
        sessionAuthConfigured,
        apiKeySupported: Boolean(adminKey),
        adminAuthMode,
        adminMfaConfigured,
      })
    );
  });

  router.post("/login", loginLimiter, publicCsrfProtection, (req, res, next) => {
    try {
      if (!sessionAuthConfigured) {
        return res.status(503).json({
          error: "Session-based admin login is not configured on this server.",
        });
      }

      const payload = adminLoginSchema.parse(req.body);
      const passwordValid = verifyPassword(payload.password, adminPasswordHash);
      const usernameValid = constantTimeEqual(payload.username, adminUsername);
      const totpValid = !adminMfaConfigured || verifyAdminTotpCode(payload.totpCode, adminTotpSecret);
      const credentialsValid = usernameValid && passwordValid && totpValid;

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
          req: { adminAuth: { method: "session" }, adminSessionSecret },
          session,
          adminSessionSecret,
          sessionAuthConfigured,
          apiKeySupported: Boolean(adminKey),
          adminAuthMode,
          adminMfaConfigured,
        })
      );
    } catch (error) {
      return next(error);
    }
  });

  router.post("/logout", (req, res) => {
    const sessionId = getAdminSessionIdFromRequest(req, adminSessionSecret);
    const storedSession = sessionId ? enrollmentDb.getAdminSessionById(sessionId) : null;
    const session = adminSessionMatchesUserAgent(storedSession, req.get("user-agent")) ? storedSession : null;

    if (session && !verifyAdminCsrfToken(sessionId, req.get("x-csrf-token"), adminSessionSecret)) {
      return res.status(403).json({ error: "Invalid or missing CSRF token." });
    }

    if (session) {
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
    res.setHeader("Clear-Site-Data", '"cache", "cookies", "storage"');
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

  router.get("/referrals", (_req, res) => {
    res.json({
      rewardAmountCents: REFERRAL_REWARD_CENTS,
      items: enrollmentDb.listReferralRewards(),
    });
  });

  // The published rule is that a reward is earned once the referred student attends
  // the first day of theory. Confirming that here is what makes the check payable.
  router.post("/referrals/:id/confirm-attendance", (req, res, next) => {
    try {
      const parsedId = referralRewardIdSchema.safeParse(req.params.id);

      if (!parsedId.success) {
        return res.status(404).json({ error: "Referral reward not found." });
      }

      const party = req.body?.party === "referrer" ? "referrer" : "referred";
      const existing = enrollmentDb.getReferralRewardById(parsedId.data);

      if (!existing) {
        return res.status(404).json({ error: "Referral reward not found." });
      }

      if (existing.status !== "pending") {
        return res.status(409).json({ error: "Only a pending referral reward can be confirmed." });
      }

      // Both sides must fully attend their first week, so a single confirmation may
      // leave the reward pending until the other side is recorded.
      const reward =
        party === "referrer"
          ? enrollmentDb.confirmReferrerAttendance(parsedId.data)
          : enrollmentDb.confirmReferralAttendance(parsedId.data);

      writeAdminAuditEvent(
        enrollmentDb,
        req,
        "referral.attendance.confirmed",
        `Referral ${reward.referralCode}: ${party} first week confirmed (now ${reward.status}).`
      );

      return res.json(reward);
    } catch (error) {
      return next(error);
    }
  });

  // The referrer has no first week of their own, so only the referred student's
  // attendance gates the reward.
  router.post("/referrals/:id/waive-referrer-attendance", (req, res, next) => {
    try {
      const parsedId = referralRewardIdSchema.safeParse(req.params.id);

      if (!parsedId.success || !enrollmentDb.getReferralRewardById(parsedId.data)) {
        return res.status(404).json({ error: "Referral reward not found." });
      }

      const reward = enrollmentDb.waiveReferrerAttendance(parsedId.data);
      writeAdminAuditEvent(
        enrollmentDb,
        req,
        "referral.referrer_attendance.waived",
        `Referral ${reward.referralCode}: referrer attendance not applicable (now ${reward.status}).`
      );

      return res.json(reward);
    } catch (error) {
      return next(error);
    }
  });

  router.post("/referrals/:id/forfeit", (req, res, next) => {
    try {
      const parsedId = referralRewardIdSchema.safeParse(req.params.id);
      const existing = parsedId.success ? enrollmentDb.getReferralRewardById(parsedId.data) : null;

      if (!existing) {
        return res.status(404).json({ error: "Referral reward not found." });
      }

      if (existing.status === "paid") {
        return res.status(409).json({ error: "This referral reward was already paid." });
      }

      const payload = referralForfeitSchema.parse(req.body ?? {});
      const reason = payload.reason ?? "First-week attendance not completed.";

      // A referrer who does not complete their own first week loses every reward
      // they have not already been paid, not just this one.
      const cascade = payload.scope === "all-for-referrer";
      const result = cascade
        ? enrollmentDb.forfeitAllRewardsForReferrer(existing.referrerEnrollmentId, reason)
        : { forfeited: 1 };

      if (!cascade) {
        enrollmentDb.forfeitReferralReward(parsedId.data, reason);
      }

      writeAdminAuditEvent(
        enrollmentDb,
        req,
        "referral.reward.forfeited",
        `Referral ${existing.referralCode} forfeited (${cascade ? `${result.forfeited} rewards` : "1 reward"}): ${reason}`
      );

      return res.json({ forfeited: result.forfeited, reward: enrollmentDb.getReferralRewardById(parsedId.data) });
    } catch (error) {
      return next(error);
    }
  });

  router.post("/referrals/:id/mark-paid", (req, res, next) => {
    try {
      const parsedId = referralRewardIdSchema.safeParse(req.params.id);

      if (!parsedId.success) {
        return res.status(404).json({ error: "Referral reward not found." });
      }

      const payload = referralPayoutSchema.parse(req.body ?? {});
      const existing = enrollmentDb.getReferralRewardById(parsedId.data);

      if (!existing) {
        return res.status(404).json({ error: "Referral reward not found." });
      }

      if (existing.status !== "payable") {
        return res.status(409).json({
          error:
            existing.status === "paid"
              ? "This referral reward was already paid."
              : "Confirm first-day attendance before recording a check.",
        });
      }

      const reward = enrollmentDb.markReferralRewardPaid(parsedId.data, {
        payoutReference: payload.payoutReference ?? null,
      });

      writeAdminAuditEvent(
        enrollmentDb,
        req,
        "referral.reward.paid",
        `Referral ${reward.referralCode} paid by check ${reward.payoutReference ?? "(no number recorded)"}.`
      );

      return res.json(reward);
    } catch (error) {
      return next(error);
    }
  });

  router.get("/export", (req, res) => {
    const exportData = enrollmentDb.exportOperationalData();
    writeAdminAuditEvent(enrollmentDb, req, "admin.export.created", "Operational export downloaded.");

    res.setHeader("Content-Disposition", `attachment; filename="operations-export-${Date.now()}.json"`);
    res.json(exportData);
  });

  router.post("/backups", async (req, res, next) => {
    try {
      const backup = await enrollmentDb.createBackup();
      writeAdminAuditEvent(enrollmentDb, req, "admin.backup.created", `Database backup ${backup.filename} created.`);
      res.status(201).json({
        filename: backup.filename,
        createdAt: backup.createdAt,
      });
    } catch (error) {
      next(error);
    }
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
      const item = enrollmentDb.updateProgram(payload.id, payload);
      writeAdminAuditEvent(enrollmentDb, req, "admin.program.updated", `Program ${item.id} updated.`);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/programs/:id", (req, res, next) => {
    try {
      const id = adminResourceIdSchema.parse(req.params.id);
      enrollmentDb.deleteProgram(id);
      writeAdminAuditEvent(enrollmentDb, req, "admin.program.deleted", `Program ${id} deleted.`);
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
      const item = enrollmentDb.updateCohort(payload.id, payload);
      writeAdminAuditEvent(enrollmentDb, req, "admin.cohort.updated", `Cohort ${item.id} updated.`);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/cohorts/:id", (req, res, next) => {
    try {
      const id = adminResourceIdSchema.parse(req.params.id);
      enrollmentDb.deleteCohort(id);
      writeAdminAuditEvent(enrollmentDb, req, "admin.cohort.deleted", `Cohort ${id} deleted.`);
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
