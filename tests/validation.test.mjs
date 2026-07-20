import assert from "node:assert/strict";
import test from "node:test";
import {
  adminCohortSchema,
  enrollmentSchema,
  inquirySchema,
  waitlistSchema,
} from "../server/validation/schemas.js";

test("public submission schemas trim values and reject invalid contact data", () => {
  const inquiry = inquirySchema.parse({
    fullName: "  Jane Student  ",
    email: "  jane@example.com  ",
    phone: " (949) 555-0100 ",
    program: " CNA ",
    message: " I would like more information about enrollment. ",
  });

  assert.equal(inquiry.fullName, "Jane Student");
  assert.equal(inquiry.email, "jane@example.com");
  assert.equal(inquiry.program, "cna");
  assert.throws(
    () =>
      waitlistSchema.parse({
        fullName: "Jane Student",
        email: "not-an-email",
      }),
    /Email must be valid/
  );
});

test("enrollment schema normalizes state and validates required student details", () => {
  const enrollment = enrollmentSchema.parse({
    studentFullName: "Jordan Student",
    email: "jordan@example.com",
    phone: "949-555-0102",
    dateOfBirth: "2000-01-15",
    addressLine1: "123 Main Street",
    city: "Orange",
    state: "ca",
    postalCode: "92868",
    emergencyContactName: "Casey Contact",
    emergencyContactPhone: "949-555-0103",
    cohortId: "cna-weekday",
    paymentOption: "weekly",
    policyAcknowledged: true,
    automaticPaymentAuthorized: true,
    checkoutMode: "embedded",
  });

  assert.equal(enrollment.state, "CA");
  assert.equal(enrollment.paymentOption, "weekly");
  assert.equal(enrollment.checkoutMode, "embedded");
  assert.throws(
    () =>
      enrollmentSchema.parse({
        ...enrollment,
        postalCode: "bad-zip",
      }),
    /Postal code must be a valid US ZIP code/
  );
  assert.throws(
    () => enrollmentSchema.parse({ ...enrollment, state: "ZZ" }),
    /State must be a valid US state or territory code/
  );
  assert.throws(
    () => enrollmentSchema.parse({ ...enrollment, dateOfBirth: "2000-02-31" }),
    /real calendar date/
  );
  assert.throws(
    () => enrollmentSchema.parse({ ...enrollment, unexpected: "field" }),
    /Unrecognized key/
  );
});

test("admin cohort schema enforces date and payment-plan rules", () => {
  const valid = adminCohortSchema.parse({
    id: "summer-cohort",
    programId: "cna",
    title: "Summer Cohort",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    scheduleLabel: "Weekday",
    meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM",
    tuitionCents: 190_000,
    allowPaymentPlan: true,
    paymentPlanDepositCents: 25_000,
    capacity: 20,
  });

  assert.equal(valid.paymentPlanDepositCents, 25_000);
  assert.throws(
    () =>
      adminCohortSchema.parse({
        ...valid,
        endDate: "2026-07-31",
      }),
    /endDate must be on or after startDate/
  );
  assert.throws(
    () =>
      adminCohortSchema.parse({
        ...valid,
        paymentPlanDepositCents: 190_000,
      }),
    /paymentPlanDepositCents must be less than tuitionCents/
  );
});
