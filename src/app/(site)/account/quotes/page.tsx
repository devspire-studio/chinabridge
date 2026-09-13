import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/data";
import { bdt, shortDate, titleCase } from "@/lib/format";
import { getSession } from "@/server/auth-helpers";
import { listQuotes } from "@/server/queries";

export const dynamic = "force-dynamic";

const TONE: Record<string, "default" | "info" | "success" | "warning" | "danger" | "muted"> = {
  new: "info",
  reviewing: "warning",
  quoted: "default",
  won: "success",
  lost: "danger",
};

export default async function AccountQuotesPage() {
  const session = await getSession();
  const quotes = (await listQuotes({})).filter(
    (q) => q.phone === session?.user.phone || q.customerName.toLowerCase() === session?.user.name.toLowerCase(),
  );

  if (quotes.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="size-5" />}
        title="No quote requests yet"
        description="Paste any 1688, Taobao or Alibaba link and our procurement desk replies with a landed-cost quote you can accept."
        action={
          <Button variant="brand" asChild>
            <Link href="/quote">Request a quote</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <p className="text-sm font-semibold text-slate-900">Quote requests</p>
        <p className="text-xs text-slate-500">
          {quotes.length} requests · quoted prices are valid for 7 days and include sourcing fee, freight and duty
          estimates.
        </p>
      </Card>

      {quotes.map((quote) => (
        <Card key={quote.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{quote.ref}</span>
                <Badge variant={TONE[quote.status] ?? "muted"}>{titleCase(quote.status)}</Badge>
                <Badge variant="secondary">{quote.sourcePlatform}</Badge>
              </div>
              <p className="mt-1.5 text-sm text-slate-700">{quote.productName}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Qty {quote.quantity} · requested {shortDate(quote.createdAt)} ·{" "}
                {quote.assignedTo ? `handled by ${quote.assignedTo}` : "awaiting assignment"}
              </p>
              <a
                href={quote.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Supplier link <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="text-right">
              {quote.quotedUnitPriceBdt ? (
                <>
                  <p className="text-lg font-bold text-slate-900">{bdt(quote.quotedUnitPriceBdt)}</p>
                  <p className="text-xs text-slate-500">per unit · total {bdt(quote.quotedTotalBdt ?? 0)}</p>
                  <Button variant="brand" size="sm" className="mt-2" asChild>
                    <Link href={`/quote?link=${encodeURIComponent(quote.sourceUrl)}`}>Accept & order</Link>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-slate-400">Quote in progress — usually within 2 working hours</p>
              )}
            </div>
          </div>
          {quote.targetPriceBdt && (
            <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
              Your target was {bdt(quote.targetPriceBdt)} / unit.
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
