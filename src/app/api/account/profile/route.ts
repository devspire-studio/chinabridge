import { NextRequest } from "next/server";

import { getSession } from "@/server/auth-helpers";
import { deleteCustomerAddress, updateCustomer, upsertCustomerAddress } from "@/server/mutations";
import { getCustomerById } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveCustomerId() {
  const session = await getSession();
  if (!session) return null;
  return session.user.customerId || null;
}

export async function GET() {
  const customerId = await resolveCustomerId();
  if (!customerId) return Response.json({ error: "Not signed in" }, { status: 401 });
  const customer = await getCustomerById(customerId);
  if (!customer) return Response.json({ error: "Profile not found" }, { status: 404 });
  return Response.json({ customer });
}

export async function PATCH(req: NextRequest) {
  const customerId = await resolveCustomerId();
  if (!customerId) return Response.json({ error: "Not signed in" }, { status: 401 });
  const body = await req.json();

  if (body.action === "address.upsert") {
    const result = await upsertCustomerAddress(customerId, body.address);
    return Response.json({ ...result, ok: true });
  }
  if (body.action === "address.delete") {
    await deleteCustomerAddress(body.id, customerId);
    return Response.json({ ok: true });
  }

  await updateCustomer(customerId, {
    name: body.name,
    email: body.email,
    phone: body.phone,
  });
  return Response.json({ ok: true });
}
