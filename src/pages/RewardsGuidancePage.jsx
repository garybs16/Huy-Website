import { Link } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";
import { rewardsGuidanceItems } from "../siteData";

export function RewardsGuidancePage() {
  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Rewards & Guidance"
        title="Student support continues through referrals, study tools, and career guidance."
        description="Review referral incentives, graduate support, practical study resources, and job-readiness guidance designed around CNA students."
        accent="$100 referral reward"
        note="Both the referrer and the referred student can receive $100 when the referred student is eligible and enrolls."
      />

      <div className="container rewards-hero-panel">
        <article className="info-card dark-card">
          <p className="section-kicker">Referral rewards</p>
          <h2>Earn $100 per eligible referral, with no referral limit.</h2>
          <p>
            Share your experience with friends, family, classmates, coworkers, or anyone ready to
            take a first step toward healthcare. When an eligible referred student enrolls, both the
            referrer and the referred student can receive $100.
          </p>
          <Link to="/contact" className="card-action-link">
            Ask about referral eligibility
          </Link>
        </article>

        <article className="info-card">
          <p className="section-kicker">Student tools</p>
          <h2>Study support and career planning stay connected to the training path.</h2>
          <p>
            Students can use study guides, skills checklists, clinical preparation resources, and
            job-readiness guidance while building toward CNA employment and future nursing pathways.
          </p>
          <Link to="/career-quiz" className="card-action-link">
            Take the pre-CNA quiz
          </Link>
        </article>
      </div>

      <div className="container card-grid four-up">
        {rewardsGuidanceItems.map((item) => (
          <article key={item.title} className="support-card">
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
