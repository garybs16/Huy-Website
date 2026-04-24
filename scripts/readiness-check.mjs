import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { EnrollmentDatabase } from "../server/lib/enrollmentDb.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function enrollmentInput(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    studentFullName: "Readiness Student",
    email: `readiness-${crypto.randomUUID()}@example.com`,
    phone: "949-555-0199",
    dateOfBirth: "1998-04-12",
    addressLine1: "100 Readiness Way",
    city: "Orange",
    state: "CA",
    postalCode: "92868",
    emergencyContactName: "Readiness Contact",
    emergencyContactPhone: "949-555-0198",
    programId: "readiness-program",
    cohortId: "readiness-cohort",
    notes: "Readiness check enrollment.",
    status: "payment_setup",
    paymentStatus: "payment_setup",
    paymentOption: "full",
    paymentAmountCents: 100000,
    tuitionTotalCents: 100000,
    balanceDueCents: 0,
    seatHoldExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

async function run() {
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "pcahi-readiness-"));
  const db = new EnrollmentDatabase(path.join(tempDataDir, "enrollment.db"));

  try {
    db.createProgram({
      id: "readiness-program",
      title: "Readiness Program",
      summary: "Program used for production readiness checks.",
      duration: "1 week",
      schedule: "Weekday",
      isActive: true,
      sortOrder: 1,
    });

    db.createCohort({
      id: "readiness-cohort",
      programId: "readiness-program",
      title: "Readiness Cohort",
      startDate: "2026-08-01",
      endDate: "2026-08-07",
      scheduleLabel: "Weekday",
      meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM",
      tuitionCents: 100000,
      allowPaymentPlan: false,
      paymentPlanDepositCents: null,
      capacity: 1,
      isActive: true,
      sortOrder: 1,
    });

    const firstEnrollment = db.createEnrollment(enrollmentInput());
    assert(firstEnrollment.paymentStatus === "payment_setup", "Initial Stripe setup hold was not stored.");

    let capacityError = "";
    try {
      db.createEnrollment(enrollmentInput());
    } catch (error) {
      capacityError = error.message;
    }

    assert(
      capacityError === "This cohort is full. Please choose another class date.",
      "Active payment setup hold did not reserve cohort capacity."
    );

    db.markPaymentSetupFailed(firstEnrollment.id, "Readiness check released setup hold.");
    const replacementEnrollment = db.createEnrollment(enrollmentInput({ id: crypto.randomUUID() }));
    assert(replacementEnrollment.id, "Capacity was not released after payment setup failure.");

    db.createCohort({
      id: "readiness-expiring-cohort",
      programId: "readiness-program",
      title: "Readiness Expiring Cohort",
      startDate: "2026-09-01",
      endDate: "2026-09-07",
      scheduleLabel: "Weekday",
      meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM",
      tuitionCents: 100000,
      allowPaymentPlan: false,
      paymentPlanDepositCents: null,
      capacity: 1,
      isActive: true,
      sortOrder: 2,
    });

    const expiredEnrollment = db.createEnrollment(
      enrollmentInput({
        cohortId: "readiness-expiring-cohort",
        seatHoldExpiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
      })
    );
    db.releaseExpiredSeatHolds();
    const expiredRecord = db.getEnrollmentById(expiredEnrollment.id);
    assert(expiredRecord.paymentStatus === "checkout_expired", "Expired setup hold was not released.");

    const exportData = db.exportOperationalData();
    assert(exportData.enrollments.length >= 3, "Operational export did not include enrollments.");
    assert(exportData.programs.some((item) => item.id === "readiness-program"), "Operational export missed programs.");

    const backup = await db.createBackup();
    assert(existsSync(path.join(tempDataDir, "backups", backup.filename)), "SQLite backup file was not created.");

    console.log("Readiness check passed.");
  } finally {
    db.close();
    await rm(tempDataDir, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(`Readiness check failed: ${error.message}`);
  process.exit(1);
});
