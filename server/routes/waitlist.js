import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ZodError } from "zod";
import { requireAdminKey } from "../middleware/requireAdminKey.js";
import { paginationSchema, waitlistSchema } from "../validation/schemas.js";

export function createWaitlistRouter({ store, submissionLimiter, adminKey }) {
  const router = Router();

  router.post("/", submissionLimiter, async (req, res, next) => {
    try {
      const payload = waitlistSchema.parse(req.body);
      const record = {
        id: randomUUID(),
        ...payload,
        createdAt: new Date().toISOString(),
      };

      await store.insert(record);

      res.status(201).json({
        message: "Waitlist request submitted successfully.",
        id: record.id,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/", requireAdminKey(adminKey), async (req, res, next) => {
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
