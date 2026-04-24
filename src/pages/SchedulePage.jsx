import { Link } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";

function formatDateLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

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
        title="See upcoming class dates, meeting times, pricing, and open seats in one place."
        description="Compare current cohorts by program, schedule, and tuition so students can identify the right track before they register."
        accent="Real class visibility"
        note="Dates, meeting patterns, and seat availability stay visible together."
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
                <li>
                  Dates: {formatDateLabel(cohort.startDate)} to {formatDateLabel(cohort.endDate)}
                </li>
                <li>Schedule: {cohort.meetingPattern}</li>
                <li>Tuition: {cohort.tuitionLabel}</li>
                <li>Remaining seats: {cohort.remainingSeats}</li>
              </ul>
              <p className="card-note">Registration stays tied to the selected cohort and pricing.</p>
              <Link to={buildRegisterUrl(cohort)} className="card-action-link">
                Register for this track
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="container card-grid two-up">
        <article className="info-card">
          <p className="section-kicker">Why this matters</p>
          <h3>Students can compare timing, tuition, and seat availability before they commit.</h3>
          <p>
            That matches how most applicants actually browse: they want dates, meeting patterns,
            and seat context before anything else.
          </p>
        </article>

        <article className="info-card">
          <p className="section-kicker">Next step</p>
          <h3>Once a student sees the right track, they can move straight into registration.</h3>
          <p>
            The published schedule and the registration form speak the same language, which keeps
            the experience clear from first review to seat reservation.
          </p>
        </article>
      </div>
    </section>
  );
}
