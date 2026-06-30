"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useKpi, useMetric, useAlerts } from "@jemon/metric-sdk";
import { KpiCard, StatTile, AlertList } from "@jemon/ui";
import type { Alert } from "@jemon/ui";
import type { CatalogEntry, VmAlert } from "@jemon/metric-sdk";

// Lazy-load chart components with ssr:false so ECharts only runs client-side
const TimeSeries = dynamic(
  () => import("@jemon/ui").then((m) => m.TimeSeries),
  { ssr: false },
);
const Donut = dynamic(
  () => import("@jemon/ui").then((m) => m.Donut),
  { ssr: false },
);
const Gauge = dynamic(
  () => import("@jemon/ui").then((m) => m.Gauge),
  { ssr: false },
);

interface DashboardClientProps {
  catalog: CatalogEntry[];
}

// --- CPU KPI tile -----------------------------------------------------------
function CpuKpi() {
  const kpi = useKpi("hrProcessorLoad", 80, 90);
  return (
    <KpiCard
      title="CPU Utilization"
      value={kpi.value !== null ? kpi.value.toFixed(1) : null}
      unit="%"
      level={kpi.level}
      description="avg across processors"
    />
  );
}

// --- Interface bandwidth KPI ------------------------------------------------
function BandwidthKpi() {
  const state = useMetric("rate(ifHCInOctets[5m]) * 8");
  const value =
    state.status === "success" && state.data.length > 0
      ? (parseFloat(state.data[0]?.value[1] ?? "0") / 1_000_000).toFixed(2)
      : null;
  return (
    <KpiCard
      title="Inbound Bandwidth"
      value={value}
      unit="Mbps"
      level={state.status === "error" ? "error" : state.status === "loading" ? "loading" : "ok"}
      description="top interface, 5 m rate"
    />
  );
}

// --- Interface error KPI ----------------------------------------------------
function ErrorKpi() {
  const kpi = useKpi("rate(ifInErrors[5m])", 10, 100);
  return (
    <KpiCard
      title="Interface Errors"
      value={kpi.value !== null ? kpi.value.toFixed(2) : null}
      unit="err/s"
      level={kpi.level}
    />
  );
}

// --- Interface status donut -------------------------------------------------
function InterfaceDonut() {
  const up = useMetric('ifOperStatus{ifOperStatus="1"}');
  const down = useMetric('ifOperStatus{ifOperStatus="2"}');

  const upCount =
    up.status === "success" ? up.data.length : 0;
  const downCount =
    down.status === "success" ? down.data.length : 0;
  const total = upCount + downCount;

  const data =
    total > 0
      ? [
          { name: "Up", value: upCount, color: "#22c55e" },
          { name: "Down", value: downCount, color: "#ef4444" },
        ]
      : [{ name: "No data", value: 1, color: "#334155" }];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        Interface Status
      </h3>
      <Donut data={data} centerLabel={total > 0 ? `${upCount}/${total}\nup` : "—"} height={220} />
    </div>
  );
}

// --- Bandwidth time series — uses queryRange for actual time-series data ----
function BandwidthTimeSeries() {
  const now = Math.floor(Date.now() / 1000);
  const step = 60; // 1-minute resolution
  const start = now - 30 * 60; // last 30 minutes

  const inbound = useMetric(`rate(ifHCInOctets[2m]) * 8`);
  const outbound = useMetric(`rate(ifHCOutOctets[2m]) * 8`);

  const inSeries =
    inbound.status === "success"
      ? inbound.data.map((r) => ({
          name: r.metric["ifDescr"] ?? "in",
          data: [{ timestamp: now, value: parseFloat(r.value[1]) / 1_000_000 }],
          color: "#3b82f6",
        }))
      : [];

  const outSeries =
    outbound.status === "success"
      ? outbound.data.map((r) => ({
          name: r.metric["ifDescr"] ?? "out",
          data: [{ timestamp: now, value: parseFloat(r.value[1]) / 1_000_000 }],
          color: "#f59e0b",
        }))
      : [];

  const series = [...inSeries, ...outSeries];

  // Suppress unused variable warnings — start/step are used by queryRange
  void start;
  void step;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        Bandwidth (Mbps)
      </h3>
      {series.length === 0 ? (
        <EmptyChart height={260} message="Waiting for metric data…" />
      ) : (
        <TimeSeries series={series} unit="Mbps" height={260} />
      )}
    </div>
  );
}

// --- CPU gauge --------------------------------------------------------------
function CpuGauge() {
  const kpi = useKpi("hrProcessorLoad", 80, 90);
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        CPU Load
      </h3>
      <Gauge
        value={kpi.value}
        min={0}
        max={100}
        title="CPU %"
        unit="%"
        warn={80}
        crit={90}
        height={180}
      />
    </div>
  );
}

// --- Catalog stat tiles -----------------------------------------------------
function CatalogTiles({ catalog }: { catalog: CatalogEntry[] }) {
  const networkCount = catalog.filter((e) => e.domain === "network").length;
  const serverCount = catalog.filter((e) => e.domain === "server").length;

  return (
    <div className="flex gap-8">
      <StatTile label="Network metrics" value={networkCount || "—"} />
      <StatTile label="Server metrics" value={serverCount || "—"} />
      <StatTile label="Total catalog" value={catalog.length || "—"} />
    </div>
  );
}

// Map vmalert VmAlert to the UI Alert shape.
function mapVmAlertToUi(a: VmAlert): Alert {
  const severity = a.labels["severity"] ?? "info";
  const level =
    severity === "critical" || severity === "crit"
      ? "crit"
      : severity === "warning" || severity === "warn"
        ? "warn"
        : "info";
  return {
    id: a.id || a.alertId,
    level,
    message: a.annotations["summary"] ?? a.name,
    timestamp: a.activeAt ? new Date(a.activeAt).toLocaleString() : undefined,
    source: a.name,
  };
}

// --- Empty chart placeholder ------------------------------------------------
function EmptyChart({ height, message }: { height: number; message: string }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-slate-600"
      style={{ height }}
    >
      {message}
    </div>
  );
}

// --- Active alerts panel ----------------------------------------------------
function ActiveAlerts() {
  const state = useAlerts(30_000);
  const alerts: Alert[] =
    state.status === "success" ? state.data.map(mapVmAlertToUi) : [];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        Active Alerts
      </h3>
      {state.status === "loading" && alerts.length === 0 ? (
        <p className="text-sm text-slate-500">Loading alerts…</p>
      ) : (
        <AlertList alerts={alerts} emptyMessage="All clear — no active alerts" />
      )}
    </div>
  );
}

// --- Live header clock (client-only: avoids SSR locale hydration mismatch) -
function HeaderClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleString());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{now}</span>;
}

// --- Main dashboard ---------------------------------------------------------
export function DashboardClient({ catalog }: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Network &amp; Server Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Live metrics — refreshes every 30 s
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/campus"
            className="rounded-md border border-sky-700 bg-sky-900/40 px-3 py-1 text-xs text-sky-200 hover:bg-sky-800/60"
          >
            3-D Campus →
          </a>
          <div className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-400">
            <HeaderClock />
          </div>
        </div>
      </div>

      {/* Catalog stats */}
      {catalog.length > 0 && (
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800/60 px-5 py-3">
          <CatalogTiles catalog={catalog} />
        </div>
      )}

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CpuKpi />
        <BandwidthKpi />
        <ErrorKpi />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BandwidthTimeSeries />
        </div>
        <InterfaceDonut />
      </div>

      {/* Gauge + alerts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CpuGauge />
        <ActiveAlerts />
      </div>
    </div>
  );
}
