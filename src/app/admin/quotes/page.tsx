import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminQuotesPage() {
  const columns: ColumnSpec[] = [
    { key: "ref", label: "Ref", type: "strong", sub: "sourcePlatform", width: "140px" },
    { key: "productName", label: "Requested item", type: "strong", sub: "sourceUrl" },
    { key: "customerName", label: "Customer", type: "strong", sub: "phone" },
    { key: "quantity", label: "Qty", type: "number", align: "right" },
    { key: "targetPriceBdt", label: "Target", type: "currency", align: "right", hideBelow: "lg" },
    { key: "quotedUnitPriceBdt", label: "Quoted unit", type: "currency", align: "right" },
    { key: "quotedTotalBdt", label: "Quoted total", type: "currency", align: "right", hideBelow: "md" },
    { key: "assignedTo", label: "Owner", type: "muted", hideBelow: "xl" },
    { key: "createdAt", label: "Received", type: "date", hideBelow: "lg" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: { new: "warning", reviewing: "info", quoted: "accent", won: "success", lost: "danger" },
    },
  ];

  const fields: FieldSpec[] = [
    { name: "ref", label: "Reference", placeholder: "QTE-1042" },
    { name: "customerName", label: "Customer name", required: true },
    { name: "phone", label: "Phone", required: true },
    { name: "email", label: "Email" },
    { name: "productName", label: "Product / spec", required: true, span: 2 },
    { name: "sourceUrl", label: "1688 / Taobao link", span: 2 },
    {
      name: "sourcePlatform",
      label: "Platform",
      type: "select",
      options: ["1688", "taobao", "alibaba", "other"].map((v) => ({ value: v, label: v })),
    },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "targetPriceBdt", label: "Target price (৳)", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["new", "reviewing", "quoted", "won", "lost"].map((v) => ({ value: v, label: v })),
    },
    { name: "quotedUnitPriceBdt", label: "Quoted unit price (৳)", type: "number" },
    { name: "quotedTotalBdt", label: "Quoted total (৳)", type: "number" },
    { name: "assignedTo", label: "Assigned to" },
    { name: "notes", label: "Sourcing notes", type: "textarea", span: 2 },
  ];

  return (
    <div>
      <PageHeader
        title="Quote requests"
        description="Buyers paste a 1688/Taobao link; the sourcing desk replies with a landed-cost quote including duty and freight."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Quote requests" }]}
      />
      <ResourceTable
        collection="quotes"
        title="Quote requests"
        searchPlaceholder="Search by customer, phone, product or reference…"
        columns={columns}
        fields={fields}
        pageSize={15}
        defaults={{ status: "new", sourcePlatform: "1688", quantity: 1 }}
        createLabel="Log quote request"
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["new", "reviewing", "quoted", "won", "lost"].map((v) => ({ value: v, label: v })),
          },
          {
            key: "sourcePlatform",
            label: "Platform",
            options: ["1688", "taobao", "alibaba", "other"].map((v) => ({ value: v, label: v })),
          },
        ]}
      />
    </div>
  );
}
