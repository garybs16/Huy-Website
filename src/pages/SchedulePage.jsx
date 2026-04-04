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
      <div className="container page-header">
        <p className="section-kicker">Schedule</p>
        <h1>See upcoming class dates, meeting times, and current seat availability.</h1>
        <p>
          Review live cohorts in one place so it is easy to compare weekday, weekend, and evening
          options before you start registration.
        </p>
      </div>

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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
