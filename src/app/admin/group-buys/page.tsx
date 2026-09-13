import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";
import { listProducts } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminGroupBuysPage() {
  const { items: products } = await listProducts({ perPage: 200, status: "all" });

  const columns: ColumnSpec[] = [
    { key: "image", label: "Image", type: "image", width: "72px" },
    { key: "title", label: "Campaign", type: "strong", sub: "slug" },
    { key: "unitPriceBdt", label: "Normal", type: "currency", align: "right" },
    { key: "groupPriceBdt", label: "Group price", type: "currency", align: "right" },
    { key: "minMembers", label: "Min members", type: "number", align: "right", hideBelow: "md" },
    { key: "joined", label: "Progress", type: "progress", width: "160px" },
    { key: "expiresAt", label: "Ends", type: "date" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: { active: "success", scheduled: "info", closed: "muted", cancelled: "danger" },
    },
  ];

  const fields: FieldSpec[] = [
    { name: "title", label: "Campaign title", required: true, span: 2 },
    { name: "slug", label: "Slug", placeholder: "auto from title if blank" },
    {
      name: "productId",
      label: "Product",
      type: "select",
      required: true,
      options: products.map((p) => ({ value: p.id, label: p.title })),
    },
    { name: "image", label: "Cover image URL", span: 2 },
    { name: "unitPriceBdt", label: "Normal price (৳)", type: "number" },
    { name: "groupPriceBdt", label: "Group price (৳)", type: "number" },
    { name: "minMembers", label: "Minimum members", type: "number" },
    { name: "joined", label: "Members joined", type: "number" },
    { name: "expiresAt", label: "Campaign ends", type: "date" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "scheduled", "closed", "cancelled"].map((v) => ({ value: v, label: v })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Group deals"
        description="Bulk campaigns that unlock a lower landed price once enough buyers join — freight becomes cheaper per unit."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Group deals" }]}
      />
      <ResourceTable
        collection="group-buys"
        title="Group deals"
        searchPlaceholder="Search campaigns…"
        columns={columns}
        fields={fields}
        defaults={{ status: "active", minMembers: 10, joined: 0 }}
      />
    </div>
  );
}
