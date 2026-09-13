import { and, count, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";

import {
  categories,
  customers,
  getDb,
  orderItems,
  orders,
  products,
  quotes,
  shipments,
  tickets,
  walletTransactions,
} from "@/db";
import { CHANNEL_LABEL, ORDER_STATUS_LABEL } from "@/lib/format";
import type { DashboardStats } from "@/lib/types";

import { listOrders, listShipments } from "./queries";

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb();

  const revenueRow = await db
    .select({ total: sum(orders.totalBdt), collected: sum(orders.paidBdt), avg: sql<string>`avg(${orders.totalBdt})` })
    .from(orders);
  const orderCountRow = await db.select({ total: count() }).from(orders);
  const customerRow = await db.select({ total: count() }).from(customers);
  const newCustomersRow = await db
    .select({ total: count() })
    .from(customers)
    .where(gte(customers.joinedAt, new Date(Date.now() - 30 * 86400000)));
  const activeShipmentsRow = await db
    .select({ total: count() })
    .from(shipments)
    .where(inArray(shipments.status, ["booking", "loading", "in_transit", "at_port", "customs"]));
  const pendingQuotesRow = await db
    .select({ total: count() })
    .from(quotes)
    .where(inArray(quotes.status, ["new", "reviewing"]));
  const openTicketsRow = await db.select({ total: count() }).from(tickets).where(inArray(tickets.status, ["open", "pending"]));
  const walletRow = await db.select({ total: sum(customers.walletBalanceBdt) }).from(customers);
  const dueRow = await db.select({ total: sum(customers.dueBdt) }).from(customers);
  const deliveredRow = await db.select({ total: count() }).from(orders).where(eq(orders.status, "delivered"));

  // 30-day revenue series
  const seriesRows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
      revenue: sum(orders.totalBdt),
      orders: count(),
    })
    .from(orders)
    .where(gte(orders.createdAt, new Date(Date.now() - 30 * 86400000)))
    .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
    .orderBy(sql`date_trunc('day', ${orders.createdAt})`);

  const statusRows = await db
    .select({ status: orders.status, total: count() })
    .from(orders)
    .groupBy(orders.status);

  const channelRows = await db.select({ channel: orders.channel, total: count() }).from(orders).groupBy(orders.channel);

  const categoryRows = await db
    .select({ name: categories.name, revenue: sum(orders.totalBdt) })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .groupBy(categories.name)
    .orderBy(desc(sum(orders.totalBdt)))
    .limit(8);

  const topProductRows = await db
    .select({ title: orderItems.title, sold: sum(orderItems.quantity), revenue: sum(orderItems.unitPriceBdt) })
    .from(orderItems)
    .groupBy(orderItems.title)
    .orderBy(desc(sum(orderItems.quantity)))
    .limit(6);

  const recent = await listOrders({ perPage: 6 });
  const inTransit = await listShipments({ status: "in_transit" });

  const totalOrders = Number(orderCountRow[0]?.total ?? 0);
  const delivered = Number(deliveredRow[0]?.total ?? 0);

  return {
    revenueBdt: Number(revenueRow[0]?.total ?? 0),
    orders: totalOrders,
    newCustomers: Number(newCustomersRow[0]?.total ?? 0),
    activeShipments: Number(activeShipmentsRow[0]?.total ?? 0),
    pendingQuotes: Number(pendingQuotesRow[0]?.total ?? 0),
    openTickets: Number(openTicketsRow[0]?.total ?? 0),
    walletLiabilityBdt: Number(walletRow[0]?.total ?? 0),
    codDueBdt: Number(dueRow[0]?.total ?? 0),
    avgOrderValueBdt: Math.round(Number(revenueRow[0]?.avg ?? 0)),
    fulfilmentRatePct: totalOrders ? Math.round((delivered / totalOrders) * 100) : 0,
    revenueSeries: seriesRows.map((r) => ({
      date: r.day,
      revenue: Number(r.revenue ?? 0),
      orders: Number(r.orders ?? 0),
    })),
    statusBreakdown: statusRows.map((r) => ({ status: ORDER_STATUS_LABEL[r.status] ?? r.status, count: Number(r.total) })),
    categoryMix: categoryRows.map((r) => ({ category: r.name, revenue: Number(r.revenue ?? 0) })),
    topProducts: topProductRows.map((r) => ({
      title: r.title,
      sold: Number(r.sold ?? 0),
      revenue: Number(r.revenue ?? 0),
    })),
    recentOrders: recent.items,
    shipmentsInTransit: inTransit,
    channelMix: channelRows.map((r) => ({ channel: CHANNEL_LABEL[r.channel] ?? r.channel, orders: Number(r.total) })),
  };
}

export interface AdminCounts {
  pendingPayment: number;
  newQuotes: number;
  openTickets: number;
  inTransit: number;
  lowStock: number;
}

/** Small badge counts used by the admin sidebar/topbar. */
export async function getAdminCounts(): Promise<AdminCounts> {
  const db = await getDb();
  const [pending, quotesRow, ticketsRow, transit, low] = await Promise.all([
    db.select({ total: count() }).from(orders).where(eq(orders.status, "pending_payment")),
    db.select({ total: count() }).from(quotes).where(inArray(quotes.status, ["new", "reviewing"])),
    db.select({ total: count() }).from(tickets).where(inArray(tickets.status, ["open", "pending"])),
    db.select({ total: count() }).from(shipments).where(inArray(shipments.status, ["in_transit", "at_port", "customs"])),
    db.select({ total: count() }).from(products).where(sql`${products.stock} <= 25 and ${products.status} = 'active'`),
  ]);
  return {
    pendingPayment: Number(pending[0]?.total ?? 0),
    newQuotes: Number(quotesRow[0]?.total ?? 0),
    openTickets: Number(ticketsRow[0]?.total ?? 0),
    inTransit: Number(transit[0]?.total ?? 0),
    lowStock: Number(low[0]?.total ?? 0),
  };
}

export async function getCustomerStats() {
  const db = await getDb();
  const [total, active30] = await Promise.all([
    db.select({ total: count() }).from(customers),
    db.select({ total: count() }).from(customers).where(gte(customers.joinedAt, new Date(Date.now() - 30 * 86400000))),
  ]);
  return { total: Number(total[0]?.total ?? 0), new30: Number(active30[0]?.total ?? 0) };
}

export async function getInventoryValue() {
  const db = await getDb();
  const rows = await db
    .select({ stock: products.stock, cost: products.costPriceCny, price: products.priceBdt })
    .from(products);
  const costBdt = rows.reduce((acc, r) => acc + r.stock * r.cost * 17.4, 0);
  const retailBdt = rows.reduce((acc, r) => acc + r.stock * r.price, 0);
  return { costBdt: Math.round(costBdt), retailBdt: Math.round(retailBdt), skus: rows.length };
}

export async function getWalletLiability() {
  const db = await getDb();
  const rows = await db
    .select({ balance: customers.walletBalanceBdt })
    .from(customers);
  return rows.reduce((acc, r) => acc + r.balance, 0);
}

export async function getTopCustomers(limit = 5) {
  const db = await getDb();
  return db.select().from(customers).orderBy(desc(customers.totalSpentBdt)).limit(limit);
}

export async function getLowStockProducts(threshold = 25) {
  const db = await getDb();
  const rows = await db.select().from(products).where(and(eq(products.status, "active"), sql`${products.stock} <= ${threshold}`)).limit(8);
  return rows;
}

export async function getRecentWalletActivity(limit = 8) {
  const db = await getDb();
  return db.select().from(walletTransactions).orderBy(desc(walletTransactions.at)).limit(limit);
}
