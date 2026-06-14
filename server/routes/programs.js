import { Router } from "express";

const PUBLIC_PROGRAM_ID = "cna";

export function createProgramsRouter({ enrollmentDb }) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ items: enrollmentDb.listPrograms().filter((program) => program.id === PUBLIC_PROGRAM_ID) });
  });

  return router;
}
