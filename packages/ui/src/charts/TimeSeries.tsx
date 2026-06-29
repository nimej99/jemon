"use client";

import { useEffect, useRef, useState } from "react";

/** Minimal echarts instance handle — avoids NodeNext type-import issues with the echarts package */
interface EChartsHandle {
  setOption(option: unknown): void;
  resize(): void;
  dispose(): void;
}

export interface TimeSeriesDataPoint {
  /** Unix timestamp (seconds) */
  timestamp: number;
  value: number;
}

export interface TimeSeriesSeries {
  name: string;
  data: TimeSeriesDataPoint[];
  color?: string;
}

export interface TimeSeriesProps {
  /**
   * One or more named series to plot.
   * Uses ECharts as the default renderer; uPlot is available as an alternative
   * by wrapping this component with a uPlot-based adapter.
   */
  series: TimeSeriesSeries[];
  title?: string;
  unit?: string;
  height?: number;
}

export function TimeSeries({
  series,
  title,
  unit,
  height = 300,
}: TimeSeriesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsHandle | undefined>(undefined);
  const [ready, setReady] = useState(false);

  // Initialize ECharts once
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

  // Update chart data
  useEffect(() => {
    const chart = chartRef.current;
    if (!ready || !chart) return;

    chart.setOption({
      backgroundColor: "transparent",
      title: title
        ? {
            text: title,
            textStyle: { color: "#94a3b8", fontSize: 13, fontWeight: "normal" },
          }
        : undefined,
      tooltip: { trigger: "axis" },
      legend: series.length > 1 ? { textStyle: { color: "#94a3b8" } } : { show: false },
      xAxis: {
        type: "time",
        axisLabel: { color: "#64748b", fontSize: 11 },
        axisLine: { lineStyle: { color: "#334155" } },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
          formatter: (v: number) => (unit ? `${v} ${unit}` : String(v)),
        },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: series.map((s) => ({
        name: s.name,
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, ...(s.color ? { color: s.color } : {}) },
        areaStyle: { opacity: 0.08 },
        data: s.data.map((d) => [d.timestamp * 1000, d.value]),
      })),
      grid: {
        left: 8,
        right: 8,
        top: title ? 36 : 12,
        bottom: 24,
        containLabel: true,
      },
    });
  }, [ready, series, title, unit]);

  // Responsive resize
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
      aria-label={title ?? "time series chart"}
    />
  );
}
