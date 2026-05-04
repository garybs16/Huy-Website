import { Link } from "react-router-dom";
import admissionsLabPhoto from "../assets/admissions-lab-photo.jpg";
import academyLogo from "../assets/new-logo.jpg";
import heroTraining from "../assets/hero-training-photo-v2.jpg";
import programsSupportPhoto from "../assets/programs-support-photo.jpg";
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
    "State approved CNA program",
    "Theory and clinical classes",
    "Orange County campus",
  ];
  const heroHighlights = [
    { value: "6", label: "week CNA pathway" },
    { value: "2", label: "training portions" },
    { value: String(openSeats), label: "open seats published" },
  ];
  const trainingTimeline = [
    {
      title: "Theory Class",
      detail: "Classroom instruction, care standards, resident safety, and exam readiness.",
      to: "/schedule",
    },
    {
      title: "Clinical Class",
      detail: "Supervised hands-on practice that connects skills lab learning to patient-care settings.",
      to: "/programs",
    },
  ];
  const visualProofItems = [
    {
      src: programsSupportPhoto,
      alt: "Healthcare students practicing patient care techniques in a clinical simulation room",
      label: "Skills lab",
    },
    {
      src: admissionsLabPhoto,
      alt: "Instructor guiding healthcare students through hands-on equipment training",
      label: "Instructor guidance",
    },
    {
      src: heroTraining,
      alt: "Healthcare instructor demonstrating bedside skills while students observe",
      label: "Hands-on practice",
    },
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
            <h1 className="hero-title">
              <span>Certified Nursing Assistant</span>
              <span>in 6 Weeks</span>
            </h1>
            <p className="hero-text">
              State approved nursing assistant program. First Step Healthcare Academy stays aligned
              with California compliance requirements so students can train with clear expectations
              from the start.
            </p>

            <div className="training-timeline" aria-label="CNA training timeline">
              {trainingTimeline.map((item, index) => (
                <Link key={item.title} to={item.to} className="training-phase-card">
                  <span>{`0${index + 1}`}</span>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </Link>
              ))}
            </div>

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
              Compare theory and clinical timelines before registration so your schedule, documents,
              and start-date goals stay clear.
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

            <div className="hero-proof-grid" aria-label="Training environment photos">
              {visualProofItems.map((item) => (
                <figure key={item.label} className="hero-proof-card">
                  <img src={item.src} alt={item.alt} />
                  <figcaption>{item.label}</figcaption>
                </figure>
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
              Health care and social assistance grew by <span>680,500 jobs</span>.
            </h2>
            <p>
              From March 2025 to March 2026, the U.S. Bureau of Labor Statistics reported a 2.9%
              employment increase across health care and social assistance. CNA training gives
              students a practical first step into that growing workforce.
            </p>

            <div className="impact-stat-row" aria-label="Healthcare employment statistics">
              <article>
                <strong>680,500</strong>
                <span>more jobs</span>
              </article>
              <article>
                <strong>2.9%</strong>
                <span>employment growth</span>
              </article>
              <article>
                <strong>CNA</strong>
                <span>direct patient-care pathway</span>
              </article>
            </div>

            <div className="quick-grid impact-links">
              {quickLinks.map((item) => (
                <Link key={item.title} to={item.to} className="quick-card">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <span>Open page</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="workforce-poster" aria-label="Healthcare workforce growth visual">
            <div className="poster-copy">
              <span>Healthcare workforce growth</span>
              <strong>680,500</strong>
              <p>new health care and social assistance jobs from March 2025 to March 2026</p>
            </div>
            <div className="poster-photo-band">
              <img src={programsSupportPhoto} alt="Healthcare students in scrubs training together" />
              <img src={admissionsLabPhoto} alt="Instructor guiding students through healthcare training" />
            </div>
            <div className="poster-footer">
              <span>Stronger workforce</span>
              <span>Stronger communities</span>
              <span>Brighter future</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section visual-story-section">
        <div className="container visual-story-grid">
          <div className="visual-feature">
            <img src={programsSupportPhoto} alt="Students in scrubs practicing patient care in a classroom lab" />
            <div className="visual-feature-caption">
              <span>Career-ready classroom</span>
              <strong>Training built around real practice, clear expectations, and visible next steps.</strong>
            </div>
          </div>

          <div className="visual-story-copy">
            <p className="section-kicker">Student experience</p>
            <h2>Show the training environment before students ever call admissions.</h2>
            <p>
              Photos of the lab, instructors, and student practice make the school feel concrete,
              local, and easier to trust for applicants comparing programs.
            </p>
            <div className="visual-brand-panel">
              <img src={academyLogo} alt="First Step Healthcare Academy logo" />
              <div>
                <strong>First Step Healthcare Academy</strong>
                <span>Your first step into healthcare training in Orange, California.</span>
              </div>
            </div>
          </div>

          <div className="visual-stack">
            <img src={admissionsLabPhoto} alt="Healthcare instructor leading students through clinical equipment training" />
            <img src={heroTraining} alt="Instructor demonstrating bedside care skills during healthcare training" />
          </div>
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
