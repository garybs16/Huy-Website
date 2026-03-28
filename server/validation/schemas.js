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

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
