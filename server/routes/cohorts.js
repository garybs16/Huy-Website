import { Router } from "express";

export function createCohortsRouter({ enrollmentDb }) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ items: enrollmentDb.listActiveCohorts() });
  });

  return router;
}
