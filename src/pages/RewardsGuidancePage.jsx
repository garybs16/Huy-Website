import { useState } from "react";
import { Link } from "react-router-dom";
import heroTraining from "../assets/hero-training-photo-v2.jpg";
import programsSupport from "../assets/programs-support-photo.jpg";
import { submitInquiry } from "../lib/api";
import {
  careerSupportItems,
  referralRules,
  retentionMilestones,
  studyToolItems,
} from "../siteData";

const supportPillars = [
  { number: "01", title: "Referral rewards", text: "Eligible students can save together when program requirements are met." },
  { number: "02", title: "Retention recognition", text: "Qualifying graduates may be recognized for continuing into CNA employment." },
  { number: "03", title: "Study tools included", text: "Structured resources support theory, clinical preparation, and exam review." },
  { number: "04", title: "Career guidance", text: "Practical help for CNA jobs and longer-term healthcare education goals." },
];

const referralSteps = [
  ["Get your referral code", "After enrolling, students receive a personal referral code."],
  ["Share it with someone", "Invite a friend, sibling, cousin, coworker, or loved one to explore CNA training."],
  ["Move forward together", "When eligibility and attendance terms are met, each person may receive a $100 benefit."],
];

const callbackTopics = [
  "Class schedule",
  "Tuition and payment plan",
  "Enrollment requirements",
  "Upcoming cohort availability",
  "Clinical training expectations",
  "Online theory format",
  "CNA jobs or career guidance",
  "CNA as a first step toward LVN/RN or nursing school",
  "I am ready to apply",
  "Other",
];

const goalOptions = [
  "I want CNA training as a first step toward LVN/RN or nursing school",
  "I want a stable healthcare job to support myself or my family",
  "I am changing careers and exploring healthcare",
  "I already work in healthcare or caregiving and want to become certified",
  "I am not sure yet and want to learn more",
  "Other",
];

const initialForm = {
  fullName: "",
  city: "",
  phone: "",
  email: "",
  callbackWindow: "",
  topics: [],
  goal: "",
  details: "",
  consent: false,
  updates: false,
};

const initialResourceForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export function RewardsGuidancePage() {
  const [form, setForm] = useState(initialForm);
  const [resourceForm, setResourceForm] = useState(initialResourceForm);
  const [pending, setPending] = useState(false);
  const [resourcePending, setResourcePending] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [resourceStatus, setResourceStatus] = useState({ type: "", text: "" });

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function updateTopic(event) {
    const { value, checked } = event.target;
    setForm((current) => ({
      ...current,
      topics: checked ? [...current.topics, value] : current.topics.filter((topic) => topic !== value),
    }));
  }

  function updateResourceField(event) {
    const { name, value } = event.target;
    setResourceForm((current) => ({ ...current, [name]: value }));
  }

  async function handleResourceSubmit(event) {
    event.preventDefault();
    setResourcePending(true);
    setResourceStatus({ type: "", text: "" });

    try {
      await submitInquiry({
        fullName: `${resourceForm.firstName} ${resourceForm.lastName}`.trim(),
        email: resourceForm.email,
        phone: resourceForm.phone,
        program: "cna",
        message: "Please send the CNA Career Starter Guide and OC Nursing School Pathway Guide.",
        source: "rewards-free-handouts",
      });
      setResourceForm(initialResourceForm);
      setResourceStatus({
        type: "success",
        text: "Request sent. Admissions will send the free handouts shortly.",
      });
    } catch (error) {
      setResourceStatus({
        type: "error",
        text: error.message || "We could not send your handout request. Please call admissions for help.",
      });
    } finally {
      setResourcePending(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setStatus({ type: "", text: "" });

    const message = [
      `City: ${form.city}`,
      `Preferred callback window: ${form.callbackWindow}`,
      `Topics: ${form.topics.length ? form.topics.join(", ") : "Not specified"}`,
      `Goal: ${form.goal}`,
      `Additional details: ${form.details || "None provided"}`,
      `Program updates consent: ${form.updates ? "Yes" : "No"}`,
    ].join("\n");

    try {
      await submitInquiry({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        program: "cna",
        message,
        source: "rewards-guidance-landing",
      });
      setForm(initialForm);
      setStatus({ type: "success", text: "Your callback request was sent. Admissions will follow up as soon as possible." });
    } catch (error) {
      setStatus({ type: "error", text: error.message || "We could not send your request. Please call admissions for immediate help." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rewards-landing">
      <section className="rg-hero">
        <div className="container rg-hero-grid">
          <div className="rg-hero-copy">
            <p className="rg-eyebrow">CNA training in Orange, California</p>
            <h1>Train with a friend. <span>Build your future together.</span></h1>
            <p className="rg-hero-lead">
              <strong>Refer a friend. You both may get $100.</strong> Starting something new can feel
              easier with someone by your side. Build skills, accountability, and confidence together
              while preparing for a meaningful role in healthcare. Healthcare is built on connection,
              and your first step can feel stronger when you take it together.
            </p>
            <div className="button-row">
              <Link to="/register" className="btn btn-primary">Start Your Application</Link>
              <a href="#callback" className="btn btn-ghost">Talk to Admissions</a>
            </div>
            <div className="rg-trust-row" aria-label="Program highlights">
              <span>Approved schedule details</span>
              <span>Payment plan available</span>
              <span>Student support available</span>
            </div>
            <div className="rg-hero-proof" aria-label="Landing page highlights">
              <div>
                <strong>$100</strong>
                <span>for your friend</span>
              </div>
              <div>
                <strong>$250</strong>
                <span>registration deposit</span>
              </div>
              <div>
                <strong>$100</strong>
                <span>for you</span>
              </div>
            </div>
          </div>

          <div className="rg-hero-visual">
            <img src={heroTraining} alt="CNA students receiving hands-on clinical skills instruction" />
            <div className="rg-offer-card">
              <span>Referral offer</span>
              <strong>$100 for your friend + $100 for you</strong>
              <small>Eligibility, enrollment, referral-code, and attendance terms apply.</small>
            </div>
          </div>
        </div>
      </section>

      <nav className="container rg-section-nav" aria-label="Page sections">
        <a href="#free-resources">Free Resources</a>
        <a href="#referral-rewards">Referral</a>
        <a href="#rewards">Rewards</a>
        <a href="#study-tools">Study Tools</a>
        <a href="#career-support">Career Support</a>
        <a href="#tuition">Tuition</a>
        <a href="#callback">Request a Call</a>
      </nav>

      <section id="referral-rewards" className="rg-section rg-referral-section">
        <div className="container rg-feature-split">
          <div className="rg-feature-copy">
            <p className="section-kicker">Refer a friend</p>
            <h2>You both may benefit.</h2>
            <p>Starting with someone you trust can make the journey more encouraging, accountable, and meaningful.</p>
            <div className="rg-step-list">
              {referralSteps.map(([title, text], index) => (
                <div key={title}>
                  <span>{index + 1}</span>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </div>
              ))}
            </div>
            <details className="rg-disclosure">
              <summary>Review referral eligibility details</summary>
              <ul>{referralRules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
            </details>
          </div>
          <div className="rg-feature-photo">
            <img src={programsSupport} alt="Instructor guiding students through CNA skills practice" />
            <div><strong>Build skills together</strong><span>Encouragement - accountability - shared progress</span></div>
          </div>
        </div>
      </section>


      <section className="rg-approval-band" aria-label="Program approval">
        <div className="container rg-approval-inner">
          <div className="rg-approval-mark" aria-hidden="true">CA</div>
          <div>
            <p>Formal program approval</p>
            <h2>California Department of Public Health approved CNA training</h2>
            <span>Train through an approved program designed around required theory and supervised clinical preparation.</span>
          </div>
          <Link to="/programs" className="btn btn-ghost">Review Program Details</Link>
        </div>
      </section>

      <section id="free-resources" className="rg-section rg-resources-section">
        <div className="container rg-free-resources">
          <div className="rg-free-resource-copy">
            <p className="section-kicker">Free resources for your journey</p>
            <h2>Take the first step toward your nursing future.</h2>
            <p>
              Download the two free handouts created to help future nursing students and working
              adults plan with clarity and confidence.
            </p>
            <div className="rg-resource-benefits" aria-label="Resource benefits">
              <span>Expertly prepared</span>
              <span>Plan with clarity</span>
              <span>Build confidence</span>
              <span>Create your future</span>
            </div>
            <form className="rg-handout-form handout-form" onSubmit={handleResourceSubmit}>
              <h3>Get Your Free Handouts Now.</h3>
              <div className="form-grid two-up">
                <label>
                  <span>First name *</span>
                  <input name="firstName" value={resourceForm.firstName} onChange={updateResourceField} required />
                </label>
                <label>
                  <span>Last name *</span>
                  <input name="lastName" value={resourceForm.lastName} onChange={updateResourceField} required />
                </label>
                <label>
                  <span>Email address *</span>
                  <input
                    name="email"
                    type="email"
                    value={resourceForm.email}
                    onChange={updateResourceField}
                    required
                  />
                </label>
                <label>
                  <span>Phone number</span>
                  <input name="phone" type="tel" value={resourceForm.phone} onChange={updateResourceField} />
                </label>
              </div>
              <button className="btn btn-primary" type="submit" disabled={resourcePending}>
                {resourcePending ? "Sending..." : "Send Me My Free Handouts"}
              </button>
              {resourceStatus.text ? (
                <p className={`form-status ${resourceStatus.type === "success" ? "is-success" : "is-error"}`}>
                  {resourceStatus.text}
                </p>
              ) : null}
            </form>
          </div>
          <div className="rg-guide-grid" aria-label="Free planning resources">
            <article className="rg-guide-card rg-guide-card-blue">
              <span>Free planning tool</span>
              <div className="rg-guide-monogram" aria-hidden="true">CNA</div>
              <h3>CNA Career Starter Guide</h3>
              <p>Explore how your goals, strengths, and priorities may connect with CNA training.</p>
              <Link to="/career-quiz">Start the career quiz <span aria-hidden="true">→</span></Link>
            </article>
            <article className="rg-guide-card rg-guide-card-gold">
              <span>Education pathway</span>
              <div className="rg-guide-monogram" aria-hidden="true">OC</div>
              <h3>OC Nursing School Pathway Guide</h3>
              <p>Review how CNA experience may support a longer-term LVN, RN, or BSN goal.</p>
              <a href="#career-support">Review the pathway <span aria-hidden="true">→</span></a>
            </article>
          </div>
        </div>
      </section>

      <section id="rewards" className="rg-section">
        <div className="container rg-support-intro">
          <div>
            <p className="section-kicker">Rewards, guidance & support</p>
            <h2>Support that continues beyond the classroom.</h2>
            <p>First Step Healthcare Academy combines practical training with resources that help students prepare, persist, and plan what comes next.</p>
          </div>
          <div className="rg-pillar-grid">
            {supportPillars.map((item) => (
              <article key={item.title}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>


      <section id="retention-recognition" className="rg-section rg-retention-section">
        <div className="container rg-retention-panel">
          <div>
            <p className="section-kicker">Retention recognition</p>
            <h2>Get recognized for staying in the field.</h2>
            <p>Eligible graduates may qualify for recognition when they continue into CNA employment and demonstrate reliability and early workplace commitment.</p>
          </div>
          <div className="rg-milestone-grid">
            {retentionMilestones.map((item, index) => (
              <article key={item.title}>
                <span>{index + 1}</span>
                <h3>{item.title}</h3>
                <strong>{item.amount}</strong>
              </article>
            ))}
          </div>
          <p className="rg-fine-print">Recognition is not guaranteed and may depend on program terms, employer participation, employment verification, conduct, and supervisor feedback.</p>
        </div>
      </section>

      <section id="study-tools" className="rg-section">
        <div className="container rg-resource-layout">
          <div className="rg-resource-copy">
            <p className="section-kicker">Study tools included</p>
            <h2>Know what to study, practice, and prepare for.</h2>
            <p>Organized resources help students stay focused through theory, clinical preparation, and exam review.</p>
            <div className="rg-tool-grid">
              {studyToolItems.slice(0, 8).map((item, index) => (
                <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>
              ))}
            </div>
          </div>
          <div className="rg-study-visual">
            <img src={heroTraining} alt="Instructor demonstrating a hands-on CNA skill to students" />
            <blockquote>“Preparation becomes manageable when students know what to focus on next.”</blockquote>
          </div>
        </div>
      </section>

      <section id="career-support" className="rg-section rg-career-section">
        <div className="container">
          <div className="rg-centered-heading">
            <p className="section-kicker">Career support beyond the classroom</p>
            <h2>Prepare for a CNA job—and the path beyond it.</h2>
            <p>Students receive practical guidance for entering the workforce and understanding how CNA experience may support future healthcare goals.</p>
          </div>
          <div className="rg-career-grid">
            {careerSupportItems.slice(0, 6).map((item, index) => (
              <article key={item}><span>{index + 1}</span><p>{item}</p></article>
            ))}
          </div>
          <div className="rg-pathway" aria-label="Example healthcare education pathway">
            <span>CNA</span><i>→</i><span>LVN</span><i>→</i><span>RN</span><i>→</i><span>BSN</span>
          </div>
          <p className="rg-fine-print">Career support is educational guidance and does not guarantee employment, employer acceptance, certification results, or nursing school admission.</p>
        </div>
      </section>

      <section className="rg-section rg-ready-section">
        <div className="container rg-ready-panel">
          <div>
            <p className="section-kicker">Ready to take your first step?</p>
            <h2>Choose the next action that fits where you are today.</h2>
          </div>
          <div className="rg-ready-actions">
            <Link to="/register" className="btn btn-primary">Register Now</Link>
            <Link to="/schedule" className="btn btn-secondary">View the Schedule</Link>
            <a href="#callback" className="btn btn-ghost">Request Support</a>
          </div>
        </div>
      </section>

      <section id="tuition" className="rg-section rg-tuition-section">
        <div className="container">
          <div className="rg-centered-heading">
            <p className="section-kicker">Straightforward payment options</p>
            <h2>Choose the payment path that works for you.</h2>
            <p>Program total is $2,000, including the $250 non-refundable registration fee.</p>
          </div>
          <div className="rg-pricing-grid">
            <article className="rg-price-card rg-price-featured">
              <span className="rg-price-label">Option 1 - simplest</span>
              <h3>Pay in full</h3>
              <p>Complete tuition payment before class and receive an additional $100 pay-in-full savings.</p>
              <div className="rg-price-line"><span>Registration fee</span><strong>$250</strong></div>
              <div className="rg-price-line"><span>Remaining tuition</span><strong>$1,750</strong></div>
              <div className="rg-price-line rg-savings-line"><span>Pay-in-full savings</span><strong>-$100</strong></div>
              <div className="rg-price-total"><span>Total</span><strong>$1,900</strong></div>
              <Link to="/register" className="btn btn-primary">Register Now</Link>
            </article>
            <article className="rg-price-card">
              <span className="rg-price-label">Option 2 - flexible</span>
              <h3>Start with the deposit</h3>
              <p>Begin with the registration-fee deposit, then complete the remaining balance on the approved schedule.</p>
              <div className="rg-price-line"><span>Due at registration</span><strong>$250</strong></div>
              <div className="rg-price-line"><span>Remaining balance</span><strong>$1,750</strong></div>
              <div className="rg-price-total"><span>Program total</span><strong>$2,000</strong></div>
              <a href="#callback" className="btn btn-ghost">Discuss a Payment Plan</a>
            </article>
          </div>
          <p className="rg-fine-print">Payment plans, deadlines, and eligibility are confirmed during enrollment. Additional third-party costs may apply for required documents, certifications, screening, uniforms, learning materials, or state testing.</p>
        </div>
      </section>

      <section id="callback" className="rg-section rg-callback-section">
        <div className="container rg-callback-layout">
          <div className="rg-callback-copy">
            <p className="section-kicker">Request a support phone call</p>
            <h2>Talk to admissions about schedule and tuition.</h2>
            <p>Share what you need help with and our admissions team will contact you during your preferred callback window when available.</p>
            <div className="rg-callout-list">
              <div><strong>Ask specific questions</strong><span>Get clarity on tuition, documents, schedules, and clinical expectations.</span></div>
              <div><strong>Plan your next step</strong><span>Discuss cohort fit whether you are ready now or still exploring.</span></div>
              <div><strong>No pressure</strong><span>The call is for guidance; submitting the form does not enroll you.</span></div>
            </div>
          </div>

          <form className="rg-callback-form form-stack" onSubmit={handleSubmit}>
            <div className="form-grid two-up">
              <label><span>Full name *</span><input name="fullName" value={form.fullName} onChange={updateField} required autoComplete="name" /></label>
              <label><span>City *</span><input name="city" value={form.city} onChange={updateField} required autoComplete="address-level2" /></label>
              <label><span>Phone number *</span><input name="phone" value={form.phone} onChange={updateField} required type="tel" autoComplete="tel" /></label>
              <label><span>Email address *</span><input name="email" value={form.email} onChange={updateField} required type="email" autoComplete="email" /></label>
            </div>

            <label>
              <span>Preferred callback window *</span>
              <select name="callbackWindow" value={form.callbackWindow} onChange={updateField} required>
                <option value="">Select a timeframe</option>
                <option>Morning: 9 AM–12 PM</option>
                <option>Afternoon: 12 PM–4 PM</option>
                <option>Evening: 4 PM–7 PM</option>
                <option>No preference</option>
              </select>
            </label>
            <p className="rg-field-note">Callback windows are preferred timeframes and are not guaranteed appointment times.</p>

            <fieldset className="rg-checkbox-fieldset">
              <legend>What would you like to discuss? <span>Select all that apply.</span></legend>
              <div className="rg-checkbox-grid">
                {callbackTopics.map((topic) => (
                  <label key={topic}><input type="checkbox" value={topic} checked={form.topics.includes(topic)} onChange={updateTopic} /><span>{topic}</span></label>
                ))}
              </div>
            </fieldset>

            <label>
              <span>Which best describes your goal? *</span>
              <select name="goal" value={form.goal} onChange={updateField} required>
                <option value="">Select your primary goal</option>
                {goalOptions.map((goal) => <option key={goal}>{goal}</option>)}
              </select>
            </label>

            <label><span>Anything else that would make the call more useful?</span><textarea name="details" value={form.details} onChange={updateField} maxLength="1000" rows="5" /></label>

            <label className="rg-consent-row"><input type="checkbox" name="consent" checked={form.consent} onChange={updateField} required /><span>By submitting this form, I agree that First Step Healthcare Academy may contact me by phone, text, or email about CNA training. Message and data rates may apply. *</span></label>
            <label className="rg-consent-row"><input type="checkbox" name="updates" checked={form.updates} onChange={updateField} /><span>I would also like program updates, upcoming cohort information, career resources, and admissions reminders. I can opt out at any time.</span></label>

            <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Sending Request…" : "Request a Callback"}</button>
            {status.text ? <p className={`form-status ${status.type === "success" ? "is-success" : "is-error"}`} role="status">{status.text}</p> : null}
          </form>
        </div>
      </section>
    </div>
  );
}
