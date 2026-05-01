import { useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { createEnrollmentPaymentSession, getEnrollmentStatus } from "../lib/api";

const initialPaymentForm = {
  enrollmentId: "",
  email: "",
};

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);
}

function buildCheckoutMessage(enrollment) {
  if (enrollment.paymentStatus === "paid") {
    return `Payment received. Enrollment ${enrollment.enrollmentId} is paid in full.`;
  }

  if (enrollment.paymentStatus === "deposit_paid") {
    return `Deposit received. Remaining balance: ${formatMoney(enrollment.balanceDueCents)}.`;
  }

  if (enrollment.paymentStatus === "checkout_expired") {
    return "The previous checkout session expired. You can request a new payment link below.";
  }

  return "Payment is still pending. Refresh shortly or contact admissions if this does not update.";
}

export function PaymentPage() {
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    const url = new URL(window.location.href);
    const checkoutStatus = url.searchParams.get("checkout");
    const enrollmentId = url.searchParams.get("enrollment");

    if (!checkoutStatus || !enrollmentId) {
      return;
    }

    let active = true;

    async function syncCheckoutStatus() {
      try {
        const enrollment = await getEnrollmentStatus(enrollmentId);

        if (!active) {
          return;
        }

        setPaymentStatus({
          type: enrollment.paymentStatus === "paid" || enrollment.paymentStatus === "deposit_paid" ? "success" : "error",
          text: checkoutStatus === "cancelled" ? "Checkout was cancelled before payment completed." : buildCheckoutMessage(enrollment),
        });
        setPaymentForm((current) => ({ ...current, enrollmentId }));
      } catch (error) {
        if (active) {
          setPaymentStatus({ type: "error", text: error.message || "Could not verify payment status." });
        }
      }
    }

    syncCheckoutStatus();
    url.searchParams.delete("checkout");
    url.searchParams.delete("enrollment");
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

    return () => {
      active = false;
    };
  }, []);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setPaymentForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPaymentPending(true);
    setPaymentStatus({ type: "", text: "" });

    try {
      const response = await createEnrollmentPaymentSession(paymentForm.enrollmentId.trim(), {
        email: paymentForm.email,
      });

      if (response.paymentRequired && response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }

      setPaymentStatus({
        type: response.paymentStatus === "paid" ? "success" : "error",
        text: response.message || "Admissions will contact you about payment.",
      });
    } catch (error) {
      setPaymentStatus({ type: "error", text: error.message || "Could not create a payment link right now." });
    } finally {
      setPaymentPending(false);
    }
  };

  return (
    <section className="section section-soft">
      <PageIntro
        kicker="Payment Portal"
        title="Pay tuition, deposits, or remaining balances from one secure portal."
        description="Enter the enrollment ID and email used during registration to open the correct payment checkout."
        accent="Secure enrollment payment"
        note="Payment links are verified against the student email before checkout starts."
      />

      <div className="container split-panel">
        <article className="info-card dark-card">
          <p className="section-kicker">Before you pay</p>
          <h2>Use the same email address from your enrollment form.</h2>
          <p>
            The portal checks the enrollment record before creating a checkout session, then sends
            you to the correct payment amount for the deposit, tuition, or remaining balance.
          </p>
          <ul className="detail-list">
            <li>Enrollment ID from your registration confirmation</li>
            <li>Email address used during registration</li>
            <li>Secure Stripe checkout when online payments are configured</li>
          </ul>
        </article>

        <article className="form-card">
          <h2>Open Payment Checkout</h2>
          <p className="form-helper">Your enrollment ID is included in the registration or checkout status message.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              <span>Enrollment ID</span>
              <input
                name="enrollmentId"
                value={paymentForm.enrollmentId}
                onChange={handleInput}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
            </label>
            <label>
              <span>Email address</span>
              <input name="email" type="email" value={paymentForm.email} onChange={handleInput} required />
            </label>
            <button type="submit" className="btn btn-primary" disabled={paymentPending}>
              {paymentPending ? "Preparing checkout..." : "Continue to Payment"}
            </button>
          </form>
          {paymentStatus.text ? (
            <p className={`form-status ${paymentStatus.type === "success" ? "is-success" : "is-error"}`}>
              {paymentStatus.text}
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
