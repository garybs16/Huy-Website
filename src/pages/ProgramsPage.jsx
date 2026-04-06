import admissionsSupport from "../assets/admissions-support.svg";
import { PageIntro } from "../components/PageIntro";
import { supportItems } from "../siteData";

const programMeta = {
  cna: { tag: "On-site", badge: "Flagship Track" },
  "med-aide": { tag: "Bridge", badge: "Short Format" },
  cpr: { tag: "Certification", badge: "Fast Turnaround" },
};

export function ProgramsPage({ programs, programLoadError }) {
  return (
    <section className="section">
      <PageIntro
        kicker="Programs"
        title="Choose the training path that fits your goals and schedule."
        description="Review the essentials for each offering, including the learning focus, expected duration, and the type of schedule students can expect."
        accent="Three practical training routes"
        note="Built for faster comparison and clearer next steps."
      />

      <div className="container">
        {programLoadError ? <p className="section-note">{programLoadError}</p> : null}

        <div className="card-grid three-up">
          {programs.map((program) => {
            const meta = programMeta[program.id] ?? { tag: "Program", badge: "Admissions" };

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
                </ul>
              </article>
            );
          })}
        </div>
      </div>

      <div className="container split-panel">
        <div className="media-panel">
          <img src={admissionsSupport} alt="Illustration of an admissions and student planning workflow" />
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
    </section>
  );
}
