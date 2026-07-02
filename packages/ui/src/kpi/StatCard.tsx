import type { ReactNode } from "react";
import { withAlpha } from "./echartsBase.js";
import { Sparkline } from "./Sparkline.js";

export interface StatCardProps {
  /** 24px icon chip content (injected by the app layer). */
  icon: ReactNode;
  label: string;
  /** Pre-formatted display string (route through lib/format). */
  value: string;
  unit?: string;
  /** Card accent (token color) — icon chip tint + sparkline color. */
  accent: string;
  /** Recent series for the sparkline (omit to hide it). */
  series?: number[];
  caption?: string;
}

/**
 * KPI-strip stat card: icon chip + label on top, big tabular value on the
 * bottom-left, gradient sparkline on the bottom-right.
 */
export function StatCard({
  icon,
  label,
  value,
  unit,
  accent,
  series,
  caption,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-subtle bg-card p-5 shadow-card">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: withAlpha(accent, 0.12), color: accent }}
          aria-hidden
        >
          {icon}
        </span>
        <span className="truncate text-[13px] text-on-muted">{label}</span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-[30px] font-bold leading-none tabular-nums text-on-surface">
            {value}
          </span>
          {unit ? <span className="text-sm text-on-muted">{unit}</span> : null}
        </div>
        {series && series.length > 1 ? (
          <div className="w-1/2 min-w-0">
            <Sparkline data={series} color={accent} height={48} />
          </div>
        ) : null}
      </div>

      {caption ? (
        <p className="mt-2 text-[11px] text-muted">{caption}</p>
      ) : null}
    </div>
  );
}
