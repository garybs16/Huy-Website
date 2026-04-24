import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createPasswordHash } from "../server/lib/adminSecurity.js";

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
  process.env.API_ADMIN_KEY = "production-admin-key";
  process.env.ADMIN_USERNAME = "production-admin";
  process.env.ADMIN_PASSWORD_HASH = createPasswordHash("ProductionPassword123!");
  process.env.ADMIN_SESSION_SECRET = "production-session-secret";
  process.env.SERVE_STATIC_APP = "true";

  const { startServer } = await import("../server/index.js");
  const port = 4030;
  const { server } = startServer(port);

  try {
    const healthRes = await fetch(`http://localhost:${port}/api/health`);
    assert(healthRes.ok, "Production health endpoint failed");
    const healthBody = await healthRes.json();
    assert(healthBody.services?.database === "ok", "Production health endpoint did not confirm database readiness");

    const homeRes = await fetch(`http://localhost:${port}/`);
    assert(homeRes.ok, "Production server did not serve the frontend root");
    assert(
      homeRes.headers.get("content-type")?.includes("text/html"),
      "Frontend root must return HTML in production mode"
    );

    const spaRouteRes = await fetch(`http://localhost:${port}/schedule`);
    assert(spaRouteRes.ok, "SPA fallback route did not resolve in production mode");

    const registerRouteRes = await fetch(`http://localhost:${port}/register`);
    assert(registerRouteRes.ok, "Register route did not resolve in production mode");

    const programsRouteRes = await fetch(`http://localhost:${port}/programs`);
    assert(programsRouteRes.ok, "Programs route did not resolve in production mode");

    const programsRes = await fetch(`http://localhost:${port}/api/programs`);
    assert(programsRes.ok, "Production API failed to serve programs");
    const programsBody = await programsRes.json();
    assert(Array.isArray(programsBody.items) && programsBody.items.length > 0, "Programs payload is invalid");

    const cohortsRes = await fetch(`http://localhost:${port}/api/cohorts`);
    assert(cohortsRes.ok, "Production API failed to serve cohorts");
    const cohortsBody = await cohortsRes.json();
    assert(Array.isArray(cohortsBody.items) && cohortsBody.items.length > 0, "Cohorts payload is invalid");
    const depositCohort = cohortsBody.items.find((item) => item.allowPaymentPlan);
    assert(depositCohort, "Production cohorts must expose at least one payment-plan option");

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
        cohortId: depositCohort.id,
        paymentOption: "deposit",
        notes: "Production smoke registration.",
      }),
    });
    assert(enrollmentRes.status === 201, "Production enrollment submission failed");
    const enrollmentBody = await enrollmentRes.json();
    assert(enrollmentBody.paymentOption === "deposit", "Production enrollment should keep deposit payment option");
    assert(enrollmentBody.amountDueNowCents === depositCohort.paymentPlanDepositCents, "Production deposit amount mismatch");
    assert(enrollmentBody.balanceDueCents > 0, "Production enrollment must keep a remaining balance");

    const enrollmentStatusRes = await fetch(
      `http://localhost:${port}/api/enrollments/${enrollmentBody.enrollmentId}/status`
    );
    assert(enrollmentStatusRes.ok, "Production enrollment status endpoint failed");
    const enrollmentStatusBody = await enrollmentStatusRes.json();
    assert(enrollmentStatusBody.paymentOption === "deposit", "Production enrollment status must include payment option");

    const adminOverviewRes = await fetch(`http://localhost:${port}/api/admin/overview`, {
      headers: { "x-api-key": "production-admin-key" },
    });
    assert(adminOverviewRes.ok, "Production admin overview endpoint failed");

    const adminLoginRes = await fetch(`http://localhost:${port}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "production-admin",
        password: "ProductionPassword123!",
      }),
    });
    assert(adminLoginRes.ok, "Production admin login failed");
    const adminCookie = adminLoginRes.headers.get("set-cookie")?.split(";")[0];
    assert(adminCookie, "Production admin login did not return a cookie");

    const adminExportRes = await fetch(`http://localhost:${port}/api/admin/export`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminExportRes.ok, "Production admin operational export failed");
    const adminExportBody = await adminExportRes.json();
    assert(Array.isArray(adminExportBody.enrollments), "Production admin export must include enrollments");

    const adminBackupRes = await fetch(`http://localhost:${port}/api/admin/backups`, {
      method: "POST",
      headers: { Cookie: adminCookie },
    });
    assert(adminBackupRes.status === 201, "Production admin database backup creation failed");
    const adminBackupBody = await adminBackupRes.json();
    assert(typeof adminBackupBody.filename === "string", "Production admin backup response must include filename");

    const adminProgramCreateRes = await fetch(`http://localhost:${port}/api/admin/programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        id: "production-program",
        title: "Production Program",
        summary: "Program created during the production CRUD smoke test.",
        duration: "4 weeks",
        schedule: "Evening",
        isActive: true,
        sortOrder: 88,
      }),
    });
    assert(adminProgramCreateRes.status === 201, "Production admin program creation failed");

    const adminCohortCreateRes = await fetch(`http://localhost:${port}/api/admin/cohorts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        id: "production-cohort",
        programId: "production-program",
        title: "Production Cohort",
        startDate: "2026-07-01",
        endDate: "2026-07-18",
        scheduleLabel: "Evening",
        meetingPattern: "Monday to Thursday | 5:30 PM to 8:30 PM",
        tuitionCents: 175000,
        allowPaymentPlan: true,
        paymentPlanDepositCents: 60000,
        capacity: 12,
        isActive: true,
        sortOrder: 89,
      }),
    });
    assert(adminCohortCreateRes.status === 201, "Production admin cohort creation failed");

    const publicProgramsAfterCreateRes = await fetch(`http://localhost:${port}/api/programs`);
    const publicProgramsAfterCreate = await publicProgramsAfterCreateRes.json();
    assert(
      publicProgramsAfterCreate.items.some((item) => item.id === "production-program"),
      "Production public programs did not reflect admin CRUD changes"
    );

    const adminCohortDeleteRes = await fetch(`http://localhost:${port}/api/admin/cohorts/production-cohort`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    assert(adminCohortDeleteRes.status === 204, "Production admin cohort deletion failed");

    const adminProgramDeleteRes = await fetch(`http://localhost:${port}/api/admin/programs/production-program`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    assert(adminProgramDeleteRes.status === 204, "Production admin program deletion failed");

    const adminLogoutRes = await fetch(`http://localhost:${port}/api/admin/logout`, {
      method: "POST",
      headers: { Cookie: adminCookie },
    });
    assert(adminLogoutRes.status === 204, "Production admin logout failed");

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
