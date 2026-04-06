import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import academyLogo from "../assets/logo.jpg";

export function SiteHeader({ navItems }) {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>New cohort registration and online payment support are now available.</span>
          <Link to="/register" className="top-strip-link">
            Start enrollment
          </Link>
        </div>
      </div>

      <div className="container nav-frame">
        <Link className="brand-lockup" to="/">
          <span className="brand-icon" aria-hidden="true">
            <img className="brand-icon-image" src={academyLogo} alt="" />
          </span>
          <span className="brand-copy">
            <strong>First Step</strong>
            <span>Healthcare Academy</span>
          </span>
        </Link>

        <button
          type="button"
          className={`nav-toggle ${navOpen ? "is-open" : ""}`}
          aria-expanded={navOpen}
          aria-controls="primary-navigation"
          aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setNavOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="primary-navigation" className={`site-nav ${navOpen ? "is-open" : ""}`} aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={`nav-actions ${navOpen ? "is-open" : ""}`}>
          <Link to="/register" className="btn btn-primary nav-button">
            Register Now
          </Link>
        </div>
      </div>
    </header>
  );
}
