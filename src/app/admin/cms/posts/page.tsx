import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminPostsPage() {
  const columns: ColumnSpec[] = [
    { key: "cover", label: "Cover", type: "image", width: "72px" },
    { key: "title", label: "Article", type: "strong", sub: "slug", width: "30%" },
    { key: "category", label: "Category", type: "badge", badgeMap: {} },
    { key: "author", label: "Author", type: "muted", hideBelow: "lg" },
    { key: "readMinutes", label: "Read (min)", type: "number", align: "right", hideBelow: "md" },
    { key: "views", label: "Views", type: "number", align: "right", hideBelow: "xl" },
    { key: "publishedAt", label: "Published", type: "date" },
    { key: "status", label: "Status", type: "badge", badgeMap: { published: "success", draft: "warning", inactive: "muted" } },
  ];

  const fields: FieldSpec[] = [
    { name: "title", label: "Title", required: true, span: 2 },
    { name: "slug", label: "Slug", required: true, placeholder: "how-to-import-from-1688-to-bangladesh" },
    { name: "category", label: "Category", placeholder: "Sourcing guide" },
    { name: "author", label: "Author" },
    { name: "readMinutes", label: "Read time (minutes)", type: "number" },
    { name: "cover", label: "Cover image URL", span: 2 },
    { name: "excerpt", label: "Excerpt", type: "textarea", span: 2 },
    { name: "body", label: "Body (markdown)", type: "textarea", span: 2 },
    { name: "tags", label: "Tags", type: "tags", span: 2, hint: "One per line" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["published", "draft", "inactive"].map((v) => ({ value: v, label: v })),
    },
    { name: "publishedAt", label: "Publish date", type: "date" },
  ];

  return (
    <div>
      <PageHeader
        title="Articles"
        description="Sourcing guides, customs explainers and buying tips that drive organic traffic to the storefront."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Content" }, { label: "Articles" }]}
      />
      <ResourceTable
        collection="posts"
        title="Articles"
        searchPlaceholder="Search by title, slug, author or category…"
        columns={columns}
        fields={fields}
        defaults={{ status: "draft", author: "ChinaBridge Team", category: "Sourcing guide", readMinutes: 5 }}
        createLabel="New article"
        filters={[
          {
            key: "status",
            label: "Status",
            options: ["published", "draft", "inactive"].map((v) => ({ value: v, label: v })),
          },
        ]}
      />
    </div>
  );
}
