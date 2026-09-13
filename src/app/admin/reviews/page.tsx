import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";
import { listProducts } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const { items: products } = await listProducts({ perPage: 200, status: "all" });

  const columns: ColumnSpec[] = [
    { key: "productTitle", label: "Product", type: "strong", sub: "customerName", width: "30%" },
    { key: "rating", label: "Rating", type: "number", align: "right", width: "90px" },
    { key: "title", label: "Headline", type: "strong" },
    { key: "body", label: "Review", type: "muted" },
    { key: "helpful", label: "Helpful", type: "number", align: "right", hideBelow: "xl" },
    { key: "createdAt", label: "Submitted", type: "date", hideBelow: "lg" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: { published: "success", pending: "warning", rejected: "danger" },
    },
  ];

  const fields: FieldSpec[] = [
    {
      name: "productId",
      label: "Product",
      type: "select",
      required: true,
      span: 2,
      options: products.map((p) => ({ value: p.id, label: p.title })),
    },
    { name: "productTitle", label: "Product title (display)" },
    { name: "customerName", label: "Reviewer name" },
    { name: "rating", label: "Rating (1–5)", type: "number" },
    { name: "helpful", label: "Helpful votes", type: "number" },
    { name: "title", label: "Headline", span: 2 },
    { name: "body", label: "Review body", type: "textarea", span: 2 },
    {
      name: "status",
      label: "Moderation status",
      type: "select",
      options: ["published", "pending", "rejected"].map((v) => ({ value: v, label: v })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Moderate verified-buyer reviews before they appear on the storefront."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Reviews" }]}
      />
      <ResourceTable
        collection="reviews"
        title="Reviews"
        searchPlaceholder="Search by product, customer or headline…"
        columns={columns}
        fields={fields}
        defaults={{ status: "pending", rating: 5, helpful: 0 }}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "published", label: "Published" },
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Rejected" },
            ],
          },
          {
            key: "rating",
            label: "Rating",
            options: [5, 4, 3, 2, 1].map((v) => ({ value: String(v), label: `${v} star` })),
          },
        ]}
      />
    </div>
  );
}
