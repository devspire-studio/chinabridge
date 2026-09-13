import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminWarehousesPage() {
  const columns: ColumnSpec[] = [
    { key: "name", label: "Facility", type: "strong", sub: "code" },
    {
      key: "type",
      label: "Type",
      type: "badge",
      badgeMap: {
        china_consolidation: "accent",
        bd_hub: "info",
        bd_customs_bond: "warning",
        pickup_point: "secondary",
      },
    },
    { key: "city", label: "Location", type: "strong", sub: "country" },
    { key: "contact", label: "Contact", type: "muted", hideBelow: "lg" },
    { key: "staff", label: "Staff", type: "number", align: "right", hideBelow: "md" },
    { key: "usedCbm", label: "Utilisation", type: "progress", width: "160px" },
    { key: "capacityCbm", label: "Capacity (CBM)", type: "number", align: "right", hideBelow: "lg" },
    { key: "status", label: "Status", type: "badge", badgeMap: { active: "success", inactive: "muted" } },
  ];

  const fields: FieldSpec[] = [
    { name: "name", label: "Facility name", required: true },
    { name: "code", label: "Code", required: true, placeholder: "GZ-DC1" },
    { name: "country", label: "Country", placeholder: "China" },
    { name: "city", label: "City", placeholder: "Guangzhou" },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: ["china_consolidation", "bd_hub", "bd_customs_bond", "pickup_point"].map((v) => ({
        value: v,
        label: v.replace(/_/g, " "),
      })),
    },
    { name: "address", label: "Address", span: 2 },
    { name: "contact", label: "Contact person & phone", span: 2 },
    { name: "capacityCbm", label: "Capacity (CBM)", type: "number" },
    { name: "usedCbm", label: "Used (CBM)", type: "number" },
    { name: "staff", label: "Staff count", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Warehouses & hubs"
        description="China consolidation centres, Bangladesh hubs, bonded customs warehouses and pickup points."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Warehouses" }]}
      />
      <ResourceTable
        collection="warehouses"
        title="Warehouses"
        searchPlaceholder="Search by name, code or city…"
        columns={columns}
        fields={fields}
        defaults={{ type: "china_consolidation", status: "active", country: "China" }}
        filters={[
          {
            key: "type",
            label: "Type",
            options: ["china_consolidation", "bd_hub", "bd_customs_bond", "pickup_point"].map((v) => ({
              value: v,
              label: v.replace(/_/g, " "),
            })),
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
      />
    </div>
  );
}
