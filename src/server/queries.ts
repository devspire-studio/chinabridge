import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, sql, type SQL } from "drizzle-orm";

import {
  addresses,
  auditLogs,
  banners,
  categories,
  coupons,
  customers,
  getDb,
  groupBuys,
  orderEvents,
  orderItems,
  orderPayments,
  orders,
  posts,
  productVariants,
  products,
  purchaseOrderItems,
  purchaseOrders,
  quotes,
  reviews,
  shipments,
  staff,
  suppliers,
  ticketMessages,
  tickets,
  walletTransactions,
  warehouses,
  wishlists,
} from "@/db";
import type {
  Category,
  Customer,
  Order,
  OrderStatus,
  Post,
  Product,
  PurchaseOrder,
  QuoteRequest,
  Shipment,
} from "@/lib/types";

/* --------------------------------- helpers -------------------------------- */

export interface ProductFilters {
  q?: string;
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  origin?: string;
  brand?: string;
  featured?: boolean;
  inStock?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "popular" | "rating";
  page?: number;
  perPage?: number;
  status?: "active" | "draft" | "out_of_stock" | "archived" | "all";
  supplierId?: string;
}

export function mapProduct(
  row: typeof products.$inferSelect,
  extra: { category?: typeof categories.$inferSelect | null; supplierName?: string; variants?: (typeof productVariants.$inferSelect)[] } = {},
): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    title: row.title,
    titleBn: row.titleBn ?? undefined,
    description: row.description,
    categoryId: row.categoryId,
    supplierId: row.supplierId ?? "",
    brand: row.brand,
    originCountry: row.originCountry,
    sourceUrl: row.sourceUrl,
    images: row.images ?? [],
    costPriceCny: row.costPriceCny,
    priceBdt: row.priceBdt,
    compareAtPriceBdt: row.compareAtPriceBdt ?? undefined,
    weightGrams: row.weightGrams,
    cbm: row.cbm,
    moq: row.moq,
    stock: row.stock,
    unit: row.unit,
    rating: row.rating,
    reviewCount: row.reviewCount,
    soldCount: row.soldCount,
    tags: row.tags ?? [],
    variants: (extra.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      priceDeltaBdt: v.priceDeltaBdt,
      stock: v.stock,
    })),
    status: row.status,
    featured: row.featured,
    leadTimeDays: row.leadTimeDays,
    hsCode: row.hsCode,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    dutyPct: extra.category?.dutyPct ?? 25,
    serviceFeePct: extra.category?.serviceFeePct ?? 10,
  };
}

export function mapCategory(row: typeof categories.$inferSelect, productCount = 0): Category {
  return {
    id: row.id,
    name: row.name,
    nameBn: row.nameBn,
    slug: row.slug,
    icon: row.icon,
    image: row.image,
    description: row.description,
    featured: row.featured,
    serviceFeePct: row.serviceFeePct,
    dutyPct: row.dutyPct,
    parentId: row.parentId ?? null,
    productCount,
  };
}

function iso(value: unknown) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

/* ------------------------------- storefront ------------------------------- */

export async function getCategoriesWithCounts(): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const counts = await db
    .select({ categoryId: products.categoryId, total: count() })
    .from(products)
    .where(eq(products.status, "active"))
    .groupBy(products.categoryId);
  const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.total)]));
  return rows.map((r) => mapCategory(r, countMap.get(r.id) ?? 0));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ? mapCategory(row) : null;
}

export async function listProducts(filters: ProductFilters = {}) {
  const db = await getDb();
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  const conditions: SQL[] = [];
  if (!filters.status || filters.status !== "all") {
    conditions.push(eq(products.status, filters.status ?? "active"));
  }
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(ilike(products.title, term), ilike(products.brand, term), ilike(products.sku, term), ilike(products.description, term))!,
    );
  }
  if (filters.category) {
    const cat = await getCategoryBySlug(filters.category);
    const catId = cat?.id ?? filters.category;
    conditions.push(eq(products.categoryId, catId));
  }
  if (filters.minPrice != null) conditions.push(gte(products.priceBdt, filters.minPrice));
  if (filters.maxPrice != null) conditions.push(lte(products.priceBdt, filters.maxPrice));
  if (filters.origin) conditions.push(eq(products.originCountry, filters.origin));
  if (filters.brand) conditions.push(eq(products.brand, filters.brand));
  if (filters.featured) conditions.push(eq(products.featured, true));
  if (filters.inStock) conditions.push(gte(products.stock, 1));
  if (filters.supplierId) conditions.push(eq(products.supplierId, filters.supplierId));
  if (filters.tags?.length) {
    conditions.push(sql`${products.tags} ?| ${sql.raw(`array['${filters.tags.join("','")}']`)}`);
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const orderBy =
    filters.sort === "price_asc"
      ? asc(products.priceBdt)
      : filters.sort === "price_desc"
        ? desc(products.priceBdt)
        : filters.sort === "newest"
          ? desc(products.createdAt)
          : filters.sort === "popular"
            ? desc(products.soldCount)
            : filters.sort === "rating"
              ? desc(products.rating)
              : desc(products.featured);

  const [rows, totals, categoryRows] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(orderBy, desc(products.soldCount))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ total: count() }).from(products).where(where),
    db.select().from(categories),
  ]);

  const categoryMap = new Map(categoryRows.map((c) => [c.id, c]));
  const total = Number(totals[0]?.total ?? 0);

  return {
    items: rows.map((r) => mapProduct(r, { category: categoryMap.get(r.categoryId) ?? null })),
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!row) return null;
  const [cat] = await db.select().from(categories).where(eq(categories.id, row.categoryId)).limit(1);
  const [sup] = row.supplierId
    ? await db.select().from(suppliers).where(eq(suppliers.id, row.supplierId)).limit(1)
    : [null];
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, row.id))
    .orderBy(asc(productVariants.sortOrder));
  const productReviews = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, row.id), eq(reviews.status, "published")))
    .orderBy(desc(reviews.createdAt))
    .limit(8);

  return {
    product: mapProduct(row, { category: cat ?? null, variants, supplierName: sup?.name }),
    category: cat ? mapCategory(cat) : null,
    supplier: sup
      ? { id: sup.id, name: sup.name, city: sup.city, platform: sup.platform, rating: sup.rating, onTimeRate: sup.onTimeRate }
      : null,
    reviews: productReviews.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      rating: r.rating,
      title: r.title,
      body: r.body,
      images: r.images ?? [],
      helpful: r.helpful,
      createdAt: iso(r.createdAt)!,
    })),
  };
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 8) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.status, "active"), sql`${products.id} <> ${excludeId}`))
    .orderBy(desc(products.soldCount))
    .limit(limit);
  return rows.map((r) => mapProduct(r));
}

export async function getFeaturedProducts(limit = 10) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.status, "active"), eq(products.featured, true)))
    .orderBy(desc(products.rating))
    .limit(limit);
  return rows.map((r) => mapProduct(r));
}

export async function getTrendingProducts(limit = 10) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.status, "active"))
    .orderBy(desc(products.soldCount))
    .limit(limit);
  return rows.map((r) => mapProduct(r));
}

export async function getBrands() {
  const db = await getDb();
  const rows = await db
    .select({ brand: products.brand })
    .from(products)
    .where(eq(products.status, "active"))
    .groupBy(products.brand)
    .orderBy(asc(products.brand));
  return rows.map((r) => r.brand).filter(Boolean);
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const db = await getDb();
  const rows = await db.select().from(products).where(inArray(products.id, ids));
  return rows.map((r) => mapProduct(r));
}

export async function getBanners(placement?: "hero" | "home_mid" | "category_top" | "checkout") {
  const db = await getDb();
  const where = placement ? and(eq(banners.status, "active"), eq(banners.placement, placement)) : eq(banners.status, "active");
  const rows = await db.select().from(banners).where(where).orderBy(asc(banners.sortOrder));
  return rows;
}

export async function getGroupBuys() {
  const db = await getDb();
  return db.select().from(groupBuys).orderBy(asc(groupBuys.expiresAt));
}

function mapPost(row: typeof posts.$inferSelect): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    cover: row.cover,
    author: row.author,
    category: row.category,
    tags: row.tags ?? [],
    status: row.status === "draft" ? "draft" : "published",
    readMinutes: row.readMinutes,
    publishedAt: iso(row.publishedAt)!,
    views: row.views,
  };
}

export async function getPosts(limit = 12): Promise<Post[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  return rows.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = await getDb();
  const [row] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return row ? mapPost(row) : null;
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.status, "published"), sql`${posts.slug} <> ${slug}`))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  return rows.map(mapPost);
}

export async function getActiveCoupons() {
  const db = await getDb();
  return db.select().from(coupons).where(eq(coupons.status, "active")).orderBy(desc(coupons.value));
}

export async function getCouponByCode(code: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.status, "active")))
    .limit(1);
  return row ?? null;
}

/* --------------------------------- orders --------------------------------- */

export interface OrderFilters {
  q?: string;
  status?: string;
  channel?: string;
  paymentStatus?: string;
  shippingMode?: string;
  shipmentId?: string;
  customerId?: string;
  page?: number;
  perPage?: number;
  from?: string;
  to?: string;
}

export async function listOrders(filters: OrderFilters = {}) {
  const db = await getDb();
  const perPage = filters.perPage ?? 20;
  const page = Math.max(1, filters.page ?? 1);
  const conditions: SQL[] = [];

  if (filters.status && filters.status !== "all") conditions.push(eq(orders.status, filters.status as OrderStatus));
  if (filters.channel && filters.channel !== "all")
    conditions.push(eq(orders.channel, filters.channel as "store"));
  if (filters.paymentStatus && filters.paymentStatus !== "all")
    conditions.push(eq(orders.paymentStatus, filters.paymentStatus as "paid"));
  if (filters.shippingMode && filters.shippingMode !== "all")
    conditions.push(eq(orders.shippingMode, filters.shippingMode as "air_express"));
  if (filters.shipmentId) conditions.push(eq(orders.shipmentId, filters.shipmentId));
  if (filters.customerId) conditions.push(eq(orders.customerId, filters.customerId));
  if (filters.from) conditions.push(gte(orders.createdAt, new Date(filters.from)));
  if (filters.to) conditions.push(lte(orders.createdAt, new Date(filters.to)));
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(orders.orderNo, term),
        ilike(orders.customerName, term),
        ilike(orders.customerPhone, term),
        ilike(orders.consignmentRef, term),
        ilike(orders.courierTrackingNo, term),
      )!,
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ total: count() }).from(orders).where(where),
  ]);

  const ids = rows.map((r) => r.id);
  const items = ids.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids))
    : [];

  return {
    items: rows.map((r) => mapOrderSummary(r, items.filter((i) => i.orderId === r.id))),
    total: Number(totals[0]?.total ?? 0),
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(Number(totals[0]?.total ?? 0) / perPage)),
  };
}

function mapOrderSummary(row: typeof orders.$inferSelect, items: (typeof orderItems.$inferSelect)[]): Order {
  return {
    id: row.id,
    orderNo: row.orderNo,
    customerId: row.customerId ?? "",
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    channel: row.channel,
    status: row.status,
    paymentStatus: row.paymentStatus,
    shippingMode: row.shippingMode,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      title: i.title,
      image: i.image,
      sku: i.sku,
      variant: i.variant ?? undefined,
      unitPriceBdt: i.unitPriceBdt,
      quantity: i.quantity,
      weightGrams: i.weightGrams,
      cbm: i.cbm,
    })),
    subtotalBdt: row.subtotalBdt,
    serviceFeeBdt: row.serviceFeeBdt,
    shippingFeeBdt: row.shippingFeeBdt,
    dutyBdt: row.dutyBdt,
    discountBdt: row.discountBdt,
    totalBdt: row.totalBdt,
    paidBdt: row.paidBdt,
    weightGrams: row.weightGrams,
    cbm: row.cbm,
    shippingAddress: (row.shippingAddress ?? {}) as unknown as Order["shippingAddress"],
    payments: [],
    events: [],
    shipmentId: row.shipmentId,
    consignmentRef: row.consignmentRef ?? undefined,
    chinaTrackingNo: row.chinaTrackingNo ?? undefined,
    courier: row.courier ?? undefined,
    courierTrackingNo: row.courierTrackingNo ?? undefined,
    notes: row.notes,
    createdAt: iso(row.createdAt)!,
    updatedAt: iso(row.updatedAt)!,
    etaAt: iso(row.etaAt),
  };
}

export async function getOrderById(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!row) return null;
  return hydrateOrder(row);
}

export async function getOrderByNo(orderNo: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(orders)
    .where(or(eq(orders.orderNo, orderNo), eq(orders.courierTrackingNo, orderNo), eq(orders.consignmentRef, orderNo))!)
    .limit(1);
  if (!row) return null;
  return hydrateOrder(row);
}

async function hydrateOrder(row: typeof orders.$inferSelect): Promise<Order> {
  const db = await getDb();
  const [items, events, payments, shipment] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, row.id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, row.id)).orderBy(asc(orderEvents.at)),
    db.select().from(orderPayments).where(eq(orderPayments.orderId, row.id)).orderBy(asc(orderPayments.at)),
    row.shipmentId ? db.select().from(shipments).where(eq(shipments.id, row.shipmentId)).limit(1) : Promise.resolve([]),
  ]);
  const base = mapOrderSummary(row, items);
  return {
    ...base,
    events: events.map((e) => ({
      id: e.id,
      status: e.status,
      title: e.title,
      note: e.note ?? undefined,
      location: e.location ?? undefined,
      at: iso(e.at)!,
      actor: e.actor,
    })),
    payments: payments.map((p) => ({
      id: p.id,
      amountBdt: p.amountBdt,
      method: p.method,
      reference: p.reference,
      status: p.status as "success",
      at: iso(p.at)!,
    })),
    shipment: shipment[0]
      ? {
          ref: shipment[0].ref,
          mode: shipment[0].mode,
          status: shipment[0].status,
          carrier: shipment[0].carrier,
          etaAt: iso(shipment[0].etaAt),
        }
      : undefined,
  } as Order & { shipment?: unknown };
}

export async function getOrdersForCustomer(customerId: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
  const ids = rows.map((r) => r.id);
  const items = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];
  return rows.map((r) => mapOrderSummary(r, items.filter((i) => i.orderId === r.id)));
}

/* ------------------------------- customers -------------------------------- */

export async function listCustomers(filters: { q?: string; tier?: string; type?: string; status?: string } = {}) {
  const db = await getDb();
  const conditions: SQL[] = [];
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(or(ilike(customers.name, term), ilike(customers.phone, term), ilike(customers.email, term))!);
  }
  if (filters.tier && filters.tier !== "all") conditions.push(eq(customers.tier, filters.tier as "gold"));
  if (filters.type && filters.type !== "all") conditions.push(eq(customers.type, filters.type as "retail"));
  if (filters.status && filters.status !== "all") conditions.push(eq(customers.status, filters.status as "active"));
  const rows = await db
    .select()
    .from(customers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(customers.totalSpentBdt));
  return rows;
}

export async function getCustomerByPhoneOrEmail(identifier: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(customers)
    .where(or(eq(customers.phone, identifier), eq(customers.email, identifier.toLowerCase()))!)
    .limit(1);
  if (!row) return null;
  return hydrateCustomer(row);
}

export async function getCustomerById(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  if (!row) return null;
  return hydrateCustomer(row);
}

async function hydrateCustomer(row: typeof customers.$inferSelect): Promise<Customer> {
  const db = await getDb();
  const [addressRows, orderRows, walletRows] = await Promise.all([
    db.select().from(addresses).where(eq(addresses.customerId, row.id)),
    db.select().from(orders).where(eq(orders.customerId, row.id)).orderBy(desc(orders.createdAt)).limit(10),
    db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.customerId, row.id))
      .orderBy(desc(walletTransactions.at))
      .limit(20),
  ]);
  const orderItemsRows = orderRows.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderRows.map((o) => o.id)))
    : [];

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    avatar: row.avatar ?? undefined,
    type: row.type,
    tier: row.tier,
    walletBalanceBdt: row.walletBalanceBdt,
    totalOrders: row.totalOrders,
    totalSpentBdt: row.totalSpentBdt,
    dueBdt: row.dueBdt,
    addresses: addressRows.map((a) => ({
      id: a.id,
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      altPhone: a.altPhone ?? undefined,
      addressLine: a.addressLine,
      area: a.area,
      city: a.city,
      district: a.district,
      postcode: a.postcode ?? undefined,
      isDefault: a.isDefault,
    })),
    joinedAt: iso(row.joinedAt)!,
    status: row.status,
    lastOrderAt: iso(row.lastOrderAt),
    notes: row.notes,
    // extras consumed by account/admin screens
    orders: orderRows.map((r) => mapOrderSummary(r, orderItemsRows.filter((i) => i.orderId === r.id))),
    walletTransactions: walletRows.map((w) => ({
      id: w.id,
      type: w.type,
      amountBdt: w.amountBdt,
      balanceAfterBdt: w.balanceAfterBdt,
      reference: w.reference,
      note: w.note,
      at: iso(w.at)!,
    })),
  } as Customer & { orders: Order[]; walletTransactions: unknown[] };
}

export async function getWishlist(customerId: string) {
  const db = await getDb();
  const rows = await db.select().from(wishlists).where(eq(wishlists.customerId, customerId));
  if (!rows.length) return [];
  const productRows = await db.select().from(products).where(inArray(products.id, rows.map((r) => r.productId)));
  return productRows.map((r) => mapProduct(r));
}

/* --------------------------- shipments, quotes, POs ----------------------- */

export async function listShipments(filters: { status?: string; mode?: string; q?: string } = {}) {
  const db = await getDb();
  const conditions: SQL[] = [];
  if (filters.status && filters.status !== "all") conditions.push(eq(shipments.status, filters.status as "in_transit"));
  if (filters.mode && filters.mode !== "all") conditions.push(eq(shipments.mode, filters.mode as "air_express"));
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(or(ilike(shipments.ref, term), ilike(shipments.awbOrBl, term), ilike(shipments.containerNo, term))!);
  }
  const rows = await db
    .select()
    .from(shipments)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(shipments.createdAt));
  return rows.map(mapShipment);
}

export function mapShipment(row: typeof shipments.$inferSelect): Shipment {
  return {
    id: row.id,
    ref: row.ref,
    mode: row.mode,
    status: row.status,
    originCity: row.originCity,
    destinationCity: row.destinationCity,
    carrier: row.carrier,
    awbOrBl: row.awbOrBl,
    containerNo: row.containerNo ?? undefined,
    cbm: row.cbm,
    weightGrams: row.weightGrams,
    chargeableWeightGrams: row.chargeableWeightGrams,
    freightCostBdt: row.freightCostBdt,
    dutyPaidBdt: row.dutyPaidBdt,
    orderIds: [],
    orderCount: row.orderCount,
    departedAt: iso(row.departedAt),
    etaAt: iso(row.etaAt),
    arrivedAt: iso(row.arrivedAt),
    clearedAt: iso(row.clearedAt),
    notes: row.notes,
    createdAt: iso(row.createdAt)!,
  };
}

export async function getShipmentById(id: string) {
  const db = await getDb();
  const [row] = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
  if (!row) return null;
  const linkedOrders = await db.select().from(orders).where(eq(orders.shipmentId, id));
  const items = linkedOrders.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, linkedOrders.map((o) => o.id)))
    : [];
  return {
    shipment: mapShipment(row),
    orders: linkedOrders.map((o) => mapOrderSummary(o, items.filter((i) => i.orderId === o.id))),
  };
}

export async function listQuotes(filters: { status?: string; q?: string } = {}) {
  const db = await getDb();
  const conditions: SQL[] = [];
  if (filters.status && filters.status !== "all") conditions.push(eq(quotes.status, filters.status as "new"));
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(or(ilike(quotes.customerName, term), ilike(quotes.ref, term), ilike(quotes.productName, term))!);
  }
  const rows = await db
    .select()
    .from(quotes)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(quotes.createdAt));
  return rows.map((r) => ({ ...r, createdAt: iso(r.createdAt)! } as unknown as QuoteRequest));
}

export async function listPurchaseOrders() {
  const db = await getDb();
  const rows = await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.placedAt));
  const items = await db.select().from(purchaseOrderItems);
  return rows.map(
    (r) =>
      ({
        id: r.id,
        ref: r.ref,
        supplierId: r.supplierId ?? "",
        supplierName: r.supplierName,
        orderIds: r.orderIds ?? [],
        items: items
          .filter((i) => i.purchaseOrderId === r.id)
          .map((i) => ({ productId: i.productId, title: i.title, quantity: i.quantity, unitCostCny: i.unitCostCny })),
        totalCny: r.totalCny,
        paidCny: r.paidCny,
        status: r.status,
        placedAt: iso(r.placedAt)!,
        expectedAt: iso(r.expectedAt),
        warehouse: r.warehouse,
        notes: r.notes,
      }) as PurchaseOrder,
  );
}

export async function listSuppliers() {
  const db = await getDb();
  const rows = await db.select().from(suppliers).orderBy(desc(suppliers.totalSpendCny));
  const counts = await db
    .select({ supplierId: products.supplierId, total: count() })
    .from(products)
    .groupBy(products.supplierId);
  const map = new Map(counts.map((c) => [c.supplierId, Number(c.total)]));
  return rows.map((r) => ({ ...r, joinedAt: iso(r.joinedAt)!, productCount: map.get(r.id) ?? 0 }));
}

export async function listReviews(filters: { status?: string } = {}) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(reviews)
    .where(filters.status && filters.status !== "all" ? eq(reviews.status, filters.status as "published") : undefined)
    .orderBy(desc(reviews.createdAt));
  return rows.map((r) => ({ ...r, createdAt: iso(r.createdAt)! }));
}

export async function listTickets(filters: { status?: string; q?: string } = {}) {
  const db = await getDb();
  const conditions: SQL[] = [];
  if (filters.status && filters.status !== "all") conditions.push(eq(tickets.status, filters.status as "open"));
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(or(ilike(tickets.subject, term), ilike(tickets.customerName, term), ilike(tickets.ref, term))!);
  }
  const rows = await db
    .select()
    .from(tickets)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(tickets.createdAt));
  const messages = await db.select().from(ticketMessages);
  return rows.map((t) => ({
    ...t,
    createdAt: iso(t.createdAt)!,
    messages: messages
      .filter((m) => m.ticketId === t.id)
      .map((m) => ({ id: m.id, author: m.author, role: m.role as "customer" | "agent", body: m.body, at: iso(m.at)! })),
  }));
}

export async function listWalletTransactions(filters: { customerId?: string; type?: string } = {}) {
  const db = await getDb();
  const conditions: SQL[] = [];
  if (filters.customerId) conditions.push(eq(walletTransactions.customerId, filters.customerId));
  if (filters.type && filters.type !== "all") conditions.push(eq(walletTransactions.type, filters.type as "topup"));
  const rows = await db
    .select()
    .from(walletTransactions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(walletTransactions.at))
    .limit(200);
  return rows.map((r) => ({ ...r, at: iso(r.at)! }));
}

/** Payment register: every order payment with the order + customer it belongs to. */
export async function listPayments(filters: { method?: string; status?: string; q?: string } = {}) {
  const db = await getDb();
  const conditions: SQL[] = [];
  if (filters.method && filters.method !== "all") conditions.push(eq(orderPayments.method, filters.method as "bkash"));
  if (filters.status && filters.status !== "all") conditions.push(eq(orderPayments.status, filters.status));
  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(ilike(orders.orderNo, term), ilike(orders.customerName, term), ilike(orderPayments.reference, term))!,
    );
  }
  const rows = await db
    .select({
      id: orderPayments.id,
      orderId: orderPayments.orderId,
      orderNo: orders.orderNo,
      customerName: orders.customerName,
      customerPhone: orders.customerPhone,
      amountBdt: orderPayments.amountBdt,
      method: orderPayments.method,
      reference: orderPayments.reference,
      status: orderPayments.status,
      at: orderPayments.at,
      orderTotalBdt: orders.totalBdt,
      orderPaidBdt: orders.paidBdt,
      orderStatus: orders.status,
      paymentStatus: orders.paymentStatus,
    })
    .from(orderPayments)
    .innerJoin(orders, eq(orderPayments.orderId, orders.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orderPayments.at))
    .limit(200);
  return rows.map((r) => ({ ...r, at: iso(r.at)! }));
}

export async function listCoupons() {
  const db = await getDb();
  const rows = await db.select().from(coupons).orderBy(desc(coupons.startsAt));
  return rows.map((r) => ({ ...r, startsAt: iso(r.startsAt)!, expiresAt: iso(r.expiresAt)! }));
}

export async function listWarehouses() {
  const db = await getDb();
  return db.select().from(warehouses);
}

export async function listStaff() {
  const db = await getDb();
  const rows = await db.select().from(staff).orderBy(asc(staff.role));
  return rows.map((r) => ({ ...r, lastActiveAt: iso(r.lastActiveAt)!, createdAt: iso(r.createdAt)! }));
}

export async function listAuditLogs(limit = 60) {
  const db = await getDb();
  const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.at)).limit(limit);
  return rows.map((r) => ({ ...r, at: iso(r.at)! }));
}

export async function listGroupBuysAdmin() {
  const db = await getDb();
  const rows = await db.select().from(groupBuys).orderBy(asc(groupBuys.expiresAt));
  return rows.map((r) => ({ ...r, expiresAt: iso(r.expiresAt)! }));
}

export async function listBannersAdmin() {
  const db = await getDb();
  return db.select().from(banners).orderBy(asc(banners.sortOrder));
}

export async function listPostsAdmin() {
  const db = await getDb();
  const rows = await db.select().from(posts).orderBy(desc(posts.publishedAt));
  return rows.map((r) => ({ ...r, publishedAt: iso(r.publishedAt)! }));
}

export async function listCategoriesAdmin() {
  const db = await getDb();
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const counts = await db
    .select({ categoryId: products.categoryId, total: count() })
    .from(products)
    .groupBy(products.categoryId);
  const map = new Map(counts.map((c) => [c.categoryId, Number(c.total)]));
  return rows.map((r) => ({ ...r, createdAt: iso(r.createdAt)!, productCount: map.get(r.id) ?? 0 }));
}

export async function listProductsAdmin(filters: ProductFilters = {}) {
  return listProducts({ ...filters, status: filters.status ?? "all", perPage: filters.perPage ?? 25 });
}

export async function logAudit(entry: {
  actor: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId?: string;
  meta?: string;
  ip?: string;
}) {
  const db = await getDb();
  await db.insert(auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    actor: entry.actor,
    actorRole: entry.actorRole,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? "",
    meta: entry.meta ?? "",
    ip: entry.ip ?? "127.0.0.1",
  });
}
