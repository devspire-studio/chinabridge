import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ProductCard } from "@/components/site/product-card";
import { ShopFilters } from "@/components/site/shop-filters";
import { ShopSortSelect } from "@/components/site/shop-sort-select";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, EmptyState, Pagination } from "@/components/ui/data";
import { getBrands, getCategoriesWithCounts, listProducts, type ProductFilters } from "@/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop imported products",
  description:
    "Browse verified 1688 & Taobao products with landed cost — filtering by category, price, brand and MOQ.",
};

interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  tags?: string;
  sort?: string;
  inStock?: string;
  featured?: string;
  page?: string;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const filters: ProductFilters = {
    q: sp.q,
    category: sp.category,
    brand: sp.brand,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    tags: sp.tags ? sp.tags.split(",") : undefined,
    sort: (sp.sort as ProductFilters["sort"]) ?? "relevance",
    inStock: sp.inStock === "1",
    featured: sp.featured === "1",
    page: sp.page ? Number(sp.page) : 1,
    perPage: 12,
  };

  const [result, categories, brands] = await Promise.all([
    listProducts(filters),
    getCategoriesWithCounts(),
    getBrands(),
  ]);

  const query = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {sp.q ? `Results for “${sp.q}”` : sp.category ? "Category products" : "All importable products"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {result.total} products · landed cost shown with every card · {categories.length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShopSortSelect />
          <Button variant="outline" size="sm" asChild>
            <Link href="/shipping-calculator">Shipping calculator</Link>
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link href="/quote">Paste a 1688 link</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <Suspense fallback={<div className="hidden w-64 shrink-0 lg:block" />}>
          <ShopFilters categories={categories} brands={brands} total={result.total} />
        </Suspense>

        <div className="min-w-0 flex-1">
          {result.items.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="size-5" />}
              title="No products matched those filters"
              description="Try widening the price range, clearing tags, or submit a quote request with your supplier link — we source far more than we list."
              action={
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/shop">Reset filters</Link>
                  </Button>
                  <Button variant="brand" asChild>
                    <Link href="/quote">Request sourcing</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                className="mt-8"
                buildHref={(page) => {
                  const next = new URLSearchParams(query);
                  next.set("page", String(page));
                  return `/shop?${next.toString()}`;
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
