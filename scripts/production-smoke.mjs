import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "pcahi-production-"));
  process.env.NODE_ENV = "production";
  process.env.DATA_DIR = tempDataDir;
  process.env.DATABASE_URL = path.join(tempDataDir, "enrollment.db");

  const { startServer } = await import("../server/index.js");
  const port = 4030;
  const { server } = startServer(port);

  try {
    const homeRes = await fetch(`http://localhost:${port}/`);
    assert(homeRes.ok, "Production server did not serve the frontend root");
    assert(
      homeRes.headers.get("content-type")?.includes("text/html"),
      "Frontend root must return HTML in production mode"
    );

    const spaRouteRes = await fetch(`http://localhost:${port}/schedule`);
    assert(spaRouteRes.ok, "SPA fallback route did not resolve in production mode");

    const programsRes = await fetch(`http://localhost:${port}/api/programs`);
    assert(programsRes.ok, "Production API failed to serve programs");
    const programsBody = await programsRes.json();
    assert(Array.isArray(programsBody.items) && programsBody.items.length > 0, "Programs payload is invalid");

    const cohortsRes = await fetch(`http://localhost:${port}/api/cohorts`);
    assert(cohortsRes.ok, "Production API failed to serve cohorts");
    const cohortsBody = await cohortsRes.json();
    assert(Array.isArray(cohortsBody.items) && cohortsBody.items.length > 0, "Cohorts payload is invalid");

    const inquiryRes = await fetch(`http://localhost:${port}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Production Smoke",
        email: "production-smoke@example.com",
        program: programsBody.items[0].id,
        message: "Verifying the production frontend and backend path together.",
      }),
    });
    assert(inquiryRes.status === 201, "Production inquiry submission failed");

    const waitlistRes = await fetch(`http://localhost:${port}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Production Waitlist",
        email: "production-waitlist@example.com",
        notes: "Production smoke test submission.",
      }),
    });
    assert(waitlistRes.status === 201, "Production waitlist submission failed");

    const enrollmentRes = await fetch(`http://localhost:${port}/api/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentFullName: "Production Enrollment",
        email: "production-enrollment@example.com",
        phone: "949-555-0110",
        dateOfBirth: "1999-08-09",
        addressLine1: "555 Enrollment Ave",
        city: "Costa Mesa",
        state: "CA",
        postalCode: "92626",
        emergencyContactName: "Jordan Enrollment",
        emergencyContactPhone: "949-555-0111",
        cohortId: cohortsBody.items[0].id,
        notes: "Production smoke registration.",
      }),
    });
    assert(enrollmentRes.status === 201, "Production enrollment submission failed");

    console.log("Production smoke check passed.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(tempDataDir, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(`Production smoke check failed: ${error.message}`);
  process.exit(1);
});
