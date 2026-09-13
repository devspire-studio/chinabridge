import { Star } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, Rating, StatCard } from "@/components/ui/data";
import { numberFmt, shortDate } from "@/lib/format";
import { listReviews } from "@/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: "Verified import reviews from Bangladeshi importers — quality, delivery time and landed cost accuracy.",
};

export default async function ReviewsPage() {
  const reviews = await listReviews({ status: "published" });
  const avg = reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  const fiveStar = reviews.filter((r) => r.rating === 5).length;

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reviews" }]} />

      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Importer reviews</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Only buyers with delivered orders can review. We publish negative reviews too — they are how the service gets
          better.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Average rating" value={`${avg.toFixed(2)} / 5`} icon={<Star className="size-4" />} tone="warning" />
        <StatCard label="Published reviews" value={numberFmt(reviews.length)} hint="last 12 months" />
        <StatCard label="5-star share" value={`${Math.round((fiveStar / Math.max(1, reviews.length)) * 100)}%`} tone="success" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{review.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {review.customerName} · {shortDate(review.createdAt)}
                </p>
              </div>
              <Rating value={review.rating} size={13} />
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{review.body}</p>
            {review.images.length > 0 && (
              <div className="mt-3 flex gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={review.images[0]} alt="Review" className="size-16 rounded-lg border border-slate-200 object-cover" />
              </div>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <Badge variant="success">Verified import</Badge>
              <span className="truncate text-xs text-slate-400">{review.productTitle.slice(0, 34)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
