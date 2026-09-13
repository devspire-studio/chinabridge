import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductCard } from "@/components/site/product-card";
import { Breadcrumbs, EmptyState } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import { getCategoryBySlug, listProducts } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} — import from China`,
    description: `${category.description} Duty ${category.dutyPct}%, sourcing fee ${category.serviceFeePct}%.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string; q?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const result = await listProducts({
    category: slug,
    sort: (sp.sort as "relevance") ?? "relevance",
    page: sp.page ? Number(sp.page) : 1,
    q: sp.q,
    perPage: 12,
  });

  return (
    <div className="container-x py-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/categories" }, { label: category.name }]}
      />

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_260px] sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-slate-50 text-2xl">{category.icon}</span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{category.name}</h1>
                <p className="text-sm text-slate-500">{category.nameBn}</p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">{category.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={category.dutyPct <= 5 ? "success" : category.dutyPct <= 15 ? "info" : "warning"}>
                Customs duty {category.dutyPct}%
              </Badge>
              <Badge variant="secondary">Service fee {category.serviceFeePct}%</Badge>
              <Badge variant="secondary">VAT 15% + AIT 3%</Badge>
              <Badge variant="muted">{result.total} products</Badge>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={category.image} alt={category.name} className="hidden size-full max-h-44 rounded-xl object-cover sm:block" />
        </div>
      </div>

      <div className="mt-8">
        {result.items.length === 0 ? (
          <EmptyState title="No products in this category yet" description="Submit a sourcing request and we will quote it within two working hours." />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {result.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
