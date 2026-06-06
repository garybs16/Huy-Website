import { cohortCatalogSeed, programCatalogSeed } from "../shared/catalogSeed";

export const navItems = [
  { label: "Home", to: "/" },
  { label: "Programs", to: "/programs" },
  { label: "Rewards", to: "/rewards-guidance" },
  { label: "Schedule", to: "/schedule" },
  { label: "Payment", to: "/payment" },
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
    title: "Review class timing",
    detail: "See weekday, weekend, evening, and open-session formats in one place.",
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

export const rewardsGuidanceItems = [
  {
    title: "Referral Incentives",
    detail:
      "Both the referrer and the referred student can receive $100 when an eligible referred student enrolls. There is no referral limit.",
  },
  {
    title: "Retention Incentives",
    detail:
      "Eligible graduates may qualify for retention-based rewards after completing the program and continuing into healthcare employment through participating partners.",
  },
  {
    title: "Study Toolkit",
    detail:
      "Students receive CNA study guides, skills checklists, quick-reference sheets, clinical preparation guides, and exam review resources.",
  },
  {
    title: "Career Guidance",
    detail:
      "First Step supports students with CNA job-readiness guidance, resume and interview preparation, workplace professionalism, and future nursing pathway planning.",
  },
];

export const workforceProjectionStats = [
  {
    value: "2.0M",
    label: "new jobs projected",
    detail: "BLS projects about 2 million new healthcare and social assistance jobs by 2034.",
  },
  {
    value: "2.7x",
    label: "growing faster",
    detail: "Healthcare is projected to grow much faster than overall wage and salary employment.",
  },
  {
    value: "72.5M",
    label: "adults age 65+ by 2034",
    detail: "An aging population is expected to increase demand for healthcare and long-term care services.",
  },
];

export const industryGrowthRows = [
  { label: "Healthcare and social assistance", percent: 8.4, change: "1,982.7k" },
  { label: "Professional, scientific, and technical services", percent: 7.5, change: "812.5k" },
  { label: "Information", percent: 6.5, change: "192.3k" },
  { label: "Arts, entertainment, and recreation", percent: 5.1, change: "132.6k" },
  { label: "Utilities", percent: 4.9, change: "28.7k" },
  { label: "Construction", percent: 4.4, change: "360.5k" },
  { label: "Accommodation and food services", percent: 3.9, change: "553.6k" },
  { label: "Total wage and salary employment", percent: 3.1, change: "4,995.4k" },
];

export const admissionsSteps = [
  "Choose a program and review the published cohort options.",
  "Submit your inquiry or enrollment details for admissions review.",
  "Prepare identification, health documents, and screening requirements.",
  "Confirm payment, onboarding, and final class readiness before your start date.",
];

export const requirementItems = [
  "Minimum age of 16 years old. Student applicants under 18 must be accompanied by a parent or legal guardian at enrollment.",
  "Two forms of active government-issued identification",
  "Original Social Security card or verifiable ITIN documentation",
  "High school diploma or GED copy",
  "Recent physical exam and TB screening on school forms, completed within 90 days of the program start date",
  "Proof of flu vaccination or exemption letter, when required",
  "Proof of COVID-19 vaccination, declination letter, or physician exemption letter",
  "Live Scan or background screening completion before the start of training",
  "American Heart Association BLS certification before the start of the program",
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
    amount: "$1,750 + $250",
    detail:
      "Official CNA tuition is $1,750 plus a $250 non-refundable registration fee, for a $2,000 program total.",
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
  "$250 registration fee is non-refundable and may be used as the payment-plan deposit",
  "Payment plan example: $250 registration fee deposit, then $1,750 remaining balance through scheduled installments",
  "Additional possible costs may include uniform or dress code items, textbooks or learning materials, health clearance documents, TB testing, CPR/BLS certification, Live Scan, and state testing fees",
  "Payment deadlines are provided before enrollment and must stay current for continued participation",
];

export const locationDetails = {
  classroom: "2445 W. Chapman Ave. Suite 210, Orange, CA 92868",
  clinicalCities: ["Orange", "Anaheim", "Santa Ana", "Garden Grove", "Fullerton", "Other nearby cities as assigned"],
  note: "Clinical site placement depends on cohort schedule, facility availability, student placement needs, and program requirements. Students are responsible for transportation.",
};

export const courseModules = [
  ["Introduction to Nurse Assistant", "CNA role, professional expectations, scope of practice, certification pathway, confidentiality, and healthcare-team support."],
  ["Patients' / Residents' Rights", "Resident dignity, privacy, choice, safety, and how to recognize and report rights concerns."],
  ["Interpersonal Skills", "Respectful communication with residents, families, instructors, nurses, and care teams."],
  ["Catastrophe and Unusual Occurrences", "Emergency preparedness, fire and disaster procedures, hazard reporting, and the CNA role during urgent events."],
  ["Body Mechanics", "Safe movement techniques for transfers, positioning, lifting, turning, and ambulation."],
  ["Medical and Surgical Asepsis", "Hand hygiene, standard precautions, PPE, linen handling, waste disposal, and infection control."],
  ["Weights and Measures", "Intake, output, weight, volume, metric units, and military time."],
  ["Patient Care Skills", "Bathing, dressing, grooming, oral care, skin observation, toileting, feeding support, and repositioning."],
  ["Patient Care Procedures", "Bedmaking, specimen collection support, intake and output, tubing awareness, admission support, and reporting abnormal findings."],
  ["Vital Signs", "Temperature, pulse, respirations, blood pressure, and when to report unusual findings."],
  ["Nutrition", "Meal assistance, hydration, diet-order awareness, aspiration precautions, and feeding techniques."],
  ["Emergency Procedures", "Recognizing distress, responding to choking or urgent situations, calling for help, and staying within the CNA role."],
  ["Long-Term Care Patient", "Support for residents with chronic conditions, dementia, emotional needs, and long-term care needs."],
  ["Rehabilitative Nursing", "Helping residents maintain independence, mobility, strength, range of motion, and daily-activity participation."],
  ["Observation and Charting", "Observing resident changes, reporting concerns, documenting care accurately, and factual charting."],
  ["Death and Dying", "Respectful, compassionate support for residents and families during end-of-life care."],
  ["Abuse Prevention, Recognition, and Reporting", "How to prevent, recognize, and report abuse, neglect, exploitation, unsafe conduct, and resident-rights violations."],
];

export const programRequirementSections = [
  {
    title: "Program Length",
    items: [
      "Live online theory instruction: 60 hours",
      "In-person supervised clinical training: 100 hours",
      "Total program length: 160 hours",
      "Most cohorts are expected to be completed in approximately 6 to 12 weeks, depending on the approved class calendar, clinical site availability, holidays, instructor availability, and student document completion.",
      "Program completion requires all required theory hours, clinical hours, quizzes, skills requirements, remediation if assigned, and program documentation.",
    ],
  },
  {
    title: "Grade and Passing Requirements",
    items: [
      "Attend all required theory, skills, and clinical sessions.",
      "Complete all required coursework, assignments, quizzes, and exams.",
      "Meet the program minimum passing score of 70% for quizzes, exams, and final evaluations.",
      "Demonstrate safe and competent performance of required nurse assistant skills.",
      "Follow online classroom, skills training, and clinical site rules.",
    ],
  },
  {
    title: "Course Deadlines",
    items: [
      "Deadlines may apply to enrollment documents, payments, technology setup, health and clinical clearances, assignments, quizzes, exams, skills check-offs, clinical participation, and final completion requirements.",
      "Failure to meet required deadlines may delay or prevent clinical training or program completion.",
      "Students are responsible for checking email, program announcements, and instructor communications regularly.",
    ],
  },
  {
    title: "Technology Requirements",
    items: [
      "Reliable computer, laptop, or tablet",
      "Reliable internet connection",
      "Working webcam and microphone or audio access",
      "Current browser such as Chrome, Edge, Safari, or Firefox",
      "Active email address and access to the online learning platform and video conferencing system",
    ],
  },
  {
    title: "Attendance and Professional Conduct",
    items: [
      "Students must arrive on time, participate actively, complete assigned work, communicate professionally, follow instructor directions, and follow clinical site policies.",
      "Students must maintain resident privacy and dignity, demonstrate safe care practices, and follow infection control and safety standards.",
      "Unsafe conduct, unprofessional behavior, resident-rights violations, dishonesty, repeated lateness, missed training hours, or failure to follow program policies may affect program continuation or completion.",
    ],
  },
  {
    title: "Student Responsibility",
    items: [
      "Students are responsible for technology readiness, attendance, coursework completion, skills competency, clinical participation, required documents, payment deadlines, professional behavior, program communication, and completion of all requirements by stated deadlines.",
      "Students with questions should contact First Step Healthcare Academy before enrollment or before the start of class.",
    ],
  },
];

export const quizQuestions = [
  ["What kind of life are you quietly hoping for?", ["A meaningful life", "A stable life", "A successful professional life", "A free and independent life"]],
  ["Which version of yourself feels closest to who you want to become?", ["Someone who helps others", "Someone with a secure future", "Someone constantly growing career", "Someone fully independent"]],
  ["Which feeling would bring you the most relief right now?", ["Feeling loved by family and friends", "Feeling financially secure", "Feeling progressive about my future career", "Feeling free from limitations"]],
  ["Which energy feels most like you?", ["Gentle and caring", "Calm and dependable", "Motivated and ambitious", "Quiet and independent"]],
  ["Which type of environment usually helps you feel most like yourself?", ["Warm and people-centered", "Calm and dependable", "Motivating and growth-oriented", "Quiet and independent"]],
  ["What kind of pressure affects you most?", ["Emotional disconnection", "Financial uncertainty", "Feeling stuck", "Feeling restricted"]],
  ["Which version of success feels most fulfilling?", ["Helping others", "Feeling secure", "Becoming my best self", "Living independently"]],
  ["What kind of strength are you most proud of having?", ["Caring for others", "Being dependable", "Pushing through challenges", "Standing on your own"]],
  ["Which thought motivates you most deeply?", ["I want to help people", "I want a stable future", "I want to grow", "I want control over my life"]],
  ["Which statement feels closest to your heart?", ["I want to help people", "I want stability", "I want to be respected", "I want freedom"]],
  ["Which future would make you feel proudest of yourself?", ["A future where I positively impact others", "A future where I feel secure and grounded", "A future where I keep growing", "A future where I stay true to myself"]],
  ["What path do you think your future self wants you to continue pursuing?", ["A life centered around helping others", "A life built on stability and security", "A life focused on achievement and growth", "A life filled with independence and freedom"]],
];

export const quizResultCategories = [
  {
    key: "helping-heart",
    title: "The Helping Heart",
    core: "Meaning and purpose",
    summary:
      "Your answers suggest that you are naturally drawn toward connection, compassion, and being useful in moments that matter. People with similar qualities often feel fulfilled in work where care, patience, and human presence are genuinely valued.",
  },
  {
    key: "quiet-achiever",
    title: "The Quiet Achiever",
    core: "Stability and security",
    summary:
      "Your answers suggest that you value a grounded path, dependable progress, and a future that feels secure. Those qualities can align well with healthcare environments where consistency, responsibility, and trust matter every day.",
  },
  {
    key: "rising-professional",
    title: "The Rising Professional",
    core: "Growth and achievement",
    summary:
      "Your answers suggest that you are motivated by growth, respect, and the feeling of becoming more capable over time. CNA training can be a practical first step for people who want hands-on experience while building toward larger healthcare goals.",
  },
  {
    key: "independent-dreamer",
    title: "The Independent Dreamer",
    core: "Freedom and independence",
    summary:
      "Your answers suggest that you care deeply about building a life with more control, freedom, and self-direction. A healthcare pathway can offer a steady foundation while still giving you room to keep shaping what comes next.",
  },
];

export const faqItems = [
  {
    question: "How early should a student reach out?",
    answer:
      "As soon as they know which track or start window they want. That gives admissions time to confirm seat availability and required documents.",
  },
  {
    question: "Do published cohort dates stay fixed?",
    answer:
      "Public cohort dates are currently marked coming soon while the school finalizes approved calendars and clinical logistics.",
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
      { label: "Rewards & Guidance", to: "/rewards-guidance" },
      { label: "Career Quiz", to: "/career-quiz" },
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
      { label: "Payment Portal", to: "/payment" },
      { label: "Referral Rewards", to: "/rewards-guidance" },
      { label: "Pre-CNA Quiz", to: "/career-quiz" },
      { label: "Class Schedule", to: "/schedule" },
      { label: "Admissions Checklist", to: "/admissions" },
    ],
  },
];
