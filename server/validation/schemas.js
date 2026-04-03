import { z } from "zod";
import { acceptedProgramIds } from "../constants/programs.js";

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
  program: z.preprocess(
    trimString,
    z.enum(acceptedProgramIds, {
      errorMap: () => ({ message: `program must be one of: ${acceptedProgramIds.join(", ")}` }),
    })
  ),
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
  notes: optionalString(600),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
