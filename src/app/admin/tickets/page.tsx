import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminTicketsPage() {
  const columns: ColumnSpec[] = [
    { key: "ref", label: "Ticket", type: "strong", sub: "category", width: "150px" },
    { key: "subject", label: "Subject", type: "strong" },
    { key: "customerName", label: "Customer", type: "strong", sub: "orderNo" },
    { key: "assignedTo", label: "Owner", type: "muted", hideBelow: "lg" },
    {
      key: "priority",
      label: "Priority",
      type: "badge",
      badgeMap: { urgent: "danger", high: "warning", normal: "muted", low: "secondary" },
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: { open: "warning", pending: "info", resolved: "success", closed: "muted" },
    },
    { key: "createdAt", label: "Opened", type: "date", hideBelow: "md" },
  ];

  const fields: FieldSpec[] = [
    { name: "subject", label: "Subject", required: true, span: 2 },
    { name: "ref", label: "Reference", placeholder: "TKT-2041" },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "order", label: "Order & delivery" },
        { value: "payment", label: "Payment & refund" },
        { value: "customs", label: "Customs & duty" },
        { value: "product", label: "Product & QC" },
        { value: "sourcing", label: "Sourcing request" },
      ],
    },
    { name: "customerName", label: "Customer name" },
    { name: "orderNo", label: "Related order no." },
    { name: "assignedTo", label: "Assigned agent" },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: ["low", "normal", "high", "urgent"].map((v) => ({ value: v, label: v })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["open", "pending", "resolved", "closed"].map((v) => ({ value: v, label: v })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Support tickets"
        description="Customer care queue for deliveries, customs questions, QC claims and refunds."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Support tickets" }]}
      />
      <ResourceTable
        collection="tickets"
        title="Support tickets"
        searchPlaceholder="Search by subject, reference, customer or order…"
        columns={columns}
        fields={fields}
        pageSize={15}
        defaults={{ status: "open", priority: "normal", category: "order" }}
        createLabel="New ticket"
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["open", "pending", "resolved", "closed"].map((v) => ({ value: v, label: v })),
          },
          {
            key: "priority",
            label: "Priority",
            options: ["urgent", "high", "normal", "low"].map((v) => ({ value: v, label: v })),
          },
          {
            key: "category",
            label: "Category",
            options: ["order", "payment", "customs", "product", "sourcing"].map((v) => ({ value: v, label: v })),
          },
        ]}
      />
    </div>
  );
}
