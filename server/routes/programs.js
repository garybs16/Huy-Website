import { Router } from "express";
import { programs } from "../constants/programs.js";

export function createProgramsRouter() {
  const router = Router();

  router.get("/", (_req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json({ items: programs });
  });

  return router;
}
