import { Link } from "react-router-dom";
import { contactDetails } from "../siteData";

const ctaHighlights = ["Clear tuition", "Published requirements", "Real admissions support"];

export function SiteCtaBand() {
  return (
    <section className="site-cta-band">
      <div className="container">
        <div className="site-cta-panel">
          <div className="site-cta-copy">
            <p className="section-kicker">Your next step</p>
            <h2>Ready to start—or still deciding?</h2>
            <p>
              Compare the schedule and requirements at your own pace, or speak with admissions for
              a clear answer about tuition, documents, and the best cohort for your availability.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary">
                Start registration
              </Link>
              <Link to="/contact" className="btn btn-ghost">
                Talk to admissions
              </Link>
            </div>
          </div>

          <div className="site-cta-aside">
            <div className="site-cta-contact">
              <span>Call or email directly</span>
              <strong>{contactDetails.phone}</strong>
              <a href={contactDetails.emailHref}>{contactDetails.email}</a>
            </div>

            <div className="site-cta-highlights" aria-label="Admissions highlights">
              {ctaHighlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
