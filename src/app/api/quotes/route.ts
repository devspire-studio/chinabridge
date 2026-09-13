import { NextRequest } from "next/server";

import { createQuote } from "@/server/mutations";
import { listQuotes } from "@/server/queries";
import { getSession } from "@/server/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const rows = await listQuotes({ status: sp.get("status") ?? undefined, q: sp.get("q") ?? undefined });
  return Response.json({ rows });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.phone || !body.sourceUrl) {
      return Response.json({ error: "Name, phone and supplier link are required." }, { status: 400 });
    }
    const session = await getSession();
    const result = await createQuote({
      customerName: body.customerName || session?.user.name,
      phone: body.phone || session?.user.phone,
      email: body.email || session?.user.email,
      sourceUrl: body.sourceUrl,
      sourcePlatform: body.sourcePlatform,
      productName: body.productName || "Unnamed product",
      quantity: Number(body.quantity) || 1,
      targetPriceBdt: body.targetPriceBdt ? Number(body.targetPriceBdt) : undefined,
      notes: body.notes,
    });
    return Response.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
