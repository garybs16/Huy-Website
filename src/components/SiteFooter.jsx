import { Link } from "react-router-dom";
import academyLogo from "../assets/logo.jpg";

export function SiteFooter({ navItems }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img className="footer-logo" src={academyLogo} alt="First Step Healthcare Academy logo" />
          <p>
            First Step Healthcare Academy with a more focused program, cohort, registration, and
            admissions experience.
          </p>
        </div>
        <div>
          <h4>Navigate</h4>
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/register">Register</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>Huy Hoang</li>
            <li>(949) 407-9581</li>
            <li>huyh@firststepha.org</li>
          </ul>
        </div>
      </div>
      <div className="footer-bar">
        <p>Copyright 2026 First Step Healthcare Academy. All rights reserved.</p>
      </div>
    </footer>
  );
}
