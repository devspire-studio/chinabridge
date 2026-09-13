/** Formatting + label helpers used across the storefront and admin. */

export const CURRENCY_SYMBOL = "৳";

export function bdt(amount: number, opts: { compact?: boolean; decimals?: boolean } = {}) {
  if (!Number.isFinite(amount)) return `${CURRENCY_SYMBOL}0`;
  if (opts.compact) {
    const abs = Math.abs(amount);
    if (abs >= 10000000) return `${CURRENCY_SYMBOL}${(amount / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${CURRENCY_SYMBOL}${(amount / 100000).toFixed(2)} L`;
    if (abs >= 1000) return `${CURRENCY_SYMBOL}${(amount / 1000).toFixed(1)}k`;
  }
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })}`;
}

export function cny(amount: number, decimals = 2) {
  return `¥${amount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function usd(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function numberFmt(n: number, decimals = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function kg(grams: number) {
  if (grams < 1000) return `${grams} g`;
  return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 2)} kg`;
}

export function cbm(m3: number) {
  return `${m3.toFixed(m3 < 1 ? 3 : 2)} CBM`;
}

export function pct(n: number) {
  return `${n.toFixed(n % 1 === 0 ? 0 : 1)}%`;
}

export function shortDate(value?: string | Date) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function dateTime(value?: string | Date) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · ${d.toLocaleTimeString(
    "en-GB",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

export function timeAgo(value?: string | Date) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  return shortDate(d);
}

export function daysUntil(value?: string | Date) {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(value);
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}

export function addDays(days: number, from: Date = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/* ------------------------------- status maps ------------------------------ */

export const ORDER_STATUS_FLOW: { status: string; label: string; labelBn: string; hint: string }[] = [
  { status: "pending_payment", label: "Pending payment", labelBn: "পেমেন্ট বাকি", hint: "Waiting for advance payment" },
  { status: "confirmed", label: "Order confirmed", labelBn: "অর্ডার নিশ্চিত", hint: "We started sourcing" },
  { status: "purchased", label: "Purchased from supplier", labelBn: "সাপ্লায়ার থেকে কেনা", hint: "Bought on 1688/Taobao" },
  { status: "china_warehouse", label: "China warehouse", labelBn: "চায়না ওয়্যারহাউস", hint: "Received at Guangzhou hub" },
  { status: "qc_passed", label: "QC passed", labelBn: "কিউসি পাস", hint: "Inspected & weighed" },
  { status: "consolidated", label: "Consolidated", labelBn: "কনসোলিডেটেড", hint: "Packed into consignment" },
  { status: "in_transit", label: "In transit", labelBn: "পথে", hint: "Air/sea freight to Bangladesh" },
  { status: "customs_clearance", label: "Customs clearance", labelBn: "কাস্টমস ক্লিয়ারেন্স", hint: "Duty & VAT assessment" },
  { status: "arrived_bd", label: "Arrived in Bangladesh", labelBn: "বাংলাদেশে পৌঁছেছে", hint: "At our Dhaka hub" },
  { status: "out_for_delivery", label: "Out for delivery", labelBn: "ডেলিভারির জন্য বের হয়েছে", hint: "Rider on the way" },
  { status: "delivered", label: "Delivered", labelBn: "ডেলিভারি সম্পন্ন", hint: "Handed over to you" },
];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  ...Object.fromEntries(ORDER_STATUS_FLOW.map((s) => [s.status, s.label])),
  cancelled: "Cancelled",
  returned: "Returned",
};

export const ORDER_STATUS_LABEL_BN: Record<string, string> = {
  ...Object.fromEntries(ORDER_STATUS_FLOW.map((s) => [s.status, s.labelBn])),
  cancelled: "বাতিল",
  returned: "ফেরত",
};

export const ORDER_STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger" | "info" | "muted"> = {
  pending_payment: "warning",
  confirmed: "info",
  purchased: "info",
  china_warehouse: "info",
  qc_passed: "info",
  consolidated: "info",
  in_transit: "default",
  customs_clearance: "warning",
  arrived_bd: "info",
  out_for_delivery: "default",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  unpaid: "Unpaid",
  partial: "Advance paid",
  paid: "Paid",
  refunded: "Refunded",
};

export const SHIPPING_MODE_LABEL: Record<string, string> = {
  air_express: "Air Express (3-7 days)",
  air_standard: "Air Standard (7-12 days)",
  sea_lcl: "Sea LCL (25-35 days)",
  sea_fcl: "Sea FCL / Container (30-40 days)",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  bank_transfer: "Bank transfer",
  card: "Card",
  wallet: "ChinaBridge wallet",
  cod: "Cash on delivery",
};

export const CHANNEL_LABEL: Record<string, string> = {
  store: "Store order",
  link_order: "Link order",
  rfq: "Quote request",
  group_buy: "Group buy",
  wholesale: "Wholesale",
};

export function orderStatusIndex(status: string) {
  const idx = ORDER_STATUS_FLOW.findIndex((s) => s.status === status);
  return idx < 0 ? 0 : idx;
}

export function titleCase(input: string) {
  return input
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
