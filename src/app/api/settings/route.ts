import { NextRequest } from "next/server";

import { assertAdminApi } from "@/server/auth-helpers";
import { logAudit } from "@/server/queries";
import { getSettings, updateSettings } from "@/server/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ settings: await getSettings() });
}

export async function PATCH(req: NextRequest) {
  const guard = await assertAdminApi();
  if (!guard.ok) return guard.response;
  try {
    const body = await req.json();
    await updateSettings(body);
    await logAudit({
      actor: guard.user.name,
      actorRole: guard.user.role,
      action: "settings.update",
      entity: "settings",
      entityId: "default",
      meta: Object.keys(body).slice(0, 6).join(", "),
    });
    return Response.json({ ok: true, settings: await getSettings() });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
