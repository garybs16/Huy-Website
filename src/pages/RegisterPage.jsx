import { PageIntro } from "../components/PageIntro";
import { registrationChecklist } from "../siteData";

function formatDateLabel(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function RegisterPage({
  programs,
  cohorts,
  filteredCohorts,
  selectedCohort,
  enrollmentForm,
  enrollmentPending,
  enrollmentStatus,
  cohortLoadError,
  onInput,
  onSubmit,
}) {
  return (
    <section className="section">
      <PageIntro
        kicker="Registration"
        title="Reserve a seat with a registration flow that now fits the rest of the redesigned site."
        description="Choose a program, select a cohort, and submit one structured student record before moving into payment or admissions follow-up."
        accent="Registration matches the public site"
        note="Program, cohort, student record, and payment handoff now feel like one system."
      />

      <div className="container register-layout">
        <article className="register-intro">
          <p className="section-kicker">Registration guide</p>
          <h2>Everything a student needs before checkout is grouped in one place.</h2>
          <p>
            This page now feels closer to the reference site by keeping the selection, intake, and
            next-step context visible while the student fills out the form.
          </p>

          {selectedCohort ? (
            <div className="register-summary">
              <p className="section-kicker">Selected cohort</p>
              <h3>{selectedCohort.title}</h3>
              <ul className="detail-list">
                <li>{selectedCohort.programTitle}</li>
                <li>
                  Dates: {formatDateLabel(selectedCohort.startDate)} to {formatDateLabel(selectedCohort.endDate)}
                </li>
                <li>Schedule: {selectedCohort.meetingPattern}</li>
                <li>Tuition: {selectedCohort.tuitionLabel}</li>
                <li>Remaining seats: {selectedCohort.remainingSeats}</li>
              </ul>
            </div>
          ) : (
            <div className="register-summary">
              <p className="section-kicker">What to prepare</p>
              <h3>Registration checklist</h3>
              <ul className="detail-list">
                {registrationChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className="form-card register-form-card">
          <h2>Start Enrollment</h2>
          {cohortLoadError ? <p className="section-note">{cohortLoadError}</p> : null}

          <form className="form-stack" onSubmit={onSubmit}>
            <div className="form-grid two-up">
              <label>
                <span>Student full name</span>
                <input name="studentFullName" value={enrollmentForm.studentFullName} onChange={onInput} required />
              </label>
              <label>
                <span>Date of birth</span>
                <input name="dateOfBirth" type="date" value={enrollmentForm.dateOfBirth} onChange={onInput} required />
              </label>
            </div>

            <div className="form-grid two-up">
              <label>
                <span>Email</span>
                <input name="email" type="email" value={enrollmentForm.email} onChange={onInput} required />
              </label>
              <label>
                <span>Phone</span>
                <input name="phone" type="tel" value={enrollmentForm.phone} onChange={onInput} />
              </label>
            </div>

            <label>
              <span>Street address</span>
              <input name="addressLine1" value={enrollmentForm.addressLine1} onChange={onInput} required />
            </label>

            <div className="form-grid three-up">
              <label>
                <span>City</span>
                <input name="city" value={enrollmentForm.city} onChange={onInput} required />
              </label>
              <label>
                <span>State</span>
                <input name="state" value={enrollmentForm.state} onChange={onInput} maxLength={2} required />
              </label>
              <label>
                <span>ZIP code</span>
                <input name="postalCode" value={enrollmentForm.postalCode} onChange={onInput} required />
              </label>
            </div>

            <div className="form-grid two-up">
              <label>
                <span>Emergency contact</span>
                <input
                  name="emergencyContactName"
                  value={enrollmentForm.emergencyContactName}
                  onChange={onInput}
                  required
                />
              </label>
              <label>
                <span>Emergency phone</span>
                <input
                  name="emergencyContactPhone"
                  type="tel"
                  value={enrollmentForm.emergencyContactPhone}
                  onChange={onInput}
                  required
                />
              </label>
            </div>

            <div className="form-grid two-up">
              <label>
                <span>Program</span>
                <select name="programId" value={enrollmentForm.programId} onChange={onInput} required>
                  <option value="" disabled>
                    Select a program
                  </option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Cohort</span>
                <select
                  name="cohortId"
                  value={enrollmentForm.cohortId}
                  onChange={onInput}
                  required
                  disabled={!enrollmentForm.programId}
                >
                  <option value="" disabled>
                    {enrollmentForm.programId ? "Select a cohort" : "Choose a program first"}
                  </option>
                  {filteredCohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id} disabled={cohort.remainingSeats <= 0}>
                      {`${cohort.title} | ${formatDateLabel(cohort.startDate)} | ${cohort.remainingSeats} seats left`}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>Admissions notes</span>
              <textarea
                name="notes"
                rows="4"
                value={enrollmentForm.notes}
                onChange={onInput}
                placeholder="Add scheduling requests, document status, or extra context."
              />
            </label>

            <button type="submit" className="btn btn-primary" disabled={enrollmentPending || cohorts.length === 0}>
              {enrollmentPending ? "Preparing checkout..." : "Start Enrollment"}
            </button>
          </form>

          {enrollmentStatus.text ? (
            <p className={`form-status ${enrollmentStatus.type === "success" ? "is-success" : "is-error"}`}>
              {enrollmentStatus.text}
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
