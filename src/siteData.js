import { cohortCatalogSeed, programCatalogSeed } from "../shared/catalogSeed";

export const navItems = [
  { label: "Home", to: "/" },
  { label: "Programs", to: "/programs" },
  { label: "Schedule", to: "/schedule" },
  { label: "Admissions", to: "/admissions" },
  { label: "Contact", to: "/contact" },
];

export const contactDetails = {
  coordinator: "Huy Hoang",
  brand: "First Step Healthcare Academy",
  phone: "(949) 407-9581",
  phoneHref: "tel:+19494079581",
  email: "huyh@firststepha.org",
  emailHref: "mailto:huyh@firststepha.org",
  address: "2445 W. Chapman Ave. Suite 210, Orange, CA 92868",
  officeHours: "Monday to Friday | 8:00 AM to 5:00 PM",
};

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export const defaultPrograms = programCatalogSeed;

export const defaultCohorts = cohortCatalogSeed.map((cohort) => {
  const program = programCatalogSeed.find((item) => item.id === cohort.programId);
  const paymentPlanDepositCents = cohort.allowPaymentPlan ? cohort.paymentPlanDepositCents ?? 0 : null;
  const paymentPlanRemainingCents =
    paymentPlanDepositCents !== null ? Math.max(cohort.tuitionCents - paymentPlanDepositCents, 0) : null;

  return {
    ...cohort,
    programTitle: program?.title ?? cohort.programId,
    tuitionLabel: formatMoney(cohort.tuitionCents),
    paymentPlanDepositLabel: paymentPlanDepositCents !== null ? formatMoney(paymentPlanDepositCents) : null,
    paymentPlanRemainingCents,
    paymentPlanRemainingLabel: paymentPlanRemainingCents !== null ? formatMoney(paymentPlanRemainingCents) : null,
    remainingSeats: cohort.capacity,
  };
});

export const programMeta = {
  cna: {
    tag: "On-site",
    badge: "Flagship Track",
    detail: "Includes classroom instruction, lab skills, and supervised clinical preparation.",
  },
  "med-aide": {
    tag: "Bridge",
    badge: "Short Format",
    detail: "Designed for students who need a faster pathway into medication-support workflows.",
  },
  cpr: {
    tag: "Certification",
    badge: "Fast Turnaround",
    detail: "Built for direct renewal needs and employer-driven compliance timelines.",
  },
};

export const quickLinks = [
  {
    title: "Explore programs",
    detail: "Compare the current training options and decide which path matches your goals.",
    to: "/programs",
  },
  {
    title: "Review class dates",
    detail: "See weekday, weekend, evening, and open-session timing in one place.",
    to: "/schedule",
  },
  {
    title: "Start registration",
    detail: "Move from cohort selection into student intake and payment handoff.",
    to: "/register",
  },
];

export const supportItems = [
  {
    title: "Admissions planning support",
    detail: "Students can compare class timing, cohort fit, and document readiness before they commit.",
  },
  {
    title: "Registration follow-through",
    detail: "The enrollment flow keeps student information, cohort choice, and payment handoff tied together.",
  },
  {
    title: "Career-focused preparation",
    detail: "Training pages, published schedules, and direct support reduce friction between interest and start date.",
  },
];

export const admissionsSteps = [
  "Choose a program and review the published cohort options.",
  "Submit your inquiry or enrollment details for admissions review.",
  "Prepare identification, health documents, and screening requirements.",
  "Confirm payment, onboarding, and final class readiness before your start date.",
];

export const requirementItems = [
  "Minimum age of 16 years old",
  "Two forms of active government-issued identification",
  "Original Social Security card or verifiable ITIN documentation",
  "High school diploma or GED copy",
  "Recent physical exam and TB screening on school forms",
  "Live Scan or background screening completion",
  "AHA BLS or CPR certification before final exam readiness",
];

export const registrationChecklist = [
  "Student legal name and date of birth",
  "Current address and contact details",
  "Emergency contact information",
  "Preferred program and cohort",
  "Notes about schedule fit or document status",
];

export const tuitionItems = [
  {
    title: "CNA Cohorts",
    amount: "$1,960.00",
    detail: "Published price for the current weekday, weekend, and evening CNA offerings.",
  },
  {
    title: "Medication Aide",
    amount: "$2,020.00",
    detail: "Short-format evening training built for a faster bridge into medication support.",
  },
  {
    title: "CPR / BLS",
    amount: "$125.00",
    detail: "Single-day certification pricing for open-session scheduling.",
  },
];

export const miscFeeItems = [
  "Textbooks, uniforms, or supply kits vary by training path",
  "Screening and compliance costs are handled separately when required",
  "Payment timing is confirmed during admissions and enrollment review",
];

export const locationDetails = {
  classroom: "2445 W. Chapman Ave. Suite 210, Orange, CA 92868",
  clinicalCities: ["Orange", "Garden Grove", "Fullerton", "Lake Forest"],
  note: "Clinical site placement can vary by cohort and may change as training logistics are finalized.",
};

export const faqItems = [
  {
    question: "How early should a student reach out?",
    answer:
      "As soon as they know which track or start window they want. That gives admissions time to confirm seat availability and required documents.",
  },
  {
    question: "Do published cohort dates stay fixed?",
    answer:
      "They are the current operating dates, but final placement, logistics, and enrollment status can still affect the exact rollout.",
  },
  {
    question: "What usually slows down enrollment?",
    answer:
      "Missing identification, health forms, or screening paperwork. Students move faster when those items are prepared early.",
  },
];

export const footerGroups = [
  {
    title: "Quick Menu",
    items: [
      { label: "Home", to: "/" },
      { label: "Programs", to: "/programs" },
      { label: "Schedule", to: "/schedule" },
      { label: "Admissions", to: "/admissions" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Programs",
    items: [
      { label: "Certified Nurse Assistant", to: "/programs" },
      { label: "Medication Aide Fundamentals", to: "/programs" },
      { label: "CPR / BLS Certification", to: "/programs" },
    ],
  },
  {
    title: "Enrollment",
    items: [
      { label: "Register Now", to: "/register" },
      { label: "Class Schedule", to: "/schedule" },
      { label: "Admissions Checklist", to: "/admissions" },
    ],
  },
];
