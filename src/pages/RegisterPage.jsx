import { useEffect, useMemo, useRef } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Link } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";
import { TurnstileWidget } from "../components/TurnstileWidget";
import { registrationChecklist } from "../siteData";

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
  checkoutClientSecret,
  cohortLoadError,
  onInput,
  onSubmit,
  turnstile,
}) {
  const checkoutPanelRef = useRef(null);
  const stripePromise = useMemo(() => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
    return publishableKey ? loadStripe(publishableKey) : null;
  }, []);

  useEffect(() => {
    if (checkoutClientSecret) {
      checkoutPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [checkoutClientSecret]);

  const registrationSteps = ["Student details", "Training plan", "Eligibility & policy", "Confirmation", "Payment"];
  const isPaymentPlan = ["weekly", "biweekly"].includes(enrollmentForm.paymentOption);
  const dueTodayCents =
    selectedCohort && isPaymentPlan && selectedCohort.allowPaymentPlan
      ? selectedCohort.paymentPlanDepositCents ?? 0
      : selectedCohort?.tuitionCents ?? 0;
  const remainingBalanceCents =
    selectedCohort && isPaymentPlan && selectedCohort.allowPaymentPlan
      ? selectedCohort.paymentPlanRemainingCents ?? 0
      : 0;
  const paymentPath = enrollmentForm.paymentOption === "weekly"
    ? "12 weekly tuition payments"
    : enrollmentForm.paymentOption === "biweekly"
      ? "6 biweekly tuition payments"
      : "Paid in full";

  return (
    <section className="section">
      <PageIntro
        kicker="Registration"
        title="Reserve a seat with a registration flow that stays clear from cohort selection to checkout."
        description="Choose the CNA program, confirm the right cohort, and submit one organized student record before payment or admissions follow-up."
        accent="Ready-to-enroll workflow"
        note="CNA program choice, cohort details, and student intake stay connected."
      />

      <div className="container register-layout">
        <article className="register-intro">
          <p className="section-kicker">Registration guide</p>
          <h2>Everything a student needs before checkout is grouped in one place.</h2>
          <p>
            Review the basics, choose the right class option, and keep the important next-step
            details visible while the form is being completed.
          </p>
          <div className="registration-policy-callout">
            <p className="section-kicker">Before you submit</p>
            <h3>Review refund and payment policies before checkout.</h3>
            <p>
              Refund eligibility depends on withdrawal timing, completed course hours, payment-plan
              status, and program standing.
            </p>
            <Link to="/admissions#refund-policy" className="card-action-link">
              View refund policy
            </Link>
          </div>
            <div className="register-checkpoints enrollment-process-steps" aria-label="Enrollment process">
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
                <li>Dates: Coming soon</li>
                <li>Schedule: {selectedCohort.meetingPattern}</li>
                <li>Program total: {selectedCohort.tuitionLabel}</li>
                <li>Remaining seats: {selectedCohort.remainingSeats}</li>
                {selectedCohort.allowPaymentPlan ? (
                  <li>
                    Payment plans: {selectedCohort.paymentPlanDepositLabel} registration fee, then 12 weekly payments of $137.50 or 6 biweekly payments of $275
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
          <p className="form-helper">Complete each section, review the required policies, and confirm the payment schedule before checkout.</p>
          {cohortLoadError ? <p className="section-note">{cohortLoadError}</p> : null}

          <form className="form-stack" onSubmit={onSubmit}>
            <fieldset className="enrollment-form-section">
              <legend><span>1</span> Student details</legend>
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
                <input name="phone" type="tel" value={enrollmentForm.phone} onChange={onInput} required />
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
            </fieldset>

            <fieldset className="enrollment-form-section">
              <legend><span>2</span> Training plan</legend>
            <div className="form-grid two-up">
              <label>
                <span>CNA program</span>
                <select name="programId" value={enrollmentForm.programId} onChange={onInput} required>
                  <option value="" disabled>
                    Select CNA program
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
                    {enrollmentForm.programId ? "Select a cohort" : "Choose the CNA program first"}
                  </option>
                  {filteredCohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id} disabled={cohort.remainingSeats <= 0}>
                      {`${cohort.title} | Coming soon | ${cohort.remainingSeats} seats left`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            </fieldset>

            {selectedCohort ? (
              <section className="payment-choice-block">
                <div className="payment-choice-copy">
                  <span className="section-kicker">Payment setup</span>
                  <h3>Choose how this seat should be reserved.</h3>
                  <p>
                    Deferred plans collect the $250 non-refundable registration fee today. Tuition begins after checkout
                    as either 12 weekly payments of $137.50 or 6 biweekly payments of $275.
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
                    <small>Complete the full program total now and confirm the seat after payment clears.</small>
                  </label>

                  <label className={`payment-choice-card ${enrollmentForm.paymentOption === "weekly" ? "is-selected" : ""} ${selectedCohort.allowPaymentPlan ? "" : "is-disabled"}`}>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="weekly"
                      checked={enrollmentForm.paymentOption === "weekly"}
                      onChange={onInput}
                      disabled={!selectedCohort.allowPaymentPlan}
                    />
                    <span>12 weekly payments</span>
                    <strong>{selectedCohort.allowPaymentPlan ? "$137.50 / week" : "Not available"}</strong>
                    <small>
                      {selectedCohort.allowPaymentPlan
                        ? `${selectedCohort.paymentPlanDepositLabel} registration today, then 12 automatic weekly tuition payments beginning in 7 days. Total: ${selectedCohort.tuitionLabel}.`
                        : "This cohort requires full tuition at checkout."}
                    </small>
                  </label>

                  <label className={`payment-choice-card ${enrollmentForm.paymentOption === "biweekly" ? "is-selected" : ""} ${selectedCohort.allowPaymentPlan ? "" : "is-disabled"}`}>
                    <input type="radio" name="paymentOption" value="biweekly" checked={enrollmentForm.paymentOption === "biweekly"} onChange={onInput} disabled={!selectedCohort.allowPaymentPlan} />
                    <span>6 biweekly payments</span>
                    <strong>{selectedCohort.allowPaymentPlan ? "$275 / 2 weeks" : "Not available"}</strong>
                    <small>{selectedCohort.allowPaymentPlan ? `${selectedCohort.paymentPlanDepositLabel} registration today, then 6 automatic biweekly tuition payments beginning in 14 days. Total: ${selectedCohort.tuitionLabel}.` : "This cohort requires full tuition at checkout."}</small>
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
                    <strong>{paymentPath}</strong>
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

            <fieldset className="enrollment-form-section policy-acknowledgment-section">
              <legend><span>3</span> Eligibility and policy review</legend>
              <details>
                <summary>Review Terms of Service and student responsibilities</summary>
                <p>Students must provide accurate information, meet admissions and clinical-clearance requirements, attend all required instruction, complete required theory and clinical hours, follow the Student Handbook and clinical-facility policies, and remain current on the selected payment schedule.</p>
                <p>Program completion, state-exam passage, certification, employment, wages, clinical placement, and admission to another nursing program are not guaranteed.</p>
                <Link to="/policies#terms" className="card-action-link">Read the full Terms of Service</Link>
              </details>
              <details>
                <summary>Review Privacy and Refund policies</summary>
                <p>Student information may be used to process enrollment, maintain records, collect payments, provide instruction, coordinate clinical training, communicate required updates, and satisfy regulatory obligations. Payments are processed securely through Stripe.</p>
                <Link to="/admissions#refund-policy" className="card-action-link">Open the full Refund and Cancellation Policy</Link>
                <Link to="/policies#privacy" className="card-action-link">Read the full Privacy Policy</Link>
              </details>
              <label className="policy-checkbox-row">
                <input type="checkbox" name="policyAcknowledged" checked={enrollmentForm.policyAcknowledged} onChange={onInput} required />
                <span>I acknowledge that I have reviewed and agree to First Step Healthcare Academy’s Terms of Service, Privacy Policy, Refund and Cancellation Policy, and applicable Payment-Plan Terms. I understand that payment alone does not guarantee clinical placement, certification, or employment. *</span>
              </label>
              {isPaymentPlan ? (
                <label className="policy-checkbox-row">
                  <input type="checkbox" name="automaticPaymentAuthorized" checked={enrollmentForm.automaticPaymentAuthorized} onChange={onInput} required />
                  <span>I authorize First Step Healthcare Academy and Stripe to charge my selected payment method according to the payment schedule presented to me. *</span>
                </label>
              ) : null}
            </fieldset>

            <TurnstileWidget {...turnstile} />
            <button type="submit" className="btn btn-primary" disabled={enrollmentPending || cohorts.length === 0}>
              {enrollmentPending
                ? "Preparing checkout..."
                : isPaymentPlan
                  ? "Continue to Secure Payment"
                  : "Start Enrollment"}
            </button>
          </form>

          {enrollmentStatus.text ? (
            <p
              className={`form-status ${enrollmentStatus.type === "success" ? "is-success" : "is-error"}`}
              role={enrollmentStatus.type === "success" ? "status" : "alert"}
            >
              {enrollmentStatus.text}
            </p>
          ) : null}
          {checkoutClientSecret && stripePromise ? (
            <div className="embedded-checkout-panel" ref={checkoutPanelRef}>
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: checkoutClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
