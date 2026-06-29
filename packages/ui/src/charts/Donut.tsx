"use client";

import { useEffect, useRef, useState } from "react";

interface EChartsHandle {
  setOption(option: unknown): void;
  resize(): void;
  dispose(): void;
}

export interface DonutSegment {
  name: string;
  value: number;
  color?: string;
}

export interface DonutProps {
  data: DonutSegment[];
  title?: string;
  centerLabel?: string;
  unit?: string;
  height?: number;
}

export function Donut({
  data,
  title,
  centerLabel,
  unit,
  height = 260,
}: DonutProps) {
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

    const label = centerLabel ?? (unit ? `{b}\n{d}%` : "{d}%");

    chart.setOption({
      backgroundColor: "transparent",
      title: title
        ? {
            text: title,
            left: "center",
            textStyle: { color: "#94a3b8", fontSize: 13, fontWeight: "normal" },
          }
        : undefined,
      tooltip: { trigger: "item" },
      legend: {
        bottom: 0,
        textStyle: { color: "#94a3b8", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["50%", "72%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: "center",
            formatter: label,
            color: "#f1f5f9",
            fontSize: 14,
            fontWeight: "bold",
          },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: "bold" },
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" },
          },
          labelLine: { show: false },
          data: data.map((d) => ({
            name: d.name,
            value: d.value,
            ...(d.color ? { itemStyle: { color: d.color } } : {}),
          })),
        },
      ],
    });
  }, [ready, data, title, centerLabel, unit]);

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
      aria-label={title ?? "donut chart"}
    />
  );
}
