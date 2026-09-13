import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminRole } from "@/lib/roles";
import { getSession } from "@/server/auth-helpers";
import { getAdminCounts } from "@/server/stats";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin console",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/admin");
  if (!isAdminRole(session.user.role)) redirect("/account");

  const counts = await getAdminCounts();

  return <AdminShell counts={counts}>{children}</AdminShell>;
}
