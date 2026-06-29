"use client";

import type { ReactNode } from "react";

export interface KpiCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  level?: "ok" | "warn" | "crit" | "loading" | "error" | "idle";
  icon?: ReactNode;
  trend?: { value: number; label?: string };
  description?: string;
}

const LEVEL_VALUE_COLOR: Record<string, string> = {
  ok: "text-emerald-400",
  warn: "text-amber-400",
  crit: "text-red-400",
  loading: "text-slate-500",
  error: "text-red-500",
  idle: "text-slate-500",
};

export function KpiCard({
  title,
  value,
  unit,
  level = "idle",
  icon,
  trend,
  description,
}: KpiCardProps) {
  const valueColor = LEVEL_VALUE_COLOR[level] ?? LEVEL_VALUE_COLOR["idle"];
  const displayValue = value === null ? "—" : String(value);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm transition-colors hover:border-slate-600">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </p>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>
          {displayValue}
        </span>
        {unit && (
          <span className="text-sm text-slate-400">{unit}</span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}

      {trend && (
        <p className="mt-1 text-xs text-slate-500">
          <span className={trend.value >= 0 ? "text-emerald-400" : "text-red-400"}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
          </span>
          {trend.label && <span className="ml-1">{trend.label}</span>}
        </p>
      )}
    </div>
  );
}
