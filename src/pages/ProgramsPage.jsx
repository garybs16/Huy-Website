import admissionsSupport from "../assets/admissions-support.svg";
import { PageIntro } from "../components/PageIntro";
import { admissionsSteps, programMeta, supportItems } from "../siteData";

export function ProgramsPage({ programs, programLoadError }) {
  return (
    <section className="section">
      <PageIntro
        kicker="Programs"
        title="Choose the training path that fits your timeline, credential goals, and start plan."
        description="The page now mirrors the reference site more closely with direct program summaries, visible format details, and stronger structure for admissions-driven browsing."
        accent="Built for cleaner comparison"
        note="Cards, supporting detail, and next steps are grouped more intentionally."
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

      <div className="container card-grid two-up">
        <article className="info-card">
          <p className="section-kicker">What changed</p>
          <h3>The program section now reads more like a school site than a startup landing page.</h3>
          <p>
            That shift is intentional. It puts training details, schedule expectations, and
            admissions context ahead of decorative marketing language.
          </p>
        </article>

        <article className="info-card">
          <p className="section-kicker">Admissions flow</p>
          <h3>Students can move from program discovery into next steps without extra friction.</h3>
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
