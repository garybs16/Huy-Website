import { z } from "zod";

const phonePattern = /^[0-9+().\-\s]{7,25}$/;

function trimString(value) {
  return typeof value === "string" ? value.trim() : value;
}

function requiredString(fieldName, min, max) {
  return z.preprocess(
    trimString,
    z
      .string({ required_error: `${fieldName} is required` })
      .min(min, `${fieldName} must be at least ${min} characters`)
      .max(max, `${fieldName} must be at most ${max} characters`)
  );
}

function optionalString(max) {
  return z
    .preprocess(trimString, z.string().max(max, `Must be at most ${max} characters`).optional())
    .transform((value) => (value ? value : undefined));
}

const emailString = z.preprocess(
  trimString,
  z
    .string({ required_error: "email is required" })
    .email("Email must be valid")
    .max(160, "Email must be at most 160 characters")
);

const phoneString = z
  .preprocess(trimString, z.string().max(25, "Phone must be at most 25 characters").optional())
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || phonePattern.test(value), "Phone number format is invalid");

const sourceString = optionalString(80);

export const inquirySchema = z.object({
  fullName: requiredString("fullName", 2, 100),
  email: emailString,
  phone: phoneString,
  program: requiredString("program", 2, 100),
  message: requiredString("message", 10, 2000),
  source: sourceString,
});

export const waitlistSchema = z.object({
  fullName: requiredString("fullName", 2, 100),
  email: emailString,
  phone: phoneString,
  notes: optionalString(600),
  source: sourceString,
});

const stateString = z.preprocess(
  trimString,
  z
    .string({ required_error: "state is required" })
    .length(2, "State must be a 2-letter code")
    .transform((value) => value.toUpperCase())
);

const postalCodeString = z.preprocess(
  trimString,
  z
    .string({ required_error: "postalCode is required" })
    .regex(/^\d{5}(-\d{4})?$/, "Postal code must be a valid US ZIP code")
);

const birthDateString = z.preprocess(
  trimString,
  z
    .string({ required_error: "dateOfBirth is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dateOfBirth must use YYYY-MM-DD format")
);

export const enrollmentSchema = z.object({
  studentFullName: requiredString("studentFullName", 2, 100),
  email: emailString,
  phone: phoneString,
  dateOfBirth: birthDateString,
  addressLine1: requiredString("addressLine1", 5, 160),
  city: requiredString("city", 2, 80),
  state: stateString,
  postalCode: postalCodeString,
  emergencyContactName: requiredString("emergencyContactName", 2, 100),
  emergencyContactPhone: z.preprocess(
    trimString,
    z
      .string({ required_error: "emergencyContactPhone is required" })
      .min(7, "Emergency contact phone must be at least 7 characters")
      .max(25, "Emergency contact phone must be at most 25 characters")
      .refine((value) => phonePattern.test(value), "Emergency contact phone format is invalid")
  ),
  cohortId: requiredString("cohortId", 2, 100),
  paymentOption: z.enum(["full", "deposit"]).default("full"),
  notes: optionalString(600),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminLoginSchema = z.object({
  username: requiredString("username", 2, 120),
  password: requiredString("password", 8, 200),
});

const slugString = z.preprocess(
  trimString,
  z
    .string({ required_error: "id is required" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be lowercase letters, numbers, and hyphens only")
    .min(2, "id must be at least 2 characters")
    .max(80, "id must be at most 80 characters")
);

const isoDateString = z.preprocess(
  trimString,
  z
    .string({ required_error: "date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format")
);

export const adminProgramSchema = z.object({
  id: slugString,
  title: requiredString("title", 2, 120),
  summary: requiredString("summary", 10, 600),
  duration: requiredString("duration", 2, 80),
  schedule: requiredString("schedule", 2, 120),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});

export const adminCohortSchema = z
  .object({
    id: slugString,
    programId: slugString,
    title: requiredString("title", 2, 120),
    startDate: isoDateString,
    endDate: isoDateString,
    scheduleLabel: requiredString("scheduleLabel", 2, 80),
    meetingPattern: requiredString("meetingPattern", 2, 160),
    tuitionCents: z.coerce.number().int().min(0).max(10_000_000),
    allowPaymentPlan: z.boolean().default(false),
    paymentPlanDepositCents: z.union([z.coerce.number().int().min(0).max(10_000_000), z.null()]).default(null),
    capacity: z.coerce.number().int().min(1).max(1000),
    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  })
  .superRefine((value, context) => {
    if (!value.allowPaymentPlan) {
      return;
    }

    if (value.paymentPlanDepositCents === null || value.paymentPlanDepositCents <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentPlanDepositCents"],
        message: "paymentPlanDepositCents must be set when payment plans are enabled",
      });
    }

    if (
      value.paymentPlanDepositCents !== null &&
      value.paymentPlanDepositCents >= value.tuitionCents
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentPlanDepositCents"],
        message: "paymentPlanDepositCents must be less than tuitionCents",
      });
    }
  });
