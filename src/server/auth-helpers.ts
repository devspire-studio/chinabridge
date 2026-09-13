import { headers } from "next/headers";

import { getDb } from "@/db";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  customerId: string;
  image?: string | null;
}

/** Reads the better-auth session (server components, route handlers, server actions). */
export async function getSession() {
  try {
    await getDb();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    const user = session.user as unknown as Record<string, unknown>;
    return {
      session: session.session,
      user: {
        id: String(user.id),
        name: String(user.name ?? ""),
        email: String(user.email ?? ""),
        role: String(user.role ?? "customer"),
        phone: String(user.phone ?? ""),
        customerId: String(user.customerId ?? ""),
        image: (user.image as string) ?? null,
      } satisfies SessionUser,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session.user;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminRole(session.user.role)) throw new Error("FORBIDDEN");
  return session.user;
}

export async function assertAdminApi() {
  const session = await getSession();
  if (!session || !isAdminRole(session.user.role)) {
    return { ok: false as const, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true as const, user: session.user };
}
