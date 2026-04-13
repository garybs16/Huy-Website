import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import {
  createAdminCohort,
  createAdminProgram,
  createEnrollment,
  deleteAdminCohort,
  deleteAdminProgram,
  getAdminCohorts,
  getAdminEnrollments,
  getAdminInquiries,
  getAdminOverview,
  getAdminPrograms,
  getAdminSession,
  getAdminWaitlist,
  getCohorts,
  getEnrollmentStatus,
  getPrograms,
  joinWaitlist,
  loginAdmin,
  logoutAdmin,
  submitInquiry,
  updateAdminCohort,
  updateAdminProgram,
} from "./lib/api";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { defaultCohorts, defaultPrograms, navItems } from "./siteData";

const AdminPage = lazy(() => import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })));
const AdmissionsPage = lazy(() =>
  import("./pages/AdmissionsPage").then((module) => ({ default: module.AdmissionsPage }))
);
const ContactPage = lazy(() => import("./pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const ProgramsPage = lazy(() =>
  import("./pages/ProgramsPage").then((module) => ({ default: module.ProgramsPage }))
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((module) => ({ default: module.RegisterPage }))
);
const SchedulePage = lazy(() =>
  import("./pages/SchedulePage").then((module) => ({ default: module.SchedulePage }))
);

const initialInquiryState = {
  fullName: "",
  email: "",
  phone: "",
  program: "",
  message: "",
};

const initialWaitlistState = {
  fullName: "",
  email: "",
  phone: "",
  trackPreference: "",
  notes: "",
};

const initialAdminSessionState = {
  checked: false,
  authenticated: false,
  username: "",
  expiresAt: "",
  sessionAuthConfigured: false,
  apiKeySupported: false,
  adminAuthMode: "disabled",
  authMethod: "",
};

const initialEnrollmentState = {
  studentFullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  programId: "",
  cohortId: "",
  paymentOption: "full",
  notes: "",
};

const pageTitles = {
  "/": "First Step Healthcare Academy",
  "/programs": "Programs | First Step Healthcare Academy",
  "/schedule": "Schedule | First Step Healthcare Academy",
  "/register": "Register | First Step Healthcare Academy",
  "/admissions": "Admissions | First Step Healthcare Academy",
  "/contact": "Contact | First Step Healthcare Academy",
  "/admin": "Admin | First Step Healthcare Academy",
};

function AppEffects({ setEnrollmentStatus }) {
  const location = useLocation();

  useEffect(() => {
    document.title = pageTitles[location.pathname] ?? pageTitles["/"];
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const url = new URL(window.location.href);
    const checkoutStatus = url.searchParams.get("checkout");
    const enrollmentId = url.searchParams.get("enrollment");

    async function syncCheckoutStatus() {
      if (!checkoutStatus || !enrollmentId) {
        return;
      }

      try {
        const enrollment = await getEnrollmentStatus(enrollmentId);

        if (!active) {
          return;
        }

        if (enrollment.paymentStatus === "paid") {
          setEnrollmentStatus({
            type: "success",
            text: `Payment received. Enrollment ${enrollment.enrollmentId} is confirmed and admissions will follow up with next steps.`,
          });
        } else if (enrollment.paymentStatus === "deposit_paid") {
          setEnrollmentStatus({
            type: "success",
            text: `Deposit received. Enrollment ${enrollment.enrollmentId} now holds the seat, and the remaining balance will be coordinated by admissions before class start.`,
          });
        } else if (checkoutStatus === "cancelled" || enrollment.paymentStatus === "checkout_expired") {
          setEnrollmentStatus({
            type: "error",
            text: "Checkout was cancelled or expired before payment completed. The seat is not confirmed yet.",
          });
        } else {
          setEnrollmentStatus({
            type: "error",
            text: "Enrollment exists, but payment is not marked complete yet. Refresh shortly or contact admissions before assuming the seat is confirmed.",
          });
        }
      } catch (error) {
        if (active) {
          setEnrollmentStatus({
            type: "error",
            text: error.message || "Could not verify payment status after checkout.",
          });
        }
      }
    }

    syncCheckoutStatus();

    if (checkoutStatus) {
      url.searchParams.delete("checkout");
      url.searchParams.delete("enrollment");
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    }

    return () => {
      active = false;
    };
  }, [location.pathname, location.search, setEnrollmentStatus]);

  return null;
}

function AppShell({ children }) {
  return (
    <div className="site-shell">
      <SiteHeader navItems={navItems} />

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}

function App() {
  const [programs, setPrograms] = useState(defaultPrograms);
  const [cohorts, setCohorts] = useState(defaultCohorts);
  const [programLoadError, setProgramLoadError] = useState("");
  const [cohortLoadError, setCohortLoadError] = useState("");
  const [inquiryForm, setInquiryForm] = useState(initialInquiryState);
  const [waitlistForm, setWaitlistForm] = useState(initialWaitlistState);
  const [enrollmentForm, setEnrollmentForm] = useState(initialEnrollmentState);
  const [inquiryPending, setInquiryPending] = useState(false);
  const [waitlistPending, setWaitlistPending] = useState(false);
  const [enrollmentPending, setEnrollmentPending] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState({ type: "", text: "" });
  const [waitlistStatus, setWaitlistStatus] = useState({ type: "", text: "" });
  const [enrollmentStatus, setEnrollmentStatus] = useState({ type: "", text: "" });
  const [adminKey, setAdminKey] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminSession, setAdminSession] = useState(initialAdminSessionState);
  const [adminPending, setAdminPending] = useState(false);
  const [adminMutationPending, setAdminMutationPending] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminNotice, setAdminNotice] = useState("");
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminEnrollments, setAdminEnrollments] = useState([]);
  const [adminInquiries, setAdminInquiries] = useState([]);
  const [adminWaitlist, setAdminWaitlist] = useState([]);
  const [adminPrograms, setAdminPrograms] = useState([]);
  const [adminCohorts, setAdminCohorts] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      const [programResult, cohortResult] = await Promise.allSettled([getPrograms(), getCohorts()]);

      if (!active) {
        return;
      }

      if (programResult.status === "fulfilled" && programResult.value.length > 0) {
        setPrograms(programResult.value);
        setProgramLoadError("");
      } else if (programResult.status === "rejected") {
        setProgramLoadError("Program data could not be refreshed from the API. Showing fallback content.");
      }

      if (cohortResult.status === "fulfilled" && cohortResult.value.length > 0) {
        setCohorts(cohortResult.value);
        setCohortLoadError("");
      } else if (cohortResult.status === "rejected") {
        setCohortLoadError("Live cohort availability could not be refreshed. Showing fallback schedule data.");
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAdminSession() {
      try {
        const session = await getAdminSession();

        if (active) {
          setAdminSession({ ...initialAdminSessionState, ...session, checked: true });
        }
      } catch {
        if (active) {
          setAdminSession((current) => ({ ...current, checked: true }));
        }
      }
    }

    loadAdminSession();

    return () => {
      active = false;
    };
  }, []);

  const handleInquiryInput = (event) => {
    const { name, value } = event.target;
    setInquiryForm((current) => ({ ...current, [name]: value }));
  };

  const handleWaitlistInput = (event) => {
    const { name, value } = event.target;
    setWaitlistForm((current) => ({ ...current, [name]: value }));
  };

  const handleEnrollmentInput = (event) => {
    const { name, value } = event.target;

    setEnrollmentForm((current) => {
      if (name === "programId") {
        return { ...current, programId: value, cohortId: "", paymentOption: "full" };
      }

      if (name === "cohortId") {
        const cohort = cohorts.find((item) => item.id === value);
        const paymentOption = cohort?.allowPaymentPlan ? current.paymentOption : "full";
        return { ...current, cohortId: value, paymentOption };
      }

      return { ...current, [name]: value };
    });
  };

  const handleInquirySubmit = async (event) => {
    event.preventDefault();
    setInquiryPending(true);
    setInquiryStatus({ type: "", text: "" });

    try {
      await submitInquiry({
        ...inquiryForm,
        source: "contact-page-form",
      });
      setInquiryStatus({ type: "success", text: "Inquiry sent. Admissions will contact you shortly." });
      setInquiryForm(initialInquiryState);
    } catch (error) {
      setInquiryStatus({ type: "error", text: error.message || "Could not submit your inquiry right now." });
    } finally {
      setInquiryPending(false);
    }
  };

  const handleWaitlistSubmit = async (event) => {
    event.preventDefault();
    setWaitlistPending(true);
    setWaitlistStatus({ type: "", text: "" });

    const combinedNotes = [waitlistForm.trackPreference, waitlistForm.notes]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" | ");

    try {
      await joinWaitlist({
        fullName: waitlistForm.fullName,
        email: waitlistForm.email,
        phone: waitlistForm.phone,
        notes: combinedNotes || undefined,
        source: "waitlist-page-form",
      });
      setWaitlistStatus({
        type: "success",
        text: "You are on the interest list. We will share class dates and milestone updates.",
      });
      setWaitlistForm(initialWaitlistState);
    } catch (error) {
      setWaitlistStatus({ type: "error", text: error.message || "Could not join the interest list right now." });
    } finally {
      setWaitlistPending(false);
    }
  };

  const handleEnrollmentSubmit = async (event) => {
    event.preventDefault();
    setEnrollmentPending(true);
    setEnrollmentStatus({ type: "", text: "" });

    try {
      const response = await createEnrollment({
        studentFullName: enrollmentForm.studentFullName,
        email: enrollmentForm.email,
        phone: enrollmentForm.phone,
        dateOfBirth: enrollmentForm.dateOfBirth,
        addressLine1: enrollmentForm.addressLine1,
        city: enrollmentForm.city,
        state: enrollmentForm.state,
        postalCode: enrollmentForm.postalCode,
        emergencyContactName: enrollmentForm.emergencyContactName,
        emergencyContactPhone: enrollmentForm.emergencyContactPhone,
        cohortId: enrollmentForm.cohortId,
        paymentOption: enrollmentForm.paymentOption,
        notes: enrollmentForm.notes,
      });

      if (response.paymentRequired && response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }

      setEnrollmentStatus({
        type: "success",
        text: response.message || "Registration submitted. Admissions will contact you to complete payment.",
      });
      setEnrollmentForm(initialEnrollmentState);
    } catch (error) {
      setEnrollmentStatus({ type: "error", text: error.message || "Could not complete registration right now." });
    } finally {
      setEnrollmentPending(false);
    }
  };

  const handleAdminLoad = async (event) => {
    event.preventDefault();

    if (!adminSession.authenticated && !adminKey.trim()) {
      setAdminError(
        adminSession.sessionAuthConfigured
          ? "Sign in or provide the fallback admin API key before loading the dashboard."
          : "Enter the admin API key to load the operations dashboard."
      );
      return;
    }

    setAdminPending(true);
    setAdminError("");
    setAdminNotice("");

    try {
      const key = adminSession.authenticated ? undefined : adminKey.trim();
      const [overview, enrollmentsData, inquiriesData, waitlistData, programsData, cohortsData] = await Promise.all([
        getAdminOverview(key),
        getAdminEnrollments(key),
        getAdminInquiries(key),
        getAdminWaitlist(key),
        getAdminPrograms(key),
        getAdminCohorts(key),
      ]);

      setAdminOverview(overview);
      setAdminEnrollments(enrollmentsData.items ?? []);
      setAdminInquiries(inquiriesData.items ?? []);
      setAdminWaitlist(waitlistData.items ?? []);
      setAdminPrograms(programsData);
      setAdminCohorts(cohortsData);
    } catch (error) {
      setAdminError(error.message || "Could not load the admin dashboard.");
    } finally {
      setAdminPending(false);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();

    if (!adminUsername.trim() || !adminPassword) {
      setAdminError("Enter the admin username and password.");
      return;
    }

    setAdminPending(true);
    setAdminError("");
    setAdminNotice("");

    try {
      const session = await loginAdmin({
        username: adminUsername.trim(),
        password: adminPassword,
      });

      setAdminSession({ ...initialAdminSessionState, ...session, checked: true });
      setAdminPassword("");
      setAdminNotice(`Signed in as ${session.username}.`);

      const [overview, enrollmentsData, inquiriesData, waitlistData, programsData, cohortsData] = await Promise.all([
        getAdminOverview(),
        getAdminEnrollments(),
        getAdminInquiries(),
        getAdminWaitlist(),
        getAdminPrograms(),
        getAdminCohorts(),
      ]);

      setAdminOverview(overview);
      setAdminEnrollments(enrollmentsData.items ?? []);
      setAdminInquiries(inquiriesData.items ?? []);
      setAdminWaitlist(waitlistData.items ?? []);
      setAdminPrograms(programsData);
      setAdminCohorts(cohortsData);
    } catch (error) {
      setAdminError(error.message || "Could not sign in to the admin dashboard.");
    } finally {
      setAdminPending(false);
    }
  };

  const handleAdminLogout = async () => {
    setAdminPending(true);
    setAdminError("");
    setAdminNotice("");

    try {
      await logoutAdmin();
      const session = await getAdminSession();
      setAdminSession({ ...initialAdminSessionState, ...session, checked: true });
      setAdminOverview(null);
      setAdminEnrollments([]);
      setAdminInquiries([]);
      setAdminWaitlist([]);
      setAdminPrograms([]);
      setAdminCohorts([]);
      setAdminNotice("Signed out.");
    } catch (error) {
      setAdminError(error.message || "Could not sign out cleanly.");
    } finally {
      setAdminPending(false);
    }
  };

  const refreshCatalog = async (apiKey) => {
    const key = typeof apiKey === "string" ? apiKey.trim() : apiKey;
    const [programsData, cohortsData, overview] = await Promise.all([
      getAdminPrograms(key),
      getAdminCohorts(key),
      getAdminOverview(key),
    ]);
    const publicPrograms = await getPrograms();
    const publicCohorts = await getCohorts();

    setAdminPrograms(programsData);
    setAdminCohorts(cohortsData);
    setAdminOverview(overview);
    setPrograms(publicPrograms);
    setCohorts(publicCohorts);
  };

  const runAdminMutation = async (action, successMessage) => {
    const key = adminSession.authenticated ? undefined : adminKey.trim();

    if (!adminSession.authenticated && !key) {
      setAdminError(
        adminSession.sessionAuthConfigured
          ? "Sign in or provide the fallback admin API key before managing programs or cohorts."
          : "Enter the admin API key before managing programs or cohorts."
      );
      return;
    }

    setAdminMutationPending(true);
    setAdminError("");
    setAdminNotice("");

    try {
      await action(key);
      await refreshCatalog(key);
      setAdminNotice(successMessage);
      return true;
    } catch (error) {
      setAdminError(error.message || "Admin update failed.");
      return false;
    } finally {
      setAdminMutationPending(false);
    }
  };

  const handleCreateProgram = (payload) =>
    runAdminMutation((key) => createAdminProgram(key, payload), "Program created.");

  const handleUpdateProgram = (programId, payload) =>
    runAdminMutation((key) => updateAdminProgram(key, programId, payload), "Program updated.");

  const handleDeleteProgram = (programId) =>
    runAdminMutation((key) => deleteAdminProgram(key, programId), "Program deleted.");

  const handleCreateCohort = (payload) =>
    runAdminMutation((key) => createAdminCohort(key, payload), "Cohort created.");

  const handleUpdateCohort = (cohortId, payload) =>
    runAdminMutation((key) => updateAdminCohort(key, cohortId, payload), "Cohort updated.");

  const handleDeleteCohort = (cohortId) =>
    runAdminMutation((key) => deleteAdminCohort(key, cohortId), "Cohort deleted.");

  const filteredCohorts = cohorts.filter(
    (cohort) => !enrollmentForm.programId || cohort.programId === enrollmentForm.programId
  );
  const selectedCohort = cohorts.find((cohort) => cohort.id === enrollmentForm.cohortId) ?? null;

  useEffect(() => {
    if (selectedCohort?.allowPaymentPlan || enrollmentForm.paymentOption === "full") {
      return;
    }

    setEnrollmentForm((current) => ({ ...current, paymentOption: "full" }));
  }, [selectedCohort, enrollmentForm.paymentOption]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppEffects setEnrollmentStatus={setEnrollmentStatus} />
      <AppShell>
        <Suspense fallback={<section className="section"><div className="container"><p className="section-note">Loading page content...</p></div></section>}>
          <Routes>
            <Route path="/" element={<HomePage cohorts={cohorts} programs={programs} />} />
            <Route
              path="/programs"
              element={<ProgramsPage programs={programs} programLoadError={programLoadError} />}
            />
            <Route
              path="/schedule"
              element={<SchedulePage cohorts={cohorts} cohortLoadError={cohortLoadError} />}
            />
            <Route
              path="/register"
              element={
                <RegisterPage
                  programs={programs}
                  cohorts={cohorts}
                  filteredCohorts={filteredCohorts}
                  selectedCohort={selectedCohort}
                  enrollmentForm={enrollmentForm}
                  enrollmentPending={enrollmentPending}
                  enrollmentStatus={enrollmentStatus}
                  cohortLoadError={cohortLoadError}
                  onInput={handleEnrollmentInput}
                  onSubmit={handleEnrollmentSubmit}
                />
              }
            />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route
              path="/contact"
              element={
                <ContactPage
                  programs={programs}
                  inquiryForm={inquiryForm}
                  waitlistForm={waitlistForm}
                  inquiryPending={inquiryPending}
                  waitlistPending={waitlistPending}
                  inquiryStatus={inquiryStatus}
                  waitlistStatus={waitlistStatus}
                  onInquiryInput={handleInquiryInput}
                  onWaitlistInput={handleWaitlistInput}
                  onInquirySubmit={handleInquirySubmit}
                  onWaitlistSubmit={handleWaitlistSubmit}
                />
              }
            />
            <Route
              path="/admin"
              element={
                <AdminPage
                  adminKey={adminKey}
                  adminUsername={adminUsername}
                  adminPassword={adminPassword}
                  adminSession={adminSession}
                  adminPending={adminPending}
                  adminMutationPending={adminMutationPending}
                  adminError={adminError}
                  adminNotice={adminNotice}
                  adminOverview={adminOverview}
                  adminEnrollments={adminEnrollments}
                  adminInquiries={adminInquiries}
                  adminWaitlist={adminWaitlist}
                  adminPrograms={adminPrograms}
                  adminCohorts={adminCohorts}
                  onAdminKeyChange={setAdminKey}
                  onAdminUsernameChange={setAdminUsername}
                  onAdminPasswordChange={setAdminPassword}
                  onAdminLoad={handleAdminLoad}
                  onAdminLogin={handleAdminLogin}
                  onAdminLogout={handleAdminLogout}
                  onCreateProgram={handleCreateProgram}
                  onUpdateProgram={handleUpdateProgram}
                  onDeleteProgram={handleDeleteProgram}
                  onCreateCohort={handleCreateCohort}
                  onUpdateCohort={handleUpdateCohort}
                  onDeleteCohort={handleDeleteCohort}
                />
              }
            />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
