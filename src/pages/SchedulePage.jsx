import { Link } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";

function getSeatTone(remainingSeats) {
  if (remainingSeats <= 4) {
    return "is-limited";
  }

  if (remainingSeats <= 10) {
    return "is-filling";
  }

  return "is-open";
}

function buildRegisterUrl(cohort) {
  const params = new URLSearchParams({
    programId: cohort.programId,
    cohortId: cohort.id,
  });
  return `/register?${params.toString()}`;
}

export function SchedulePage({ cohorts, cohortLoadError }) {
  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Schedule"
        title="Compare upcoming CNA cohorts."
        description="Compare current CNA cohorts by schedule format and tuition so students can identify the right track before they register."
        accent="Real class visibility"
        note="Exact public cohort dates are coming soon while approved calendars are finalized."
      />

      <div className="container">
        {cohortLoadError ? <p className="section-note">{cohortLoadError}</p> : null}

        <div className="card-grid three-up">
          {cohorts.map((cohort) => (
            <article key={cohort.id} className="schedule-card">
              <div className="schedule-card-top">
                <p className="section-kicker">{cohort.scheduleLabel}</p>
                <span className={`seat-pill ${getSeatTone(cohort.remainingSeats)}`}>
                  {cohort.remainingSeats} seats left
                </span>
              </div>
              <h3>{cohort.title}</h3>
              <p className="schedule-program">{cohort.programTitle}</p>
              <ul className="detail-list">
                <li>Dates: Coming soon</li>
                <li>Schedule: {cohort.meetingPattern}</li>
                <li>Program total: {cohort.tuitionLabel}</li>
                <li>Remaining seats: {cohort.remainingSeats}</li>
              </ul>
              <p className="card-note">Registration stays tied to the selected cohort and pricing.</p>
              <Link to={buildRegisterUrl(cohort)} className="card-action-link">
                Register for this cohort
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="container card-grid two-up">
        <article className="info-card">
          <p className="section-kicker">Before you choose</p>
          <h3>Make sure the complete training schedule fits your life.</h3>
          <p>
            Review online theory hours, in-person clinical days, transportation needs, document
            deadlines, and the full payment schedule before reserving a seat.
          </p>
        </article>

        <article className="info-card">
          <p className="section-kicker">Need help deciding?</p>
          <h3>Admissions can help you compare cohort timing and requirements.</h3>
          <p>
            Ask about schedule fit, tuition, payment options, or documents before you begin the
            registration process.
          </p>
          <Link to="/contact" className="card-action-link">Talk to admissions</Link>
        </article>
      </div>
    </section>
  );
}
