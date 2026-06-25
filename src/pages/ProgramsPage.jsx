import { Link } from "react-router-dom";
import admissionsLabPhoto from "../assets/admissions-lab-photo.jpg";
import admissionsSupport from "../assets/programs-support-photo.jpg";
import { PageIntro } from "../components/PageIntro";
import { RefundPolicy } from "../components/RefundPolicy";
import {
  admissionsSteps,
  courseModules,
  locationDetails,
  miscFeeItems,
  programMeta,
  programRequirementSections,
  requirementItems,
  supportItems,
  tuitionItems,
} from "../siteData";

export function ProgramsPage({ programs, programLoadError }) {
  return (
    <section className="section">
      <PageIntro
        kicker="CNA Program"
        title="Review the Certified Nurse Assistant training path, requirements, and next steps."
        description="Review CNA format details, program requirements, fees, policies, and next steps without digging through extra pages."
        accent="CNA training details made clear"
        note="Format, duration, and admissions context stay visible together."
      />

      <div className="container page-jump-nav" aria-label="CNA program sections">
        <a href="#program-options">CNA Program</a>
        <a href="#program-requirements">Requirements</a>
        <a href="#program-fees">Fees</a>
        <a href="#program-policies">Policies</a>
        <a href="#program-next-step">Next Step</a>
      </div>

      <div id="program-options" className="container">
        {programLoadError ? <p className="section-note">{programLoadError}</p> : null}

        <div className="card-grid three-up">
          {programs.map((program) => {
            const meta = programMeta[program.id] ?? {
              tag: "Program",
              badge: "Admissions",
              detail: "Training details are structured for easier side-by-side review.",
            };

            return (
              <article key={program.id} className="program-card">
                <div className="program-topline">
                  <span>{meta.tag}</span>
                  <strong>{meta.badge}</strong>
                </div>
                <h3>{program.title}</h3>
                <p>{program.summary}</p>
                <ul className="detail-list">
                  <li>Duration: {program.duration}</li>
                  <li>Format: {program.schedule}</li>
                  <li>{meta.detail}</li>
                </ul>
                <Link to={`/register?programId=${program.id}`} className="card-action-link">
                  Start registration
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      <div className="container split-panel">
        <div className="stack-panel">
          <div className="media-panel">
            <img
              src={admissionsSupport}
              alt="Healthcare students receiving hands-on instruction during a clinical skills lab"
            />
          </div>
          <div className="media-panel">
            <img
              src={admissionsLabPhoto}
              alt="Instructor leading healthcare students through a classroom simulation exercise"
            />
          </div>
        </div>

        <div className="stack-panel">
          {supportItems.map((item) => (
            <article key={item.title} className="support-card">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="container card-grid two-up">
        <article className="info-card">
          <p className="section-kicker">CNA planning</p>
          <h3>Students can review schedules, formats, and next steps without extra clicks.</h3>
          <p>
            The CNA overview is structured to answer the first questions most applicants ask: what
            the training covers, how long it takes, and how it fits into enrollment.
          </p>
        </article>

        <article className="info-card">
          <p className="section-kicker">Admissions flow</p>
          <h3>Once a student confirms the right schedule, the next step stays simple.</h3>
          <ol className="detail-list ordered-list">
            {admissionsSteps.slice(0, 3).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>

      <div id="program-requirements" className="container program-requirements">
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

        <article className="info-card">
          <p className="section-kicker">Required coursework</p>
          <h3>Students complete a structured CNA/NATP curriculum.</h3>
          <div className="module-grid">
            {courseModules.map(([title, detail], index) => (
              <div key={title} className="module-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{title}</strong>
                <p>{detail}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="card-grid two-up">
          {programRequirementSections.map((section) => (
            <article key={section.title} className="info-card">
              <p className="section-kicker">{section.title}</p>
              <h3>{section.title}</h3>
              <ul className="detail-list compact-list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div id="program-fees" className="card-grid two-up">
          <article className="info-card">
            <p className="section-kicker">Enrollment and clinical readiness</p>
            <h3>Documents and screenings required before enrollment or training milestones.</h3>
            <ul className="detail-list compact-list">
              {requirementItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="card-note">
              Original enrollment requirement documents must be hand-delivered to a school official
              by appointment.
            </p>
          </article>

          <article className="info-card">
            <p className="section-kicker">Program fees and payment plan</p>
            <h3>Published fees and possible additional costs.</h3>
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

        <div id="program-policies" className="program-policy-panel">
          <RefundPolicy />
        </div>

        <div className="card-grid two-up">
          <article className="info-card">
            <p className="section-kicker">Clinical training site locations</p>
            <h3>Clinical training is completed in person at approved clinical training sites.</h3>
            <ul className="detail-list compact-list">
              {locationDetails.clinicalCities.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
            <p>{locationDetails.note}</p>
          </article>

          <article id="program-next-step" className="info-card dark-card">
            <p className="section-kicker">Next step</p>
            <h3>Review current availability and payment options before submitting enrollment.</h3>
            <p>
              Exact public start dates are coming soon. Students can still review class formats,
              pricing, payment-plan structure, and admissions requirements before contacting the
              school.
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
      </div>
    </section>
  );
}
