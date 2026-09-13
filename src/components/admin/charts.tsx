"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { bdt, numberFmt, shortDate } from "@/lib/format";

const PALETTE = ["#f6821f", "#1e40f5", "#12a150", "#0ea5e9", "#a855f7", "#f5a524", "#e11d48", "#14b8a6"];

function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-card ${className ?? ""}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function RevenueTrend({
  data,
}: {
  data: { date: string; revenue: number; orders: number }[];
}) {
  return (
    <ChartCard
      title="Revenue & order volume"
      subtitle="Last 30 days of landed order value in BDT"
      actions={
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#f6821f]" /> Revenue
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#1e40f5]" /> Orders
          </span>
        </div>
      }
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.map((d) => ({ ...d, label: shortDate(d.date) }))} margin={{ left: -18, right: 6, top: 4 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f6821f" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f6821f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e40f5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1e40f5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => bdt(Number(v), { compact: true })}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(value: number, name) => (name === "Revenue" ? bdt(value) : numberFmt(value))}
            />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f6821f" strokeWidth={2} fill="url(#revFill)" />
            <Area type="monotone" dataKey="orders" name="Orders" stroke="#1e40f5" strokeWidth={2} fill="url(#ordFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function CategoryMix({ data }: { data: { category: string; revenue: number }[] }) {
  return (
    <ChartCard title="Category mix" subtitle="Revenue share by import category">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => bdt(Number(v), { compact: true })} />
            <YAxis type="category" dataKey="category" width={128} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(value: number) => bdt(value)}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function StatusDonut({ data }: { data: { status: string; count: number }[] }) {
  return (
    <ChartCard title="Fulfilment pipeline" subtitle="Orders by current milestone">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={52} outerRadius={82} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function ChannelChart({ data }: { data: { channel: string; orders: number }[] }) {
  return (
    <ChartCard title="Order channels" subtitle="Where the orders come from">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="channel" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Bar dataKey="orders" fill="#1e40f5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function Sparkline({ data, tone = "#f6821f" }: { data: number[]; tone?: string }) {
  const chartData = data.map((value, i) => ({ i, value }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${tone.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tone} stopOpacity={0.4} />
              <stop offset="100%" stopColor={tone} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={tone} strokeWidth={1.6} fill={`url(#spark-${tone.replace("#", "")})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { ChartCard };
