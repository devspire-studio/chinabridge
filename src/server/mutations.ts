import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import {
  addresses,
  categories,
  coupons,
  customers,
  getDb,
  newsletterSubscribers,
  orderEvents,
  orderItems,
  orderPayments,
  orders,
  products,
  quotes,
  ticketMessages,
  tickets,
  walletTransactions,
} from "@/db";
import { ORDER_STATUS_FLOW } from "@/lib/format";
import { priceStoreOrder, type StoreLine } from "@/lib/pricing";
import type { Address, OrderStatus, PaymentMethod, ShippingMode } from "@/lib/types";

import { getOrderById, logAudit } from "./queries";
import { getSettings } from "./settings";

export interface CreateOrderInput {
  items: { productId: string; quantity: number; variant?: string }[];
  shippingMode: ShippingMode;
  address: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  channel?: "store" | "link_order" | "rfq" | "group_buy" | "wholesale";
  sourceUrl?: string;
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  guestEmail?: string;
}

export async function createOrder(input: CreateOrderInput) {
  const db = await getDb();
  const settings = await getSettings();

  const productRows = await db
    .select()
    .from(products)
    .where(inArray(products.id, input.items.map((i) => i.productId)));
  if (!productRows.length) throw new Error("No valid products in cart");

  const categoryRows = await db
    .select()
    .from(categories)
    .where(inArray(categories.id, productRows.map((p) => p.categoryId)));
  const categoryMap = new Map(categoryRows.map((c) => [c.id, c]));

  const lines: StoreLine[] = input.items.flatMap((item): StoreLine[] => {
      const product = productRows.find((p) => p.id === item.productId);
      if (!product) return [];
      const category = categoryMap.get(product.categoryId);
      const quantity = Math.max(1, Math.min(9999, Math.round(item.quantity)));
      return [{
        productId: product.id,
        title: product.title,
        image: (product.images ?? [])[0] ?? "",
        sku: product.sku,
        variant: item.variant,
        unitPriceBdt: product.priceBdt,
        costPriceCny: product.costPriceCny,
        quantity,
        weightGrams: product.weightGrams,
        cbm: product.cbm,
        dutyPct: category?.dutyPct ?? 25,
        serviceFeePct: category?.serviceFeePct ?? settings.serviceFeePct,
      }];
    });

  const outsideDhaka = !["dhaka", "ঢাকা"].includes((input.address.city ?? "").toLowerCase());
  const isCod = input.paymentMethod === "cod";
  const coupon = input.couponCode ? await findCoupon(input.couponCode) : null;
  const provisional = priceStoreOrder({ lines, mode: input.shippingMode, settings, cod: isCod, outsideDhaka });
  const discount = coupon && provisional.subtotalBdt >= coupon.minOrderBdt ? couponDiscount(coupon, provisional.subtotalBdt) : 0;

  const pricing = priceStoreOrder({
    lines,
    mode: input.shippingMode,
    settings,
    cod: isCod,
    outsideDhaka,
    discountBdt: discount,
  });

  const [{ total }] = await db.select({ total: count() }).from(orders);
  const orderNo = `CB-${25000 + Number(total) * 7 + 1}`;
  const id = `ord_${Date.now().toString(36)}`;
  const now = new Date();
  const walletPayment = input.paymentMethod === "wallet";

  let customerId = input.customerId ?? null;
  let customerName = input.customerName ?? input.address.fullName;
  let customerPhone = input.customerPhone ?? input.address.phone;

  // guest orders create / reuse a lightweight customer record keyed by phone
  if (!customerId && customerPhone) {
    const [existing] = await db.select().from(customers).where(eq(customers.phone, customerPhone)).limit(1);
    if (existing) {
      customerId = existing.id;
      customerName = existing.name;
    } else {
      customerId = `cus_${Date.now().toString(36)}`;
      await db.insert(customers).values({
        id: customerId,
        name: customerName,
        phone: customerPhone,
        email: input.guestEmail ?? "",
        type: "retail",
        tier: "bronze",
        joinedAt: now,
      });
    }
  }

  const initialStatus: OrderStatus = walletPayment ? "confirmed" : "pending_payment";
  const paidBdt = walletPayment ? pricing.totalBdt : 0;

  await db.insert(orders).values({
    id,
    orderNo,
    customerId,
    customerName,
    customerPhone,
    channel: input.channel ?? "store",
    status: initialStatus,
    paymentStatus: walletPayment ? "paid" : "unpaid",
    shippingMode: input.shippingMode,
    subtotalBdt: pricing.subtotalBdt,
    serviceFeeBdt: pricing.serviceFeeBdt,
    shippingFeeBdt: pricing.freightBdt,
    dutyBdt: pricing.dutyBdt,
    vatBdt: pricing.vatBdt,
    discountBdt: pricing.discountBdt,
    totalBdt: pricing.totalBdt,
    paidBdt,
    weightGrams: pricing.weightGrams,
    cbm: pricing.cbm,
    shippingAddress: {
      fullName: input.address.fullName,
      phone: input.address.phone,
      addressLine: input.address.addressLine,
      area: input.address.area,
      city: input.address.city,
      district: input.address.district,
      postcode: input.address.postcode ?? "",
    },
    couponCode: coupon?.code ?? null,
    sourceUrl: input.sourceUrl ?? null,
    notes: input.notes ?? "",
    createdAt: now,
    updatedAt: now,
    etaAt: new Date(now.getTime() + pricing.transitDaysMax * 86400000),
  });

  await db.insert(orderItems).values(
    lines.map((line, index) => ({
      id: `${id}_it${index + 1}`,
      orderId: id,
      productId: line.productId,
      title: line.title,
      image: line.image,
      sku: line.sku,
      variant: line.variant ?? null,
      unitPriceBdt: line.unitPriceBdt,
      quantity: line.quantity,
      weightGrams: line.weightGrams,
      cbm: line.cbm,
    })),
  );

  await db.insert(orderEvents).values(
    walletPayment
      ? [
          {
            id: `${id}_ev1`,
            orderId: id,
            status: "confirmed" as const,
            title: "Order confirmed",
            note: "Paid in full from ChinaBridge wallet. Sourcing started.",
            location: "Dhaka office",
            actor: "System",
            at: now,
          },
        ]
      : [
          {
            id: `${id}_ev1`,
            orderId: id,
            status: "pending_payment" as const,
            title: "Order placed",
            note: `Awaiting ${settings.advancePaymentPct}% advance to start sourcing.`,
            location: "Online store",
            actor: "System",
            at: now,
          },
        ],
  );

  if (walletPayment && customerId) {
    await debitWallet(customerId, pricing.totalBdt, `Order ${orderNo} payment`, orderNo);
    await db.insert(orderPayments).values({
      id: `${id}_pay1`,
      orderId: id,
      amountBdt: pricing.totalBdt,
      method: "wallet",
      reference: `WALLET-${orderNo}`,
      status: "success",
      at: now,
    });
  }

  if (coupon) {
    await db
      .update(coupons)
      .set({ used: coupon.used + 1 })
      .where(eq(coupons.id, coupon.id));
  }

  // keep stock & counters honest
  for (const line of lines) {
    await db
      .update(products)
      .set({ stock: sql`greatest(${products.stock} - ${line.quantity}, 0)`, soldCount: sql`${products.soldCount} + ${line.quantity}` })
      .where(eq(products.id, line.productId));
  }
  if (customerId) {
    await db
      .update(customers)
      .set({
        totalOrders: sql`${customers.totalOrders} + 1`,
        totalSpentBdt: sql`${customers.totalSpentBdt} + ${pricing.totalBdt}`,
        lastOrderAt: now,
      })
      .where(eq(customers.id, customerId));
  }

  await logAudit({
    actor: customerName,
    actorRole: "customer",
    action: "order.create",
    entity: "orders",
    entityId: id,
    meta: `${orderNo} · ${pricing.totalBdt} BDT`,
  });

  return { order: await getOrderById(id), orderNo, total: pricing.totalBdt, pricing };
}

async function findCoupon(code: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code.trim().toUpperCase()), eq(coupons.status, "active")))
    .limit(1);
  return row ?? null;
}

function couponDiscount(coupon: { type: string; value: number }, subtotal: number) {
  if (coupon.type === "percent") return Math.round((subtotal * coupon.value) / 100);
  if (coupon.type === "fixed") return Math.min(coupon.value, subtotal);
  return 0;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  opts: { note?: string; location?: string; actor?: string; courier?: string; courierTrackingNo?: string; etaAt?: string } = {},
) {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");

  const step = ORDER_STATUS_FLOW.find((s) => s.status === status);
  const now = new Date();

  await db
    .update(orders)
    .set({
      status,
      updatedAt: now,
      ...(opts.courier ? { courier: opts.courier } : {}),
      ...(opts.courierTrackingNo ? { courierTrackingNo: opts.courierTrackingNo } : {}),
      ...(opts.etaAt ? { etaAt: new Date(opts.etaAt) } : {}),
      ...(status === "delivered" ? { paymentStatus: "paid" as const, paidBdt: order.totalBdt } : {}),
    })
    .where(eq(orders.id, orderId));

  await db.insert(orderEvents).values({
    id: `oev_${Date.now().toString(36)}`,
    orderId,
    status,
    title: step?.label ?? status.replace(/_/g, " "),
    note: opts.note ?? step?.hint ?? "",
    location: opts.location ?? "ChinaBridge BD",
    actor: opts.actor ?? "Admin console",
    at: now,
  });

  await logAudit({
    actor: opts.actor ?? "Admin console",
    actorRole: "admin",
    action: "order.status.update",
    entity: "orders",
    entityId: orderId,
    meta: `${order.orderNo} → ${status}`,
  });

  return getOrderById(orderId);
}

export async function addOrderPayment(
  orderId: string,
  payment: { amountBdt: number; method: PaymentMethod; reference?: string; note?: string; actor?: string },
) {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");

  const paid = order.paidBdt + payment.amountBdt;
  const paymentStatus = paid >= order.totalBdt ? "paid" : paid > 0 ? "partial" : "unpaid";

  await db.insert(orderPayments).values({
    id: `pay_${Date.now().toString(36)}`,
    orderId,
    amountBdt: payment.amountBdt,
    method: payment.method,
    reference: payment.reference ?? `MANUAL-${Date.now().toString(36)}`,
    status: "success",
    at: new Date(),
  });

  await db
    .update(orders)
    .set({
      paidBdt: paid,
      paymentStatus,
      updatedAt: new Date(),
      status: order.status === "pending_payment" && paid > 0 ? "confirmed" : order.status,
    })
    .where(eq(orders.id, orderId));

  await logAudit({
    actor: payment.actor ?? "Admin console",
    actorRole: "finance",
    action: "order.payment.add",
    entity: "orders",
    entityId: orderId,
    meta: `${payment.amountBdt} BDT via ${payment.method}`,
  });

  return getOrderById(orderId);
}

export async function creditWallet(
  customerId: string,
  amountBdt: number,
  type: "topup" | "refund" | "cashback" | "adjustment",
  note: string,
  method?: PaymentMethod,
) {
  const db = await getDb();
  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer) throw new Error("Customer not found");
  const balance = customer.walletBalanceBdt + amountBdt;
  await db
    .insert(walletTransactions)
    .values({
      id: `wtx_${Date.now().toString(36)}`,
      customerId,
      customerName: customer.name,
      type,
      amountBdt,
      balanceAfterBdt: balance,
      method: method ?? null,
      reference: `WTX${Date.now().toString(36).toUpperCase()}`,
      note,
      at: new Date(),
    });
  await db.update(customers).set({ walletBalanceBdt: balance }).where(eq(customers.id, customerId));
  return balance;
}

async function debitWallet(customerId: string, amountBdt: number, note: string, reference: string) {
  const db = await getDb();
  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer) return 0;
  const balance = customer.walletBalanceBdt - amountBdt;
  await db.insert(walletTransactions).values({
    id: `wtx_${Date.now().toString(36)}`,
    customerId,
    customerName: customer.name,
    type: "order_payment",
    amountBdt: -amountBdt,
    balanceAfterBdt: balance,
    method: "wallet",
    reference,
    note,
    at: new Date(),
  });
  await db.update(customers).set({ walletBalanceBdt: balance }).where(eq(customers.id, customerId));
  return balance;
}

export async function createQuote(input: {
  customerName: string;
  phone: string;
  email?: string;
  sourceUrl: string;
  sourcePlatform?: string;
  productName: string;
  quantity: number;
  targetPriceBdt?: number;
  notes?: string;
}) {
  const db = await getDb();
  const [{ total }] = await db.select({ total: count() }).from(quotes);
  const ref = `RFQ-${2500 + Number(total) + 1}`;
  const id = `qte_${Date.now().toString(36)}`;
  await db.insert(quotes).values({
    id,
    ref,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email ?? "",
    sourceUrl: input.sourceUrl,
    sourcePlatform: input.sourcePlatform ?? "1688",
    productName: input.productName,
    quantity: input.quantity,
    targetPriceBdt: input.targetPriceBdt ?? null,
    notes: input.notes ?? "",
    status: "new",
    createdAt: new Date(),
  });
  await logAudit({
    actor: input.customerName,
    actorRole: "customer",
    action: "quote.create",
    entity: "quotes",
    entityId: id,
    meta: ref,
  });
  return { id, ref };
}

export async function updateQuote(
  id: string,
  patch: {
    status?: "new" | "reviewing" | "quoted" | "won" | "lost";
    quotedUnitPriceBdt?: number;
    quotedTotalBdt?: number;
    assignedTo?: string;
    notes?: string;
  },
) {
  const db = await getDb();
  await db.update(quotes).set(patch).where(eq(quotes.id, id));
  await logAudit({ actor: "Admin console", actorRole: "admin", action: "quote.update", entity: "quotes", entityId: id });
  return { ok: true };
}

export async function replyToTicket(ticketId: string, body: string, author: string, status?: "open" | "pending" | "resolved" | "closed") {
  const db = await getDb();
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  if (!ticket) throw new Error("Ticket not found");
  await db.insert(ticketMessages).values({
    id: `tmsg_${Date.now().toString(36)}`,
    ticketId,
    author,
    role: "agent",
    body,
    at: new Date(),
  });
  await db
    .update(tickets)
    .set({ status: status ?? "pending", assignedTo: ticket.assignedTo ?? author })
    .where(eq(tickets.id, ticketId));
  return { ok: true };
}

export async function subscribeNewsletter(email: string, phone = "", source = "footer") {
  const db = await getDb();
  await db
    .insert(newsletterSubscribers)
    .values({ id: `sub_${Date.now().toString(36)}`, email, phone, source })
    .onConflictDoNothing();
  return { ok: true };
}

export async function updateCustomer(
  id: string,
  patch: Partial<{ name: string; email: string; phone: string; type: string; tier: string; status: string; notes: string; dueBdt: number }>,
) {
  const db = await getDb();
  await db
    .update(customers)
    .set(patch as never)
    .where(eq(customers.id, id));
  await logAudit({ actor: "Admin console", actorRole: "admin", action: "customer.update", entity: "customers", entityId: id });
  return { ok: true };
}

export async function upsertCustomerAddress(customerId: string, address: Address) {
  const db = await getDb();
  const id = address.id ?? `adr_${Date.now().toString(36)}`;
  if (address.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.customerId, customerId));
  }
  await db
    .insert(addresses)
    .values({
      id,
      customerId,
      label: address.label ?? "Home",
      fullName: address.fullName,
      phone: address.phone,
      altPhone: address.altPhone ?? null,
      addressLine: address.addressLine,
      area: address.area,
      city: address.city,
      district: address.district,
      postcode: address.postcode ?? null,
      isDefault: address.isDefault ?? false,
    })
    .onConflictDoUpdate({
      target: addresses.id,
      set: {
        label: address.label ?? "Home",
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        area: address.area,
        city: address.city,
        district: address.district,
        postcode: address.postcode ?? null,
        isDefault: address.isDefault ?? false,
      },
    });
  return { ok: true, id };
}

export async function deleteCustomerAddress(id: string, customerId: string) {
  const db = await getDb();
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.customerId, customerId)));
  return { ok: true };
}

export async function getRecentOrderEvents(limit = 12) {
  const db = await getDb();
  return db.select().from(orderEvents).orderBy(desc(orderEvents.at)).limit(limit);
}
