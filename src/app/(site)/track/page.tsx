"use client";

import { Loader2, PackageSearch, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { OrderTimeline, type TimelineEvent } from "@/components/site/order-timeline";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, Breadcrumbs } from "@/components/ui/data";
import { Input } from "@/components/ui/fields";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, SHIPPING_MODE_LABEL, bdt, kg, shortDate } from "@/lib/format";
import type { Order } from "@/lib/types";

interface TrackResponse {
  order: {
    orderNo: string;
    status: string;
    paymentStatus: string;
    shippingMode: string;
    customerName: string;
    consignmentRef?: string;
    courier?: string;
    courierTrackingNo?: string;
    chinaTrackingNo?: string;
    etaAt?: string;
    createdAt: string;
    totalBdt: number;
    paidBdt: number;
    weightGrams: number;
    cbm: number;
  };
  items: Order["items"];
  events: TimelineEvent[];
  progress: { step: number; total: number; percent: number };
}

export default function TrackPage() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<TrackResponse | null>(null);

  const search = React.useCallback(async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(value.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Tracking failed");
      setData(json as TrackResponse);
    } catch (err) {
      setData(null);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initial) void search(initial);
  }, [initial, search]);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track order" }]} />

      <div className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Track your import</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your order number (CB-#####), consignment reference (CB-AIR-2418) or courier tracking number.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void search(query);
          }}
          className="mt-5 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="CB-25042"
              className="pl-9"
              aria-label="Order number"
            />
          </div>
          <Button type="submit" variant="brand" loading={loading}>
            Track
          </Button>
        </form>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
          <span>Try:</span>
          {["CB-25042", "CB-AIR-2418"].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setQuery(sample);
                void search(sample);
              }}
              className="font-medium text-primary hover:underline"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="size-4 animate-spin" /> Looking up your consignment…
          </div>
        )}

        {error && !loading && (
          <EmptyState
            icon={<PackageSearch className="size-5" />}
            title="We couldn't find that reference"
            description={error}
            action={
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/account/orders">Check my orders</Link>
                </Button>
                <Button variant="brand" asChild>
                  <Link href="/contact">Contact support</Link>
                </Button>
              </div>
            }
          />
        )}

        {data && !loading && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Order {data.order.orderNo}</p>
                  <p className="text-xs text-slate-500">
                    {data.order.customerName} · placed {shortDate(data.order.createdAt)} · ETA{" "}
                    {data.order.etaAt ? shortDate(data.order.etaAt) : "TBC"}
                  </p>
                </div>
                <StatusPill tone={ORDER_STATUS_TONE[data.order.status] ?? "muted"}>
                  {ORDER_STATUS_LABEL[data.order.status] ?? data.order.status}
                </StatusPill>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700" style={{ width: `${data.progress.percent}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Stage {data.progress.step + 1} of {data.progress.total} · {data.progress.percent}% complete
              </p>

              <div className="mt-6">
                <OrderTimeline events={data.events} currentStatus={data.order.status} />
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Truck className="size-4 text-primary" /> Shipment details
                </p>
                <dl className="mt-3 space-y-2 text-xs">
                  <DetailRow label="Freight mode" value={SHIPPING_MODE_LABEL[data.order.shippingMode] ?? data.order.shippingMode} />
                  {data.order.consignmentRef && <DetailRow label="Consignment" value={data.order.consignmentRef} />}
                  {data.order.courier && <DetailRow label="Courier" value={data.order.courier} />}
                  {data.order.courierTrackingNo && <DetailRow label="Courier tracking" value={data.order.courierTrackingNo} />}
                  {data.order.chinaTrackingNo && <DetailRow label="China tracking" value={data.order.chinaTrackingNo} />}
                  <DetailRow label="Weight" value={kg(data.order.weightGrams)} />
                  <DetailRow label="Volume" value={`${data.order.cbm.toFixed(4)} CBM`} />
                  <DetailRow label="Order value" value={bdt(data.order.totalBdt)} />
                  <DetailRow label="Paid" value={bdt(data.order.paidBdt)} />
                </dl>
              </Card>

              <Card className="p-5">
                <p className="text-sm font-semibold text-slate-900">Items</p>
                <ul className="mt-3 space-y-3">
                  {data.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} className="size-11 rounded-lg border border-slate-200 object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-xs font-medium text-slate-700">{item.title}</span>
                        <span className="text-[11px] text-slate-400">Qty {item.quantity}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link href={`/order/${data.order.orderNo}`}>Open full order page</Link>
                </Button>
              </Card>

              <Card className="p-5">
                <p className="text-sm font-semibold text-slate-900">Need help?</p>
                <p className="mt-1 text-xs text-slate-500">
                  Our support desk can share customs documents, warehouse photos and vessel/AWB updates on request.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">Avg. reply 8 minutes</Badge>
                  <Badge variant="success">WhatsApp available</Badge>
                </div>
                <Button variant="brand" size="sm" className="mt-3 w-full" asChild>
                  <Link href="/contact">Contact support</Link>
                </Button>
              </Card>
            </div>
          </div>
        )}

        {!data && !error && !loading && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Order number", text: "CB-25042 — shown on your invoice and confirmation SMS." },
              { title: "Consignment ref", text: "CB-AIR-2418 for air batches, CB-SEA-1180 for sea containers." },
              { title: "Courier tracking", text: "Pathao / Steadfast / RedX numbers once out for delivery." },
            ].map((tip) => (
              <div key={tip.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">{tip.title}</p>
                <p className="mt-1 text-xs text-slate-500">{tip.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-700">{value}</dd>
    </div>
  );
}
