import express, { Router } from "express";
import { sendPaymentCompletedEmails, sendPaymentFailedEmails } from "../lib/email.js";
import { notifyAdmissions } from "../lib/notifications.js";
import {
  PaymentPlanValidationError,
  ensureFinitePaymentSchedule,
  getPaymentPlanTerms,
  getStripeResourceId,
  isPaymentPlanOption,
} from "../lib/stripe.js";

function eventTimestamp(value) {
  return value ? new Date(Number(value) * 1000).toISOString() : new Date().toISOString();
}

function invoiceSubscriptionDetails(invoice) {
  return invoice?.parent?.subscription_details ?? invoice?.subscription_details ?? null;
}

function invoiceMetadata(invoice) {
  return invoiceSubscriptionDetails(invoice)?.metadata ?? invoice?.metadata ?? {};
}

function invoiceSubscriptionId(invoice) {
  return getStripeResourceId(invoiceSubscriptionDetails(invoice)?.subscription ?? invoice?.subscription);
}

function invoiceNextPaymentAt(invoice) {
  const periodEnds = (invoice?.lines?.data ?? [])
    .map((line) => Number(line?.period?.end ?? 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  return periodEnds.length > 0 ? new Date(Math.min(...periodEnds) * 1000).toISOString() : null;
}

function isRegistrationInvoice(invoice, enrollment, latestInvoiceId) {
  const amountPaidCents = Number(invoice?.amount_paid ?? 0);

  if (amountPaidCents !== Number(enrollment?.paymentAmountCents ?? 0)) {
    return false;
  }

  if (["subscription_create", "subscription_update"].includes(invoice?.billing_reason)) {
    return true;
  }

  return (
    !invoice?.billing_reason &&
    (
      invoice?.id === latestInvoiceId ||
      (
        Number(enrollment?.paymentInstallmentsPaid ?? 0) === 0 &&
        Number(enrollment?.amountPaidCents ?? 0) <= Number(enrollment?.paymentAmountCents ?? 0)
      )
    )
  );
}

function enrollmentProgramDetails(enrollmentDb, enrollment) {
  const cohort = enrollmentDb.getCohortById(enrollment.cohortId);
  const program = cohort ? enrollmentDb.getProgramById(cohort.programId, { includeInactive: true }) : null;

  return { cohort, program };
}

function validateEnrollmentMetadata(enrollment, metadata) {
  if (
    !enrollment ||
    metadata?.enrollmentId !== enrollment.id ||
    metadata?.cohortId !== enrollment.cohortId ||
    metadata?.programId !== enrollment.programId ||
    metadata?.paymentOption !== enrollment.paymentOption
  ) {
    throw new PaymentPlanValidationError(
      "Stripe payment metadata did not match an active enrollment.",
      { enrollmentId: enrollment?.id ?? null }
    );
  }

  if (
    metadata?.checkoutPurpose === "payment_plan" &&
    (
      !isPaymentPlanOption(enrollment.paymentOption) ||
      Number(metadata?.installmentsTotal ?? 0) !== Number(enrollment.paymentInstallmentsTotal ?? 0) ||
      metadata?.paymentInterval !== enrollment.paymentInterval
    )
  ) {
    throw new PaymentPlanValidationError(
      "Stripe payment-plan metadata did not match the enrollment schedule.",
      { enrollmentId: enrollment.id }
    );
  }

  if (metadata?.checkoutPurpose === "payment_plan") {
    const terms = getPaymentPlanTerms(
      enrollment.paymentOption,
      enrollment.tuitionTotalCents,
      enrollment.paymentAmountCents
    );

    if (
      Number(metadata?.installmentAmountCents ?? 0) !== terms.installmentAmountCents ||
      Number(metadata?.finalInstallmentAmountCents ?? metadata?.installmentAmountCents ?? 0) !==
        terms.finalInstallmentAmountCents
    ) {
      throw new PaymentPlanValidationError(
        "Stripe installment amounts did not match the enrollment schedule.",
        { enrollmentId: enrollment.id }
      );
    }
  }
}

async function attachPaymentPlanSchedule({ stripeClient, enrollmentDb, enrollment, subscriptionId }) {
  const terms = getPaymentPlanTerms(
    enrollment.paymentOption,
    enrollment.tuitionTotalCents,
    enrollment.paymentAmountCents
  );
  const scheduleDetails = await ensureFinitePaymentSchedule(stripeClient, {
    subscriptionId,
    enrollmentId: enrollment.id,
    cohortId: enrollment.cohortId,
    programId: enrollment.programId,
    paymentOption: enrollment.paymentOption,
    tuitionTotalCents: enrollment.tuitionTotalCents,
    registrationFeeCents: enrollment.paymentAmountCents,
  });

  const attachedEnrollment = enrollmentDb.attachStripeSubscription({
    enrollmentId: enrollment.id,
    customerId: scheduleDetails.customerId,
    subscriptionId,
    scheduleId: scheduleDetails.scheduleId,
    nextPaymentDueAt: scheduleDetails.nextPaymentDueAt,
    installmentsTotal: enrollment.paymentInstallmentsTotal || terms.installmentsTotal,
    interval: enrollment.paymentInterval || terms.paymentInterval,
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

async function handlePaymentPlanCheckoutCompleted({
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
    throw new PaymentPlanValidationError(
      "Payment-plan checkout did not create a Stripe subscription.",
      { enrollmentId: enrollment.id, sessionId: session.id }
    );
  }

  const expectedAmount = Number(enrollment.paymentAmountCents ?? 0);

  if (Number(session.amount_total ?? 0) !== expectedAmount) {
    throw new PaymentPlanValidationError(
      "Stripe checkout amount did not match the registration fee.",
      { enrollmentId: enrollment.id, sessionId: session.id }
    );
  }

  const { enrollment: attachedEnrollment, scheduleDetails } = await attachPaymentPlanSchedule({
    stripeClient,
    enrollmentDb,
    enrollment,
    subscriptionId,
  });
  const registrationResult = enrollmentDb.markPaymentPlanRegistrationPaid({
    enrollmentId: attachedEnrollment.id,
    subscriptionId,
    paidAt: eventTimestamp(event.created),
    nextPaymentDueAt: scheduleDetails.nextPaymentDueAt,
  });

  announceCompletedPayment({
    enrollmentDb,
    notifier,
    emailer,
    paymentResult: registrationResult,
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

  if (!enrollment || !isPaymentPlanOption(enrollment.paymentOption) || !subscriptionId) {
    return;
  }

  validateEnrollmentMetadata(enrollment, metadata);
  const { enrollment: attachedEnrollment, scheduleDetails } = await attachPaymentPlanSchedule({
    stripeClient,
    enrollmentDb,
    enrollment,
    subscriptionId,
  });
  const amountPaidCents = Number(invoice.amount_paid ?? 0);
  const terms = getPaymentPlanTerms(
    attachedEnrollment.paymentOption,
    attachedEnrollment.tuitionTotalCents,
    attachedEnrollment.paymentAmountCents
  );

  if (isRegistrationInvoice(invoice, attachedEnrollment, scheduleDetails.latestInvoiceId)) {
    const registrationResult = enrollmentDb.markPaymentPlanRegistrationPaid({
      enrollmentId: attachedEnrollment.id,
      subscriptionId,
      paidAt: eventTimestamp(invoice.status_transitions?.paid_at ?? event.created),
      nextPaymentDueAt: scheduleDetails.nextPaymentDueAt,
    });
    announceCompletedPayment({
      enrollmentDb,
      notifier,
      emailer,
      paymentResult: registrationResult,
      amountPaidCents,
      invoice,
    });
    return;
  }

  const isFinalInstallment =
    terms.hasFinalInstallmentAdjustment &&
    amountPaidCents === terms.finalInstallmentAmountCents;
  const isRegularInstallment = amountPaidCents === terms.installmentAmountCents;

  if (
    invoice.currency !== "usd" ||
    (!isRegularInstallment && !isFinalInstallment) ||
    (isFinalInstallment && attachedEnrollment.paymentInstallmentsPaid !== terms.installmentsTotal - 1) ||
    (
      terms.hasFinalInstallmentAdjustment &&
      isRegularInstallment &&
      attachedEnrollment.paymentInstallmentsPaid >= terms.regularInstallmentsTotal
    )
  ) {
    throw new PaymentPlanValidationError(
      "Stripe invoice amount did not match the selected tuition installment.",
      { enrollmentId: attachedEnrollment.id, invoiceId: invoice.id, amountPaidCents }
    );
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

  if (!enrollment || !isPaymentPlanOption(enrollment.paymentOption) || !subscriptionId) {
    return;
  }

  validateEnrollmentMetadata(enrollment, metadata);
  const terms = getPaymentPlanTerms(
    enrollment.paymentOption,
    enrollment.tuitionTotalCents,
    enrollment.paymentAmountCents
  );
  const amountDueCents = Number(invoice.amount_due ?? 0);
  const isRegistrationFailure =
    ["subscription_create", "subscription_update"].includes(invoice.billing_reason) &&
    amountDueCents === Number(enrollment.paymentAmountCents ?? 0);

  // Checkout presents registration-fee card errors to the customer immediately.
  // Only recurring tuition failures belong in the installment ledger.
  if (isRegistrationFailure) {
    return;
  }

  const isFinalInstallment =
    terms.hasFinalInstallmentAdjustment &&
    amountDueCents === terms.finalInstallmentAmountCents;
  const isRegularInstallment = amountDueCents === terms.installmentAmountCents;

  if (
    String(invoice.currency ?? "").toLowerCase() !== "usd" ||
    (!isRegularInstallment && !isFinalInstallment) ||
    (isFinalInstallment && enrollment.paymentInstallmentsPaid !== terms.installmentsTotal - 1) ||
    (
      terms.hasFinalInstallmentAdjustment &&
      isRegularInstallment &&
      enrollment.paymentInstallmentsPaid >= terms.regularInstallmentsTotal
    )
  ) {
    throw new PaymentPlanValidationError(
      "Failed Stripe invoice amount did not match the selected payment plan.",
      { enrollmentId: enrollment.id, invoiceId: invoice.id, amountDueCents }
    );
  }

  const failureResult = enrollmentDb.recordSubscriptionPaymentFailed({
    enrollmentId: enrollment.id,
    invoiceId: invoice.id,
    subscriptionId,
    amountCents: amountDueCents,
    currency: String(invoice.currency).toLowerCase(),
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
    amountDueCents,
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
    } catch {
      return res.status(400).json({ error: "Webhook signature verification failed." });
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const enrollment = enrollmentDb.getEnrollmentById(session.metadata?.enrollmentId);

        // Stripe can deliver before the enrollment row records the session id. That gap is
        // transient, so fail loudly and let the redelivery find the committed row.
        if (!enrollment || enrollment.stripeCheckoutSessionId !== session.id) {
          throw new Error("Stripe checkout session is not yet bound to an enrollment.");
        }

        if (
          session.payment_status !== "paid" ||
          session.currency !== "usd" ||
          session.metadata?.cohortId !== enrollment.cohortId ||
          session.metadata?.checkoutPurpose !== enrollment.stripeCheckoutPurpose
        ) {
          throw new PaymentPlanValidationError(
            "Stripe checkout session did not match an active enrollment.",
            { enrollmentId: enrollment.id, sessionId: session.id }
          );
        }

        validateEnrollmentMetadata(enrollment, session.metadata);

        if (session.metadata?.checkoutPurpose === "payment_plan") {
          await handlePaymentPlanCheckoutCompleted({
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
            throw new PaymentPlanValidationError(
              "Stripe checkout amount did not match enrollment balance.",
              { enrollmentId: enrollment.id, sessionId: session.id }
            );
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
      // A validation failure is deterministic: every redelivery of this event fails the same
      // way. Acknowledge it so Stripe stops retrying for three days and stops accumulating the
      // failures that eventually disable the endpoint, and page admissions instead.
      if (error instanceof PaymentPlanValidationError) {
        console.error("Stripe webhook rejected an event that cannot succeed on retry", {
          eventId: event.id,
          eventType: event.type,
          message: error.message,
          ...error.context,
        });
        notifyAdmissions(notifier, {
          type: "payment.validation_failed",
          eventId: event.id,
          eventType: event.type,
          reason: error.message,
          ...error.context,
        });

        return res.json({ received: true, ignored: true });
      }

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
