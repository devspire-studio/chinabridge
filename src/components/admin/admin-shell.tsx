"use client";

import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  FileText,
  FolderTree,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PanelsTopLeft,
  Percent,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Avatar } from "@/components/ui/data";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlays";
import { authClient, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { ROLE_LABEL, can, type PermissionKey } from "@/lib/roles";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: PermissionKey;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function AdminShell({
  children,
  counts,
}: {
  children: React.ReactNode;
  counts: { pendingPayment: number; newQuotes: number; openTickets: number; inTransit: number; lowStock: number };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const role = ((session?.user as { role?: string } | undefined)?.role ?? "admin") as string;

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const groups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
        { href: "/admin/reports", label: "Reports & analytics", icon: BarChart3, permission: "reports" },
      ],
    },
    {
      label: "Commerce",
      items: [
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag, permission: "orders", badge: counts.pendingPayment },
        { href: "/admin/quotes", label: "Quote requests", icon: FileText, permission: "quotes", badge: counts.newQuotes },
        { href: "/admin/group-buys", label: "Group deals", icon: Percent, permission: "groupBuys" },
        { href: "/admin/customers", label: "Customers", icon: Users, permission: "customers" },
        { href: "/admin/payments", label: "Payments", icon: Wallet, permission: "payments" },
        { href: "/admin/wallet", label: "Wallet ledger", icon: Activity, permission: "wallet" },
      ],
    },
    {
      label: "Catalogue & procurement",
      items: [
        { href: "/admin/products", label: "Products", icon: Package, permission: "products" },
        { href: "/admin/categories", label: "Categories", icon: FolderTree, permission: "categories" },
        { href: "/admin/suppliers", label: "Suppliers", icon: Building2, permission: "suppliers" },
        { href: "/admin/purchase-orders", label: "Purchase orders", icon: Store, permission: "purchaseOrders" },
      ],
    },
    {
      label: "Logistics",
      items: [
        { href: "/admin/shipments", label: "Consignments", icon: Truck, permission: "shipments", badge: counts.inTransit },
        { href: "/admin/warehouses", label: "Warehouses", icon: PanelsTopLeft, permission: "warehouses" },
      ],
    },
    {
      label: "Customer care",
      items: [
        { href: "/admin/tickets", label: "Support tickets", icon: LifeBuoy, permission: "tickets", badge: counts.openTickets },
        { href: "/admin/reviews", label: "Reviews", icon: MessageSquare, permission: "reviews" },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/admin/cms/banners", label: "Banners", icon: Globe, permission: "cms" },
        { href: "/admin/cms/posts", label: "Articles", icon: FileText, permission: "cms" },
        { href: "/admin/coupons", label: "Coupons", icon: Percent, permission: "coupons" },
      ],
    },
    {
      label: "Administration",
      items: [
        { href: "/admin/staff", label: "Team & roles", icon: Shield, permission: "staff" },
        { href: "/admin/audit", label: "Audit log", icon: Activity, permission: "audit" },
        { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings" },
      ],
    },
  ];

  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => can(role, item.permission)) }))
    .filter((group) => group.items.length > 0);

  const flatItems = visibleGroups.flatMap((g) => g.items);
  const searchResults = search
    ? flatItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  const [openGroups, setOpenGroups] = React.useState<string[]>(groups.map((g) => g.label));
  function toggleGroup(label: string) {
    setOpenGroups((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-cf-line/70 bg-cf-navy transition-all duration-200",
          collapsed ? "w-[68px]" : "w-[248px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-cf-line/70 px-4">
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cf-orange text-sm font-black text-slate-950">
              C
            </span>
            {!collapsed && (
              <span className="flex min-w-0 flex-col leading-none">
                <span className="truncate text-xs font-bold text-white">ChinaBridge</span>
                <span className="truncate text-[10px] uppercase tracking-widest text-cf-muted">Admin console</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {visibleGroups.map((group) => {
            const open = openGroups.includes(group.label) || collapsed;
            return (
              <div key={group.label} className="mb-2">
                {!collapsed && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex w-full items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-cf-muted transition-colors hover:text-slate-300"
                  >
                    {group.label}
                    <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
                  </button>
                )}
                {open && (
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={cn(
                              "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                              active
                                ? "bg-white/10 font-medium text-white"
                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                            )}
                          >
                            <item.icon className={cn("size-4 shrink-0", active && "text-cf-orange")} />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                            {!collapsed && item.badge ? (
                              <span className="ml-auto rounded-full bg-cf-orange px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-cf-line/70 p-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            <Store className="size-4 shrink-0" />
            {!collapsed && "Back to storefront"}
          </Link>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 lg:flex"
          >
            <ChevronLeft className={cn("size-4 shrink-0 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && "Collapse sidebar"}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* main */}
      <div className={cn("transition-all duration-200", collapsed ? "lg:pl-[68px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-cf-line/70 bg-cf-slate px-3 text-slate-200 sm:px-4">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden items-center gap-2 rounded-md border border-cf-line px-2.5 py-1.5 text-xs hover:bg-white/5 sm:flex">
                <span className="size-2 rounded-full bg-emerald-400" />
                ChinaBridge BD · Production
                <ChevronDown className="size-3.5 text-cf-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Accounts</DropdownMenuLabel>
              <DropdownMenuItem>ChinaBridge BD · Production</DropdownMenuItem>
              <DropdownMenuItem>ChinaBridge BD · Staging</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Manage accounts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-cf-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Jump to a module…"
              className="h-8 w-full rounded-md border border-cf-line bg-cf-navy pl-8 pr-3 text-xs text-slate-200 placeholder:text-cf-muted focus:border-cf-orange focus:outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-md border border-cf-line bg-cf-slate py-1 shadow-xl">
                {searchResults.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setSearch("");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-white/5"
                  >
                    <item.icon className="size-3.5" /> {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/orders?status=pending_payment"
              className="relative rounded-md p-2 text-slate-300 hover:bg-white/5"
              title="Pending payments"
            >
              <Bell className="size-4" />
              {counts.pendingPayment > 0 && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-cf-orange" />
              )}
            </Link>

            <button className="hidden rounded-md p-2 text-slate-300 hover:bg-white/5 sm:block" title="Support">
              <LifeBuoy className="size-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-white/5">
                  <Avatar name={session?.user?.name ?? "Admin"} size="sm" />
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-xs font-medium text-white">{session?.user?.name ?? "Admin"}</span>
                    <span className="block text-[10px] text-cf-muted">{ROLE_LABEL[role] ?? role}</span>
                  </span>
                  <ChevronDown className="size-3.5 text-cf-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="normal-case tracking-normal">
                  <span className="block text-sm font-semibold text-slate-800">{session?.user?.name}</span>
                  <span className="block text-xs font-normal text-slate-500">{session?.user?.email}</span>
                  <Badge variant="accent" className="mt-1.5">
                    {ROLE_LABEL[role] ?? role}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="size-4" /> Workspace settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Users className="size-4" /> My customer account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onClick={async () => {
                    await signOut();
                    router.push("/login");
                    router.refresh();
                  }}
                >
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.5rem)] px-4 py-5 sm:px-6">{children}</main>

        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-400">
          ChinaBridge BD admin console · data source: PostgreSQL (Drizzle ORM) · every mutation is written to the audit log.
        </footer>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && <span className="text-slate-300">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-cf-orange">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-600">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
