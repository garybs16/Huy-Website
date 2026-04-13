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
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "pcahi-harmony-"));
  process.env.DATA_DIR = tempDataDir;
  process.env.DATABASE_URL = path.join(tempDataDir, "enrollment.db");
  process.env.API_ADMIN_KEY = "harmony-admin-key";
  process.env.ADMIN_USERNAME = "harmony-admin";
  process.env.ADMIN_PASSWORD_HASH = createPasswordHash("HarmonyPassword123!");
  process.env.ADMIN_SESSION_SECRET = "harmony-session-secret";
  const { startServer } = await import("../server/index.js");
  const port = 4020;
  const { server } = startServer(port);

  try {
    const healthRes = await fetch(`http://localhost:${port}/api/health`);
    assert(healthRes.ok, "Health endpoint failed");
    const healthBody = await healthRes.json();
    assert(healthBody.status === "ok", "Health endpoint did not report ok status");
    assert(healthBody.services?.database === "ok", "Health endpoint did not confirm database readiness");

    const programsRes = await fetch(`http://localhost:${port}/api/programs`);
    assert(programsRes.ok, "Failed to load programs from API");
    const programsBody = await programsRes.json();
    assert(Array.isArray(programsBody.items), "Programs payload must contain items array");
    assert(programsBody.items.length > 0, "Programs array cannot be empty");

    const cohortsRes = await fetch(`http://localhost:${port}/api/cohorts`);
    assert(cohortsRes.ok, "Failed to load cohorts from API");
    const cohortsBody = await cohortsRes.json();
    assert(Array.isArray(cohortsBody.items), "Cohorts payload must contain items array");
    assert(cohortsBody.items.length > 0, "Cohorts array cannot be empty");
    const depositCohort = cohortsBody.items.find((item) => item.allowPaymentPlan);
    assert(depositCohort, "At least one cohort must offer a payment plan");

    const firstProgramId = programsBody.items[0].id;

    const inquiryRes = await fetch(`http://localhost:${port}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Harmony Check",
        email: "harmony-check@example.com",
        program: firstProgramId,
        message: "Backend and frontend contract smoke check.",
      }),
    });
    assert(inquiryRes.status === 201, "Inquiry submission failed contract check");

    const waitlistRes = await fetch(`http://localhost:${port}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Waitlist Harmony",
        email: "waitlist-harmony@example.com",
      }),
    });
    assert(waitlistRes.status === 201, "Waitlist submission failed contract check");

    const enrollmentRes = await fetch(`http://localhost:${port}/api/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentFullName: "Enrollment Harmony",
        email: "enrollment-harmony@example.com",
        phone: "949-555-0100",
        dateOfBirth: "2000-01-15",
        addressLine1: "123 Main Street",
        city: "Irvine",
        state: "CA",
        postalCode: "92614",
        emergencyContactName: "Casey Harmony",
        emergencyContactPhone: "949-555-0101",
        cohortId: depositCohort.id,
        paymentOption: "deposit",
        notes: `Interested in ${firstProgramId}`,
      }),
    });
    assert(enrollmentRes.status === 201, "Enrollment submission failed contract check");
    const enrollmentBody = await enrollmentRes.json();
    assert(typeof enrollmentBody.enrollmentId === "string", "Enrollment response must contain enrollmentId");
    assert(enrollmentBody.paymentStatus === "manual_pending", "Deposit enrollment should fall back to manual pending without Stripe");
    assert(enrollmentBody.paymentOption === "deposit", "Deposit enrollment should preserve payment option");
    assert(enrollmentBody.amountDueNowCents === depositCohort.paymentPlanDepositCents, "Deposit amount mismatch");
    assert(enrollmentBody.balanceDueCents > 0, "Deposit enrollment must retain a remaining balance");

    const enrollmentStatusRes = await fetch(
      `http://localhost:${port}/api/enrollments/${enrollmentBody.enrollmentId}/status`
    );
    assert(enrollmentStatusRes.ok, "Enrollment status endpoint failed");
    const enrollmentStatusBody = await enrollmentStatusRes.json();
    assert(enrollmentStatusBody.enrollmentId === enrollmentBody.enrollmentId, "Enrollment status returned wrong id");
    assert(
      typeof enrollmentStatusBody.paymentStatus === "string",
      "Enrollment status must include paymentStatus"
    );
    assert(enrollmentStatusBody.paymentOption === "deposit", "Enrollment status must include deposit payment option");
    assert(enrollmentStatusBody.balanceDueCents > 0, "Enrollment status must include remaining balance");

    const adminOverviewRes = await fetch(`http://localhost:${port}/api/admin/overview`, {
      headers: { "x-api-key": "harmony-admin-key" },
    });
    assert(adminOverviewRes.ok, "Admin overview endpoint failed");
    const adminOverviewBody = await adminOverviewRes.json();
    assert(typeof adminOverviewBody.metrics?.enrollments === "number", "Admin overview metrics are invalid");

    const adminLoginRes = await fetch(`http://localhost:${port}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "harmony-admin",
        password: "HarmonyPassword123!",
      }),
    });
    assert(adminLoginRes.ok, "Admin session login failed");
    const adminCookie = adminLoginRes.headers.get("set-cookie")?.split(";")[0];
    assert(adminCookie, "Admin session login did not return a cookie");

    const adminSessionRes = await fetch(`http://localhost:${port}/api/admin/session`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminSessionRes.ok, "Admin session endpoint failed");
    const adminSessionBody = await adminSessionRes.json();
    assert(adminSessionBody.authenticated === true, "Admin session should be authenticated after login");

    const adminProgramCreateRes = await fetch(`http://localhost:${port}/api/admin/programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        id: "harmony-program",
        title: "Harmony Program",
        summary: "Program created during the admin CRUD smoke test.",
        duration: "5 weeks",
        schedule: "Weekend",
        isActive: true,
        sortOrder: 90,
      }),
    });
    assert(adminProgramCreateRes.status === 201, "Admin program creation failed");

    const adminCohortCreateRes = await fetch(`http://localhost:${port}/api/admin/cohorts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "harmony-admin-key",
      },
      body: JSON.stringify({
        id: "harmony-cohort",
        programId: "harmony-program",
        title: "Harmony Cohort",
        startDate: "2026-06-01",
        endDate: "2026-06-20",
        scheduleLabel: "Weekend",
        meetingPattern: "Saturday and Sunday | 9:00 AM to 2:00 PM",
        tuitionCents: 150000,
        allowPaymentPlan: true,
        paymentPlanDepositCents: 50000,
        capacity: 10,
        isActive: true,
        sortOrder: 95,
      }),
    });
    assert(adminCohortCreateRes.status === 201, "Admin cohort creation failed");

    const publicProgramsAfterCreateRes = await fetch(`http://localhost:${port}/api/programs`);
    const publicProgramsAfterCreate = await publicProgramsAfterCreateRes.json();
    assert(
      publicProgramsAfterCreate.items.some((item) => item.id === "harmony-program"),
      "Public programs did not reflect the created admin program"
    );

    const adminProgramUpdateRes = await fetch(`http://localhost:${port}/api/admin/programs/harmony-program`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        id: "harmony-program",
        title: "Harmony Program Updated",
        summary: "Updated during the admin CRUD smoke test.",
        duration: "6 weeks",
        schedule: "Weekend and evening",
        isActive: true,
        sortOrder: 91,
      }),
    });
    assert(adminProgramUpdateRes.ok, "Admin program update failed");

    const adminCohortDeleteRes = await fetch(`http://localhost:${port}/api/admin/cohorts/harmony-cohort`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    assert(adminCohortDeleteRes.status === 204, "Admin cohort deletion failed");

    const adminProgramDeleteRes = await fetch(`http://localhost:${port}/api/admin/programs/harmony-program`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    assert(adminProgramDeleteRes.status === 204, "Admin program deletion failed");

    const adminLogoutRes = await fetch(`http://localhost:${port}/api/admin/logout`, {
      method: "POST",
      headers: { Cookie: adminCookie },
    });
    assert(adminLogoutRes.status === 204, "Admin logout failed");

    console.log("Harmony check passed.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(tempDataDir, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(`Harmony check failed: ${error.message}`);
  process.exit(1);
});
