import { programCatalogSeed } from "../../shared/catalogSeed.js";

export const programs = programCatalogSeed;

export const acceptedProgramIds = programs.map((program) => program.id);
