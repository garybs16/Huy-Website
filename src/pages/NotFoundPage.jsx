import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="section not-found-page">
      <div className="container not-found-card">
        <p className="section-kicker">Page not found</p>
        <span className="not-found-code" aria-hidden="true">404</span>
        <h1>That page isn’t part of the training path.</h1>
        <p>
          The link may be outdated, or the address may have been entered incorrectly. Use one of
          the clear paths below to keep moving.
        </p>
        <div className="button-row">
          <Link to="/" className="btn btn-primary">Return home</Link>
          <Link to="/schedule" className="btn btn-ghost">View class schedule</Link>
          <Link to="/contact" className="btn btn-ghost">Contact admissions</Link>
        </div>
      </div>
    </section>
  );
}
