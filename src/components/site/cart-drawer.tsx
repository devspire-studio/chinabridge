"use client";

import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import Link from "next/link";

import { useCart, useSettings } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/data";
import { Sheet, SheetContent } from "@/components/ui/overlays";
import { bdt, kg } from "@/lib/format";
import { SHIPPING_RATES } from "@/lib/pricing";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { items, updateQuantity, removeItem, pricing, shippingMode, count } = useCart();
  const settings = useSettings();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-base font-semibold text-slate-900">Your import cart</p>
            <p className="text-xs text-slate-500">
              {count} {count === 1 ? "item" : "items"} · {kg(pricing.weightGrams)} · {pricing.cbm.toFixed(3)} CBM
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {settings.cnyToBdt.toFixed(2)} ৳/CNY
          </span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<ShoppingBag className="size-5" />}
              title="Your cart is empty"
              description="Browse verified 1688 & Taobao products and add them with the landed cost already shown."
              action={
                <Button variant="brand" asChild onClick={() => onOpenChange(false)}>
                  <Link href="/shop">Browse products</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variant}`} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="size-16 shrink-0 rounded-lg border border-slate-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.variant ? `${item.variant} · ` : ""}
                        {kg(item.weightGrams)} / pc
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-lg border border-slate-200">
                          <button
                            className="flex size-7 items-center justify-center text-slate-500 hover:text-slate-900"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            className="flex size-7 items-center justify-center text-slate-500 hover:text-slate-900"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{bdt(item.unitPriceBdt * item.quantity)}</p>
                          <button
                            onClick={() => removeItem(item.productId, item.variant)}
                            className="mt-0.5 inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600"
                          >
                            <Trash2 className="size-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Truck className="size-3.5" /> Estimate with
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SHIPPING_RATES.slice(0, 2).map((rate) => (
                    <div key={rate.mode} className="flex items-center justify-between text-xs text-slate-600">
                      <span>{rate.label}</span>
                      <span className="font-medium">{bdt(rate.rateBdt)}/{rate.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Products</dt>
                  <dd className="font-medium text-slate-800">{bdt(pricing.subtotalBdt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Est. freight ({shippingMode.replace("_", " ")})</dt>
                  <dd className="font-medium text-slate-800">{bdt(pricing.freightBdt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Duty + VAT (est.)</dt>
                  <dd className="font-medium text-slate-800">{bdt(pricing.dutyBdt + pricing.vatBdt)}</dd>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-base">
                  <dt className="font-semibold text-slate-900">Landed total</dt>
                  <dd className="font-bold text-primary">{bdt(pricing.totalBdt)}</dd>
                </div>
              </dl>
              <div className="mt-4 grid gap-2">
                <Button variant="brand" size="lg" asChild onClick={() => onOpenChange(false)}>
                  <Link href="/checkout">Checkout · {bdt(pricing.totalBdt)}</Link>
                </Button>
                <Button variant="outline" asChild onClick={() => onOpenChange(false)}>
                  <Link href="/cart">View full cart</Link>
                </Button>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                Duty & VAT are estimates — final assessment is shared before customs filing.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
