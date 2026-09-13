import { FileText, LayoutDashboard, MapPin, Package, Ticket, User, Wallet } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountNav } from "@/components/site/account-nav";
import { Avatar } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import { bdt } from "@/lib/format";
import { getSession } from "@/server/auth-helpers";
import { getCustomerById } from "@/server/queries";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/account", label: "Dashboard", icon: "dashboard" },
  { href: "/account/orders", label: "My orders", icon: "package" },
  { href: "/account/quotes", label: "Quote requests", icon: "file" },
  { href: "/account/wallet", label: "Wallet & payments", icon: "wallet" },
  { href: "/account/addresses", label: "Addresses", icon: "map" },
  { href: "/account/tickets", label: "Support tickets", icon: "ticket" },
  { href: "/account/profile", label: "Profile", icon: "user" },
] as const;

const ICONS = { dashboard: LayoutDashboard, package: Package, file: FileText, wallet: Wallet, map: MapPin, ticket: Ticket, user: User };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/account");

  const customer = session.user.customerId ? await getCustomerById(session.user.customerId) : null;

  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <Avatar name={session.user.name} size="lg" />
          <div>
            <p className="text-base font-semibold text-slate-900">{session.user.name}</p>
            <p className="text-xs text-slate-500">
              {session.user.email} {customer?.phone ? `· ${customer.phone}` : ""}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {customer && <Badge variant="accent">{customer.tier} member</Badge>}
              {customer && <Badge variant="secondary">{customer.type}</Badge>}
              <Badge variant="muted">{customer?.totalOrders ?? 0} orders</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Wallet</p>
            <p className="text-lg font-bold text-slate-900">{bdt(customer?.walletBalanceBdt ?? 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Lifetime</p>
            <p className="text-lg font-bold text-slate-900">{bdt(customer?.totalSpentBdt ?? 0, { compact: true })}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Due</p>
            <p className="text-lg font-bold text-rose-600">{bdt(customer?.dueBdt ?? 0)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside>
          <nav className="lg:sticky lg:top-28">
            {/* mobile: horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {LINKS.map((link) => {
                const Icon = ICONS[link.icon];
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600"
                  >
                    <Icon className="size-3.5" /> {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden rounded-xl border border-slate-200 bg-white p-2 lg:block">
              <AccountNav links={LINKS.map((l) => ({ href: l.href, label: l.label, icon: l.icon }))} />
            </div>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
