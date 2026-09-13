"use client";

import { CheckCircle2, FileText, Link2, Loader2, ShieldCheck, Timer, Upload } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useSettings } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/data";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import { authClient } from "@/lib/auth-client";

function detectPlatform(url: string) {
  if (/1688\./i.test(url)) return "1688";
  if (/taobao\.|tmall\./i.test(url)) return "Taobao";
  if (/alibaba\./i.test(url)) return "Alibaba";
  if (/yangkeduo|pinduoduo|pdd/i.test(url)) return "PDD";
  return "Other";
}

export default function QuotePage() {
  const settings = useSettings();
  const params = useSearchParams();
  const { data: session } = authClient.useSession();
  const user = session?.user as { name?: string; email?: string; phone?: string } | undefined;

  const [form, setForm] = React.useState({
    customerName: "",
    phone: "",
    email: "",
    sourceUrl: "",
    productName: "",
    quantity: 50,
    targetPriceBdt: "",
    notes: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ ref: string } | null>(null);

  React.useEffect(() => {
    const link = params.get("link");
    if (link) setForm((f) => ({ ...f, sourceUrl: link }));
  }, [params]);

  React.useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customerName: f.customerName || user.name || "",
        email: f.email || user.email || "",
        phone: f.phone || user.phone || "",
      }));
    }
  }, [user]);

  const platform = detectPlatform(form.sourceUrl);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sourcePlatform: platform,
          quantity: Number(form.quantity),
          targetPriceBdt: form.targetPriceBdt ? Number(form.targetPriceBdt) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ ref: data.ref });
      toast.success(`Quote request ${data.ref} received`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a quote" }]} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <Badge variant="accent">
            <Timer className="size-3" /> 2 working hour response
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Paste any 1688, Taobao or Alibaba link — we quote the landed cost
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Our procurement desk verifies the supplier (licence, repurchase rate, response time), negotiates for your
            quantity and replies with unit price, freight options, duty and delivery. No account needed.
          </p>

          {result ? (
            <Card className="mt-6 p-6">
              <CheckCircle2 className="size-8 text-emerald-500" />
              <p className="mt-3 text-lg font-semibold text-slate-900">Quote request {result.ref} received</p>
              <p className="mt-1 text-sm text-slate-500">
                An agent is reviewing the supplier now. You will get a WhatsApp/SMS with the landed-cost breakdown, and the
                quote is stored in your account where you can accept it in one click.
              </p>
              <div className="mt-5 grid gap-2 sm:flex">
                <Button variant="brand" asChild>
                  <Link href="/shop">Browse the catalogue meanwhile</Link>
                </Button>
                <Button variant="outline" onClick={() => setResult(null)}>
                  Submit another link
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="mt-6 p-6">
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" required>
                  <Input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Rakib Hasan"
                    required
                  />
                </Field>
                <Field label="Mobile number" required>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </Field>
                <Field label="Email (optional)" className="sm:col-span-2">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field
                  label="Supplier link"
                  required
                  className="sm:col-span-2"
                  hint={
                    form.sourceUrl
                      ? `Detected platform: ${platform}`
                      : "Paste a full product URL — for example https://detail.1688.com/offer/623451879012.html"
                  }
                >
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={form.sourceUrl}
                      onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                      placeholder="https://detail.1688.com/offer/…"
                      className="pl-9"
                      required
                    />
                  </div>
                </Field>
                <Field label="Product name / description" required className="sm:col-span-2">
                  <Input
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    placeholder="Stainless steel water bottle 750ml, matte finish"
                    required
                  />
                </Field>
                <Field label="Quantity (pcs)">
                  <Input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Target price ৳ / unit (optional)">
                  <Input
                    type="number"
                    value={form.targetPriceBdt}
                    onChange={(e) => setForm({ ...form, targetPriceBdt: e.target.value })}
                    placeholder="1200"
                  />
                </Field>
                <Field label="Anything else we should know?" className="sm:col-span-2">
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Colour/size breakdown, custom logo, packaging needs, deadline, existing supplier contact."
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="brand" size="lg" loading={loading} className="w-full sm:w-auto">
                    <FileText className="size-4" /> Send to sourcing desk
                  </Button>
                  <p className="mt-2 text-[11px] text-slate-400">
                    By submitting you agree we may contact you on WhatsApp, phone or email about this request.
                  </p>
                </div>
              </form>
            </Card>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Supplier verification", text: "Licence check, 30-day repurchase rate, factory vs trading company." },
              { icon: Timer, title: "Negotiation", text: "We push for MOQ reduction and unit price cuts at your quantity." },
              { icon: Upload, title: "Sample option", text: "Ask for a sample or video call before bulk payment — we arrange it." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <item.icon className="size-5 text-primary" />
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">What your quote includes</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              {[
                "Supplier unit price in ¥ and ৳ at today's rate",
                "Our sourcing service fee (category based)",
                "Air express, air standard and sea options with transit times",
                "Customs duty, VAT and AIT estimates",
                "Delivery cost to your district",
                "Required documents and payment schedule",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Prefer to talk?</p>
            <dl className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Phone</dt>
                <dd className="font-medium">{settings.supportPhone}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Email</dt>
                <dd className="font-medium">{settings.supportEmail}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">WeChat</dt>
                <dd className="font-medium">{settings.whatsapp}</dd>
              </div>
            </dl>
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                Message on WhatsApp
              </a>
            </Button>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Already have an account?</p>
            <p className="mt-1 text-xs text-slate-500">
              Sign in and your quotes appear in your dashboard where you can accept and convert them into orders.
            </p>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" asChild>
              <Link href="/login">
                <Loader2 className="size-3.5" /> Sign in to track quotes
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
