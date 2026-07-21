import { Link } from "react-router-dom";
import { PageIntro } from "../components/PageIntro";

const termsSections = [
  {
    title: "Student responsibilities",
    items: [
      "Provide accurate and complete information and keep contact details current.",
      "Review program policies and communications, meet admission and clinical-clearance requirements, and attend all required instruction.",
      "Complete required theory and clinical hours, follow the Student Handbook and clinical-facility policies, and make payments under the selected schedule.",
      "Missed instructional time must be completed through an approved make-up process. The Student Handbook limits students to two approved make-up occurrences during a cohort.",
    ],
  },
  {
    title: "Online instruction and clinical participation",
    items: [
      "Students in live online theory instruction must maintain reliable internet, an approved device, functioning camera and audio, learning-management-system access, professional conduct, and active participation.",
      "Attendance may be verified through participation checks, camera or audio participation, LMS records, quizzes, login activity, and presence for the full scheduled session.",
      "Clinical participation requires all applicable clearances, which may include TB clearance, immunization records, health clearance, screening, CPR or BLS documentation, and facility-specific requirements.",
      "A clinical facility may restrict or deny participation for safety, health, background, professionalism, or facility-policy concerns.",
    ],
  },
  {
    title: "Program outcomes and operational changes",
    items: [
      "First Step Healthcare Academy does not guarantee program completion, state-exam passage, CNA certification, employment, a specific wage, facility placement, admission to a nursing program, or clinical-facility acceptance.",
      "The Academy may reasonably change schedules, locations, delivery methods, clinical assignments, or procedures when required by regulation, facility needs, emergencies, instructor availability, technology interruptions, public-health concerns, or other circumstances outside its reasonable control. Material changes will be communicated to students.",
    ],
  },
];

const privacySections = [
  {
    title: "Information collected",
    items: [
      "Legal name, mailing and billing address, email, phone number, date of birth, emergency contact, application information, identification, and educational records.",
      "Attendance, academic, clinical-clearance, payment, billing, communication, website, and learning-platform activity records.",
    ],
  },
  {
    title: "How information is used and shared",
    items: [
      "To process applications, maintain student records, manage enrollment and payments, provide instruction, track progress, coordinate clinical training, communicate updates, meet regulatory obligations, protect safety, and prevent fraud.",
      "When reasonably necessary, information may be shared with payment processors, learning-platform providers, clinical facilities, instructors, authorized staff, compliance providers, regulators, professional advisers, operational service providers, or parties required by law.",
      "The Academy does not sell student personal information to third-party advertisers.",
    ],
  },
  {
    title: "Payment, records, and communications",
    items: [
      "Payments may be processed by Stripe or another authorized processor. The Academy does not normally receive or store complete card numbers from Stripe-hosted checkout.",
      "Do not send complete card numbers, banking credentials, Social Security numbers, or sensitive medical information by ordinary email or text message.",
      "The Academy uses reasonable safeguards for student records, but no electronic system can be guaranteed completely secure. Students should promptly report inaccurate or unauthorized access to their information.",
      "Students may receive essential program communications. Promotional messages are sent only when permitted and can be opted out of without stopping essential notices.",
    ],
  },
];

const automaticPaymentSections = [
  {
    title: "Authorization and payment schedule",
    items: [
      "By selecting automatic payments, the payer authorizes First Step Healthcare Academy and Stripe to charge the selected payment method under the schedule presented at checkout.",
      "Authorization applies only to the disclosed registration fee, tuition installments, specifically authorized charges, and amounts permitted by the Enrollment Agreement. It cannot be used for unrelated or undisclosed charges.",
      "The payment schedule identifies each payment amount, date or frequency, number of payments, payment method, and total authorized amount.",
    ],
  },
  {
    title: "Stored payment method and account changes",
    items: [
      "The payer authorizes Stripe to securely store the payment method for authorized payments. The Academy does not normally receive or store complete card or bank credentials.",
      "The Academy may send payment reminders. A missed reminder does not cancel a properly authorized charge; the payer remains responsible for a valid method, sufficient funds, payment notices, and promptly reporting billing concerns.",
      "A payer may update a payment method by contacting the Academy or using an available Stripe payment-management page. Updating a method does not change the schedule unless the Academy approves that change in writing.",
      "After a valid withdrawal is processed or a student is dismissed, future automatic charges will be stopped or adjusted as appropriate and the account will be recalculated under the Enrollment Agreement and refund policy.",
    ],
  },
];

function PolicySection({ section }) {
  return (
    <section className="policy-document-section">
      <h3>{section.title}</h3>
      <ul className="detail-list">
        {section.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export function PoliciesPage() {
  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Policy Center"
        title="Understand the policies behind your enrollment."
        description="These public summaries make the key student-facing terms available before registration. Your signed Enrollment Agreement and applicable law control where they differ."
        accent="Clear terms before checkout"
      />

      <nav className="container page-jump-nav" aria-label="Policy sections">
        <a href="#terms">Terms of Service</a>
        <a href="#privacy">Privacy Policy</a>
        <a href="#refunds">Refunds & Cancellation</a>
        <a href="#automatic-payments">Automatic Payments</a>
      </nav>

      <div className="container policy-document-stack">
        <article id="terms" className="policy-document-card">
          <p className="section-kicker">1. Terms of Service</p>
          <h2>Student expectations and program conditions</h2>
          {termsSections.map((section) => <PolicySection key={section.title} section={section} />)}
        </article>

        <article id="privacy" className="policy-document-card">
          <p className="section-kicker">2. Privacy Policy</p>
          <h2>How student information is handled</h2>
          {privacySections.map((section) => <PolicySection key={section.title} section={section} />)}
        </article>

        <article id="refunds" className="policy-document-card">
          <p className="section-kicker">3. Refund and Cancellation Policy</p>
          <h2>How to cancel, withdraw, or raise a payment concern</h2>
          <p>Submit a written cancellation or withdrawal notice with the student name, program or cohort, effective date, and current contact information. The applicable Enrollment Agreement and governing requirements determine the effective date and refund calculation.</p>
          <p>Dismissal does not automatically remove refund rights. Charges paid directly to third parties, including screening, medical, immunization, uniform, textbook, state-exam, CPR, or drug-screening costs, may be governed by that provider&apos;s own rules and are not guaranteed refundable by the Academy.</p>
          <p>Approved refunds are generally returned to the original method when possible. Students should contact the Academy before initiating a chargeback; a payment dispute does not replace the formal cancellation or withdrawal process.</p>
          <Link className="card-action-link" to="/admissions#refund-policy">View the published refund schedule</Link>
        </article>

        <article id="automatic-payments" className="policy-document-card">
          <p className="section-kicker">4. Automatic-Payment Authorization</p>
          <h2>Consent for scheduled tuition payments</h2>
          {automaticPaymentSections.map((section) => <PolicySection key={section.title} section={section} />)}
        </article>

        <article className="policy-document-card policy-acknowledgment-card">
          <p className="section-kicker">Student acknowledgment</p>
          <h2>What registration confirms</h2>
          <p>I acknowledge that I have reviewed and agree to First Step Healthcare Academy&apos;s Terms of Service, Privacy Policy, Refund and Cancellation Policy, and applicable Payment-Plan Terms. I understand that payment alone does not guarantee clinical placement, certification, or employment.</p>
          <p>Students selecting a payment plan also authorize First Step Healthcare Academy and Stripe to charge the selected payment method according to the payment schedule presented at checkout.</p>
          <Link className="btn btn-primary" to="/register">Continue to registration</Link>
        </article>
      </div>
    </section>
  );
}
