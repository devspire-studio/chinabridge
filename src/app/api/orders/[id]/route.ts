import { NextRequest } from "next/server";

import { addOrderPayment, updateOrderStatus } from "@/server/mutations";
import { getOrderById } from "@/server/queries";
import { assertAdminApi } from "@/server/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await assertAdminApi();
  if (!guard.ok) return guard.response;

  const body = await req.json();

  try {
    if (body.action === "payment") {
      const order = await addOrderPayment(id, {
        amountBdt: Number(body.amountBdt),
        method: body.method,
        reference: body.reference,
        actor: guard.user.name,
      });
      return Response.json({ ok: true, order });
    }

    if (body.action === "status" || body.status) {
      const order = await updateOrderStatus(id, body.status, {
        note: body.note,
        location: body.location,
        actor: guard.user.name,
        courier: body.courier,
        courierTrackingNo: body.courierTrackingNo,
        etaAt: body.etaAt,
      });
      return Response.json({ ok: true, order });
    }

    return Response.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
