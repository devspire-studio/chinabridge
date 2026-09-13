"use client";

import { BadgeCheck, Save } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/fields";
import { authClient } from "@/lib/auth-client";
import { bdt, shortDate } from "@/lib/format";

interface Profile {
  name: string;
  email: string;
  phone: string;
  type: string;
  tier: string;
  joinedAt: string;
  totalOrders: number;
  totalSpentBdt: number;
  walletBalanceBdt: number;
}

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      const res = await fetch("/api/account/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.customer);
      }
    })();
  }, []);

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone }),
      });
      if (!res.ok) throw new Error("Could not save profile");
      toast.success("Profile updated");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <p className="text-sm font-semibold text-slate-900">Profile details</p>
        <p className="text-xs text-slate-500">Used on invoices, customs documents and delivery notes.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={profile?.name ?? session?.user?.name ?? ""} onChange={(e) => profile && setProfile({ ...profile, name: e.target.value })} />
          </Field>
          <Field label="Mobile number">
            <Input value={profile?.phone ?? ""} onChange={(e) => profile && setProfile({ ...profile, phone: e.target.value })} />
          </Field>
          <Field label="Email" hint="Changing your sign-in email requires support verification.">
            <Input value={profile?.email ?? session?.user?.email ?? ""} readOnly className="bg-slate-50" />
          </Field>
          <Field label="Account type" hint="Wholesale pricing is applied to approved business accounts.">
            <Input value={profile?.type ?? "retail"} readOnly className="bg-slate-50 capitalize" />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {profile && (
              <>
                <Badge variant="accent">{profile.tier} tier</Badge>
                <Badge variant="secondary">{profile.totalOrders} orders</Badge>
                <Badge variant="muted">since {shortDate(profile.joinedAt)}</Badge>
              </>
            )}
          </div>
          <Button variant="brand" loading={saving} onClick={save}>
            <Save className="size-4" /> Save changes
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-slate-900">Loyalty & tiering</p>
        <p className="mt-1 text-xs text-slate-500">
          Tiers are recalculated monthly from delivered order value. Higher tiers unlock lower service fees and priority
          consolidation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { tier: "bronze", spent: "০–২ L", benefit: "Standard service fee" },
            { tier: "silver", spent: "২–১০ L", benefit: "Priority QC" },
            { tier: "gold", spent: "১০–৫০ L", benefit: "Reduced fee + free storage" },
            { tier: "platinum", spent: "৫০ L+", benefit: "Credit terms + dedicated agent" },
          ].map((row) => (
            <div
              key={row.tier}
              className={`rounded-xl border p-4 ${profile?.tier === row.tier ? "border-primary bg-primary/5" : "border-slate-200"}`}
            >
              <p className="flex items-center gap-1.5 text-sm font-semibold capitalize text-slate-900">
                {row.tier}
                {profile?.tier === row.tier && <BadgeCheck className="size-3.5 text-primary" />}
              </p>
              <p className="mt-1 text-xs text-slate-500">{row.spent} lifetime</p>
              <p className="mt-1 text-xs text-slate-400">{row.benefit}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-slate-900">Account summary</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Wallet balance</dt>
            <dd className="text-lg font-semibold text-slate-900">{bdt(profile?.walletBalanceBdt ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Lifetime spend</dt>
            <dd className="text-lg font-semibold text-slate-900">{bdt(profile?.totalSpentBdt ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Total orders</dt>
            <dd className="text-lg font-semibold text-slate-900">{profile?.totalOrders ?? 0}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
