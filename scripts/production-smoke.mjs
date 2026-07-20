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
  process.env.API_ADMIN_KEY = "production-admin-key-for-automated-checks";
  process.env.ADMIN_USERNAME = "production-admin";
  process.env.ADMIN_PASSWORD_HASH = createPasswordHash("ProductionPassword123!");
  process.env.ADMIN_SESSION_SECRET = "production-session-secret-for-automated-checks";
  process.env.ADMIN_SESSION_COOKIE_SAME_SITE = "strict";
  process.env.SERVE_STATIC_APP = "true";
  // Production-mode smoke tests must not inherit real payment credentials.
  process.env.STRIPE_SECRET_KEY = "";
  process.env.STRIPE_PUBLISHABLE_KEY = "";
  process.env.STRIPE_WEBHOOK_SECRET = "";
  // Keep fixtures completely offline even when the local machine has
  // production Resend credentials configured.
  process.env.RESEND_API_KEY = "";
  process.env.EMAIL_FROM = "";
  process.env.EMAIL_REPLY_TO = "";
  process.env.ADMIN_NOTIFICATION_EMAIL = "";
  // Browser challenges are intentionally excluded from deterministic smoke
  // fixtures. The live server enables Turnstile through its private keys.
  process.env.TURNSTILE_SECRET_KEY = "";
  process.env.VITE_TURNSTILE_SITE_KEY = "";

  const { startServer } = await import("../server/index.js");
  const port = 4030;
  const { server } = startServer(port);

  try {
    const healthRes = await fetch(`http://localhost:${port}/api/health`);
    assert(healthRes.ok, "Production health endpoint failed");
    const healthBody = await healthRes.json();
    assert(healthBody.status === "ok", "Production health endpoint did not report readiness");
    assert(!("services" in healthBody), "Production health endpoint must not expose service configuration");

    const homeRes = await fetch(`http://localhost:${port}/`);
    assert(homeRes.ok, "Production server did not serve the frontend root");
    assert(
      homeRes.headers.get("content-type")?.includes("text/html"),
      "Frontend root must return HTML in production mode"
    );
    assert(
      homeRes.headers.get("content-security-policy")?.includes("frame-ancestors 'none'"),
      "Production CSP must prevent clickjacking"
    );
    assert(
      homeRes.headers.get("permissions-policy")?.includes("camera=()"),
      "Production responses must restrict sensitive browser capabilities"
    );

    const spaRouteRes = await fetch(`http://localhost:${port}/schedule`);
    assert(spaRouteRes.ok, "SPA fallback route did not resolve in production mode");

    const registerRouteRes = await fetch(`http://localhost:${port}/register`);
    assert(registerRouteRes.ok, "Register route did not resolve in production mode");

    const programsRouteRes = await fetch(`http://localhost:${port}/programs`);
    assert(programsRouteRes.ok, "Programs route did not resolve in production mode");

    const paymentRouteRes = await fetch(`http://localhost:${port}/payment`);
    assert(paymentRouteRes.ok, "Payment portal route did not resolve in production mode");

    const policiesRouteRes = await fetch(`http://localhost:${port}/policies`);
    assert(policiesRouteRes.ok, "Policy Center route did not resolve in production mode");

    const faviconRes = await fetch(`http://localhost:${port}/first-step-logo.jpg`);
    assert(faviconRes.ok, "Production logo favicon did not resolve");
    assert(
      faviconRes.headers.get("content-type")?.includes("image/jpeg"),
      "Production favicon must return the original JPEG logo"
    );

    const robotsRes = await fetch(`http://localhost:${port}/robots.txt`);
    assert(robotsRes.ok, "Production robots.txt did not resolve");
    assert(robotsRes.headers.get("content-type")?.includes("text/plain"), "robots.txt must return plain text");
    assert((await robotsRes.text()).includes("Sitemap: https://firststepha.com/sitemap.xml"), "robots.txt must identify the sitemap");

    const sitemapRes = await fetch(`http://localhost:${port}/sitemap.xml`);
    assert(sitemapRes.ok, "Production sitemap did not resolve");
    assert(
      sitemapRes.headers.get("content-type")?.includes("application/xml") ||
        sitemapRes.headers.get("content-type")?.includes("text/xml"),
      "sitemap.xml must return XML"
    );
    assert((await sitemapRes.text()).includes("https://firststepha.com/register"), "Sitemap must include registration");

    const programsRes = await fetch(`http://localhost:${port}/api/programs`);
    assert(programsRes.ok, "Production API failed to serve programs");
    const programsBody = await programsRes.json();
    assert(Array.isArray(programsBody.items) && programsBody.items.length > 0, "Programs payload is invalid");
    assert(programsBody.items.every((item) => item.id === "cna"), "Production public programs must remain CNA-only");

    const cohortsRes = await fetch(`http://localhost:${port}/api/cohorts`);
    assert(cohortsRes.ok, "Production API failed to serve cohorts");
    const cohortsBody = await cohortsRes.json();
    assert(Array.isArray(cohortsBody.items) && cohortsBody.items.length > 0, "Cohorts payload is invalid");
    assert(cohortsBody.items.every((item) => item.programId === "cna"), "Production public cohorts must remain CNA-only");
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
        paymentOption: "weekly",
        policyAcknowledged: true,
        automaticPaymentAuthorized: true,
        notes: "Production smoke registration.",
      }),
    });
    assert(enrollmentRes.status === 201, "Production enrollment submission failed");
    const enrollmentBody = await enrollmentRes.json();
    assert(enrollmentBody.paymentOption === "weekly", "Production enrollment should keep weekly payment option");
    assert(enrollmentBody.amountDueNowCents === depositCohort.paymentPlanDepositCents, "Production registration fee mismatch");
    assert(enrollmentBody.balanceDueCents > 0, "Production enrollment must keep a remaining balance");

    const enrollmentStatusRes = await fetch(
      `http://localhost:${port}/api/enrollments/${enrollmentBody.enrollmentId}/status`
    );
    assert(enrollmentStatusRes.ok, "Production enrollment status endpoint failed");
    const enrollmentStatusBody = await enrollmentStatusRes.json();
    assert(enrollmentStatusBody.paymentOption === "weekly", "Production enrollment status must include payment option");

    const paymentPortalRes = await fetch(
      `http://localhost:${port}/api/enrollments/${enrollmentBody.enrollmentId}/payment-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "production-enrollment@example.com" }),
      }
    );
    assert(paymentPortalRes.ok, "Production payment portal endpoint failed");
    const paymentPortalBody = await paymentPortalRes.json();
    assert(paymentPortalBody.amountDueNowCents === depositCohort.paymentPlanDepositCents, "Production payment portal amount mismatch");

    const adminOverviewRes = await fetch(`http://localhost:${port}/api/admin/overview`, {
      headers: { "x-api-key": "production-admin-key-for-automated-checks" },
    });
    assert(adminOverviewRes.ok, "Production admin overview endpoint failed");
    assert(
      adminOverviewRes.headers.get("cache-control")?.includes("no-store"),
      "Admin responses must not be cached"
    );

    const adminLoginRes = await fetch(`http://localhost:${port}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "production-admin",
        password: "ProductionPassword123!",
      }),
    });
    assert(adminLoginRes.ok, "Production admin login failed");
    const adminLoginBody = await adminLoginRes.json();
    assert(adminLoginBody.csrfToken, "Production admin login did not return a CSRF token");
    const adminCookie = adminLoginRes.headers.get("set-cookie")?.split(";")[0];
    assert(adminCookie, "Production admin login did not return a cookie");
    const csrfHeaders = {
      Cookie: adminCookie,
      "x-csrf-token": adminLoginBody.csrfToken,
    };

    const adminExportRes = await fetch(`http://localhost:${port}/api/admin/export`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminExportRes.ok, "Production admin operational export failed");
    const adminExportBody = await adminExportRes.json();
    assert(Array.isArray(adminExportBody.enrollments), "Production admin export must include enrollments");

    const adminBackupRes = await fetch(`http://localhost:${port}/api/admin/backups`, {
      method: "POST",
      headers: csrfHeaders,
    });
    assert(adminBackupRes.status === 201, "Production admin database backup creation failed");
    const adminBackupBody = await adminBackupRes.json();
    assert(typeof adminBackupBody.filename === "string", "Production admin backup response must include filename");

    const adminProgramCreateRes = await fetch(`http://localhost:${port}/api/admin/programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders,
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
        ...csrfHeaders,
      },
      body: JSON.stringify({
        id: "production-cohort",
        programId: "production-program",
        title: "Production Cohort",
        startDate: "2026-07-01",
        endDate: "2026-07-18",
        scheduleLabel: "Evening",
        meetingPattern: "Monday to Thursday | 5:30 PM to 8:30 PM",
        tuitionCents: 480000,
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
      publicProgramsAfterCreate.items.every((item) => item.id === "cna"),
      "Production public programs must not expose admin-created non-CNA programs"
    );

    const adminCohortDeleteRes = await fetch(`http://localhost:${port}/api/admin/cohorts/production-cohort`, {
      method: "DELETE",
      headers: csrfHeaders,
    });
    assert(adminCohortDeleteRes.status === 204, "Production admin cohort deletion failed");

    const adminProgramDeleteRes = await fetch(`http://localhost:${port}/api/admin/programs/production-program`, {
      method: "DELETE",
      headers: csrfHeaders,
    });
    assert(adminProgramDeleteRes.status === 204, "Production admin program deletion failed");

    const adminLogoutRes = await fetch(`http://localhost:${port}/api/admin/logout`, {
      method: "POST",
      headers: csrfHeaders,
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
