import { Router } from "express";
import { programs } from "../constants/programs.js";

export function createProgramsRouter() {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ items: programs });
  });

  return router;
}
