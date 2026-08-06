import { Link } from "react-router-dom";
import { contactDetails } from "../siteData";

const ctaHighlights = ["Early cohort notice", "2026–2027 planning", "Priority enrollment access"];

export function SiteCtaBand() {
  return (
    <section className="site-cta-band">
      <div className="container">
        <div className="site-cta-panel">
          <div className="site-cta-copy">
            <p className="section-kicker">2026–2027 cohort interest list</p>
            <h2>Get early access to upcoming CNA cohorts.</h2>
            <p>
              Join the priority interest list for early cohort announcements. Members are contacted
              first when enrollment opens, giving them an earlier opportunity to reserve an available seat.
            </p>

            <div className="button-row">
              <Link to="/contact#interest-list" className="btn btn-primary">
                Join the priority waitlist
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
