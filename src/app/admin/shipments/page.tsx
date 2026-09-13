import { PageHeader } from "@/components/admin/admin-shell";
import { ResourceTable, type ColumnSpec, type FieldSpec } from "@/components/admin/resource-table";
import { SHIPPING_MODE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function AdminShipmentsPage() {
  const columns: ColumnSpec[] = [
    { key: "ref", label: "Consignment", type: "strong", sub: "carrier" },
    {
      key: "mode",
      label: "Mode",
      type: "badge",
      badgeMap: {
        air_express: "accent",
        air_standard: "warning",
        sea_lcl: "info",
        sea_fcl: "secondary",
      },
    },
    { key: "originCity", label: "Route", type: "strong", sub: "destinationCity", hideBelow: "md" },
    { key: "awbOrBl", label: "AWB / BL", type: "muted", hideBelow: "lg" },
    { key: "containerNo", label: "Container", type: "muted", hideBelow: "xl" },
    { key: "weightGrams", label: "Weight", type: "weight", align: "right" },
    { key: "cbm", label: "CBM", type: "number", align: "right", hideBelow: "lg" },
    { key: "freightCostBdt", label: "Freight", type: "currency", align: "right", hideBelow: "md" },
    { key: "orderCount", label: "Orders", type: "number", align: "right", hideBelow: "xl" },
    { key: "etaAt", label: "ETA", type: "date" },
    {
      key: "status",
      label: "Status",
      type: "badge",
      badgeMap: {
        booking: "muted",
        loading: "warning",
        in_transit: "info",
        at_port: "info",
        customs: "warning",
        released: "success",
        received_warehouse: "success",
        cancelled: "danger",
      },
    },
  ];

  const fields: FieldSpec[] = [
    { name: "ref", label: "Consignment reference", required: true, placeholder: "CB-AIR-2418" },
    {
      name: "mode",
      label: "Shipping mode",
      type: "select",
      required: true,
      options: Object.entries(SHIPPING_MODE_LABEL).map(([value, label]) => ({ value, label })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["booking", "loading", "in_transit", "at_port", "customs", "released", "received_warehouse", "cancelled"].map(
        (v) => ({ value: v, label: v.replace(/_/g, " ") }),
      ),
    },
    { name: "carrier", label: "Carrier / forwarder", placeholder: "SF Express · Sinotrans" },
    { name: "originCity", label: "Origin city", placeholder: "Guangzhou" },
    { name: "destinationCity", label: "Destination city", placeholder: "Dhaka" },
    { name: "awbOrBl", label: "AWB / Bill of lading" },
    { name: "containerNo", label: "Container no." },
    { name: "weightGrams", label: "Gross weight (g)", type: "number" },
    { name: "chargeableWeightGrams", label: "Chargeable weight (g)", type: "number" },
    { name: "cbm", label: "Volume (CBM)", type: "number", step: "0.001" },
    { name: "freightCostBdt", label: "Freight cost (৳)", type: "number" },
    { name: "dutyPaidBdt", label: "Duty paid (৳)", type: "number" },
    { name: "orderCount", label: "Orders in consignment", type: "number" },
    { name: "departedAt", label: "Departed (China)", type: "date" },
    { name: "etaAt", label: "ETA (Dhaka)", type: "date" },
    { name: "arrivedAt", label: "Arrived at port", type: "date" },
    { name: "clearedAt", label: "Customs cleared", type: "date" },
    { name: "notes", label: "Notes", type: "textarea", span: 2 },
  ];

  return (
    <div>
      <PageHeader
        title="Consignments"
        description="Air express, air standard and sea freight movements from our China consolidation hub to Bangladesh."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Consignments" }]}
      />
      <ResourceTable
        collection="shipments"
        title="Shipments"
        searchPlaceholder="Search by reference, AWB, container or carrier…"
        columns={columns}
        fields={fields}
        defaults={{ mode: "air_standard", status: "booking", originCity: "Guangzhou", destinationCity: "Dhaka" }}
        createLabel="Add consignment"
        filters={[
          {
            key: "mode",
            label: "Mode",
            options: Object.entries(SHIPPING_MODE_LABEL).map(([value, label]) => ({ value, label })),
          },
          {
            key: "status",
            label: "Status",
            options: ["booking", "loading", "in_transit", "at_port", "customs", "released", "received_warehouse", "cancelled"].map(
              (v) => ({ value: v, label: v.replace(/_/g, " ") }),
            ),
          },
        ]}
      />
    </div>
  );
}
