import { NextRequest } from "next/server";

import { createOrder } from "@/server/mutations";
import { listOrders } from "@/server/queries";
import { getSession } from "@/server/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = await listOrders({
    q: sp.get("q") ?? undefined,
    status: sp.get("status") ?? undefined,
    channel: sp.get("channel") ?? undefined,
    paymentStatus: sp.get("paymentStatus") ?? undefined,
    shippingMode: sp.get("shippingMode") ?? undefined,
    page: Number(sp.get("page") ?? 1),
    perPage: Number(sp.get("perPage") ?? 20),
  });
  return Response.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getSession();
    const result = await createOrder({
      ...body,
      customerId: session?.user.customerId || body.customerId || null,
      customerName: body.customerName || session?.user.name,
      customerPhone: body.customerPhone || session?.user.phone || body.address?.phone,
      guestEmail: body.guestEmail || session?.user.email,
    });
    return Response.json(
      {
        ok: true,
        orderNo: result.orderNo,
        total: result.total,
        orderId: result.order?.id,
        pricing: result.pricing,
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
