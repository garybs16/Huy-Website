import express, { Router } from "express";
import { notifyAdmissions } from "../lib/notifications.js";

export function createStripePaymentsRouter({ stripeClient, webhookSecret, enrollmentDb, notifier }) {
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
      const enrollment = enrollmentDb.markPaidByCheckoutSession(event.data.object.id);
      notifyAdmissions(notifier, {
        type: "payment.completed",
        stripeSessionId: event.data.object.id,
        enrollment,
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
