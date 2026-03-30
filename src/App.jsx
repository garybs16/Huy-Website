import { useEffect, useState } from "react";
import "./App.css";
import { getPrograms, joinWaitlist, submitInquiry } from "./lib/api";
import heroTraining from "./assets/hero-training.svg";
import admissionsSupport from "./assets/admissions-support.svg";
import firstStepLogo from "./assets/first-step-logo.svg";

const navItems = [
  { label: "About", id: "about" },
  { label: "Programs", id: "programs" },
  { label: "Schedule", id: "schedule" },
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
  "Schedule-first admissions experience",
  "First Step brand and coordinator contact integrated",
  "Transparent pre-launch communication",
  "Inquiry and waitlist flows already live",
];

const heroHighlights = [
  { value: "4-week", label: "weekday CNA option" },
  { value: "10-week", label: "weekend CNA option" },
  { value: "Same site", label: "frontend + backend flow" },
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
    title: "Talk to Admissions",
    detail: "Send a direct inquiry for support and next steps.",
    href: "#contact",
  },
];

const stats = [
  { value: "3", label: "launch schedule formats" },
  { value: "1", label: "program coordinator contact" },
  { value: "15", label: "target seats per cohort" },
  { value: "1:1", label: "admissions guidance model" },
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
    title: "Admissions walkthrough",
    detail: "Move from first inquiry to documents, track selection, and enrollment packet with clear guidance.",
  },
  {
    title: "Career-facing support",
    detail: "Position the school around practical outcomes and healthcare partner conversations instead of vague marketing.",
  },
  {
    title: "Transparent updates",
    detail: "Keep launch messaging honest so prospective students understand what is planned now and what comes next.",
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

function App() {
  const [programs, setPrograms] = useState(defaultPrograms);
  const [programLoadError, setProgramLoadError] = useState("");
  const [inquiryForm, setInquiryForm] = useState(initialInquiryState);
  const [waitlistForm, setWaitlistForm] = useState(initialWaitlistState);
  const [inquiryPending, setInquiryPending] = useState(false);
  const [waitlistPending, setWaitlistPending] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState({ type: "", text: "" });
  const [waitlistStatus, setWaitlistStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;

    async function loadPrograms() {
      try {
        const items = await getPrograms();

        if (!active) {
          return;
        }

        if (items.length > 0) {
          setPrograms(items);
          setProgramLoadError("");
        }
      } catch {
        if (!active) {
          return;
        }

        setProgramLoadError("Program data could not be refreshed from the API. Showing local fallback content.");
      }
    }

    loadPrograms();

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

  return (
    <div className="site">
      <header className="utility-bar">
        <div className="container utility-inner">
          <div className="utility-copy">
            <span>First Step Healthcare Academy</span>
            <span>Program coordinator support available</span>
          </div>
          <div className="utility-links">
            <a href="#contact">Contact Huy Hoang</a>
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
              <span>Healthcare training with direct coordinator support</span>
            </span>
          </a>

          <div className="menu" aria-label="Primary">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </div>

          <a href="#contact" className="btn btn-primary nav-cta">
            Talk to Admissions
          </a>
        </div>
      </nav>

      <main>
        <section className="hero" id="top">
          <div className="hero-glow hero-glow-left" aria-hidden="true" />
          <div className="hero-glow hero-glow-right" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy reveal">
              <p className="eyebrow">Get your CNA training pathway started</p>
              <h1>Train for your CNA pathway with schedule options that fit real life.</h1>
              <p className="hero-text">
                First Step Healthcare Academy is building a clear admissions experience for future
                nurse assistant students. Explore program formats,
                projected class dates, tuition snapshots, and enrollment requirements in one place.
              </p>

              <div className="cta-row">
                <a href="#programs" className="btn btn-accent">
                  Explore Programs
                </a>
                <a href="#schedule" className="btn btn-outline">
                  See Full Schedule
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
                <img src={firstStepLogo} alt="First Step Healthcare Academy logo" />
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
                  <p className={`form-status ${waitlistStatus.type === "success" ? "is-success" : "is-error"}`}>
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

        <section className="brief section" id="about">
          <div className="container brief-grid">
            <div className="brief-copy reveal">
              <p className="section-tag">In Brief</p>
              <h2>Career training information presented the way students actually shop for schools.</h2>
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
              <h2>Core allied health pathways with the structure students expect from a school site.</h2>
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
              <h2>Support students with a more practical admissions and launch experience.</h2>
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

        <section className="schedule-section section" id="schedule">
          <div className="container schedule-layout">
            <article className="tuition-panel reveal">
              <p className="section-tag">Tuition & Fees</p>
              <h2>Tuition and fee blocks laid out in a direct, admissions-friendly format.</h2>
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
              <h2>Projected class dates presented in clear cohorts.</h2>
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

        <section className="locations section" id="locations">
          <div className="container locations-grid">
            <article className="locations-card reveal">
              <p className="section-tag">Locations</p>
              <h2>Theory and clinical location details are easy to find in the flow.</h2>
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
                <h2>Make the next step obvious from the first scroll.</h2>
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
              <h2>Enrollment requirements and launch-readiness notes in one place.</h2>
              <ul className="check-list">
                {requirementItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <div className="info-stack reveal delay-1">
              <article className="info-card">
                <p className="card-label">Launch note</p>
                <h3>Transparent positioning</h3>
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
              <h2>Use the form below and keep the admissions process moving.</h2>
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
                <p className={`form-status ${inquiryStatus.type === "success" ? "is-success" : "is-error"}`}>
                  {inquiryStatus.text}
                </p>
              ) : null}
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <img className="footer-logo" src={firstStepLogo} alt="First Step Healthcare Academy logo" />
            <p>
              First Step Healthcare Academy with a schedule-first admissions experience and direct
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
