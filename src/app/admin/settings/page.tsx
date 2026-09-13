import { PageHeader } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHeader
        title="Workspace settings"
        description="Commercial assumptions, duties and delivery charges used across the storefront, quotes and invoices."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}
      />
      <SettingsForm initial={settings} />
    </div>
  );
}
