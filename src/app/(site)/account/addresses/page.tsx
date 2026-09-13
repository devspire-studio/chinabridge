"use client";

import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/data";
import { Checkbox, Field, Input, Select } from "@/components/ui/fields";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/overlays";
import type { Address } from "@/lib/types";

const CITIES = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Bogura", "Cumilla", "Narayanganj", "Gazipur", "Rangpur", "Mymensingh"];

const EMPTY: Address = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine: "",
  area: "",
  city: "Dhaka",
  district: "Dhaka",
  postcode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Address>(EMPTY);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/account/profile");
    if (res.ok) {
      const data = await res.json();
      setAddresses(data.customer.addresses ?? []);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "address.upsert", address: draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Address saved");
      setOpen(false);
      setDraft(EMPTY);
      void load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "address.delete", id }),
    });
    toast.success("Address removed");
    void load();
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Delivery addresses</p>
            <p className="text-xs text-slate-500">Use different addresses for home, shop and warehouse deliveries.</p>
          </div>
          <Button
            variant="brand"
            size="sm"
            onClick={() => {
              setDraft(EMPTY);
              setOpen(true);
            }}
          >
            <Plus className="size-3.5" /> Add address
          </Button>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-400">Loading addresses…</p>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="size-5" />}
          title="No saved addresses"
          description="Add a delivery address to speed up checkout next time."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {address.label}
                    {address.isDefault && (
                      <Badge variant="success">
                        <Star className="size-3" /> Default
                      </Badge>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{address.fullName}</p>
                  <p className="text-xs text-slate-500">{address.phone}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {address.addressLine}, {address.area}, {address.city} {address.postcode}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(address);
                    setOpen(true);
                  }}
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={() => remove(address.id!)}>
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit address" : "Add a delivery address"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label">
              <Select value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}>
                <option value="Home">Home</option>
                <option value="Shop">Shop</option>
                <option value="Office">Office</option>
                <option value="Warehouse">Warehouse</option>
              </Select>
            </Field>
            <Field label="Full name" required>
              <Input value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
            </Field>
            <Field label="Mobile number" required>
              <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </Field>
            <Field label="Postcode">
              <Input value={draft.postcode ?? ""} onChange={(e) => setDraft({ ...draft, postcode: e.target.value })} />
            </Field>
            <Field label="Address" required className="sm:col-span-2">
              <Input value={draft.addressLine} onChange={(e) => setDraft({ ...draft, addressLine: e.target.value })} />
            </Field>
            <Field label="Area / Thana" required>
              <Input value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} />
            </Field>
            <Field label="City" required>
              <Select
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value, district: e.target.value })}
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
              <Checkbox checked={draft.isDefault} onCheckedChange={(v) => setDraft({ ...draft, isDefault: Boolean(v) })} />
              Set as default delivery address
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" loading={saving} onClick={save} disabled={!draft.fullName || !draft.phone || !draft.addressLine}>
              Save address
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
