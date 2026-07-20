import { Router } from "express";

const PUBLIC_PROGRAM_ID = "cna";

export function createCohortsRouter({ enrollmentDb }) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({
      items: enrollmentDb
        .listActiveCohorts()
        .filter(
          (cohort) =>
            cohort.programId === PUBLIC_PROGRAM_ID &&
            !["weekend", "evening"].includes(cohort.scheduleLabel?.toLowerCase())
        ),
    });
  });

  return router;
}
