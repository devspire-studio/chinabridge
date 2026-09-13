import { Flame, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GroupBuyJoin } from "@/components/site/group-buy-join";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, EmptyState } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { bdt, daysUntil, kg, shortDate } from "@/lib/format";
import { getGroupBuys, getProductsByIds } from "@/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Group deals — buy together, pay wholesale",
  description: "Join other Bangladeshi importers on the same SKU and unlock factory pricing once the group fills.",
};

export default async function GroupBuyPage() {
  const deals = await getGroupBuys();
  const products = await getProductsByIds(deals.map((d) => d.productId).filter((id): id is string => Boolean(id)));
  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Group deals" }]} />

      <div className="mt-4 max-w-3xl">
        <Badge variant="hot">
          <Flame className="size-3" /> Live group deals
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Buy together, unlock factory pricing</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Each deal pools orders from multiple importers for the same SKU. When the group fills, we buy at the negotiated
          wholesale price and every member gets the group rate — the discount is applied automatically to your order.
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No live group deals right now" description="Check back next week or ask our sourcing desk to open a deal for your SKU." />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {deals.map((deal) => {
            const product = productMap.get(deal.productId ?? "");
            const progress = Math.min(100, Math.round((deal.joined / deal.minMembers) * 100));
            const saved = deal.unitPriceBdt - deal.groupPriceBdt;
            const remaining = deal.minMembers - deal.joined;
            return (
              <div
                key={deal.id}
                id={deal.slug}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:flex-row"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={deal.image} alt={deal.title} className="h-40 w-full rounded-xl object-cover sm:h-36 sm:w-36" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={deal.status === "live" ? "success" : deal.status === "scheduled" ? "info" : "muted"}>
                      {deal.status === "live" ? "Group open" : deal.status}
                    </Badge>
                    <span className="text-xs text-slate-400">closes in {daysUntil(deal.expiresAt)} days</span>
                  </div>
                  <Link href={`/product/${product?.slug ?? ""}`} className="mt-2 block text-sm font-semibold text-slate-900 hover:text-primary">
                    {product?.title ?? deal.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">{bdt(deal.groupPriceBdt)}</span>
                    <span className="text-sm text-slate-400 line-through">{bdt(deal.unitPriceBdt)}</span>
                    <Badge variant="success">save {bdt(saved)} / unit</Badge>
                  </div>
                  {product && (
                    <p className="mt-1 text-xs text-slate-500">
                      {kg(product.weightGrams)} per unit · MOQ {product.moq} · duty {product.dutyPct}%
                    </p>
                  )}

                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                      <Users className="size-3.5" /> {deal.joined}/{deal.minMembers} joined
                      {remaining > 0 ? ` · ${remaining} more to unlock` : " · group price unlocked"}
                      <span className="text-slate-400">· ends {shortDate(deal.expiresAt)}</span>
                    </p>
                  </div>

                  <div className="mt-4">
                    <GroupBuyJoin
                      dealId={deal.id}
                      title={deal.title}
                      unitPriceBdt={deal.unitPriceBdt}
                      groupPriceBdt={deal.groupPriceBdt}
                      productId={deal.productId ?? undefined}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">How group deals work</h2>
        <ol className="mt-3 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
          <li>
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
            <p className="mt-2 font-medium text-slate-800">Join with a reservation</p>
            <p className="mt-0.5 text-xs text-slate-500">We record your quantity and contact number — no payment at this stage.</p>
          </li>
          <li>
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
            <p className="mt-2 font-medium text-slate-800">Group fills before the deadline</p>
            <p className="mt-0.5 text-xs text-slate-500">Our procurement team confirms the wholesale price with the supplier.</p>
          </li>
          <li>
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
            <p className="mt-2 font-medium text-slate-800">Pay the group price</p>
            <p className="mt-0.5 text-xs text-slate-500">Your order is quoted at the group rate with the usual landed-cost breakdown.</p>
          </li>
        </ol>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/contact">Ask us to open a deal for your SKU</Link>
        </Button>
      </div>
    </div>
  );
}
