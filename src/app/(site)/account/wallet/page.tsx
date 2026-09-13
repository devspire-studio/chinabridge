"use client";

import { ArrowDownLeft, ArrowUpRight, Plus, Wallet as WalletIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, StatCard } from "@/components/ui/data";
import { Field, Input, Select } from "@/components/ui/fields";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/overlays";
import { bdt, dateTime } from "@/lib/format";

interface Txn {
  id: string;
  type: string;
  amountBdt: number;
  balanceAfterBdt: number;
  reference: string;
  note: string;
  at: string;
}
interface Profile {
  walletBalanceBdt: number;
  dueBdt: number;
  totalSpentBdt: number;
  walletTransactions: Txn[];
}

export default function WalletPage() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [amount, setAmount] = React.useState(5000);
  const [method, setMethod] = React.useState("bkash");
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/account/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data.customer);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function topUp() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountBdt: amount, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${bdt(amount)} added to your wallet`);
      setOpen(false);
      void load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const transactions = profile?.walletTransactions ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value={bdt(profile?.walletBalanceBdt ?? 0)} icon={<WalletIcon className="size-4" />} tone="success" />
        <StatCard label="Outstanding due" value={bdt(profile?.dueBdt ?? 0)} tone={profile?.dueBdt ? "danger" : "default"} />
        <StatCard label="Lifetime spend" value={bdt(profile?.totalSpentBdt ?? 0, { compact: true })} />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">ChinaBridge wallet</p>
            <p className="text-xs text-slate-500">
              Top up once and pay for multiple orders, duty top-ups and freight deposits instantly.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="brand" size="sm">
                <Plus className="size-3.5" /> Add money
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Top up your wallet</DialogTitle>
                <DialogDescription>
                  Send the amount to our merchant number, then confirm here with the transaction ID. Wallet credit reflects
                  immediately in this demo environment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Field label="Amount (৳)" hint="Minimum ৳500 · maximum ৳5,00,000 per transfer">
                  <Input type="number" min={500} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </Field>
                <Field label="Payment method">
                  <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="bkash">bKash — 01711-000111</option>
                    <option value="nagad">Nagad — 01811-000222</option>
                    <option value="rocket">Rocket — 01911-000333</option>
                    <option value="bank_transfer">Bank transfer — City Bank 1402-8871-0001</option>
                    <option value="card">Card / online</option>
                  </Select>
                </Field>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="brand" loading={submitting} onClick={topUp}>
                    Add {bdt(amount)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge variant="secondary">Instant wallet refunds</Badge>
          <Badge variant="secondary">Duty reconciliation credited automatically</Badge>
          <Badge variant="secondary">No top-up fee</Badge>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-900">Transaction history</p>
          <p className="text-xs text-slate-500">Every top-up, order payment, refund and cashback credit.</p>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-slate-400">Loading transactions…</p>
        ) : transactions.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No transactions yet" description="Top up your wallet to pay for orders instantly." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {transactions.map((txn) => (
              <li key={txn.id} className="flex items-center gap-3 p-4">
                <span
                  className={`flex size-9 items-center justify-center rounded-lg ${
                    txn.amountBdt >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {txn.amountBdt >= 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize text-slate-800">{txn.type.replace(/_/g, " ")}</p>
                  <p className="truncate text-xs text-slate-500">
                    {txn.note || "—"} · ref {txn.reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className={txn.amountBdt >= 0 ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-slate-800"}>
                    {txn.amountBdt >= 0 ? "+" : ""}
                    {bdt(txn.amountBdt)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {dateTime(txn.at)} · bal {bdt(txn.balanceAfterBdt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
