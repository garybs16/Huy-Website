import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ZodError } from "zod";
import { requireAdminAccess } from "../middleware/requireAdminAccess.js";
import { enrollmentSchema, paginationSchema } from "../validation/schemas.js";

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

    return {
      paymentOption: "deposit",
      paymentAmountCents: cohort.paymentPlanDepositCents,
      tuitionTotalCents: cohort.tuitionCents,
      balanceDueCents: Math.max(cohort.tuitionCents - cohort.paymentPlanDepositCents, 0),
      checkoutLabel: "Enrollment deposit",
    };
  }

  return {
    paymentOption: "full",
    paymentAmountCents: cohort.tuitionCents,
    tuitionTotalCents: cohort.tuitionCents,
    balanceDueCents: 0,
    checkoutLabel: "Tuition payment",
  };
}

export function createEnrollmentsRouter({ enrollmentDb, adminAuth, stripeClient, publicAppUrl }) {
  const router = Router();

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
      paidAt: enrollment.paidAt,
      seatHoldExpiresAt: enrollment.seatHoldExpiresAt,
    });
  });

  router.post("/", async (req, res, next) => {
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
        paymentStatus: stripeClient ? "unpaid" : "manual_pending",
        paymentOption: pricing.paymentOption,
        paymentAmountCents: pricing.paymentAmountCents,
        tuitionTotalCents: pricing.tuitionTotalCents,
        balanceDueCents: pricing.balanceDueCents,
      });

      if (!stripeClient) {
        const manualEnrollment = enrollmentDb.markManualPending(enrollment.id);
        const amountDueNowLabel = formatMoney(manualEnrollment.paymentAmountCents);
        const balanceDueLabel = formatMoney(manualEnrollment.balanceDueCents);

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
          message:
            manualEnrollment.paymentOption === "deposit"
              ? `Registration submitted. Online payment is not configured yet, so admissions will contact you to collect the ${amountDueNowLabel} deposit and confirm the remaining ${balanceDueLabel} balance plan.`
              : "Registration submitted. Online payment is not configured yet, so admissions will contact you to collect tuition.",
        });
      }

      const appBaseUrl = resolveAppBaseUrl(req, publicAppUrl);
      let session;

      try {
        session = await stripeClient.checkout.sessions.create({
          mode: "payment",
          success_url: `${appBaseUrl}/register?checkout=success&enrollment=${enrollment.id}`,
          cancel_url: `${appBaseUrl}/register?checkout=cancelled&enrollment=${enrollment.id}`,
          customer_email: enrollment.email,
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: pricing.paymentAmountCents,
                product_data: {
                  name: `${program.title} - ${cohort.title} ${pricing.checkoutLabel}`,
                  description:
                    pricing.paymentOption === "deposit"
                      ? `${cohort.meetingPattern} | Deposit now, ${formatMoney(pricing.balanceDueCents)} due before class start`
                      : `${cohort.meetingPattern} | ${cohort.startDate} to ${cohort.endDate}`,
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            enrollmentId: enrollment.id,
            cohortId: cohort.id,
            programId: cohort.programId,
            paymentOption: pricing.paymentOption,
          },
          payment_intent_data: {
            metadata: {
              enrollmentId: enrollment.id,
              cohortId: cohort.id,
              programId: cohort.programId,
              paymentOption: pricing.paymentOption,
            },
          },
        });
      } catch {
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
        checkoutUrl: session.url,
        checkoutExpiresAt: pendingEnrollment.seatHoldExpiresAt,
      });
    } catch (error) {
      if (error.message === "This cohort is full. Please choose another class date.") {
        return res.status(409).json({ error: error.message });
      }

      if (error.message === "This cohort does not offer a payment plan.") {
        return res.status(400).json({ error: error.message });
      }

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
