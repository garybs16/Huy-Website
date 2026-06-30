import { Link } from "react-router-dom";
import { contactDetails } from "../siteData";

const ctaHighlights = [
  "Hands-on CNA training",
  "Admissions guidance",
  "Clear next steps",
];

export function SiteCtaBand() {
  return (
    <section className="site-cta-band">
      <div className="container">
        <div className="site-cta-panel">
          <div className="site-cta-copy">
            <p className="section-kicker">Ready to begin?</p>
            <h2>Ready to take your first step into healthcare?</h2>
            <p>
              Apply online or contact admissions for help choosing the right program, preparing
              documents, and planning your start.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary">
                Apply Now
              </Link>
              <Link to="/contact" className="btn btn-ghost">
                Contact Us
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
