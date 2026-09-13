"use client";

import { Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/fields";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/overlays";
import { bdt } from "@/lib/format";

export function GroupBuyJoin({
  dealId,
  title,
  unitPriceBdt,
  groupPriceBdt,
  productId,
}: {
  dealId: string;
  title: string;
  unitPriceBdt: number;
  groupPriceBdt: number;
  productId?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ customerName: "", phone: "", quantity: 10 });

  async function join() {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          phone: form.phone,
          sourceUrl: `https://chinabridge.com.bd/group-buy#${dealId}`,
          sourcePlatform: "Alibaba",
          productName: `Group deal reservation: ${title}`,
          quantity: Number(form.quantity),
          notes: `Group deal ${dealId}${productId ? ` (product ${productId})` : ""} · group price ${groupPriceBdt} vs ${unitPriceBdt}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Reserved ${form.quantity} units`, { description: `Reference ${data.ref} — we will confirm when the group fills.` });
      setOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand" size="sm">
          <Users className="size-3.5" /> Join group · save {bdt(unitPriceBdt - groupPriceBdt)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserve your group quantity</DialogTitle>
          <DialogDescription>
            No payment now. We contact you when the group fills to confirm the wholesale price and landed cost.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="Your name" required>
            <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Rakib Hasan" />
          </Field>
          <Field label="Mobile number" required>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="Quantity (pcs)" hint={`Group price ${bdt(groupPriceBdt)} vs regular ${bdt(unitPriceBdt)}`}>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="brand" loading={loading} disabled={!form.customerName || !form.phone} onClick={join}>
            Reserve {form.quantity} units
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
