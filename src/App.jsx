import { useEffect, useState } from "react";
import "./App.css";
import {
  createEnrollment,
  getAdminEnrollments,
  getAdminInquiries,
  getAdminOverview,
  getAdminWaitlist,
  getCohorts,
  getEnrollmentStatus,
  getPrograms,
  joinWaitlist,
  submitInquiry,
} from "./lib/api";
import heroTraining from "./assets/hero-training.svg";
import admissionsSupport from "./assets/admissions-support.svg";
import firstStepLogo from "./assets/first-step-logo.svg";

const navItems = [
  { label: "About", id: "about" },
  { label: "Programs", id: "programs" },
  { label: "Schedule", id: "schedule" },
  { label: "Register", id: "register" },
  { label: "Locations", id: "locations" },
  { label: "Admissions", id: "admissions" },
  { label: "Contact", id: "contact" },
];

const defaultPrograms = [
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

const trackCards = [
  {
    name: "Weekday Track",
    length: "4 weeks",
    days: "Monday to Friday",
    time: "7:00 AM to 3:30 PM",
    note: "Theory and clinical planning on-site",
  },
  {
    name: "Weekend Track",
    length: "10 weeks",
    days: "Saturday and Sunday",
    time: "7:00 AM to 3:30 PM",
    note: "Built for working students",
  },
  {
    name: "Evening Track",
    length: "8 weeks",
    days: "Monday to Friday",
    time: "4:00 PM to 8:00 PM",
    note: "Designed around after-work schedules",
  },
];

const proofPoints = [
  "Live cohort seat tracking",
  "Online registration and payment handoff",
  "Direct enrollment support from a named contact",
  "Projected schedules presented clearly",
];

const heroHighlights = [
  { value: "4-week", label: "weekday CNA option" },
  { value: "10-week", label: "weekend CNA option" },
  { value: "Direct", label: "coordinator-led admissions support" },
];

const quickLinks = [
  {
    title: "Start with Programs",
    detail: "Compare core training tracks and durations.",
    href: "#programs",
  },
  {
    title: "Check Class Dates",
    detail: "Review projected weekday, weekend, and evening starts.",
    href: "#schedule",
  },
  {
    title: "See Requirements",
    detail: "Know what documents and screening steps to prepare.",
    href: "#admissions",
  },
  {
    title: "Register Online",
    detail: "Choose a cohort, submit enrollment, and continue to checkout.",
    href: "#register",
  },
];

const stats = [
  { value: "3", label: "launch schedule formats" },
  { value: "5", label: "active registration cohorts" },
  { value: "15", label: "target seats per cohort" },
  { value: "24h", label: "target admissions response" },
];

const announcementCards = [
  {
    label: "Registration",
    value: "Now live",
    detail: "Students can move from cohort selection to a real enrollment record without leaving the site.",
  },
  {
    label: "Payments",
    value: "Checkout-ready",
    detail: "The enrollment flow supports a hosted payment handoff instead of only collecting interest.",
  },
  {
    label: "Operations",
    value: "Seat-aware",
    detail: "Cohort availability can be shown with remaining seats so students know what is open now.",
  },
];

const defaultCohorts = [
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

const trustSignals = [
  {
    title: "Cohort-first enrollment",
    detail: "Students can choose a specific class date instead of submitting a generic contact request first.",
  },
  {
    title: "Payment after registration",
    detail: "The system captures the student record first, then sends them into secure hosted checkout.",
  },
  {
    title: "Cleaner decision path",
    detail: "Programs, schedules, registration, requirements, and contact each have a clearer role in the page flow.",
  },
];

const programMeta = {
  cna: { tag: "On-site", badge: "Flagship Track" },
  "med-aide": { tag: "Bridge", badge: "Short Format" },
  cpr: { tag: "Certification", badge: "Fast Turnaround" },
};

const tuitionItems = [
  {
    title: "CNA Founding Cohort",
    tuition: "$1,700 target tuition",
    fee: "$260 registration",
    note: "Final launch pricing to be published before enrollment opens.",
  },
  {
    title: "Hybrid / Online Theory",
    tuition: "$1,760 target tuition",
    fee: "$260 registration",
    note: "Clinical attendance remains in person.",
  },
  {
    title: "Additional Student Costs",
    tuition: "$150 books and uniforms",
    fee: "$80 live scan estimate",
    note: "State exam fees are paid directly to the testing vendor.",
  },
];

const scheduleGroups = [
  {
    title: "Projected Weekday Starts",
    details: "4-week format | Monday to Friday | 7:00 AM to 3:30 PM",
    dates: ["Apr 20, 2026 to May 18, 2026", "May 18, 2026 to Jun 15, 2026", "Jul 13, 2026 to Aug 8, 2026"],
  },
  {
    title: "Projected Weekend Starts",
    details: "10-week format | Saturday and Sunday | 7:00 AM to 3:30 PM",
    dates: ["Apr 25, 2026 to Jun 28, 2026", "Jun 13, 2026 to Aug 22, 2026", "Sep 19, 2026 to Nov 22, 2026"],
  },
  {
    title: "Projected Evening Starts",
    details: "8-week format | Monday to Friday | 4:00 PM to 8:00 PM",
    dates: ["May 25, 2026 to Jul 10, 2026", "Sep 21, 2026 to Nov 6, 2026", "Oct 26, 2026 to Dec 15, 2026"],
  },
];

const requirementItems = [
  "Minimum age of 16",
  "Two forms of active government-issued identification",
  "Original Social Security card or verifiable ITIN documentation",
  "High school diploma or GED copy",
  "Recent physical exam and TB screening on school forms",
  "Live Scan / background screening completion",
  "AHA BLS / CPR certification before state exam readiness",
];

const supportItems = [
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

const standardsItems = [
  {
    title: "Less repetition",
    detail: "The interface should move from overview to enrollment without repeating the same message in every section.",
  },
  {
    title: "Operational clarity",
    detail: "Program length, cohort timing, tuition, requirements, and next steps should be visible before checkout starts.",
  },
  {
    title: "Direct communication",
    detail: "When students need help, they should still have a clear path to a named admissions contact.",
  },
];

const locationItems = [
  {
    title: "Theory site",
    detail: "Core classroom planning can be presented under the First Step Healthcare Academy brand.",
  },
  {
    title: "Clinical routing",
    detail: "Clinical locations can vary by cohort depending on placement availability and partner routing.",
  },
  {
    title: "Student onboarding",
    detail: "Admissions can help applicants confirm ID, health forms, screening steps, and track readiness.",
  },
];

const faqItems = [
  {
    question: "When should a student submit an inquiry?",
    answer:
      "As soon as they know which training path or schedule format they want to explore. That lets admissions clarify timing, documents, and launch updates early.",
  },
  {
    question: "Are the class dates final?",
    answer:
      "They are presented as founding-cohort projections until operations, placements, and final enrollment logistics are locked.",
  },
  {
    question: "What should students prepare first?",
    answer:
      "Identification, education records, health forms, and background-screening readiness. Those are usually the first friction points in enrollment.",
  },
];

const journeySteps = [
  {
    title: "Choose a track",
    detail: "Review weekday, weekend, and evening options first.",
  },
  {
    title: "Submit your inquiry",
    detail: "Use the interest or contact form so admissions can respond directly.",
  },
  {
    title: "Prepare documents",
    detail: "Complete identification, health, and screening requirements.",
  },
  {
    title: "Confirm enrollment",
    detail: "Lock your schedule and receive the next cohort update.",
  },
];

const initialInquiryState = {
  fullName: "",
  email: "",
  phone: "",
  program: "",
  message: "",
};

const initialWaitlistState = {
  fullName: "",
  email: "",
  phone: "",
  trackPreference: "",
  notes: "",
};

const initialEnrollmentState = {
  studentFullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  programId: "",
  cohortId: "",
  notes: "",
};

function formatDateLabel(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatDateTimeLabel(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function App() {
  const [programs, setPrograms] = useState(defaultPrograms);
  const [cohorts, setCohorts] = useState(defaultCohorts);
  const [programLoadError, setProgramLoadError] = useState("");
  const [cohortLoadError, setCohortLoadError] = useState("");
  const [inquiryForm, setInquiryForm] = useState(initialInquiryState);
  const [waitlistForm, setWaitlistForm] = useState(initialWaitlistState);
  const [enrollmentForm, setEnrollmentForm] = useState(initialEnrollmentState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryPending, setInquiryPending] = useState(false);
  const [waitlistPending, setWaitlistPending] = useState(false);
  const [enrollmentPending, setEnrollmentPending] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState({ type: "", text: "" });
  const [waitlistStatus, setWaitlistStatus] = useState({ type: "", text: "" });
  const [enrollmentStatus, setEnrollmentStatus] = useState({ type: "", text: "" });
  const [adminKey, setAdminKey] = useState("");
  const [adminPending, setAdminPending] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminEnrollments, setAdminEnrollments] = useState([]);
  const [adminInquiries, setAdminInquiries] = useState([]);
  const [adminWaitlist, setAdminWaitlist] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      const [programResult, cohortResult] = await Promise.allSettled([getPrograms(), getCohorts()]);

      if (!active) {
        return;
      }

      if (programResult.status === "fulfilled" && programResult.value.length > 0) {
        setPrograms(programResult.value);
        setProgramLoadError("");
      } else if (programResult.status === "rejected") {
        setProgramLoadError("Program data could not be refreshed from the API. Showing local fallback content.");
      }

      if (cohortResult.status === "fulfilled" && cohortResult.value.length > 0) {
        setCohorts(cohortResult.value);
        setCohortLoadError("");
      } else if (cohortResult.status === "rejected") {
        setCohortLoadError("Live cohort availability could not be refreshed. You can still review fallback dates below.");
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("hashchange", closeMenu);

    return () => {
      window.removeEventListener("hashchange", closeMenu);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    const enrollmentId = params.get("enrollment");
    let active = true;

    async function syncCheckoutStatus() {
      if (!checkoutStatus || !enrollmentId) {
        if (checkoutStatus === "cancelled" && active) {
          setEnrollmentStatus({
            type: "error",
            text: "Checkout was cancelled before payment completed. Your seat is not confirmed until payment succeeds.",
          });
        }

        return;
      }

      try {
        const enrollment = await getEnrollmentStatus(enrollmentId);

        if (!active) {
          return;
        }

        if (enrollment.paymentStatus === "paid") {
          setEnrollmentStatus({
            type: "success",
            text: `Payment received. Enrollment ${enrollment.enrollmentId} is confirmed and admissions will follow up with next steps.`,
          });
          return;
        }

        if (enrollment.paymentStatus === "checkout_pending") {
          setEnrollmentStatus({
            type: "error",
            text: "Payment return was detected, but the backend has not confirmed the payment yet. Refresh in a moment or contact admissions if this does not update.",
          });
          return;
        }

        if (checkoutStatus === "cancelled" || enrollment.paymentStatus === "checkout_expired") {
          setEnrollmentStatus({
            type: "error",
            text: "Checkout was cancelled or expired before payment completed. Your seat is not confirmed yet.",
          });
          return;
        }

        setEnrollmentStatus({
          type: "error",
          text: "Enrollment exists, but payment is not marked complete yet. Please contact admissions before assuming the seat is confirmed.",
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setEnrollmentStatus({
          type: "error",
          text: error.message || "Could not verify payment status after checkout.",
        });
      }
    }

    syncCheckoutStatus();

    if (checkoutStatus) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("checkout");
      nextUrl.searchParams.delete("enrollment");
      window.history.replaceState({}, document.title, `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    }

    return () => {
      active = false;
    };
  }, []);

  const handleInquiryInput = (event) => {
    const { name, value } = event.target;
    setInquiryForm((current) => ({ ...current, [name]: value }));
  };

  const handleWaitlistInput = (event) => {
    const { name, value } = event.target;
    setWaitlistForm((current) => ({ ...current, [name]: value }));
  };

  const handleEnrollmentInput = (event) => {
    const { name, value } = event.target;

    setEnrollmentForm((current) => {
      if (name === "programId") {
        return {
          ...current,
          programId: value,
          cohortId: "",
        };
      }

      return { ...current, [name]: value };
    });
  };

  const handleInquirySubmit = async (event) => {
    event.preventDefault();
    setInquiryPending(true);
    setInquiryStatus({ type: "", text: "" });

    try {
      await submitInquiry({
        ...inquiryForm,
        source: "admissions-contact-form",
      });
      setInquiryStatus({
        type: "success",
        text: "Inquiry sent. Admissions will contact you shortly.",
      });
      setInquiryForm(initialInquiryState);
    } catch (error) {
      setInquiryStatus({
        type: "error",
        text: error.message || "Could not submit your inquiry right now.",
      });
    } finally {
      setInquiryPending(false);
    }
  };

  const handleWaitlistSubmit = async (event) => {
    event.preventDefault();
    setWaitlistPending(true);
    setWaitlistStatus({ type: "", text: "" });

    const combinedNotes = [waitlistForm.trackPreference, waitlistForm.notes]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" | ");

    try {
      await joinWaitlist({
        fullName: waitlistForm.fullName,
        email: waitlistForm.email,
        phone: waitlistForm.phone,
        notes: combinedNotes || undefined,
        source: "hero-registration-card",
      });
      setWaitlistStatus({
        type: "success",
        text: "You are on the interest list. We will share class dates and milestone updates.",
      });
      setWaitlistForm(initialWaitlistState);
    } catch (error) {
      setWaitlistStatus({
        type: "error",
        text: error.message || "Could not join the interest list right now.",
      });
    } finally {
      setWaitlistPending(false);
    }
  };

  const handleEnrollmentSubmit = async (event) => {
    event.preventDefault();
    setEnrollmentPending(true);
    setEnrollmentStatus({ type: "", text: "" });

    try {
      const response = await createEnrollment({
        studentFullName: enrollmentForm.studentFullName,
        email: enrollmentForm.email,
        phone: enrollmentForm.phone,
        dateOfBirth: enrollmentForm.dateOfBirth,
        addressLine1: enrollmentForm.addressLine1,
        city: enrollmentForm.city,
        state: enrollmentForm.state,
        postalCode: enrollmentForm.postalCode,
        emergencyContactName: enrollmentForm.emergencyContactName,
        emergencyContactPhone: enrollmentForm.emergencyContactPhone,
        cohortId: enrollmentForm.cohortId,
        notes: enrollmentForm.notes,
      });

      if (response.paymentRequired && response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }

      setEnrollmentStatus({
        type: "success",
        text: response.message || "Registration submitted. Admissions will contact you to complete payment.",
      });
      setEnrollmentForm(initialEnrollmentState);
    } catch (error) {
      setEnrollmentStatus({
        type: "error",
        text: error.message || "Could not complete registration right now.",
      });
    } finally {
      setEnrollmentPending(false);
    }
  };

  const handleAdminLoad = async (event) => {
    event.preventDefault();

    if (!adminKey.trim()) {
      setAdminError("Enter the admin API key to load the operations dashboard.");
      return;
    }

    setAdminPending(true);
    setAdminError("");

    try {
      const [overview, enrollmentsData, inquiriesData, waitlistData] = await Promise.all([
        getAdminOverview(adminKey.trim()),
        getAdminEnrollments(adminKey.trim()),
        getAdminInquiries(adminKey.trim()),
        getAdminWaitlist(adminKey.trim()),
      ]);

      setAdminOverview(overview);
      setAdminEnrollments(enrollmentsData.items ?? []);
      setAdminInquiries(inquiriesData.items ?? []);
      setAdminWaitlist(waitlistData.items ?? []);
    } catch (error) {
      setAdminError(error.message || "Could not load the admin dashboard.");
    } finally {
      setAdminPending(false);
    }
  };

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  const filteredCohorts = cohorts.filter(
    (cohort) => !enrollmentForm.programId || cohort.programId === enrollmentForm.programId
  );
  const selectedCohort = cohorts.find((cohort) => cohort.id === enrollmentForm.cohortId) ?? null;

  return (
    <div className="site">
      <header className="utility-bar">
        <div className="container utility-inner">
          <div className="utility-copy">
            <span>First Step Healthcare Academy</span>
            <span>Enrollment and payment now live</span>
          </div>
          <div className="utility-links">
            <span className="utility-pill">Live seat tracking</span>
            <a href="#schedule">See class dates</a>
          </div>
        </div>
      </header>

      <nav className="navbar">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <img className="brand-logo" src={firstStepLogo} alt="First Step Healthcare Academy logo" />
            <span className="brand-text">
              <strong>First Step Healthcare Academy</strong>
              <span>CNA, medication aide, and CPR enrollment</span>
            </span>
          </a>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
            <span className="sr-only">Toggle navigation</span>
          </button>

          <div className={`menu ${menuOpen ? "is-open" : ""}`} id="primary-menu" aria-label="Primary">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={handleNavClick}>
                {item.label}
              </a>
            ))}
            <a href="#register" className="btn btn-primary menu-cta" onClick={handleNavClick}>
              Register & Pay
            </a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero" id="top">
          <div className="hero-glow hero-glow-left" aria-hidden="true" />
          <div className="hero-glow hero-glow-right" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy reveal">
              <p className="eyebrow">First Step Healthcare Academy</p>
              <h1>Healthcare training presented with more clarity, structure, and trust.</h1>
              <p className="hero-text">
                First Step Healthcare Academy presents a clearer path for future nurse assistant
                students. Review program formats, projected class dates, tuition snapshots,
                requirements, and direct coordinator contact in one place.
              </p>

              <div className="cta-row">
                <a href="#programs" className="btn btn-accent">
                  Explore Programs
                </a>
                <a href="#register" className="btn btn-outline">
                  Register & Pay
                </a>
              </div>

              <div className="hero-highlight-row">
                {heroHighlights.map((item) => (
                  <article key={item.label} className="hero-highlight-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </article>
                ))}
              </div>

              <ul className="hero-points">
                {proofPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="hero-preview-card">
                <img src={heroTraining} alt="Illustration of a healthcare training dashboard and class setup" />
                <div className="hero-brand-chip">
                  <img src={firstStepLogo} alt="First Step Healthcare Academy logo" />
                  <div>
                    <strong>First Step Healthcare Academy</strong>
                    <span>Program coordinator support led by Huy Hoang</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-rail reveal delay-1">
              <article className="register-card">
                <p className="card-label">Register interest</p>
                <h2>Request founding cohort updates</h2>
                <p className="card-copy">
                  Submit your details to receive projected start dates, admissions requirements,
                  and launch updates.
                </p>

                <form className="register-form" onSubmit={handleWaitlistSubmit}>
                  <label>
                    <span>Full name</span>
                    <input
                      name="fullName"
                      type="text"
                      value={waitlistForm.fullName}
                      onChange={handleWaitlistInput}
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label>
                    <span>Email address</span>
                    <input
                      name="email"
                      type="email"
                      value={waitlistForm.email}
                      onChange={handleWaitlistInput}
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label>
                    <span>Phone number</span>
                    <input
                      name="phone"
                      type="tel"
                      value={waitlistForm.phone}
                      onChange={handleWaitlistInput}
                      autoComplete="tel"
                    />
                  </label>

                  <label>
                    <span>Preferred track</span>
                    <select
                      name="trackPreference"
                      value={waitlistForm.trackPreference}
                      onChange={handleWaitlistInput}
                    >
                      <option value="">Select a track</option>
                      <option value="Weekday track">Weekday track</option>
                      <option value="Weekend track">Weekend track</option>
                      <option value="Evening track">Evening track</option>
                    </select>
                  </label>

                  <label>
                    <span>Notes</span>
                    <textarea
                      name="notes"
                      rows="3"
                      value={waitlistForm.notes}
                      onChange={handleWaitlistInput}
                    />
                  </label>

                  <button type="submit" className="btn btn-primary" disabled={waitlistPending}>
                    {waitlistPending ? "Submitting..." : "Request Updates"}
                  </button>
                </form>

                {waitlistStatus.text ? (
                  <p
                    className={`form-status ${waitlistStatus.type === "success" ? "is-success" : "is-error"}`}
                    aria-live="polite"
                  >
                    {waitlistStatus.text}
                  </p>
                ) : null}
              </article>

              <div className="track-stack">
                {trackCards.map((track) => (
                  <article key={track.name} className="track-card">
                    <p className="track-name">{track.name}</p>
                    <p>{track.length}</p>
                    <p>{track.days}</p>
                    <p>{track.time}</p>
                    <span>{track.note}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="quick-start">
          <div className="container">
            <div className="quick-grid">
              {quickLinks.map((item, index) => (
                <a key={item.title} href={item.href} className={`quick-card reveal delay-${(index % 3) + 1}`}>
                  <b>{`0${index + 1}`}</b>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <span>Open section</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="trust-bar">
          <div className="container trust-grid">
            {trustSignals.map((item) => (
              <article key={item.title} className="trust-card">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="announcements">
          <div className="container announcement-grid">
            {announcementCards.map((item, index) => (
              <article key={item.label} className={`announcement-card reveal delay-${(index % 3) + 1}`}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <span>{item.detail}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="brief section" id="about">
          <div className="container brief-grid">
            <div className="brief-copy reveal">
              <p className="section-tag">In Brief</p>
              <h2>Present core school information the way prospective students and investors expect.</h2>
              <p>
                We focus on the details prospective students ask first: which programs are
                available, how long they run, what the schedule looks like, and what to prepare for
                before enrollment.
              </p>
              <p>
                First Step Healthcare Academy is still in launch planning, so the site keeps transparent language
                around projected dates and founding-cohort updates instead of making claims that
                have not been earned yet.
              </p>
            </div>

            <div className="stat-grid reveal delay-1">
              {stats.map((item) => (
                <article key={item.label} className="stat-card">
                  <h3>{item.value}</h3>
                  <p>{item.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="programs section" id="programs">
          <div className="container">
            <div className="section-heading reveal">
              <p className="section-tag">Programs</p>
              <h2>Core allied health pathways with a more credible, school-first presentation.</h2>
              <p>
                Review the format, duration, and admissions direction for each pathway before you
                request class dates.
              </p>
            </div>

            {programLoadError ? <p className="section-note">{programLoadError}</p> : null}

            <div className="program-grid">
              {programs.map((program, index) => {
                const meta = programMeta[program.id] ?? { tag: "Program", badge: "Admissions" };

                return (
                  <article key={program.id} className={`program-card reveal delay-${(index % 3) + 1}`}>
                    <div className="program-topline">
                      <span>{meta.tag}</span>
                      <strong>{meta.badge}</strong>
                    </div>
                    <h3>{program.title}</h3>
                    <p>{program.summary}</p>
                    <ul className="program-details">
                      <li>Duration: {program.duration}</li>
                      <li>Format: {program.schedule}</li>
                    </ul>
                    <a href="#admissions" className="text-link">
                      View admission requirements
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="support-band">
          <div className="container support-grid">
            <div className="support-copy reveal">
              <p className="section-tag">Student Support</p>
              <h2>Support students with coordinator-led communication and clearer next steps.</h2>
              <div className="support-visual">
                <img src={admissionsSupport} alt="Illustration of an admissions support and student planning workflow" />
              </div>
            </div>
            <div className="support-list reveal delay-1">
              {supportItems.map((item) => (
                <article key={item.title} className="support-card">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="standards section">
          <div className="container standards-grid">
            <article className="standards-panel reveal">
              <p className="section-tag">Operating Standards</p>
              <h2>Present the school like a serious operator, not a generic landing page.</h2>
              <p>
                The strongest trust signal at this stage is disciplined communication. The site is
                designed to show what is known, what is projected, and how a student actually moves
                from interest to enrollment.
              </p>
            </article>

            <div className="standards-stack reveal delay-1">
              {standardsItems.map((item) => (
                <article key={item.title} className="standard-card">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="schedule-section section" id="schedule">
          <div className="container schedule-layout">
            <article className="tuition-panel reveal">
              <p className="section-tag">Tuition & Fees</p>
              <h2>Tuition and fee blocks presented in a direct, professional format.</h2>
              <div className="tuition-stack">
                {tuitionItems.map((item) => (
                  <div key={item.title} className="tuition-card">
                    <h3>{item.title}</h3>
                    <p>{item.tuition}</p>
                    <p>{item.fee}</p>
                    <span>{item.note}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="dates-panel reveal delay-1">
              <p className="section-tag">Course Schedule</p>
              <h2>Projected class dates organized in clear cohort groups.</h2>
              <div className="dates-stack">
                {scheduleGroups.map((group) => (
                  <div key={group.title} className="date-group">
                    <h3>{group.title}</h3>
                    <p>{group.details}</p>
                    <ul>
                      {group.dates.map((date) => (
                        <li key={date}>{date}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="registration section" id="register">
          <div className="container registration-grid">
            <article className="registration-panel reveal">
              <p className="section-tag">Online Registration</p>
              <h2>Students can now choose a class date, register, and continue to payment.</h2>
              <p>
                Use the enrollment form to capture the student record first. If online payment is
                enabled, the student is redirected into secure checkout immediately after submitting.
              </p>

              <div className="registration-note-card">
                <h3>How this flow works</h3>
                <ul className="contact-list">
                  <li>Select a program and live cohort</li>
                  <li>Submit the student and emergency contact details</li>
                  <li>Continue to secure payment checkout when available</li>
                  <li>Receive admissions follow-up after registration is recorded</li>
                </ul>
              </div>

              {selectedCohort ? (
                <article className="cohort-summary-card">
                  <p className="card-label">Selected Cohort</p>
                  <h3>{selectedCohort.title}</h3>
                  <p>{selectedCohort.programTitle}</p>
                  <ul className="contact-list">
                    <li>
                      Dates: {formatDateLabel(selectedCohort.startDate)} to {formatDateLabel(selectedCohort.endDate)}
                    </li>
                    <li>Schedule: {selectedCohort.meetingPattern}</li>
                    <li>Tuition: {selectedCohort.tuitionLabel}</li>
                    <li>Remaining seats: {selectedCohort.remainingSeats}</li>
                  </ul>
                </article>
              ) : (
                <article className="cohort-summary-card">
                  <p className="card-label">Seat Availability</p>
                  <h3>Live cohorts</h3>
                  <p>Choose a program first, then pick the class date the student wants.</p>
                </article>
              )}
            </article>

            <article className="registration-form-panel reveal delay-1">
              <h3>Start Enrollment</h3>
              {cohortLoadError ? <p className="section-note">{cohortLoadError}</p> : null}

              <form className="enrollment-form" onSubmit={handleEnrollmentSubmit}>
                <div className="form-columns">
                  <label>
                    <span>Student full name</span>
                    <input
                      name="studentFullName"
                      type="text"
                      value={enrollmentForm.studentFullName}
                      onChange={handleEnrollmentInput}
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label>
                    <span>Date of birth</span>
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={enrollmentForm.dateOfBirth}
                      onChange={handleEnrollmentInput}
                      required
                    />
                  </label>
                </div>

                <div className="form-columns">
                  <label>
                    <span>Email address</span>
                    <input
                      name="email"
                      type="email"
                      value={enrollmentForm.email}
                      onChange={handleEnrollmentInput}
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label>
                    <span>Phone number</span>
                    <input
                      name="phone"
                      type="tel"
                      value={enrollmentForm.phone}
                      onChange={handleEnrollmentInput}
                      autoComplete="tel"
                    />
                  </label>
                </div>

                <label>
                  <span>Street address</span>
                  <input
                    name="addressLine1"
                    type="text"
                    value={enrollmentForm.addressLine1}
                    onChange={handleEnrollmentInput}
                    autoComplete="address-line1"
                    required
                  />
                </label>

                <div className="form-columns form-columns-thirds">
                  <label>
                    <span>City</span>
                    <input
                      name="city"
                      type="text"
                      value={enrollmentForm.city}
                      onChange={handleEnrollmentInput}
                      autoComplete="address-level2"
                      required
                    />
                  </label>

                  <label>
                    <span>State</span>
                    <input
                      name="state"
                      type="text"
                      value={enrollmentForm.state}
                      onChange={handleEnrollmentInput}
                      autoComplete="address-level1"
                      maxLength={2}
                      placeholder="CA"
                      required
                    />
                  </label>

                  <label>
                    <span>ZIP code</span>
                    <input
                      name="postalCode"
                      type="text"
                      value={enrollmentForm.postalCode}
                      onChange={handleEnrollmentInput}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      required
                    />
                  </label>
                </div>

                <div className="form-columns">
                  <label>
                    <span>Emergency contact name</span>
                    <input
                      name="emergencyContactName"
                      type="text"
                      value={enrollmentForm.emergencyContactName}
                      onChange={handleEnrollmentInput}
                      required
                    />
                  </label>

                  <label>
                    <span>Emergency contact phone</span>
                    <input
                      name="emergencyContactPhone"
                      type="tel"
                      value={enrollmentForm.emergencyContactPhone}
                      onChange={handleEnrollmentInput}
                      required
                    />
                  </label>
                </div>

                <div className="form-columns">
                  <label>
                    <span>Program</span>
                    <select
                      name="programId"
                      value={enrollmentForm.programId}
                      onChange={handleEnrollmentInput}
                      required
                    >
                      <option value="" disabled>
                        Select a program
                      </option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Cohort</span>
                    <select
                      name="cohortId"
                      value={enrollmentForm.cohortId}
                      onChange={handleEnrollmentInput}
                      required
                      disabled={!enrollmentForm.programId}
                    >
                      <option value="" disabled>
                        {enrollmentForm.programId ? "Select a cohort" : "Choose a program first"}
                      </option>
                      {filteredCohorts.map((cohort) => (
                        <option
                          key={cohort.id}
                          value={cohort.id}
                          disabled={cohort.remainingSeats <= 0}
                        >
                          {`${cohort.title} | ${formatDateLabel(cohort.startDate)} | ${cohort.tuitionLabel} | ${cohort.remainingSeats} seats left`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  <span>Admissions notes</span>
                  <textarea
                    name="notes"
                    rows="4"
                    value={enrollmentForm.notes}
                    onChange={handleEnrollmentInput}
                    placeholder="Add scheduling requests, document status, or any extra enrollment context."
                  />
                </label>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={enrollmentPending || cohorts.length === 0}
                >
                  {enrollmentPending ? "Preparing checkout..." : "Start Enrollment"}
                </button>
              </form>

              {enrollmentStatus.text ? (
                <p
                  className={`form-status ${enrollmentStatus.type === "success" ? "is-success" : "is-error"}`}
                  aria-live="polite"
                >
                  {enrollmentStatus.text}
                </p>
              ) : null}
            </article>
          </div>
        </section>

        <section className="locations section" id="locations">
          <div className="container locations-grid">
            <article className="locations-card reveal">
              <p className="section-tag">Locations</p>
              <h2>Location and training-delivery details stay easy to find in the page flow.</h2>
              <p>
                Keep your location details separate from the admissions checklist so students can
                quickly understand where classroom work happens and how clinical routing may vary by
                cohort.
              </p>
            </article>

            <div className="locations-stack reveal delay-1">
              {locationItems.map((item) => (
                <article key={item.title} className="info-card">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="requirements section" id="admissions">
          <div className="container">
            <div className="journey-panel reveal">
              <div className="journey-intro">
                <p className="section-tag">Enrollment Path</p>
                <h2>Make the next step obvious from the first scroll to the final inquiry.</h2>
              </div>
              <div className="journey-grid">
                {journeySteps.map((step, index) => (
                  <article key={step.title} className="journey-card">
                    <span>{`Step ${index + 1}`}</span>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="container requirements-grid">
            <article className="requirements-card reveal">
              <p className="section-tag">Admissions</p>
              <h2>Enrollment requirements and launch-readiness notes kept in one place.</h2>
              <ul className="check-list">
                {requirementItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <div className="info-stack reveal delay-1">
              <article className="info-card">
                <p className="card-label">Launch note</p>
                <h3>Founding cohort note</h3>
                <p>
                  Dates and pricing are shown as founding-cohort planning until final operations,
                  approvals, and enrollment workflows are fully locked.
                </p>
              </article>

              <article className="info-card">
                <p className="card-label">Admissions help</p>
                <h3>What happens next</h3>
                <p>
                  Submit your inquiry or interest form first, then admissions can walk you through
                  documents, schedule selection, and enrollment timing.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container cta-band-inner">
            <div>
              <p className="section-tag">Ready To Ask Questions?</p>
              <h2>Use the contact form below to start a direct admissions conversation.</h2>
            </div>
            <a href="#contact" className="btn btn-accent">
              Go To Contact Form
            </a>
          </div>
        </section>

        <section className="contact section" id="contact">
          <div className="container contact-grid">
            <article className="contact-panel reveal">
              <p className="section-tag">Contact Us</p>
              <h2>Direct inquiry flow for admissions and operations questions.</h2>
              <ul className="contact-list">
                <li>Coordinator: Huy Hoang, Program Coordinator</li>
                <li>Phone: (949) 407-9581</li>
                <li>Email: huyh@firststepha.org</li>
                <li>Brand: First Step Healthcare Academy</li>
              </ul>
              <a href="#top" className="btn btn-secondary">
                Back to top
              </a>
            </article>

            <article className="contact-form-panel reveal delay-1">
              <h3>Request Information</h3>
              <form className="contact-form" onSubmit={handleInquirySubmit}>
                <label>
                  <span>Full name</span>
                  <input
                    name="fullName"
                    type="text"
                    value={inquiryForm.fullName}
                    onChange={handleInquiryInput}
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  <span>Email address</span>
                  <input
                    name="email"
                    type="email"
                    value={inquiryForm.email}
                    onChange={handleInquiryInput}
                    autoComplete="email"
                    required
                  />
                </label>

                <label>
                  <span>Phone number</span>
                  <input
                    name="phone"
                    type="tel"
                    value={inquiryForm.phone}
                    onChange={handleInquiryInput}
                    autoComplete="tel"
                  />
                </label>

                <label>
                  <span>Program of interest</span>
                  <select
                    name="program"
                    value={inquiryForm.program}
                    onChange={handleInquiryInput}
                    required
                  >
                    <option value="" disabled>
                      Select a program
                    </option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Your message</span>
                  <textarea
                    name="message"
                    rows="4"
                    value={inquiryForm.message}
                    onChange={handleInquiryInput}
                    minLength={10}
                    required
                  />
                </label>

                <button type="submit" className="btn btn-primary" disabled={inquiryPending}>
                  {inquiryPending ? "Submitting..." : "Submit Inquiry"}
                </button>
              </form>

              {inquiryStatus.text ? (
                <p
                  className={`form-status ${inquiryStatus.type === "success" ? "is-success" : "is-error"}`}
                  aria-live="polite"
                >
                  {inquiryStatus.text}
                </p>
              ) : null}
            </article>
          </div>

          <div className="container faq-grid">
            <article className="faq-panel reveal">
              <p className="section-tag">Admissions FAQ</p>
              <h2>Answer the practical questions that usually block conversion.</h2>
              <div className="faq-stack">
                {faqItems.map((item) => (
                  <article key={item.question} className="faq-card">
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="profile-card reveal delay-1">
              <p className="card-label">Enrollment Office</p>
              <h3>What students can expect after registering</h3>
              <p className="profile-role">Admissions follow-through</p>
              <p>
                Once a student submits registration, admissions can confirm seat status, document
                readiness, payment completion, and next-step timing without sending them back
                through a generic intake loop.
              </p>
              <ul className="profile-points">
                <li>Seat confirmation and cohort review</li>
                <li>Document checklist follow-up</li>
                <li>Payment and onboarding support</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="admin section" id="admin">
          <div className="container admin-shell">
            <div className="admin-header reveal">
              <div>
                <p className="section-tag">Admin Dashboard</p>
                <h2>Run admissions, enrollment, and lead follow-up from one place.</h2>
                <p>
                  This operations panel uses the protected admin APIs. Enter the API key to load
                  live metrics and recent records.
                </p>
              </div>

              <form className="admin-access-form" onSubmit={handleAdminLoad}>
                <label>
                  <span>Admin API key</span>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(event) => setAdminKey(event.target.value)}
                    autoComplete="off"
                    placeholder="Enter x-api-key value"
                  />
                </label>
                <button type="submit" className="btn btn-primary" disabled={adminPending}>
                  {adminPending ? "Loading dashboard..." : "Load Dashboard"}
                </button>
              </form>
            </div>

            {adminError ? <p className="form-status is-error">{adminError}</p> : null}

            {adminOverview ? (
              <>
                <div className="admin-metrics reveal delay-1">
                  <article className="admin-metric-card">
                    <span>Active cohorts</span>
                    <strong>{adminOverview.metrics.activeCohorts}</strong>
                  </article>
                  <article className="admin-metric-card">
                    <span>Total enrollments</span>
                    <strong>{adminOverview.metrics.enrollments}</strong>
                  </article>
                  <article className="admin-metric-card">
                    <span>Paid enrollments</span>
                    <strong>{adminOverview.metrics.paidEnrollments}</strong>
                  </article>
                  <article className="admin-metric-card">
                    <span>Pending payments</span>
                    <strong>{adminOverview.metrics.pendingPayments}</strong>
                  </article>
                  <article className="admin-metric-card">
                    <span>Inquiries</span>
                    <strong>{adminOverview.metrics.inquiries}</strong>
                  </article>
                  <article className="admin-metric-card">
                    <span>Waitlist</span>
                    <strong>{adminOverview.metrics.waitlist}</strong>
                  </article>
                </div>

                <div className="admin-grid">
                  <article className="admin-panel reveal">
                    <h3>Recent enrollments</h3>
                    <div className="admin-list">
                      {adminEnrollments.slice(0, 6).map((item) => (
                        <div key={item.id} className="admin-list-item">
                          <div>
                            <strong>{item.studentFullName}</strong>
                            <p>{item.email}</p>
                          </div>
                          <div>
                            <p>{item.cohortTitle}</p>
                            <span>{item.paymentStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="admin-panel reveal delay-1">
                    <h3>Recent inquiries</h3>
                    <div className="admin-list">
                      {adminInquiries.slice(0, 6).map((item) => (
                        <div key={item.id} className="admin-list-item">
                          <div>
                            <strong>{item.fullName}</strong>
                            <p>{item.email}</p>
                          </div>
                          <div>
                            <p>{item.program}</p>
                            <span>{formatDateTimeLabel(item.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="admin-panel reveal">
                    <h3>Waitlist submissions</h3>
                    <div className="admin-list">
                      {adminWaitlist.slice(0, 6).map((item) => (
                        <div key={item.id} className="admin-list-item">
                          <div>
                            <strong>{item.fullName}</strong>
                            <p>{item.email}</p>
                          </div>
                          <div>
                            <p>{item.phone || "No phone"}</p>
                            <span>{formatDateTimeLabel(item.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="admin-panel reveal delay-1">
                    <h3>Cohort capacity</h3>
                    <div className="admin-list">
                      {adminOverview.cohorts.slice(0, 6).map((item) => (
                        <div key={item.id} className="admin-list-item">
                          <div>
                            <strong>{item.title}</strong>
                            <p>{item.programTitle}</p>
                          </div>
                          <div>
                            <p>{item.remainingSeats} seats left</p>
                            <span>{formatDateLabel(item.startDate)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <img className="footer-logo" src={firstStepLogo} alt="First Step Healthcare Academy logo" />
            <p>
              First Step Healthcare Academy with a structured admissions experience and direct
              coordinator support.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li>
                <a href="#programs">Programs</a>
              </li>
              <li>
                <a href="#schedule">Schedule</a>
              </li>
              <li>
                <a href="#admissions">Admissions</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Programs</h4>
            <ul>
              {programs.map((program) => (
                <li key={program.id}>{program.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>Huy Hoang</li>
              <li>(949) 407-9581</li>
              <li>huyh@firststepha.org</li>
            </ul>
          </div>
        </div>
        <div className="footer-bar">
          <p>Copyright 2026 First Step Healthcare Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
