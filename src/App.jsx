import "./App.css";

const assets = {
  hero:
    "https://images.unsplash.com/photo-1631217875107-83f23353f4f9?auto=format&fit=crop&w=1800&q=80",
  campus:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
  lab: "https://images.unsplash.com/photo-1582719366363-b95f4283be14?auto=format&fit=crop&w=1200&q=80",
  clinical:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
  instructor:
    "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=1200&q=80",
};

const navItems = [
  { label: "Programs", id: "programs" },
  { label: "Outcomes", id: "outcomes" },
  { label: "Admissions", id: "admissions" },
  { label: "Payments", id: "payments" },
  { label: "Contact", id: "contact" },
];

const trustPillars = [
  "State-approved curriculum",
  "Employer-aligned clinical hours",
  "Dedicated exam readiness coaching",
  "Career placement support",
];

const heroMetrics = [
  { value: "94%", label: "First-time state exam pass rate" },
  { value: "3", label: "Southern California learning centers" },
  { value: "2,400+", label: "Graduates trained since launch" },
];

const programs = [
  {
    title: "Certified Nurse Assistant",
    summary:
      "Accelerated classroom and lab training with supervised clinical rotations built for direct patient-care roles.",
    duration: "4-6 weeks",
    schedule: "Weekday, evening, and weekend cohorts",
  },
  {
    title: "Medication Aide Fundamentals",
    summary:
      "Safe medication administration training designed for caregivers and support staff expanding responsibilities.",
    duration: "3 weeks",
    schedule: "Evening and Saturday formats",
  },
  {
    title: "CPR / BLS Certification",
    summary:
      "AHA-aligned emergency response certification for healthcare professionals and teams needing immediate compliance.",
    duration: "1 day",
    schedule: "Daily open sessions",
  },
];

const outcomes = [
  { value: "87%", label: "Graduate placement within 90 days" },
  { value: "4.9 / 5", label: "Average student satisfaction score" },
  { value: "52", label: "Active hiring partners across SoCal" },
  { value: "24/7", label: "Online student portal availability" },
];

const admissionsSteps = [
  {
    title: "Career Consultation",
    detail: "Meet admissions to map your goals, schedule, and licensing pathway.",
  },
  {
    title: "Document Review",
    detail: "Submit ID, screening records, and enrollment paperwork through a secure portal.",
  },
  {
    title: "Enrollment Confirmation",
    detail: "Receive class start date, orientation packet, and faculty onboarding details.",
  },
  {
    title: "Start Training",
    detail: "Begin structured classroom instruction, labs, and clinical preparation.",
  },
];

const paymentMethods = [
  {
    name: "Stripe Checkout",
    description: "Card, ACH, and installment-friendly payments through hosted, PCI-compliant checkout links.",
  },
  {
    name: "Square Invoices",
    description: "Simple payment links for tuition, registration fees, and late-intake enrollment adjustments.",
  },
  {
    name: "PayPal",
    description: "Alternative checkout option for families and sponsors who prefer PayPal wallet payments.",
  },
];

const testimonials = [
  {
    name: "Mia R.",
    role: "CNA Graduate",
    quote:
      "The structure felt professional from day one. Clinical prep and exam practice were exactly what employers expected.",
  },
  {
    name: "Jorge L.",
    role: "Medication Aide Student",
    quote:
      "Admissions and scheduling were clear, fast, and easy to manage while I was working full-time.",
  },
  {
    name: "Nina C.",
    role: "Partner Facility Supervisor",
    quote:
      "Pacific Crest graduates arrive trained, accountable, and ready for real patient-care standards.",
  },
];

function App() {
  return (
    <div className="site">
      <header className="announcement">
        <div className="container announcement-inner">
          <p>
            <strong>Approved by California Department of Public Health</strong>
          </p>
          <a href="#admissions">Spring 2026 enrollment now open</a>
        </div>
      </header>

      <nav className="navbar">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <span className="brand-mark" aria-hidden="true">
              PC
            </span>
            <span className="brand-text">
              <strong>Pacific Crest Allied Health Institute</strong>
              <span>Southern California</span>
            </span>
          </a>
          <div className="menu">
            {navItems.map((item) => (
              <a key={item.label} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </div>
          <a href="#contact" className="btn btn-navy nav-cta">
            Talk to Admissions
          </a>
        </div>
      </nav>

      <main>
        <section
          className="hero"
          id="top"
          style={{
            backgroundImage: `linear-gradient(115deg, rgba(7, 29, 49, 0.9), rgba(12, 55, 88, 0.82)), url(${assets.hero})`,
          }}
        >
          <div className="container hero-grid">
            <div className="hero-copy reveal">
              <p className="hero-badge">
                <strong>Approved by California Department of Public Health</strong>
              </p>
              <p className="eyebrow">Corporate-level healthcare education platform</p>
              <h1>Workforce-ready CNA training built for SoCal healthcare employers.</h1>
              <p className="hero-text">
                Pacific Crest Allied Health Institute delivers structured instruction, live skills
                labs, and clinical placement support with clear outcomes and executive-grade
                operational standards.
              </p>
              <div className="cta-row">
                <a href="#programs" className="btn btn-gold">
                  Explore Programs
                </a>
                <a href="#payments" className="btn btn-ghost">
                  Secure Payment Options
                </a>
              </div>
              <ul className="pillar-list">
                {trustPillars.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <aside className="hero-panel reveal delay-1">
              <article className="panel-card">
                <h2>Next Cohort Intake</h2>
                <p className="cohort-date">March 17, 2026</p>
                <p>Orange Campus and hybrid evening format available.</p>
                <a href="#admissions" className="btn btn-teal">
                  Reserve Your Seat
                </a>
              </article>
              <div className="metric-stack">
                {heroMetrics.map((metric) => (
                  <article key={metric.label} className="metric-card">
                    <h3>{metric.value}</h3>
                    <p>{metric.label}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="trust-strip">
          <div className="container trust-inner">
            <p>Trusted by students, hiring facilities, and workforce partners across Southern California.</p>
            <div className="trust-badges">
              <span>CDPH Approved</span>
              <span>Clinical Partner Network</span>
              <span>Career Services Team</span>
              <span>Outcome Reporting</span>
            </div>
          </div>
        </section>

        <section className="section programs" id="programs">
          <div className="container">
            <p className="section-tag">Programs</p>
            <h2>Professional pathways designed for immediate healthcare employability.</h2>
            <div className="program-grid">
              {programs.map((program, index) => (
                <article key={program.title} className={`program-card reveal delay-${index + 1}`}>
                  <img src={index === 0 ? assets.lab : index === 1 ? assets.clinical : assets.instructor} alt={program.title} />
                  <div className="program-body">
                    <h3>{program.title}</h3>
                    <p>{program.summary}</p>
                    <ul>
                      <li>Duration: {program.duration}</li>
                      <li>Schedule: {program.schedule}</li>
                    </ul>
                    <a href="#admissions" className="text-link">
                      View admission requirements
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section outcomes" id="outcomes">
          <div className="container outcomes-grid">
            <div className="outcomes-copy reveal">
              <p className="section-tag">Outcomes</p>
              <h2>Data-backed performance and operational discipline.</h2>
              <p>
                From admissions through placement, our team follows measurable service-level
                standards to keep student progress predictable, compliant, and employer-ready.
              </p>
              <a href="#contact" className="btn btn-navy">
                Request Program Packet
              </a>
            </div>
            <div className="outcomes-media reveal delay-1">
              <img src={assets.campus} alt="Southern California healthcare training campus" />
              <div className="outcome-metrics">
                {outcomes.map((item) => (
                  <article key={item.label} className="outcome-card">
                    <h3>{item.value}</h3>
                    <p>{item.label}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section admissions" id="admissions">
          <div className="container">
            <p className="section-tag">Admissions</p>
            <h2>Simple four-step enrollment pipeline.</h2>
            <div className="timeline">
              {admissionsSteps.map((step, index) => (
                <article key={step.title} className={`timeline-card reveal delay-${index + 1}`}>
                  <p className="step-number">Step {index + 1}</p>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section payments" id="payments">
          <div className="container payments-grid">
            <div className="payments-copy reveal">
              <p className="section-tag">Payments</p>
              <h2>Enterprise-grade payment processing options.</h2>
              <p>
                Adding payments is straightforward. We can deploy hosted checkout links first for
                speed, then move to fully embedded checkout flows when your team is ready.
              </p>
              <p className="payments-note">
                Recommended launch path: Stripe Checkout first, then Square and PayPal as secondary
                options.
              </p>
              <a href="#contact" className="btn btn-teal">
                Set Up Online Payments
              </a>
            </div>
            <div className="payment-cards reveal delay-1">
              {paymentMethods.map((method) => (
                <article key={method.name} className="payment-card">
                  <h3>{method.name}</h3>
                  <p>{method.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section testimonials">
          <div className="container">
            <p className="section-tag">Credibility</p>
            <h2>What students and partners say about program quality.</h2>
            <div className="testimonial-grid">
              {testimonials.map((item, index) => (
                <article key={item.name} className={`testimonial-card reveal delay-${index + 1}`}>
                  <p className="quote">"{item.quote}"</p>
                  <h3>{item.name}</h3>
                  <p className="role">{item.role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section contact" id="contact">
          <div className="container contact-grid">
            <article className="contact-card reveal">
              <p className="section-tag">Contact</p>
              <h2>Connect with admissions and operations.</h2>
              <ul>
                <li>Phone: (714) 555-2148</li>
                <li>Email: admissions@pacificcrestahi.com</li>
                <li>Orange Campus: 420 S Main St, Orange, CA 92868</li>
                <li>Santa Ana Campus: 1540 Brookhollow Dr, Santa Ana, CA 92705</li>
              </ul>
            </article>
            <article className="contact-form-card reveal delay-1">
              <h3>Request Information</h3>
              <form className="contact-form">
                <input type="text" placeholder="Full name" />
                <input type="email" placeholder="Email address" />
                <input type="tel" placeholder="Phone number" />
                <select defaultValue="">
                  <option value="" disabled>
                    Program of interest
                  </option>
                  <option value="cna">Certified Nurse Assistant</option>
                  <option value="med-aide">Medication Aide Fundamentals</option>
                  <option value="cpr">CPR / BLS Certification</option>
                </select>
                <textarea rows="4" placeholder="How can we help?" />
                <button type="button" className="btn btn-navy">
                  Submit Inquiry
                </button>
              </form>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h3>Pacific Crest Allied Health Institute</h3>
            <p>
              Corporate-standard allied health training platform serving Southern California
              students and healthcare employers.
            </p>
          </div>
          <div>
            <h4>Programs</h4>
            <ul>
              <li>Certified Nurse Assistant</li>
              <li>Medication Aide Fundamentals</li>
              <li>CPR / BLS Certification</li>
            </ul>
          </div>
          <div>
            <h4>Admissions</h4>
            <ul>
              <li>Enrollment Process</li>
              <li>Payment Options</li>
              <li>Class Schedules</li>
            </ul>
          </div>
          <div>
            <h4>Locations</h4>
            <ul>
              <li>Orange, CA</li>
              <li>Santa Ana, CA</li>
              <li>Irvine, CA</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>Copyright 2026 Pacific Crest Allied Health Institute. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

