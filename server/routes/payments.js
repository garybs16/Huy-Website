import express, { Router } from "express";
import { sendPaymentCompletedEmails, sendPaymentFailedEmails } from "../lib/email.js";
import { notifyAdmissions } from "../lib/notifications.js";
import {
  WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
  ensureFiniteWeeklySchedule,
  getStripeResourceId,
} from "../lib/stripe.js";

function eventTimestamp(value) {
  return value ? new Date(Number(value) * 1000).toISOString() : new Date().toISOString();
}

function invoiceSubscriptionDetails(invoice) {
  return invoice?.parent?.subscription_details ?? null;
}

function invoiceMetadata(invoice) {
  return invoiceSubscriptionDetails(invoice)?.metadata ?? invoice?.metadata ?? {};
}

function invoiceSubscriptionId(invoice) {
  return getStripeResourceId(invoiceSubscriptionDetails(invoice)?.subscription);
}

function invoiceNextPaymentAt(invoice) {
  const periodEnds = (invoice?.lines?.data ?? [])
    .map((line) => Number(line?.period?.end ?? 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  return periodEnds.length > 0 ? new Date(Math.min(...periodEnds) * 1000).toISOString() : null;
}

function enrollmentProgramDetails(enrollmentDb, enrollment) {
  const cohort = enrollmentDb.getCohortById(enrollment.cohortId);
  const program = cohort ? enrollmentDb.getProgramById(cohort.programId, { includeInactive: true }) : null;

  return { cohort, program };
}

function validateEnrollmentMetadata(enrollment, metadata) {
  if (!enrollment || metadata?.cohortId !== enrollment.cohortId) {
    throw new Error("Stripe payment metadata did not match an active enrollment.");
  }
}

async function attachWeeklySchedule({ stripeClient, enrollmentDb, enrollment, subscriptionId }) {
  const scheduleDetails = await ensureFiniteWeeklySchedule(stripeClient, {
    subscriptionId,
    enrollmentId: enrollment.id,
    cohortId: enrollment.cohortId,
    programId: enrollment.programId,
    installmentsTotal: enrollment.paymentInstallmentsTotal || WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
  });

  const attachedEnrollment = enrollmentDb.attachStripeSubscription({
    enrollmentId: enrollment.id,
    customerId: scheduleDetails.customerId,
    subscriptionId,
    scheduleId: scheduleDetails.scheduleId,
    nextPaymentDueAt: scheduleDetails.nextPaymentDueAt,
    installmentsTotal: enrollment.paymentInstallmentsTotal || WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
    interval: "week",
  });

  return { enrollment: attachedEnrollment, scheduleDetails };
}

function announceCompletedPayment({ enrollmentDb, notifier, emailer, paymentResult, amountPaidCents, invoice }) {
  if (!paymentResult.applied) {
    return;
  }

  const { cohort, program } = enrollmentProgramDetails(enrollmentDb, paymentResult.enrollment);
  notifyAdmissions(notifier, {
    type: "payment.completed",
    stripeInvoiceId: invoice?.id ?? null,
    enrollment: paymentResult.enrollment,
  });
  sendPaymentCompletedEmails(emailer, {
    enrollment: paymentResult.enrollment,
    program,
    cohort,
    amountPaidCents,
    invoiceUrl: invoice?.hosted_invoice_url ?? null,
  });
}

async function handleWeeklyCheckoutCompleted({
  event,
  session,
  stripeClient,
  enrollmentDb,
  notifier,
  emailer,
  enrollment,
}) {
  const subscriptionId = getStripeResourceId(session.subscription);

  if (session.mode !== "subscription" || !subscriptionId) {
    throw new Error("Weekly payment checkout did not create a Stripe subscription.");
  }

  const expectedAmount = Number(enrollment.paymentAmountCents ?? 0);

  if (Number(session.amount_total ?? 0) !== expectedAmount) {
    throw new Error("Stripe weekly payment amount did not match the enrollment installment.");
  }

  const { enrollment: attachedEnrollment, scheduleDetails } = await attachWeeklySchedule({
    stripeClient,
    enrollmentDb,
    enrollment,
    subscriptionId,
  });
  const invoiceId = getStripeResourceId(session.invoice) ?? scheduleDetails.latestInvoiceId;

  if (!invoiceId) {
    throw new Error("Stripe weekly checkout did not identify its first invoice.");
  }

  const paymentResult = enrollmentDb.recordSubscriptionPayment({
    enrollmentId: attachedEnrollment.id,
    invoiceId,
    subscriptionId,
    amountCents: expectedAmount,
    currency: session.currency,
    paidAt: eventTimestamp(event.created),
    nextPaymentDueAt: scheduleDetails.nextPaymentDueAt,
  });

  announceCompletedPayment({
    enrollmentDb,
    notifier,
    emailer,
    paymentResult,
    amountPaidCents: expectedAmount,
  });
}

async function handleInvoicePaid({ event, invoice, stripeClient, enrollmentDb, notifier, emailer }) {
  const metadata = invoiceMetadata(invoice);
  const subscriptionId = invoiceSubscriptionId(invoice);
  const enrollment = metadata?.enrollmentId
    ? enrollmentDb.getEnrollmentById(metadata.enrollmentId)
    : subscriptionId
      ? enrollmentDb.getEnrollmentByStripeSubscriptionId(subscriptionId)
      : null;

  if (!enrollment || enrollment.paymentOption !== "deposit" || !subscriptionId) {
    return;
  }

  validateEnrollmentMetadata(enrollment, metadata);
  const { enrollment: attachedEnrollment } = await attachWeeklySchedule({
    stripeClient,
    enrollmentDb,
    enrollment,
    subscriptionId,
  });
  const amountPaidCents = Number(invoice.amount_paid ?? 0);

  if (invoice.currency !== "usd" || amountPaidCents !== Number(attachedEnrollment.paymentAmountCents ?? 0)) {
    throw new Error("Stripe invoice amount did not match the weekly enrollment installment.");
  }

  const paymentResult = enrollmentDb.recordSubscriptionPayment({
    enrollmentId: attachedEnrollment.id,
    invoiceId: invoice.id,
    subscriptionId,
    amountCents: amountPaidCents,
    currency: invoice.currency,
    paidAt: eventTimestamp(invoice.status_transitions?.paid_at ?? event.created),
    nextPaymentDueAt: invoiceNextPaymentAt(invoice),
  });

  announceCompletedPayment({
    enrollmentDb,
    notifier,
    emailer,
    paymentResult,
    amountPaidCents,
    invoice,
  });
}

function handleInvoicePaymentFailed({ event, invoice, enrollmentDb, notifier, emailer }) {
  const metadata = invoiceMetadata(invoice);
  const subscriptionId = invoiceSubscriptionId(invoice);
  const enrollment = metadata?.enrollmentId
    ? enrollmentDb.getEnrollmentById(metadata.enrollmentId)
    : subscriptionId
      ? enrollmentDb.getEnrollmentByStripeSubscriptionId(subscriptionId)
      : null;

  if (!enrollment || enrollment.paymentOption !== "deposit" || !subscriptionId) {
    return;
  }

  validateEnrollmentMetadata(enrollment, metadata);
  const failureResult = enrollmentDb.recordSubscriptionPaymentFailed({
    enrollmentId: enrollment.id,
    invoiceId: invoice.id,
    subscriptionId,
    amountCents: invoice.amount_due,
    currency: invoice.currency,
    attemptCount: invoice.attempt_count,
    failedAt: eventTimestamp(event.created),
  });

  if (!failureResult.applied) {
    return;
  }

  const { cohort, program } = enrollmentProgramDetails(enrollmentDb, failureResult.enrollment);
  notifyAdmissions(notifier, {
    type: "payment.failed",
    stripeInvoiceId: invoice.id,
    enrollment: failureResult.enrollment,
  });
  sendPaymentFailedEmails(emailer, {
    enrollment: failureResult.enrollment,
    program,
    cohort,
    amountDueCents: invoice.amount_due,
    invoiceUrl: invoice.hosted_invoice_url ?? null,
  });
}

export function createStripePaymentsRouter({ stripeClient, webhookSecret, enrollmentDb, notifier, emailer }) {
  const router = Router();

  router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
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

    try {
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

        if (session.metadata?.checkoutPurpose === "payment_plan") {
          await handleWeeklyCheckoutCompleted({
            event,
            session,
            stripeClient,
            enrollmentDb,
            notifier,
            emailer,
            enrollment,
          });
        } else {
          const expectedAmount =
            enrollment.stripeCheckoutPurpose === "balance" ? enrollment.balanceDueCents : enrollment.paymentAmountCents;

          if (Number(session.amount_total ?? 0) !== Number(expectedAmount ?? 0)) {
            return res.status(400).json({ error: "Stripe checkout amount did not match enrollment balance." });
          }

          const paidEnrollment = enrollmentDb.markPaidByCheckoutSession(session.id);
          const { cohort, program } = enrollmentProgramDetails(enrollmentDb, paidEnrollment);
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
      }

      if (event.type === "invoice.paid") {
        await handleInvoicePaid({
          event,
          invoice: event.data.object,
          stripeClient,
          enrollmentDb,
          notifier,
          emailer,
        });
      }

      if (event.type === "invoice.payment_failed") {
        handleInvoicePaymentFailed({
          event,
          invoice: event.data.object,
          enrollmentDb,
          notifier,
          emailer,
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
    } catch (error) {
      console.error("Stripe webhook processing failed", {
        eventId: event.id,
        eventType: event.type,
        message: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: "Stripe webhook processing failed and will be retried." });
    }
  });

  return router;
}
