"use client";

import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/fields";
import { signIn } from "@/lib/auth-client";

const DEMO_ACCOUNTS = [
  { label: "Super admin", email: "admin@chinabridge.com.bd", password: "Admin@1234" },
  { label: "Ops manager", email: "ops@chinabridge.com.bd", password: "Ops@12345" },
  { label: "Support agent", email: "support@chinabridge.com.bd", password: "Support@123" },
  { label: "Customer", email: "rakib@example.com", password: "Customer@123" },
];

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const redirect = params.get("redirect");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let email = identifier.trim();
      if (!email.includes("@")) {
        const res = await fetch("/api/account/resolve-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        email = data.email;
      }

      const result = await signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message ?? "Sign in failed");

      toast.success("Welcome back!");
      const role = (result.data?.user as { role?: string } | undefined)?.role;
      const destination = redirect ?? (role && role !== "customer" ? "/admin" : "/account");
      router.push(destination);
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
          <ShieldCheck className="size-3" /> Secure sign in
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Track consignments, manage the wallet, accept quotes and reorder your bestsellers. Use your email or the mobile
          number on your account.
        </p>

        <Card className="mt-6 p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Email or mobile number" required>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 01XXXXXXXXX"
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
              <LogIn className="size-4" /> Sign in
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            New to ChinaBridge?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </Card>

        <Card className="mt-4 p-4">
          <p className="text-xs font-semibold text-slate-700">Demo credentials</p>
          <div className="mt-2 grid gap-1.5">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setIdentifier(account.email);
                  setPassword(account.password);
                }}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-left text-[11px] hover:bg-slate-100"
              >
                <span className="font-medium text-slate-700">{account.label}</span>
                <span className="font-mono text-slate-500">{account.email}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white lg:block">
        <p className="text-sm font-semibold text-accent">What you can do after signing in</p>
        <ul className="mt-5 space-y-4 text-sm text-slate-300">
          {[
            ["Live consignment tracking", "All eleven milestones with customs documents and courier numbers."],
            ["Wallet & payments", "Advance top-ups, duty reconciliation and instant refunds."],
            ["Quotes you can accept", "Every RFQ with the landed-cost breakdown, ready to convert into an order."],
            ["Reorder in one click", "Your wholesale lots and best-selling SKUs saved as templates."],
            ["Support tickets", "Order-linked conversations with our sourcing and customs teams."],
          ].map(([title, text]) => (
            <li key={title}>
              <p className="font-medium text-white">{title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
