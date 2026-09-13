import { Package, ShieldCheck, Star, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/site/product-card";
import { ProductDetailClient } from "@/components/site/product-detail";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, Rating } from "@/components/ui/data";
import { bdt, numberFmt, shortDate } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return { title: "Product not found" };
  return {
    title: data.product.title,
    description: data.product.description.slice(0, 160),
    openGraph: { images: data.product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) notFound();

  const { product, category, supplier, reviews } = data;
  const related = await getRelatedProducts(product.categoryId, product.id, 4);
  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const totalReviews = reviews.length || 1;

  return (
    <div className="container-x py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: product.title.slice(0, 40) },
        ]}
      />

      <div className="mt-6">
        <ProductDetailClient product={product} supplier={supplier} />
      </div>

      {/* trust row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Inspected in China", text: "Photo & video QC report shared before freight booking." },
          { icon: Truck, title: "Two freight options", text: "Air 5–7 days or sea 25–35 days, priced per shipment." },
          { icon: Package, title: "Consolidation free", text: "Holding at our Guangzhou hub is free for 15 days." },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <item.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* reviews */}
      <section className="mt-12">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Customer reviews</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-bold tracking-tight text-slate-900">{product.rating.toFixed(1)}</span>
              <div className="pb-1">
                <Rating value={product.rating} size={14} />
                <p className="text-xs text-slate-500">{product.reviewCount} verified reviews</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              {ratingBuckets.map((bucket) => (
                <div key={bucket.star} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex w-8 items-center gap-0.5">
                    {bucket.star}
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.round((bucket.count / totalReviews) * 100)}%` }}
                    />
                  </div>
                  <span className="w-6 text-right">{bucket.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Reviews are collected from delivered orders only. Imported goods review averages update within 24 hours.
            </div>
          </div>

          <div className="space-y-4">
            {reviews.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No published reviews yet for this product.
              </div>
            )}
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{review.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {review.customerName} · {shortDate(review.createdAt)}
                    </p>
                  </div>
                  <Rating value={review.rating} size={13} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.body}</p>
                {review.images.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {review.images.map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={img} src={img} alt="Review photo" className="size-16 rounded-lg border border-slate-200 object-cover" />
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <Badge variant="success">Verified import</Badge>
                  <span>{review.helpful} found this helpful</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">More from {category?.name}</h2>
            {category && (
              <Link href={`/category/${category.slug}`} className="text-sm font-medium text-primary hover:underline">
                View category
              </Link>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Import estimate summary</p>
        <p className="mt-1">
          {product.title} · supplier cost {bdt(product.costPriceCny * 17.4)} equivalent · listed at {bdt(product.priceBdt)} incl.
          sourcing fee · duty {product.dutyPct}% · VAT 15% · AIT 3% · weight {numberFmt(product.weightGrams)} g.
        </p>
      </div>
    </div>
  );
}
