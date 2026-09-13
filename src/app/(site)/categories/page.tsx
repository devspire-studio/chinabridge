import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import { getCategoriesWithCounts } from "@/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All categories",
  description: "16 import categories from China to Bangladesh — duty and service fee shown per category.",
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Import categories</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Every category carries its own NBR duty rate and sourcing service fee. Filtering a category shows the exact
        numbers before you add anything to your cart.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={category.image} alt={category.name} className="size-20 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-primary">{category.name}</p>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{category.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant={category.dutyPct <= 5 ? "success" : category.dutyPct <= 15 ? "info" : "warning"}>
                  duty {category.dutyPct}%
                </Badge>
                <Badge variant="secondary">fee {category.serviceFeePct}%</Badge>
                <Badge variant="muted">{category.productCount ?? 0} items</Badge>
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Browse <ArrowRight className="size-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
