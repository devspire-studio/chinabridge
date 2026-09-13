import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  const columns: ColumnSpec[] = [
    { key: "name", label: "Customer", type: "strong", sub: "phone" },
    { key: "email", label: "Email", type: "muted", hideBelow: "lg" },
    {
      key: "type",
      label: "Segment",
      type: "badge",
      badgeMap: { retail: "secondary", wholesale: "info", reseller: "accent" },
    },
    {
      key: "tier",
      label: "Tier",
      type: "badge",
      badgeMap: { bronze: "muted", silver: "secondary", gold: "warning", platinum: "accent" },
    },
    { key: "totalSpentBdt", label: "Lifetime", type: "currency", align: "right" },
    { key: "walletBalanceBdt", label: "Wallet", type: "currency", align: "right", hideBelow: "md" },
    { key: "dueBdt", label: "Due", type: "currency", align: "right", hideBelow: "lg" },
    { key: "orderCount", label: "Orders", type: "number", align: "right", hideBelow: "xl" },
    { key: "status", label: "Status", type: "badge", badgeMap: { active: "success", blocked: "danger" } },
  ];

  const fields: FieldSpec[] = [
    { name: "name", label: "Full name", required: true },
    { name: "phone", label: "Phone", required: true, placeholder: "01712345678" },
    { name: "email", label: "Email", span: 2 },
    {
      name: "type",
      label: "Segment",
      type: "select",
      options: [
        { value: "retail", label: "Retail" },
        { value: "wholesale", label: "Wholesale" },
        { value: "reseller", label: "Reseller" },
      ],
    },
    {
      name: "tier",
      label: "Loyalty tier",
      type: "select",
      options: ["bronze", "silver", "gold", "platinum"].map((v) => ({ value: v, label: v })),
    },
    {
      name: "status",
      label: "Account status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "blocked", label: "Blocked" },
      ],
    },
    { name: "walletBalanceBdt", label: "Wallet balance (৳)", type: "number" },
    { name: "dueBdt", label: "Outstanding due (৳)", type: "number" },
    { name: "avatar", label: "Avatar URL", span: 2 },
    { name: "notes", label: "Internal notes", type: "textarea", span: 2 },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Retail buyers, resellers and wholesale importers — with wallet balances and outstanding dues."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers" }]}
      />
      <ResourceTable
        collection="customers"
        title="Customers"
        searchPlaceholder="Search by name, phone or email…"
        columns={columns}
        fields={fields}
        pageSize={15}
        defaults={{ type: "retail", tier: "bronze", status: "active" }}
        filters={[
          {
            key: "type",
            label: "Segment",
            options: [
              { value: "retail", label: "Retail" },
              { value: "wholesale", label: "Wholesale" },
              { value: "reseller", label: "Reseller" },
            ],
          },
          {
            key: "tier",
            label: "Tier",
            options: ["bronze", "silver", "gold", "platinum"].map((v) => ({ value: v, label: v })),
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "blocked", label: "Blocked" },
            ],
          },
        ]}
      />
    </div>
  );
}
