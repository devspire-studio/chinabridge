import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";
import { PERMISSIONS, ROLE_LABEL } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const roleOptions = Object.keys(ROLE_LABEL).map((role) => ({ value: role, label: ROLE_LABEL[role] }));

  const columns: ColumnSpec[] = [
    { key: "name", label: "Team member", type: "strong", sub: "email" },
    { key: "role", label: "Role", type: "badge", badgeMap: {} },
    { key: "department", label: "Department", type: "muted", hideBelow: "md" },
    { key: "phone", label: "Phone", type: "muted", hideBelow: "lg" },
    { key: "permissions", label: "Extra permissions", type: "muted", hideBelow: "xl" },
    { key: "lastActiveAt", label: "Last active", type: "datetime", hideBelow: "lg" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: { active: "success", invited: "warning", suspended: "danger" },
    },
  ];

  const fields: FieldSpec[] = [
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Work email", required: true },
    { name: "phone", label: "Phone" },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: roleOptions,
      hint: "Controls which admin modules this person can open.",
    },
    { name: "department", label: "Department", placeholder: "Sourcing desk" },
    { name: "permissions", label: "Extra permissions", type: "tags", span: 2, hint: "One permission key per line" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "invited", "suspended"].map((v) => ({ value: v, label: v })),
    },
  ];

  const roles = Object.entries(PERMISSIONS);

  return (
    <div>
      <PageHeader
        title="Team & roles"
        description="Internal users of the admin console. Roles map to the module permissions listed below."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Team & roles" }]}
      />

      <div className="mb-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {roles.map(([permission, allowed]) => (
          <div key={permission} className="rounded-xl border border-slate-200 bg-white p-3 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{permission}</p>
            <p className="mt-1 text-xs text-slate-600">
              {(allowed as readonly string[]).map((r) => ROLE_LABEL[r] ?? r).join(" · ")}
            </p>
          </div>
        ))}
      </div>

      <ResourceTable
        collection="staff"
        title="Team members"
        searchPlaceholder="Search by name, email or department…"
        columns={columns}
        fields={fields}
        defaults={{ status: "invited", role: "support", department: "Customer care" }}
        createLabel="Invite teammate"
        filters={[
          { key: "role", label: "Role", options: roleOptions },
          {
            key: "status",
            label: "Status",
            options: ["active", "invited", "suspended"].map((v) => ({ value: v, label: v })),
          },
        ]}
      />
    </div>
  );
}
