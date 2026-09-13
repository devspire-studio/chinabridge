import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";

export const dynamic = "force-dynamic";

export default function AdminCouponsPage() {
  const columns: ColumnSpec[] = [
    { key: "code", label: "Code", type: "strong", sub: "appliesTo" },
    {
      key: "type",
      label: "Type",
      type: "badge",
      badgeMap: { percent: "accent", fixed: "info", free_shipping: "secondary" },
    },
    { key: "value", label: "Value", type: "number", align: "right" },
    { key: "minOrderBdt", label: "Min order", type: "currency", align: "right", hideBelow: "md" },
    { key: "usageLimit", label: "Limit", type: "number", align: "right", hideBelow: "lg" },
    { key: "used", label: "Used", type: "number", align: "right" },
    { key: "startsAt", label: "Starts", type: "date", hideBelow: "lg" },
    { key: "expiresAt", label: "Expires", type: "date" },
    { key: "status", label: "Status", type: "badge", badgeMap: { active: "success", paused: "warning", expired: "muted" } },
  ];

  const fields: FieldSpec[] = [
    { name: "code", label: "Coupon code", required: true, placeholder: "EID2026" },
    {
      name: "type",
      label: "Discount type",
      type: "select",
      required: true,
      options: [
        { value: "percent", label: "Percentage off service fee" },
        { value: "fixed", label: "Fixed amount off (৳)" },
        { value: "free_shipping", label: "Free home delivery" },
      ],
    },
    { name: "value", label: "Value", type: "number", step: "0.01" },
    { name: "minOrderBdt", label: "Minimum order (৳)", type: "number" },
    { name: "usageLimit", label: "Usage limit", type: "number" },
    { name: "used", label: "Times used", type: "number" },
    {
      name: "appliesTo",
      label: "Applies to",
      type: "select",
      options: [
        { value: "all", label: "All orders" },
        { value: "first_order", label: "First order" },
        { value: "air_freight", label: "Air freight" },
        { value: "sea_freight", label: "Sea freight" },
        { value: "wholesale", label: "Wholesale orders" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "paused", "expired"].map((v) => ({ value: v, label: v })),
    },
    { name: "startsAt", label: "Valid from", type: "date" },
    { name: "expiresAt", label: "Valid until", type: "date" },
  ];

  return (
    <div>
      <PageHeader
        title="Coupons & promotions"
        description="Discounts are usually applied to the sourcing service fee rather than the goods value, so duty stays accurate."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Coupons" }]}
      />
      <ResourceTable
        collection="coupons"
        title="Coupons"
        searchPlaceholder="Search coupon codes…"
        columns={columns}
        fields={fields}
        defaults={{ type: "fixed", status: "active", appliesTo: "all", usageLimit: 500 }}
        filters={[
          {
            key: "type",
            label: "Type",
            options: ["percent", "fixed", "free_shipping"].map((v) => ({ value: v, label: v.replace("_", " ") })),
          },
          {
            key: "status",
            label: "Status",
            options: ["active", "paused", "expired"].map((v) => ({ value: v, label: v })),
          },
        ]}
      />
    </div>
  );
}
