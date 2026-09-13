"use client";

import { ArrowRight, Minus, Plane, Plus, ShoppingBag, Ship, Tag, Trash2, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { useCart, useSettings } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/fields";
import { cn } from "@/lib/cn";
import { bdt, kg, numberFmt } from "@/lib/format";
import { SHIPPING_RATES } from "@/lib/pricing";
import type { ShippingMode } from "@/lib/types";

export default function CartPage() {
  const settings = useSettings();
  const {
    items,
    updateQuantity,
    removeItem,
    clear,
    pricing,
    shippingMode,
    setShippingMode,
    couponCode,
    applyCoupon,
    removeCoupon,
    discountBdt,
    hydrated,
  } = useCart();
  const [code, setCode] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  async function validateCoupon() {
    setChecking(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: pricing.subtotalBdt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      applyCoupon(data.code, data.discountBdt);
      toast.success(data.message);
      setCode("");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setChecking(false);
    }
  }

  if (!hydrated) {
    return <div className="container-x py-16 text-sm text-slate-400">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon={<ShoppingBag className="size-5" />}
          title="Your cart is empty"
          description="Add products from the catalogue — the landed cost updates live with freight, duty and VAT."
          action={
            <Button variant="brand" asChild>
              <Link href="/shop">Browse products</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your import cart</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} product{items.length > 1 ? "s" : ""} · {kg(pricing.weightGrams)} · {numberFmt(pricing.cbm, 4)} CBM
            chargeable
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear} className="text-rose-600 hover:bg-rose-50">
          <Trash2 className="size-3.5" /> Clear cart
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variant}`} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} className="size-24 shrink-0 rounded-lg border border-slate-200 object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-primary">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      SKU {item.sku}
                      {item.variant ? ` · ${item.variant}` : ""} · {kg(item.weightGrams)} / pc
                    </p>
                    {item.moq > 1 && <Badge variant="muted" className="mt-1.5">MOQ {item.moq}</Badge>}
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variant)}
                    className="text-slate-400 transition-colors hover:text-rose-500"
                    aria-label="Remove"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      className="flex size-8 items-center justify-center text-slate-500 hover:text-slate-900"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                      aria-label="Decrease"
                    >
                      <Minus className="size-3" />
                    </button>
                    <input
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 0, item.variant)}
                      className="w-12 border-0 bg-transparent text-center text-sm font-medium focus:outline-none"
                      inputMode="numeric"
                    />
                    <button
                      className="flex size-8 items-center justify-center text-slate-500 hover:text-slate-900"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                      aria-label="Increase"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{bdt(item.unitPriceBdt * item.quantity)}</p>
                    <p className="text-xs text-slate-400">{bdt(item.unitPriceBdt)} / pc</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Choose your shipping mode</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Air is charged on chargeable weight (actual vs volumetric), sea on CBM with a 0.5 CBM minimum.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {SHIPPING_RATES.map((rate) => {
                const preview = rate.mode === shippingMode ? pricing : null;
                return (
                  <button
                    key={rate.mode}
                    onClick={() => setShippingMode(rate.mode as ShippingMode)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      shippingMode === rate.mode ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <span className="mt-0.5 text-slate-500">
                      {rate.unit === "kg" ? <Plane className="size-4" /> : <Ship className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between text-sm font-medium text-slate-800">
                        {rate.label}
                        {preview && <span className="text-xs font-semibold text-primary">{bdt(preview.freightBdt)}</span>}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {bdt(rate.rateBdt)}/{rate.unit} · {rate.transitDaysMin}–{rate.transitDaysMax} days
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">{rate.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Landed cost summary</p>

            <div className="mt-4">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <span className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <Tag className="size-3.5" /> {couponCode} applied (−{bdt(discountBdt)})
                  </span>
                  <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900">
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="h-9 uppercase"
                  />
                  <Button variant="outline" size="sm" className="h-9" loading={checking} onClick={validateCoupon}>
                    Apply
                  </Button>
                </div>
              )}
              <p className="mt-1.5 text-[11px] text-slate-400">Try EID10, FIRST500 or WHOLESALE5</p>
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <Row label="Products" value={bdt(pricing.subtotalBdt)} />
              <Row label="Sourcing fee (included)" value={bdt(pricing.serviceFeeBdt)} muted />
              <Row label={`Freight · ${shippingMode.replace("_", " ")}`} value={bdt(pricing.freightBdt)} />
              <Row label="Customs duty" value={bdt(pricing.dutyBdt)} />
              <Row label={`VAT (${settings.vatPct}%)`} value={bdt(pricing.vatBdt)} />
              {discountBdt > 0 && <Row label="Coupon discount" value={`− ${bdt(discountBdt)}`} />}
              <Row label="Home delivery" value={bdt(settings.homeDeliveryDhakaBdt)} muted />
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-slate-200 pt-4">
              <span className="text-sm font-semibold text-slate-700">Landed total</span>
              <span className="text-2xl font-bold tracking-tight text-primary">{bdt(pricing.totalBdt)}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Advance required at checkout: {bdt((pricing.totalBdt * settings.advancePaymentPct) / 100)} (
              {settings.advancePaymentPct}%)
            </p>

            <Button variant="brand" size="lg" className="mt-4 w-full" asChild>
              <Link href="/checkout">
                Proceed to checkout <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="mt-2 w-full" asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>

            <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500">
              <p>• Duty and VAT are estimates — the final amount follows the customs bill of entry.</p>
              <p>• Weight is re-verified at our China warehouse before freight is booked.</p>
              <p>• Free consolidation for {settings.warehouseStorageFreeDays} days at Guangzhou/Yiwu.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={cn("text-slate-500", muted && "text-slate-400")}>{label}</dt>
      <dd className={cn("font-medium text-slate-800", muted && "font-normal text-slate-500")}>{value}</dd>
    </div>
  );
}
