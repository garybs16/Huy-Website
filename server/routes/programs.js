import { Router } from "express";

export function createProgramsRouter({ enrollmentDb }) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ items: enrollmentDb.listPrograms() });
  });

  return router;
}
