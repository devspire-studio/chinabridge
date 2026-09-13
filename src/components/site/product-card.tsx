"use client";

import { Heart, Package, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { useCart, useSettings } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/data";
import { cn } from "@/lib/cn";
import { bdt, kg } from "@/lib/format";
import { estimateLandedCost, productLandedPreview } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const settings = useSettings();
  const { addItem, toggleWishlist, wishlist } = useCart();
  const [adding, setAdding] = React.useState(false);
  const landed = React.useMemo(
    () =>
      estimateLandedCost({
        costPriceCny: product.costPriceCny,
        quantity: 1,
        weightGrams: product.weightGrams,
        cbm: product.cbm,
        mode: "air_standard",
        settings,
        dutyPct: product.dutyPct,
        serviceFeePct: product.serviceFeePct,
      }),
    [product, settings],
  );
  const wished = wishlist.includes(product.id);
  const discount =
    product.compareAtPriceBdt && product.compareAtPriceBdt > product.priceBdt
      ? Math.round(((product.compareAtPriceBdt - product.priceBdt) / product.compareAtPriceBdt) * 100)
      : 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    setAdding(true);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images[0] ?? "",
        sku: product.sku,
        variant: product.variants[0]?.value,
        unitPriceBdt: product.priceBdt,
        costPriceCny: product.costPriceCny,
        weightGrams: product.weightGrams,
        cbm: product.cbm,
        dutyPct: product.dutyPct,
        serviceFeePct: product.serviceFeePct,
        moq: product.moq,
        stock: product.stock,
      },
      1,
    );
    toast.success("Added to cart", { description: product.title.slice(0, 60) });
    setTimeout(() => setAdding(false), 400);
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated",
        className,
      )}
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {discount > 0 && <Badge variant="hot">-{discount}%</Badge>}
          {product.featured && <Badge variant="accent">Featured</Badge>}
          {product.moq > 1 && <Badge variant="dark">MOQ {product.moq}</Badge>}
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        aria-label="Toggle wishlist"
        className={cn(
          "absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white/90 backdrop-blur transition-colors",
          wished ? "text-rose-500" : "text-slate-400 hover:text-rose-500",
        )}
      >
        <Heart className={cn("size-4", wished && "fill-rose-500")} />
      </button>

      <div className="flex flex-1 flex-col p-3.5">
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-primary">
          {product.title}
        </Link>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <Rating value={product.rating} count={product.reviewCount} size={12} />
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <TrendingUp className="size-3" /> {product.soldCount} sold
          </span>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-slate-900">{bdt(product.priceBdt)}</span>
            {product.compareAtPriceBdt && (
              <span className="text-xs text-slate-400 line-through">{bdt(product.compareAtPriceBdt)}</span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            ≈ <span className="font-semibold text-emerald-600">{bdt(landed.totalBdt)}</span> landed · {kg(product.weightGrams)} · air std
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
            <Package className="size-3" /> {product.originCountry} · {product.leadTimeDays} days to warehouse
          </p>
        </div>

        <div className="mt-auto pt-3">
          <Button
            variant={product.stock > 0 ? "brand" : "outline"}
            size="sm"
            className="w-full"
            disabled={product.stock <= 0}
            loading={adding}
            onClick={handleAdd}
          >
            {product.stock > 0 ? (
              <>
                <ShoppingCart className="size-3.5" /> Add to cart
              </>
            ) : (
              "Out of stock"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />
      <div className="space-y-2 p-3.5">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-8 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
