import { readFile } from "node:fs/promises";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, expected, label) {
  assert(source.includes(expected), `${label} is missing: ${expected}`);
}

async function readSource(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

async function run() {
  const siteData = await readSource("src/siteData.js");
  const admissionsPage = await readSource("src/pages/AdmissionsPage.jsx");
  const programsPage = await readSource("src/pages/ProgramsPage.jsx");
  const rewardsPage = await readSource("src/pages/RewardsGuidancePage.jsx");
  const registerPage = await readSource("src/pages/RegisterPage.jsx");
  const schedulePage = await readSource("src/pages/SchedulePage.jsx");
  const homePage = await readSource("src/pages/HomePage.jsx");
  const contactPage = await readSource("src/pages/ContactPage.jsx");
  const siteCtaBand = await readSource("src/components/SiteCtaBand.jsx");
  const policiesPage = await readSource("src/pages/PoliciesPage.jsx");
  const appEffects = await readSource("src/App.jsx");

  for (const expected of [
    "Rewards & Guidance",
    "/admissions#refund-policy",
    "withdrawalRefundPolicies",
    "Within 1 Day (24 hours) of enrollment",
    "Between Day 2 and Day 5 from the enrollment date",
    "Tuition Obligation for Deferred-Pay Students",
    "thirdPartyFeeItems",
  "11 weekly payments of $145.83",
    "30 days of withdrawal determination",
    "60 hours",
    "Collections and chargebacks",
    "referralProgramSteps",
    "referralRules",
    "Quick-reference guides",
    "Retention",
  ]) {
    assertIncludes(siteData, expected, "Shared site data");
  }

  const refundPolicyOccurrences = siteData.match(/title:/g)?.length ?? 0;
  assert(refundPolicyOccurrences > 20, "Shared site data should expose structured public content.");

  for (const anchor of ["refund-policy", "tuition-fees", "questions"]) {
    assertIncludes(admissionsPage, anchor, "Admissions page anchor");
  }

  for (const anchor of [
    "program-options",
    "program-requirements",
    "program-documentation",
    "program-fees",
    "refund-policy",
    "program-next-step",
  ]) {
    assertIncludes(programsPage, anchor, "Programs page anchor");
  }

  for (const anchor of [
    "free-resources",
    "referral-rewards",
    "retention-recognition",
    "study-tools",
    "career-support",
    "tuition",
    "callback",
  ]) {
    assertIncludes(rewardsPage, anchor, "Rewards page anchor");
  }

  for (const expected of [
    "Train with a friend",
    "Payment plan available",
    "California Department of Public Health approved",
    "CNA Career Starter Guide",
    "OC Nursing School Pathway Guide",
    "Request a support phone call",
    "Preferred callback window",
    "What would you like to discuss?",
    "Which best describes your goal?",
    "Request a Callback",
  ]) {
    assertIncludes(rewardsPage, expected, "Rewards landing-page content");
  }

  assertIncludes(registerPage, "/admissions#refund-policy", "Registration policy link");
  assertIncludes(registerPage, "/policies#terms", "Registration terms link");
  assertIncludes(registerPage, "/policies#privacy", "Registration privacy link");
  for (const expected of [
    "Eligibility check",
    "englishAcknowledged",
    "technologyAcknowledged",
    "clinicalTravelAcknowledged",
    "stateExamAcknowledged",
    "Electronic signature (type the student full name)",
    "Required refund policy review",
    "<RefundPolicy />",
  ]) {
    assertIncludes(registerPage, expected, "Registration eligibility and policy process");
  }
  assert(!registerPage.includes("$137.50"), "Registration page must not show the former weekly installment.");
  assert(!registerPage.includes("$275 / 2 weeks"), "Registration page must not show the former biweekly installment.");
  for (const expected of [
    "Certified Nurse Assistant Training Program",
    "Program dates: {content.programDates}",
    "Program length: {content.programLength}",
    "Online theory schedule: {content.onlineTheorySchedule}",
    "Clinical schedule: {content.clinicalSchedule}",
    "Clinical-site city: {content.clinicalSiteCity}",
    "Monday–Friday | 5:00 PM–9:00 PM | 3 weeks",
    "Monday–Friday | 7:00 AM–3:30 PM | 3 weeks",
    "Anaheim, California",
  ]) {
    assertIncludes(schedulePage, expected, "Weekday cohort schedule content");
  }
  assert(!homePage.includes("hero-quick-links"), "Removed hero shortcut row must stay removed.");
  for (const expected of [
    "Program length:</strong> 6 weeks (160 approved program hours)",
    "Live online theory:</strong> 60 hours",
    "Supervised clinical:</strong> 100 hours",
    "Clinical-site city:</strong> Anaheim, California",
    "Program fee:</strong> $2,000 total ($250 non-refundable registration fee + $1,750 tuition)",
  ]) {
    assertIncludes(homePage, expected, "AFL landing-page program disclosure");
  }
  for (const expected of [
    "2026–2027 cohort interest list",
    "Get early access to upcoming CNA cohorts.",
    "/contact#interest-list",
    "Join the priority waitlist",
    "Priority enrollment access",
  ]) {
    assertIncludes(siteCtaBand, expected, "Priority waitlist call to action");
  }
  for (const expected of [
    'id="interest-list"',
    "2026–2027 priority waitlist",
    "Seats remain subject to eligibility and availability.",
    "Join the Priority Waitlist",
  ]) {
    assertIncludes(contactPage, expected, "Priority waitlist form content");
  }
  for (const expected of [
    "Terms of Service",
    "Privacy Policy",
    "Refund and Cancellation Policy",
    "Automatic-Payment Authorization",
    "The Academy does not sell student personal information",
    "does not guarantee program completion",
    "<RefundPolicy />",
  ]) {
    assertIncludes(policiesPage, expected, "Public policy content");
  }
  assertIncludes(appEffects, '"/policies"', "Policy Center route");
  assertIncludes(appEffects, "location.hash", "Hash anchor scrolling support");
  assertIncludes(appEffects, "scrollIntoView", "Hash anchor scrolling behavior");
  assertIncludes(appEffects, 'const rawValue = type === "checkbox" ? checked : value', "Enrollment input normalization");
  assertIncludes(appEffects, "checkoutClientSecret={checkoutClientSecret}", "Embedded checkout handoff");
  assertIncludes(appEffects, '<Route path="*" element={<NotFoundPage />} />', "Not-found route");

  console.log("Content regression check passed.");
}

run().catch((error) => {
  console.error(`Content regression check failed: ${error.message}`);
  process.exit(1);
});
