import { NextRequest } from "next/server";

import { getOrderByNo } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STEPS = [
  "pending_payment",
  "confirmed",
  "purchased",
  "china_warehouse",
  "qc_passed",
  "consolidated",
  "in_transit",
  "customs_clearance",
  "arrived_bd",
  "out_for_delivery",
  "delivered",
];

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) return Response.json({ error: "Provide an order number, courier tracking or consignment reference." }, { status: 400 });

  const order = await getOrderByNo(q);
  if (!order) return Response.json({ error: `No order found for “${q}”.` }, { status: 404 });

  const currentIndex = STEPS.indexOf(order.status);
  return Response.json({
    order: {
      orderNo: order.orderNo,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingMode: order.shippingMode,
      customerName: order.customerName,
      consignmentRef: order.consignmentRef,
      courier: order.courier,
      courierTrackingNo: order.courierTrackingNo,
      chinaTrackingNo: order.chinaTrackingNo,
      etaAt: order.etaAt,
      createdAt: order.createdAt,
      totalBdt: order.totalBdt,
      paidBdt: order.paidBdt,
      weightGrams: order.weightGrams,
      cbm: order.cbm,
      shippingMode_label: undefined,
    },
    items: order.items,
    events: order.events,
    progress: {
      step: currentIndex < 0 ? 0 : currentIndex,
      total: STEPS.length,
      percent: currentIndex < 0 ? 0 : Math.round((currentIndex / (STEPS.length - 1)) * 100),
    },
  });
}
