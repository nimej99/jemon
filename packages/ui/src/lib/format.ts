/**
 * Shared value formatters. Every number shown on a jemon dashboard goes
 * through one of these (plus `tabular-nums` in CSS). Hand-formatting is a
 * checklist failure.
 */

/** 0–100 → "25%" (integers; one decimal below 10 for precision). */
export function fmtPercent(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v < 10 && v > 0 ? v.toFixed(1) : Math.round(v)}%`;
}

/**
 * Bits-per-second → "750 Mbps" / "4.58 Gbps" (3 significant digits).
 * Accepts raw bps; use `fromMbps` when the source is already Mbps.
 */
export function fmtBps(bps: number | null | undefined): string {
  if (bps == null || Number.isNaN(bps)) return "—";
  const abs = Math.abs(bps);
  const [div, unit] =
    abs >= 1e9
      ? [1e9, "Gbps"]
      : abs >= 1e6
        ? [1e6, "Mbps"]
        : abs >= 1e3
          ? [1e3, "Kbps"]
          : [1, "bps"];
  const n = bps / div;
  const s =
    n >= 100 ? Math.round(n).toString() : n.toPrecision(3).replace(/\.0+$/, "");
  return `${s} ${unit}`;
}

export const fromMbps = (mbps: number): number => mbps * 1e6;

/** °C value → "38°C". */
export function fmtTemp(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `${Math.round(v)}°C`;
}

/** 1323 → "1,323" (+ optional suffix, e.g. fmtCount(1323, "명")). */
export function fmtCount(
  v: number | null | undefined,
  suffix = "",
): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `${Math.round(v).toLocaleString("en-US")}${suffix}`;
}

/** Epoch ms / Date → "12:01:53" (24h clock). */
export function fmtClock(ts: number | Date): string {
  const d = typeof ts === "number" ? new Date(ts) : ts;
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
