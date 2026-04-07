import { PageIntro } from "../components/PageIntro";
import {
  admissionsSteps,
  faqItems,
  locationDetails,
  miscFeeItems,
  requirementItems,
  tuitionItems,
} from "../siteData";

export function AdmissionsPage() {
  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Admissions"
        title="Know what to prepare before your class start date and before you submit enrollment."
        description="The admissions page now pulls together the main checklist, pricing notes, and location details in the same structured style used throughout the redesigned site."
        accent="Checklist-driven admissions page"
        note="Requirements, location notes, and tuition context are grouped for faster review."
      />

      <div className="container split-panel">
        <article className="info-card dark-card">
          <p className="section-kicker">Enrollment path</p>
          <h3>Step-by-step</h3>
          <ul className="detail-list">
            {admissionsSteps.map((step) => (
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

      <div className="container split-panel">
        <article className="info-card">
          <p className="section-kicker">Tuition and fees</p>
          <h3>Pricing is visible before students begin enrollment.</h3>
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
          <p className="section-kicker">Location details</p>
          <h3>Theory and classroom training</h3>
          <p>{locationDetails.classroom}</p>
          <h3>Clinical locations</h3>
          <ul className="detail-list compact-list">
            {locationDetails.clinicalCities.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
          <p>{locationDetails.note}</p>
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
