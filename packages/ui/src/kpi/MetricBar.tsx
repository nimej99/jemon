import type { Severity } from "../lib/severity.js";
import { severityColor } from "../lib/severity.js";

export interface MetricBarProps {
  label: string;
  /** Fill ratio, 0–100 (clamped). */
  fillPct: number;
  /** Pre-formatted display value (route through lib/format). */
  display: string;
  /** Fill color when severity is normal (token color). */
  accent: string;
  severity?: Severity;
}

/**
 * Single metric row: micro uppercase label, 4px rounded track, right-aligned
 * tabular value. Fill turns semantic on warn/crit.
 */
export function MetricBar({
  label,
  fillPct,
  display,
  accent,
  severity,
}: MetricBarProps) {
  const pct = Math.min(100, Math.max(0, fillPct));
  const fill =
    severity === "warn" || severity === "crit"
      ? severityColor(severity)
      : accent;

  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-[9px] font-semibold uppercase tracking-micro text-muted">
        {label}
      </span>
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, backgroundColor: fill }}
        />
      </div>
      <span className="min-w-[52px] shrink-0 text-right text-[11px] tabular-nums text-on-muted">
        {display}
      </span>
    </div>
  );
}
