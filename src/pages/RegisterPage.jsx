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

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);
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
  const registrationSteps = [
    "Choose the program that matches your goal.",
    "Select the cohort with the best timing and available seats.",
    "Choose full tuition or a published deposit plan before checkout or admissions follow-up.",
  ];
  const dueTodayCents =
    selectedCohort && enrollmentForm.paymentOption === "deposit" && selectedCohort.allowPaymentPlan
      ? selectedCohort.paymentPlanDepositCents ?? 0
      : selectedCohort?.tuitionCents ?? 0;
  const remainingBalanceCents =
    selectedCohort && enrollmentForm.paymentOption === "deposit" && selectedCohort.allowPaymentPlan
      ? selectedCohort.paymentPlanRemainingCents ?? 0
      : 0;

  return (
    <section className="section">
      <PageIntro
        kicker="Registration"
        title="Reserve a seat with a registration flow that stays clear from cohort selection to checkout."
        description="Choose a program, confirm the right cohort, and submit one organized student record before payment or admissions follow-up."
        accent="Ready-to-enroll workflow"
        note="Program choice, cohort details, and student intake stay connected."
      />

      <div className="container register-layout">
        <article className="register-intro">
          <p className="section-kicker">Registration guide</p>
          <h2>Everything a student needs before checkout is grouped in one place.</h2>
          <p>
            Review the basics, choose the right class option, and keep the important next-step
            details visible while the form is being completed.
          </p>
          <div className="register-checkpoints">
            {registrationSteps.map((item, index) => (
              <div key={item} className="checkpoint-item">
                <span className="checkpoint-number">{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>

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
                {selectedCohort.allowPaymentPlan ? (
                  <li>
                    Payment plan: {selectedCohort.paymentPlanDepositLabel} deposit, then{" "}
                    {selectedCohort.paymentPlanRemainingLabel} remaining
                  </li>
                ) : null}
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
          <p className="form-helper">Choose a program and cohort, then submit student details for the next step.</p>
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

            {selectedCohort ? (
              <section className="payment-choice-block">
                <div className="payment-choice-copy">
                  <span className="section-kicker">Payment setup</span>
                  <h3>Choose how this seat should be reserved.</h3>
                  <p>
                    The amount due today changes immediately. If you choose a deposit, admissions will collect the
                    remaining balance before class start.
                  </p>
                </div>

                <div className="payment-choice-grid">
                  <label className={`payment-choice-card ${enrollmentForm.paymentOption === "full" ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="full"
                      checked={enrollmentForm.paymentOption === "full"}
                      onChange={onInput}
                    />
                    <span>Pay in full</span>
                    <strong>{selectedCohort.tuitionLabel}</strong>
                    <small>Complete tuition now and confirm the seat after payment clears.</small>
                  </label>

                  <label
                    className={`payment-choice-card ${
                      enrollmentForm.paymentOption === "deposit" ? "is-selected" : ""
                    } ${selectedCohort.allowPaymentPlan ? "" : "is-disabled"}`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="deposit"
                      checked={enrollmentForm.paymentOption === "deposit"}
                      onChange={onInput}
                      disabled={!selectedCohort.allowPaymentPlan}
                    />
                    <span>Pay deposit</span>
                    <strong>
                      {selectedCohort.allowPaymentPlan
                        ? selectedCohort.paymentPlanDepositLabel
                        : "Not available"}
                    </strong>
                    <small>
                      {selectedCohort.allowPaymentPlan
                        ? `${selectedCohort.paymentPlanRemainingLabel} stays due later through admissions.`
                        : "This cohort requires full tuition at checkout."}
                    </small>
                  </label>
                </div>

                <div className="payment-breakdown">
                  <div>
                    <span>Due today</span>
                    <strong>{formatMoney(dueTodayCents)}</strong>
                  </div>
                  <div>
                    <span>Remaining balance</span>
                    <strong>{formatMoney(remainingBalanceCents)}</strong>
                  </div>
                  <div>
                    <span>Payment path</span>
                    <strong>{selectedCohort.allowPaymentPlan && enrollmentForm.paymentOption === "deposit" ? "Deposit plan" : "Paid in full"}</strong>
                  </div>
                </div>
              </section>
            ) : null}

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
              {enrollmentPending
                ? "Preparing checkout..."
                : enrollmentForm.paymentOption === "deposit"
                  ? "Start Deposit Checkout"
                  : "Start Enrollment"}
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
