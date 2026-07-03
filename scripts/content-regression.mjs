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
  const appEffects = await readSource("src/App.jsx");

  for (const expected of [
    "Rewards & Guidance",
    "/admissions#refund-policy",
    "withdrawalRefundPolicies",
    "Within 1 Day (24 hours) of enrollment",
    "Between Day 2 and Day 5 from the enrollment date",
    "Deferred-Pay Students to SisuCare",
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

  for (const anchor of ["refund-policy", "tuition-fees", "locations", "questions"]) {
    assertIncludes(admissionsPage, anchor, "Admissions page anchor");
  }

  for (const anchor of [
    "program-options",
    "program-requirements",
    "program-documentation",
    "program-fees",
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
  assertIncludes(appEffects, "location.hash", "Hash anchor scrolling support");
  assertIncludes(appEffects, "scrollIntoView", "Hash anchor scrolling behavior");

  console.log("Content regression check passed.");
}

run().catch((error) => {
  console.error(`Content regression check failed: ${error.message}`);
  process.exit(1);
});
