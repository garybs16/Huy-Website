import { PageIntro } from "../components/PageIntro";

export function ContactPage({
  programs,
  inquiryForm,
  waitlistForm,
  inquiryPending,
  waitlistPending,
  inquiryStatus,
  waitlistStatus,
  onInquiryInput,
  onWaitlistInput,
  onInquirySubmit,
  onWaitlistSubmit,
}) {
  return (
    <section className="section">
      <PageIntro
        kicker="Contact"
        title="Talk to admissions directly when you need help choosing the next step."
        description="Reach out for program guidance, cohort timing, registration support, and admissions questions."
        accent="Real support, not a dead-end form"
        note="Direct contact details and inquiry flows stay visible throughout."
      />

      <div className="container split-panel">
        <article className="info-card dark-card">
          <p className="section-kicker">Admissions desk</p>
          <h2>Talk to a real person when timing or program choice needs clarity.</h2>
          <ul className="detail-list">
            <li>Coordinator: Huy Hoang</li>
            <li>Phone: (949) 407-9581</li>
            <li>Email: huyh@firststepha.org</li>
            <li>Brand: First Step Healthcare Academy</li>
          </ul>
        </article>

        <article className="form-card">
          <h2>Request Information</h2>
          <form className="form-stack" onSubmit={onInquirySubmit}>
            <label>
              <span>Full name</span>
              <input name="fullName" value={inquiryForm.fullName} onChange={onInquiryInput} required />
            </label>
            <label>
              <span>Email address</span>
              <input name="email" type="email" value={inquiryForm.email} onChange={onInquiryInput} required />
            </label>
            <label>
              <span>Phone number</span>
              <input name="phone" type="tel" value={inquiryForm.phone} onChange={onInquiryInput} />
            </label>
            <label>
              <span>Program of interest</span>
              <select name="program" value={inquiryForm.program} onChange={onInquiryInput} required>
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
              <span>Your message</span>
              <textarea name="message" rows="4" value={inquiryForm.message} onChange={onInquiryInput} required />
            </label>
            <button type="submit" className="btn btn-primary" disabled={inquiryPending}>
              {inquiryPending ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>
          {inquiryStatus.text ? (
            <p className={`form-status ${inquiryStatus.type === "success" ? "is-success" : "is-error"}`}>
              {inquiryStatus.text}
            </p>
          ) : null}
        </article>
      </div>

      <div className="container split-panel">
        <article className="info-card">
          <p className="section-kicker">Waitlist</p>
          <h3>Request founding cohort updates</h3>
          <p>
            If you are not ready to register yet, join the interest list to hear about new class
            dates, added sections, and admissions updates.
          </p>
        </article>

        <article className="form-card">
          <h2>Join the interest list</h2>
          <form className="form-stack" onSubmit={onWaitlistSubmit}>
            <label>
              <span>Full name</span>
              <input name="fullName" value={waitlistForm.fullName} onChange={onWaitlistInput} required />
            </label>
            <label>
              <span>Email address</span>
              <input name="email" type="email" value={waitlistForm.email} onChange={onWaitlistInput} required />
            </label>
            <label>
              <span>Phone number</span>
              <input name="phone" type="tel" value={waitlistForm.phone} onChange={onWaitlistInput} />
            </label>
            <label>
              <span>Preferred track</span>
              <select name="trackPreference" value={waitlistForm.trackPreference} onChange={onWaitlistInput}>
                <option value="">Select a track</option>
                <option value="Weekday track">Weekday track</option>
                <option value="Weekend track">Weekend track</option>
                <option value="Evening track">Evening track</option>
              </select>
            </label>
            <label>
              <span>Notes</span>
              <textarea name="notes" rows="3" value={waitlistForm.notes} onChange={onWaitlistInput} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={waitlistPending}>
              {waitlistPending ? "Submitting..." : "Request Updates"}
            </button>
          </form>
          {waitlistStatus.text ? (
            <p className={`form-status ${waitlistStatus.type === "success" ? "is-success" : "is-error"}`}>
              {waitlistStatus.text}
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
