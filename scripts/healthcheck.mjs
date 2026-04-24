const healthcheckUrl = process.env.HEALTHCHECK_URL || `http://127.0.0.1:${process.env.PORT || 4000}/api/health`;

try {
  const response = await fetch(healthcheckUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Healthcheck returned ${response.status}`);
  }

  const body = await response.json();

  if (!["ok", "degraded"].includes(body?.status)) {
    throw new Error(`Unexpected health status: ${body?.status ?? "missing"}`);
  }
} catch (error) {
  console.error(`Healthcheck failed: ${error.message}`);
  process.exit(1);
}
