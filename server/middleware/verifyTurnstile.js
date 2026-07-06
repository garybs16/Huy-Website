function getClientIp(req) {
  const cloudflareIp = req.get("cf-connecting-ip");

  if (cloudflareIp) {
    return cloudflareIp;
  }

  const forwardedFor = req.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "";
}

export function verifyTurnstile(turnstileVerifier) {
  return async (req, res, next) => {
    if (!turnstileVerifier?.enabled) {
      return next();
    }

    const token = req.body?.turnstileToken ?? req.body?.["cf-turnstile-response"];
    const result = await turnstileVerifier.verify(token, getClientIp(req));

    if (!result.success) {
      console.warn("Turnstile verification failed", {
        path: req.path,
        errorCodes: result.errorCodes,
      });

      return res.status(400).json({
        error: "Security verification failed. Please refresh the page and try again.",
      });
    }

    return next();
  };
}
