import { Link } from "react-router-dom";
import admissionsLabPhoto from "../assets/admissions-lab-photo.jpg";
import { RefundPolicy } from "../components/RefundPolicy";
import {
  miscFeeItems,
  programRequirementSections,
  requirementItems,
  tuitionItems,
  thirdPartyFeeItems,
  thirdPartyFeeNotice,
} from "../siteData";

const certificationSteps = [
  {
    step: "Step 1",
    title: "Instructor-Led Online Theory",
    time: "60 hours",
    detail:
      "Learn the fundamentals of nursing in online training sessions with live instructor guidance, schedule support, and personalized feedback.",
  },
  {
    step: "Step 2",
    title: "On-Site Clinical Training",
    time: "100 hours",
    detail:
      "Strengthen your skills with hands-on clinical experience at approved California locations. Additional lab hours may be required during clinicals.",
  },
  {
    step: "Step 3",
    title: "State Certification Exam",
    time: "4-6 hours",
    detail:
      "Prepare for the state exam, confirm testing steps, and move toward certification with nearby CNA testing-site guidance.",
  },
];

const documentationRows = [
  {
    deadline: "At Enrollment",
    items:
      "Enrollment application, government ID, proof of age, proof of flu vaccination, clinical-clearance acknowledgment.",
  },
  {
    deadline: "Before Clinical Clearance Deadline (1 week after Theory start)",
    items:
      "Physical exam/health clearance, medical history, TB clearance, chest X-ray if positive TB test, facility-required immunizations, drug screen, Live Scan/background process, facility onboarding documents, HIPAA/confidentiality acknowledgment, dress code acknowledgment.",
  },
  {
    deadline: "Before Clinical Start",
    items: "Verification of all requirements at clinical clearance deadline submission.",
  },
];

export function ProgramsPage({ programLoadError }) {
  const displayedRequirementSections = programRequirementSections.filter((section) =>
    ["Program Length", "Grade and Passing Requirements", "Technology Requirements"].includes(section.title)
  );

  return (
    <section className="section program-page">
      <div className="container page-jump-nav" aria-label="CNA program sections">
        <a href="#program-options">CNA Program</a>
        <a href="#program-requirements">Requirements</a>
        <a href="#program-documentation">Documentation</a>
        <a href="#program-fees">Fees</a>
        <a href="#program-next-step">Next Step</a>
      </div>

      <div id="program-options" className="container program-certification-frame">
        {programLoadError ? <p className="section-note">{programLoadError}</p> : null}
        <div className="program-certification-heading">
          <p className="section-kicker">CNA certification</p>
          <h1>Your CNA Certification Is Just 3 Simple Steps Away.</h1>
          <p>It is easy to start a high-demand CNA career when the next steps are clear.</p>
        </div>
        <div className="program-step-grid">
          {certificationSteps.map((item) => (
            <article key={item.step} className="program-step-card">
              <span>{item.step}</span>
              <div className="program-step-icon" aria-hidden="true" />
              <h2>{item.title}</h2>
              <strong>{item.time}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div id="program-requirements" className="container program-requirements program-requirements-focused">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Online Nurse Assistant Training Program Requirements</p>
            <h2>Required program information for CNA/NATP students.</h2>
          </div>
          <p>
            Students are responsible for reviewing and meeting all program requirements before
            enrollment, during training, before clinical participation, and before successful
            completion.
          </p>
        </div>

        <div className="program-detail-pillars">
          {displayedRequirementSections.map((section) => (
            <article
              key={section.title}
              className={`info-card program-detail-pillar ${
                section.title === "Technology Requirements" ? "technology-pillar" : ""
              }`}
            >
              <p className="section-kicker">{section.title}</p>
              <h3>{section.title}</h3>
              {section.title === "Technology Requirements" ? (
                <img
                  src={admissionsLabPhoto}
                  alt="Student using training technology during a healthcare classroom session"
                />
              ) : null}
              <ul className="detail-list compact-list">
                {section.items.map((item, index) => (
                  <li
                    key={item}
                    className={
                      section.title === "Grade and Passing Requirements" && index < 3
                        ? "requirement-highlight"
                        : ""
                    }
                  >
                    {item}
                  </li>
                ))}
              </ul>
              {section.title === "Program Length" ? (
                <Link to="/schedule" className="btn btn-secondary program-schedule-cta">
                  View Schedule
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div id="program-documentation" className="container program-frame">
        <article className="info-card documentation-card">
          <p className="section-kicker">Enrollment and clinical readiness</p>
          <h2>Documentation requirements and deadline.</h2>
          <div className="documentation-table" role="table" aria-label="Documentation requirements and deadline">
            <div className="documentation-row documentation-head" role="row">
              <strong role="columnheader">Deadline</strong>
              <strong role="columnheader">Student Must Submit / Complete</strong>
            </div>
            {documentationRows.map((row) => (
              <div className="documentation-row" role="row" key={row.deadline}>
                <strong role="cell">{row.deadline}</strong>
                <p role="cell">{row.items}</p>
              </div>
            ))}
          </div>
          <p className="card-note">
            Enrollment requirements still include core admissions documents such as active
            government-issued identification and proof of age. Clinical-readiness documents are
            reviewed against the class and facility deadlines above.
          </p>
        </article>
      </div>

      <div id="program-fees" className="container program-frame">
        <article className="info-card">
          <p className="section-kicker">Program fees and payment plan</p>
          <h2>Published fees and possible additional costs.</h2>
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
      </div>

      <div className="container program-frame">
        <article className="info-card third-party-fees-card">
          <p className="section-kicker">Required cost disclosure</p>
          <h2>Third-Party Miscellaneous Fees</h2>
          <div className="third-party-fee-grid">
            {thirdPartyFeeItems.map((item) => (
              <div key={item.title} className="third-party-fee-item">
                <div><strong>{item.title}</strong><p>{item.detail}</p></div>
                <span>{item.amount}</span>
              </div>
            ))}
          </div>
          <p className="card-note"><strong>{thirdPartyFeeNotice}</strong></p>
        </article>
      </div>

      <div className="container program-frame" id="refund-policy">
        <RefundPolicy />
      </div>

      <div id="program-next-step" className="container program-frame">
        <article className="info-card dark-card">
          <p className="section-kicker">Next step</p>
          <h2>Review current availability and payment options before submitting enrollment.</h2>
          <p>
            Students can review class formats, pricing, payment-plan structure, admissions
            requirements, and documentation deadlines before contacting the school.
          </p>
          <div className="button-row">
            <Link to="/schedule" className="btn btn-secondary">
              View Schedule
            </Link>
            <Link to="/contact" className="btn btn-primary">
              Send Inquiry
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
