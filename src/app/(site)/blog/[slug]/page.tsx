import { ArrowLeft, CalendarDays, Clock, Eye, Share2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/site/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/data";
import { numberFmt, shortDate } from "@/lib/format";
import { getPostBySlug, getRelatedPosts } from "@/server/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(slug, 3);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides", href: "/blog" }, { label: post.category }]} />

      <article className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Badge variant="secondary">{post.category}</Badge>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> {shortDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {post.readMinutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" /> {numberFmt(post.views)} views
            </span>
            <span>by {post.author}</span>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt={post.title} className="mt-6 h-64 w-full rounded-2xl border border-slate-200 object-cover sm:h-80" />

          <div className="mt-8">
            <Markdown content={post.body} />
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="muted">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Want this applied to your next import?</p>
              <p className="text-xs text-slate-500">Send us a supplier link and we will run the numbers for you.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="brand" size="sm" asChild>
                <Link href="/quote">Request a quote</Link>
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="size-3.5" /> Share
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">More guides</p>
            <ul className="mt-3 space-y-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={`/blog/${item.slug}`} className="group block">
                    <span className="line-clamp-2 text-sm font-medium text-slate-700 group-hover:text-primary">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {item.category} · {item.readMinutes} min
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="mt-4 w-full justify-start" asChild>
              <Link href="/blog">
                <ArrowLeft className="size-3.5" /> All guides
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Import department</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Our sourcing, freight and customs teams publish what they learn from live consignments — freight rate moves,
              NBR circulars and supplier behaviour.
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link href="/contact">Talk to a specialist</Link>
            </Button>
          </div>
        </aside>
      </article>
    </div>
  );
}
