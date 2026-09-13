import { Anchor, BadgeCheck, Banknote, Boxes, ClipboardCheck, FileText, Plane, Ship, Truck, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FaqSection, HowItWorks, TrustStrip } from "@/components/site/sections";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/data";
import { ORDER_STATUS_FLOW, bdt } from "@/lib/format";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How sourcing & import works",
  description:
    "The full process: supplier verification, payment, QC, consolidation, air/sea freight, customs clearance and delivery in Bangladesh.",
};

export default async function HowItWorksPage() {
  const settings = await getSettings();

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How it works" }]} />

      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">How sourcing & import works</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          You can order from our catalogue or send us any 1688 / Taobao / Alibaba / factory link. Either way, the process is
          the same eleven tracked stages — visible on your order page from the moment you pay.
        </p>
      </div>

      <div className="mt-6">
        <TrustStrip />
      </div>

      {/* process */}
      <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">The eleven milestones</h2>
          <ol className="mt-6 space-y-4">
            {ORDER_STATUS_FLOW.map((step, i) => (
              <li key={step.status} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                    {step.label}
                    <span className="font-normal text-slate-400">/ {step.labelBn}</span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.hint}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {i < 6
                      ? "China-side work: supplier payment, warehouse receiving, inspection and consolidation."
                      : i < 9
                        ? "Freight and customs: air/sea movement plus duty assessment and clearance."
                        : "Bangladesh-side work: hub receiving, courier dispatch and delivery."}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Payment schedule</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex justify-between">
                <span>Advance to start sourcing</span>
                <span className="font-semibold">{settings.advancePaymentPct}%</span>
              </li>
              <li className="flex justify-between">
                <span>Freight & duty</span>
                <span className="font-semibold">At consolidation</span>
              </li>
              <li className="flex justify-between">
                <span>Balance / delivery</span>
                <span className="font-semibold">Before handover</span>
              </li>
              <li className="flex justify-between">
                <span>Wholesale credit</span>
                <span className="font-semibold">On approval</span>
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["bKash", "Nagad", "Rocket", "Bank", "Card", "Wallet", "COD*"].map((method) => (
                <Badge key={method} variant="secondary">
                  {method}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              *COD available up to ৳20,000 with {settings.codFeePct}% handling fee.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Documents you get</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              {[
                "Supplier invoice (CNY) and payment confirmation",
                "QC report with photos/videos",
                "Consolidation packing list with weight per item",
                "Airway bill or bill of lading",
                "Bangladesh customs bill of entry with duty paid",
                "Final invoice with landed cost reconciliation",
              ].map((doc) => (
                <li key={doc} className="flex gap-2">
                  <FileText className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Freight options</p>
            <div className="mt-3 space-y-3 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Plane className="size-4 text-primary" /> Air express 3–7 days · {bdt(2050)}/kg
              </p>
              <p className="flex items-center gap-2">
                <Plane className="size-4 text-primary" /> Air standard 7–12 days · {bdt(1380)}/kg
              </p>
              <p className="flex items-center gap-2">
                <Ship className="size-4 text-primary" /> Sea LCL 25–35 days · {bdt(41000)}/CBM
              </p>
              <p className="flex items-center gap-2">
                <Anchor className="size-4 text-primary" /> Sea FCL container · {bdt(33000)}/CBM
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link href="/shipping-calculator">Open the calculator</Link>
            </Button>
          </div>
        </aside>
      </section>

      {/* capability grid */}
      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">What we handle end to end</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BadgeCheck, title: "Supplier sourcing & vetting", text: "Factory licence checks, repurchase-rate screening, sample arrangement and price negotiation." },
            { icon: Banknote, title: "China payments", text: "CNY settlement to suppliers, Alipay/WeChat pay and 1688 order placement on your behalf." },
            { icon: Warehouse, title: "Consolidation hubs", text: "Guangzhou DC-1 and Yiwu DC-2 receiving, repacking, labelling and free 15-day storage." },
            { icon: ClipboardCheck, title: "Quality inspection", text: "Function tests, quantity counts, size/colour checks with photo and video evidence." },
            { icon: Truck, title: "Freight & customs", text: "Air/sea booking, HS classification, duty assessment, bond clearance and courier handover." },
            { icon: Boxes, title: "Wholesale programmes", text: "Container loading, mixed-SKU pallets, custom packaging and B2B credit lines." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">In four simple steps</h2>
        <div className="mt-5">
          <HowItWorks />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <StatusPill tone="success">96.4% on-time delivery</StatusPill>
          <StatusPill tone="info">12,400+ consignments cleared</StatusPill>
          <StatusPill tone="warning">Avg. reply 8 minutes</StatusPill>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Process questions</h2>
        <div className="mt-5">
          <FaqSection limit={5} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="brand" asChild>
            <Link href="/quote">Send us a supplier link</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">Browse the catalogue</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
