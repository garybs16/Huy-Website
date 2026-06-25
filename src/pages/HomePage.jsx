import { Link } from "react-router-dom";
import heroTraining from "../assets/hero-training-photo-v2.jpg";
import {
  admissionsSteps,
  industryGrowthRows,
  miscFeeItems,
  programMeta,
  rewardsGuidanceItems,
  requirementItems,
  supportItems,
  tuitionItems,
  workforceProjectionStats,
} from "../siteData";

export function HomePage({ programs }) {
  const heroTrustItems = [
    { label: "State approved CNA program" },
    { label: "Take the Quiz Assessment", to: "/career-quiz", featured: true },
  ];
  const trainingTimeline = [
    {
      title: "Earn $100 Per Referral",
      detail: "Both the referrer and the referred student can receive $100 when an eligible referred student enrolls.",
      to: "/rewards-guidance",
    },
    {
      title: "Study Tools & Career Support",
      detail: "Students receive study guides, skills checklists, quick-reference resources, and career guidance.",
      to: "/rewards-guidance",
    },
  ];
  const decisionStats = [
    { value: "160 hrs", label: "approved program length" },
    { value: "$100", label: "eligible referral reward" },
    { value: "Direct", label: "admissions guidance" },
  ];
  return (
    <>
      <section className="hero-panel">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Healthcare career training in Orange, California</p>
            <div className="hero-trust-list" aria-label="School highlights">
              {heroTrustItems.map((item) => (
                item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`hero-trust-item ${item.featured ? "hero-trust-item-featured" : ""}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span key={item.label} className="hero-trust-item">
                    {item.label}
                  </span>
                )
              ))}
            </div>
            <h1 className="hero-title" aria-label="Certified Nursing Assistant Training">
              <span>Certified Nursing Assistant</span>
              <span>Training</span>
            </h1>
            <p className="hero-text">
              State approved nursing assistant program. First Step Healthcare Academy stays aligned
              with California compliance requirements so students can train with clear expectations
              from the start.
            </p>

            <div className="hero-decision-strip" aria-label="Program decision highlights">
              {decisionStats.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

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
              <Link to="/rewards-guidance" className="btn btn-secondary">
                Reward & Guidance
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-card">
              <img
                src={heroTraining}
                alt="Healthcare instructor guiding students through hands-on bedside skills training"
              />
              <div className="hero-status-chip">Enrollment flow live</div>
              <div className="hero-photo-badge">
                <span>Hands-on instruction</span>
                <strong>Real training, visible schedules, and a faster path to enrollment</strong>
              </div>
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
              projected to add about 2.0 million jobs from 2024 to 2034, growing 8.4% compared with
              3.1% for overall wage and salary employment.
            </p>
            <p>
              Since the elderly population is projected to climb from 59.7 million in 2024 to 72.5
              million in 2034, demand for medical and social services is expected to continue
              increasing.
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
              <span>2024-2034 projected employment growth</span>
              <strong>Healthcare leads major sectors</strong>
            </div>
            <div className="growth-bar-list">
              {industryGrowthRows.map((row) => (
                <div key={row.label} className="growth-bar-row">
                  <div className="growth-bar-label">
                    <span>{row.label}</span>
                    <strong>{row.percent}%</strong>
                  </div>
                  <div className="growth-bar-track">
                    <span style={{ width: `${(row.percent / 8.4) * 100}%` }} />
                  </div>
                  <small>{row.change} jobs</small>
                </div>
              ))}
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
        <div className="container section-heading">
          <div>
            <p className="section-kicker">Rewards & Guidance</p>
            <h2>Support that helps students keep moving before, during, and after training.</h2>
          </div>
          <Link to="/rewards-guidance" className="card-action-link">
            Reward & Guidance
          </Link>
        </div>

        <div className="container card-grid four-up">
          {rewardsGuidanceItems.map((item) => (
            <article key={item.title} className="support-card">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-soft">
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
