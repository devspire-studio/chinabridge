import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminSuppliersPage() {
  const columns: ColumnSpec[] = [
    { key: "name", label: "Supplier", type: "strong", sub: "nameCn" },
    {
      key: "platform",
      label: "Platform",
      type: "badge",
      badgeMap: { "1688": "accent", taobao: "info", alibaba: "secondary", direct: "muted" },
    },
    { key: "city", label: "City", type: "muted", hideBelow: "md" },
    { key: "contactPerson", label: "Contact", type: "muted", hideBelow: "lg" },
    { key: "wechat", label: "WeChat", type: "muted", hideBelow: "xl" },
    { key: "rating", label: "Rating", type: "number", align: "right" },
    { key: "onTimeRate", label: "On-time %", type: "number", align: "right", hideBelow: "lg" },
    { key: "totalSpendCny", label: "Spend (CNY)", type: "number", align: "right", hideBelow: "md" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: { active: "success", paused: "warning", blacklisted: "danger" },
    },
  ];

  const fields: FieldSpec[] = [
    { name: "name", label: "Supplier name", required: true },
    { name: "nameCn", label: "Chinese name (中文)" },
    {
      name: "platform",
      label: "Platform",
      type: "select",
      options: ["1688", "taobao", "alibaba", "direct"].map((v) => ({ value: v, label: v })),
    },
    { name: "city", label: "City", placeholder: "Guangzhou" },
    { name: "contactPerson", label: "Contact person" },
    { name: "phone", label: "Phone / WeChat no." },
    { name: "wechat", label: "WeChat ID" },
    { name: "rating", label: "Rating (0–5)", type: "number", step: "0.1" },
    { name: "onTimeRate", label: "On-time delivery %", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "paused", "blacklisted"].map((v) => ({ value: v, label: v })),
    },
    { name: "categories", label: "Categories supplied", type: "tags", span: 2, hint: "One per line" },
    { name: "notes", label: "Negotiation notes", type: "textarea", span: 2 },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Verified 1688 / Taobao factories and trading companies, with on-time performance and lifetime spend."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Suppliers" }]}
      />
      <ResourceTable
        collection="suppliers"
        title="Suppliers"
        searchPlaceholder="Search by name, Chinese name or city…"
        columns={columns}
        fields={fields}
        defaults={{ platform: "1688", status: "active", rating: 4.5, onTimeRate: 95 }}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "paused", label: "Paused" },
              { value: "blacklisted", label: "Blacklisted" },
            ],
          },
          {
            key: "platform",
            label: "Platform",
            options: ["1688", "taobao", "alibaba", "direct"].map((v) => ({ value: v, label: v })),
          },
        ]}
      />
    </div>
  );
}
