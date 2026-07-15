import {
  adminSessionMatchesUserAgent,
  constantTimeEqual,
  getAdminSessionIdFromRequest,
  verifyAdminCsrfToken,
} from "../lib/adminSecurity.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireAdminAccess({ adminKey, adminSessionSecret, enrollmentDb }) {
  return (req, res, next) => {
    if (!adminKey && !adminSessionSecret) {
      return res.status(503).json({
        error: "Admin endpoints are disabled. Configure session auth or API_ADMIN_KEY to enable them.",
      });
    }

    const providedApiKey = req.get("x-api-key");

    if (adminKey && providedApiKey && constantTimeEqual(providedApiKey, adminKey)) {
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
        if (!adminSessionMatchesUserAgent(session, req.get("user-agent"))) {
          enrollmentDb.deleteAdminSession(sessionId);
          return res.status(401).json({ error: "Unauthorized" });
        }

        if (!SAFE_METHODS.has(req.method)) {
          const csrfToken = req.get("x-csrf-token");

          if (!verifyAdminCsrfToken(sessionId, csrfToken, adminSessionSecret)) {
            return res.status(403).json({ error: "Invalid or missing CSRF token." });
          }
        }

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
