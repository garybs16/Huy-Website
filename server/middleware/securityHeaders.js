export function preventSensitiveCaching(_req, res, next) {
  res.set({
    "Cache-Control": "no-store, private, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  });
  res.vary("Cookie");
  res.vary("Authorization");
  res.vary("X-Api-Key");
  next();
}

export function setPermissionsPolicy(_req, res, next) {
  res.set(
    "Permissions-Policy",
    "camera=(), geolocation=(), microphone=(), usb=(), browsing-topics=()"
  );
  next();
}

const METHODS_WITH_OPTIONAL_BODY = new Set(["POST", "PUT", "PATCH"]);

export function requireJsonRequestBody(req, res, next) {
  if (!METHODS_WITH_OPTIONAL_BODY.has(req.method)) {
    return next();
  }

  const contentLength = Number(req.get("content-length") ?? 0);
  const hasBody = contentLength > 0 || Boolean(req.get("transfer-encoding"));

  if (hasBody && !req.is("application/json")) {
    return res.status(415).json({ error: "Request body must use application/json." });
  }

  return next();
}
