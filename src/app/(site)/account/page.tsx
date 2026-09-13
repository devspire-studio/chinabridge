import { ArrowRight, Boxes, FileText, Package, Ship, Wallet } from "lucide-react";
import Link from "next/link";

import { OrderTimeline } from "@/components/site/order-timeline";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, StatCard } from "@/components/ui/data";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, bdt, kg, shortDate } from "@/lib/format";
import { getSession } from "@/server/auth-helpers";
import { getCustomerById } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AccountDashboard() {
  const session = await getSession();
  const customer = session?.user.customerId ? await getCustomerById(session.user.customerId) : null;

  const orders = (customer as unknown as { orders?: import("@/lib/types").Order[] })?.orders ?? [];
  const active = orders.filter((o) => !["delivered", "cancelled", "returned"].includes(o.status));
  const latest = orders[0];
  const walletTxns =
    (customer as unknown as { walletTransactions?: { id: string; type: string; amountBdt: number; at: string; note: string }[] })
      ?.walletTransactions ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active consignments" value={active.length} icon={<Ship className="size-4" />} tone="info" />
        <StatCard label="Total orders" value={customer?.totalOrders ?? 0} icon={<Package className="size-4" />} />
        <StatCard label="Wallet balance" value={bdt(customer?.walletBalanceBdt ?? 0)} icon={<Wallet className="size-4" />} tone="success" />
        <StatCard label="Outstanding due" value={bdt(customer?.dueBdt ?? 0)} icon={<Boxes className="size-4" />} tone={customer?.dueBdt ? "danger" : "default"} />
      </div>

      {latest ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Tracking {latest.orderNo}</p>
              <p className="text-xs text-slate-500">
                {latest.items.length} products · {kg(latest.weightGrams)} · ETA {latest.etaAt ? shortDate(latest.etaAt) : "TBC"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill tone={ORDER_STATUS_TONE[latest.status] ?? "muted"}>{ORDER_STATUS_LABEL[latest.status]}</StatusPill>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/order/${latest.orderNo}`}>
                  Open <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_300px]">
            <OrderTimeline events={latest.events} currentStatus={latest.status} />
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Shipment facts</p>
              <p>Freight: {latest.shippingMode.replace("_", " ")}</p>
              {latest.consignmentRef && <p>Consignment: {latest.consignmentRef}</p>}
              {latest.chinaTrackingNo && <p>China tracking: {latest.chinaTrackingNo}</p>}
              {latest.courier && <p>Courier: {latest.courier} · {latest.courierTrackingNo}</p>}
              <p>Total {bdt(latest.totalBdt)} · paid {bdt(latest.paidBdt)}</p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/account/orders">All orders</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Package className="size-5" />}
          title="No orders yet"
          description="Once you place your first import order, every milestone appears here with documents and courier tracking."
          action={
            <Button variant="brand" asChild>
              <Link href="/shop">Browse products</Link>
            </Button>
          }
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Recent wallet activity</p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account/wallet">View all</Link>
            </Button>
          </div>
          {walletTxns.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">No wallet transactions yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {walletTxns.slice(0, 5).map((txn) => (
                <li key={txn.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    <span className="block text-slate-700 capitalize">{txn.type.replace(/_/g, " ")}</span>
                    <span className="block text-xs text-slate-400">{txn.note || shortDate(txn.at)}</span>
                  </span>
                  <span className={txn.amountBdt >= 0 ? "font-medium text-emerald-600" : "font-medium text-slate-700"}>
                    {txn.amountBdt >= 0 ? "+" : ""}
                    {bdt(txn.amountBdt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <p className="text-sm font-semibold text-slate-900">Quick actions</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" size="sm" className="justify-start" asChild>
              <Link href="/quote">
                <FileText className="size-3.5" /> Request a quote
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="justify-start" asChild>
              <Link href="/account/wallet">
                <Wallet className="size-3.5" /> Top up wallet
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="justify-start" asChild>
              <Link href="/track">
                <Ship className="size-3.5" /> Track a consignment
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="justify-start" asChild>
              <Link href="/account/tickets">
                <Package className="size-3.5" /> Support tickets
              </Link>
            </Button>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            Importing more than 5 consignments a month? Ask support for wholesale tier pricing and consolidated invoicing.
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary">Advance {customer ? "" : ""}50%</Badge>
            <Badge variant="secondary">Wallet refunds instant</Badge>
            <Badge variant="success">Landed cost guaranteed</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
