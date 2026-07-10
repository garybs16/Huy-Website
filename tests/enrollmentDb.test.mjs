import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { EnrollmentDatabase } from "../server/lib/enrollmentDb.js";

function enrollmentInput(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    studentFullName: "Test Student",
    email: `student-${crypto.randomUUID()}@example.com`,
    phone: "949-555-0100",
    dateOfBirth: "2001-02-03",
    addressLine1: "100 Test Avenue",
    city: "Irvine",
    state: "CA",
    postalCode: "92614",
    emergencyContactName: "Test Contact",
    emergencyContactPhone: "949-555-0101",
    programId: "test-program",
    cohortId: "test-cohort",
    notes: "Automated enrollment database test.",
    status: "payment_setup",
    paymentStatus: "payment_setup",
    paymentOption: "deposit",
    paymentAmountCents: 25_000,
    tuitionTotalCents: 100_000,
    balanceDueCents: 75_000,
    seatHoldExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

test("EnrollmentDatabase stores enrollment records and protects cohort capacity", async (t) => {
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "first-step-db-test-"));
  const db = new EnrollmentDatabase(path.join(tempDataDir, "enrollment.db"));

  t.after(async () => {
    db.close();
    await rm(tempDataDir, { recursive: true, force: true });
  });

  db.createProgram({
    id: "test-program",
    title: "Test Program",
    summary: "Program for database tests.",
    duration: "4 weeks",
    schedule: "Weekday",
    isActive: true,
    sortOrder: 1,
  });

  db.createCohort({
    id: "test-cohort",
    programId: "test-program",
    title: "Test Cohort",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    scheduleLabel: "Weekday",
    meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM",
    tuitionCents: 100_000,
    allowPaymentPlan: true,
    paymentPlanDepositCents: 25_000,
    capacity: 1,
    isActive: true,
    sortOrder: 1,
  });

  const enrollment = db.createEnrollment(enrollmentInput());

  assert.equal(enrollment.paymentOption, "deposit");
  assert.equal(enrollment.paymentAmountCents, 25_000);
  assert.equal(enrollment.balanceDueCents, 75_000);

  assert.throws(
    () => db.createEnrollment(enrollmentInput({ id: crypto.randomUUID() })),
    /This cohort is full/
  );

  db.markPaymentSetupFailed(enrollment.id, "Release hold for test.");
  const replacement = db.createEnrollment(enrollmentInput({ id: crypto.randomUUID() }));

  assert.equal(replacement.paymentStatus, "payment_setup");

  const exportData = db.exportOperationalData();
  assert.equal(exportData.enrollments.length, 2);
  assert.ok(exportData.programs.some((program) => program.id === "test-program"));
});
