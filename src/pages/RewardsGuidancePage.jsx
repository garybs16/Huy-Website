import { Link } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";
import {
  careerSupportItems,
  referralProgramSteps,
  referralRules,
  retentionMilestones,
  rewardsGuidanceItems,
  studyToolItems,
} from "../siteData";

export function RewardsGuidancePage() {
  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Rewards & Guidance"
        title="CNA support that helps students save money, stay organized, and plan ahead."
        description="Review referral rewards, retention recognition, study tools, and career guidance for students using CNA training as a first step into healthcare."
        accent="$100 referral reward"
        note="Referral rewards are tied to eligibility, enrollment, referral-code use, and first-day theory attendance."
      />

      <div className="container page-jump-nav" aria-label="Rewards and guidance sections">
        <a href="#referral-rewards">Referral Rewards</a>
        <a href="#retention-recognition">Retention</a>
        <a href="#study-tools">Study Tools</a>
        <a href="#career-support">Career Support</a>
      </div>

      <div className="container rewards-hero-panel">
        <article id="referral-rewards" className="info-card dark-card">
          <p className="section-kicker">Referral rewards</p>
          <h2>Refer a friend and you may both benefit.</h2>
          <p>
            Current, incoming, and graduate students can share a personal referral code with
            someone ready to start CNA training. When eligibility requirements are met, the referred
            student may receive $100 off tuition and the referrer may receive a $100 reward.
          </p>
          <Link to="/contact" className="card-action-link">
            Ask about referral eligibility
          </Link>
        </article>

        <article className="info-card">
          <p className="section-kicker">Student tools</p>
          <h2>Study support and career planning stay connected.</h2>
          <p>
            Students can use study guides, skills checklists, quick-reference resources, clinical
            preparation support, and job-readiness guidance while building toward CNA employment
            and future LVN, RN, or nursing school goals.
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

      <div className="container split-panel rewards-detail-section">
        <article className="info-card">
          <p className="section-kicker">How referrals work</p>
          <h2>Referral code steps</h2>
          <ol className="detail-list ordered-list policy-timeline">
            {referralProgramSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="info-card">
          <p className="section-kicker">Referral code rules</p>
          <h2>Eligibility stays clear before enrollment.</h2>
          <ul className="detail-list compact-list">
            {referralRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <p className="card-note">
            First Step Healthcare Academy may verify eligibility, deny duplicate or ineligible
            referrals, modify terms, or discontinue the referral program at any time.
          </p>
        </article>
      </div>

      <div id="retention-recognition" className="container split-panel rewards-detail-section">
        <article className="info-card">
          <p className="section-kicker">Retention recognition</p>
          <h2>Graduates may be recognized for staying in the field.</h2>
          <p>
            Eligible graduates may qualify for recognition when they are hired by the facility where
            they completed clinical training and remain employed in good standing.
          </p>
          <div className="stack-panel">
            {retentionMilestones.map((item) => (
              <div key={item.title} className="tuition-line">
                <div>
                  <strong>{item.title}</strong>
                </div>
                <span>{item.amount}</span>
              </div>
            ))}
          </div>
          <p className="card-note">
            Retention incentives are not guaranteed and may depend on facility approval,
            employment verification, graduate conduct, supervisor feedback, and program terms.
          </p>
        </article>

        <article className="info-card dark-card">
          <p className="section-kicker">Ready to take your first step?</p>
          <h2>Choose the next action that matches where you are.</h2>
          <p>
            Start your CNA journey with a program designed to support more than classroom
            completion.
          </p>
          <div className="button-row">
            <Link to="/register" className="btn btn-primary">
              Apply Now
            </Link>
            <Link to="/contact" className="btn btn-ghost">
              Talk to Admissions
            </Link>
            <Link to="/programs" className="btn btn-secondary">
              View Requirements
            </Link>
          </div>
        </article>
      </div>

      <div className="container card-grid two-up rewards-detail-section">
        <article id="study-tools" className="info-card">
          <p className="section-kicker">Study tools included</p>
          <h2>Structured resources help students know what to study and practice.</h2>
          <ul className="detail-list compact-list">
            {studyToolItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article id="career-support" className="info-card">
          <p className="section-kicker">Career support</p>
          <h2>Guidance for CNA jobs and future nursing goals.</h2>
          <ul className="detail-list compact-list">
            {careerSupportItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="card-note">
            Career support is provided for educational and guidance purposes. First Step Healthcare
            Academy does not guarantee employment, employer acceptance, nursing school admission,
            or certification exam results.
          </p>
        </article>
      </div>
    </section>
  );
}
