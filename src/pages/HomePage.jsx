import { Link } from "react-router-dom";
import heroTraining from "../assets/hero-training.svg";
import { announcementCards, proofPoints, quickLinks } from "../siteData";

export function HomePage({ cohorts, programs }) {
  const openSeats = cohorts.reduce((total, cohort) => total + Math.max(cohort.remainingSeats ?? 0, 0), 0);
  const heroHighlights = [
    { value: String(programs.length), label: "career training paths" },
    { value: String(cohorts.length), label: "upcoming cohorts" },
    { value: String(openSeats), label: "seats currently open" },
  ];

  return (
    <>
      <section className="hero-panel">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">First Step Healthcare Academy</p>
            <h1>Healthcare training with a clearer path from first click to first class.</h1>
            <p className="hero-text">
              Explore programs, compare schedules, register for a live cohort, and move into
              payment without losing your place or guessing what comes next.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary">
                Start Enrollment
              </Link>
              <Link to="/programs" className="btn btn-ghost">
                View Programs
              </Link>
            </div>

            <div className="metric-strip">
              {heroHighlights.map((item) => (
                <article key={item.label} className="metric-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>

            <ul className="hero-list">
              {proofPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-card">
              <img src={heroTraining} alt="Illustration of a healthcare training workflow" />
            </div>
            <div className="hero-floating-panel">
              <p>Admissions support available by phone and email</p>
              <strong>{cohorts.length} cohorts currently published for registration</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="quick-grid">
            {quickLinks.map((item) => (
              <Link key={item.title} to={item.to} className="quick-card">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <span>View page</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container card-grid three-up">
          {announcementCards.map((item) => (
            <article key={item.label} className="info-card">
              <p className="section-kicker">{item.label}</p>
              <h3>{item.value}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
