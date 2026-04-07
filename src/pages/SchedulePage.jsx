import { PageIntro } from "../components/PageIntro";

function formatDateLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function SchedulePage({ cohorts, cohortLoadError }) {
  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Schedule"
        title="See upcoming class dates, meeting times, pricing, and seat visibility in one place."
        description="This page is arranged to feel closer to the reference site: schedule-first, easier to scan, and built around real cohort timing instead of generic filler."
        accent="Schedule-first presentation"
        note="Students can compare tracks before they ever reach the registration form."
      />

      <div className="container">
        {cohortLoadError ? <p className="section-note">{cohortLoadError}</p> : null}

        <div className="card-grid three-up">
          {cohorts.map((cohort) => (
            <article key={cohort.id} className="schedule-card">
              <p className="section-kicker">{cohort.programTitle}</p>
              <h3>{cohort.title}</h3>
              <ul className="detail-list">
                <li>
                  Dates: {formatDateLabel(cohort.startDate)} to {formatDateLabel(cohort.endDate)}
                </li>
                <li>Schedule: {cohort.meetingPattern}</li>
                <li>Tuition: {cohort.tuitionLabel}</li>
                <li>Remaining seats: {cohort.remainingSeats}</li>
              </ul>
              <p className="card-note">Registration stays tied to the selected cohort and pricing.</p>
            </article>
          ))}
        </div>
      </div>

      <div className="container card-grid two-up">
        <article className="info-card">
          <p className="section-kicker">Why this layout</p>
          <h3>Schedules now lead the page instead of hiding behind general marketing copy.</h3>
          <p>
            That matches how students usually browse schools like this: they want dates, meeting
            patterns, and seat context before anything else.
          </p>
        </article>

        <article className="info-card">
          <p className="section-kicker">Next step</p>
          <h3>Once a student sees the right track, they can move straight into registration.</h3>
          <p>
            The public schedule and the registration form now speak the same language, which makes
            the experience feel much more intentional.
          </p>
        </article>
      </div>
    </section>
  );
}
