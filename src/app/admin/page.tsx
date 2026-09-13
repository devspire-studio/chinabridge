import { AlertTriangle, ArrowRight, Banknote, FileText, LifeBuoy, Package, Ship, Truck, Users, Wallet } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/admin-shell";
import { CategoryMix, ChannelChart, RevenueTrend, StatusDonut } from "@/components/admin/charts";
import { DarkKpi, KpiCard } from "@/components/admin/kpi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, bdt, kg, shortDate, timeAgo } from "@/lib/format";
import { getAdminCounts, getDashboardStats, getInventoryValue, getLowStockProducts, getTopCustomers } from "@/server/stats";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, counts, inventory, topCustomers, lowStock] = await Promise.all([
    getDashboardStats(),
    getAdminCounts(),
    getInventoryValue(),
    getTopCustomers(5),
    getLowStockProducts(20),
  ]);

  const spark = stats.revenueSeries.map((r) => r.revenue);

  return (
    <div>
      <PageHeader
        title="Operations overview"
        description="Live picture of the import pipeline — orders, sourcing, freight and cash across China → Bangladesh."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/reports">View reports</Link>
            </Button>
            <Button variant="cf" size="sm" asChild>
              <Link href="/admin/orders?status=pending_payment">Review pending orders</Link>
            </Button>
          </>
        }
      />

      {/* Cloudflare-style dark analytics band */}
      <section className="mb-5 overflow-hidden rounded-xl border border-cf-line/70 bg-cf-navy p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white">ChinaBridge BD · production</p>
            <p className="text-xs text-cf-muted">Rolling 30 days · updated {timeAgo(new Date())}</p>
          </div>
          <Badge variant="success">All systems operational</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DarkKpi label="Landed order value" value={bdt(stats.revenueBdt)} sub={`${stats.orders} orders`} spark={spark} />
          <DarkKpi label="Average order value" value={bdt(stats.avgOrderValueBdt)} sub="inclusive of duty & freight" tone="#1e40f5" />
          <DarkKpi label="Fulfilment rate" value={`${stats.fulfilmentRatePct}%`} sub="orders delivered end-to-end" tone="#12a150" />
          <DarkKpi
            label="Inventory at cost"
            value={bdt(inventory.costBdt, { compact: true })}
            sub={`${inventory.skus} SKUs · retail ${bdt(inventory.retailBdt, { compact: true })}`}
            tone="#a855f7"
          />
        </div>
      </section>

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pending payments"
          value={counts.pendingPayment}
          hint="awaiting advance or balance"
          icon={<Banknote className="size-4" />}
          delta={{ value: `${bdt(stats.codDueBdt, { compact: true })} COD due`, positive: false }}
        />
        <KpiCard
          label="Open quote requests"
          value={counts.newQuotes}
          hint="1688 / Taobao sourcing"
          tone="#1e40f5"
          icon={<FileText className="size-4" />}
        />
        <KpiCard
          label="Consignments in transit"
          value={counts.inTransit}
          hint="air + sea freight"
          tone="#0ea5e9"
          icon={<Ship className="size-4" />}
        />
        <KpiCard
          label="Low stock SKUs"
          value={counts.lowStock}
          hint="25 units or fewer"
          tone="#e11d48"
          icon={<AlertTriangle className="size-4" />}
        />
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

      <section className="mb-5 grid gap-4 xl:grid-cols-3">
        {/* recent orders */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-card xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Latest orders</p>
              <p className="text-xs text-slate-500">Newest first, across all channels</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                All orders <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH className="hidden sm:table-cell">Milestone</TH>
                  <TH className="text-right">Total</TH>
                  <TH className="hidden text-right md:table-cell">Balance</TH>
                </TR>
              </THead>
              <TBody>
                {stats.recentOrders.map((order) => {
                  const balance = order.totalBdt - order.paidBdt;
                  return (
                    <TR key={order.id}>
                      <TD>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-slate-900 hover:text-cf-orange">
                          {order.orderNo}
                        </Link>
                        <span className="block text-xs text-slate-400">{shortDate(order.createdAt)}</span>
                      </TD>
                      <TD>
                        <span className="block font-medium text-slate-800">{order.customerName}</span>
                        <span className="block text-xs text-slate-400">{order.customerPhone}</span>
                      </TD>
                      <TD className="hidden sm:table-cell">
                        <Badge variant={ORDER_STATUS_TONE[order.status] ?? "muted"}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                      </TD>
                      <TD className="text-right font-medium tabular-nums">{bdt(order.totalBdt)}</TD>
                      <TD className="hidden text-right tabular-nums md:table-cell">
                        {balance > 0 ? (
                          <span className="text-rose-600">{bdt(balance)}</span>
                        ) : (
                          <span className="text-emerald-600">Settled</span>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
        </div>

        {/* in transit */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Truck className="size-4 text-cf-orange" /> In transit
              </p>
              <p className="text-xs text-slate-500">Consignments on the move</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/shipments">Manage</Link>
            </Button>
          </div>
          <ul className="divide-y divide-slate-100">
            {stats.shipmentsInTransit.slice(0, 5).map((shipment) => (
              <li key={shipment.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{shipment.ref}</p>
                  <p className="truncate text-xs text-slate-400">
                    {shipment.originCity} → {shipment.destinationCity} · {kg(shipment.weightGrams)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="info">{shipment.mode.replace("_", " ")}</Badge>
                  <p className="mt-1 text-[11px] text-slate-400">ETA {shortDate(shipment.etaAt)}</p>
                </div>
              </li>
            ))}
            {stats.shipmentsInTransit.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">Nothing in transit right now.</li>
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {/* top customers */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Users className="size-4 text-cf-orange" /> Top customers
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/customers">All</Link>
            </Button>
          </div>
          <ul className="divide-y divide-slate-100">
            {topCustomers.map((customer) => (
              <li key={customer.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{customer.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {customer.phone} · {customer.type.replace("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums text-slate-800">{bdt(customer.totalSpentBdt)}</p>
                  <p className="text-[11px] capitalize text-slate-400">{customer.tier} tier</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* wallet */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Wallet className="size-4 text-cf-orange" /> Cash position
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/wallet">Ledger</Link>
            </Button>
          </div>
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-slate-500">Customer wallet liability</dt>
              <dd className="font-medium tabular-nums text-slate-900">{bdt(stats.walletLiabilityBdt)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-slate-500">Cash-on-delivery outstanding</dt>
              <dd className="font-medium tabular-nums text-slate-900">{bdt(stats.codDueBdt)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-slate-500">Collected to date</dt>
              <dd className="font-medium tabular-nums text-slate-900">{bdt(stats.revenueBdt - stats.codDueBdt)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-slate-500">Duty & VAT paid</dt>
              <dd className="font-medium tabular-nums text-slate-900">
                {bdt(
                  stats.recentOrders.reduce((acc, o) => acc + o.dutyBdt, 0),
                  { compact: true },
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* low stock */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Package className="size-4 text-cf-orange" /> Reorder alerts
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products">Catalogue</Link>
            </Button>
          </div>
          <ul className="divide-y divide-slate-100">
            {lowStock.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{product.title}</p>
                  <p className="truncate text-xs text-slate-400">{product.sku}</p>
                </div>
                <Badge variant={product.stock <= 10 ? "danger" : "warning"}>{product.stock} left</Badge>
              </li>
            ))}
            {lowStock.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-400">Stock levels look healthy.</li>}
          </ul>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <SummaryTile
          icon={<LifeBuoy className="size-4" />}
          title="Support queue"
          value={`${counts.openTickets} open tickets`}
          href="/admin/tickets"
          hint="Average first response 42 minutes"
        />
        <SummaryTile
          icon={<FileText className="size-4" />}
          title="Sourcing desk"
          value={`${counts.newQuotes} quote requests`}
          href="/admin/quotes"
          hint="Reply with landed cost incl. duty"
        />
        <SummaryTile
          icon={<Ship className="size-4" />}
          title="Freight desk"
          value={`${counts.inTransit} consignments`}
          href="/admin/shipments"
          hint="Air express 5–8 days · sea LCL 22–30 days"
        />
      </section>
    </div>
  );
}

function SummaryTile({
  icon,
  title,
  value,
  hint,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-colors hover:border-cf-orange/60"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cf-orange/10 text-cf-orange">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">{title}</span>
        <span className="mt-0.5 block text-sm font-semibold text-slate-900">{value}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{hint}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-cf-orange" />
    </Link>
  );
}
