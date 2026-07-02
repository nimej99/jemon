"use client";

import { useEffect, useRef, useState } from "react";
import { fmtCount } from "../lib/format.js";
import { echartsBase } from "./echartsBase.js";

/** Minimal echarts instance handle — avoids NodeNext type-import issues. */
interface EChartsHandle {
  setOption(option: unknown): void;
  resize(): void;
  dispose(): void;
}

export interface DonutSummarySegment {
  label: string;
  value: number;
  /** Segment color (semantic token color). */
  color: string;
}

export interface DonutSummaryProps {
  segments: DonutSummarySegment[];
  /** Caption under the center total. */
  totalLabel?: string;
}

/**
 * Side-panel status summary: thin donut with a big centered total on the
 * left, dot + label + right-aligned count legend column on the right.
 */
export function DonutSummary({
  segments,
  totalLabel = "TOTAL",
}: DonutSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsHandle | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let disposed = false;

    void import("echarts").then(({ init }) => {
      if (disposed || !containerRef.current) return;
      chartRef.current = init(containerRef.current);
      setReady(true);
    });

    return () => {
      disposed = true;
      chartRef.current?.dispose();
      chartRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!ready || !chart) return;

    chart.setOption({
      ...echartsBase,
      tooltip: { show: false },
      series: [
        {
          type: "pie",
          radius: ["68%", "88%"],
          center: ["50%", "50%"],
          padAngle: 2,
          silent: true,
          label: { show: false },
          labelLine: { show: false },
          emphasis: { disabled: true },
          itemStyle: { borderRadius: 4 },
          data: segments.map((s) => ({
            name: s.label,
            value: s.value,
            itemStyle: { color: s.color, borderRadius: 4 },
          })),
        },
      ],
    });
  }, [ready, segments]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => chartRef.current?.resize());
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[120px] w-[120px] shrink-0">
        <div
          ref={containerRef}
          className="absolute inset-0"
          aria-label="장비 상태 도넛"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-bold leading-none tabular-nums text-on-surface">
            {fmtCount(total)}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-micro text-muted">
            {totalLabel}
          </span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-on-muted">
              {s.label}
            </span>
            <span className="shrink-0 text-right text-[13px] font-semibold tabular-nums text-on-surface">
              {fmtCount(s.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
