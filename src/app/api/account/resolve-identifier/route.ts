import { NextRequest } from "next/server";

import { getCustomerByPhoneOrEmail } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Maps a phone number (or email) to the email used by better-auth so customers can sign in with a phone. */
export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();
    const value = String(identifier ?? "").trim();
    if (!value) return Response.json({ error: "Missing identifier" }, { status: 400 });
    if (value.includes("@")) return Response.json({ email: value.toLowerCase() });

    const customer = await getCustomerByPhoneOrEmail(value);
    if (!customer?.email) {
      return Response.json({ error: "No account found for that phone number. Please register." }, { status: 404 });
    }
    return Response.json({ email: customer.email });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
