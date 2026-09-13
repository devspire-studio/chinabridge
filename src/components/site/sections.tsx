"use client";

import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Boxes,
  Building2,
  Calculator,
  ClipboardCheck,
  Clock,
  FileText,
  Globe2,
  Layers,
  PackageCheck,
  Percent,
  Quote,
  Search,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { useSettings } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Rating } from "@/components/ui/data";
import { cn } from "@/lib/cn";
import { FAQ_ITEMS } from "@/lib/faq";
import { bdt, kg, numberFmt } from "@/lib/format";
import type { Banner, Category, Post } from "@/lib/types";

export { FAQ_ITEMS };


/* ---------------------------------- hero ---------------------------------- */

export function HeroSection({
  banners,
  stats,
}: {
  banners: Pick<Banner, "id" | "title" | "subtitle" | "image" | "ctaHref" | "ctaLabel">[];
  stats: { label: string; value: string }[];
}) {
  const [index, setIndex] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const active = banners[index] ?? banners[0];

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), 7000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-grid opacity-[0.35]" />
      <div className="absolute -left-24 top-10 size-80 rounded-full bg-primary-600/30 blur-3xl" />
      <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-accent/20 blur-3xl" />

      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div>
          <Badge variant="dark" className="border-white/15 bg-white/10 text-white">
            <Sparkles className="size-3 text-accent" /> Bangladesh&apos;s import & sourcing bridge to China
          </Badge>

          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {active?.title ?? "Import anything from 1688 & Taobao — we handle the rest"}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {active?.subtitle ??
              "Sourcing, quality inspection, air & sea freight, customs clearance and door delivery across Bangladesh."}
          </p>

          <form action="/shop" className="mt-7 flex max-w-xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search earbuds, air fryer, solar panel… or paste a 1688 link"
                className="h-12 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <Button type="submit" variant="accent" size="lg" className="shrink-0">
              Search products
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <Link href="/quote" className="inline-flex items-center gap-1.5 text-accent hover:text-amber-300">
              <FileText className="size-4" /> Paste a supplier link for a landed-cost quote
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="size-4 text-slate-500" /> Air 5–7 days · Sea 25–35 days
            </span>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</dt>
                <dd className="mt-1 text-xl font-bold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-2">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                onClick={() => setIndex(i)}
                aria-label={`Show slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-10 bg-accent" : "w-5 bg-white/25 hover:bg-white/40",
                )}
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Live landed-cost preview</p>
              <Badge variant="dark" className="border-white/15 bg-white/10 text-white">
                <Percent className="size-3 text-accent" /> Updated weekly
              </Badge>
            </div>
            <LandedCostWidget />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "QC before shipping" },
              { icon: Banknote, label: "bKash / Nagad / bank" },
              { icon: Building2, label: "Trade licensed" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center text-[11px] text-slate-300"
              >
                <item.icon className="mx-auto mb-1.5 size-4 text-accent" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LandedCostWidget() {
  const settings = useSettings();
  const rows = [
    { label: "Sneakers lot (6 pcs, 5.4 kg)", air: 13500, sea: 11200 },
    { label: "ANC earbuds (10 pcs, 1.8 kg)", air: 2150, sea: 2450 },
    { label: "Air fryer (1 pc, 6.5 kg)", air: 9800, sea: 6150 },
  ];
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-left text-xs">
        <thead className="bg-white/[0.06] text-slate-300">
          <tr>
            <th className="px-3 py-2 font-medium">Product</th>
            <th className="px-3 py-2 font-medium">Air / unit</th>
            <th className="px-3 py-2 font-medium">Sea / unit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-3 py-2.5 text-slate-300">{row.label}</td>
              <td className="px-3 py-2.5 font-semibold text-white">{bdt(row.air)}</td>
              <td className="px-3 py-2.5 font-semibold text-emerald-300">{bdt(row.sea)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between bg-white/[0.04] px-3 py-2 text-[11px] text-slate-400">
        <span>Service fee {settings.serviceFeePct}% · VAT {settings.vatPct}% · AIT {settings.aitPct}% included</span>
        <Link href="/shipping-calculator" className="text-accent hover:text-amber-300">
          Calculate mine →
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------- trust strip ------------------------------ */

export function TrustStrip() {
  const items = [
    { icon: BadgeCheck, title: "Vetted suppliers", text: "1688 / Taobao shops screened for repurchase rate & licence" },
    { icon: ClipboardCheck, title: "Photo & video QC", text: "Inspection report shared before anything ships" },
    { icon: Warehouse, title: "Free 15-day storage", text: "Consolidate multiple orders into one shipment" },
    { icon: PackageCheck, title: "Door delivery in BD", text: "Pathao, Steadfast, RedX and Sundarban coverage" },
  ];
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ section header ----------------------------- */

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  center,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", center && "sm:flex-col sm:items-center")}>
      <div className={cn("max-w-2xl", center && "text-center")}>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ category grid ----------------------------- */

export function CategoryGrid({ categories, limit }: { categories: Category[]; limit?: number }) {
  const list = limit ? categories.slice(0, limit) : categories;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {list.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-2xl">
            {category.icon}
          </span>
          <span className="text-xs font-semibold leading-tight text-slate-800 group-hover:text-primary">
            {category.name}
          </span>
          <span className="text-[11px] text-slate-400">{category.productCount ?? 0} items</span>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------- how it works ----------------------------- */

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1. Choose or paste a link",
      text: "Shop our verified catalogue, or paste any 1688, Taobao or Alibaba URL for a custom quote.",
    },
    {
      icon: Calculator,
      title: "2. See the full landed cost",
      text: "Goods, service fee, freight, customs duty, VAT, AIT and delivery — approved before we buy.",
    },
    {
      icon: Boxes,
      title: "3. We buy, QC & consolidate",
      text: "Payment to supplier, inspection photos/videos, then packing at our Guangzhou or Yiwu warehouse.",
    },
    {
      icon: Ship,
      title: "4. Freight, customs & delivery",
      text: "Air or sea to Dhaka, customs clearance with duty paid, then door delivery or hub pickup.",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <div key={step.title} className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <span className="absolute right-4 top-4 text-3xl font-black text-slate-100">{i + 1}</span>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <step.icon className="size-5" />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">{step.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{step.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- why us -------------------------------- */

export function WhyUs() {
  const features = [
    { icon: Globe2, title: "China-side presence", text: "Our own consolidation warehouses in Guangzhou and Yiwu with 29 staff." },
    { icon: Layers, title: "Consolidation = savings", text: "Combine orders from different suppliers into one air batch or CBM." },
    { icon: ShieldCheck, title: "Customs done right", text: "HS code classification, duty assessment and bond clearance in-house." },
    { icon: Clock, title: "Live order timeline", text: "10-stage tracking from supplier purchase to your doorstep." },
    { icon: Users, title: "Bangla + English support", text: "WhatsApp, phone and ticket desk during Bangladesh business hours." },
    { icon: Percent, title: "Transparent pricing", text: "Every taka itemised: no hidden duty surprises or storage surprises." },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <div key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-amber-700">
            <feature.icon className="size-5" />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">{feature.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{feature.text}</p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- duty table ------------------------------ */

export function DutyTable({ categories }: { categories: Category[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Customs duty</th>
              <th className="px-4 py-3">Service fee</th>
              <th className="px-4 py-3">VAT</th>
              <th className="px-4 py-3">AIT</th>
              <th className="px-4 py-3 text-right">Estimate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <span className="mr-2">{c.icon}</span>
                  {c.name}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.dutyPct <= 5 ? "success" : c.dutyPct <= 15 ? "info" : "warning"}>
                    {c.dutyPct}%
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.serviceFeePct}%</td>
                <td className="px-4 py-3 text-slate-600">15%</td>
                <td className="px-4 py-3 text-slate-600">3%</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/shipping-calculator?category=${c.slug}`} className="text-xs font-medium text-primary hover:underline">
                    Calculate →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500">
        Duty percentages are National Board of Revenue indicative rates for the HS chapters we import most. Your invoice
        always shows the actual assessed amount from the customs bill of entry.
      </p>
    </div>
  );
}

/* ------------------------------- testimonials ----------------------------- */

export function Testimonials({
  items,
}: {
  items: { id: string; customerName: string; rating: number; body: string; title: string }[];
}) {
  if (!items.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 6).map((review) => (
        <figure key={review.id} className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <Quote className="size-5 text-primary/30" />
          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">“{review.body}”</blockquote>
          <figcaption className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-800">{review.customerName}</span>
            <Rating value={review.rating} size={12} />
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ------------------------------ blog preview ------------------------------ */

export function BlogPreview({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {posts.slice(0, 3).map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt={post.title} className="h-40 w-full object-cover" loading="lazy" />
          <div className="p-4">
            <Badge variant="secondary">{post.category}</Badge>
            <p className="mt-3 text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary">{post.title}</p>
            <p className="mt-2 line-clamp-2 text-xs text-slate-500">{post.excerpt}</p>
            <p className="mt-3 text-[11px] text-slate-400">
              {post.author} · {post.readMinutes} min read
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* --------------------------------- CTA band -------------------------------- */

export function CtaBand({ categories }: { categories: Category[] }) {
  const settings = useSettings();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-6 py-10 text-white sm:px-10">
      <div className="absolute -right-10 -top-10 size-52 rounded-full bg-white/10 blur-2xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Have a supplier link? Get the landed cost in 2 working hours.
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-primary-50">
            Send any 1688, Taobao, Alibaba or factory link — our procurement desk replies with unit price, freight options
            (air/sea), duty and delivery for {bdt(settings.freeShippingThresholdBdt)}+ orders.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.slice(0, 6).map((c) => (
              <span key={c.id} className="rounded-full bg-white/10 px-3 py-1 text-xs text-primary-50">
                {c.icon} {c.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button variant="accent" size="lg" asChild className="flex-1">
            <Link href="/quote">
              <FileText className="size-4" /> Submit a supplier link
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="flex-1 border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Link href="/shop">
              <ShoppingBag className="size-4" /> Browse ready catalogue
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */

export function FaqSection({ items = FAQ_ITEMS, limit }: { items?: { q: string; a: string }[]; limit?: number }) {
  return (
    <Accordion type="single" collapsible className="rounded-xl border border-slate-200 bg-white px-5">
      {(limit ? items.slice(0, limit) : items).map((item, i) => (
        <AccordionItem key={item.q} value={`faq-${i}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function StatsBand({ stats }: { stats: { label: string; value: string; hint?: string }[] }) {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center sm:text-left">
          <p className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
          {stat.hint && <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export { kg, numberFmt };
