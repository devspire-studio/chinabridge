"use client";

import { Clock, Mail, MapPin, MessageCircle, Phone, Send, Truck } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { useSettings } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/data";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";

export default function ContactPage() {
  const settings = useSettings();
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    category: "other",
    orderNo: "",
    message: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [ticketRef, setTicketRef] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTicketRef(data.ref);
      toast.success(`Ticket ${data.ref} created`, { description: "Our support desk replies within a few hours." });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Talk to ChinaBridge BD</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Order updates, customs documents, wholesale credit, supplier verification — pick a channel or open a support
            ticket and we will get back within a few working hours.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Phone, label: "Bangladesh desk", value: settings.supportPhone, hint: "9am–10pm, 7 days", href: `tel:${settings.supportPhone.replace(/\s/g, "")}` },
              { icon: MessageCircle, label: "China desk (WeChat/WhatsApp)", value: settings.whatsapp, hint: "Supplier & freight questions", href: `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}` },
              { icon: Mail, label: "Email", value: settings.supportEmail, hint: "Documents & invoices", href: `mailto:${settings.supportEmail}` },
              { icon: MapPin, label: "Head office", value: settings.address, hint: "Hub pickup: Tejgaon, Dhaka" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <item.icon className="size-5 text-primary" />
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="mt-0.5 block text-sm text-primary hover:underline">
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-0.5 text-sm text-slate-600">{item.value}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
              </div>
            ))}
          </div>

          {ticketRef ? (
            <Card className="mt-8 p-6">
              <Badge variant="success">Ticket {ticketRef} created</Badge>
              <p className="mt-3 text-lg font-semibold text-slate-900">Thanks — we have your message</p>
              <p className="mt-1 text-sm text-slate-500">
                A support agent will reply by phone or email. Keep your ticket reference for follow-ups, or track an order
                directly if your question is about a shipment.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="brand" asChild>
                  <Link href="/track">
                    <Truck className="size-4" /> Track an order
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setTicketRef(null)}>
                  Send another message
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="mt-8 p-6">
              <p className="text-sm font-semibold text-slate-900">Send us a message</p>
              <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Your name" required>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </Field>
                <Field label="Mobile number" required>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" required />
                </Field>
                <Field label="Email (optional)">
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Order number (optional)">
                  <Input value={form.orderNo} onChange={(e) => setForm({ ...form, orderNo: e.target.value })} placeholder="CB-25042" />
                </Field>
                <Field label="Topic">
                  <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="shipping">Shipping & tracking</option>
                    <option value="payment">Payment & wallet</option>
                    <option value="product">Product or supplier</option>
                    <option value="refund">Refund or return</option>
                    <option value="other">Something else</option>
                  </Select>
                </Field>
                <Field label="Subject" required>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Where is my consignment?" required />
                </Field>
                <Field label="Message" required className="sm:col-span-2">
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Share as much detail as you can — order number, supplier link, dates, screenshots."
                    className="min-h-[140px]"
                    required
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="brand" loading={loading}>
                    <Send className="size-4" /> Submit ticket
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Clock className="size-4 text-primary" /> Response times
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex justify-between">
                <span>WhatsApp / phone</span>
                <span className="font-medium">~8 minutes</span>
              </li>
              <li className="flex justify-between">
                <span>Support tickets</span>
                <span className="font-medium">Under 4 hours</span>
              </li>
              <li className="flex justify-between">
                <span>Quote requests</span>
                <span className="font-medium">Under 2 hours</span>
              </li>
              <li className="flex justify-between">
                <span>Customs documents</span>
                <span className="font-medium">Same working day</span>
              </li>
            </ul>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Common requests</p>
            <div className="mt-3 grid gap-2">
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <Link href="/quote">Get a landed-cost quote</Link>
              </Button>
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <Link href="/track">Track an order</Link>
              </Button>
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <Link href="/account">Open my account</Link>
              </Button>
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <Link href="/faq">Read the FAQ</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Wholesale & B2B</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Importing regularly? Ask about our wholesale tier with consolidated invoicing, BIN/VAT handling and container
              programmes. Mention your monthly volume in the ticket.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
