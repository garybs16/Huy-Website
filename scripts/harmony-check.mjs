import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

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

    const firstProgramId = programsBody.items[0].id;
    const firstCohortId = cohortsBody.items[0].id;

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
        cohortId: firstCohortId,
        notes: `Interested in ${firstProgramId}`,
      }),
    });
    assert(enrollmentRes.status === 201, "Enrollment submission failed contract check");
    const enrollmentBody = await enrollmentRes.json();
    assert(typeof enrollmentBody.enrollmentId === "string", "Enrollment response must contain enrollmentId");

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

    const adminOverviewRes = await fetch(`http://localhost:${port}/api/admin/overview`, {
      headers: { "x-api-key": "harmony-admin-key" },
    });
    assert(adminOverviewRes.ok, "Admin overview endpoint failed");
    const adminOverviewBody = await adminOverviewRes.json();
    assert(typeof adminOverviewBody.metrics?.enrollments === "number", "Admin overview metrics are invalid");

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
