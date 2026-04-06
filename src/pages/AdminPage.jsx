import { PageIntro } from "../components/PageIntro";

function formatDateLabel(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminPage({
  adminKey,
  adminPending,
  adminError,
  adminOverview,
  adminEnrollments,
  adminInquiries,
  adminWaitlist,
  onAdminKeyChange,
  onAdminLoad,
}) {
  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Admin"
        title="Operations dashboard for enrollments, inquiries, and cohort activity."
        description="This page uses the protected admin APIs to load live enrollment metrics, lead intake, and cohort capacity without exposing that workflow in the public navigation."
      />

      <div className="container admin-shell">
        <form className="form-card admin-access" onSubmit={onAdminLoad}>
          <label>
            <span>Admin API key</span>
            <input
              type="password"
              value={adminKey}
              onChange={(event) => onAdminKeyChange(event.target.value)}
              placeholder="Enter x-api-key value"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={adminPending}>
            {adminPending ? "Loading..." : "Load Dashboard"}
          </button>
        </form>

        {adminError ? <p className="form-status is-error">{adminError}</p> : null}

        {adminOverview ? (
          <>
            <div className="card-grid metrics-grid">
              <article className="metric-card alt">
                <strong>{adminOverview.metrics.activeCohorts}</strong>
                <span>Active cohorts</span>
              </article>
              <article className="metric-card alt">
                <strong>{adminOverview.metrics.enrollments}</strong>
                <span>Total enrollments</span>
              </article>
              <article className="metric-card alt">
                <strong>{adminOverview.metrics.paidEnrollments}</strong>
                <span>Paid enrollments</span>
              </article>
              <article className="metric-card alt">
                <strong>{adminOverview.metrics.pendingPayments}</strong>
                <span>Pending payments</span>
              </article>
              <article className="metric-card alt">
                <strong>{adminOverview.metrics.inquiries}</strong>
                <span>Inquiries</span>
              </article>
              <article className="metric-card alt">
                <strong>{adminOverview.metrics.waitlist}</strong>
                <span>Waitlist</span>
              </article>
            </div>

            <div className="card-grid two-up">
              <article className="info-card">
                <h3>Recent enrollments</h3>
                <div className="admin-list">
                  {adminEnrollments.slice(0, 6).map((item) => (
                    <div key={item.id} className="admin-row">
                      <div>
                        <strong>{item.studentFullName}</strong>
                        <p>{item.email}</p>
                      </div>
                      <div>
                        <p>{item.cohortTitle}</p>
                        <span>{item.paymentStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="info-card">
                <h3>Recent inquiries</h3>
                <div className="admin-list">
                  {adminInquiries.slice(0, 6).map((item) => (
                    <div key={item.id} className="admin-row">
                      <div>
                        <strong>{item.fullName}</strong>
                        <p>{item.email}</p>
                      </div>
                      <div>
                        <p>{item.program}</p>
                        <span>{formatDateLabel(item.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="info-card">
                <h3>Recent waitlist activity</h3>
                <div className="admin-list">
                  {adminWaitlist.slice(0, 6).map((item) => (
                    <div key={item.id} className="admin-row">
                      <div>
                        <strong>{item.fullName}</strong>
                        <p>{item.email}</p>
                      </div>
                      <div>
                        <p>{item.phone || "No phone"}</p>
                        <span>{formatDateLabel(item.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="info-card">
                <h3>Cohort capacity</h3>
                <div className="admin-list">
                  {adminOverview.cohorts.slice(0, 6).map((item) => (
                    <div key={item.id} className="admin-row">
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.programTitle}</p>
                      </div>
                      <div>
                        <p>{item.remainingSeats} seats left</p>
                        <span>{item.tuitionLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
