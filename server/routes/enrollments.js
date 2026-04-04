import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ZodError } from "zod";
import { programs } from "../constants/programs.js";
import { requireAdminKey } from "../middleware/requireAdminKey.js";
import { enrollmentSchema, paginationSchema } from "../validation/schemas.js";

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

export function createEnrollmentsRouter({ enrollmentDb, adminKey, stripeClient, publicAppUrl }) {
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

      const program = programs.find((item) => item.id === cohort.programId);

      if (!program) {
        return res.status(400).json({ error: "Selected cohort is attached to an unknown program." });
      }

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
        paymentAmountCents: cohort.tuitionCents,
      });

      if (!stripeClient) {
        const manualEnrollment = enrollmentDb.markManualPending(enrollment.id);

        return res.status(201).json({
          enrollmentId: manualEnrollment.id,
          paymentRequired: false,
          status: manualEnrollment.status,
          paymentStatus: manualEnrollment.paymentStatus,
          message:
            "Registration submitted. Online payment is not configured yet, so admissions will contact you to collect tuition.",
        });
      }

      const appBaseUrl = resolveAppBaseUrl(req, publicAppUrl);
      const session = await stripeClient.checkout.sessions.create({
        mode: "payment",
        success_url: `${appBaseUrl}/register?checkout=success&enrollment=${enrollment.id}`,
        cancel_url: `${appBaseUrl}/register?checkout=cancelled&enrollment=${enrollment.id}`,
        customer_email: enrollment.email,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: cohort.tuitionCents,
              product_data: {
                name: `${program.title} - ${cohort.title}`,
                description: `${cohort.meetingPattern} | ${cohort.startDate} to ${cohort.endDate}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          enrollmentId: enrollment.id,
          cohortId: cohort.id,
          programId: cohort.programId,
        },
        payment_intent_data: {
          metadata: {
            enrollmentId: enrollment.id,
            cohortId: cohort.id,
            programId: cohort.programId,
          },
        },
      });

      const pendingEnrollment = enrollmentDb.markCheckoutPending({
        enrollmentId: enrollment.id,
        sessionId: session.id,
        expiresAt: session.expires_at ? session.expires_at * 1000 : null,
      });

      return res.status(201).json({
        enrollmentId: pendingEnrollment.id,
        paymentRequired: true,
        paymentStatus: pendingEnrollment.paymentStatus,
        checkoutUrl: session.url,
        checkoutExpiresAt: pendingEnrollment.seatHoldExpiresAt,
      });
    } catch (error) {
      if (error.message === "This cohort is full. Please choose another class date.") {
        return res.status(409).json({ error: error.message });
      }

      return next(error);
    }
  });

  router.get("/", requireAdminKey(adminKey), (req, res, next) => {
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
