/**
 * Exporte SEED_DATABASE en JSON — importable dans Supabase SQL Editor
 * ou via l'API Supabase sans passer par Prisma.
 *
 * Usage: npm run seed:export
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { SEED_DATABASE, getSeedStats } from "../src/data/seed";

const outDir = join(__dirname, "../src/data/seed");
const outFile = join(outDir, "seed.json");

mkdirSync(outDir, { recursive: true });

// JSON pur — pas de demoOffsetHours polluting Supabase (strip UI-only fields)
const exportable = {
  ...SEED_DATABASE,
  events: SEED_DATABASE.events.map(({ demoOffsetHours: _, ...e }) => e),
};

writeFileSync(outFile, JSON.stringify(exportable, null, 2), "utf-8");

const stats = getSeedStats();
console.log("📦 Exported seed.json:");
console.log(stats);
console.log(`\n→ ${outFile}`);
