/**
 * CLI: npm run db:seed        → seed if empty
 *      npm run db:seed -- --force → truncate and reseed
 */
import { getDb, dbDriver } from "./index";
import { runSeed } from "./seed";

async function main() {
  const force = process.argv.includes("--force");
  const db = await getDb();
  console.log(`[db:seed] driver=${dbDriver()} force=${force}`);
  const result = await runSeed(db, { force });
  console.log("[db:seed] done:", result);
  process.exit(0);
}

main().catch((error) => {
  console.error("[db:seed] failed:", error);
  process.exit(1);
});
