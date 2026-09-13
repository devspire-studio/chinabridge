"use client";

import { Banknote, Plus, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/overlays";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, bdt } from "@/lib/format";

const COURIERS = ["Pathao", "Steadfast", "RedX", "Sundarban", "Hub pickup"];

export function UpdateStatusDialog({
  orderId,
  orderNo,
  currentStatus,
  balanceBdt,
}: {
  orderId: string;
  orderNo: string;
  currentStatus: string;
  balanceBdt: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState(currentStatus);
  const [note, setNote] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [courier, setCourier] = React.useState("");
  const [tracking, setTracking] = React.useState("");
  const [eta, setEta] = React.useState("");

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          status,
          note: note || undefined,
          location: location || undefined,
          courier: courier || undefined,
          courierTrackingNo: tracking || undefined,
          etaAt: eta ? new Date(eta).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${orderNo} moved to ${ORDER_STATUS_LABEL[status]}`);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="cf" size="sm">
          <Truck className="size-3.5" /> Update milestone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update fulfilment milestone — {orderNo}</DialogTitle>
          <DialogDescription>
            The customer sees this on their order timeline and receives an SMS/WhatsApp update.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New status" className="sm:col-span-2">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {ORDER_STATUS_FLOW.map((step) => (
                <option key={step.status} value={step.status}>
                  {step.label}
                </option>
              ))}
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </Select>
          </Field>
          <Field label="Location / hub">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Guangzhou DC-1" />
          </Field>
          <Field label="ETA">
            <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
          </Field>
          {status === "out_for_delivery" && (
            <>
              <Field label="Courier">
                <Select value={courier} onChange={(e) => setCourier(e.target.value)}>
                  <option value="">Select courier</option>
                  {COURIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Courier tracking number">
                <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="PTH88451230" />
              </Field>
            </>
          )}
          <Field label="Internal note / customer message" className="sm:col-span-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="QC passed with 2 pcs replacement from supplier; weights re-verified at 12.4 kg."
            />
          </Field>
        </div>

        {balanceBdt > 0 && status === "delivered" && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Marking as delivered will settle the order as paid. Outstanding balance {bdt(balanceBdt)} — collect before handover
            or record a payment first.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="cf" loading={loading} onClick={submit}>
            Save milestone
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RecordPaymentDialog({ orderId, orderNo, balanceBdt }: { orderId: string; orderNo: string; balanceBdt: number }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState(balanceBdt);
  const [method, setMethod] = React.useState("bkash");
  const [reference, setReference] = React.useState("");

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "payment", amountBdt: amount, method, reference }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${bdt(amount)} recorded against ${orderNo}`);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Banknote className="size-3.5" /> Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment — {orderNo}</DialogTitle>
          <DialogDescription>Outstanding balance {bdt(balanceBdt)}. Payments update the wallet ledger and audit log.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount (৳)" required>
            <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </Field>
          <Field label="Method" required>
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              {["bkash", "nagad", "rocket", "bank_transfer", "card", "wallet", "cod"].map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Transaction reference" className="sm:col-span-2">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="TRX8845120" />
          </Field>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="cf" loading={loading} onClick={submit} disabled={amount <= 0}>
            <Plus className="size-3.5" /> Record {bdt(amount)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
