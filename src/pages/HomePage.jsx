import { Link } from "react-router-dom";
import admissionsLabPhoto from "../assets/admissions-lab-photo.jpg";
import heroTraining from "../assets/hero-training-photo-v2.jpg";
import programsSupportPhoto from "../assets/programs-support-photo.jpg";
import {
  aboutLeaderItems,
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
    { label: "Hands-on training" },
    { label: "Career-focused programs" },
    { label: "Supportive instructors" },
  ];
  const heroAssuranceItems = [
    ["Current program", "CNA"],
    ["Training path", "160 hrs"],
    ["Admissions help", "Direct"],
  ];
  const gettingStartedSteps = [
    {
      title: "Choose a program",
      detail: "Review the CNA program format, schedule, tuition, and admissions requirements.",
      to: "/programs",
    },
    {
      title: "Submit your application",
      detail: "Send your enrollment details or contact admissions for help before applying.",
      to: "/register",
    },
    {
      title: "Begin training",
      detail: "Complete onboarding, prepare required documents, and start your healthcare training path.",
      to: "/schedule",
    },
  ];
  const decisionStats = [
    { value: "160 hrs", label: "approved program length" },
    { value: "Hybrid", label: "online theory and in-person clinicals" },
    { value: "Orange", label: "California training location" },
  ];

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
            <h1 className="hero-title" aria-label="Start your healthcare career with confidence">
              <span>Start Your Healthcare Career</span>
              <span>With Confidence</span>
            </h1>
            <p className="hero-text">
              First Step Healthcare Academy helps students train for healthcare careers through
              hands-on CNA instruction, clear admissions guidance, and practical support from first
              inquiry through enrollment.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary">
                Enroll Now
              </Link>
              <Link to="/programs" className="btn btn-secondary">
                View Programs
              </Link>
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
                fetchPriority="high"
              />
              <div className="hero-status-chip">Now enrolling</div>
              <div className="hero-photo-badge">
                <span>Healthcare training</span>
                <strong>CNA classroom instruction, skills lab preparation, and admissions support</strong>
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

      </section>

      <section className="section section-soft home-programs-section" id="home-programs">
        <div className="container section-heading">
          <div>
            <p className="section-kicker">Programs</p>
            <h2>Healthcare training with the key details up front.</h2>
          </div>
          <p>
            Start by reviewing the available CNA training path, format, duration, and next step
            before you apply.
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
              <article key={program.id} className="program-card featured-program-card">
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
                <div className="program-card-actions">
                  <Link to="/programs" className="card-action-link">
                    Learn More
                  </Link>
                  <Link to={`/register?programId=${program.id}`} className="card-action-link">
                    Enroll
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section why-choose-section">
        <div className="container section-heading">
          <div>
            <p className="section-kicker">Why Choose First Step Healthcare Academy?</p>
            <h2>Built for students who want a clear, supported start.</h2>
          </div>
          <p>
            The academy focuses on practical preparation, approachable admissions support, and
            training details students can understand before making an enrollment decision.
          </p>
        </div>

        <div className="container card-grid four-up why-card-grid">
          {supportItems.map((item, index) => (
            <article key={item.title} className="support-card why-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-soft get-started-section">
        <div className="container section-heading">
          <div>
            <p className="section-kicker">How to Get Started</p>
            <h2>Three steps from interest to training.</h2>
          </div>
          <p>
            Students can move at their own pace while keeping the important enrollment tasks easy
            to find.
          </p>
        </div>

        <div className="container hero-pathway get-started-grid" aria-label="Enrollment steps">
          {gettingStartedSteps.map((item, index) => (
            <Link key={item.title} to={item.to} className="training-phase-card">
              <span>{`0${index + 1}`}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </Link>
          ))}
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
        <div className="container visual-story-showcase">
          <div className="visual-story-media">
            <img
              src={programsSupportPhoto}
              alt="Healthcare students practicing patient care skills in a training lab"
              loading="lazy"
              decoding="async"
            />
            <img
              src={admissionsLabPhoto}
              alt="Instructor guiding students through a clinical classroom exercise"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="visual-story-copy">
            <p className="section-kicker">Rewards & Guidance</p>
            <h2>Support that helps students keep moving before, during, and after training.</h2>
            <div className="support-feature-list">
              {rewardsGuidanceItems.map((item) => (
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

      <section className="section about-us-section" id="about-us">
        <div className="container about-us-layout">
          <div className="about-us-copy">
            <p className="section-kicker">About Us</p>
            <h2>Founded to make the first step into healthcare feel clear and supported.</h2>
            <p>
              First Step Healthcare Academy is led by people who understand that starting a
              healthcare career can feel overwhelming. Our leadership team focuses on practical
              training, clear communication, and a student experience that helps each learner move
              forward with confidence.
            </p>
          </div>

          <div className="about-leader-grid" aria-label="First Step Healthcare Academy leadership">
            {aboutLeaderItems.map((item) => (
              <article key={item.role} className="about-leader-card">
                <span>{item.role}</span>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
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
