"use client";

import { RefreshCw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { Switch } from "@/components/ui/fields";
import type { Settings } from "@/lib/types";

type Draft = Settings;

const GROUPS: {
  title: string;
  description: string;
  fields: { key: keyof Draft; label: string; hint?: string; type?: "text" | "number" | "textarea"; step?: string; span?: boolean }[];
}[] = [
  {
    title: "Brand & contact",
    description: "Shown on the storefront, invoices, SMS and WhatsApp templates.",
    fields: [
      { key: "brandName", label: "Brand name" },
      { key: "supportPhone", label: "Support hotline" },
      { key: "whatsapp", label: "WhatsApp business number" },
      { key: "supportEmail", label: "Support email" },
      { key: "brandTagline", label: "Tagline", type: "text", span: true },
      { key: "address", label: "Registered office", type: "textarea", span: true },
    ],
  },
  {
    title: "Currency & service fees",
    description: "Drives every landed-cost calculation on the storefront and in quotes.",
    fields: [
      { key: "cnyToBdt", label: "CNY → BDT rate", type: "number", step: "0.01" },
      { key: "usdToBdt", label: "USD → BDT rate", type: "number", step: "0.01" },
      { key: "serviceFeePct", label: "Sourcing service fee %", type: "number", step: "0.1" },
      { key: "minServiceFeeBdt", label: "Minimum service fee (৳)", type: "number" },
      { key: "vatPct", label: "VAT %", type: "number", step: "0.1" },
      { key: "aitPct", label: "AIT (advance income tax) %", type: "number", step: "0.1" },
      { key: "insurancePct", label: "Cargo insurance %", type: "number", step: "0.1" },
      { key: "codFeePct", label: "Cash-on-delivery fee %", type: "number", step: "0.1" },
    ],
  },
  {
    title: "Shipping & warehousing",
    description: "Last-mile delivery charges and free storage window in the China warehouse.",
    fields: [
      { key: "homeDeliveryDhakaBdt", label: "Home delivery inside Dhaka (৳)", type: "number" },
      { key: "homeDeliveryOutsideBdt", label: "Home delivery outside Dhaka (৳)", type: "number" },
      { key: "pickupDiscountBdt", label: "Hub pickup discount (৳)", type: "number" },
      { key: "freeShippingThresholdBdt", label: "Free delivery over (৳)", type: "number" },
      { key: "warehouseStorageFreeDays", label: "Free storage days", type: "number" },
      { key: "storageFeePerCbmBdt", label: "Storage fee per CBM / day (৳)", type: "number" },
    ],
  },
  {
    title: "Payment terms",
    description: "How much we ask for up front before sourcing from 1688/Taobao.",
    fields: [{ key: "advancePaymentPct", label: "Advance payment required %", type: "number" }],
  },
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<Draft>(initial);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, exchangeRateUpdatedAt: new Date().toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save settings");
      toast.success("Settings saved");
      setDirty(false);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {GROUPS.map((group) => (
        <section key={group.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-900">{group.title}</p>
            <p className="text-xs text-slate-500">{group.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.fields.map((field) => (
              <Field
                key={String(field.key)}
                label={field.label}
                hint={field.hint}
                className={field.span ? "sm:col-span-2 xl:col-span-3" : undefined}
              >
                {field.type === "textarea" ? (
                  <Textarea
                    value={String(draft[field.key] ?? "")}
                    onChange={(e) => update(field.key, e.target.value as Draft[typeof field.key])}
                  />
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    step={field.step}
                    value={String(draft[field.key] ?? "")}
                    onChange={(e) =>
                      update(
                        field.key,
                        (field.type === "number" ? Number(e.target.value) : e.target.value) as Draft[typeof field.key],
                      )
                    }
                  />
                )}
              </Field>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <p className="text-sm font-semibold text-slate-900">Storefront behaviour</p>
        <p className="mb-4 text-xs text-slate-500">Operational switches that take effect immediately for visitors.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3">
            <span>
              <span className="block text-sm font-medium text-slate-800">Guest checkout</span>
              <span className="block text-xs text-slate-500">Let visitors order with just a phone number.</span>
            </span>
            <Switch checked={draft.guestCheckout} onCheckedChange={(checked) => update("guestCheckout", checked)} />
          </label>
          <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3">
            <span>
              <span className="block text-sm font-medium text-slate-800">Maintenance mode</span>
              <span className="block text-xs text-slate-500">Show a notice instead of the catalogue.</span>
            </span>
            <Switch checked={draft.maintenanceMode} onCheckedChange={(checked) => update("maintenanceMode", checked)} />
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur">
        <p className="text-xs text-slate-500">
          {dirty ? "You have unsaved changes." : `Exchange rate last updated ${new Date(draft.exchangeRateUpdatedAt).toLocaleString()}.`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft(initial);
              setDirty(false);
              toast.message("Reverted to last saved values");
            }}
          >
            <RefreshCw className="size-3.5" /> Revert
          </Button>
          <Button variant="cf" size="sm" loading={saving} disabled={!dirty} onClick={save}>
            <Save className="size-3.5" /> Save settings
          </Button>
        </div>
      </div>
    </div>
  );
}
