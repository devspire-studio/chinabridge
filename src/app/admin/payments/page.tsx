import { Banknote, Search } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/admin-shell";
import { KpiCard } from "@/components/admin/kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/fields";
import { EmptyState, Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, bdt, dateTime } from "@/lib/format";
import { listPayments } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; method?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const payments = await listPayments({ q: sp.q, method: sp.method, status: sp.status });

  const success = payments.filter((p) => p.status === "success");
  const collected = success.reduce((acc, p) => acc + p.amountBdt, 0);
  const today = success.filter((p) => new Date(p.at).toDateString() === new Date().toDateString());
  const pending = payments.filter((p) => p.status === "pending");

  const byMethod = Object.entries(
    success.reduce<Record<string, number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + p.amountBdt;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Every bKash, Nagad, Rocket, card, bank and cash-on-delivery settlement recorded against an order."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Payments" }]}
        actions={
          <Button variant="cf" size="sm" asChild>
            <Link href="/admin/orders?paymentStatus=unpaid">Collect outstanding balances</Link>
          </Button>
        }
      />

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Collected (all time)" value={bdt(collected)} hint={`${success.length} successful transactions`} icon={<Banknote className="size-4" />} />
        <KpiCard label="Collected today" value={bdt(today.reduce((acc, p) => acc + p.amountBdt, 0))} hint={`${today.length} transactions`} tone="#12a150" />
        <KpiCard label="Pending verification" value={String(pending.length)} hint="awaiting bank/mFS confirmation" tone="#f5a524" />
        <KpiCard
          label="Average ticket"
          value={bdt(success.length ? Math.round(collected / success.length) : 0)}
          hint="per payment, not per order"
          tone="#1e40f5"
        />
      </section>

      {byMethod.length > 0 && (
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <p className="text-sm font-semibold text-slate-900">Settlement mix</p>
          <p className="mb-3 text-xs text-slate-500">Where the money actually arrives</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {byMethod.map(([method, amount]) => {
              const share = collected ? Math.round((amount / collected) * 100) : 0;
              return (
                <div key={method} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">{PAYMENT_METHOD_LABEL[method] ?? method}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{bdt(amount, { compact: true })}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-cf-orange" style={{ width: `${share}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{share}% of collections</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <form className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={sp.q ?? ""} placeholder="Search order no, customer or transaction reference…" className="h-9 pl-8" />
        </div>
        <Select name="method" defaultValue={sp.method ?? ""} className="h-9 w-auto min-w-[160px]">
          <option value="">Method: all</option>
          {Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={sp.status ?? ""} className="h-9 w-auto min-w-[150px]">
          <option value="">Status: all</option>
          {["success", "pending", "failed", "refunded"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Button variant="cf" size="sm" type="submit">
          Filter
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/payments">Reset</Link>
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        {payments.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<Banknote className="size-5" />} title="No payments found" description="Try a different method or clearing the search." />
          </div>
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH>Received</TH>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH>Method</TH>
                  <TH className="hidden lg:table-cell">Reference</TH>
                  <TH className="text-right">Amount</TH>
                  <TH className="hidden xl:table-cell text-right">Order balance</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {payments.map((payment) => {
                  const balance = payment.orderTotalBdt - payment.orderPaidBdt;
                  return (
                    <TR key={payment.id}>
                      <TD>
                        <span className="block text-sm text-slate-700">{dateTime(payment.at)}</span>
                        <span className="block text-xs text-slate-400">{ORDER_STATUS_LABEL[payment.orderStatus]}</span>
                      </TD>
                      <TD>
                        <Link href={`/admin/orders/${payment.orderId}`} className="font-medium text-slate-900 hover:text-cf-orange">
                          {payment.orderNo}
                        </Link>
                      </TD>
                      <TD>
                        <span className="block font-medium text-slate-800">{payment.customerName}</span>
                        <span className="block text-xs text-slate-400">{payment.customerPhone}</span>
                      </TD>
                      <TD>
                        <Badge variant="secondary">{PAYMENT_METHOD_LABEL[payment.method] ?? payment.method}</Badge>
                      </TD>
                      <TD className="hidden lg:table-cell text-xs text-slate-400">{payment.reference || "—"}</TD>
                      <TD className="text-right font-medium tabular-nums">{bdt(payment.amountBdt)}</TD>
                      <TD className="hidden xl:table-cell text-right tabular-nums">
                        {balance > 0 ? <span className="text-rose-600">{bdt(balance)}</span> : <span className="text-emerald-600">Settled</span>}
                      </TD>
                      <TD>
                        <Badge
                          variant={
                            payment.status === "success"
                              ? "success"
                              : payment.status === "pending"
                                ? "warning"
                                : payment.status === "refunded"
                                  ? "info"
                                  : "danger"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
        )}
      </div>
    </div>
  );
}
