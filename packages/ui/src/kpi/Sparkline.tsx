"use client";

import { useEffect, useRef } from "react";
import uPlot from "uplot";
import { withAlpha } from "./echartsBase.js";

export interface SparklineProps {
  /** Series values; the x axis is the array index. */
  data: number[];
  /** Line/gradient accent (token color). */
  color: string;
  height?: number;
  className?: string;
}

/**
 * Bare uPlot sparkline: no axes, no legend, no grid, no cursor — just a
 * 1.5px line over a vertical area gradient (25% alpha fading to 0%).
 */
export function Sparkline({
  data,
  color,
  height = 48,
  className,
}: SparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const opts: uPlot.Options = {
      width: Math.max(node.clientWidth, 1),
      height,
      pxAlign: false,
      padding: [2, 0, 2, 0],
      cursor: { show: false },
      legend: { show: false },
      scales: { x: { time: false } },
      axes: [{ show: false }, { show: false }],
      series: [
        {},
        {
          stroke: color,
          width: 1.5,
          points: { show: false },
          fill: (u) => {
            const grad = u.ctx.createLinearGradient(
              0,
              u.bbox.top,
              0,
              u.bbox.top + u.bbox.height,
            );
            grad.addColorStop(0, withAlpha(color, 0.25));
            grad.addColorStop(1, withAlpha(color, 0));
            return grad;
          },
        },
      ],
    };

    const xs = data.map((_, i) => i);
    const u = new uPlot(opts, [xs, data], node);

    // Inline the positioning rules normally shipped in uPlot.css so the
    // component works without a global stylesheet import.
    const wrap = u.under.parentElement;
    if (wrap) wrap.style.position = "relative";
    u.under.style.position = "absolute";
    u.over.style.position = "absolute";

    chartRef.current = u;

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? node.clientWidth;
      if (chartRef.current && w > 0) {
        chartRef.current.setSize({ width: w, height });
      }
    });
    ro.observe(node);

    return () => {
      ro.disconnect();
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, color, height]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: `${height}px` }}
      aria-hidden
    />
  );
}
