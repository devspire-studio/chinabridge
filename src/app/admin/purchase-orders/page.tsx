import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";
import { listSuppliers } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminPurchaseOrdersPage() {
  const suppliers = await listSuppliers();

  const columns: ColumnSpec[] = [
    { key: "ref", label: "PO", type: "strong", sub: "supplierName" },
    { key: "warehouse", label: "Deliver to", type: "muted", hideBelow: "md" },
    { key: "orderIds", label: "Customer orders", type: "number", align: "right", hideBelow: "lg" },
    { key: "totalCny", label: "Total (CNY)", type: "number", align: "right" },
    { key: "paidCny", label: "Paid (CNY)", type: "number", align: "right", hideBelow: "md" },
    { key: "placedAt", label: "Placed", type: "date", hideBelow: "lg" },
    { key: "expectedAt", label: "Expected", type: "date", hideBelow: "lg" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: {
        draft: "muted",
        placed: "info",
        paid: "accent",
        shipped: "warning",
        received: "success",
        cancelled: "danger",
      },
    },
  ];

  const fields: FieldSpec[] = [
    { name: "ref", label: "PO reference", required: true, placeholder: "PO-2418" },
    {
      name: "supplierId",
      label: "Supplier",
      type: "select",
      required: true,
      options: suppliers.map((s) => ({ value: s.id, label: `${s.name} · ${s.city}` })),
    },
    { name: "supplierName", label: "Supplier name (as invoiced)" },
    { name: "warehouse", label: "Destination warehouse", placeholder: "Guangzhou DC-1" },
    { name: "orderIds", label: "Customer order IDs", type: "tags", span: 2, hint: "One per line — links POs to customer orders" },
    { name: "totalCny", label: "Order value (CNY)", type: "number", step: "0.01" },
    { name: "paidCny", label: "Amount paid (CNY)", type: "number", step: "0.01" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["draft", "placed", "paid", "shipped", "received", "cancelled"].map((v) => ({ value: v, label: v })),
    },
    { name: "expectedAt", label: "Expected at warehouse", type: "date" },
    { name: "notes", label: "Notes", type: "textarea", span: 2 },
  ];

  return (
    <div>
      <PageHeader
        title="Purchase orders"
        description="What we actually bought on 1688/Taobao on behalf of customers, batched per supplier to save freight."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Purchase orders" }]}
      />
      <ResourceTable
        collection="purchase-orders"
        title="Purchase orders"
        searchPlaceholder="Search by PO reference or supplier…"
        columns={columns}
        fields={fields}
        defaults={{ status: "draft", warehouse: "Guangzhou DC-1" }}
        createLabel="New purchase order"
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["draft", "placed", "paid", "shipped", "received", "cancelled"].map((v) => ({ value: v, label: v })),
          },
        ]}
      />
    </div>
  );
}
