import "./App.css";

const assets = {
  logo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80",
  professor:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
  student:
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=900&q=80",
  cna:
    "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=900&q=80",
  care:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80",
};

const navItems = [
  { label: "Home", id: "top" },
  { label: "About", id: "about" },
  { label: "Gallery", id: "gallery" },
  { label: "Admission", id: "admission" },
  { label: "Course Schedule", id: "course-schedule" },
  { label: "Programs", id: "programs" },
  { label: "Student Policy", id: "student-policy" },
  { label: "Contact Us", id: "contact" },
];

const tracks = [
  {
    name: "Week Day Program",
    schedule: "Mon to Thu (4 weeks)",
    hours: "9:00 AM - 3:00 PM",
  },
  {
    name: "Weekend Program",
    schedule: "Sat & Sun (6 weeks)",
    hours: "9:00 AM - 3:00 PM",
  },
  {
    name: "Evening Program",
    schedule: "Mon to Thu (4 weeks)",
    hours: "4:00 PM - 9:00 PM",
  },
];

const programs = [
  {
    title: "Certified Nurse Aide Program",
    summary:
      "16 day classroom instruction plus 24 hour clinical internship for direct patient-care readiness.",
    cta: "CNA Registration",
  },
  {
    title: "Medication Aide Program",
    summary:
      "40 hour classroom and 20 hour clinical training for safe medication administration support.",
    cta: "Med-Aide Registration",
  },
  {
    title: "CPR Program",
    summary:
      "AHA/ARC aligned CPR session for healthcare and caregiver teams needing credential updates.",
    cta: "CPR Registration",
  },
];

const fees = [
  "Tuition Fee: $950",
  "Registration Fee: $100",
  "Book & Supplies: $175",
  "Background Check: $44.95",
  "Drug Test: $40.00",
  "ID Badge: $10.00",
  "State Written Exam: $104",
  "State Clinical Exam: $104",
];

const schedules = [
  {
    label: "Weekday Classes",
    dates: "Mar 10, 2026 - Apr 2, 2026",
  },
  {
    label: "Weekend Classes",
    dates: "Mar 7, 2026 - Apr 12, 2026",
  },
  {
    label: "Evening Classes",
    dates: "Mar 9, 2026 - Apr 1, 2026",
  },
];

const requirements = [
  "Must be at least 18 years old",
  "Valid photo ID and Social Security card",
  "Able to read, write, and speak English",
  "Clean criminal background check",
  "Negative TB screening",
];

const testimonials = [
  {
    name: "Ariana D.",
    quote:
      "The instructors made every lesson practical. I passed state testing on my first attempt.",
  },
  {
    name: "Luis M.",
    quote:
      "Flexible class options helped me train while working. Clinical prep was direct and useful.",
  },
  {
    name: "Shawna T.",
    quote:
      "Admissions support was smooth and the team stayed responsive through enrollment and exam prep.",
  },
];

function App() {
  return (
    <div className="page">
      <header className="topbar">
        <div className="container topbar-inner">
          <p>Professional Healthcare Training in SoCal</p>
          <a href="#contact">Student Login</a>
        </div>
      </header>

      <nav className="navbar">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <img src={assets.logo} alt="Pacific Crest Allied Health Institute" />
          </a>
          <div className="menu">
            {navItems.map((item) => (
              <a key={item.label} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section
        className="hero"
        id="top"
        style={{
          backgroundImage: `linear-gradient(rgba(5, 22, 43, 0.78), rgba(5, 22, 43, 0.86)), url(${assets.care})`,
        }}
      >
        <div className="container hero-content">
          <span className="kicker">Get your</span>
          <h1>CNA Certification in SoCal</h1>
          <p>
            Train with experienced instructors through weekday, weekend, or evening tracks and
            prepare for state CNA testing with confidence.
          </p>
          <div className="hero-cta">
            <a href="#admission" className="btn btn-solid">
              Admission Details
            </a>
            <a href="#programs" className="btn btn-outline">
              Explore Programs
            </a>
          </div>
        </div>
      </section>

      <section className="section cards" id="course-schedule">
        <div className="container">
          <h2>Choose Your Learning Track</h2>
          <div className="track-grid">
            {tracks.map((track) => (
              <article key={track.name} className="card">
                <h3>{track.name}</h3>
                <p>{track.schedule}</p>
                <p>{track.hours}</p>
                <a href="#admission" className="btn btn-solid">
                  Register Now
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="banner">
        <div className="container banner-inner">
          <div>
            <h3>Online Class + In-Person Clinical</h3>
            <p>Hybrid support available to reduce commute time and keep your training on schedule.</p>
          </div>
          <a href="#contact" className="btn btn-solid">
            Speak With Admissions
          </a>
        </div>
      </section>

      <section className="section about" id="about">
        <div className="container about-grid">
          <div className="about-copy">
            <h2>Pacific Crest Allied Health Institute in Brief</h2>
            <p>
              Pacific Crest Allied Health Institute is approved by the California Department of Public Health &
              Human Services and focused on workforce-ready nurse aide training.
            </p>
            <ul>
              <li>California-focused curriculum</li>
              <li>Small class support and guided labs</li>
              <li>State exam preparation focus</li>
            </ul>
          </div>
          <div className="about-media">
            <img src={assets.professor} alt="Instructor" />
            <img src={assets.student} alt="Student" />
          </div>
        </div>
      </section>

      <section className="section programs" id="programs">
        <div className="container">
          <h2>Our Programs</h2>
          <div className="program-grid">
            {programs.map((program) => (
              <article key={program.title} className="program-card">
                <img src={assets.cna} alt="" aria-hidden="true" />
                <h3>{program.title}</h3>
                <p>{program.summary}</p>
                <a href="#admission" className="btn btn-outline">
                  {program.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="assist">
        <div className="container assist-inner">
          <h3>Job Placement Assistance Available</h3>
          <p>
            We provide resume guidance and interview support to help graduates move from training to
            employment.
          </p>
        </div>
      </section>

      <section className="section tuition" id="admission">
        <div className="container split-grid">
          <article className="panel">
            <h2>Tuition & Fees</h2>
            <ul>
              {fees.map((fee) => (
                <li key={fee}>{fee}</li>
              ))}
            </ul>
          </article>
          <article className="panel">
            <h2>Enrollment Requirements</h2>
            <ul>
              {requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Class Locations</h3>
            <p>420 S Main St, Orange, CA 92868</p>
            <p>1540 Brookhollow Dr, Santa Ana, CA 92705</p>
          </article>
        </div>
      </section>

      <section className="section schedule" id="course-dates">
        <div className="container">
          <h2>Upcoming Course Dates</h2>
          <div className="schedule-grid">
            {schedules.map((item) => (
              <article key={item.label} className="schedule-card">
                <h3>{item.label}</h3>
                <p>{item.dates}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section testimonials" id="student-policy">
        <div className="container">
          <h2>Testimonials</h2>
          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.name} className="testimonial-card">
                <p className="stars">*****</p>
                <p>{item.quote}</p>
                <h3>{item.name}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="container split-grid">
          <article className="panel">
            <h2>Contact Us</h2>
            <p>Phone: (864) 385-4335</p>
            <p>Email: admissions@pacificcrestahi.com</p>
            <p>Hours: Mon - Fri, 8:00 AM - 5:00 PM</p>
          </article>
          <article className="panel">
            <h2>Send a Message</h2>
            <form className="contact-form">
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
              <input type="tel" placeholder="Phone" />
              <textarea rows="4" placeholder="How can we help?" />
              <button type="button" className="btn btn-solid">
                Submit
              </button>
            </form>
          </article>
        </div>
      </section>

      <footer className="footer" id="gallery">
        <div className="container footer-grid">
          <div>
            <img src={assets.logo} alt="Pacific Crest Allied Health Institute logo" className="footer-logo" />
            <p>Building compassionate healthcare professionals through practical training.</p>
          </div>
          <div>
            <h3>Quick Menu</h3>
            <ul>
              {navItems.slice(0, 5).map((item) => (
                <li key={item.label}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Programs</h3>
            <ul>
              <li>CNA Program</li>
              <li>Medication Aide</li>
              <li>CPR Program</li>
            </ul>
          </div>
          <div>
            <h3>Contact</h3>
            <ul>
              <li>(864) 385-4335</li>
              <li>Orange, CA</li>
              <li>Santa Ana, CA</li>
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

