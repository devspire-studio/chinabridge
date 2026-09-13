import { Download, Plus, Search } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/fields";
import { EmptyState, Pagination, Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import { cn } from "@/lib/cn";
import {
  CHANNEL_LABEL,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  SHIPPING_MODE_LABEL,
  bdt,
  kg,
  shortDate,
} from "@/lib/format";
import { listOrders } from "@/server/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; status?: string; channel?: string; paymentStatus?: string; mode?: string; page?: string }>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const result = await listOrders({
    q: sp.q,
    status: sp.status,
    channel: sp.channel,
    paymentStatus: sp.paymentStatus,
    shippingMode: sp.mode,
    page,
    perPage: 20,
  });

  const buildHref = (next: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.status) params.set("status", sp.status);
    if (sp.channel) params.set("channel", sp.channel);
    if (sp.paymentStatus) params.set("paymentStatus", sp.paymentStatus);
    if (sp.mode) params.set("mode", sp.mode);
    params.set("page", String(next));
    return `/admin/orders?${params.toString()}`;
  };

  const tabs = [{ status: "", label: "All" }, ...ORDER_STATUS_FLOW.map((s) => ({ status: s.status, label: s.label }))].concat([
    { status: "cancelled", label: "Cancelled" },
  ]);

  const statusHref = (status: string) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (status) params.set("status", status);
    if (sp.channel) params.set("channel", sp.channel);
    if (sp.paymentStatus) params.set("paymentStatus", sp.paymentStatus);
    return `/admin/orders${params.size ? `?${params.toString()}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${result.total} orders across storefront, sourcing links, quotes and group deals.`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" /> Export
            </Button>
            <Button variant="cf" size="sm" asChild>
              <Link href="/admin/quotes">
                <Plus className="size-3.5" /> Create from quote
              </Link>
            </Button>
          </>
        }
      />

      {/* status pills */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = (sp.status ?? "") === tab.status;
          return (
            <Link
              key={tab.status || "all"}
              href={statusHref(tab.status)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-cf-orange bg-cf-orange text-slate-950"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search order no, customer, phone, consignment or courier tracking…"
            className="h-9 pl-8"
          />
        </div>
        <Select name="channel" defaultValue={sp.channel ?? ""} className="h-9 w-auto min-w-[150px]">
          <option value="">Channel: all</option>
          {Object.entries(CHANNEL_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select name="paymentStatus" defaultValue={sp.paymentStatus ?? ""} className="h-9 w-auto min-w-[150px]">
          <option value="">Payment: all</option>
          {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select name="mode" defaultValue={sp.mode ?? ""} className="h-9 w-auto min-w-[150px]">
          <option value="">Shipping: all</option>
          {Object.entries(SHIPPING_MODE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        {sp.status ? <input type="hidden" name="status" value={sp.status} /> : null}
        <Button variant="cf" size="sm" type="submit">
          Apply
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">Reset</Link>
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No orders match those filters" description="Try clearing the search box or switching the status tab." />
          </div>
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Customer &amp; delivery</TH>
                  <TH className="hidden lg:table-cell">Items</TH>
                  <TH>Status</TH>
                  <TH className="hidden md:table-cell">Freight</TH>
                  <TH className="text-right">Total</TH>
                  <TH className="text-right">Balance</TH>
                  <TH className="hidden xl:table-cell">Payment</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.map((order) => {
                  const balance = order.totalBdt - order.paidBdt;
                  return (
                    <TR key={order.id}>
                      <TD>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-slate-900 hover:text-cf-orange">
                          {order.orderNo}
                        </Link>
                        <span className="block text-xs text-slate-400">
                          {shortDate(order.createdAt)} · {CHANNEL_LABEL[order.channel] ?? order.channel}
                        </span>
                      </TD>
                      <TD>
                        <span className="block font-medium text-slate-800">{order.customerName}</span>
                        <span className="block text-xs text-slate-400">
                          {order.customerPhone}
                          {order.shippingAddress?.city ? ` · ${order.shippingAddress.city}` : ""}
                        </span>
                      </TD>
                      <TD className="hidden lg:table-cell">
                        <span className="block text-sm text-slate-700">
                          {order.items.length} line{order.items.length === 1 ? "" : "s"}
                        </span>
                        <span className="block text-xs text-slate-400">{kg(order.weightGrams)}</span>
                      </TD>
                      <TD>
                        <Badge variant={ORDER_STATUS_TONE[order.status] ?? "muted"}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                        {order.consignmentRef && (
                          <span className="mt-1 block text-[11px] text-slate-400">{order.consignmentRef}</span>
                        )}
                      </TD>
                      <TD className="hidden md:table-cell text-slate-600">{SHIPPING_MODE_LABEL[order.shippingMode]}</TD>
                      <TD className="text-right font-medium tabular-nums">{bdt(order.totalBdt)}</TD>
                      <TD className="text-right tabular-nums">
                        {balance > 0 ? (
                          <span className="text-rose-600">{bdt(balance)}</span>
                        ) : (
                          <span className="text-emerald-600">Settled</span>
                        )}
                      </TD>
                      <TD className="hidden xl:table-cell">
                        <Badge
                          variant={
                            order.paymentStatus === "paid" ? "success" : order.paymentStatus === "partial" ? "warning" : "danger"
                          }
                        >
                          {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                        </Badge>
                        {order.payments?.[0] && (
                          <span className="mt-1 block text-[11px] text-slate-400">
                            {PAYMENT_METHOD_LABEL[order.payments[0].method] ?? order.payments[0].method}
                          </span>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
        )}
        <div className="border-t border-slate-100 px-4 py-3">
          <Pagination page={result.page} pageCount={result.pageCount} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}
