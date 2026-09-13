import { asc, desc, eq, getTableColumns, ilike, or, sql, type SQL } from "drizzle-orm";

import {
  banners,
  categories,
  coupons,
  customers,
  getDb,
  groupBuys,
  posts,
  products,
  purchaseOrders,
  quotes,
  reviews,
  shipments,
  staff,
  suppliers,
  tickets,
  warehouses,
} from "@/db";
import type { PermissionKey } from "@/lib/roles";

/**
 * Declarative registry powering the admin console's generic CRUD endpoints.
 * Each entry declares which fields an editor may write and which API module guards it.
 */
export interface CollectionDef {
  table: unknown;
  label: string;
  idPrefix: string;
  permission: PermissionKey;
  writable: string[];
  required: string[];
  searchable: string[];
  orderBy: { column: string; dir: "asc" | "desc" };
}

const commonNumeric = ["value", "priceBdt", "stock"];

export const COLLECTIONS: Record<string, CollectionDef> = {
  products: {
    table: products,
    label: "Product",
    idPrefix: "prd",
    permission: "products",
    writable: [
      "title", "slug", "sku", "description", "categoryId", "supplierId", "brand", "originCountry", "sourceUrl",
      "images", "costPriceCny", "priceBdt", "compareAtPriceBdt", "weightGrams", "cbm", "moq", "stock", "unit",
      "tags", "status", "featured", "leadTimeDays", "hsCode", "titleBn",
    ],
    required: ["title", "categoryId", "priceBdt"],
    searchable: ["title", "sku", "brand"],
    orderBy: { column: "createdAt", dir: "desc" },
  },
  categories: {
    table: categories,
    label: "Category",
    idPrefix: "cat",
    permission: "categories",
    writable: ["name", "nameBn", "slug", "icon", "image", "description", "featured", "serviceFeePct", "dutyPct", "sortOrder", "parentId"],
    required: ["name", "slug"],
    searchable: ["name", "slug"],
    orderBy: { column: "sortOrder", dir: "asc" },
  },
  customers: {
    table: customers,
    label: "Customer",
    idPrefix: "cus",
    permission: "customers",
    writable: ["name", "phone", "email", "type", "tier", "status", "notes", "dueBdt", "walletBalanceBdt", "avatar"],
    required: ["name", "phone"],
    searchable: ["name", "phone", "email"],
    orderBy: { column: "createdAt", dir: "desc" },
  },
  suppliers: {
    table: suppliers,
    label: "Supplier",
    idPrefix: "sup",
    permission: "suppliers",
    writable: [
      "name", "nameCn", "platform", "city", "contactPerson", "phone", "wechat", "rating", "status", "categories", "notes", "onTimeRate",
    ],
    required: ["name"],
    searchable: ["name", "nameCn", "city"],
    orderBy: { column: "totalSpendCny", dir: "desc" },
  },
  shipments: {
    table: shipments,
    label: "Shipment",
    idPrefix: "shp",
    permission: "shipments",
    writable: [
      "ref", "mode", "status", "originCity", "destinationCity", "carrier", "awbOrBl", "containerNo", "cbm",
      "weightGrams", "chargeableWeightGrams", "freightCostBdt", "dutyPaidBdt", "orderCount", "notes", "departedAt", "etaAt", "arrivedAt", "clearedAt",
    ],
    required: ["ref", "mode"],
    searchable: ["ref", "awbOrBl", "containerNo", "carrier"],
    orderBy: { column: "createdAt", dir: "desc" },
  },
  quotes: {
    table: quotes,
    label: "Quote request",
    idPrefix: "qte",
    permission: "quotes",
    writable: [
      "customerName", "phone", "email", "sourceUrl", "sourcePlatform", "productName", "quantity", "targetPriceBdt",
      "notes", "status", "quotedUnitPriceBdt", "quotedTotalBdt", "assignedTo", "ref",
    ],
    required: ["customerName", "phone", "productName"],
    searchable: ["customerName", "phone", "productName", "ref"],
    orderBy: { column: "createdAt", dir: "desc" },
  },
  coupons: {
    table: coupons,
    label: "Coupon",
    idPrefix: "cpn",
    permission: "coupons",
    writable: ["code", "type", "value", "minOrderBdt", "usageLimit", "used", "appliesTo", "status", "startsAt", "expiresAt"],
    required: ["code", "type"],
    searchable: ["code"],
    orderBy: { column: "startsAt", dir: "desc" },
  },
  "group-buys": {
    table: groupBuys,
    label: "Group deal",
    idPrefix: "grp",
    permission: "groupBuys",
    writable: ["title", "slug", "productId", "image", "unitPriceBdt", "groupPriceBdt", "minMembers", "joined", "expiresAt", "status"],
    required: ["title", "productId"],
    searchable: ["title", "slug"],
    orderBy: { column: "expiresAt", dir: "asc" },
  },
  reviews: {
    table: reviews,
    label: "Review",
    idPrefix: "rev",
    permission: "reviews",
    writable: ["productId", "productTitle", "customerName", "rating", "title", "body", "status", "helpful"],
    required: ["productId"],
    searchable: ["productTitle", "customerName", "title"],
    orderBy: { column: "createdAt", dir: "desc" },
  },
  tickets: {
    table: tickets,
    label: "Support ticket",
    idPrefix: "tkt",
    permission: "tickets",
    writable: ["subject", "category", "priority", "status", "assignedTo", "orderNo", "customerName", "ref"],
    required: ["subject"],
    searchable: ["subject", "ref", "customerName", "orderNo"],
    orderBy: { column: "createdAt", dir: "desc" },
  },
  "purchase-orders": {
    table: purchaseOrders,
    label: "Purchase order",
    idPrefix: "po",
    permission: "purchaseOrders",
    writable: ["ref", "supplierId", "supplierName", "orderIds", "totalCny", "paidCny", "status", "warehouse", "notes", "expectedAt"],
    required: ["ref", "supplierId"],
    searchable: ["ref", "supplierName"],
    orderBy: { column: "placedAt", dir: "desc" },
  },
  warehouses: {
    table: warehouses,
    label: "Warehouse",
    idPrefix: "wh",
    permission: "warehouses",
    writable: ["name", "code", "country", "city", "address", "type", "capacityCbm", "usedCbm", "staff", "status", "contact"],
    required: ["name", "code"],
    searchable: ["name", "code", "city"],
    orderBy: { column: "name", dir: "asc" },
  },
  banners: {
    table: banners,
    label: "Banner",
    idPrefix: "bnr",
    permission: "cms",
    writable: ["title", "subtitle", "image", "ctaLabel", "ctaHref", "placement", "status", "sortOrder"],
    required: ["title"],
    searchable: ["title"],
    orderBy: { column: "sortOrder", dir: "asc" },
  },
  posts: {
    table: posts,
    label: "Article",
    idPrefix: "pst",
    permission: "cms",
    writable: ["title", "slug", "excerpt", "body", "cover", "author", "category", "tags", "status", "readMinutes", "publishedAt"],
    required: ["title", "slug"],
    searchable: ["title", "slug", "author", "category"],
    orderBy: { column: "publishedAt", dir: "desc" },
  },
  staff: {
    table: staff,
    label: "Team member",
    idPrefix: "stf",
    permission: "staff",
    writable: ["name", "email", "phone", "role", "department", "permissions", "status"],
    required: ["name", "email"],
    searchable: ["name", "email", "department"],
    orderBy: { column: "createdAt", dir: "desc" },
  },
};

export function getCollection(name: string) {
  const def = COLLECTIONS[name];
  if (!def) throw new Error(`Unknown collection: ${name}`);
  return def;
}

function pickWritable(def: CollectionDef, data: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of def.writable) {
    if (key in data) out[key] = data[key];
  }
  return coerceColumns(def, out);
}

/**
 * JSON bodies carry dates as ISO strings, but Drizzle's timestamp columns need real
 * Date objects. Blank/invalid values become null so optional date fields can be cleared.
 */
function coerceColumns(def: CollectionDef, values: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = getTableColumns(def.table as any) as Record<string, { dataType?: string }>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (columns[key]?.dataType === "date" && typeof value === "string") {
      if (!value) {
        out[key] = null;
        continue;
      }
      const parsed = new Date(value);
      out[key] = Number.isNaN(parsed.getTime()) ? null : parsed;
      continue;
    }
    out[key] = value;
  }
  return out;
}

export async function listCollectionItems(
  name: string,
  opts: { q?: string; limit?: number; offset?: number; filter?: Record<string, string> } = {},
) {
  const def = getCollection(name);
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = def.table as any;
  const conditions: SQL[] = [];
  if (opts.q) {
    const term = `%${opts.q}%`;
    const parts = def.searchable.map((field) => ilike(table[field], term));
    if (parts.length) conditions.push(or(...parts)!);
  }
  for (const [key, value] of Object.entries(opts.filter ?? {})) {
    if (value && value !== "all" && table[key]) conditions.push(eq(table[key], value));
  }
  const column = table[def.orderBy.column] ?? table.id;
  const where = conditions.length ? sql.join(conditions, sql` and `) : undefined;
  const rows = await db
    .select()
    .from(table)
    .where(where)
    .orderBy(def.orderBy.dir === "asc" ? asc(column) : desc(column))
    .limit(opts.limit ?? 200)
    .offset(opts.offset ?? 0);
  return { rows, collection: name, label: def.label, writable: def.writable };
}

export async function createCollectionItem(name: string, data: Record<string, unknown>) {
  const def = getCollection(name);
  const db = await getDb();
  const missing = def.required.filter((field) => !data[field]);
  if (missing.length) throw new Error(`Missing required field(s): ${missing.join(", ")}`);
  const values = pickWritable(def, data);
  const id = (data.id as string) || `${def.idPrefix}_${Date.now().toString(36)}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.insert(def.table as any).values({ ...values, id } as never);
  return { id };
}

export async function updateCollectionItem(name: string, id: string, data: Record<string, unknown>) {
  const def = getCollection(name);
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = def.table as any;
  const values = pickWritable(def, data);
  if (!Object.keys(values).length) return { updated: 0 };
  await db.update(table).set(values).where(eq(table.id, id));
  return { updated: 1 };
}

export async function deleteCollectionItem(name: string, id: string) {
  const def = getCollection(name);
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = def.table as any;
  await db.delete(table).where(eq(table.id, id));
  return { deleted: 1 };
}

export { commonNumeric };
