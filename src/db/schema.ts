import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* --------------------------------- enums --------------------------------- */

export const currencyEnum = pgEnum("currency", ["BDT", "CNY", "USD"]);
export const orderChannelEnum = pgEnum("order_channel", [
  "store",
  "link_order",
  "rfq",
  "group_buy",
  "wholesale",
]);
export const shippingModeEnum = pgEnum("shipping_mode", [
  "air_express",
  "air_standard",
  "sea_lcl",
  "sea_fcl",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "bkash",
  "nagad",
  "rocket",
  "bank_transfer",
  "card",
  "wallet",
  "cod",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "partial", "paid", "refunded"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "confirmed",
  "purchased",
  "china_warehouse",
  "qc_passed",
  "consolidated",
  "in_transit",
  "customs_clearance",
  "arrived_bd",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
]);
export const quoteStatusEnum = pgEnum("quote_status", ["new", "reviewing", "quoted", "won", "lost"]);
export const shipmentStatusEnum = pgEnum("shipment_status", [
  "booking",
  "loading",
  "in_transit",
  "at_port",
  "customs",
  "released",
  "received_warehouse",
  "cancelled",
]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "pending", "resolved", "closed"]);
export const productStatusEnum = pgEnum("product_status", ["active", "draft", "out_of_stock", "archived"]);
export const supplierStatusEnum = pgEnum("supplier_status", ["active", "paused", "blacklisted"]);
export const customerTierEnum = pgEnum("customer_tier", ["bronze", "silver", "gold", "platinum"]);
export const customerStatusEnum = pgEnum("customer_status", ["active", "blocked"]);
export const customerTypeEnum = pgEnum("customer_type", ["retail", "wholesale", "reseller"]);
export const reviewStatusEnum = pgEnum("review_status", ["published", "pending", "rejected"]);
export const walletTxnTypeEnum = pgEnum("wallet_txn_type", [
  "topup",
  "order_payment",
  "refund",
  "cashback",
  "withdraw",
  "adjustment",
]);
export const placementEnum = pgEnum("banner_placement", ["hero", "home_mid", "category_top", "checkout"]);
export const contentStatusEnum = pgEnum("content_status", ["active", "inactive", "published", "draft"]);
export const poStatusEnum = pgEnum("po_status", ["draft", "placed", "paid", "shipped", "received", "cancelled"]);
export const warehouseTypeEnum = pgEnum("warehouse_type", [
  "china_consolidation",
  "bd_hub",
  "bd_customs_bond",
  "pickup_point",
]);
export const staffRoleEnum = pgEnum("staff_role", [
  "super_admin",
  "admin",
  "ops_manager",
  "procurement",
  "support",
  "finance",
  "content",
]);
export const staffStatusEnum = pgEnum("staff_status", ["active", "invited", "suspended"]);

/* ------------------------------- settings -------------------------------- */

export const settings = pgTable("settings", {
  id: text("id").primaryKey().default("default"),
  brandName: text("brand_name").notNull().default("ChinaBridge BD"),
  brandTagline: text("brand_tagline").notNull().default(""),
  supportPhone: text("support_phone").notNull().default(""),
  supportEmail: text("support_email").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  address: text("address").notNull().default(""),
  cnyToBdt: doublePrecision("cny_to_bdt").notNull().default(17.4),
  usdToBdt: doublePrecision("usd_to_bdt").notNull().default(122),
  serviceFeePct: doublePrecision("service_fee_pct").notNull().default(10),
  minServiceFeeBdt: doublePrecision("min_service_fee_bdt").notNull().default(150),
  vatPct: doublePrecision("vat_pct").notNull().default(15),
  aitPct: doublePrecision("ait_pct").notNull().default(3),
  insurancePct: doublePrecision("insurance_pct").notNull().default(1.5),
  freeShippingThresholdBdt: doublePrecision("free_shipping_threshold_bdt").notNull().default(50000),
  codFeePct: doublePrecision("cod_fee_pct").notNull().default(2),
  advancePaymentPct: doublePrecision("advance_payment_pct").notNull().default(50),
  warehouseStorageFreeDays: integer("warehouse_storage_free_days").notNull().default(15),
  storageFeePerCbmBdt: doublePrecision("storage_fee_per_cbm_bdt").notNull().default(2200),
  homeDeliveryDhakaBdt: doublePrecision("home_delivery_dhaka_bdt").notNull().default(80),
  homeDeliveryOutsideBdt: doublePrecision("home_delivery_outside_bdt").notNull().default(160),
  pickupDiscountBdt: doublePrecision("pickup_discount_bdt").notNull().default(50),
  exchangeRateUpdatedAt: timestamp("exchange_rate_updated_at", { withTimezone: true }).notNull().defaultNow(),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  guestCheckout: boolean("guest_checkout").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------- catalogue ------------------------------- */

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    nameBn: text("name_bn").notNull().default(""),
    slug: text("slug").notNull(),
    icon: text("icon").notNull().default("📦"),
    image: text("image").notNull().default(""),
    description: text("description").notNull().default(""),
    featured: boolean("featured").notNull().default(false),
    serviceFeePct: doublePrecision("service_fee_pct").notNull().default(10),
    dutyPct: doublePrecision("duty_pct").notNull().default(25),
    parentId: text("parent_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ slugIdx: uniqueIndex("categories_slug_idx").on(t.slug) }),
);

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameCn: text("name_cn").notNull().default(""),
  platform: text("platform").notNull().default("1688"),
  city: text("city").notNull().default("Guangzhou"),
  contactPerson: text("contact_person").notNull().default(""),
  phone: text("phone").notNull().default(""),
  wechat: text("wechat").notNull().default(""),
  rating: doublePrecision("rating").notNull().default(4.5),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpendCny: doublePrecision("total_spend_cny").notNull().default(0),
  onTimeRate: doublePrecision("on_time_rate").notNull().default(95),
  status: supplierStatusEnum("status").notNull().default("active"),
  categories: jsonb("categories").$type<string[]>().notNull().default([]),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  notes: text("notes").notNull().default(""),
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    sku: text("sku").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    titleBn: text("title_bn"),
    description: text("description").notNull().default(""),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    supplierId: text("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    brand: text("brand").notNull().default(""),
    originCountry: text("origin_country").notNull().default("China"),
    sourceUrl: text("source_url").notNull().default(""),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    costPriceCny: doublePrecision("cost_price_cny").notNull().default(0),
    priceBdt: integer("price_bdt").notNull().default(0),
    compareAtPriceBdt: integer("compare_at_price_bdt"),
    weightGrams: integer("weight_grams").notNull().default(500),
    cbm: doublePrecision("cbm").notNull().default(0.001),
    moq: integer("moq").notNull().default(1),
    stock: integer("stock").notNull().default(0),
    unit: text("unit").notNull().default("piece"),
    rating: doublePrecision("rating").notNull().default(4.5),
    reviewCount: integer("review_count").notNull().default(0),
    soldCount: integer("sold_count").notNull().default(0),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    status: productStatusEnum("status").notNull().default("active"),
    featured: boolean("featured").notNull().default(false),
    leadTimeDays: integer("lead_time_days").notNull().default(6),
    hsCode: text("hs_code").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(t.slug),
    categoryIdx: index("products_category_idx").on(t.categoryId),
    statusIdx: index("products_status_idx").on(t.status),
  }),
);

export const productVariants = pgTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  value: text("value").notNull(),
  priceDeltaBdt: integer("price_delta_bdt").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ------------------------------- customers ------------------------------- */

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  avatar: text("avatar"),
  type: customerTypeEnum("type").notNull().default("retail"),
  tier: customerTierEnum("tier").notNull().default("bronze"),
  walletBalanceBdt: integer("wallet_balance_bdt").notNull().default(0),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpentBdt: integer("total_spent_bdt").notNull().default(0),
  dueBdt: integer("due_bdt").notNull().default(0),
  status: customerStatusEnum("status").notNull().default("active"),
  notes: text("notes").notNull().default(""),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  lastOrderAt: timestamp("last_order_at", { withTimezone: true }),
});

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  altPhone: text("alt_phone"),
  addressLine: text("address_line").notNull(),
  area: text("area").notNull().default(""),
  city: text("city").notNull().default("Dhaka"),
  district: text("district").notNull().default("Dhaka"),
  postcode: text("postcode"),
  isDefault: boolean("is_default").notNull().default(false),
});

/* --------------------------------- orders -------------------------------- */

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNo: text("order_no").notNull(),
    customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull().default(""),
    customerPhone: text("customer_phone").notNull().default(""),
    channel: orderChannelEnum("channel").notNull().default("store"),
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
    shippingMode: shippingModeEnum("shipping_mode").notNull().default("air_standard"),
    subtotalBdt: integer("subtotal_bdt").notNull().default(0),
    serviceFeeBdt: integer("service_fee_bdt").notNull().default(0),
    shippingFeeBdt: integer("shipping_fee_bdt").notNull().default(0),
    dutyBdt: integer("duty_bdt").notNull().default(0),
    vatBdt: integer("vat_bdt").notNull().default(0),
    discountBdt: integer("discount_bdt").notNull().default(0),
    totalBdt: integer("total_bdt").notNull().default(0),
    paidBdt: integer("paid_bdt").notNull().default(0),
    weightGrams: integer("weight_grams").notNull().default(0),
    cbm: doublePrecision("cbm").notNull().default(0),
    shippingAddress: jsonb("shipping_address").$type<Record<string, string>>().notNull(),
    shipmentId: text("shipment_id"),
    consignmentRef: text("consignment_ref"),
    chinaTrackingNo: text("china_tracking_no"),
    courier: text("courier"),
    courierTrackingNo: text("courier_tracking_no"),
    couponCode: text("coupon_code"),
    sourceUrl: text("source_url"),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    etaAt: timestamp("eta_at", { withTimezone: true }),
  },
  (t) => ({
    orderNoIdx: uniqueIndex("orders_order_no_idx").on(t.orderNo),
    statusIdx: index("orders_status_idx").on(t.status),
    customerIdx: index("orders_customer_idx").on(t.customerId),
  }),
);

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  title: text("title").notNull(),
  image: text("image").notNull().default(""),
  sku: text("sku").notNull().default(""),
  variant: text("variant"),
  unitPriceBdt: integer("unit_price_bdt").notNull().default(0),
  quantity: integer("quantity").notNull().default(1),
  weightGrams: integer("weight_grams").notNull().default(0),
  cbm: doublePrecision("cbm").notNull().default(0),
});

export const orderEvents = pgTable(
  "order_events",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    title: text("title").notNull(),
    note: text("note"),
    location: text("location"),
    actor: text("actor").notNull().default("system"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ orderIdx: index("order_events_order_idx").on(t.orderId) }),
);

export const orderPayments = pgTable("order_payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  amountBdt: integer("amount_bdt").notNull().default(0),
  method: paymentMethodEnum("method").notNull().default("bkash"),
  reference: text("reference").notNull().default(""),
  status: text("status").notNull().default("success"),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

export const shipments = pgTable("shipments", {
  id: text("id").primaryKey(),
  ref: text("ref").notNull(),
  mode: shippingModeEnum("mode").notNull().default("air_standard"),
  status: shipmentStatusEnum("status").notNull().default("booking"),
  originCity: text("origin_city").notNull().default("Guangzhou"),
  destinationCity: text("destination_city").notNull().default("Dhaka"),
  carrier: text("carrier").notNull().default(""),
  awbOrBl: text("awb_or_bl").notNull().default(""),
  containerNo: text("container_no"),
  cbm: doublePrecision("cbm").notNull().default(0),
  weightGrams: integer("weight_grams").notNull().default(0),
  chargeableWeightGrams: integer("chargeable_weight_grams").notNull().default(0),
  freightCostBdt: integer("freight_cost_bdt").notNull().default(0),
  dutyPaidBdt: integer("duty_paid_bdt").notNull().default(0),
  orderCount: integer("order_count").notNull().default(0),
  notes: text("notes").notNull().default(""),
  departedAt: timestamp("departed_at", { withTimezone: true }),
  etaAt: timestamp("eta_at", { withTimezone: true }),
  arrivedAt: timestamp("arrived_at", { withTimezone: true }),
  clearedAt: timestamp("cleared_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: text("id").primaryKey(),
  ref: text("ref").notNull(),
  supplierId: text("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  supplierName: text("supplier_name").notNull().default(""),
  orderIds: jsonb("order_ids").$type<string[]>().notNull().default([]),
  totalCny: doublePrecision("total_cny").notNull().default(0),
  paidCny: doublePrecision("paid_cny").notNull().default(0),
  status: poStatusEnum("status").notNull().default("draft"),
  warehouse: text("warehouse").notNull().default("Guangzhou DC-1"),
  notes: text("notes").notNull().default(""),
  placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
  expectedAt: timestamp("expected_at", { withTimezone: true }),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: text("id").primaryKey(),
  purchaseOrderId: text("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().default(""),
  title: text("title").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitCostCny: doublePrecision("unit_cost_cny").notNull().default(0),
});

/* ------------------------- quotes, groups, marketing --------------------- */

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  ref: text("ref").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  sourceUrl: text("source_url").notNull().default(""),
  sourcePlatform: text("source_platform").notNull().default("1688"),
  productName: text("product_name").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  targetPriceBdt: integer("target_price_bdt"),
  notes: text("notes").notNull().default(""),
  status: quoteStatusEnum("status").notNull().default("new"),
  quotedUnitPriceBdt: integer("quoted_unit_price_bdt"),
  quotedTotalBdt: integer("quoted_total_bdt"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const groupBuys = pgTable("group_buys", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  image: text("image").notNull().default(""),
  unitPriceBdt: integer("unit_price_bdt").notNull().default(0),
  groupPriceBdt: integer("group_price_bdt").notNull().default(0),
  minMembers: integer("min_members").notNull().default(10),
  joined: integer("joined").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("live"),
});

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  type: text("type").notNull().default("percent"),
  value: doublePrecision("value").notNull().default(0),
  minOrderBdt: integer("min_order_bdt").notNull().default(0),
  usageLimit: integer("usage_limit").notNull().default(100),
  used: integer("used").notNull().default(0),
  appliesTo: text("applies_to").notNull().default("all"),
  status: text("status").notNull().default("active"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull().defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull().default(""),
  type: walletTxnTypeEnum("type").notNull().default("topup"),
  amountBdt: integer("amount_bdt").notNull().default(0),
  balanceAfterBdt: integer("balance_after_bdt").notNull().default(0),
  method: paymentMethodEnum("method"),
  reference: text("reference").notNull().default(""),
  note: text("note").notNull().default(""),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  productTitle: text("product_title").notNull().default(""),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull().default(""),
  rating: integer("rating").notNull().default(5),
  title: text("title").notNull().default(""),
  body: text("body").notNull().default(""),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  status: reviewStatusEnum("status").notNull().default("published"),
  helpful: integer("helpful").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* --------------------------------- support ------------------------------- */

export const tickets = pgTable("tickets", {
  id: text("id").primaryKey(),
  ref: text("ref").notNull(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull().default(""),
  orderNo: text("order_no"),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("other"),
  priority: text("priority").notNull().default("normal"),
  status: ticketStatusEnum("status").notNull().default("open"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  role: text("role").notNull().default("customer"),
  body: text("body").notNull(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------ CMS & ops -------------------------------- */

export const banners = pgTable("banners", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  image: text("image").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default("Shop now"),
  ctaHref: text("cta_href").notNull().default("/shop"),
  placement: placementEnum("placement").notNull().default("hero"),
  status: text("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  cover: text("cover").notNull().default(""),
  author: text("author").notNull().default("ChinaBridge Team"),
  category: text("category").notNull().default("Sourcing guide"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("published"),
  readMinutes: integer("read_minutes").notNull().default(5),
  views: integer("views").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

export const warehouses = pgTable("warehouses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  country: text("country").notNull().default("China"),
  city: text("city").notNull().default("Guangzhou"),
  address: text("address").notNull().default(""),
  type: warehouseTypeEnum("type").notNull().default("china_consolidation"),
  capacityCbm: doublePrecision("capacity_cbm").notNull().default(500),
  usedCbm: doublePrecision("used_cbm").notNull().default(0),
  staff: integer("staff").notNull().default(4),
  status: text("status").notNull().default("active"),
  contact: text("contact").notNull().default(""),
});

export const staff = pgTable("staff", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  role: staffRoleEnum("role").notNull().default("support"),
  department: text("department").notNull().default("Operations"),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  status: staffStatusEnum("status").notNull().default("active"),
  passwordHash: text("password_hash").notNull().default(""),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull().default("system"),
  actorRole: text("actor_role").notNull().default("admin"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id").notNull().default(""),
  ip: text("ip").notNull().default("127.0.0.1"),
  meta: text("meta").notNull().default(""),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  source: text("source").notNull().default("footer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------- relations ------------------------------- */

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "parent" }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
  purchaseOrders: many(purchaseOrders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  walletTransactions: many(walletTransactions),
  tickets: many(tickets),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  customer: one(customers, { fields: [addresses.customerId], references: [customers.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
  events: many(orderEvents),
  payments: many(orderPayments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));

export const orderPaymentsRelations = relations(orderPayments, ({ one }) => ({
  order: one(orders, { fields: [orderPayments.orderId], references: [orders.id] }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [purchaseOrders.supplierId], references: [suppliers.id] }),
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  customer: one(customers, { fields: [reviews.customerId], references: [customers.id] }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  customer: one(customers, { fields: [tickets.customerId], references: [customers.id] }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  customer: one(customers, { fields: [walletTransactions.customerId], references: [customers.id] }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  customer: one(customers, { fields: [wishlists.customerId], references: [customers.id] }),
  product: one(products, { fields: [wishlists.productId], references: [products.id] }),
}));

/* --------------------------- inferred row types -------------------------- */

export type SettingsRow = typeof settings.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type SupplierRow = typeof suppliers.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type ProductVariantRow = typeof productVariants.$inferSelect;
export type CustomerRow = typeof customers.$inferSelect;
export type AddressRow = typeof addresses.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type OrderEventRow = typeof orderEvents.$inferSelect;
export type OrderPaymentRow = typeof orderPayments.$inferSelect;
export type ShipmentRow = typeof shipments.$inferSelect;
export type PurchaseOrderRow = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItemRow = typeof purchaseOrderItems.$inferSelect;
export type QuoteRow = typeof quotes.$inferSelect;
export type GroupBuyRow = typeof groupBuys.$inferSelect;
export type CouponRow = typeof coupons.$inferSelect;
export type WalletTransactionRow = typeof walletTransactions.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;
export type TicketRow = typeof tickets.$inferSelect;
export type TicketMessageRow = typeof ticketMessages.$inferSelect;
export type BannerRow = typeof banners.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
export type WarehouseRow = typeof warehouses.$inferSelect;
export type StaffRow = typeof staff.$inferSelect;
export type AuditLogRow = typeof auditLogs.$inferSelect;
export type NewsletterSubscriberRow = typeof newsletterSubscribers.$inferSelect;
export type WishlistRow = typeof wishlists.$inferSelect;
