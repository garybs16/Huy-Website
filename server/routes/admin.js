import { Router } from "express";
import { ZodError } from "zod";
import { requireAdminKey } from "../middleware/requireAdminKey.js";
import { adminCohortSchema, adminProgramSchema } from "../validation/schemas.js";

export function createAdminRouter({ adminKey, enrollmentDb }) {
  const router = Router();

  router.use(requireAdminKey(adminKey));

  router.get("/overview", (_req, res) => {
    res.json(enrollmentDb.getAdminOverview());
  });

  router.get("/programs", (_req, res) => {
    res.json({ items: enrollmentDb.listPrograms({ includeInactive: true }) });
  });

  router.post("/programs", (req, res, next) => {
    try {
      const payload = adminProgramSchema.parse(req.body);
      const item = enrollmentDb.createProgram(payload);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/programs/:id", (req, res, next) => {
    try {
      const payload = adminProgramSchema.parse({ ...req.body, id: req.params.id });
      const item = enrollmentDb.updateProgram(req.params.id, payload);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/programs/:id", (req, res, next) => {
    try {
      enrollmentDb.deleteProgram(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.get("/cohorts", (_req, res) => {
    res.json({ items: enrollmentDb.listCohortsForAdmin() });
  });

  router.post("/cohorts", (req, res, next) => {
    try {
      const payload = adminCohortSchema.parse(req.body);
      const item = enrollmentDb.createCohort(payload);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/cohorts/:id", (req, res, next) => {
    try {
      const payload = adminCohortSchema.parse({ ...req.body, id: req.params.id });
      const item = enrollmentDb.updateCohort(req.params.id, payload);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/cohorts/:id", (req, res, next) => {
    try {
      enrollmentDb.deleteCohort(req.params.id);
      res.status(204).end();
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

    if (typeof error?.message === "string" && /not found|already exists|dependent cohorts|Existing enrollments/i.test(error.message)) {
      const statusCode = /not found/i.test(error.message) ? 404 : 409;
      return res.status(statusCode).json({ error: error.message });
    }

    return next(error);
  });

  return router;
}
