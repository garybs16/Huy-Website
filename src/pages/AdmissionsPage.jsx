import heroTrainingPhoto from "../assets/hero-training-photo-v2.jpg";
import programsSupportPhoto from "../assets/programs-support-photo.jpg";
import { PageIntro } from "../components/PageIntro";
import { RefundPolicy } from "../components/RefundPolicy";
import {
  admissionsSteps,
  faqItems,
  miscFeeItems,
  requirementItems,
  tuitionItems,
} from "../siteData";

export function AdmissionsPage() {
  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Admissions"
        title="Know what to prepare before you apply, enroll, and start class."
        description="Review the admissions checklist, tuition notes, refund policy, locations, and common questions in one organized place."
        accent="Everything students should prepare"
        note="Documents, pricing, policies, and clinical logistics stay visible before enrollment."
      />

      <div className="container page-jump-nav" aria-label="Admissions sections">
        <a href="#admissions-requirements">Requirements</a>
        <a href="#tuition-fees">Tuition & Fees</a>
        <a href="#refund-policy">Refund Policy</a>
        <a href="#questions">Questions</a>
      </div>

      <div className="container card-grid two-up photo-showcase">
        <div className="media-panel">
          <img
            src={heroTrainingPhoto}
            alt="Healthcare instructor demonstrating bedside skills with students observing during lab training"
          />
        </div>
        <div className="media-panel">
          <img
            src={programsSupportPhoto}
            alt="Students practicing patient care techniques in a clinical simulation room"
          />
        </div>
      </div>

      <div className="container split-panel">
        <article className="info-card dark-card">
          <p className="section-kicker">Enrollment path</p>
          <h3>Step-by-step admissions path</h3>
          <ul className="detail-list">
            {admissionsSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>

        <article id="admissions-requirements" className="info-card">
          <p className="section-kicker">Requirements</p>
          <h3>What students should prepare before enrollment</h3>
          <ul className="detail-list">
            {requirementItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div id="tuition-fees" className="container split-panel">
        <article className="info-card">
          <p className="section-kicker">Tuition and fees</p>
          <h3>Published tuition stays visible before a student commits.</h3>
          <div className="stack-panel">
            {tuitionItems.map((item) => (
              <div key={item.title} className="tuition-line">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <span>{item.amount}</span>
              </div>
            ))}
          </div>
          <ul className="detail-list compact-list">
            {miscFeeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="info-card">
          <p className="section-kicker">Clinical placement</p>
          <h3>Clinical assignments are confirmed during enrollment.</h3>
          <p>Placement depends on the approved cohort schedule, facility availability, student readiness, and program requirements. Students are responsible for transportation.</p>
        </article>
      </div>

      <div id="refund-policy" className="container policy-section">
        <RefundPolicy />
      </div>

      <div id="questions" className="container card-grid three-up">
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
