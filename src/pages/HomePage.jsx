import { Link } from "react-router-dom";
import heroTraining from "../assets/hero-training-photo-v2.jpg";
import {
  admissionsSteps,
  miscFeeItems,
  programMeta,
  quickLinks,
  requirementItems,
  supportItems,
  tuitionItems,
} from "../siteData";

function formatDateLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function HomePage({ cohorts, programs }) {
  const openSeats = cohorts.reduce((total, cohort) => total + Math.max(cohort.remainingSeats ?? 0, 0), 0);
  const primaryCohorts = cohorts.filter((cohort) => cohort.programId === "cna").slice(0, 3);
  const heroTrustItems = [
    "Orange County campus",
    "Live class visibility",
    "Direct admissions guidance",
  ];
  const heroHighlights = [
    { value: String(programs.length), label: "training paths" },
    { value: String(cohorts.length), label: "current class options" },
    { value: String(openSeats), label: "open seats published" },
  ];

  return (
    <>
      <section className="hero-panel">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Healthcare career training in Orange, California</p>
            <div className="hero-trust-list" aria-label="School highlights">
              {heroTrustItems.map((item) => (
                <span key={item} className="hero-trust-item">
                  {item}
                </span>
              ))}
            </div>
            <h1>Healthcare training in Orange with clear schedules and hands-on support.</h1>
            <p className="hero-text">
              Explore CNA, Medication Aide, and CPR/BLS training with published schedules, direct
              support, and a clear path from first interest to confirmed enrollment.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary">
                Register Now
              </Link>
              <Link to="/schedule" className="btn btn-secondary">
                See Class Dates
              </Link>
              <Link to="/programs" className="btn btn-ghost">
                View Programs
              </Link>
            </div>

            <p className="hero-inline-note">
              Weekday, weekend, evening, and short-format options stay visible so students can plan
              around work, family, and start-date goals.
            </p>

            <div className="metric-strip">
              {heroHighlights.map((item) => (
                <article key={item.label} className="metric-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-card">
              <img
                src={heroTraining}
                alt="Healthcare instructor guiding students through hands-on bedside skills training"
              />
              <div className="hero-photo-badge">
                <span>Hands-on instruction</span>
                <strong>Real training, visible schedules, and a faster path to enrollment</strong>
              </div>
            </div>

            <div className="hero-floating-panel hero-schedule-panel">
              <p className="section-kicker">Featured upcoming starts</p>
              {primaryCohorts.map((cohort) => (
                <article key={cohort.id} className="schedule-snapshot">
                  <div>
                    <strong>{cohort.title}</strong>
                    <span>{cohort.meetingPattern}</span>
                  </div>
                  <p>{`${formatDateLabel(cohort.startDate)} to ${formatDateLabel(cohort.endDate)}`}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="announcement-banner">
            <div>
              <p className="section-kicker">Why students choose First Step</p>
              <h2>Programs, schedules, and admissions details stay visible from the first visit.</h2>
            </div>
            <p>
              Students can compare options faster, reach the right contact sooner, and move into
              registration without bouncing between disconnected pages.
            </p>
          </div>
        </div>

        <div className="container quick-grid">
          {quickLinks.map((item) => (
            <Link key={item.title} to={item.to} className="quick-card">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <span>Open page</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-soft">
        <div className="container section-heading">
          <div>
            <p className="section-kicker">Programs</p>
            <h2>Explore current training paths with the key details already surfaced.</h2>
          </div>
          <p>
            Students can compare delivery format, timeline, and admissions context before they ever
            contact the school.
          </p>
        </div>

        <div className="container card-grid three-up">
          {programs.map((program) => {
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
      </section>

      <section className="section">
        <div className="container split-panel">
          <article className="info-card accent-card">
            <p className="section-kicker">Student support</p>
            <h2>Get direct guidance on schedules, documents, and readiness before you enroll.</h2>
            <div className="stack-panel">
              {supportItems.map((item) => (
                <div key={item.title} className="support-line">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="info-card">
            <p className="section-kicker">Enrollment path</p>
            <h2>A simple step-by-step path keeps the next move obvious.</h2>
            <ol className="detail-list ordered-list">
              {admissionsSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
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

          <article className="info-card">
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
