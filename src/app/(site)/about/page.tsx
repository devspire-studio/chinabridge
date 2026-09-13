import { Building2, Globe2, Handshake, Mail, MapPin, Phone, ShieldCheck, Target, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { StatsBand } from "@/components/site/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, StatCard } from "@/components/ui/data";
import { bdt, numberFmt } from "@/lib/format";
import { getDashboardStats } from "@/server/stats";
import { listStaff, listSuppliers, listWarehouses } from "@/server/queries";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About ChinaBridge BD",
  description: "Trade-licensed Bangladesh importer with our own consolidation warehouses in Guangzhou and Yiwu.",
};

export default async function AboutPage() {
  const [settings, warehouses, suppliers, staff, stats] = await Promise.all([
    getSettings(),
    listWarehouses(),
    listSuppliers(),
    listStaff(),
    getDashboardStats(),
  ]);

  const timeline = [
    { year: "2021", title: "Started as a Guangzhou sourcing desk", text: "Two founders, one warehouse room and a laptop, buying electronics for Dhaka resellers." },
    { year: "2022", title: "Opened Yiwu DC-2", text: "Added apparel and general merchandise consolidation for Chattogram importers." },
    { year: "2023", title: "Trade licence + customs brokerage", text: "In-house HS classification and clearance for air consignments into Dhaka." },
    { year: "2024", title: "Dhaka hub in Tejgaon", text: "Same-day dispatch for Dhaka deliveries and hub pickup for out-of-town buyers." },
    { year: "2025", title: "Sea LCL programme", text: "Weekly LCL consolidation to Chattogram Port for bulky wholesale lots." },
    { year: "2026", title: "1,500 CBM capacity", text: "Guangzhou and Yiwu warehousing plus bond space at Chattogram Port." },
  ];

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <Badge variant="secondary">
            <ShieldCheck className="size-3" /> Trade licence TRAD/DNCC/0784512/2021
          </Badge>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Bangladesh&apos;s import bridge to China — built by people who buy on the ground
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            ChinaBridge BD started in 2021 sourcing electronics for a handful of Dhanmondi resellers. Today we run
            consolidation hubs in Guangzhou and Yiwu, a bonded presence at Chattogram Port and a Dhaka hub in Tejgaon — with
            a team that speaks Bangla, English and Mandarin and buys from 1688 and Taobao factories every single day.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We are not a marketplace. We are your import department: supplier vetting, CNY payment, inspection, freight,
            customs duty and delivery — with one transparent landed-cost number before you commit a taka.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="brand" asChild>
              <Link href="/quote">Start an import</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/how-it-works">See the process</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Importers served" value="3,180+" icon={<Users className="size-4" />} />
          <StatCard label="Consignments" value="12,400+" tone="info" icon={<Globe2 className="size-4" />} />
          <StatCard label="Verified suppliers" value={numberFmt(suppliers.length * 12)} tone="success" icon={<Handshake className="size-4" />} />
          <StatCard label="Duty filed (est.)" value={bdt(stats.revenueBdt * 0.28, { compact: true })} tone="warning" icon={<Target className="size-4" />} />
        </div>
      </div>

      <div className="mt-12">
        <StatsBand
          stats={[
            { label: "Warehousing", value: `${numberFmt(warehouses.reduce((a, w) => a + w.capacityCbm, 0))} CBM`, hint: "China + Bangladesh" },
            { label: "Operations team", value: numberFmt(staff.length + 22), hint: "Dhaka, Guangzhou, Yiwu" },
            { label: "Service fee", value: `${settings.serviceFeePct}%`, hint: "no hidden charges" },
            { label: "Support hours", value: "9am–10pm", hint: "Bangladesh time, 7 days" },
          ]}
        />
      </div>

      {/* warehouses */}
      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Our facilities</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w) => (
            <div key={w.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </span>
                <Badge variant={w.type.startsWith("china") ? "info" : "success"}>
                  {w.type === "china_consolidation" ? "China hub" : w.type === "bd_hub" ? "BD hub" : w.type === "bd_customs_bond" ? "Bond" : "Pickup"}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{w.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{w.address}</p>
              <dl className="mt-3 space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <dt>Capacity</dt>
                  <dd className="font-medium text-slate-700">
                    {w.usedCbm}/{w.capacityCbm} CBM
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Team</dt>
                  <dd className="font-medium text-slate-700">{w.staff} people</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Contact</dt>
                  <dd className="font-medium text-slate-700">{w.contact}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* timeline */}
      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">How we grew</h2>
        <ol className="mt-6 space-y-4 border-l border-slate-200 pl-6">
          {timeline.map((item) => (
            <li key={item.year} className="relative">
              <span className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-white bg-primary" />
              <p className="text-sm font-semibold text-slate-900">
                {item.year} · {item.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* team */}
      <section className="mt-14">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Who you will talk to</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {staff.slice(0, 8).map((member) => (
            <div key={member.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-semibold text-white">
                {member.name
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{member.name}</p>
              <p className="text-xs text-slate-500">{member.department}</p>
              <Badge variant="muted" className="mt-2">
                {member.role.replace(/_/g, " ")}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Visit or call us</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <p className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {settings.address}
          </p>
          <p className="flex items-start gap-2 text-sm text-slate-600">
            <Phone className="mt-0.5 size-4 shrink-0 text-primary" /> {settings.supportPhone}
          </p>
          <p className="flex items-start gap-2 text-sm text-slate-600">
            <Mail className="mt-0.5 size-4 shrink-0 text-primary" /> {settings.supportEmail}
          </p>
        </div>
      </section>
    </div>
  );
}
