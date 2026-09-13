"use client";

import { FileText, LayoutDashboard, MapPin, Package, Ticket, User, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const ICONS = {
  dashboard: LayoutDashboard,
  package: Package,
  file: FileText,
  wallet: Wallet,
  map: MapPin,
  ticket: Ticket,
  user: User,
} as const;

export function AccountNav({ links }: { links: { href: string; label: string; icon: keyof typeof ICONS }[] }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {links.map((link) => {
        const Icon = ICONS[link.icon];
        const active = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-primary/10 font-semibold text-primary" : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
