import { NextRequest } from "next/server";

import { getProductsByIds, listProducts } from "@/server/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ids = sp.get("ids");

  if (ids) {
    const items = await getProductsByIds(ids.split(",").filter(Boolean));
    return Response.json({ items });
  }

  const result = await listProducts({
    q: sp.get("q") ?? undefined,
    category: sp.get("category") ?? undefined,
    sort: (sp.get("sort") as "relevance") ?? "relevance",
    page: Number(sp.get("page") ?? 1),
    perPage: Number(sp.get("perPage") ?? 12),
    inStock: sp.get("inStock") === "1",
    featured: sp.get("featured") === "1",
  });
  return Response.json(result);
}
