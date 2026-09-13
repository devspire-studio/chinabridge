"use client";

import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Send, Youtube } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { useSettings } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
import type { Category } from "@/lib/types";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Categories", href: "/categories" },
      { label: "Group deals", href: "/group-buy" },
      { label: "Wholesale import", href: "/shop?tags=wholesale" },
      { label: "New arrivals", href: "/shop?sort=newest" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Paste a 1688 link", href: "/quote" },
      { label: "Shipping calculator", href: "/shipping-calculator" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Supplier sourcing", href: "/how-it-works#sourcing" },
      { label: "Quality inspection", href: "/how-it-works#qc" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track your order", href: "/track" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact us", href: "/contact" },
      { label: "Refund policy", href: "/refund-policy" },
      { label: "Terms & privacy", href: "/terms" },
    ],
  },
];

export function SiteFooter({ categories }: { categories: Category[] }) {
  const settings = useSettings();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("You're subscribed! Sourcing deals land in your inbox weekly.");
      setEmail("");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-lg font-black text-white">
                C
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[15px] font-extrabold tracking-tight text-white">ChinaBridge</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Bangladesh</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{settings.brandTagline}</p>
            <div className="mt-5 space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {settings.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-accent" />
                <a href={`tel:${settings.supportPhone}`} className="hover:text-white">
                  {settings.supportPhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-accent" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-white">
                  {settings.supportEmail}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="size-4 shrink-0 text-accent" /> WeChat / WhatsApp {settings.whatsapp}
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <span
                  key={i}
                  className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-white">{column.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-slate-400 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-white">Top import categories</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.slice(0, 10).map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Weekly sourcing deals</p>
            <form onSubmit={subscribe} className="mt-3 flex gap-2">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              />
              <Button type="submit" variant="accent" size="icon" loading={loading} aria-label="Subscribe">
                <Send className="size-4" />
              </Button>
            </form>
            <p className="mt-2 text-xs text-slate-500">New supplier drops, freight rate changes and duty updates.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-4 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} ChinaBridge BD. All rights reserved. Trade licence: TRAD/DNCC/0784512/2021</p>
          <div className="flex items-center gap-3">
            <span>bKash</span>
            <span>Nagad</span>
            <span>Rocket</span>
            <span>Bank</span>
            <span>Visa / Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
