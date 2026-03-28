export const programs = [
  {
    id: "cna",
    title: "Certified Nurse Assistant",
    summary:
      "Accelerated classroom and lab training with supervised clinical rotations built for direct patient-care roles.",
    duration: "4-6 weeks",
    schedule: "Weekday, evening, and weekend cohorts",
  },
  {
    id: "med-aide",
    title: "Medication Aide Fundamentals",
    summary:
      "Safe medication administration training designed for caregivers and support staff expanding responsibilities.",
    duration: "3 weeks",
    schedule: "Evening and Saturday formats",
  },
  {
    id: "cpr",
    title: "CPR / BLS Certification",
    summary:
      "AHA-aligned emergency response certification for healthcare professionals and teams needing immediate compliance.",
    duration: "1 day",
    schedule: "Daily open sessions",
  },
];

export const acceptedProgramIds = programs.map((program) => program.id);
