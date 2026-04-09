import admissionsLabPhoto from "../assets/admissions-lab-photo.jpg";
import admissionsSupport from "../assets/programs-support-photo.jpg";
import { PageIntro } from "../components/PageIntro";
import { admissionsSteps, programMeta, supportItems } from "../siteData";

export function ProgramsPage({ programs, programLoadError }) {
  return (
    <section className="section">
      <PageIntro
        kicker="Programs"
        title="Choose the healthcare training path that fits your timeline and credential goals."
        description="Compare current program options, review format details, and move into the next admissions step without digging through extra pages."
        accent="Program comparison made clear"
        note="Format, duration, and admissions context stay visible together."
      />

      <div className="container">
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
          <p className="section-kicker">Program planning</p>
          <h3>Students can compare schedules, formats, and next steps without extra clicks.</h3>
          <p>
            Each card is structured to answer the first questions most applicants ask: what the
            training covers, how long it takes, and how it fits into enrollment.
          </p>
        </article>

        <article className="info-card">
          <p className="section-kicker">Admissions flow</p>
          <h3>Once a student finds the right track, the next step stays simple.</h3>
          <ol className="detail-list ordered-list">
            {admissionsSteps.slice(0, 3).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}
