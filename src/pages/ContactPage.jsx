import { PageIntro } from "../components/PageIntro";
import { contactDetails, faqItems } from "../siteData";

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
        title="Talk to admissions directly when timing, program choice, or documents need clarification."
        description="The contact page is now structured more like the reference site: direct contact info first, then inquiry and follow-up forms."
        accent="Admissions-first contact page"
        note="Direct phone, email, office details, and forms all stay visible together."
      />

      <div className="container split-panel">
        <article className="info-card dark-card">
          <p className="section-kicker">Admissions desk</p>
          <h2>Talk to a real person when timing or program choice needs clarity.</h2>
          <ul className="detail-list">
            <li>Coordinator: {contactDetails.coordinator}</li>
            <li>Phone: {contactDetails.phone}</li>
            <li>Email: {contactDetails.email}</li>
            <li>Address: {contactDetails.address}</li>
            <li>Office hours: {contactDetails.officeHours}</li>
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
          <h3>Request cohort updates and admissions follow-up</h3>
          <p>
            If a student is not ready to register yet, this form keeps them in the pipeline for
            new class dates, added sections, and admissions updates.
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

      <div className="container card-grid three-up">
        {faqItems.map((item) => (
          <article key={item.question} className="info-card">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
