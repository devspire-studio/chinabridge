import { Download, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/admin/admin-shell";
import { CategoryMix, ChannelChart, RevenueTrend, StatusDonut } from "@/components/admin/charts";
import { KpiCard } from "@/components/admin/kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import { bdt, numberFmt, pct } from "@/lib/format";
import { getDashboardStats, getInventoryValue, getTopCustomers } from "@/server/stats";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [stats, inventory, topCustomers] = await Promise.all([getDashboardStats(), getInventoryValue(), getTopCustomers(8)]);

  const dutyCollected = stats.recentOrders.reduce((acc, o) => acc + o.dutyBdt, 0);
  const serviceFees = stats.recentOrders.reduce((acc, o) => acc + o.serviceFeeBdt, 0);
  const freight = stats.recentOrders.reduce((acc, o) => acc + o.shippingFeeBdt, 0);
  const goodsValue = Math.max(0, stats.revenueBdt - serviceFees - freight - dutyCollected);
  const grossMargin = stats.revenueBdt ? Math.round(((serviceFees + freight) / stats.revenueBdt) * 100) : 0;

  const last14 = stats.revenueSeries.slice(-14);
  const previous14 = stats.revenueSeries.slice(-28, -14);
  const sum = (rows: typeof stats.revenueSeries) => rows.reduce((acc, r) => acc + r.revenue, 0);
  const growth = sum(previous14) ? Math.round(((sum(last14) - sum(previous14)) / sum(previous14)) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Reports & analytics"
        description="Import economics, unit economics and customer value across the last 30 days."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" /> Export CSV
            </Button>
            <Button variant="cf" size="sm">
              Schedule weekly email
            </Button>
          </>
        }
      />

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Gross revenue"
          value={bdt(stats.revenueBdt)}
          delta={{ value: `${growth >= 0 ? "+" : ""}${growth}% vs prior 14d`, positive: growth >= 0 }}
          icon={<TrendingUp className="size-4" />}
        />
        <KpiCard label="Sourcing fee income" value={bdt(serviceFees)} hint="service charge on landed cost" tone="#1e40f5" />
        <KpiCard label="Freight income" value={bdt(freight)} hint="chargeable weight + CBM" tone="#12a150" />
        <KpiCard label="Contribution margin" value={`${grossMargin}%`} hint="fee + freight over gross revenue" tone="#a855f7" />
      </section>

      <section className="mb-5 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueTrend data={stats.revenueSeries} />
        </div>
        <StatusDonut data={stats.statusBreakdown} />
      </section>

      <section className="mb-5 grid gap-4 xl:grid-cols-2">
        <CategoryMix data={stats.categoryMix} />
        <ChannelChart data={stats.channelMix} />
      </section>

      <section className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Best-selling SKUs</p>
            <p className="text-xs text-slate-500">By units sold across all orders</p>
          </div>
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH className="text-right">Units</TH>
                  <TH className="text-right">Revenue</TH>
                </TR>
              </THead>
              <TBody>
                {stats.topProducts.map((product) => (
                  <TR key={product.title}>
                    <TD className="font-medium text-slate-800">{product.title}</TD>
                    <TD className="text-right tabular-nums">{numberFmt(product.sold)}</TD>
                    <TD className="text-right tabular-nums">{bdt(product.revenue)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Customer value leaderboard</p>
            <p className="text-xs text-slate-500">Lifetime spend, balance and tier</p>
          </div>
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Tier</TH>
                  <TH className="text-right">Lifetime</TH>
                  <TH className="text-right">Due</TH>
                </TR>
              </THead>
              <TBody>
                {topCustomers.map((customer) => (
                  <TR key={customer.id}>
                    <TD>
                      <span className="block font-medium text-slate-800">{customer.name}</span>
                      <span className="block text-xs text-slate-400">{customer.phone}</span>
                    </TD>
                    <TD>
                      <Badge variant={customer.tier === "platinum" ? "accent" : customer.tier === "gold" ? "warning" : "muted"}>
                        {customer.tier}
                      </Badge>
                    </TD>
                    <TD className="text-right tabular-nums">{bdt(customer.totalSpentBdt)}</TD>
                    <TD className="text-right tabular-nums">
                      {customer.dueBdt > 0 ? <span className="text-rose-600">{bdt(customer.dueBdt)}</span> : "—"}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-slate-900">Import cost breakdown</p>
        <p className="mb-3 text-xs text-slate-500">Composition of every taka invoiced to customers</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Goods value (CNY → BDT)", value: goodsValue, tone: "bg-slate-400" },
            { label: "Sourcing service fee", value: serviceFees, tone: "bg-cf-orange" },
            { label: "Freight & handling", value: freight, tone: "bg-[#1e40f5]" },
            { label: "Customs duty & VAT", value: dutyCollected, tone: "bg-[#12a150]" },
          ].map((row) => {
            const share = stats.revenueBdt ? Math.min(100, Math.round((row.value / stats.revenueBdt) * 100)) : 0;
            return (
              <div key={row.label} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{row.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{bdt(row.value, { compact: true })}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${row.tone}`} style={{ width: `${share}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{pct(share)} of gross revenue</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Inventory at cost</p>
            <p className="text-lg font-semibold text-slate-900">{bdt(inventory.costBdt)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Inventory at retail</p>
            <p className="text-lg font-semibold text-slate-900">{bdt(inventory.retailBdt)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Active SKUs</p>
            <p className="text-lg font-semibold text-slate-900">{numberFmt(inventory.skus)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
