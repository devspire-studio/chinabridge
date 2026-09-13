import { NextRequest } from "next/server";

import { getDb, ticketMessages, tickets } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const subject = String(body.subject ?? "Website enquiry").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !phone || !message) {
      return Response.json({ error: "Name, phone and message are required." }, { status: 400 });
    }

    const db = await getDb();
    const id = `tkt_${Date.now().toString(36)}`;
    const ref = `TKT-${3200 + Math.floor(Math.random() * 700)}`;

    await db.insert(tickets).values({
      id,
      ref,
      customerName: name,
      subject,
      category: body.category ?? "other",
      priority: body.priority ?? "normal",
      status: "open",
      orderNo: body.orderNo ?? null,
      createdAt: new Date(),
    });

    await db.insert(ticketMessages).values({
      id: `${id}_m1`,
      ticketId: id,
      author: name,
      role: "customer",
      body: `${message}\n\n— Contact: ${phone}${body.email ? ` · ${body.email}` : ""}`,
      at: new Date(),
    });

    return Response.json({ ok: true, ref }, { status: 201 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
