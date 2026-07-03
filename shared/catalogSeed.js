export const programCatalogSeed = [
  {
    id: "cna",
    title: "Certified Nurse Assistant",
    summary:
      "Structured classroom, lab, and supervised clinical training built for direct patient-care roles.",
    duration: "6-12 weeks",
    schedule: "Approved weekday schedule with online theory and in-person clinical training listed separately",
  },
];

export const cohortCatalogSeed = [
  {
    id: "cna-weekday-apr-2026",
    programId: "cna",
    title: "Weekday Cohort",
    startDate: "2026-04-20",
    endDate: "2026-05-18",
    scheduleLabel: "Weekday",
    meetingPattern: "Monday to Friday | 7:00 AM to 3:30 PM",
    tuitionCents: 200000,
    allowPaymentPlan: true,
    paymentPlanDepositCents: 25000,
    capacity: 15,
    isActive: true,
    sortOrder: 10,
  },
];
