import { Anchor, Plane, Ship, Truck } from "lucide-react";
import type { Metadata } from "next";

import { ShippingCalculator } from "@/components/site/shipping-calculator";
import { FaqSection } from "@/components/site/sections";
import { Breadcrumbs } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import { bdt } from "@/lib/format";
import { SHIPPING_RATES } from "@/lib/pricing";
import { getCategoriesWithCounts } from "@/server/queries";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping & duty calculator",
  description:
    "Estimate the landed cost of importing from China to Bangladesh — freight by air or sea, customs duty, VAT, AIT and delivery.",
};

export default async function ShippingCalculatorPage() {
  const [categories, settings] = await Promise.all([getCategoriesWithCounts(), getSettings()]);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shipping & duty" }]} />

      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shipping & duty calculator</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Bangladesh Customs assesses duty on the CIF value (supplier cost + freight + insurance), then adds 15% VAT and 3%
          AIT. Air freight is billed on chargeable weight (actual vs volumetric at 167 kg/CBM); sea freight is billed per CBM
          with a 0.5 CBM minimum.
        </p>
      </div>

      <div className="mt-6">
        <ShippingCalculator categories={categories} />
      </div>

      {/* rate cards */}
      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Published freight rates</h2>
        <p className="mt-1 text-sm text-slate-500">
          Rates valid for this month, updated with airline and vessel space. Fuel surcharge included.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHIPPING_RATES.map((rate) => (
            <div key={rate.mode} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {rate.unit === "kg" ? <Plane className="size-5" /> : rate.mode === "sea_fcl" ? <Anchor className="size-5" /> : <Ship className="size-5" />}
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{rate.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
                {bdt(rate.rateBdt)}
                <span className="text-sm font-medium text-slate-400">/{rate.unit}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Minimum charge {bdt(rate.minChargeBdt)} · {rate.transitDaysMin}–{rate.transitDaysMax} days
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{rate.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* included services */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900">What the freight rate includes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {[
              "Pickup from supplier to our Guangzhou / Yiwu warehouse",
              "Free consolidation of multiple suppliers into one shipment",
              "Export documentation and China-side export clearance",
              "Air or ocean freight to Dhaka / Chattogram",
              "Bangladesh customs clearance & duty filing coordination",
              settings.warehouseStorageFreeDays + " days free storage at both ends",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">Add-on: cargo insurance {settings.insurancePct}%</Badge>
            <Badge variant="secondary">Add-on: door delivery {bdt(settings.homeDeliveryDhakaBdt)} Dhaka</Badge>
            <Badge variant="secondary">Storage {bdt(settings.storageFeePerCbmBdt)}/CBM after free days</Badge>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900">How we keep duty predictable</h3>
          <ol className="mt-3 space-y-3 text-sm text-slate-600">
            {[
              "We classify your product under the correct HS code before purchase, not at the port.",
              "Assessable value is based on the actual supplier invoice, converted at our published weekly CNY rate.",
              "Duty, VAT and AIT are itemised on your order page before you pay anything.",
              "The final invoice shows the customs bill of entry amount — if it is lower, the difference is credited to your wallet.",
              "Wholesale importers with a valid BIN/VAT registration can avail bonded facility for eligible goods.",
            ].map((line, i) => (
              <li key={line} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                {line}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Freight & duty questions</h2>
        <div className="mt-5">
          <FaqSection limit={7} />
        </div>
      </section>

      <div className="mt-10 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <Truck className="mt-0.5 size-5 text-primary" />
        <p className="text-xs leading-relaxed text-slate-500">
          Delivery: home delivery inside Dhaka {bdt(settings.homeDeliveryDhakaBdt)}, outside Dhaka{" "}
          {bdt(settings.homeDeliveryOutsideBdt)}. Hub pickup at Tejgaon gets a {bdt(settings.pickupDiscountBdt)} discount.
          Chattogram, Sylhet and Khulna consignments are handed to our partner couriers with SMS tracking.
        </p>
      </div>
    </div>
  );
}
