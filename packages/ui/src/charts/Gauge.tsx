"use client";

import { useEffect, useRef, useState } from "react";

interface EChartsHandle {
  setOption(option: unknown): void;
  resize(): void;
  dispose(): void;
}

export interface GaugeProps {
  value: number | null;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  /** Value at which the gauge turns amber */
  warn?: number;
  /** Value at which the gauge turns red */
  crit?: number;
  height?: number;
}

export function Gauge({
  value,
  min = 0,
  max = 100,
  title,
  unit,
  warn,
  crit,
  height = 200,
}: GaugeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsHandle | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let disposed = false;

    void import("echarts").then(({ init }) => {
      if (disposed || !containerRef.current) return;
      chartRef.current = init(containerRef.current, "dark");
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

    const v = value ?? 0;
    const color =
      crit !== undefined && v >= crit
        ? "#ef4444"
        : warn !== undefined && v >= warn
        ? "#f59e0b"
        : "#22c55e";

    chart.setOption({
      backgroundColor: "transparent",
      series: [
        {
          type: "gauge",
          min,
          max,
          startAngle: 200,
          endAngle: -20,
          radius: "88%",
          itemStyle: { color },
          progress: { show: true, width: 12 },
          axisLine: {
            lineStyle: { width: 12, color: [[1, "#1e293b"]] },
          },
          axisTick: { show: false },
          splitLine: { length: 8, lineStyle: { color: "#334155", width: 2 } },
          axisLabel: { color: "#64748b", fontSize: 10, distance: 14 },
          pointer: { show: false },
          anchor: { show: false },
          title: {
            show: !!title,
            offsetCenter: [0, "72%"],
            fontSize: 11,
            color: "#94a3b8",
          },
          detail: {
            valueAnimation: true,
            fontSize: 18,
            fontWeight: "bold",
            color: "#f1f5f9",
            offsetCenter: [0, "32%"],
            formatter: unit ? `{value}${unit}` : "{value}",
          },
          data: [{ value: v, name: title ?? "" }],
        },
      ],
    });
  }, [ready, value, min, max, title, unit, warn, crit]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => chartRef.current?.resize());
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: `${height}px` }}
      aria-label={title ?? "gauge chart"}
    />
  );
}
