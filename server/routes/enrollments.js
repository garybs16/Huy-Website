import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ZodError } from "zod";
import { sendEnrollmentEmails } from "../lib/email.js";
import { notifyAdmissions } from "../lib/notifications.js";
import {
  WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
  WEEKLY_PAYMENT_PLAN_INTERVAL,
} from "../lib/stripe.js";
import { requireAdminAccess } from "../middleware/requireAdminAccess.js";
import { preventSensitiveCaching } from "../middleware/securityHeaders.js";
import { enrollmentPaymentSessionSchema, enrollmentSchema, paginationSchema } from "../validation/schemas.js";

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function resolveAppBaseUrl(req, configuredBaseUrl) {
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const origin = req.get("origin");

  if (origin) {
    return origin.replace(/\/+$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
}

function resolveEnrollmentPricing(cohort, paymentOption) {
  if (paymentOption === "deposit") {
    if (!cohort.allowPaymentPlan || !cohort.paymentPlanDepositCents) {
      throw new Error("This cohort does not offer a payment plan.");
    }

    if (
      Number(cohort.paymentPlanDepositCents) * WEEKLY_PAYMENT_PLAN_INSTALLMENTS !==
      Number(cohort.tuitionCents)
    ) {
      throw new Error(
        `This cohort's weekly plan must equal ${WEEKLY_PAYMENT_PLAN_INSTALLMENTS} equal payments totaling the tuition.`
      );
    }

    return {
      paymentOption: "deposit",
      paymentAmountCents: cohort.paymentPlanDepositCents,
      tuitionTotalCents: cohort.tuitionCents,
      balanceDueCents: Math.max(cohort.tuitionCents - cohort.paymentPlanDepositCents, 0),
      paymentInstallmentsTotal: WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
      paymentInterval: WEEKLY_PAYMENT_PLAN_INTERVAL,
      checkoutLabel: "Weekly tuition payment plan",
    };
  }

  return {
    paymentOption: "full",
    paymentAmountCents: cohort.tuitionCents,
    tuitionTotalCents: cohort.tuitionCents,
    balanceDueCents: 0,
    paymentInstallmentsTotal: 1,
    paymentInterval: null,
    checkoutLabel: "Program payment",
  };
}

function getCheckoutPurpose(pricing) {
  if (pricing.paymentOption === "deposit" && pricing.balanceDueCents > 0) {
    return "payment_plan";
  }

  return "tuition";
}

function buildCheckoutDetails({ enrollment, program, cohort, pricing, purpose }) {
  const isBalancePayment = purpose === "balance";
  const amountCents = isBalancePayment ? enrollment.balanceDueCents : pricing.paymentAmountCents;
  const amountLabel = formatMoney(amountCents);

  return {
    amountCents,
    amountLabel,
    purpose,
    checkoutLabel: isBalancePayment ? "Remaining program balance" : pricing.checkoutLabel,
    productName: `${program.title} - ${cohort.title} ${isBalancePayment ? "Remaining balance" : pricing.checkoutLabel}`,
    productDescription: isBalancePayment
      ? `${cohort.meetingPattern} | Remaining balance for enrollment ${enrollment.id}`
      : pricing.paymentOption === "deposit"
        ? `${cohort.meetingPattern} | ${formatMoney(pricing.paymentAmountCents)} today and seven automatic weekly payments`
        : `${cohort.meetingPattern} | ${cohort.startDate} to ${cohort.endDate}`,
  };
}

export async function createEnrollmentCheckoutSession({
  req,
  stripeClient,
  publicAppUrl,
  enrollment,
  program,
  cohort,
  pricing,
  purpose,
  checkoutMode = "redirect",
  returnPath = "/payment",
}) {
  const appBaseUrl = resolveAppBaseUrl(req, publicAppUrl);
  const checkoutDetails = buildCheckoutDetails({ enrollment, program, cohort, pricing, purpose });
  const isWeeklyPlan = pricing.paymentOption === "deposit" && purpose === "payment_plan";
  const metadata = {
    enrollmentId: enrollment.id,
    cohortId: cohort.id,
    programId: cohort.programId,
    paymentOption: pricing.paymentOption,
    checkoutPurpose: checkoutDetails.purpose,
    installmentsTotal: String(pricing.paymentInstallmentsTotal ?? 1),
    paymentInterval: pricing.paymentInterval ?? "one_time",
  };

  const sessionPayload = {
    mode: isWeeklyPlan ? "subscription" : "payment",
    customer_email: enrollment.email,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: checkoutDetails.amountCents,
          ...(isWeeklyPlan
            ? {
                recurring: {
                  interval: WEEKLY_PAYMENT_PLAN_INTERVAL,
                  interval_count: 1,
                },
              }
            : {}),
          product_data: {
            name: checkoutDetails.productName,
            description: checkoutDetails.productDescription,
          },
        },
        quantity: 1,
      },
    ],
    metadata,
  };

  if (isWeeklyPlan) {
    sessionPayload.payment_method_types = ["card"];
    sessionPayload.subscription_data = {
      description: `${program.title} tuition plan: eight weekly payments of ${checkoutDetails.amountLabel}`,
      metadata,
    };
    sessionPayload.custom_text = {
      submit: {
        message: `By continuing, you authorize ${checkoutDetails.amountLabel} today and seven additional automatic weekly payments, for ${formatMoney(pricing.tuitionTotalCents)} total.`,
      },
    };
  } else {
    sessionPayload.payment_intent_data = {
      description: checkoutDetails.productName,
      receipt_email: enrollment.email,
      metadata,
    };
  }

  if (checkoutMode === "embedded") {
    sessionPayload.ui_mode = "embedded_page";
    sessionPayload.return_url = `${appBaseUrl}${returnPath}?checkout=complete&enrollment=${enrollment.id}`;
  } else {
    sessionPayload.success_url = `${appBaseUrl}/payment?checkout=success&enrollment=${enrollment.id}`;
    sessionPayload.cancel_url = `${appBaseUrl}/payment?checkout=cancelled&enrollment=${enrollment.id}`;
  }

  return stripeClient.checkout.sessions.create(sessionPayload);
}

export function createEnrollmentsRouter({
  enrollmentDb,
  adminAuth,
  stripeClient,
  publicAppUrl,
  notifier,
  emailer,
  submissionLimiter,
  submissionProtection = (_req, _res, next) => next(),
}) {
  const router = Router();

  router.use(preventSensitiveCaching);

  router.get("/:id/status", (req, res) => {
    const enrollment = enrollmentDb.getEnrollmentById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found." });
    }

    return res.json({
      enrollmentId: enrollment.id,
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      paymentOption: enrollment.paymentOption,
      paymentAmountCents: enrollment.paymentAmountCents,
      tuitionTotalCents: enrollment.tuitionTotalCents,
      balanceDueCents: enrollment.balanceDueCents,
      amountPaidCents: enrollment.amountPaidCents,
      paymentInstallmentsTotal: enrollment.paymentInstallmentsTotal,
      paymentInstallmentsPaid: enrollment.paymentInstallmentsPaid,
      paymentInterval: enrollment.paymentInterval,
      nextPaymentDueAt: enrollment.nextPaymentDueAt,
      lastPaymentAt: enrollment.lastPaymentAt,
      lastPaymentFailureAt: enrollment.lastPaymentFailureAt,
      paidAt: enrollment.paidAt,
      seatHoldExpiresAt: enrollment.seatHoldExpiresAt,
    });
  });

  router.post("/", submissionLimiter, submissionProtection, async (req, res, next) => {
    try {
      const payload = enrollmentSchema.parse(req.body);
      const cohort = enrollmentDb.getCohortById(payload.cohortId);

      if (!cohort || !cohort.isActive) {
        return res.status(404).json({ error: "Selected cohort was not found." });
      }

      const program = enrollmentDb.getProgramById(cohort.programId);

      if (!program) {
        return res.status(400).json({ error: "Selected cohort is attached to an unavailable program." });
      }

      const pricing = resolveEnrollmentPricing(cohort, payload.paymentOption);
      const initialSeatHoldExpiresAt = stripeClient ? new Date(Date.now() + 35 * 60 * 1000).toISOString() : null;
      const enrollment = enrollmentDb.createEnrollment({
        id: randomUUID(),
        studentFullName: payload.studentFullName,
        email: payload.email,
        phone: payload.phone,
        dateOfBirth: payload.dateOfBirth,
        addressLine1: payload.addressLine1,
        city: payload.city,
        state: payload.state,
        postalCode: payload.postalCode,
        emergencyContactName: payload.emergencyContactName,
        emergencyContactPhone: payload.emergencyContactPhone,
        programId: cohort.programId,
        cohortId: cohort.id,
        notes: payload.notes,
        status: stripeClient ? "payment_setup" : "submitted",
        paymentStatus: stripeClient ? "payment_setup" : "manual_pending",
        paymentOption: pricing.paymentOption,
        paymentAmountCents: pricing.paymentAmountCents,
        tuitionTotalCents: pricing.tuitionTotalCents,
        balanceDueCents: pricing.balanceDueCents,
        amountPaidCents: 0,
        paymentInstallmentsTotal: pricing.paymentInstallmentsTotal,
        paymentInstallmentsPaid: 0,
        paymentInterval: pricing.paymentInterval,
        seatHoldExpiresAt: initialSeatHoldExpiresAt,
      });

      if (!stripeClient) {
        const manualEnrollment = enrollmentDb.markManualPending(enrollment.id);
        const amountDueNowLabel = formatMoney(manualEnrollment.paymentAmountCents);
        const balanceDueLabel = formatMoney(manualEnrollment.balanceDueCents);
        notifyAdmissions(notifier, {
          type: "enrollment.created",
          paymentMode: "manual",
          enrollment: manualEnrollment,
        });
        sendEnrollmentEmails(emailer, {
          enrollment: manualEnrollment,
          program,
          cohort,
          paymentRequired: false,
        });

        return res.status(201).json({
          enrollmentId: manualEnrollment.id,
          paymentRequired: false,
          status: manualEnrollment.status,
          paymentStatus: manualEnrollment.paymentStatus,
          paymentOption: manualEnrollment.paymentOption,
          amountDueNowCents: manualEnrollment.paymentAmountCents,
          amountDueNowLabel,
          balanceDueCents: manualEnrollment.balanceDueCents,
          balanceDueLabel,
          amountPaidCents: manualEnrollment.amountPaidCents,
          paymentInstallmentsTotal: manualEnrollment.paymentInstallmentsTotal,
          paymentInstallmentsPaid: manualEnrollment.paymentInstallmentsPaid,
          paymentInterval: manualEnrollment.paymentInterval,
          message:
            manualEnrollment.paymentOption === "deposit"
              ? `Registration submitted. Online payment is not configured yet, so admissions will contact you to collect the ${amountDueNowLabel} deposit and confirm the remaining ${balanceDueLabel} balance plan.`
              : "Registration submitted. Online payment is not configured yet, so admissions will contact you to collect the program payment.",
        });
      }

      let session;

      try {
        session = await createEnrollmentCheckoutSession({
          req,
          stripeClient,
          publicAppUrl,
          enrollment,
          program,
          cohort,
          pricing,
          purpose: getCheckoutPurpose(pricing),
          checkoutMode: payload.checkoutMode,
          returnPath: "/register",
        });
      } catch (error) {
        console.error("Stripe checkout session creation failed", {
          message: error instanceof Error ? error.message : String(error),
          type: error?.type,
          code: error?.code,
          param: error?.param,
        });
        enrollmentDb.markPaymentSetupFailed(
          enrollment.id,
          "Stripe checkout session creation failed before payment could start."
        );

        return res.status(502).json({
          error:
            "Payment checkout could not be created right now. Your registration was not reserved for payment. Please try again or contact admissions.",
        });
      }

      const pendingEnrollment = enrollmentDb.markCheckoutPending({
        enrollmentId: enrollment.id,
        sessionId: session.id,
        expiresAt: session.expires_at ? session.expires_at * 1000 : null,
        purpose: getCheckoutPurpose(pricing),
      });
      notifyAdmissions(notifier, {
        type: "enrollment.checkout_created",
        paymentMode: "stripe",
        enrollment: pendingEnrollment,
      });
      sendEnrollmentEmails(emailer, {
        enrollment: pendingEnrollment,
        program,
        cohort,
        paymentRequired: true,
        checkoutUrl: session.url,
      });

      return res.status(201).json({
        enrollmentId: pendingEnrollment.id,
        paymentRequired: true,
        paymentStatus: pendingEnrollment.paymentStatus,
        paymentOption: pendingEnrollment.paymentOption,
        amountDueNowCents: pendingEnrollment.paymentAmountCents,
        amountDueNowLabel: formatMoney(pendingEnrollment.paymentAmountCents),
        balanceDueCents: pendingEnrollment.balanceDueCents,
        balanceDueLabel: formatMoney(pendingEnrollment.balanceDueCents),
        amountPaidCents: pendingEnrollment.amountPaidCents,
        paymentInstallmentsTotal: pendingEnrollment.paymentInstallmentsTotal,
        paymentInstallmentsPaid: pendingEnrollment.paymentInstallmentsPaid,
        paymentInterval: pendingEnrollment.paymentInterval,
        checkoutMode: payload.checkoutMode,
        checkoutUrl: session.url,
        checkoutClientSecret: session.client_secret,
        checkoutExpiresAt: pendingEnrollment.seatHoldExpiresAt,
      });
    } catch (error) {
      if (error.message === "This cohort is full. Please choose another class date.") {
        return res.status(409).json({ error: error.message });
      }

      if (
        error.message === "This cohort does not offer a payment plan." ||
        error.message.includes("weekly plan must equal")
      ) {
        return res.status(400).json({ error: error.message });
      }

      return next(error);
    }
  });

  router.post("/:id/payment-session", submissionLimiter, async (req, res, next) => {
    try {
      const payload = enrollmentPaymentSessionSchema.parse(req.body);
      const enrollment = enrollmentDb.getEnrollmentById(req.params.id);

      if (!enrollment || enrollment.email.toLowerCase() !== payload.email.toLowerCase()) {
        return res.status(404).json({ error: "Enrollment not found for that email address." });
      }

      if (enrollment.paymentStatus === "paid") {
        return res.json({
          enrollmentId: enrollment.id,
          paymentRequired: false,
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          message: "This enrollment is already paid in full.",
        });
      }

      if (enrollment.paymentStatus === "deposit_paid" && enrollment.balanceDueCents <= 0) {
        return res.json({
          enrollmentId: enrollment.id,
          paymentRequired: false,
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          message: "This enrollment does not have a remaining balance.",
        });
      }

      if (enrollment.stripeSubscriptionId && enrollment.balanceDueCents > 0) {
        const planNeedsAttention = enrollment.paymentStatus === "installment_failed";

        return res.json({
          enrollmentId: enrollment.id,
          paymentRequired: false,
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          paymentOption: enrollment.paymentOption,
          amountPaidCents: enrollment.amountPaidCents,
          balanceDueCents: enrollment.balanceDueCents,
          balanceDueLabel: formatMoney(enrollment.balanceDueCents),
          paymentInstallmentsTotal: enrollment.paymentInstallmentsTotal,
          paymentInstallmentsPaid: enrollment.paymentInstallmentsPaid,
          paymentInterval: enrollment.paymentInterval,
          nextPaymentDueAt: enrollment.nextPaymentDueAt,
          message: planNeedsAttention
            ? "The weekly payment plan needs attention because Stripe could not collect the latest installment. Please update the payment method in Stripe or contact admissions."
            : `The weekly payment plan is active. ${enrollment.paymentInstallmentsPaid} of ${enrollment.paymentInstallmentsTotal} payments are complete, with ${formatMoney(enrollment.balanceDueCents)} remaining.`,
        });
      }

      const cohort = enrollmentDb.getCohortById(enrollment.cohortId);
      const program = cohort ? enrollmentDb.getProgramById(cohort.programId, { includeInactive: true }) : null;

      if (!cohort || !program) {
        return res.status(409).json({ error: "Enrollment program details could not be loaded." });
      }

      const purpose = enrollment.paymentStatus === "deposit_paid" && enrollment.balanceDueCents > 0
        ? "balance"
        : enrollment.paymentOption === "deposit"
          ? "payment_plan"
          : "tuition";

      if (
        purpose === "payment_plan" &&
        Number(enrollment.paymentAmountCents) * WEEKLY_PAYMENT_PLAN_INSTALLMENTS !==
          Number(enrollment.tuitionTotalCents)
      ) {
        return res.status(409).json({
          error: "This enrollment's weekly plan is not configured as eight equal payments. Please contact admissions.",
        });
      }

      const pricing = {
        paymentOption: enrollment.paymentOption,
        paymentAmountCents: enrollment.paymentAmountCents,
        tuitionTotalCents: enrollment.tuitionTotalCents,
        balanceDueCents: enrollment.balanceDueCents,
        paymentInstallmentsTotal: enrollment.paymentInstallmentsTotal || WEEKLY_PAYMENT_PLAN_INSTALLMENTS,
        paymentInterval: enrollment.paymentInterval || WEEKLY_PAYMENT_PLAN_INTERVAL,
        checkoutLabel: purpose === "payment_plan" ? "Weekly tuition payment plan" : "Program payment",
      };
      const amountDueCents = purpose === "balance" ? enrollment.balanceDueCents : enrollment.paymentAmountCents;
      const amountDueLabel = formatMoney(amountDueCents);

      if (!stripeClient) {
        return res.json({
          enrollmentId: enrollment.id,
          paymentRequired: false,
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          paymentOption: enrollment.paymentOption,
          amountDueNowCents: amountDueCents,
          amountDueNowLabel: amountDueLabel,
          balanceDueCents: enrollment.balanceDueCents,
          balanceDueLabel: formatMoney(enrollment.balanceDueCents),
          amountPaidCents: enrollment.amountPaidCents,
          paymentInstallmentsTotal: enrollment.paymentInstallmentsTotal,
          paymentInstallmentsPaid: enrollment.paymentInstallmentsPaid,
          paymentInterval: enrollment.paymentInterval,
          nextPaymentDueAt: enrollment.nextPaymentDueAt,
          message: `Online payment is not configured yet. Admissions will contact you to collect ${amountDueLabel}.`,
        });
      }

      let session;

      try {
        session = await createEnrollmentCheckoutSession({
          req,
          stripeClient,
          publicAppUrl,
          enrollment,
          program,
          cohort,
          pricing,
          purpose,
          checkoutMode: payload.checkoutMode,
        });
      } catch {
        return res.status(502).json({
          error: "Payment checkout could not be created right now. Please try again or contact admissions.",
        });
      }

      const pendingEnrollment = enrollmentDb.markCheckoutPending({
        enrollmentId: enrollment.id,
        sessionId: session.id,
        expiresAt: session.expires_at ? session.expires_at * 1000 : null,
        purpose,
      });

      notifyAdmissions(notifier, {
        type: "enrollment.payment_portal_checkout_created",
        paymentMode: "stripe",
        checkoutPurpose: purpose,
        enrollment: pendingEnrollment,
      });

      return res.json({
        enrollmentId: pendingEnrollment.id,
        paymentRequired: true,
        paymentStatus: pendingEnrollment.paymentStatus,
        paymentOption: pendingEnrollment.paymentOption,
        checkoutPurpose: purpose,
        checkoutMode: payload.checkoutMode,
        amountDueNowCents: amountDueCents,
        amountDueNowLabel: amountDueLabel,
        balanceDueCents: pendingEnrollment.balanceDueCents,
        balanceDueLabel: formatMoney(pendingEnrollment.balanceDueCents),
        amountPaidCents: pendingEnrollment.amountPaidCents,
        paymentInstallmentsTotal: pendingEnrollment.paymentInstallmentsTotal,
        paymentInstallmentsPaid: pendingEnrollment.paymentInstallmentsPaid,
        paymentInterval: pendingEnrollment.paymentInterval,
        nextPaymentDueAt: pendingEnrollment.nextPaymentDueAt,
        checkoutUrl: session.url,
        checkoutClientSecret: session.client_secret,
        checkoutExpiresAt: pendingEnrollment.seatHoldExpiresAt,
      });
    } catch (error) {
      return next(error);
    }
  });

  router.get("/", requireAdminAccess({ ...adminAuth, enrollmentDb }), (req, res, next) => {
    try {
      const { page, pageSize } = paginationSchema.parse(req.query);
      res.json(enrollmentDb.listEnrollments({ page, pageSize }));
    } catch (error) {
      next(error);
    }
  });

  router.use((error, _req, res, next) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return next(error);
  });

  return router;
}
