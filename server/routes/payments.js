import express, { Router } from "express";
import { sendPaymentCompletedEmails } from "../lib/email.js";
import { notifyAdmissions } from "../lib/notifications.js";

export function createStripePaymentsRouter({ stripeClient, webhookSecret, enrollmentDb, notifier, emailer }) {
  const router = Router();

  router.post("/", express.raw({ type: "application/json" }), (req, res) => {
    if (!stripeClient || !webhookSecret) {
      return res.status(503).json({ error: "Stripe webhook is not configured." });
    }

    const signature = req.get("stripe-signature");

    if (!signature) {
      return res.status(400).json({ error: "Missing Stripe signature header." });
    }

    let event;

    try {
      event = stripeClient.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
      return res.status(400).json({ error: `Webhook signature verification failed: ${error.message}` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const enrollment = enrollmentDb.getEnrollmentById(session.metadata?.enrollmentId);

      if (
        !enrollment ||
        enrollment.stripeCheckoutSessionId !== session.id ||
        session.payment_status !== "paid" ||
        session.currency !== "usd" ||
        session.metadata?.cohortId !== enrollment.cohortId
      ) {
        return res.status(400).json({ error: "Stripe checkout session did not match an active enrollment." });
      }

      const expectedAmount =
        enrollment.stripeCheckoutPurpose === "balance" ? enrollment.balanceDueCents : enrollment.paymentAmountCents;

      if (Number(session.amount_total ?? 0) !== Number(expectedAmount ?? 0)) {
        return res.status(400).json({ error: "Stripe checkout amount did not match enrollment balance." });
      }

      const paidEnrollment = enrollmentDb.markPaidByCheckoutSession(session.id);
      const cohort = enrollmentDb.getCohortById(paidEnrollment.cohortId);
      const program = cohort ? enrollmentDb.getProgramById(cohort.programId, { includeInactive: true }) : null;
      notifyAdmissions(notifier, {
        type: "payment.completed",
        stripeSessionId: session.id,
        enrollment: paidEnrollment,
      });
      sendPaymentCompletedEmails(emailer, {
        enrollment: paidEnrollment,
        program,
        cohort,
        amountPaidCents: expectedAmount,
      });
    }

    if (event.type === "checkout.session.expired") {
      enrollmentDb.markCheckoutExpired(event.data.object.id);
      notifyAdmissions(notifier, {
        type: "payment.expired",
        stripeSessionId: event.data.object.id,
      });
    }

    return res.json({ received: true });
  });

  return router;
}
