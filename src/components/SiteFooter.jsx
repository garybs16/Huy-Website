import { Link } from "react-router-dom";
import academyLogo from "../assets/new-logo.jpg";
import { contactDetails, footerGroups } from "../siteData";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <p className="footer-kicker">Start with clarity</p>
          <img className="footer-logo" src={academyLogo} alt="First Step Healthcare Academy logo" />
          <p>
            Career training with visible schedules, flexible cohort options, and direct admissions
            support from first inquiry to registration.
          </p>
          <p className="footer-address">{contactDetails.address}</p>
          <div className="footer-action-row">
            <a className="footer-contact-link" href={contactDetails.phoneHref}>
              Call Admissions
            </a>
            <a className="footer-contact-link footer-contact-link-secondary" href={contactDetails.emailHref}>
              Email School
            </a>
          </div>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h4>{group.title}</h4>
            <ul>
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4>Contact</h4>
          <ul>
            <li>{contactDetails.coordinator}</li>
            <li>
              <a href={contactDetails.phoneHref}>{contactDetails.phone}</a>
            </li>
            <li>
              <a href={contactDetails.emailHref}>{contactDetails.email}</a>
            </li>
            <li>{contactDetails.officeHours}</li>
          </ul>
        </div>
      </div>
      <div className="footer-bar">
        <p>Copyright 2026 First Step Healthcare Academy. All rights reserved.</p>
      </div>
    </footer>
  );
}
