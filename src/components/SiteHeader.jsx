import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import academyLogoMark from "../assets/logo.jpg";
import { contactDetails } from "../siteData";

export function SiteHeader({ navItems }) {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!navOpen) {
      return undefined;
    }

    const closeMenu = () => setNavOpen(false);
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        toggleRef.current?.focus();
      }
    };

    const closeOnOutsidePress = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.body.classList.add("nav-menu-open");

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.body.classList.remove("nav-menu-open");
    };
  }, [navOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="top-strip">
        <div className="container top-strip-inner">
          <div className="top-strip-meta">
            <a className="top-strip-phone" href={contactDetails.phoneHref} aria-label={`Call admissions at ${contactDetails.phone}`}>
              {contactDetails.phone}
            </a>
            <a className="top-strip-email" href={contactDetails.emailHref}>{contactDetails.email}</a>
          </div>
          <div className="top-strip-actions">
            <Link to="/contact" className="top-strip-link">
              Student Support
            </Link>
          </div>
        </div>
      </div>

      <div className="container nav-frame">
        <Link className="brand-lockup" to="/" aria-label="First Step Healthcare Academy home">
          <img className="brand-icon-image" src={academyLogoMark} alt="" aria-hidden="true" />
          <div className="brand-copy">
            <strong className="brand-title">{contactDetails.brand}</strong>
            <span className="brand-subtitle">Healthcare training with a clear next step</span>
          </div>
        </Link>

        <button
          ref={toggleRef}
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
              onClick={() => setNavOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={`nav-actions ${navOpen ? "is-open" : ""}`}>
          <Link to="/schedule" className="btn btn-ghost nav-button-secondary" onClick={() => setNavOpen(false)}>
            View Schedule
          </Link>
          <Link to="/register" className="btn btn-primary nav-button" onClick={() => setNavOpen(false)}>
            Register Now
          </Link>
        </div>
      </div>
    </header>
  );
}
