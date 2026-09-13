import { Wallet } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/admin-shell";
import { KpiCard } from "@/components/admin/kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import { PAYMENT_METHOD_LABEL, bdt, dateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import { listWalletTransactions } from "@/server/queries";
import { getWalletLiability } from "@/server/stats";

export const dynamic = "force-dynamic";

const TYPES = ["topup", "order_payment", "refund", "cashback", "withdraw", "adjustment"] as const;

const TYPE_TONE: Record<string, "success" | "danger" | "info" | "warning" | "muted" | "accent"> = {
  topup: "success",
  order_payment: "info",
  refund: "warning",
  cashback: "accent",
  withdraw: "danger",
  adjustment: "muted",
};

export default async function AdminWalletPage({ searchParams }: { searchParams: Promise<{ type?: string; customerId?: string }> }) {
  const sp = await searchParams;
  const [transactions, liability] = await Promise.all([
    listWalletTransactions({ type: sp.type, customerId: sp.customerId }),
    getWalletLiability(),
  ]);

  const sum = (type: string) =>
    transactions.filter((t) => t.type === type).reduce((acc, t) => acc + Math.abs(t.amountBdt), 0);

  return (
    <div>
      <PageHeader
        title="Wallet ledger"
        description="Customer store credit: top-ups, order settlements, refunds, cashback and manual adjustments."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Wallet ledger" }]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/customers">Customer balances</Link>
          </Button>
        }
      />

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Wallet liability" value={bdt(liability)} hint="unspent store credit we owe" icon={<Wallet className="size-4" />} />
        <KpiCard label="Top-ups" value={bdt(sum("topup"))} hint="money loaded by customers" tone="#12a150" />
        <KpiCard label="Spent on orders" value={bdt(sum("order_payment"))} hint="settled from wallet balance" tone="#1e40f5" />
        <KpiCard label="Refunds issued" value={bdt(sum("refund"))} hint="credited back to wallets" tone="#e11d48" />
      </section>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {[{ type: "", label: "All activity" }, ...TYPES.map((t) => ({ type: t, label: t.replace(/_/g, " ") }))].map((tab) => (
          <Link
            key={tab.type || "all"}
            href={tab.type ? `/admin/wallet?type=${tab.type}` : "/admin/wallet"}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
              (sp.type ?? "") === tab.type
                ? "border-cf-orange bg-cf-orange text-slate-950"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        {transactions.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<Wallet className="size-5" />} title="No wallet activity" description="Top-ups and settlements will show up here." />
          </div>
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Customer</TH>
                  <TH>Type</TH>
                  <TH className="hidden lg:table-cell">Method</TH>
                  <TH className="hidden lg:table-cell">Reference</TH>
                  <TH className="text-right">Amount</TH>
                  <TH className="text-right">Balance after</TH>
                  <TH className="hidden xl:table-cell">Note</TH>
                </TR>
              </THead>
              <TBody>
                {transactions.map((txn) => {
                  const credit = txn.amountBdt >= 0;
                  return (
                    <TR key={txn.id}>
                      <TD>
                        <span className="block text-sm text-slate-700">{dateTime(txn.at)}</span>
                        <span className="block text-xs text-slate-400">{timeAgo(txn.at)}</span>
                      </TD>
                      <TD>
                        <span className="block font-medium text-slate-800">{txn.customerName}</span>
                        <span className="block text-xs text-slate-400">{txn.customerId}</span>
                      </TD>
                      <TD>
                        <Badge variant={TYPE_TONE[txn.type] ?? "muted"}>{txn.type.replace(/_/g, " ")}</Badge>
                      </TD>
                      <TD className="hidden lg:table-cell text-slate-600">
                        {txn.method ? (PAYMENT_METHOD_LABEL[txn.method] ?? txn.method) : "—"}
                      </TD>
                      <TD className="hidden lg:table-cell text-xs text-slate-400">{txn.reference || "—"}</TD>
                      <TD className={cn("text-right font-medium tabular-nums", credit ? "text-emerald-600" : "text-rose-600")}>
                        {credit ? "+" : "−"} {bdt(Math.abs(txn.amountBdt))}
                      </TD>
                      <TD className="text-right tabular-nums text-slate-700">{bdt(txn.balanceAfterBdt)}</TD>
                      <TD className="hidden xl:table-cell">
                        <span className="line-clamp-2 max-w-[20rem] text-xs text-slate-500">{txn.note || "—"}</span>
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
