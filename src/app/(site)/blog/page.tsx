import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/data";
import { shortDate } from "@/lib/format";
import { getPosts } from "@/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Import guides & sourcing playbooks",
  description: "Practical guides on importing from China to Bangladesh — freight, duty, QC and wholesale sourcing.",
};

export default async function BlogPage() {
  const posts = await getPosts(12);
  const [featured, ...rest] = posts;

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />

      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Import guides & playbooks</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Everything our procurement, freight and customs teams learn from live consignments — written for Bangladeshi
          importers, with real landed-cost numbers.
        </p>
      </div>

      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group mt-8 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-elevated lg:grid-cols-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={featured.cover} alt={featured.title} className="h-64 w-full object-cover lg:h-full" />
          <div className="p-6 lg:p-8">
            <Badge variant="accent">Latest guide</Badge>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-900 group-hover:text-primary">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{featured.excerpt}</p>
            <p className="mt-4 text-xs text-slate-400">
              {featured.author} · {shortDate(featured.publishedAt)} · {featured.readMinutes} min read
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Read the guide <ArrowRight className="size-4" />
            </span>
          </div>
        </Link>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt={post.title} className="h-44 w-full object-cover" loading="lazy" />
            <div className="p-5">
              <Badge variant="secondary">{post.category}</Badge>
              <p className="mt-3 text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary">{post.title}</p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">{post.excerpt}</p>
              <p className="mt-3 text-[11px] text-slate-400">
                {post.author} · {shortDate(post.publishedAt)} · {post.readMinutes} min
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
