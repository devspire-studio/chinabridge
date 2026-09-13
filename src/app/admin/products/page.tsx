import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";
import { getCategoriesWithCounts, listSuppliers } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [categories, suppliers] = await Promise.all([getCategoriesWithCounts(), listSuppliers()]);

  const columns: ColumnSpec[] = [
    { key: "images", label: "Image", type: "image", width: "72px" },
    { key: "title", label: "Product", type: "strong", sub: "sku", width: "28%" },
    { key: "brand", label: "Brand / origin", type: "muted", hideBelow: "lg" },
    { key: "costPriceCny", label: "Cost (CNY)", type: "number", align: "right", hideBelow: "md" },
    { key: "priceBdt", label: "Sell (BDT)", type: "currency", align: "right" },
    { key: "stock", label: "Stock", type: "number", align: "right" },
    { key: "weightGrams", label: "Weight", type: "weight", align: "right", hideBelow: "lg" },
    { key: "leadTimeDays", label: "Lead (d)", type: "number", align: "right", hideBelow: "xl" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: { active: "success", draft: "muted", out_of_stock: "danger", archived: "secondary" },
    },
    { key: "featured", label: "Featured", type: "boolean", hideBelow: "xl" },
  ];

  const fields: FieldSpec[] = [
    { name: "title", label: "Title (English)", required: true, span: 2 },
    { name: "titleBn", label: "Title (বাংলা)" },
    { name: "slug", label: "Slug", placeholder: "auto from title if blank" },
    { name: "sku", label: "SKU", placeholder: "CB-EL-0042" },
    { name: "brand", label: "Brand" },
    {
      name: "categoryId",
      label: "Category",
      type: "select",
      required: true,
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      name: "supplierId",
      label: "Supplier",
      type: "select",
      options: suppliers.map((s) => ({ value: s.id, label: `${s.name} · ${s.city}` })),
    },
    { name: "originCountry", label: "Origin country", placeholder: "China" },
    {
      name: "sourceUrl",
      label: "Source link (1688 / Taobao)",
      span: 2,
      placeholder: "https://detail.1688.com/offer/…",
    },
    { name: "images", label: "Image URLs", type: "tags", span: 2, hint: "One URL per line" },
    { name: "description", label: "Description", type: "textarea", span: 2 },
    { name: "costPriceCny", label: "Supplier cost (CNY)", type: "number", step: "0.01" },
    { name: "priceBdt", label: "Selling price (BDT)", type: "number", required: true },
    { name: "compareAtPriceBdt", label: "Compare-at price (BDT)", type: "number" },
    { name: "weightGrams", label: "Weight (grams)", type: "number" },
    { name: "cbm", label: "Volume (CBM)", type: "number", step: "0.001" },
    { name: "moq", label: "Minimum order qty", type: "number" },
    { name: "stock", label: "Stock on hand", type: "number" },
    { name: "unit", label: "Unit", placeholder: "pcs" },
    { name: "leadTimeDays", label: "Lead time (days)", type: "number" },
    { name: "hsCode", label: "HS code", placeholder: "8517.62.00" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "draft", "out_of_stock", "archived"].map((v) => ({ value: v, label: v.replace(/_/g, " ") })),
    },
    { name: "tags", label: "Tags", type: "tags", hint: "One per line — powers filters & search" },
    { name: "featured", label: "Featured on homepage", type: "checkbox" },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="The import catalogue. Cost is tracked in CNY, the customer-facing price is the landed BDT price before freight & duty."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
      />
      <ResourceTable
        collection="products"
        title="Products"
        searchPlaceholder="Search by title, SKU or brand…"
        columns={columns}
        fields={fields}
        pageSize={15}
        defaults={{ unit: "pcs", status: "draft", moq: 1, leadTimeDays: 12, originCountry: "China" }}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "out_of_stock", label: "Out of stock" },
              { value: "archived", label: "Archived" },
            ],
          },
          { key: "featured", label: "Featured", options: [{ value: "true", label: "Featured only" }] },
        ]}
      />
    </div>
  );
}
