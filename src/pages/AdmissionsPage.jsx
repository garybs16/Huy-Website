import { faqItems, requirementItems } from "../siteData";

const journeySteps = [
  "Choose a program and preferred cohort",
  "Submit enrollment or inquiry details",
  "Prepare identification, health, and screening documents",
  "Confirm payment, onboarding, and start timing",
];

export function AdmissionsPage() {
  return (
    <section className="section section-soft">
      <div className="container page-header">
        <p className="section-kicker">Admissions</p>
        <h1>Know what to prepare before your class start date.</h1>
        <p>
          This page outlines the normal admissions path, required documents, and the steps that
          usually affect how quickly a student can be cleared to start.
        </p>
      </div>

      <div className="container split-panel">
        <article className="info-card dark-card">
          <p className="section-kicker">Enrollment path</p>
          <h3>Step-by-step</h3>
          <ul className="detail-list">
            {journeySteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>

        <article className="info-card">
          <p className="section-kicker">Requirements</p>
          <h3>What students should prepare</h3>
          <ul className="detail-list">
            {requirementItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
