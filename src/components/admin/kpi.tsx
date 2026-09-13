"use client";

import * as React from "react";

import { Sparkline } from "@/components/admin/charts";
import { cn } from "@/lib/cn";

export function KpiCard({
  label,
  value,
  delta,
  hint,
  spark,
  tone = "#f6821f",
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  spark?: number[];
  tone?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-4 shadow-card", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {icon && <span className="text-slate-300">{icon}</span>}
      </div>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[11px] font-medium",
              delta.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
            )}
          >
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {spark && spark.length > 1 && (
        <div className="mt-2">
          <Sparkline data={spark} tone={tone} />
        </div>
      )}
    </div>
  );
}

/** Dark KPI tile used in the Cloudflare-style "analytics" band. */
export function DarkKpi({
  label,
  value,
  sub,
  tone = "#f6821f",
  spark,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
  spark?: number[];
}) {
  return (
    <div className="rounded-lg border border-cf-line/70 bg-cf-panel p-4">
      <p className="text-[11px] uppercase tracking-wide text-cf-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      {sub && <p className="text-[11px] text-cf-muted">{sub}</p>}
      {spark && spark.length > 1 && (
        <div className="mt-2 opacity-80">
          <Sparkline data={spark} tone={tone} />
        </div>
      )}
    </div>
  );
}
