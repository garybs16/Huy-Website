import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ZodError } from "zod";
import { notifyAdmissions } from "../lib/notifications.js";
import { requireAdminAccess } from "../middleware/requireAdminAccess.js";
import { inquirySchema, paginationSchema } from "../validation/schemas.js";

export function createInquiriesRouter({ store, submissionLimiter, adminAuth, enrollmentDb, notifier }) {
  const router = Router();

  router.post("/", submissionLimiter, async (req, res, next) => {
    try {
      const payload = inquirySchema.parse(req.body);

      if (!enrollmentDb.getProgramById(payload.program)) {
        return res.status(400).json({ error: "Selected program was not found." });
      }

      const record = {
        id: randomUUID(),
        ...payload,
        createdAt: new Date().toISOString(),
      };

      await store.insert(record);
      notifyAdmissions(notifier, {
        type: "inquiry.created",
        record,
      });

      res.status(201).json({
        message: "Inquiry submitted successfully.",
        id: record.id,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/", requireAdminAccess({ ...adminAuth, enrollmentDb }), async (req, res, next) => {
    try {
      const { page, pageSize } = paginationSchema.parse(req.query);
      const data = await store.list({ page, pageSize });
      res.json(data);
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
