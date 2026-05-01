import { useEffect, useMemo, useState } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PageIntro } from "../components/PageIntro";
import { createEnrollmentPaymentSession, getEnrollmentStatus } from "../lib/api";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";

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
  const [checkoutClientSecret, setCheckoutClientSecret] = useState("");
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    []
  );

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
    setCheckoutClientSecret("");

    try {
      const response = await createEnrollmentPaymentSession(paymentForm.enrollmentId.trim(), {
        email: paymentForm.email,
        checkoutMode: stripePromise ? "embedded" : "redirect",
      });

      if (response.paymentRequired && response.checkoutClientSecret && stripePromise) {
        setCheckoutClientSecret(response.checkoutClientSecret);
        setPaymentStatus({
          type: "success",
          text: "Secure card checkout is ready below.",
        });
        return;
      }

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
          <h2>Enter your card number in the secure Stripe checkout panel.</h2>
          <p>
            The portal checks the enrollment record before creating checkout, then loads the
            correct card payment amount for the deposit, tuition, or remaining balance.
          </p>
          <ul className="detail-list">
            <li>Enrollment ID from your registration confirmation</li>
            <li>Email address used during registration</li>
            <li>Card number, expiration, and CVC are entered directly into Stripe</li>
          </ul>
        </article>

        <article className="form-card">
          <h2>Pay by Card</h2>
          <p className="form-helper">
            Verify the enrollment first. The card fields appear after the payment amount is loaded.
          </p>
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
              {paymentPending ? "Preparing card checkout..." : "Load Secure Card Form"}
            </button>
          </form>
          {paymentStatus.text ? (
            <p className={`form-status ${paymentStatus.type === "success" ? "is-success" : "is-error"}`}>
              {paymentStatus.text}
            </p>
          ) : null}
          {checkoutClientSecret && stripePromise ? (
            <div className="embedded-checkout-panel">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: checkoutClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
