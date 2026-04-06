import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import {
  createEnrollment,
  getAdminEnrollments,
  getAdminInquiries,
  getAdminOverview,
  getAdminWaitlist,
  getCohorts,
  getEnrollmentStatus,
  getPrograms,
  joinWaitlist,
  submitInquiry,
} from "./lib/api";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { AdminPage } from "./pages/AdminPage";
import { AdmissionsPage } from "./pages/AdmissionsPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SchedulePage } from "./pages/SchedulePage";
import { defaultCohorts, defaultPrograms, navItems } from "./siteData";

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

      <SiteFooter navItems={navItems} />
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
  const [adminPending, setAdminPending] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminEnrollments, setAdminEnrollments] = useState([]);
  const [adminInquiries, setAdminInquiries] = useState([]);
  const [adminWaitlist, setAdminWaitlist] = useState([]);

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
        return { ...current, programId: value, cohortId: "" };
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

    if (!adminKey.trim()) {
      setAdminError("Enter the admin API key to load the operations dashboard.");
      return;
    }

    setAdminPending(true);
    setAdminError("");

    try {
      const key = adminKey.trim();
      const [overview, enrollmentsData, inquiriesData, waitlistData] = await Promise.all([
        getAdminOverview(key),
        getAdminEnrollments(key),
        getAdminInquiries(key),
        getAdminWaitlist(key),
      ]);

      setAdminOverview(overview);
      setAdminEnrollments(enrollmentsData.items ?? []);
      setAdminInquiries(inquiriesData.items ?? []);
      setAdminWaitlist(waitlistData.items ?? []);
    } catch (error) {
      setAdminError(error.message || "Could not load the admin dashboard.");
    } finally {
      setAdminPending(false);
    }
  };

  const filteredCohorts = cohorts.filter(
    (cohort) => !enrollmentForm.programId || cohort.programId === enrollmentForm.programId
  );
  const selectedCohort = cohorts.find((cohort) => cohort.id === enrollmentForm.cohortId) ?? null;

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppEffects setEnrollmentStatus={setEnrollmentStatus} />
      <AppShell>
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
                adminPending={adminPending}
                adminError={adminError}
                adminOverview={adminOverview}
                adminEnrollments={adminEnrollments}
                adminInquiries={adminInquiries}
                adminWaitlist={adminWaitlist}
                onAdminKeyChange={setAdminKey}
                onAdminLoad={handleAdminLoad}
              />
            }
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
