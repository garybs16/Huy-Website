export const navItems = [
  { label: "Home", to: "/" },
  { label: "Programs", to: "/programs" },
  { label: "Schedule", to: "/schedule" },
  { label: "Admissions", to: "/admissions" },
  { label: "Contact", to: "/contact" },
];

export const defaultPrograms = [
  {
    id: "cna",
    title: "Certified Nurse Assistant",
    summary:
      "Foundational patient-care training built around classroom instruction, lab practice, and supervised clinical preparation.",
    duration: "4 to 6 weeks",
    schedule: "Weekday, weekend, and evening planning",
  },
  {
    id: "med-aide",
    title: "Medication Aide Fundamentals",
    summary:
      "A short-format pathway for caregivers and support staff preparing to handle medication workflows safely.",
    duration: "3 weeks",
    schedule: "Evening and Saturday planning",
  },
  {
    id: "cpr",
    title: "CPR / BLS Certification",
    summary:
      "Fast-turn certification sessions for healthcare workers who need a direct compliance-ready credential.",
    duration: "1 day",
    schedule: "Open-session model",
  },
];

export const defaultCohorts = [
  {
    id: "cna-weekday-apr-2026",
    programId: "cna",
    programTitle: "Certified Nurse Assistant",
    title: "Weekday Cohort",
    startDate: "2026-04-20",
    endDate: "2026-05-18",
    scheduleLabel: "Weekday",
    meetingPattern: "Monday to Friday | 7:00 AM to 3:30 PM",
    tuitionCents: 196000,
    tuitionLabel: "$1,960.00",
    capacity: 15,
    remainingSeats: 15,
  },
  {
    id: "cna-weekend-apr-2026",
    programId: "cna",
    programTitle: "Certified Nurse Assistant",
    title: "Weekend Cohort",
    startDate: "2026-04-25",
    endDate: "2026-06-28",
    scheduleLabel: "Weekend",
    meetingPattern: "Saturday and Sunday | 7:00 AM to 3:30 PM",
    tuitionCents: 196000,
    tuitionLabel: "$1,960.00",
    capacity: 15,
    remainingSeats: 15,
  },
  {
    id: "cna-evening-may-2026",
    programId: "cna",
    programTitle: "Certified Nurse Assistant",
    title: "Evening Cohort",
    startDate: "2026-05-25",
    endDate: "2026-07-10",
    scheduleLabel: "Evening",
    meetingPattern: "Monday to Friday | 4:00 PM to 8:00 PM",
    tuitionCents: 196000,
    tuitionLabel: "$1,960.00",
    capacity: 15,
    remainingSeats: 15,
  },
];

export const proofPoints = [
  "Live cohort seat tracking",
  "Online registration and payment handoff",
  "Direct enrollment support from a named contact",
  "Projected schedules presented clearly",
];

export const quickLinks = [
  {
    title: "Explore programs",
    detail: "See the core allied health options and compare durations.",
    to: "/programs",
  },
  {
    title: "Check cohorts",
    detail: "View schedules, projected start dates, and current seat counts.",
    to: "/schedule",
  },
  {
    title: "Start registration",
    detail: "Move directly into student enrollment and payment setup.",
    to: "/register",
  },
];

export const announcementCards = [
  {
    label: "Registration",
    value: "Now live",
    detail: "Students can move from cohort selection into a real enrollment record and payment handoff.",
  },
  {
    label: "Payments",
    value: "Checkout-ready",
    detail: "The registration flow supports a hosted payment step instead of only collecting interest.",
  },
  {
    label: "Operations",
    value: "Seat-aware",
    detail: "Cohort availability is visible up front so students can see what is open before they apply.",
  },
];

export const supportItems = [
  {
    title: "Cohort selection support",
    detail: "Help students compare weekday, weekend, and evening options before they commit to a start date.",
  },
  {
    title: "Registration follow-through",
    detail: "Capture enrollment details once, then move cleanly into payment and admissions follow-up.",
  },
  {
    title: "Document readiness",
    detail: "Keep required ID, health forms, and screening steps visible so students know what to prepare early.",
  },
];

export const requirementItems = [
  "Minimum age of 16",
  "Two forms of active government-issued identification",
  "Original Social Security card or verifiable ITIN documentation",
  "High school diploma or GED copy",
  "Recent physical exam and TB screening on school forms",
  "Live Scan / background screening completion",
  "AHA BLS / CPR certification before state exam readiness",
];

export const faqItems = [
  {
    question: "When should a student submit an inquiry?",
    answer:
      "As soon as they know which training path or cohort they want to explore. That gives admissions room to clarify timing, documents, and seat availability early.",
  },
  {
    question: "Are the class dates final?",
    answer:
      "They are presented as founding-cohort projections until operations, placements, and final enrollment logistics are fully locked.",
  },
  {
    question: "What should students prepare first?",
    answer:
      "Identification, education records, health forms, and background-screening readiness. Those are usually the first friction points in enrollment.",
  },
];
