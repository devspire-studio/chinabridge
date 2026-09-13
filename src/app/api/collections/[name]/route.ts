import { NextRequest } from "next/server";

import { COLLECTIONS, createCollectionItem, getCollection, listCollectionItems } from "@/server/collections";
import { assertAdminApi } from "@/server/auth-helpers";
import { can } from "@/lib/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!COLLECTIONS[name]) return Response.json({ error: "Unknown collection" }, { status: 404 });
  const sp = req.nextUrl.searchParams;
  const filter: Record<string, string> = {};
  for (const [key, value] of sp.entries()) {
    if (key.startsWith("f_")) filter[key.slice(2)] = value;
  }
  const result = await listCollectionItems(name, {
    q: sp.get("q") ?? undefined,
    limit: Number(sp.get("limit") ?? 200),
    offset: Number(sp.get("offset") ?? 0),
    filter,
  });
  return Response.json(result);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const guard = await assertAdminApi();
  if (!guard.ok) return guard.response;
  const def = getCollection(name);
  if (!can(guard.user.role, def.permission)) return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const result = await createCollectionItem(name, body);
    return Response.json({ ...result, ok: true }, { status: 201 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
