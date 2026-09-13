"use client";

import * as React from "react";

import { priceStoreOrder, type StoreLine } from "@/lib/pricing";
import { translate, type Locale, type TranslationKey } from "@/lib/i18n";
import type { Settings, ShippingMode } from "@/lib/types";

/* --------------------------------- settings -------------------------------- */

const SettingsContext = React.createContext<Settings | null>(null);

export function SettingsProvider({ settings, children }: { settings: Settings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}

/* ---------------------------------- locale --------------------------------- */

const LocaleContext = React.createContext<{ locale: Locale; setLocale: (l: Locale) => void; t: (k: TranslationKey) => string }>({
  locale: "en",
  setLocale: () => {},
  t: (k) => k,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("cb_locale") as Locale | null;
    if (stored === "bn" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem("cb_locale", next);
    document.documentElement.lang = next;
  }, []);

  const value = React.useMemo(
    () => ({ locale, setLocale, t: (key: TranslationKey) => translate(key, locale) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return React.useContext(LocaleContext);
}

/* ----------------------------------- cart ---------------------------------- */

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  image: string;
  sku: string;
  variant?: string;
  unitPriceBdt: number;
  costPriceCny: number;
  weightGrams: number;
  cbm: number;
  dutyPct: number;
  serviceFeePct: number;
  moq: number;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  wishlist: string[];
  shippingMode: ShippingMode;
  couponCode: string | null;
  discountBdt: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  clear: () => void;
  toggleWishlist: (productId: string) => void;
  setShippingMode: (mode: ShippingMode) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  count: number;
  lineCount: number;
  pricing: ReturnType<typeof priceStoreOrder>;
  previewPrice: (mode?: ShippingMode) => ReturnType<typeof priceStoreOrder>;
  hydrated: boolean;
}

const CartContext = React.createContext<CartState | null>(null);

const STORAGE_KEY = "cb_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [shippingMode, setShippingMode] = React.useState<ShippingMode>("air_standard");
  const [coupon, setCoupon] = React.useState<{ code: string; discount: number } | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          items?: CartItem[];
          wishlist?: string[];
          shippingMode?: ShippingMode;
          coupon?: { code: string; discount: number } | null;
        };
        if (parsed.items) setItems(parsed.items);
        if (parsed.wishlist) setWishlist(parsed.wishlist);
        if (parsed.shippingMode) setShippingMode(parsed.shippingMode);
        if (parsed.coupon) setCoupon(parsed.coupon);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, wishlist, shippingMode, coupon }));
  }, [items, wishlist, shippingMode, coupon, hydrated]);

  const addItem = React.useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.variant === item.variant);
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity: Math.max(quantity, 1) }];
    });
  }, []);

  const updateQuantity = React.useCallback((productId: string, quantity: number, variant?: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId && i.variant === variant ? { ...i, quantity: Math.max(0, quantity) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeItem = React.useCallback((productId: string, variant?: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
  }, []);

  const clear = React.useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const toggleWishlist = React.useCallback((productId: string) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  }, []);

  const toLines = React.useCallback(
    (list: CartItem[]): StoreLine[] =>
      list.map((i) => ({
        productId: i.productId,
        title: i.title,
        image: i.image,
        sku: i.sku,
        variant: i.variant,
        unitPriceBdt: i.unitPriceBdt,
        costPriceCny: i.costPriceCny,
        quantity: i.quantity,
        weightGrams: i.weightGrams,
        cbm: i.cbm,
        dutyPct: i.dutyPct,
        serviceFeePct: i.serviceFeePct,
      })),
    [],
  );

  const priceFor = React.useCallback(
    (mode: ShippingMode, discount: number) =>
      priceStoreOrder({ lines: toLines(items), mode, settings, discountBdt: discount }),
    [items, settings, toLines],
  );

  const pricing = React.useMemo(() => priceFor(shippingMode, coupon?.discount ?? 0), [priceFor, shippingMode, coupon]);

  const value: CartState = {
    items,
    wishlist,
    shippingMode,
    couponCode: coupon?.code ?? null,
    discountBdt: coupon?.discount ?? 0,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    toggleWishlist,
    setShippingMode,
    applyCoupon: (code, discount) => setCoupon({ code, discount }),
    removeCoupon: () => setCoupon(null),
    count: items.reduce((acc, i) => acc + i.quantity, 0),
    lineCount: items.length,
    pricing,
    previewPrice: (mode) => priceFor(mode ?? shippingMode, coupon?.discount ?? 0),
    hydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
