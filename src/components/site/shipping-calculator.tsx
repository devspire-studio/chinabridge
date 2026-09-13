"use client";

import { Calculator, Info, Plane, Ship } from "lucide-react";
import * as React from "react";

import { useSettings } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox, Field, Input, Label, Select } from "@/components/ui/fields";
import { cn } from "@/lib/cn";
import { bdt, cny, kg, numberFmt } from "@/lib/format";
import { SHIPPING_RATES, estimateLandedCost } from "@/lib/pricing";
import type { Category, ShippingMode } from "@/lib/types";

const DEFAULT_WEIGHT: Record<string, number> = {
  "mobile-accessories": 220,
  electronics: 1200,
  "audio-wearables": 200,
  "home-kitchen": 3500,
  "fashion-apparel": 400,
  "shoes-bags": 900,
  "beauty-care": 600,
  "watches-jewelry": 200,
  "toys-baby": 1200,
  "tools-machinery": 3000,
  "auto-parts": 800,
  "sports-outdoor": 2500,
  "office-stationery": 900,
  "solar-power": 12000,
  "packaging-printing": 6000,
  "building-hardware": 1500,
};

export function ShippingCalculator({
  categories,
  variant = "full",
  className,
}: {
  categories: Category[];
  variant?: "full" | "compact";
  className?: string;
}) {
  const settings = useSettings();
  const [costCny, setCostCny] = React.useState(120);
  const [quantity, setQuantity] = React.useState(10);
  const [weight, setWeight] = React.useState(300);
  const [cbm, setCbm] = React.useState(0.002);
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id ?? "");
  const [mode, setMode] = React.useState<ShippingMode>("air_standard");
  const [insured, setInsured] = React.useState(false);
  const [outsideDhaka, setOutsideDhaka] = React.useState(false);

  const category = categories.find((c) => c.id === categoryId);

  const result = React.useMemo(
    () =>
      estimateLandedCost({
        costPriceCny: Number(costCny) || 0,
        quantity: Math.max(1, Number(quantity) || 1),
        weightGrams: Math.max(1, Number(weight) || 1),
        cbm: Number(cbm) || 0.001,
        mode,
        settings,
        dutyPct: category?.dutyPct ?? 25,
        serviceFeePct: category?.serviceFeePct ?? settings.serviceFeePct,
        insured,
        homeDelivery: true,
        outsideDhaka,
      }),
    [costCny, quantity, weight, cbm, mode, settings, category, insured, outsideDhaka],
  );

  const isSea = mode.startsWith("sea");

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        <div className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Landed cost calculator</p>
              <p className="text-xs text-slate-500">Goods + freight + duty + VAT + delivery, before you pay.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={`Supplier price (¥ / unit)`} hint={`≈ ${bdt(costCny * settings.cnyToBdt)} per unit at ${settings.cnyToBdt.toFixed(2)} ৳/CNY`}>
              <Input type="number" min={0} step="0.5" value={costCny} onChange={(e) => setCostCny(Number(e.target.value))} />
            </Field>
            <Field label="Quantity (pcs)">
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </Field>
            <Field label="Unit weight (grams)">
              <Input type="number" min={1} step="10" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
            </Field>
            <Field label="Unit volume (CBM)" hint="Only matters for sea freight & volumetric air weight">
              <Input type="number" min={0.0001} step="0.001" value={cbm} onChange={(e) => setCbm(Number(e.target.value))} />
            </Field>
            <Field label="Product category" className="sm:col-span-2">
              <Select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const cat = categories.find((c) => c.id === e.target.value);
                  const slug = cat?.slug ?? "";
                  if (DEFAULT_WEIGHT[slug]) setWeight(DEFAULT_WEIGHT[slug]);
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name} — duty {c.dutyPct}%, fee {c.serviceFeePct}%
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-5">
            <Label className="mb-2 block">Shipping mode</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {SHIPPING_RATES.map((rate) => (
                <button
                  key={rate.mode}
                  type="button"
                  onClick={() => setMode(rate.mode)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all",
                    mode === rate.mode
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <span className="mt-0.5 text-slate-500">
                    {rate.unit === "kg" ? <Plane className="size-4" /> : <Ship className="size-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800">{rate.label}</span>
                    <span className="block text-xs text-slate-500">
                      {bdt(rate.rateBdt)}/{rate.unit} · {rate.transitDaysMin}–{rate.transitDaysMax} days
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <Checkbox checked={insured} onCheckedChange={(v) => setInsured(Boolean(v))} />
              Add cargo insurance ({settings.insurancePct}% of goods value)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <Checkbox checked={outsideDhaka} onCheckedChange={(v) => setOutsideDhaka(Boolean(v))} />
              Delivery outside Dhaka ({bdt(settings.homeDeliveryOutsideBdt)})
            </label>
          </div>

          {variant === "compact" && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Duty is calculated on the supplier cost (assessable value) + freight share, then VAT {settings.vatPct}% and AIT{" "}
              {settings.aitPct}% are applied. Machine parts and solar carry much lower duty than consumer goods.
            </p>
          )}
        </div>

        <div className="bg-slate-50/70 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Cost breakdown</p>
            <Badge variant={isSea ? "info" : "default"}>
              {isSea ? "Sea freight" : "Air freight"} · {result.transitDaysMin}–{result.transitDaysMax} days
            </Badge>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <Row label={`Goods · ${quantity} pcs × ${cny(costCny)}`} value={bdt(result.goodsBdt)} />
            <Row
              label={`Sourcing service fee (${category?.serviceFeePct ?? settings.serviceFeePct}%)`}
              value={bdt(result.serviceFeeBdt)}
              muted
            />
            <Row
              label={`International freight · ${kg(result.chargeableWeightGrams)} chargeable`}
              value={bdt(result.freightBdt)}
            />
            <Row label={`Customs duty (${category?.dutyPct ?? 25}% on assessable)`} value={bdt(result.dutyBdt)} />
            <Row label={`VAT (${settings.vatPct}%)`} value={bdt(result.vatBdt)} />
            <Row label={`AIT (${settings.aitPct}%)`} value={bdt(result.aitBdt)} />
            {insured && <Row label={`Cargo insurance (${settings.insurancePct}%)`} value={bdt(result.insuranceBdt)} />}
            <Row
              label="Home delivery"
              value={result.deliveryBdt < 0 ? `-${bdt(Math.abs(result.deliveryBdt))}` : bdt(result.deliveryBdt)}
            />
          </dl>

          <div className="mt-4 rounded-xl border border-primary/20 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-700">Total landed cost</span>
              <span className="text-2xl font-bold tracking-tight text-primary">{bdt(result.totalBdt)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Per unit landed</span>
              <span className="font-semibold text-slate-700">{bdt(result.perUnitBdt)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Freight as % of value</span>
              <span>{numberFmt((result.freightBdt / Math.max(1, result.goodsBdt)) * 100, 1)}%</span>
            </div>
          </div>

          <Button variant="brand" className="mt-4 w-full" asChild>
            <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
              Send this estimate to our sourcing desk
            </a>
          </Button>

          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Rates are indicative and updated with weekly airline/vessel rates. Final invoice is issued after actual weight
            verification at our China warehouse. Storage beyond {settings.warehouseStorageFreeDays} days is charged at{" "}
            {bdt(settings.storageFeePerCbmBdt)}/CBM.
          </p>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className={cn("text-slate-500", muted && "text-slate-400")}>{label}</dt>
      <dd className={cn("shrink-0 font-medium text-slate-800", muted && "font-normal text-slate-500")}>{value}</dd>
    </div>
  );
}
