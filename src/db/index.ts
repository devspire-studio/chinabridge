import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzleNode, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migrateNode } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { Pool } from "pg";

import * as schema from "./schema";
import * as authSchema from "./auth-schema";

export * from "./schema";
export * from "./auth-schema";

export const fullSchema = { ...schema, ...authSchema };

export type Database = NodePgDatabase<typeof schema & typeof authSchema>;

export type DbDriver = "postgres" | "pglite";

interface DbGlobal {
  db?: Database;
  driver?: DbDriver;
  ready?: Promise<Database>;
}

const globalForDb = globalThis as unknown as { __chinabridgeDb?: DbGlobal };
const state: DbGlobal = (globalForDb.__chinabridgeDb ??= {});

// Load .env.local and .env if not already loaded (e.g. CLI scripts outside Next.js)
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    try {
      if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(fullPath);
      }
    } catch {}

    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    } catch {}
  }
}
loadEnv();

export function dbDriver(): DbDriver {
  return process.env.DATABASE_URL ? "postgres" : "pglite";
}

function createClient(): Database {
  const driver = dbDriver();
  state.driver = driver;

  if (driver === "postgres") {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
    return drizzleNode(pool, { schema: fullSchema }) as unknown as Database;
  }

  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pgdata");
  fs.mkdirSync(dir, { recursive: true });
  return drizzlePglite(new PGlite(dir), { schema: fullSchema }) as unknown as Database;
}

/**
 * Synchronous client (safe to hand to third-party libs like better-auth).
 * Queries queue inside PGlite until the engine is ready.
 */
export const db: Database = (state.db ??= createClient());

/**
 * Async accessor used by all app queries: guarantees migrations + seed have run
 * before the first statement touches real data.
 */
export async function getDb(): Promise<Database> {
  if (state.ready) return state.ready;

  state.ready = (async () => {
    const database = db;
    const migrationsFolder = path.join(process.cwd(), "drizzle");
    try {
      if (dbDriver() === "postgres") {
        await migrateNode(database as never, { migrationsFolder });
      } else {
        await migratePglite(database as never, { migrationsFolder });
      }
    } catch (error) {
      console.warn("[db] migration step skipped:", (error as Error).message);
    }

    try {
      const { ensureSeeded } = await import("./seed");
      await ensureSeeded(database);
    } catch (error) {
      console.error("[db] seeding failed:", (error as Error).message);
    }

    return database;
  })();

  return state.ready;
}

export { schema };

/** Marks the bootstrap as already complete (used by the seeder CLI). */
export async function primeDb() {
  return getDb();
}
