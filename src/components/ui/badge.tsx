import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary-700",
        secondary: "border-transparent bg-slate-100 text-slate-700",
        outline: "border-slate-300 text-slate-600",
        success: "border-transparent bg-emerald-50 text-emerald-700",
        warning: "border-transparent bg-amber-50 text-amber-700",
        danger: "border-transparent bg-rose-50 text-rose-700",
        info: "border-transparent bg-sky-50 text-sky-700",
        muted: "border-transparent bg-slate-100 text-slate-500",
        dark: "border-cf-line bg-cf-slate text-slate-300",
        accent: "border-transparent bg-accent/20 text-amber-800",
        hot: "border-transparent bg-gradient-to-r from-rose-500 to-orange-500 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const TONES = {
  default: "default",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  muted: "muted",
} as const;

export function StatusPill({
  tone = "muted",
  children,
  dot = true,
  className,
}: {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const dotColor: Record<string, string> = {
    default: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    muted: "bg-slate-400",
  };
  return (
    <Badge variant={TONES[tone]} className={className}>
      {dot && <span className={cn("size-1.5 rounded-full", dotColor[tone])} />}
      {children}
    </Badge>
  );
}

export { Badge, badgeVariants };
