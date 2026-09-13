import { ArrowLeft, Banknote, MapPin, Package, Phone, Ship, Truck, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/admin-shell";
import { RecordPaymentDialog, UpdateStatusDialog } from "@/components/admin/order-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import {
  CHANNEL_LABEL,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  SHIPPING_MODE_LABEL,
  bdt,
  cny,
  cbm as cbmFmt,
  dateTime,
  kg,
  orderStatusIndex,
  shortDate,
} from "@/lib/format";
import { getOrderById } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const balance = order.totalBdt - order.paidBdt;
  const timeline = ORDER_STATUS_FLOW.filter((step) => step.status !== "cancelled").map((step) => step.status);
  const currentIndex = orderStatusIndex(order.status);
  const address = order.shippingAddress;

  return (
    <div>
      <PageHeader
        title={order.orderNo}
        description={`${order.items.length} product line${order.items.length === 1 ? "" : "s"} · placed ${dateTime(order.createdAt)} · ${CHANNEL_LABEL[order.channel]}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Orders", href: "/admin/orders" },
          { label: order.orderNo },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="size-3.5" /> Back
              </Link>
            </Button>
            <RecordPaymentDialog orderId={order.id} orderNo={order.orderNo} balanceBdt={balance} />
            <UpdateStatusDialog
              orderId={order.id}
              orderNo={order.orderNo}
              currentStatus={order.status}
              balanceBdt={balance}
            />
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant={ORDER_STATUS_TONE[order.status] ?? "muted"} className="text-xs">
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
        <Badge variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "partial" ? "warning" : "danger"}>
          {PAYMENT_STATUS_LABEL[order.paymentStatus]}
        </Badge>
        <Badge variant="info">{SHIPPING_MODE_LABEL[order.shippingMode]}</Badge>
        {order.consignmentRef && <Badge variant="secondary">Consignment {order.consignmentRef}</Badge>}
        {order.chinaTrackingNo && <Badge variant="muted">CN tracking {order.chinaTrackingNo}</Badge>}
        {order.courierTrackingNo && (
          <Badge variant="muted">
            {order.courier} · {order.courierTrackingNo}
          </Badge>
        )}
      </div>

      {/* fulfilment pipeline */}
      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-slate-900">Fulfilment pipeline</p>
        <p className="mb-4 text-xs text-slate-500">
          Customer-facing milestones from payment to handover — updated from the &ldquo;Update milestone&rdquo; dialog.
        </p>
        <ol className="flex flex-wrap gap-2">
          {timeline.map((status, index) => {
            const done = currentIndex >= index && currentIndex >= 0;
            const active = currentIndex === index;
            return (
              <li
                key={status}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                  active
                    ? "border-cf-orange bg-cf-orange/10 font-semibold text-slate-900"
                    : done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {done ? "✓" : index + 1}
                </span>
                {ORDER_STATUS_LABEL[status]}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* line items */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Package className="size-4 text-cf-orange" /> Order lines
              </p>
              <span className="text-xs text-slate-500">
                {kg(order.weightGrams)} chargeable · {cbmFmt(order.cbm)}
              </span>
            </div>
            <TableWrap>
              <Table>
                <THead>
                  <TR>
                    <TH>Product</TH>
                    <TH className="hidden sm:table-cell">SKU</TH>
                    <TH className="text-right">Unit</TH>
                    <TH className="text-right">Qty</TH>
                    <TH className="text-right">Weight</TH>
                    <TH className="text-right">Line total</TH>
                  </TR>
                </THead>
                <TBody>
                  {order.items.map((item) => (
                    <TR key={item.id}>
                      <TD>
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="size-9 rounded-md border border-slate-200 object-cover" />
                          ) : (
                            <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                              <Package className="size-4" />
                            </span>
                          )}
                          <span>
                            <span className="block max-w-[22rem] truncate font-medium text-slate-800">{item.title}</span>
                            {item.variant && <span className="block text-xs text-slate-400">{item.variant}</span>}
                          </span>
                        </div>
                      </TD>
                      <TD className="hidden sm:table-cell text-xs text-slate-400">{item.sku}</TD>
                      <TD className="text-right tabular-nums">{bdt(item.unitPriceBdt)}</TD>
                      <TD className="text-right tabular-nums">{item.quantity}</TD>
                      <TD className="text-right tabular-nums text-slate-500">{kg(item.weightGrams * item.quantity)}</TD>
                      <TD className="text-right font-medium tabular-nums">{bdt(item.unitPriceBdt * item.quantity)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableWrap>
          </section>

          {/* pricing */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="mb-3 text-sm font-semibold text-slate-900">Landed cost breakdown</p>
            <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <Row label="Goods value" value={bdt(order.subtotalBdt)} />
              <Row label="Sourcing service fee" value={bdt(order.serviceFeeBdt)} />
              <Row label="Freight & handling" value={bdt(order.shippingFeeBdt)} />
              <Row label="Customs duty & VAT" value={bdt(order.dutyBdt)} />
              {order.discountBdt > 0 && <Row label="Discount" value={`− ${bdt(order.discountBdt)}`} tone="text-emerald-600" />}
              <Row label="Customer pays" value={bdt(order.totalBdt)} strong />
              <Row label="Received" value={bdt(order.paidBdt)} tone="text-emerald-600" />
              <Row label="Outstanding" value={bdt(balance)} tone={balance > 0 ? "text-rose-600" : "text-slate-500"} strong />
            </dl>
          </section>

          {/* payments */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Banknote className="size-4 text-cf-orange" /> Payments
              </p>
              <RecordPaymentDialog orderId={order.id} orderNo={order.orderNo} balanceBdt={balance} />
            </div>
            {order.payments.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400">No payment recorded yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{PAYMENT_METHOD_LABEL[payment.method] ?? payment.method}</p>
                      <p className="text-xs text-slate-400">
                        {dateTime(payment.at)} {payment.reference ? `· ref ${payment.reference}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums text-slate-900">{bdt(payment.amountBdt)}</p>
                      <Badge variant={payment.status === "success" ? "success" : payment.status === "pending" ? "warning" : "danger"}>
                        {payment.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* activity */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Activity log</p>
              <p className="text-xs text-slate-500">Every status change, note and customer notification</p>
            </div>
            <ol className="relative space-y-4 px-4 py-4">
              {order.events.map((event) => (
                <li key={event.id} className="relative border-l border-slate-200 pl-5">
                  <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-cf-orange" />
                  <p className="text-sm font-medium text-slate-800">{event.title}</p>
                  <p className="text-xs text-slate-400">
                    {dateTime(event.at)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                  {event.note && <p className="mt-1 text-sm text-slate-600">{event.note}</p>}
                </li>
              ))}
              {order.events.length === 0 && <li className="text-sm text-slate-400">No activity recorded.</li>}
            </ol>
          </section>
        </div>

        {/* sidebar */}
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <User className="size-4 text-cf-orange" /> Customer
            </p>
            <p className="font-medium text-slate-800">{order.customerName}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
              <Phone className="size-3.5" /> {order.customerPhone}
            </p>
            {order.customerId && (
              <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                <Link href={`/admin/customers?q=${encodeURIComponent(order.customerPhone)}`}>Open customer profile</Link>
              </Button>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <MapPin className="size-4 text-cf-orange" /> Delivery address
            </p>
            <p className="text-sm font-medium text-slate-800">{address?.fullName ?? order.customerName}</p>
            <p className="text-sm text-slate-600">{address?.addressLine}</p>
            <p className="text-sm text-slate-600">
              {[address?.area, address?.city, address?.district, address?.postcode].filter(Boolean).join(", ")}
            </p>
            <p className="mt-1 text-sm text-slate-500">{address?.phone ?? order.customerPhone}</p>
            {address?.label && (
              <Badge variant="muted" className="mt-2">
                {address.label}
              </Badge>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Ship className="size-4 text-cf-orange" /> Logistics
            </p>
            <dl className="space-y-2 text-sm">
              <Row label="Shipping mode" value={SHIPPING_MODE_LABEL[order.shippingMode]} />
              <Row label="Consignment" value={order.consignmentRef ?? "Not assigned"} />
              <Row label="China tracking" value={order.chinaTrackingNo ?? "—"} />
              <Row label="BD courier" value={order.courier ?? "—"} />
              <Row label="Courier AWB" value={order.courierTrackingNo ?? "—"} />
              <Row label="ETA" value={order.etaAt ? shortDate(order.etaAt) : "—"} />
              <Row label="Chargeable weight" value={kg(order.weightGrams)} />
              <Row label="Volume" value={cbmFmt(order.cbm)} />
            </dl>
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link href="/admin/shipments">
                <Truck className="size-3.5" /> Manage consignments
              </Link>
            </Button>
          </section>

          {order.notes && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-card">
              <p className="text-sm font-semibold text-amber-900">Internal notes</p>
              <p className="mt-1 text-sm text-amber-800">{order.notes}</p>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="mb-3 text-sm font-semibold text-slate-900">Supplier cost</p>
            <dl className="space-y-2 text-sm">
              <Row label="Goods (approx. CNY)" value={cny(order.subtotalBdt / 17.4)} />
              <Row label="Service fee (approx.)" value={cny(order.serviceFeeBdt / 17.4)} />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone, strong }: { label: string; value: string; tone?: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`tabular-nums ${tone ?? "text-slate-800"} ${strong ? "font-semibold" : "font-medium"}`}>{value}</dd>
    </div>
  );
}
