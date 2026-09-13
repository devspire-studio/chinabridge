import { MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FaqSection } from "@/components/site/sections";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import { FAQ_GROUPS, FAQ_ITEMS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Sourcing, MOQ, freight, customs duty, payment terms, QC and refunds — answered for Bangladeshi importers.",
};

const GROUPS = FAQ_GROUPS;

export default function FaqPage() {
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <div className="mt-4 max-w-3xl">
        <Badge variant="secondary">
          <MessagesSquare className="size-3" /> {FAQ_ITEMS.length} answers
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Frequently asked questions</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          The questions our sourcing desk, finance team and customs broker answer every week. If yours is not here, message us
          on WhatsApp — we answer within minutes during business hours.
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-10">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">{group.title}</h2>
              <div className="mt-4">
                <FaqSection items={group.items} />
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">Still stuck?</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Send your supplier link or order number and the right specialist (sourcing, freight, customs or finance) will
              reply.
            </p>
            <div className="mt-3 grid gap-2">
              <Button variant="brand" size="sm" asChild>
                <Link href="/contact">Contact support</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/shipping-calculator">Shipping calculator</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/how-it-works">How it works</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
