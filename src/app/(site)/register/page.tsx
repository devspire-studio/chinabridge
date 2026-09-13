"use client";

import { Building2, Check, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/fields";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    type: "retail",
  });
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Use at least 6 characters for the password");
      return;
    }
    setLoading(true);
    try {
      const res = await signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      } as never);
      if (res.error) throw new Error(res.error.message ?? "Registration failed");
      toast.success("Account created!", { description: "You can start importing right away." });
      router.push("/account");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
      <div className="max-w-md">
        <Badge variant="secondary">
          <UserPlus className="size-3" /> Free account
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Create your importer account</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          No fees to open an account. Create one to track consignments, manage your wallet, save quotes and get wholesale
          pricing on repeat orders.
        </p>

        <Card className="mt-6 p-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required className="sm:col-span-2">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rakib Hasan" required />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            </Field>
            <Field label="Mobile number" required hint="Used for delivery and SMS updates">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" required />
            </Field>
            <Field label="I am buying as">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="retail">Individual / personal import</option>
                <option value="reseller">Online reseller (Facebook / Daraz / website)</option>
                <option value="wholesale">Wholesale / shop / company</option>
              </Select>
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 6 characters"
                required
              />
            </Field>
            <Field label="Confirm password" required className="sm:col-span-2">
              <Input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat password"
                required
              />
            </Field>

            <div className="sm:col-span-2">
              <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
                Create account
              </Button>
              <p className="mt-2 text-center text-xs text-slate-500">
                Already registered?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Building2 className="size-4 text-primary" /> What you unlock
        </p>
        <ul className="mt-5 space-y-4">
          {[
            ["Landed cost on every product", "Duty, VAT, AIT and freight calculated for your quantity before you pay."],
            ["Wallet & instant refunds", "Top up once, pay for several orders, get refunds instantly."],
            ["Quote desk", "Paste any 1688 / Taobao link and receive a priced quote you can accept."],
            ["Consignment tracking", "Eleven milestones with documents, weights and customs references."],
            ["Wholesale tier", "Volume pricing, credit terms and container programmes on approval."],
          ].map(([title, text]) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span>
                <span className="block text-sm font-medium text-slate-800">{title}</span>
                <span className="block text-xs text-slate-500">{text}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="font-medium text-primary hover:underline">
            terms of service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            privacy policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
