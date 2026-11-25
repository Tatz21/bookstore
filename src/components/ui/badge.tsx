import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger" | "outline";

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-glass)]",
  accent:
    "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/25",
  success:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
  warning:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
  danger:
    "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30",
  outline:
    "border border-[var(--border-strong)] text-[var(--text-secondary)]",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-xs",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
