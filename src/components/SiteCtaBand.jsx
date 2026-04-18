import { Link } from "react-router-dom";
import { contactDetails } from "../siteData";

const ctaHighlights = [
  "Published schedules",
  "Flexible cohort timing",
  "Direct admissions guidance",
];

export function SiteCtaBand() {
  return (
    <section className="site-cta-band">
      <div className="container">
        <div className="site-cta-panel">
          <div className="site-cta-copy">
            <p className="section-kicker">Plan your start with confidence</p>
            <h2>Move from interest to enrollment with a site that keeps the next step obvious.</h2>
            <p>
              Review the current schedule, choose the right training path, and speak with admissions
              before seats tighten.
            </p>

            <div className="button-row">
              <Link to="/register" className="btn btn-primary">
                Reserve a Seat
              </Link>
              <Link to="/contact" className="btn btn-ghost">
                Talk to Admissions
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
