"use client";

import { SlidersHorizontal, Star, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select } from "@/components/ui/fields";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/overlays";
import { cn } from "@/lib/cn";
import { bdt } from "@/lib/format";
import type { Category } from "@/lib/types";

const TAGS = ["hot", "wholesale", "reseller", "budget", "gift", "industrial"];

export function ShopFilters({ categories, brands, total }: { categories: Category[]; brands: string[]; total: number }) {
  const router = useRouter();
  const params = useSearchParams();

  const current = React.useMemo(() => {
    const get = (key: string) => params.get(key) ?? "";
    return {
      q: get("q"),
      category: get("category"),
      brand: get("brand"),
      minPrice: get("minPrice"),
      maxPrice: get("maxPrice"),
      tags: get("tags") ? get("tags")!.split(",") : [],
      sort: get("sort") || "relevance",
      inStock: get("inStock") === "1",
      featured: get("featured") === "1",
    };
  }, [params]);

  function apply(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    router.push(`/shop?${next.toString()}`);
  }

  const activeCount =
    (current.category ? 1 : 0) +
    (current.brand ? 1 : 0) +
    (current.minPrice ? 1 : 0) +
    (current.maxPrice ? 1 : 0) +
    current.tags.length +
    (current.inStock ? 1 : 0) +
    (current.featured ? 1 : 0);

  const panel = (
    <div className="space-y-6 py-4">
      <div>
        <Label className="mb-2 block px-4">Category</Label>
        <div className="max-h-64 space-y-1 overflow-y-auto px-4">
          <button
            onClick={() => apply({ category: null })}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm",
              !current.category ? "bg-primary/10 font-medium text-primary" : "text-slate-600 hover:bg-slate-50",
            )}
          >
            All categories <span className="text-xs text-slate-400">{total}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => apply({ category: c.slug })}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm",
                current.category === c.slug ? "bg-primary/10 font-medium text-primary" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <span className="truncate">
                {c.icon} {c.name}
              </span>
              <span className="text-xs text-slate-400">{c.productCount ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <Label className="mb-2 block">Price range (৳)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={current.minPrice}
            onBlur={(e) => apply({ minPrice: e.target.value })}
            className="h-9"
          />
          <span className="text-slate-400">–</span>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={current.maxPrice}
            onBlur={(e) => apply({ maxPrice: e.target.value })}
            className="h-9"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            [0, 1000],
            [1000, 5000],
            [5000, 20000],
            [20000, 100000],
          ].map(([min, max]) => (
            <button
              key={`${min}-${max}`}
              onClick={() => apply({ minPrice: String(min), maxPrice: String(max) })}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-primary hover:text-primary"
            >
              {bdt(min, { compact: true })}–{bdt(max, { compact: true })}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <Label className="mb-2 block">Brand</Label>
        <Select value={current.brand} onChange={(e) => apply({ brand: e.target.value })} className="h-9">
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </Select>
      </div>

      <div className="px-4">
        <Label className="mb-2 block">Tags</Label>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => {
            const active = current.tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => {
                  const next = active ? current.tags.filter((t) => t !== tag) : [...current.tags, tag];
                  apply({ tags: next.join(",") });
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs capitalize transition-colors",
                  active ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600 hover:border-slate-300",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox checked={current.inStock} onCheckedChange={(v) => apply({ inStock: v ? "1" : null })} />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox checked={current.featured} onCheckedChange={(v) => apply({ featured: v ? "1" : null })} />
          Featured imports only
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Star className="size-3.5 text-amber-500" />
          <span className="text-xs text-slate-500">Ratings above 4.5 are shown with a badge</span>
        </label>
      </div>

      {activeCount > 0 && (
        <div className="px-4">
          <Button variant="outline" className="w-full" onClick={() => router.push(`/shop${current.q ? `?q=${current.q}` : ""}`)}>
            <X className="size-3.5" /> Clear {activeCount} filter{activeCount > 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-32 rounded-xl border border-slate-200 bg-white  ">{panel}</div>
      </aside>

      <div className="flex flex-1 items-center justify-between gap-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-3.5" /> Filters
              {activeCount > 0 && <Badge variant="default">{activeCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full overflow-y-auto p-5 pt-12">
            {panel}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
