import { ArrowRight, CheckCircle2, Copy, FileText, MessageCircle, Package, Printer, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderTimeline } from "@/components/site/order-timeline";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/data";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  SHIPPING_MODE_LABEL,
  bdt,
  dateTime,
  kg,
  numberFmt,
  shortDate,
} from "@/lib/format";
import { getOrderByNo } from "@/server/queries";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ orderNo: string }> }): Promise<Metadata> {
  const { orderNo } = await params;
  return { title: `Order ${orderNo}` };
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNo: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ orderNo }, sp] = await Promise.all([params, searchParams]);
  const [order, settings] = await Promise.all([getOrderByNo(decodeURIComponent(orderNo)), getSettings()]);
  if (!order) notFound();

  const balance = Math.max(0, order.totalBdt - order.paidBdt);
  const shipmentNote = order.consignmentRef ? `Consolidated in consignment ${order.consignmentRef}` : "Awaiting consolidation at our China warehouse";

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Orders", href: "/track" }, { label: order.orderNo }]} />

      {sp.new === "1" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Order placed successfully — {order.orderNo}</p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Our sourcing desk is notified. Complete the advance payment below and we start buying from the supplier the same
              day.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order {order.orderNo}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed {shortDate(order.createdAt)} · {order.items.length} products · {kg(order.weightGrams)} ·{" "}
            {numberFmt(order.cbm, 4)} CBM
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill tone={ORDER_STATUS_TONE[order.status] ?? "muted"}>{ORDER_STATUS_LABEL[order.status]}</StatusPill>
            <Badge variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "partial" ? "warning" : "muted"}>
              {PAYMENT_STATUS_LABEL[order.paymentStatus]}
            </Badge>
            <Badge variant="secondary">{SHIPPING_MODE_LABEL[order.shippingMode]}</Badge>
            {order.consignmentRef && <Badge variant="info">{order.consignmentRef}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/track?q=${order.orderNo}`}>
              <Truck className="size-3.5" /> Live tracking
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}?text=Order%20${order.orderNo}`} target="_blank" rel="noreferrer">
              <MessageCircle className="size-3.5" /> Ask about this order
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Package className="size-4 text-primary" /> Import progress
              </p>
              <span className="text-xs text-slate-400">{shipmentNote}</span>
            </div>
            <div className="mt-5">
              <OrderTimeline events={order.events} currentStatus={order.status} />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Items in this order</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className="size-14 rounded-lg border border-slate-200 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      SKU {item.sku}
                      {item.variant ? ` · ${item.variant}` : ""} · {item.quantity} × {bdt(item.unitPriceBdt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{bdt(item.unitPriceBdt * item.quantity)}</p>
                    <p className="text-xs text-slate-400">{kg(item.weightGrams * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Payment history</p>
            {order.payments.length === 0 ? (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                No payment received yet. Send the advance to start sourcing — see the payment box on the right.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between py-2.5">
                    <span>
                      <span className="font-medium text-slate-800">{bdt(payment.amountBdt)}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {PAYMENT_METHOD_LABEL[payment.method]} · {payment.reference}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400">{dateTime(payment.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Order value</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Products" value={bdt(order.subtotalBdt)} />
              <Row label="Sourcing fee (included)" value={bdt(order.serviceFeeBdt)} muted />
              <Row label="Freight" value={bdt(order.shippingFeeBdt)} />
              <Row label="Duty + VAT" value={bdt(order.dutyBdt)} />
              {order.discountBdt > 0 && <Row label="Discount" value={`− ${bdt(order.discountBdt)}`} />}
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-slate-200 pt-3">
              <span className="text-sm font-semibold text-slate-700">Total</span>
              <span className="text-xl font-bold text-primary">{bdt(order.totalBdt)}</span>
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Paid</span>
                <span className="font-medium text-emerald-600">{bdt(order.paidBdt)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Balance due</span>
                <span className="font-medium text-rose-600">{bdt(balance)}</span>
              </div>
            </div>
          </Card>

          {balance > 0 && (
            <Card className="p-5">
              <p className="text-sm font-semibold text-slate-900">Pay the advance</p>
              <p className="mt-1 text-xs text-slate-500">
                Send {bdt(Math.min(balance, Math.round((order.totalBdt * settings.advancePaymentPct) / 100)))} now — balance
                before delivery.
              </p>
              <div className="mt-3 space-y-2 text-xs">
                <PayRow label="bKash (personal)" value="01711-000111" />
                <PayRow label="Nagad (personal)" value="01811-000222" />
                <PayRow label="Bank transfer" value="City Bank · A/C 1402-8871-0001" />
                <PayRow label="Reference" value={order.orderNo} />
              </div>
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500">
                After sending, reply to our WhatsApp with the transaction ID — finance verifies within 30 minutes and your order
                moves to “Order confirmed”.
              </p>
            </Card>
          )}

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Delivery & documents</p>
            <dl className="mt-3 space-y-1.5 text-xs text-slate-600">
              <Row label="Deliver to" value={order.shippingAddress.fullName} muted />
              <Row label="Phone" value={order.shippingAddress.phone} muted />
              <Row
                label="Address"
                value={`${order.shippingAddress.addressLine}, ${order.shippingAddress.area}, ${order.shippingAddress.city}`}
                muted
              />
              {order.courier && <Row label="Courier" value={`${order.courier} · ${order.courierTrackingNo ?? ""}`} muted />}
              {order.chinaTrackingNo && <Row label="China tracking" value={order.chinaTrackingNo} muted />}
              <Row label="ETA" value={order.etaAt ? shortDate(order.etaAt) : "TBC"} muted />
            </dl>
            <div className="mt-4 grid gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/quote">
                  <FileText className="size-3.5" /> Add another item to this consignment
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start text-slate-500">
                <Printer className="size-3.5" /> Print invoice (PDF)
              </Button>
              <Button variant="ghost" size="sm" className="justify-start text-slate-500" asChild>
                <Link href={`/track?q=${order.orderNo}`}>
                  <Copy className="size-3.5" /> Share tracking link <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className={muted ? "text-slate-400" : "text-slate-500"}>{label}</dt>
      <dd className={`text-right font-medium ${muted ? "font-normal text-slate-500" : "text-slate-800"}`}>{value}</dd>
    </div>
  );
}

function PayRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-xs font-semibold text-slate-800">{value}</span>
    </div>
  );
}
