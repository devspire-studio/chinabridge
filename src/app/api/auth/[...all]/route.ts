import { toNextJsHandler } from "better-auth/next-js";

import { getDb } from "@/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = toNextJsHandler(auth);

// make sure tables exist and demo data is loaded before auth queries run
async function ready() {
  await getDb();
}

export async function GET(request: Request) {
  await ready();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  await ready();
  return handlers.POST(request);
}
