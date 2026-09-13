import { NextRequest } from "next/server";

import { getSession } from "@/server/auth-helpers";
import { creditWallet } from "@/server/mutations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const customerId = session?.user.customerId;
  if (!customerId) return Response.json({ error: "Sign in to use the wallet." }, { status: 401 });

  try {
    const body = await req.json();
    const amount = Number(body.amountBdt);
    if (!amount || amount < 500) return Response.json({ error: "Minimum top-up is ৳500." }, { status: 400 });
    if (amount > 500000) return Response.json({ error: "For top-ups above ৳5,00,000 please contact finance." }, { status: 400 });

    const balance = await creditWallet(
      customerId,
      amount,
      "topup",
      body.note ?? `Wallet top-up via ${body.method ?? "bkash"}`,
      body.method ?? "bkash",
    );

    return Response.json({ ok: true, balance });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
