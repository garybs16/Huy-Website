import { randomInt } from "node:crypto";

// Both sides of a referral are worth $100: the referred student gets it off tuition,
// the referrer gets it paid out once first-day attendance is confirmed.
export const REFERRAL_CREDIT_CENTS = 10_000;
export const REFERRAL_REWARD_CENTS = 10_000;

export const REFERRAL_CODE_PREFIX = "FSHA";
const CODE_BODY_LENGTH = 5;

// No 0/O/1/I/L. Codes get read aloud, written on paper, and typed by someone who
// only saw them once, so ambiguous glyphs cost more than the extra entropy is worth.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_PATTERN = new RegExp(`^${REFERRAL_CODE_PREFIX}[${CODE_ALPHABET}]{${CODE_BODY_LENGTH}}$`);

export function generateReferralCode() {
  let body = "";

  for (let index = 0; index < CODE_BODY_LENGTH; index += 1) {
    body += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }

  return `${REFERRAL_CODE_PREFIX}-${body}`;
}

// Accepts what a person actually types: lower case, missing dash, stray spaces.
// Returns the canonical stored form, or null when it could never be a real code.
export function normalizeReferralCode(value) {
  if (typeof value !== "string") {
    return null;
  }

  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (!CODE_PATTERN.test(compact)) {
    return null;
  }

  return `${REFERRAL_CODE_PREFIX}-${compact.slice(REFERRAL_CODE_PREFIX.length)}`;
}

export function isReferralCodeShaped(value) {
  return normalizeReferralCode(value) !== null;
}

// A code is issued the moment an enrollment row is created, before anyone has paid
// anything, so the row it points at can still die: the Stripe session expires unused,
// or the session could never be created at all. Neither of those referrers ever became
// a real prospective student, and releaseExpiredSeatHolds() guarantees every abandoned
// enrollment converges to one of these two states within one seat-hold window -- so
// this set reliably catches an abandoned cart without a delay window of its own.
// installment_failed is deliberately absent: that referrer already has a payment plan
// running, which is exactly the kind of real enrollment this program is meant to reward.
const DEAD_REFERRER_PAYMENT_STATUSES = new Set(["checkout_expired", "payment_failed"]);

/**
 * Applies the published referral rules to a submitted code.
 *
 * Returns { ok: true, referrer } when the credit should be granted, or
 * { ok: false, reason } with a message safe to show the student.
 */
export function evaluateReferralCode({ submittedCode, referrer, referredEmail }) {
  const normalized = normalizeReferralCode(submittedCode);

  if (!normalized) {
    return { ok: false, reason: "That referral code is not a valid code. Check the code and try again." };
  }

  if (!referrer || DEAD_REFERRER_PAYMENT_STATUSES.has(referrer.paymentStatus)) {
    return { ok: false, reason: "That referral code was not found. Check the code and try again." };
  }

  // "Students may not refer themselves." The email is the only identity we hold at
  // enrollment time, so it is what self-referral is measured against.
  if (
    referredEmail &&
    referrer.email &&
    referrer.email.trim().toLowerCase() === referredEmail.trim().toLowerCase()
  ) {
    return { ok: false, reason: "A referral code cannot be used on your own enrollment." };
  }

  return { ok: true, referrer, code: normalized };
}
