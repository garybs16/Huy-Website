export function requireAdminKey(adminKey) {
  return (req, res, next) => {
    if (!adminKey) {
      return res.status(503).json({
        error: "Admin endpoints are disabled. Configure API_ADMIN_KEY to enable them.",
      });
    }

    const provided = req.get("x-api-key");

    if (!provided || provided !== adminKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return next();
  };
}
