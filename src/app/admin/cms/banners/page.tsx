import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminBannersPage() {
  const columns: ColumnSpec[] = [
    { key: "image", label: "Preview", type: "image", width: "72px" },
    { key: "title", label: "Banner", type: "strong", sub: "subtitle" },
    {
      key: "placement",
      label: "Placement",
      type: "badge",
      badgeMap: { hero: "accent", home_mid: "info", category_top: "secondary", checkout: "warning" },
    },
    { key: "ctaLabel", label: "CTA", type: "strong", sub: "ctaHref", hideBelow: "lg" },
    { key: "sortOrder", label: "Order", type: "number", align: "right" },
    { key: "status", label: "Status", type: "badge", badgeMap: { active: "success", inactive: "muted", draft: "warning" } },
  ];

  const fields: FieldSpec[] = [
    { name: "title", label: "Headline", required: true, span: 2 },
    { name: "subtitle", label: "Sub-headline", span: 2 },
    { name: "image", label: "Image URL", span: 2 },
    { name: "ctaLabel", label: "Button label", placeholder: "Shop the collection" },
    { name: "ctaHref", label: "Button link", placeholder: "/shop" },
    {
      name: "placement",
      label: "Placement",
      type: "select",
      options: ["hero", "home_mid", "category_top", "checkout"].map((v) => ({ value: v, label: v.replace(/_/g, " ") })),
    },
    { name: "sortOrder", label: "Sort order", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "inactive", "draft"].map((v) => ({ value: v, label: v })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Banners"
        description="Hero and mid-page creatives on the storefront. Placements: home hero, home mid-page, category top and checkout."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Content" }, { label: "Banners" }]}
      />
      <ResourceTable
        collection="banners"
        title="Banners"
        searchPlaceholder="Search banners…"
        columns={columns}
        fields={fields}
        defaults={{ placement: "hero", status: "active", ctaLabel: "Shop now", ctaHref: "/shop", sortOrder: 10 }}
      />
    </div>
  );
}
