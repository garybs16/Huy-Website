import { useState } from "react";
import { Link } from "react-router-dom";
import admissionsLabPhoto from "../assets/admissions-lab-photo.jpg";
import heroTraining from "../assets/hero-training-photo-v2.jpg";
import programsSupportPhoto from "../assets/programs-support-photo.jpg";
import { TurnstileWidget, isTurnstileEnabled } from "../components/TurnstileWidget";
import { submitInquiry } from "../lib/api";
import {
  industryGrowthRows,
  miscFeeItems,
  programMeta,
  requirementItems,
  tuitionItems,
  trustProofItems,
  workforceProjectionStats,
} from "../siteData";

const initialHandoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

function parseJobsChange(value) {
  return Number.parseFloat(value.replace(/,/g, "").replace("k", ""));
}

export function HomePage({ programs }) {
  const [handoutForm, setHandoutForm] = useState(initialHandoutForm);
  const [handoutPending, setHandoutPending] = useState(false);
  const [handoutStatus, setHandoutStatus] = useState({ type: "", text: "" });
  const [handoutTurnstileToken, setHandoutTurnstileToken] = useState("");
  const [handoutTurnstileResetSignal, setHandoutTurnstileResetSignal] = useState(0);
  const heroTrustItems = [
    { label: "CDPH approved CNA program" },
    { label: "Orange, California" },
  ];
  const heroAssuranceItems = [
    ["Program total", "$2,000"],
    ["Registration deposit", "$250"],
    ["Admissions help", "Direct"],
  ];
  const trainingTimeline = [
    {
      title: "Find your start window",
      detail: "Compare schedules, tuition context, and document requirements before you commit.",
      to: "/schedule",
    },
    {
      title: "Get supported through enrollment",
      detail: "Admissions helps you move from inquiry to registration with fewer missed steps.",
      to: "/rewards-guidance",
    },
  ];
  const decisionStats = [
    { value: "Schedule", label: "approved class details" },
    { value: "$100", label: "eligible referral reward" },
    { value: "Direct", label: "admissions guidance" },
  ];
  const heroQuickLinks = [
    { label: "Schedules", to: "/schedule" },
    { label: "Admissions", to: "/admissions" },
    { label: "Payment", to: "/payment" },
  ];
  const quizThemes = ["Purpose", "Stability", "Growth", "Independence"];
  const homeSupportItems = [
    {
      title: "Referral Incentives",
      detail: "Eligible students can earn a $100 tuition credit through the referral program.",
    },
    {
      title: "Study Toolkit",
      detail: "Use practical guides, checklists, and exam-review resources throughout training.",
    },
    {
      title: "Career Guidance",
      detail: "Get support with job readiness and planning your next healthcare step.",
    },
  ];
  const sectorRows = industryGrowthRows.filter((row) => row.label !== "Total wage and salary employment");
  const maxJobsChange = Math.max(...sectorRows.map((row) => parseJobsChange(row.change)));

  function updateHandoutField(event) {
    const { name, value } = event.target;
    setHandoutForm((current) => ({ ...current, [name]: value }));
  }

  async function handleHandoutSubmit(event) {
    event.preventDefault();
    setHandoutPending(true);
    setHandoutStatus({ type: "", text: "" });

    try {
      if (isTurnstileEnabled() && !handoutTurnstileToken) {
        setHandoutStatus({ type: "error", text: "Complete the security check before submitting." });
        setHandoutPending(false);
        return;
      }

      await submitInquiry({
        fullName: `${handoutForm.firstName} ${handoutForm.lastName}`.trim(),
        email: handoutForm.email,
        phone: handoutForm.phone,
        program: "cna",
        message: "Please send the CNA Career Starter Guide and OC Nursing School Pathway Guide.",
        source: "home-free-handouts",
        turnstileToken: handoutTurnstileToken,
      });
      setHandoutForm(initialHandoutForm);
      setHandoutTurnstileToken("");
      setHandoutTurnstileResetSignal((current) => current + 1);
      setHandoutStatus({
        type: "success",
        text: "Request sent. Admissions will send the free handouts shortly.",
      });
    } catch (error) {
      setHandoutTurnstileToken("");
      setHandoutTurnstileResetSignal((current) => current + 1);
      setHandoutStatus({
        type: "error",
        text: error.message || "We could not send the request. Please contact admissions directly.",
      });
    } finally {
      setHandoutPending(false);
    }
  }

  return (
    <>
      <section className="hero-panel">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">First Step Healthcare Academy</p>
            <div className="hero-trust-list" aria-label="School highlights">
              {heroTrustItems.map((item) => (
                <span key={item.label} className="hero-trust-item">
                  {item.label}
                </span>
              ))}
            </div>
            <h1 className="hero-title" aria-label="Certified Nursing Assistant Training">
              <span>Certified Nursing Assistant</span>
              <span>Training</span>
            </h1>
            <p className="hero-text">
              Train for patient care with a clear CNA path, real admissions guidance, published
              program details, and a registration flow built to keep your next step obvious.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary">
                Register Now
              </Link>
              <Link to="/programs" className="btn btn-secondary">
                View Programs
              </Link>
            </div>

            <div className="hero-quick-links" aria-label="Fast access">
              {heroQuickLinks.map((item) => (
                <Link key={item.label} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hero-assurance-panel" aria-label="Enrollment highlights">
              {heroAssuranceItems.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-card">
              <img
                src={heroTraining}
                alt="Healthcare instructor guiding students through hands-on bedside skills training"
              />
              <div className="hero-status-chip">Enrollment open</div>
              <div className="hero-photo-badge">
                <span>Hands-on instruction</span>
                <strong>Skills lab, online theory, and admissions support in one path</strong>
              </div>
            </div>
            <div className="hero-decision-strip" aria-label="Program decision highlights">
              {decisionStats.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container hero-pathway" aria-label="Next steps">
          {trainingTimeline.map((item, index) => (
            <Link key={item.title} to={item.to} className="training-phase-card">
              <span>{`0${index + 1}`}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section home-quiz-section" aria-labelledby="home-quiz-title">
        <div className="container home-quiz-card">
          <div className="home-quiz-copy">
            <p className="home-quiz-kicker">A quick, personal place to start</p>
            <h2 id="home-quiz-title">What kind of healthcare future feels right for you?</h2>
            <p>
              Take the short career quiz to explore your strengths and see how they may connect
              with a people-centered career path.
            </p>
            <Link to="/career-quiz" className="btn home-quiz-button">
              Start the career quiz <span aria-hidden="true">→</span>
            </Link>
            <small>12 reflective questions · No sign-up required</small>
          </div>

          <div className="home-quiz-preview" aria-label="Quiz themes">
            <span className="home-quiz-step">Question 01 / 12</span>
            <strong>What matters most in the future you are building?</strong>
            <div className="home-quiz-theme-grid">
              {quizThemes.map((theme, index) => (
                <span key={theme}>
                  <b>{String.fromCharCode(65 + index)}</b>
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section workforce-impact-section">
        <div className="container workforce-impact-grid">
          <div className="workforce-impact-copy">
            <p className="section-kicker">Healthcare career demand</p>
            <h2>
              Healthcare is projected to be the nation's <span>fastest-growing major industry sector</span>.
            </h2>
            <p>
              According to the U.S. Bureau of Labor Statistics, healthcare and social assistance is
              projected to add about 2.0 million jobs from 2024 to 2034. An aging population is also
              expected to increase demand for healthcare and long-term care services.
            </p>

            <div className="impact-stat-row" aria-label="Healthcare employment statistics">
              {workforceProjectionStats.map((item) => (
                <article key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>

            <Link to="/programs" className="quick-card impact-opportunity-card">
              <strong>Turn Growth Into Opportunity. Your First Step Matters.</strong>
              <p>
                Join the growing healthcare field with CNA training that builds hands-on skills,
                patient-care experience, and a stronger foundation for what comes next.
              </p>
              <span>Explore CNA Training</span>
            </Link>
          </div>

          <div className="workforce-chart-card" aria-label="Projected industry employment growth chart">
            <div className="chart-heading">
              <span>2024-2034 projected employment change</span>
              <strong>Healthcare adds the most sector jobs</strong>
            </div>
            <div className="growth-bar-list">
              {sectorRows.map((row) => {
                const change = parseJobsChange(row.change);
                return (
                <div key={row.label} className="growth-bar-row">
                  <div className="growth-bar-label">
                    <span>{row.label}</span>
                    <strong>{row.change}</strong>
                  </div>
                  <div className="growth-bar-track">
                    <span style={{ width: `${(change / maxJobsChange) * 100}%` }} />
                  </div>
                  <small>{row.percent}% projected growth</small>
                </div>
                );
              })}
            </div>
            <a
              className="source-link"
              href="https://www.bls.gov/opub/mlr/2026/article/industry-and-occupational-employment-projections-overview.htm"
              target="_blank"
              rel="noreferrer"
            >
              Source: U.S. Bureau of Labor Statistics, Monthly Labor Review, 2024-34 projections
            </a>
          </div>
        </div>
      </section>

      <section className="section visual-story-section">
        <div className="container visual-story-showcase">
          <div className="visual-story-media">
            <img
              src={programsSupportPhoto}
              alt="Healthcare students practicing patient care skills in a training lab"
            />
            <img
              src={admissionsLabPhoto}
              alt="Instructor guiding students through a clinical classroom exercise"
            />
          </div>

          <div className="visual-story-copy">
            <p className="section-kicker">Rewards & Guidance</p>
            <h2>Support that helps students keep moving before, during, and after training.</h2>
            <div className="support-feature-list">
              {homeSupportItems.map((item) => (
                <article key={item.title} className="support-card">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
            <Link to="/rewards-guidance" className="card-action-link">
              Reward & Guidance
            </Link>
          </div>
        </div>
      </section>

      <section className="section modern-trust-section" id="about-us">
        <div className="container modern-trust-layout">
          <div className="modern-trust-copy">
            <p className="section-kicker">About First Step</p>
            <h2>Built for students who want a clear, supported start in healthcare.</h2>
            <p>
              First Step Healthcare Academy combines practical CNA training, direct admissions
              guidance, and transparent program details so students and families can make enrollment
              decisions with more confidence.
            </p>
          </div>

          <div className="modern-trust-grid" aria-label="School trust signals">
            {trustProofItems.map((item) => (
              <article key={item.title} className="modern-trust-card">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft home-program-section">
        <div className="container section-heading">
          <div>
            <p className="section-kicker">CNA Program</p>
            <h2>Explore CNA training with the key details already surfaced.</h2>
          </div>
          <p>
            Students can review delivery format, timeline, and admissions context before they ever
            contact the school.
          </p>
        </div>

        <div className="container home-program-schedule-grid">
          <div className="home-program-card-list">
            {programs.slice(0, 1).map((program) => {
            const meta = programMeta[program.id] ?? {
              tag: "Program",
              badge: "Admissions Ready",
              detail: "Structured for clearer comparison and faster decisions.",
            };

            return (
              <article key={program.id} className="program-card">
                <div className="program-topline">
                  <span>{meta.tag}</span>
                  <strong>{meta.badge}</strong>
                </div>
                <h3>{program.title}</h3>
                <p>{program.summary}</p>
                <ul className="detail-list">
                  <li>Duration: {program.duration}</li>
                  <li>Schedule: {program.schedule}</li>
                  <li>{meta.detail}</li>
                </ul>
              </article>
            );
            })}
          </div>
          <article className="info-card home-schedule-card">
            <p className="section-kicker">Schedule</p>
            <h3>Add schedule review to your next step.</h3>
            <p>
              Compare approved class dates, meeting patterns, seat availability, and payment timing
              before starting registration.
            </p>
            <Link to="/schedule" className="btn btn-secondary">
              View Schedule
            </Link>
          </article>
        </div>
      </section>

      <section className="section handout-section">
        <div className="container handout-layout">
          <div className="handout-copy">
            <p className="handout-pill">Free resources for your journey</p>
            <h2>Take the First Step Toward Your Nursing Future.</h2>
            <p>
              Download two free handouts created to help future nursing students and working adults
              plan with clarity and confidence.
            </p>
            <div className="handout-benefits" aria-label="Handout benefits">
              <span>Expertly prepared</span>
              <span>Plan with clarity</span>
              <span>Build confidence</span>
              <span>Create your future</span>
            </div>
            <form className="handout-form" onSubmit={handleHandoutSubmit}>
              <h3>Get Your Free Handouts Now.</h3>
              <div className="form-grid two-up">
                <label>
                  <span>First name *</span>
                  <input name="firstName" value={handoutForm.firstName} onChange={updateHandoutField} required />
                </label>
                <label>
                  <span>Last name *</span>
                  <input name="lastName" value={handoutForm.lastName} onChange={updateHandoutField} required />
                </label>
                <label>
                  <span>Email address *</span>
                  <input
                    name="email"
                    type="email"
                    value={handoutForm.email}
                    onChange={updateHandoutField}
                    required
                  />
                </label>
                <label>
                  <span>Phone number</span>
                  <input name="phone" type="tel" value={handoutForm.phone} onChange={updateHandoutField} />
                </label>
              </div>
              <TurnstileWidget
                onToken={setHandoutTurnstileToken}
                onExpire={() => setHandoutTurnstileToken("")}
                onError={() => setHandoutTurnstileToken("")}
                resetSignal={handoutTurnstileResetSignal}
              />
              <button className="btn btn-primary" type="submit" disabled={handoutPending}>
                {handoutPending ? "Sending..." : "Send Me My Free Handouts"}
              </button>
              {handoutStatus.text ? (
                <p
                  className={`form-status ${handoutStatus.type === "success" ? "is-success" : "is-error"}`}
                  role={handoutStatus.type === "success" ? "status" : "alert"}
                >
                  {handoutStatus.text}
                </p>
              ) : null}
            </form>
          </div>

          <div className="handout-visual" aria-label="Free handouts">
            <p>You will receive instant access to:</p>
            <div className="handout-cover-row">
              <article className="handout-cover cna-cover">
                <span>First Step</span>
                <h3>CNA Career Starter Guide</h3>
                <p>A guide to patient care, training, work settings, and future nursing growth.</p>
              </article>
              <article className="handout-cover pathway-cover">
                <span>First Step</span>
                <h3>OC Nursing School Pathway Guide</h3>
                <p>Plan your path, prepare with purpose, and move forward with confidence.</p>
              </article>
            </div>
            <div className="trusted-handout-card">
              <strong>Trusted. Local. Student-Focused.</strong>
              <span>
                First Step Healthcare Academy is dedicated to helping future nursing and healthcare
                professionals build strong beginnings.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container split-panel">
          <article className="info-card">
            <p className="section-kicker">Tuition snapshot</p>
            <h2>Published tuition and fee context stay easy to review.</h2>
            <div className="stack-panel">
              {tuitionItems.map((item) => (
                <div key={item.title} className="tuition-line">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span>{item.amount}</span>
                </div>
              ))}
            </div>
            <ul className="detail-list compact-list">
              {miscFeeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="info-card requirements-summary-card">
            <p className="section-kicker">Requirements</p>
            <h2>Know the core admissions requirements before you register.</h2>
            <ul className="detail-list compact-list">
              {requirementItems.slice(0, 5).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link to="/admissions" className="text-link">
              See the full admissions checklist
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
