import { NextRequest } from "next/server";

import { getCouponByCode } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return Response.json({ error: "Enter a coupon code." }, { status: 400 });

    const coupon = await getCouponByCode(String(code));
    if (!coupon) return Response.json({ error: "That coupon is not valid or has expired." }, { status: 404 });
    if (coupon.used >= coupon.usageLimit) return Response.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    if (Number(subtotal) < coupon.minOrderBdt) {
      return Response.json(
        { error: `Minimum order for ${coupon.code} is ৳${coupon.minOrderBdt.toLocaleString("en-IN")}.` },
        { status: 400 },
      );
    }

    const discount =
      coupon.type === "percent"
        ? Math.round((Number(subtotal) * coupon.value) / 100)
        : coupon.type === "fixed"
          ? Math.min(coupon.value, Number(subtotal))
          : 0;

    return Response.json({
      ok: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountBdt: discount,
      message:
        coupon.type === "free_shipping"
          ? "Free shipping coupon applied — freight discount is settled at delivery."
          : `${coupon.code} applied.`,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
