import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  const columns: ColumnSpec[] = [
    { key: "icon", label: "Icon", type: "muted", width: "56px" },
    { key: "name", label: "Category", type: "strong", sub: "nameBn" },
    { key: "slug", label: "Slug", type: "muted", hideBelow: "md" },
    { key: "serviceFeePct", label: "Service fee", type: "number", align: "right" },
    { key: "dutyPct", label: "Duty %", type: "number", align: "right" },
    { key: "sortOrder", label: "Order", type: "number", align: "right", hideBelow: "lg" },
    { key: "featured", label: "Featured", type: "boolean" },
  ];

  const fields: FieldSpec[] = [
    { name: "name", label: "Name (English)", required: true },
    { name: "nameBn", label: "Name (বাংলা)" },
    { name: "slug", label: "Slug", required: true, placeholder: "electronics-gadgets" },
    { name: "icon", label: "Icon (emoji)", placeholder: "📱" },
    { name: "image", label: "Cover image URL", span: 2 },
    { name: "description", label: "Description", type: "textarea", span: 2 },
    { name: "serviceFeePct", label: "Sourcing service fee %", type: "number" },
    { name: "dutyPct", label: "Customs duty & VAT %", type: "number" },
    { name: "sortOrder", label: "Sort order", type: "number" },
    { name: "parentId", label: "Parent category ID", placeholder: "leave blank for top level" },
    { name: "featured", label: "Show on homepage", type: "checkbox" },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Each category carries the sourcing fee and customs duty assumptions used by the landed-cost calculator."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
      />
      <ResourceTable
        collection="categories"
        title="Categories"
        searchPlaceholder="Search categories…"
        columns={columns}
        fields={fields}
        defaults={{ serviceFeePct: 8, dutyPct: 32, sortOrder: 10, icon: "📦" }}
      />
    </div>
  );
}
