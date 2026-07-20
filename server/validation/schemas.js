import { z } from "zod";

const phonePattern = /^[0-9+().\-\s]{7,25}$/;
const disallowedControlCharacterPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const usStateCodes = [
  "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "GU", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE",
  "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PA", "PR", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "VI", "WA", "WV", "WI", "WY",
];

function containsOnlySafeText(value) {
  return !disallowedControlCharacterPattern.test(value);
}

function trimString(value) {
  return typeof value === "string" ? value.normalize("NFC").trim() : value;
}

function requiredString(fieldName, min, max) {
  return z.preprocess(
    trimString,
    z
      .string({ required_error: `${fieldName} is required` })
      .min(min, `${fieldName} must be at least ${min} characters`)
      .max(max, `${fieldName} must be at most ${max} characters`)
      .refine(containsOnlySafeText, `${fieldName} contains unsupported control characters`)
  );
}

function optionalString(max) {
  return z
    .preprocess(
      trimString,
      z
        .string()
        .max(max, `Must be at most ${max} characters`)
        .refine(containsOnlySafeText, "Contains unsupported control characters")
        .optional()
    )
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

const sourceString = z.preprocess(
  trimString,
  z
    .enum([
      "contact-page-form",
      "home-free-handouts",
      "rewards-free-handouts",
      "rewards-guidance-landing",
      "waitlist-page-form",
    ])
    .optional()
);
const turnstileTokenString = optionalString(2048);
const publicProgramString = z.preprocess(
  (value) => (typeof value === "string" ? value.normalize("NFC").trim().toLowerCase() : value),
  z.literal("cna")
);

export const inquirySchema = z
  .object({
    fullName: requiredString("fullName", 2, 100),
    email: emailString,
    phone: phoneString,
    program: publicProgramString,
    message: requiredString("message", 10, 2000),
    source: sourceString,
    turnstileToken: turnstileTokenString,
  })
  .strict()
  .superRefine((value, context) => {
    if (["home-free-handouts", "rewards-free-handouts"].includes(value.source) && !value.phone) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Phone number is required" });
    }
  });

export const waitlistSchema = z.object({
  fullName: requiredString("fullName", 2, 100),
  email: emailString,
  phone: phoneString,
  notes: optionalString(600),
  source: sourceString,
  turnstileToken: turnstileTokenString,
}).strict();

const stateString = z.preprocess(
  trimString,
  z
    .string({ required_error: "state is required" })
    .transform((value) => value.toUpperCase())
    .pipe(z.enum(usStateCodes, { error: "State must be a valid US state or territory code" }))
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
    .refine(isValidCalendarDate, "dateOfBirth must be a real calendar date")
    .refine(
      (value) => value >= "1900-01-01" && value <= new Date().toISOString().slice(0, 10),
      "dateOfBirth must be between 1900-01-01 and today"
    )
);

function isValidCalendarDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export const enrollmentSchema = z.object({
  studentFullName: requiredString("studentFullName", 2, 100),
  email: emailString,
  phone: z.preprocess(
    trimString,
    z.string({ required_error: "phone is required" }).min(7).max(25).refine((value) => phonePattern.test(value), "Phone number format is invalid")
  ),
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
  paymentOption: z.enum(["full", "weekly", "biweekly"]).default("full"),
  policyAcknowledged: z.literal(true, { errorMap: () => ({ message: "Policy acknowledgment is required" }) }),
  automaticPaymentAuthorized: z.boolean().default(false),
  checkoutMode: z.enum(["redirect", "embedded"]).default("redirect"),
  notes: optionalString(600),
  turnstileToken: turnstileTokenString,
}).strict().superRefine((value, context) => {
  if (["weekly", "biweekly"].includes(value.paymentOption) && !value.automaticPaymentAuthorized) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["automaticPaymentAuthorized"],
      message: "Automatic-payment authorization is required for a payment plan",
    });
  }
});

export const enrollmentPaymentSessionSchema = z.object({
  email: emailString,
  checkoutMode: z.enum(["redirect", "embedded"]).default("redirect"),
}).strict();

export const enrollmentIdSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export const adminLoginSchema = z.object({
  username: requiredString("username", 2, 120),
  password: requiredString("password", 8, 200),
  totpCode: z.preprocess(trimString, z.string().regex(/^\d{6}$/, "Authenticator code must be 6 digits").optional()),
}).strict();

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
    .refine(isValidCalendarDate, "Date must be a real calendar date")
);

export const adminProgramSchema = z.object({
  id: slugString,
  title: requiredString("title", 2, 120),
  summary: requiredString("summary", 10, 600),
  duration: requiredString("duration", 2, 80),
  schedule: requiredString("schedule", 2, 120),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
}).strict();

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
  .strict()
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

export const adminResourceIdSchema = slugString;
