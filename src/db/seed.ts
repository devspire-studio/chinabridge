import { hashPassword } from "better-auth/crypto";
import { sql } from "drizzle-orm";

import * as authSchema from "./auth-schema";
import type { Database } from "./index";
import * as schema from "./schema";
import { buildCatalog } from "./seed-catalog";
import { buildOps } from "./seed-ops";

function chunk<T>(items: T[], size = 200) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function insertAll<T extends Record<string, unknown>>(
  db: Database,
  table: Parameters<Database["insert"]>[0],
  rows: T[],
) {
  for (const batch of chunk(rows)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.insert(table).values(batch as any).onConflictDoNothing();
  }
}

/** Seeds the database with a full demo dataset the first time it runs. */
export async function runSeed(db: Database, opts: { force?: boolean } = {}) {
  const existing = await db.execute<{ count: string }>(sql`select count(*)::text as count from categories`);
  const rows = (existing as unknown as { rows?: { count: string }[] }).rows ?? (existing as unknown as { count: string }[]);
  const count = Number(rows?.[0]?.count ?? 0);
  if (count > 0 && !opts.force) return { seeded: false, count };

  if (opts.force) {
    await db.execute(sql`
      truncate table
        order_items, order_events, order_payments, orders, addresses, wallet_transactions,
        reviews, tickets, ticket_messages, wishlists, purchase_order_items, purchase_orders,
        shipments, group_buys, coupons, quotes, products, product_variants, suppliers,
        categories, banners, posts, warehouses, staff, audit_logs, newsletter_subscribers,
        settings, "account", "session", "verification", "user", customers
      restart identity cascade
    `);
  }

  const catalog = buildCatalog();
  const ops = buildOps();

  await insertAll(db, schema.settings, [
    {
      ...ops.settings,
      exchangeRateUpdatedAt: new Date(ops.settings.exchangeRateUpdatedAt),
      updatedAt: new Date(),
      id: "default",
    },
  ]);
  await insertAll(db, schema.categories, catalog.categories);
  await insertAll(db, schema.suppliers, catalog.suppliers);
  await insertAll(db, schema.products, catalog.products);
  await insertAll(db, schema.productVariants, catalog.variants);
  await insertAll(db, schema.customers, ops.customers);
  await insertAll(db, schema.addresses, ops.addresses);
  await insertAll(db, schema.shipments, ops.shipments);
  await insertAll(db, schema.orders, ops.orders);
  await insertAll(db, schema.orderItems, ops.orderItems);
  await insertAll(db, schema.orderEvents, ops.orderEvents);
  await insertAll(db, schema.orderPayments, ops.orderPayments);
  await insertAll(db, schema.purchaseOrders, ops.purchaseOrders);
  await insertAll(db, schema.purchaseOrderItems, ops.purchaseOrderItems);
  await insertAll(db, schema.quotes, ops.quotes);
  await insertAll(db, schema.groupBuys, ops.groupBuys);
  await insertAll(db, schema.coupons, ops.coupons);
  await insertAll(db, schema.walletTransactions, ops.walletTransactions);
  await insertAll(db, schema.reviews, ops.reviews);
  await insertAll(db, schema.tickets, ops.tickets);
  await insertAll(db, schema.ticketMessages, ops.ticketMessages);
  await insertAll(db, schema.banners, ops.banners);
  await insertAll(db, schema.posts, ops.posts);
  await insertAll(db, schema.warehouses, ops.warehouses);
  await insertAll(db, schema.staff, ops.staff);
  await insertAll(db, schema.auditLogs, ops.auditLogs);

  // Auth users (better-auth credential accounts) so the console is usable immediately.
  for (const u of ops.authUsers) {
    const password = await hashPassword(u.password);
    await db
      .insert(authSchema.user)
      .values({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: true,
        role: u.role,
        phone: u.phone,
        customerId: u.customerId ?? "",
        createdAt: u.createdAt,
        updatedAt: u.createdAt,
      })
      .onConflictDoNothing();
    await db
      .insert(authSchema.account)
      .values({
        id: `${u.id}_credential`,
        accountId: u.id,
        providerId: "credential",
        userId: u.id,
        password,
        createdAt: u.createdAt,
        updatedAt: u.createdAt,
      })
      .onConflictDoNothing();
  }

  // wishlist samples for the demo customer
  const featured = catalog.products.filter((p) => p.featured).slice(0, 5);
  await insertAll(
    db,
    schema.wishlists,
    featured.map((p, i) => ({ id: `wsh_${i + 1}`, customerId: "cus_1001", productId: p.id })),
  );

  return {
    seeded: true,
    counts: {
      categories: catalog.categories.length,
      products: catalog.products.length,
      variants: catalog.variants.length,
      customers: ops.customers.length,
      orders: ops.orders.length,
      shipments: ops.shipments.length,
      users: ops.authUsers.length,
    },
  };
}

export async function ensureSeeded(db: Database) {
  try {
    const result = await runSeed(db);
    if (result?.seeded) console.log("[db] seeded demo dataset:", result.counts);
  } catch (error) {
    console.error("[db] seed error:", (error as Error).message);
  }
}

export async function hasData(db: Database) {
  const res = await db.execute<{ count: string }>(sql`select count(*)::text as count from products`);
  const rows = (res as unknown as { rows?: { count: string }[] }).rows ?? (res as unknown as { count: string }[]);
  return Number(rows?.[0]?.count ?? 0) > 0;
}
