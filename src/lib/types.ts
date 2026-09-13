/** Core domain types for the ChinaBridge BD import / sourcing platform. */

export type ID = string;

export type Currency = "BDT" | "CNY" | "USD";

export type OrderChannel = "store" | "link_order" | "rfq" | "group_buy" | "wholesale";

export type ShippingMode = "air_express" | "air_standard" | "sea_lcl" | "sea_fcl";

export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "bank_transfer"
  | "card"
  | "wallet"
  | "cod";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "purchased" // bought from Chinese supplier
  | "china_warehouse" // arrived at our Guangzhou/Yiwu warehouse
  | "qc_passed" // quality check done
  | "consolidated" // packed into a consignment
  | "in_transit"
  | "customs_clearance"
  | "arrived_bd" // arrived at Dhaka/Benapole
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type QuoteStatus = "new" | "reviewing" | "quoted" | "won" | "lost";

export type ShipmentStatus =
  | "booking"
  | "loading"
  | "in_transit"
  | "at_port"
  | "customs"
  | "released"
  | "received_warehouse"
  | "cancelled";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";

export interface Category {
  id: ID;
  name: string;
  nameBn: string;
  slug: string;
  icon: string;
  image: string;
  description: string;
  featured: boolean;
  /** service fee % the platform charges for sourcing in this category */
  serviceFeePct: number;
  /** typical Bangladesh customs duty % (customs duty + regulatory duty snapshot) */
  dutyPct: number;
  parentId?: ID | null;
  productCount?: number;
}

export interface Supplier {
  id: ID;
  name: string;
  nameCn: string;
  platform: "1688" | "Taobao" | "Alibaba" | "PDD" | "Direct factory";
  city: string;
  contactPerson: string;
  phone: string;
  wechat: string;
  rating: number;
  totalOrders: number;
  totalSpendCny: number;
  onTimeRate: number;
  status: "active" | "paused" | "blacklisted";
  categories: string[];
  joinedAt: string;
}

export interface ProductVariant {
  id: ID;
  name: string;
  value: string;
  priceDeltaBdt: number;
  stock: number;
}

export interface Product {
  id: ID;
  sku: string;
  slug: string;
  title: string;
  titleBn?: string;
  description: string;
  categoryId: ID;
  supplierId: ID;
  brand: string;
  originCountry: string;
  /** source platform link (1688 / Taobao) */
  sourceUrl: string;
  images: string[];
  costPriceCny: number;
  /** our selling price in BDT, inclusive of sourcing fee, excludes shipping */
  priceBdt: number;
  compareAtPriceBdt?: number;
  /** shipping weight used for landed-cost estimation */
  weightGrams: number;
  cbm: number;
  moq: number;
  stock: number;
  unit: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  variants: ProductVariant[];
  status: "active" | "draft" | "out_of_stock" | "archived";
  featured: boolean;
  /** how many days to get it into our China warehouse */
  leadTimeDays: number;
  hsCode: string;
  createdAt: string;
  /** denormalised from the category so carts can price without extra lookups */
  dutyPct: number;
  serviceFeePct: number;
}

export interface OrderItem {
  id: ID;
  productId: ID;
  title: string;
  image: string;
  sku: string;
  variant?: string;
  unitPriceBdt: number;
  quantity: number;
  weightGrams: number;
  cbm: number;
}

export interface OrderEvent {
  id: ID;
  status: OrderStatus;
  title: string;
  note?: string;
  location?: string;
  at: string;
  actor: string;
}

export interface OrderPayment {
  id: ID;
  amountBdt: number;
  method: PaymentMethod;
  reference: string;
  status: "pending" | "success" | "failed" | "refunded";
  at: string;
}

export interface Order {
  id: ID;
  orderNo: string;
  customerId: ID;
  customerName: string;
  customerPhone: string;
  channel: OrderChannel;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingMode: ShippingMode;
  items: OrderItem[];
  subtotalBdt: number;
  serviceFeeBdt: number;
  shippingFeeBdt: number;
  dutyBdt: number;
  discountBdt: number;
  totalBdt: number;
  paidBdt: number;
  weightGrams: number;
  cbm: number;
  shippingAddress: Address;
  payments: OrderPayment[];
  events: OrderEvent[];
  shipmentId?: ID | null;
  /** consignment/container reference, e.g. CB-AIR-2418 */
  consignmentRef?: string;
  /** China-side tracking (supplier -> our warehouse) */
  chinaTrackingNo?: string;
  /** BD-side courier tracking */
  courier?: string;
  courierTrackingNo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  etaAt?: string;
}

export interface Address {
  id?: ID;
  label?: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  addressLine: string;
  area: string;
  city: string;
  district: string;
  postcode?: string;
  isDefault?: boolean;
}

export interface Customer {
  id: ID;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  type: "retail" | "wholesale" | "reseller";
  tier: "bronze" | "silver" | "gold" | "platinum";
  walletBalanceBdt: number;
  totalOrders: number;
  totalSpentBdt: number;
  dueBdt: number;
  addresses: Address[];
  joinedAt: string;
  status: "active" | "blocked";
  lastOrderAt?: string;
  notes?: string;
}

export interface Shipment {
  id: ID;
  ref: string;
  mode: ShippingMode;
  status: ShipmentStatus;
  originCity: string;
  destinationCity: string;
  carrier: string;
  awbOrBl: string;
  containerNo?: string;
  cbm: number;
  weightGrams: number;
  chargeableWeightGrams: number;
  freightCostBdt: number;
  dutyPaidBdt: number;
  orderIds: ID[];
  orderCount: number;
  departedAt?: string;
  etaAt?: string;
  arrivedAt?: string;
  clearedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: ID;
  ref: string;
  supplierId: ID;
  supplierName: string;
  orderIds: ID[];
  items: { productId: ID; title: string; quantity: number; unitCostCny: number }[];
  totalCny: number;
  paidCny: number;
  status: "draft" | "placed" | "paid" | "shipped" | "received" | "cancelled";
  placedAt: string;
  expectedAt?: string;
  warehouse: string;
  notes?: string;
}

export interface QuoteRequest {
  id: ID;
  ref: string;
  customerName: string;
  phone: string;
  email?: string;
  sourceUrl: string;
  sourcePlatform: "1688" | "Taobao" | "Alibaba" | "PDD" | "Other";
  productName: string;
  quantity: number;
  targetPriceBdt?: number;
  notes?: string;
  status: QuoteStatus;
  quotedUnitPriceBdt?: number;
  quotedTotalBdt?: number;
  assignedTo?: string;
  createdAt: string;
}

export interface GroupBuy {
  id: ID;
  title: string;
  slug: string;
  productId: ID;
  image: string;
  unitPriceBdt: number;
  groupPriceBdt: number;
  minMembers: number;
  joined: number;
  expiresAt: string;
  status: "live" | "successful" | "failed" | "scheduled";
}

export interface Coupon {
  id: ID;
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  minOrderBdt: number;
  usageLimit: number;
  used: number;
  startsAt: string;
  expiresAt: string;
  status: "active" | "expired" | "scheduled" | "disabled";
  appliesTo: "all" | "first_order" | "category";
}

export interface WalletTransaction {
  id: ID;
  customerId: ID;
  customerName: string;
  type: "topup" | "order_payment" | "refund" | "cashback" | "withdraw" | "adjustment";
  amountBdt: number;
  balanceAfterBdt: number;
  method?: PaymentMethod;
  reference: string;
  at: string;
  note?: string;
}

export interface Review {
  id: ID;
  productId: ID;
  productTitle: string;
  customerId: ID;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  images?: string[];
  status: "published" | "pending" | "rejected";
  helpful: number;
  createdAt: string;
}

export interface Ticket {
  id: ID;
  ref: string;
  customerId: ID;
  customerName: string;
  orderNo?: string;
  subject: string;
  category: "payment" | "shipping" | "product" | "refund" | "other";
  priority: "low" | "normal" | "high" | "urgent";
  status: TicketStatus;
  messages: { id: ID; author: string; role: "customer" | "agent"; body: string; at: string }[];
  assignedTo?: string;
  createdAt: string;
}

export interface Banner {
  id: ID;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  placement: "hero" | "home_mid" | "category_top" | "checkout";
  status: "active" | "inactive";
  order: number;
}

export interface Post {
  id: ID;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover: string;
  author: string;
  category: string;
  tags: string[];
  status: "published" | "draft";
  readMinutes: number;
  publishedAt: string;
  views: number;
}

export interface Warehouse {
  id: ID;
  name: string;
  code: string;
  country: string;
  city: string;
  address: string;
  type: "china_consolidation" | "bd_hub" | "bd_customs_bond" | "pickup_point";
  capacityCbm: number;
  usedCbm: number;
  staff: number;
  status: "active" | "inactive";
  contact: string;
}

export interface Staff {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: "super_admin" | "admin" | "ops_manager" | "procurement" | "support" | "finance" | "content";
  department: string;
  permissions: string[];
  status: "active" | "invited" | "suspended";
  lastActiveAt: string;
  avatar?: string;
}

export interface AuditLog {
  id: ID;
  actor: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  ip: string;
  at: string;
  meta?: string;
}

export interface ShippingRate {
  mode: ShippingMode;
  label: string;
  labelBn: string;
  rateBdt: number;
  /** per kg for air, per cbm for sea */
  unit: "kg" | "cbm";
  minChargeBdt: number;
  transitDaysMin: number;
  transitDaysMax: number;
  description: string;
}

export interface Settings {
  brandName: string;
  brandTagline: string;
  supportPhone: string;
  supportEmail: string;
  whatsapp: string;
  address: string;
  cnyToBdt: number;
  usdToBdt: number;
  serviceFeePct: number;
  minServiceFeeBdt: number;
  vatPct: number;
  aitPct: number;
  insurancePct: number;
  freeShippingThresholdBdt: number;
  codFeePct: number;
  advancePaymentPct: number;
  warehouseStorageFreeDays: number;
  storageFeePerCbmBdt: number;
  homeDeliveryDhakaBdt: number;
  homeDeliveryOutsideBdt: number;
  pickupDiscountBdt: number;
  exchangeRateUpdatedAt: string;
  maintenanceMode: boolean;
  guestCheckout: boolean;
}

export interface DashboardStats {
  revenueBdt: number;
  orders: number;
  newCustomers: number;
  activeShipments: number;
  pendingQuotes: number;
  openTickets: number;
  walletLiabilityBdt: number;
  codDueBdt: number;
  avgOrderValueBdt: number;
  fulfilmentRatePct: number;
  revenueSeries: { date: string; revenue: number; orders: number }[];
  statusBreakdown: { status: string; count: number }[];
  categoryMix: { category: string; revenue: number }[];
  topProducts: { title: string; sold: number; revenue: number }[];
  recentOrders: Order[];
  shipmentsInTransit: Shipment[];
  channelMix: { channel: string; orders: number }[];
}
