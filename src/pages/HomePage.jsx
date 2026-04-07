import { Link } from "react-router-dom";
import heroTraining from "../assets/hero-training-photo.jpg";
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
  const heroHighlights = [
    { value: String(programs.length), label: "published training paths" },
    { value: String(cohorts.length), label: "active class options" },
    { value: String(openSeats), label: "visible seats across cohorts" },
  ];

  return (
    <>
      <section className="hero-panel">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Get your next healthcare credential</p>
            <h1>Healthcare career training with a cleaner, admissions-first presentation.</h1>
            <p className="hero-text">
              This redesign pushes the site toward the reference look and structure: visible cohort
              options, cleaner tuition sections, stronger calls to action, and a more direct path
              from interest to enrollment.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary">
                Register Now
              </Link>
              <Link to="/programs" className="btn btn-ghost">
                View Programs
              </Link>
            </div>

            <p className="hero-inline-note">
              Weekday, weekend, evening, and short-format options stay visible without forcing
              students to dig through the site.
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
                alt="Healthcare students and an instructor during hands-on clinical training"
              />
              <div className="hero-photo-badge">
                <span>Admissions-guided enrollment</span>
                <strong>Clearer path from homepage to checkout</strong>
              </div>
            </div>

            <div className="hero-floating-panel hero-schedule-panel">
              <p className="section-kicker">Featured class tracks</p>
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
              <p className="section-kicker">In brief</p>
              <h2>First Step Healthcare Academy now presents programs, schedules, and registration like a real admissions site.</h2>
            </div>
            <p>
              Students can compare options faster, see live class timing sooner, and move into
              enrollment without bouncing between disconnected pages.
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
            <h2>See the list of current training paths in a layout that feels closer to the reference site.</h2>
          </div>
          <p>
            Each program card keeps the delivery model, timing, and core admissions context visible
            without requiring extra clicks.
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
            <h2>Admissions help stays visible instead of getting buried under filler blocks.</h2>
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
            <h2>Students can follow a direct step-by-step process.</h2>
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
            <h2>Pricing sits in its own clear section, closer to the reference layout.</h2>
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
            <h2>Key enrollment requirements stay easy to scan before registration.</h2>
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
