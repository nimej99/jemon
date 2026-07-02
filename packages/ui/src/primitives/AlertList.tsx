import type { ReactNode } from "react";
import { fmtClock } from "../lib/format.js";
import { severityColor } from "../lib/severity.js";
import { tokens } from "../theme/tokens.js";

export type AlertSeverity = "ok" | "warn" | "crit" | "info";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  message: string;
  /** Epoch milliseconds. */
  ts: number;
}

export interface AlertListProps {
  items: AlertItem[];
  /** Shown when `items` is empty — never leave the region blank. */
  emptyText?: string;
  maxItems?: number;
}

/* Backward-compat aliases for the pre-KPI contract. */
export type AlertLevel = AlertSeverity;
export type Alert = AlertItem;

function iconColor(s: AlertSeverity): string {
  return s === "info" ? tokens.color.statusInfo : severityColor(s);
}

/** Built-in 12px semantic glyphs — no external icon dependency. */
const ICONS: Record<AlertSeverity, ReactNode> = {
  ok: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6.3 5 8.8l4.5-5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  warn: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1.6 11 10.4H1L6 1.6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M6 4.8v2.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="8.7" r="0.65" fill="currentColor" />
    </svg>
  ),
  crit: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="m4.3 4.3 3.4 3.4M7.7 4.3 4.3 7.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  info: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="3.8" r="0.65" fill="currentColor" />
      <path
        d="M6 5.6v2.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

/**
 * Side-panel alert feed: semantic glyph + message + right-aligned clock per
 * row, subtle dividers between rows.
 */
export function AlertList({
  items,
  emptyText = "모든 시스템이 정상 운영 중입니다.",
  maxItems,
}: AlertListProps) {
  const visible = maxItems != null ? items.slice(0, maxItems) : items;

  if (visible.length === 0) {
    return <p className="px-1 py-3 text-[13px] text-on-muted">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-col">
      {visible.map((item, i) => (
        <li
          key={item.id}
          className={`flex items-center gap-2.5 py-2.5${
            i > 0 ? " border-t border-subtle" : ""
          }`}
        >
          <span
            className="shrink-0"
            style={{ color: iconColor(item.severity) }}
            aria-hidden
          >
            {ICONS[item.severity]}
          </span>
          <p className="min-w-0 flex-1 truncate text-[13px] text-on-surface">
            {item.message}
          </p>
          <span className="shrink-0 text-[11px] tabular-nums text-muted">
            {fmtClock(item.ts)}
          </span>
        </li>
      ))}
    </ul>
  );
}
