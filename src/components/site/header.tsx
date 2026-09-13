"use client";

import {
  ChevronDown,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Phone,
  Search,
  ShoppingCart,
  Truck,
  User,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { CartDrawer } from "@/components/site/cart-drawer";
import { useCart, useLocale } from "@/components/providers";
import { Avatar } from "@/components/ui/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/fields";
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
import { bdt } from "@/lib/format";
import { isAdminRole } from "@/lib/roles";
import type { Category } from "@/lib/types";

const NAV: { key: Parameters<ReturnType<typeof useLocale>["t"]>[0]; href: string }[] = [
  { key: "nav.shop", href: "/shop" },
  { key: "nav.groupBuy", href: "/group-buy" },
  { key: "nav.shipping", href: "/shipping-calculator" },
  { key: "nav.track", href: "/track" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.contact", href: "/contact" },
];

export function SiteHeader({ categories }: { categories: Category[] }) {
  const { t, locale, setLocale } = useLocale();
  const { count, wishlist } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [query, setQuery] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [catOpen, setCatOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
  }, [pathname]);

  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    if (/^https?:\/\/(detail\.)?(1688|taobao|tmall|alibaba)\./i.test(value)) {
      router.push(`/quote?link=${encodeURIComponent(value)}`);
      return;
    }
    router.push(`/shop?q=${encodeURIComponent(value)}`);
  }

  return (
    <>
      {/* utility strip */}
      <div className="hidden bg-slate-900 text-slate-300 lg:block">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-accent" /> Air express 5–7 days · Sea cargo from ৳41,000/CBM
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-accent" /> +880 9612 345 678
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="hover:text-white">
              How sourcing works
            </Link>
            <Link href="/quote" className="hover:text-white">
              Paste a 1688 link → get a quote
            </Link>
            <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
              {(["en", "bn"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium uppercase transition-colors",
                    locale === l ? "bg-white text-slate-900" : "text-slate-300 hover:text-white",
                  )}
                >
                  {l === "en" ? "EN" : "বাং"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur transition-shadow",
          scrolled ? "border-slate-200 shadow-sm" : "border-transparent",
        )}
      >
        <div className="container-x flex h-16 items-center gap-3 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-lg font-black text-white shadow-glow">
              C
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-[15px] font-extrabold tracking-tight text-slate-900">ChinaBridge</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Bangladesh</span>
            </span>
          </Link>

          <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="h-10 pl-9 pr-24"
              aria-label="Search products"
            />
            <Button type="submit" size="sm" variant="brand" className="absolute right-1 top-1 h-8">
              Search
            </Button>
          </form>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="iconSm"
              className="md:hidden"
              aria-label="Search"
              onClick={() => router.push("/shop")}
            >
              <Search className="size-4" />
            </Button>

            <Link
              href="/wishlist"
              className="relative hidden size-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="size-4" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex size-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Open cart"
            >
              <ShoppingCart className="size-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>

            {isPending ? (
              <div className="size-9 animate-pulse rounded-full bg-slate-100" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-full p-0.5 pl-0.5 pr-1.5 transition-colors hover:bg-slate-100">
                    <Avatar name={user.name ?? "User"} size="sm" />
                    <ChevronDown className="size-3.5 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="normal-case tracking-normal">
                    <span className="block text-sm font-semibold text-slate-800">{user.name}</span>
                    <span className="block text-xs font-normal text-slate-500">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <LayoutDashboard className="size-4" /> Account dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">
                      <Package className="size-4" /> My orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/wallet">
                      <Wallet className="size-4" /> Wallet & payments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/request-quote">
                      <FileText className="size-4" /> Request a quote
                    </Link>
                  </DropdownMenuItem>
                  {isAdminRole(user.role) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="font-medium text-cf-orange">
                          <LayoutDashboard className="size-4" /> Admin console
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    destructive
                    onClick={async () => {
                      await signOut();
                      router.push("/");
                      router.refresh();
                    }}
                  >
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-1.5 sm:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    <User className="size-4" /> {t("nav.login")}
                  </Link>
                </Button>
                <Button variant="brand" size="sm" asChild>
                  <Link href="/register">{t("nav.register")}</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="iconSm"
              className="lg:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {/* category rail */}
        <div className="hidden border-t border-slate-100 lg:block">
          <div className="container-x flex h-11 items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setCatOpen((v) => !v)}
                onMouseEnter={() => setCatOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-md bg-primary/5 px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <Menu className="size-3.5" /> {t("nav.categories")}
                <ChevronDown className={cn("size-3.5 transition-transform", catOpen && "rotate-180")} />
              </button>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                  pathname === item.href && "bg-slate-100 text-slate-900",
                )}
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href="/quote"
              className="ml-auto flex items-center gap-1.5 rounded-md bg-accent/15 px-3 py-1.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-accent/25"
            >
              <FileText className="size-3.5" /> {t("nav.quote")}
            </Link>
          </div>
        </div>

        {/* mega menu */}
        {catOpen && (
          <div
            onMouseLeave={() => setCatOpen(false)}
            className="absolute left-0 top-full hidden w-full border-b border-slate-200 bg-white shadow-elevated lg:block"
          >
            <div className="container-x grid grid-cols-4 gap-x-6 gap-y-1 py-5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-800">{category.name}</span>
                    <span className="block text-xs text-slate-400">{category.productCount ?? 0} products</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* mobile nav */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className="container-x space-y-1 py-3">
              <form onSubmit={submitSearch} className="relative mb-2">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="pl-9" />
              </form>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t(item.key)}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {categories.slice(0, 8).map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
                  >
                    <span>{c.icon}</span> {c.name}
                  </Link>
                ))}
              </div>
              {!user && (
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/login">{t("nav.login")}</Link>
                  </Button>
                  <Button variant="brand" className="flex-1" asChild>
                    <Link href="/register">{t("nav.register")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
