import { tokens } from "../theme/tokens.js";

export type Severity = "ok" | "warn" | "crit";

export interface Thresholds {
  /** value ≥ warn → "warn" */
  warn?: number;
  /** value ≥ crit → "crit" */
  crit?: number;
}

/**
 * Threshold judgement — the only allowed way to map a metric value to a
 * semantic level. Components must never hard-code thresholds.
 */
export function severityOf(
  value: number | null | undefined,
  t: Thresholds,
): Severity {
  if (value == null || Number.isNaN(value)) return "ok";
  if (t.crit !== undefined && value >= t.crit) return "crit";
  if (t.warn !== undefined && value >= t.warn) return "warn";
  return "ok";
}

/** Semantic token color for a severity level. */
export function severityColor(s: Severity): string {
  switch (s) {
    case "crit":
      return tokens.color.statusCrit;
    case "warn":
      return tokens.color.statusWarn;
    default:
      return tokens.color.statusOk;
  }
}
