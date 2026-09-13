import { ArrowRight, Flame, Sparkles, Star, Truck } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/site/product-card";
import {
  BlogPreview,
  CategoryGrid,
  CtaBand,
  DutyTable,
  FaqSection,
  HeroSection,
  HowItWorks,
  SectionHeader,
  StatsBand,
  Testimonials,
  TrustStrip,
  WhyUs,
} from "@/components/site/sections";
import { ShippingCalculator } from "@/components/site/shipping-calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bdt, numberFmt } from "@/lib/format";
import {
  getBanners,
  getCategoriesWithCounts,
  getFeaturedProducts,
  getGroupBuys,
  getPosts,
  getTrendingProducts,
  listReviews,
} from "@/server/queries";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, trending, banners, posts, reviews, groupBuys, settings] = await Promise.all([
    getCategoriesWithCounts(),
    getFeaturedProducts(12),
    getTrendingProducts(8),
    getBanners("hero"),
    getPosts(3),
    listReviews({ status: "published" }),
    getGroupBuys(),
    getSettings(),
  ]);

  const publishedReviews = reviews.filter((r) => r.body.length > 40);

  return (
    <div className="space-y-16 pb-8">
      <HeroSection
        banners={banners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          image: b.image,
          ctaHref: b.ctaHref,
          ctaLabel: b.ctaLabel,
        }))}
        stats={[
          { label: "Consignments cleared", value: "12,400+" },
          { label: "Active importers", value: "3,180" },
          { label: "China hub capacity", value: "1,500 CBM" },
          { label: "Avg. air transit", value: "5–7 days" },
        ]}
      />

      <TrustStrip />

      {/* categories */}
      <section className="container-x">
        <SectionHeader
          eyebrow="16 categories"
          title="Shop by category"
          description="Everything Bangladeshis import most — from mobile accessories and gadgets to machinery, solar and packaging."
          action={
            <Button variant="outline" asChild>
              <Link href="/categories">
                All categories <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-6">
          <CategoryGrid categories={categories} limit={12} />
        </div>
      </section>

      {/* featured products */}
      <section className="container-x">
        <SectionHeader
          eyebrow="Ready to import"
          title="Featured products with landed cost shown"
          description="Every price includes our sourcing fee — the calculator adds freight, duty and VAT before you commit."
          action={
            <Button variant="outline" asChild>
              <Link href="/shop?sort=popular">
                Browse all products <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* calculator */}
      <section className="container-x">
        <SectionHeader
          eyebrow="No hidden charges"
          title="Know the total before you pay"
          description="Air freight is charged on chargeable weight (actual vs volumetric), sea on CBM. Duty follows the HS code, then VAT and AIT apply."
        />
        <div className="mt-6">
          <ShippingCalculator categories={categories} />
        </div>
      </section>

      {/* group deals */}
      <section className="container-x">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <SectionHeader
            eyebrow="Save up to 22%"
            title="Group deals — buy together, pay wholesale"
            description="Join other importers on the same SKU and unlock factory pricing once the group fills up."
            action={
              <Button variant="accent" asChild>
                <Link href="/group-buy">
                  <Sparkles className="size-4" /> See live deals
                </Link>
              </Button>
            }
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupBuys.slice(0, 3).map((deal) => {
              const progress = Math.min(100, Math.round((deal.joined / deal.minMembers) * 100));
              const saved = deal.unitPriceBdt - deal.groupPriceBdt;
              return (
                <Link
                  key={deal.id}
                  href={`/group-buy#${deal.slug}`}
                  className="group rounded-xl border border-slate-200 p-4 transition-all hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={deal.image} alt={deal.title} className="size-16 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium text-slate-800 group-hover:text-primary">{deal.title}</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-base font-bold text-primary">{bdt(deal.groupPriceBdt)}</span>
                        <span className="text-xs text-slate-400 line-through">{bdt(deal.unitPriceBdt)}</span>
                        <Badge variant="success">save {bdt(saved)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {deal.joined}/{deal.minMembers} joined · closes {new Date(deal.expiresAt).toLocaleDateString("en-GB")}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* trending */}
      <section className="container-x">
        <SectionHeader
          eyebrow="Most ordered"
          title="Trending this month"
          description="What Bangladeshi importers are actually buying — sorted by units shipped."
          action={
            <Button variant="outline" asChild>
              <Link href="/shop?sort=popular">
                <Flame className="size-4 text-rose-500" /> Popular now
              </Link>
            </Button>
          }
        />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {trending.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="container-x">
        <SectionHeader
          eyebrow="Process"
          title="From supplier link to your shop in 10 tracked steps"
          description="You always know where your money and your goods are — every milestone is visible on your order timeline."
          action={
            <Button variant="outline" asChild>
              <Link href="/how-it-works">
                Full process <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-6">
          <HowItWorks />
        </div>
      </section>

      {/* why us */}
      <section className="container-x">
        <SectionHeader eyebrow="Why ChinaBridge" title="Built for Bangladeshi importers" />
        <div className="mt-6">
          <WhyUs />
        </div>
      </section>

      {/* stats */}
      <section className="container-x">
        <StatsBand
          stats={[
            { label: "Orders fulfilled", value: "48,900+", hint: "since 2021" },
            { label: "On-time delivery", value: "96.4%", hint: "last 12 months" },
            { label: "Warehouse space", value: "1,500 CBM", hint: "Guangzhou + Yiwu" },
            {
              label: "Avg. savings vs local",
              value: `${numberFmt(38)}%`,
              hint: `service fee ${settings.serviceFeePct}% only`,
            },
          ]}
        />
      </section>

      {/* duty table */}
      <section className="container-x">
        <SectionHeader
          eyebrow="Compliance"
          title="Indicative duty, VAT & AIT by category"
          description="We classify your goods under the correct HS code — and show the customs bill of entry amount on your invoice."
        />
        <div className="mt-6">
          <DutyTable categories={categories} />
        </div>
      </section>

      {/* testimonials */}
      <section className="container-x">
        <SectionHeader
          eyebrow="Customer stories"
          title="Importers in Dhaka, Chattogram & Sylhet"
          action={
            <Link href="/reviews" className="text-sm font-medium text-primary hover:underline">
              Read all reviews
            </Link>
          }
        />
        <div className="mt-6">
          <Testimonials items={publishedReviews.slice(0, 6)} />
        </div>
      </section>

      {/* blog */}
      <section className="container-x">
        <SectionHeader
          eyebrow="Guides"
          title="Import smarter"
          description="Practical guides on sourcing, freight, duty and building a product business in Bangladesh."
          action={
            <Button variant="outline" asChild>
              <Link href="/blog">
                All guides <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-6">
          <BlogPreview posts={posts} />
        </div>
      </section>

      {/* faq */}
      <section className="container-x">
        <SectionHeader eyebrow="FAQ" title="Questions importers ask us every day" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <FaqSection limit={6} />
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <Badge variant="success">
              <Star className="size-3" /> 4.8 / 5 average rating
            </Badge>
            <p className="mt-3 text-sm font-semibold text-slate-900">Still unsure? Talk to a sourcing agent.</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Send your supplier link on WhatsApp and get a landed-cost quote within two working hours — freight options,
              duty and delivery included.
            </p>
            <div className="mt-4 grid gap-2">
              <Button variant="brand" asChild>
                <Link href="/quote">Request a quote</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/track">
                  <Truck className="size-4" /> Track an existing order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x">
        <CtaBand categories={categories} />
      </section>
    </div>
  );
}
