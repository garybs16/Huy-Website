import { useEffect, useState } from "react";
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

function createEmptyProgramForm() {
  return {
    id: "",
    title: "",
    summary: "",
    duration: "",
    schedule: "",
    sortOrder: "0",
    isActive: true,
  };
}

function createEmptyCohortForm() {
  return {
    id: "",
    programId: "",
    title: "",
    startDate: "",
    endDate: "",
    scheduleLabel: "",
    meetingPattern: "",
    tuitionCents: "",
    allowPaymentPlan: false,
    paymentPlanDepositCents: "",
    capacity: "",
    sortOrder: "0",
    isActive: true,
  };
}

function toProgramForm(program) {
  return {
    id: program.id,
    title: program.title,
    summary: program.summary,
    duration: program.duration,
    schedule: program.schedule,
    sortOrder: String(program.sortOrder ?? 0),
    isActive: Boolean(program.isActive),
  };
}

function toCohortForm(cohort) {
  return {
    id: cohort.id,
    programId: cohort.programId,
    title: cohort.title,
    startDate: cohort.startDate,
    endDate: cohort.endDate,
    scheduleLabel: cohort.scheduleLabel,
    meetingPattern: cohort.meetingPattern,
    tuitionCents: String(cohort.tuitionCents ?? ""),
    allowPaymentPlan: Boolean(cohort.allowPaymentPlan),
    paymentPlanDepositCents: cohort.paymentPlanDepositCents ? String(cohort.paymentPlanDepositCents) : "",
    capacity: String(cohort.capacity ?? ""),
    sortOrder: String(cohort.sortOrder ?? 0),
    isActive: Boolean(cohort.isActive),
  };
}

export function AdminPage({
  adminKey,
  adminUsername,
  adminPassword,
  adminSession,
  adminPending,
  adminMutationPending,
  adminError,
  adminNotice,
  adminOverview,
  adminEnrollments,
  adminInquiries,
  adminWaitlist,
  adminPrograms,
  adminCohorts,
  onAdminKeyChange,
  onAdminUsernameChange,
  onAdminPasswordChange,
  onAdminLoad,
  onAdminLogin,
  onAdminLogout,
  onCreateProgram,
  onUpdateProgram,
  onDeleteProgram,
  onCreateCohort,
  onUpdateCohort,
  onDeleteCohort,
  onAdminExport,
  onCreateBackup,
}) {
  const [programForm, setProgramForm] = useState(createEmptyProgramForm);
  const [cohortForm, setCohortForm] = useState(createEmptyCohortForm);
  const [editingProgramId, setEditingProgramId] = useState("");
  const [editingCohortId, setEditingCohortId] = useState("");

  useEffect(() => {
    if (!editingProgramId) {
      setProgramForm(createEmptyProgramForm());
      return;
    }

    const currentProgram = adminPrograms.find((item) => item.id === editingProgramId);

    if (currentProgram) {
      setProgramForm(toProgramForm(currentProgram));
    } else {
      setEditingProgramId("");
      setProgramForm(createEmptyProgramForm());
    }
  }, [adminPrograms, editingProgramId]);

  useEffect(() => {
    if (!editingCohortId) {
      setCohortForm((current) => ({
        ...createEmptyCohortForm(),
        programId: adminPrograms[0]?.id ?? "",
      }));
      return;
    }

    const currentCohort = adminCohorts.find((item) => item.id === editingCohortId);

    if (currentCohort) {
      setCohortForm(toCohortForm(currentCohort));
    } else {
      setEditingCohortId("");
      setCohortForm((current) => ({
        ...createEmptyCohortForm(),
        programId: adminPrograms[0]?.id ?? current.programId ?? "",
      }));
    }
  }, [adminCohorts, adminPrograms, editingCohortId]);

  const adminBusy = adminPending || adminMutationPending;
  const usingSessionLogin = adminSession.sessionAuthConfigured;
  const usingApiKeyFallback = adminSession.apiKeySupported;
  const isSignedIn = adminSession.authenticated;

  const handleProgramInput = (event) => {
    const { name, type, checked, value } = event.target;
    setProgramForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCohortInput = (event) => {
    const { name, type, checked, value } = event.target;
    setCohortForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const resetProgramForm = () => {
    setEditingProgramId("");
    setProgramForm(createEmptyProgramForm());
  };

  const resetCohortForm = () => {
    setEditingCohortId("");
    setCohortForm({
      ...createEmptyCohortForm(),
      programId: adminPrograms[0]?.id ?? "",
    });
  };

  const handleProgramSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...programForm,
      sortOrder: Number(programForm.sortOrder || 0),
      isActive: Boolean(programForm.isActive),
    };

    const ok = editingProgramId
      ? await onUpdateProgram(editingProgramId, payload)
      : await onCreateProgram(payload);

    if (ok) {
      resetProgramForm();
    }
  };

  const handleCohortSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...cohortForm,
      tuitionCents: Number(cohortForm.tuitionCents || 0),
      paymentPlanDepositCents: cohortForm.allowPaymentPlan ? Number(cohortForm.paymentPlanDepositCents || 0) : null,
      capacity: Number(cohortForm.capacity || 0),
      sortOrder: Number(cohortForm.sortOrder || 0),
      allowPaymentPlan: Boolean(cohortForm.allowPaymentPlan),
      isActive: Boolean(cohortForm.isActive),
    };

    const ok = editingCohortId
      ? await onUpdateCohort(editingCohortId, payload)
      : await onCreateCohort(payload);

    if (ok) {
      resetCohortForm();
    }
  };

  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Admin"
        title="Operations dashboard for enrollments, inquiries, and live catalog management."
        description="Use signed admin sessions or the protected fallback key path, then manage operations and catalog data from one place."
        accent="Protected operations and catalog controls"
        note="Login, audit visibility, intake tracking, and catalog maintenance now live in the same dashboard."
      />

      <div className="container admin-shell">
        <div className="admin-access-grid">
          {usingSessionLogin ? (
            <form className="form-card admin-access" onSubmit={onAdminLogin}>
              <div className="admin-access-top">
                <div>
                  <p className="section-kicker">Admin login</p>
                  <h3>{isSignedIn ? "Session active" : "Sign in securely"}</h3>
                </div>
                <span className="admin-auth-pill">{isSignedIn ? "Session" : "Credential login"}</span>
              </div>
              {isSignedIn ? (
                <>
                  <p className="form-helper">
                    Signed in as <strong>{adminSession.username}</strong>.
                  </p>
                  <div className="admin-session-actions">
                    <button type="button" className="btn btn-primary" onClick={onAdminLoad} disabled={adminBusy}>
                      {adminPending ? "Refreshing..." : "Load Dashboard"}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={onAdminLogout} disabled={adminBusy}>
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <label>
                    <span>Username</span>
                    <input
                      value={adminUsername}
                      onChange={(event) => onAdminUsernameChange(event.target.value)}
                      placeholder="admin"
                      autoComplete="username"
                    />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(event) => onAdminPasswordChange(event.target.value)}
                      placeholder="Enter admin password"
                      autoComplete="current-password"
                    />
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={adminBusy}>
                    {adminPending ? "Signing in..." : "Sign In"}
                  </button>
                </>
              )}
            </form>
          ) : null}

          {usingApiKeyFallback ? (
            <form className="form-card admin-access" onSubmit={onAdminLoad}>
              <div className="admin-access-top">
                <div>
                  <p className="section-kicker">Fallback access</p>
                  <h3>Protected API key path</h3>
                </div>
                <span className="admin-auth-pill">Legacy</span>
              </div>
              <label>
                <span>Admin API key</span>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(event) => onAdminKeyChange(event.target.value)}
                  placeholder="Enter x-api-key value"
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={adminBusy}>
                {adminPending ? "Loading..." : "Load Dashboard"}
              </button>
            </form>
          ) : null}
        </div>

        {adminError ? <p className="form-status is-error">{adminError}</p> : null}
        {adminNotice ? <p className="form-status is-success">{adminNotice}</p> : null}

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
                <span>Paid in full</span>
              </article>
              <article className="metric-card alt">
                <strong>{adminOverview.metrics.activePaymentPlans}</strong>
                <span>Active payment plans</span>
              </article>
              <article className="metric-card alt">
                <strong>{adminOverview.metrics.activeAdminSessions}</strong>
                <span>Active admin sessions</span>
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

            <article className="info-card admin-ops-card">
              <div>
                <p className="section-kicker">Production operations</p>
                <h3>Export records or create a database backup before major changes.</h3>
              </div>
              <div className="admin-session-actions">
                <button type="button" className="btn btn-primary" onClick={onAdminExport} disabled={adminBusy}>
                  Export Operations
                </button>
                <button type="button" className="btn btn-ghost" onClick={onCreateBackup} disabled={adminBusy}>
                  Create Backup
                </button>
              </div>
            </article>

            <div className="card-grid two-up">
              <article className="form-card admin-editor">
                <div className="admin-card-top">
                  <div>
                    <p className="section-kicker">Catalog</p>
                    <h3>{editingProgramId ? "Edit program" : "Create program"}</h3>
                  </div>
                  {editingProgramId ? (
                    <button type="button" className="btn btn-ghost admin-inline-button" onClick={resetProgramForm}>
                      New Program
                    </button>
                  ) : null}
                </div>
                <form className="form-stack" onSubmit={handleProgramSubmit}>
                  <div className="form-grid two-up">
                    <label>
                      <span>Program id</span>
                      <input
                        name="id"
                        value={programForm.id}
                        onChange={handleProgramInput}
                        placeholder="cna-evening-plus"
                        disabled={Boolean(editingProgramId)}
                        required
                      />
                    </label>
                    <label>
                      <span>Sort order</span>
                      <input
                        name="sortOrder"
                        type="number"
                        min="0"
                        value={programForm.sortOrder}
                        onChange={handleProgramInput}
                        required
                      />
                    </label>
                  </div>
                  <label>
                    <span>Title</span>
                    <input name="title" value={programForm.title} onChange={handleProgramInput} required />
                  </label>
                  <label>
                    <span>Summary</span>
                    <textarea name="summary" rows="4" value={programForm.summary} onChange={handleProgramInput} required />
                  </label>
                  <div className="form-grid two-up">
                    <label>
                      <span>Duration</span>
                      <input name="duration" value={programForm.duration} onChange={handleProgramInput} required />
                    </label>
                    <label>
                      <span>Schedule</span>
                      <input name="schedule" value={programForm.schedule} onChange={handleProgramInput} required />
                    </label>
                  </div>
                  <label className="admin-toggle">
                    <input name="isActive" type="checkbox" checked={programForm.isActive} onChange={handleProgramInput} />
                    <span>Program is active on the public site</span>
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={adminBusy}>
                    {adminMutationPending ? "Saving..." : editingProgramId ? "Save Program" : "Create Program"}
                  </button>
                </form>
              </article>

              <article className="info-card admin-manager">
                <div className="admin-card-top">
                  <div>
                    <p className="section-kicker">Current programs</p>
                    <h3>Manage public training options</h3>
                  </div>
                </div>
                <div className="admin-list">
                  {adminPrograms.map((item) => (
                    <div key={item.id} className="admin-record">
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.id}</p>
                        <p>{item.duration} | {item.schedule}</p>
                      </div>
                      <div className="admin-record-actions">
                        <span>{item.isActive ? "Active" : "Inactive"}</span>
                        <button
                          type="button"
                          className="btn btn-ghost admin-inline-button"
                          onClick={() => setEditingProgramId(item.id)}
                          disabled={adminBusy}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost admin-inline-button admin-danger-button"
                          onClick={() => {
                            if (window.confirm(`Delete program "${item.title}"?`)) {
                              onDeleteProgram(item.id);
                            }
                          }}
                          disabled={adminBusy}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="card-grid two-up">
              <article className="form-card admin-editor">
                <div className="admin-card-top">
                  <div>
                    <p className="section-kicker">Cohorts</p>
                    <h3>{editingCohortId ? "Edit cohort" : "Create cohort"}</h3>
                  </div>
                  {editingCohortId ? (
                    <button type="button" className="btn btn-ghost admin-inline-button" onClick={resetCohortForm}>
                      New Cohort
                    </button>
                  ) : null}
                </div>
                <form className="form-stack" onSubmit={handleCohortSubmit}>
                  <div className="form-grid two-up">
                    <label>
                      <span>Cohort id</span>
                      <input
                        name="id"
                        value={cohortForm.id}
                        onChange={handleCohortInput}
                        placeholder="cna-weekday-jun-2026"
                        disabled={Boolean(editingCohortId)}
                        required
                      />
                    </label>
                    <label>
                      <span>Program</span>
                      <select name="programId" value={cohortForm.programId} onChange={handleCohortInput} required>
                        <option value="" disabled>
                          Select a program
                        </option>
                        {adminPrograms.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    <span>Title</span>
                    <input name="title" value={cohortForm.title} onChange={handleCohortInput} required />
                  </label>
                  <div className="form-grid two-up">
                    <label>
                      <span>Start date</span>
                      <input name="startDate" type="date" value={cohortForm.startDate} onChange={handleCohortInput} required />
                    </label>
                    <label>
                      <span>End date</span>
                      <input name="endDate" type="date" value={cohortForm.endDate} onChange={handleCohortInput} required />
                    </label>
                  </div>
                  <div className="form-grid two-up">
                    <label>
                      <span>Schedule label</span>
                      <input name="scheduleLabel" value={cohortForm.scheduleLabel} onChange={handleCohortInput} required />
                    </label>
                    <label>
                      <span>Meeting pattern</span>
                      <input name="meetingPattern" value={cohortForm.meetingPattern} onChange={handleCohortInput} required />
                    </label>
                  </div>
                  <div className="form-grid three-up">
                    <label>
                      <span>Tuition cents</span>
                      <input
                        name="tuitionCents"
                        type="number"
                        min="0"
                        value={cohortForm.tuitionCents}
                        onChange={handleCohortInput}
                        required
                      />
                    </label>
                    <label>
                      <span>Capacity</span>
                      <input name="capacity" type="number" min="1" value={cohortForm.capacity} onChange={handleCohortInput} required />
                    </label>
                    <label>
                      <span>Sort order</span>
                      <input name="sortOrder" type="number" min="0" value={cohortForm.sortOrder} onChange={handleCohortInput} required />
                    </label>
                  </div>
                  <label className="admin-toggle">
                    <input
                      name="allowPaymentPlan"
                      type="checkbox"
                      checked={cohortForm.allowPaymentPlan}
                      onChange={handleCohortInput}
                    />
                    <span>Offer a deposit-based payment plan for this cohort</span>
                  </label>
                  <label>
                    <span>Deposit cents</span>
                    <input
                      name="paymentPlanDepositCents"
                      type="number"
                      min="0"
                      value={cohortForm.paymentPlanDepositCents}
                      onChange={handleCohortInput}
                      disabled={!cohortForm.allowPaymentPlan}
                      required={cohortForm.allowPaymentPlan}
                      placeholder={cohortForm.allowPaymentPlan ? "65000" : "Enable payment plan first"}
                    />
                  </label>
                  <label className="admin-toggle">
                    <input name="isActive" type="checkbox" checked={cohortForm.isActive} onChange={handleCohortInput} />
                    <span>Cohort is visible on the public site</span>
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={adminBusy}>
                    {adminMutationPending ? "Saving..." : editingCohortId ? "Save Cohort" : "Create Cohort"}
                  </button>
                </form>
              </article>

              <article className="info-card admin-manager">
                <div className="admin-card-top">
                  <div>
                    <p className="section-kicker">Current cohorts</p>
                    <h3>Manage live class availability</h3>
                  </div>
                </div>
                <div className="admin-list">
                  {adminCohorts.map((item) => (
                    <div key={item.id} className="admin-record">
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.programTitle}</p>
                        <p>{item.startDate} to {item.endDate}</p>
                        <p>{item.remainingSeats} seats left | {item.tuitionLabel}</p>
                        <p>
                          {item.allowPaymentPlan
                            ? `Plan enabled | ${item.paymentPlanDepositLabel} deposit`
                            : "Full payment only"}
                        </p>
                      </div>
                      <div className="admin-record-actions">
                        <span>{item.isActive ? "Active" : "Inactive"}</span>
                        <button
                          type="button"
                          className="btn btn-ghost admin-inline-button"
                          onClick={() => setEditingCohortId(item.id)}
                          disabled={adminBusy}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost admin-inline-button admin-danger-button"
                          onClick={() => {
                            if (window.confirm(`Delete cohort "${item.title}"?`)) {
                              onDeleteCohort(item.id);
                            }
                          }}
                          disabled={adminBusy}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                        <p>{item.paymentOption === "deposit" ? "Deposit plan" : "Paid in full"}</p>
                        <span>
                          {item.paymentStatus}
                          {item.paymentOption === "deposit" && item.balanceDueLabel ? ` | ${item.balanceDueLabel} left` : ""}
                        </span>
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
                <h3>Cohort capacity snapshot</h3>
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

              <article className="info-card">
                <h3>Recent admin activity</h3>
                <div className="admin-list">
                  {(adminOverview.recentAdminActivity ?? []).slice(0, 6).map((item) => (
                    <div key={item.id} className="admin-row">
                      <div>
                        <strong>{item.actor}</strong>
                        <p>{item.action}</p>
                      </div>
                      <div>
                        <p>{item.detail || "No extra detail"}</p>
                        <span>{formatDateLabel(item.createdAt)}</span>
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
