"use client";

import { useEffect, useState, type ReactNode } from "react";
import { fmtClock } from "../lib/format.js";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned slot — typically <LastUpdated/>. */
  right?: ReactNode;
}

/**
 * Page-level heading row: bold H1 + muted subtitle on the left, free slot on
 * the right (reference §3.3).
 */
export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex items-center">{right}</div>}
    </div>
  );
}

export interface LastUpdatedProps {
  /** Epoch ms of the last refresh; omit for a live 1s-tick clock. */
  timestamp?: number;
  onRefresh?: () => void;
  /** Refresh icon node; the round button renders only when provided. */
  refreshIcon?: ReactNode;
  label?: string;
}

/**
 * "마지막 업데이트 12:01:53" caption + optional round refresh button.
 * A live timestamp is a trust signal — with no `timestamp` it ticks every
 * second from the local clock.
 */
export function LastUpdated({
  timestamp,
  onRefresh,
  refreshIcon,
  label = "마지막 업데이트",
}: LastUpdatedProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (timestamp !== undefined) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timestamp]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-muted">
        {label} <span className="tabular-nums">{fmtClock(timestamp ?? now)}</span>
      </span>
      {refreshIcon && (
        <button
          type="button"
          aria-label="새로고침"
          onClick={onRefresh}
          className="flex h-8 w-8 items-center justify-center rounded-full text-on-muted transition-colors hover:bg-[var(--bg-hover)]"
        >
          {refreshIcon}
        </button>
      )}
    </div>
  );
}
