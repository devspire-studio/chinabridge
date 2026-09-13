import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getDb } from "@/db";
import { COLLECTIONS, deleteCollectionItem, getCollection, updateCollectionItem } from "@/server/collections";
import { assertAdminApi } from "@/server/auth-helpers";
import { can } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string; id: string }> }) {
  const { name, id } = await params;
  if (!COLLECTIONS[name]) return Response.json({ error: "Unknown collection" }, { status: 404 });
  const def = getCollection(name);
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = def.table as any;
  const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ row: rows[0] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ name: string; id: string }> }) {
  const { name, id } = await params;
  const guard = await assertAdminApi();
  if (!guard.ok) return guard.response;
  const def = getCollection(name);
  if (!can(guard.user.role, def.permission)) return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const result = await updateCollectionItem(name, id, body);
    return Response.json({ ...result, ok: true });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ name: string; id: string }> }) {
  const { name, id } = await params;
  const guard = await assertAdminApi();
  if (!guard.ok) return guard.response;
  const def = getCollection(name);
  if (!can(guard.user.role, def.permission)) return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    await deleteCollectionItem(name, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = (error as Error).message;
    // FK violations: fall back to archiving where the table supports it
    if (/foreign key|violates/i.test(message)) {
      const db = await getDb();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = def.table as any;
      const archivable = table.status !== undefined;
      if (archivable) {
        await db.update(table).set({ status: def.label === "Product" ? "archived" : "inactive" }).where(eq(table.id, id));
        return Response.json({ ok: true, archived: true, note: "Row is referenced elsewhere, so it was archived instead." });
      }
      await db.execute(sql`select 1`);
      return Response.json({ error: "Row is referenced by other records and cannot be deleted." }, { status: 409 });
    }
    return Response.json({ error: message }, { status: 400 });
  }
}
