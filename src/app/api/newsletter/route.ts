import { NextRequest } from "next/server";

import { subscribeNewsletter } from "@/server/mutations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.email || !String(body.email).includes("@")) {
      return Response.json({ error: "A valid email is required." }, { status: 400 });
    }
    await subscribeNewsletter(String(body.email), body.phone ?? "", body.source ?? "footer");
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
