"use client";

import {
  BadgeCheck,
  Box,
  Heart,
  Minus,
  PackageCheck,
  Plane,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Ship,
  Store,
  Truck,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { useCart, useSettings } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/data";
import { Label, Select } from "@/components/ui/fields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/data";
import { cn } from "@/lib/cn";
import { bdt, cny, kg, numberFmt } from "@/lib/format";
import { SHIPPING_RATES, estimateLandedCost } from "@/lib/pricing";
import type { Product, ShippingMode } from "@/lib/types";

export function ProductDetailClient({
  product,
  supplier,
}: {
  product: Product;
  supplier?: { name: string; city: string; platform: string; rating: number; onTimeRate: number } | null;
}) {
  const settings = useSettings();
  const { addItem, toggleWishlist, wishlist, shippingMode, setShippingMode } = useCart();
  const [imageIndex, setImageIndex] = React.useState(0);
  const [variantId, setVariantId] = React.useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = React.useState(product.moq);
  const [mode, setMode] = React.useState<ShippingMode>(shippingMode);
  const [outsideDhaka, setOutsideDhaka] = React.useState(false);
  const [insured, setInsured] = React.useState(false);

  const variant = product.variants.find((v) => v.id === variantId);
  const unitPrice = product.priceBdt + (variant?.priceDeltaBdt ?? 0);

  const cost = React.useMemo(
    () =>
      estimateLandedCost({
        costPriceCny: product.costPriceCny,
        quantity,
        weightGrams: product.weightGrams,
        cbm: product.cbm,
        mode,
        settings,
        dutyPct: product.dutyPct,
        serviceFeePct: product.serviceFeePct,
        insured,
        homeDelivery: true,
        outsideDhaka,
      }),
    [product, quantity, mode, settings, insured, outsideDhaka],
  );

  const wished = wishlist.includes(product.id);
  const platformSpread = Math.round(((unitPrice - product.costPriceCny * settings.cnyToBdt) / unitPrice) * 100);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images[0] ?? "",
        sku: product.sku,
        variant: variant?.value,
        unitPriceBdt: unitPrice,
        costPriceCny: product.costPriceCny,
        weightGrams: product.weightGrams,
        cbm: product.cbm,
        dutyPct: product.dutyPct,
        serviceFeePct: product.serviceFeePct,
        moq: product.moq,
        stock: product.stock,
      },
      quantity,
    );
    setShippingMode(mode);
    toast.success(`Added ${quantity} × ${variant?.value ?? "standard"} to cart`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      {/* gallery + details */}
      <div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="relative aspect-[4/3] bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[imageIndex]} alt={product.title} className="size-full object-cover" />
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.featured && <Badge variant="accent">Featured import</Badge>}
              {product.moq > 1 && <Badge variant="dark">MOQ {product.moq} pcs</Badge>}
            </div>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                "absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 backdrop-blur transition-colors",
                wished ? "text-rose-500" : "text-slate-400 hover:text-rose-500",
              )}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("size-5", wished && "fill-rose-500")} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 p-3">
            {product.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setImageIndex(i)}
                className={cn(
                  "overflow-hidden rounded-lg border-2 transition-colors",
                  i === imageIndex ? "border-primary" : "border-transparent hover:border-slate-200",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`${product.title} view ${i + 1}`} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Tabs defaultValue="specs">
            <TabsList>
              <TabsTrigger value="specs">Specification</TabsTrigger>
              <TabsTrigger value="duty">Duty & freight</TabsTrigger>
              <TabsTrigger value="import">Import notes</TabsTrigger>
            </TabsList>

            <TabsContent value="specs">
              <dl className="grid gap-x-8 gap-y-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
                <SpecRow label="Brand" value={product.brand} />
                <SpecRow label="Origin" value={product.originCountry} />
                <SpecRow label="SKU" value={product.sku} />
                <SpecRow label="HS code" value={product.hsCode} />
                <SpecRow label="Unit weight" value={kg(product.weightGrams)} />
                <SpecRow label="Volume" value={`${product.cbm.toFixed(4)} CBM`} />
                <SpecRow label="MOQ" value={`${product.moq} ${product.unit}`} />
                <SpecRow label="Stock at hub" value={`${product.stock} pcs`} />
                <SpecRow label="Lead time to CN warehouse" value={`${product.leadTimeDays} days`} />
                <SpecRow label="Supplier" value={supplier ? `${supplier.name} (${supplier.city})` : "Verified 1688 shop"} />
              </dl>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-900">Description</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="duty">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    <SpecTableRow label={`Customs duty (${product.dutyPct}%)`} value="Applied on assessable value (goods + freight share)" />
                    <SpecTableRow label={`VAT (${settings.vatPct}%)`} value="Applied on assessable value + duty" />
                    <SpecTableRow label={`AIT (${settings.aitPct}%)`} value="Advance income tax collected at import" />
                    <SpecTableRow label="Assessable value basis" value="Supplier invoice value, converted at our weekly CNY rate" />
                    <SpecTableRow label="Documentation" value="Bill of entry, commercial invoice, packing list, BIN/TIN where needed" />
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Typical duty for this category is {product.dutyPct}%. Machinery and solar categories attract 5% or less.
                Your invoice always shows the actual customs-assessed amount.
              </p>
            </TabsContent>

            <TabsContent value="import">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Store, title: "Sourcing", text: `We buy from ${supplier?.name ?? "a vetted 1688 shop"} at ${cny(product.costPriceCny)}/unit and share the supplier invoice with you.` },
                  { icon: ShieldCheck, title: "Quality check", text: "Photo and video inspection at our China warehouse before consolidation." },
                  { icon: Box, title: "Consolidation", text: `Combine with other orders — free storage for ${settings.warehouseStorageFreeDays} days.` },
                  { icon: Truck, title: "Delivery", text: `Dhaka delivery ${bdt(settings.homeDeliveryDhakaBdt)}, outside Dhaka ${bdt(settings.homeDeliveryOutsideBdt)}.` },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
                    <item.icon className="size-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* buy box */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Rating value={product.rating} count={product.reviewCount} />
            <span className="text-xs text-slate-400">· {product.soldCount} sold</span>
          </div>
          <h1 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900">{product.title}</h1>
          {supplier && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
              <BadgeCheck className="size-3.5 text-emerald-500" />
              {supplier.platform} · {supplier.city} · {numberFmt(supplier.onTimeRate, 1)}% on-time
            </p>
          )}

          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{bdt(unitPrice)}</span>
            {product.compareAtPriceBdt && (
              <span className="pb-1 text-sm text-slate-400 line-through">{bdt(product.compareAtPriceBdt)}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Supplier cost {cny(product.costPriceCny)} · our sourcing margin ≈ {platformSpread}% · no other markup
          </p>

          {product.variants.length > 0 && (
            <div className="mt-4">
              <Label className="mb-1.5 block">{product.variants[0].name}</Label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      v.id === variantId
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-600 hover:border-slate-300",
                    )}
                  >
                    {v.value}
                    {v.priceDeltaBdt > 0 && <span className="ml-1 text-slate-400">+{bdt(v.priceDeltaBdt)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-200">
              <button
                className="flex size-9 items-center justify-center text-slate-500 hover:text-slate-900"
                onClick={() => setQuantity((q) => Math.max(product.moq, q - 1))}
                aria-label="Decrease"
              >
                <Minus className="size-3.5" />
              </button>
              <input
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.moq, Number(e.target.value) || product.moq))}
                className="w-12 border-0 bg-transparent text-center text-sm font-medium focus:outline-none"
                inputMode="numeric"
              />
              <button
                className="flex size-9 items-center justify-center text-slate-500 hover:text-slate-900"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <div className="text-xs text-slate-500">
              MOQ {product.moq} · {kg(product.weightGrams * quantity)} total
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <Button variant="brand" size="lg" onClick={handleAdd} disabled={product.stock <= 0}>
              <ShoppingCart className="size-4" /> Add to cart · {bdt(unitPrice * quantity)}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/checkout">Order now with landed cost</Link>
            </Button>
          </div>

          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <PackageCheck className="size-3.5 text-emerald-500" /> {product.stock > 0 ? `${product.stock} pcs available` : "Out of stock"} ·
              ships in {product.leadTimeDays}–{product.leadTimeDays + 4} days
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-emerald-500" /> QC photo & video before shipping
            </p>
            <p className="flex items-center gap-2">
              <Ruler className="size-3.5 text-emerald-500" /> Volumetric weight counted for air freight
            </p>
          </div>
        </div>

        {/* landed cost estimator */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm font-semibold text-slate-900">Landed cost for {quantity} pcs</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {SHIPPING_RATES.slice(0, 2).map((rate) => (
              <button
                key={rate.mode}
                onClick={() => setMode(rate.mode)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                  mode === rate.mode ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600",
                )}
              >
                <Plane className="size-3.5" />
                <span>
                  {rate.label}
                  <span className="block text-[10px] text-slate-400">
                    {rate.transitDaysMin}–{rate.transitDaysMax} days
                  </span>
                </span>
              </button>
            ))}
            {SHIPPING_RATES.slice(2).map((rate) => (
              <button
                key={rate.mode}
                onClick={() => setMode(rate.mode)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                  mode === rate.mode ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600",
                )}
              >
                <Ship className="size-3.5" />
                <span>
                  {rate.label.split(" ")[1]}
                  <span className="block text-[10px] text-slate-400">
                    {rate.transitDaysMin}–{rate.transitDaysMax} days
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="size-3.5 rounded border-slate-300"
                checked={outsideDhaka}
                onChange={(e) => setOutsideDhaka(e.target.checked)}
              />
              Deliver outside Dhaka
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="size-3.5 rounded border-slate-300"
                checked={insured}
                onChange={(e) => setInsured(e.target.checked)}
              />
              Add cargo insurance ({settings.insurancePct}%)
            </label>
          </div>

          <dl className="mt-4 space-y-1.5 text-xs">
            <CostRow label="Goods + sourcing fee" value={bdt(unitPrice * quantity)} />
            <CostRow label={`Freight (${kg(cost.chargeableWeightGrams)} chargeable)`} value={bdt(cost.freightBdt)} />
            <CostRow label={`Duty ${product.dutyPct}%`} value={bdt(cost.dutyBdt)} />
            <CostRow label={`VAT ${settings.vatPct}% + AIT ${settings.aitPct}%`} value={bdt(cost.vatBdt + cost.aitBdt)} />
            {insured && <CostRow label="Insurance" value={bdt(cost.insuranceBdt)} />}
            <CostRow label="Delivery" value={bdt(cost.deliveryBdt)} />
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-slate-200 pt-3">
            <span className="text-sm font-semibold text-slate-700">Total landed</span>
            <span className="text-xl font-bold text-primary">{bdt(cost.totalBdt)}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {bdt(cost.perUnitBdt)} per piece · estimate excludes storage beyond {settings.warehouseStorageFreeDays} days
          </p>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-slate-100 pb-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function SpecTableRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="w-1/3 bg-slate-50/60 px-4 py-3 align-top text-xs font-medium text-slate-600">{label}</td>
      <td className="px-4 py-3 text-sm text-slate-700">{value}</td>
    </tr>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
