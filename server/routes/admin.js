import { Router } from "express";
import { requireAdminKey } from "../middleware/requireAdminKey.js";

export function createAdminRouter({ adminKey, enrollmentDb }) {
  const router = Router();

  router.use(requireAdminKey(adminKey));

  router.get("/overview", (_req, res) => {
    res.json(enrollmentDb.getAdminOverview());
  });

  return router;
}
