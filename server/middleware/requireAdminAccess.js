import { getAdminSessionIdFromRequest } from "../lib/adminSecurity.js";

export function requireAdminAccess({ adminKey, adminSessionSecret, enrollmentDb }) {
  return (req, res, next) => {
    if (!adminKey && !adminSessionSecret) {
      return res.status(503).json({
        error: "Admin endpoints are disabled. Configure session auth or API_ADMIN_KEY to enable them.",
      });
    }

    const providedApiKey = req.get("x-api-key");

    if (adminKey && providedApiKey && providedApiKey === adminKey) {
      req.adminAuth = {
        method: "api-key",
        actor: "api-key",
      };
      return next();
    }

    const sessionId = getAdminSessionIdFromRequest(req, adminSessionSecret);

    if (sessionId) {
      const session = enrollmentDb.getAdminSessionById(sessionId);

      if (session) {
        enrollmentDb.touchAdminSession(sessionId);
        req.adminAuth = {
          method: "session",
          actor: session.username,
          sessionId: session.id,
        };
        return next();
      }
    }

    return res.status(401).json({ error: "Unauthorized" });
  };
}
