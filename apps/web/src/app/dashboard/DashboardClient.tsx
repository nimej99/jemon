"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useKpi, useMetric, useAlerts } from "@jemon/metric-sdk";
import { KpiCard, StatTile, AlertList } from "@jemon/ui";
import type { Alert } from "@jemon/ui";
import type { CatalogEntry, VmAlert } from "@jemon/metric-sdk";
import { AuthGate } from "../_lib/auth";
import { UserNav } from "../_components/UserNav";

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

// ── Design-system helpers ────────────────────────────────────────────────────
function utilColor(v: number): string {
  if (v < 50) return "#22c55e";
  if (v < 80) return "#f59e0b";
  return "#ef4444";
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-widest text-sky-400">
        {label}
      </h2>
      <div className="h-px flex-1 bg-slate-700/60" />
    </div>
  );
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────
function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-700/80 bg-slate-800/70 shadow-sm ${className}`}
    >
      <div className="border-b border-slate-700/60 px-4 py-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Empty chart placeholder ───────────────────────────────────────────────────
function EmptyChart({ height, message }: { height: number; message: string }) {
  return (
    <div
      className="flex items-center justify-center text-xs text-slate-600"
      style={{ height }}
    >
      {message}
    </div>
  );
}

// ── CPU KPI ───────────────────────────────────────────────────────────────────
// Primary:  100 - avg(ssCpuIdle)
// Fallback: avg(hrProcessorLoad)
function CpuKpi() {
  const primary = useMetric("100 - avg(ssCpuIdle)");
  const fallback = useMetric("avg(hrProcessorLoad)");

  const pv =
    primary.status === "success" && primary.data.length > 0
      ? parseFloat(primary.data[0]?.value[1] ?? "NaN")
      : NaN;

  const fv =
    fallback.status === "success" && fallback.data.length > 0
      ? parseFloat(fallback.data[0]?.value[1] ?? "NaN")
      : NaN;

  const value = !isNaN(pv) ? pv : !isNaN(fv) ? fv : null;

  const level =
    primary.status === "loading" || fallback.status === "loading"
      ? ("loading" as const)
      : value === null
        ? ("idle" as const)
        : value >= 90
          ? ("crit" as const)
          : value >= 80
            ? ("warn" as const)
            : ("ok" as const);

  return (
    <KpiCard
      title="CPU Utilization"
      value={value !== null ? value.toFixed(1) : null}
      unit="%"
      level={level}
      description="avg(100 − ssCpuIdle) · fallback: avg(hrProcessorLoad)"
    />
  );
}

// ── Memory KPI ────────────────────────────────────────────────────────────────
// Primary:  100 * (1 - memAvailReal / memTotalReal)
// Fallback: 100 * avg(hrStorageUsed / hrStorageSize)
function MemoryKpi() {
  const primary = useMetric("100 * (1 - memAvailReal / memTotalReal)");
  const fallback = useMetric("100 * avg(hrStorageUsed / hrStorageSize)");

  const pv =
    primary.status === "success" && primary.data.length > 0
      ? parseFloat(primary.data[0]?.value[1] ?? "NaN")
      : NaN;

  const fv =
    fallback.status === "success" && fallback.data.length > 0
      ? parseFloat(fallback.data[0]?.value[1] ?? "NaN")
      : NaN;

  const value = !isNaN(pv) ? pv : !isNaN(fv) ? fv : null;

  const level =
    primary.status === "loading" || fallback.status === "loading"
      ? ("loading" as const)
      : value === null
        ? ("idle" as const)
        : value >= 90
          ? ("crit" as const)
          : value >= 80
            ? ("warn" as const)
            : ("ok" as const);

  return (
    <KpiCard
      title="Memory Usage"
      value={value !== null ? value.toFixed(1) : null}
      unit="%"
      level={level}
      description="100 × (1 − memAvailReal / memTotalReal)"
    />
  );
}

// ── Bandwidth KPI ─────────────────────────────────────────────────────────────
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
      level={
        state.status === "error"
          ? "error"
          : state.status === "loading"
            ? "loading"
            : "ok"
      }
      description="top interface · 5 m rate"
    />
  );
}

// ── Interface error KPI ───────────────────────────────────────────────────────
function ErrorKpi() {
  const kpi = useKpi("rate(ifInErrors[5m])", 10, 100);
  return (
    <KpiCard
      title="Interface Errors"
      value={kpi.value !== null ? kpi.value.toFixed(2) : null}
      unit="err/s"
      level={kpi.level}
      description="5 m error rate · all interfaces"
    />
  );
}

// ── Interface status donut ────────────────────────────────────────────────────
function InterfaceDonut() {
  const up = useMetric('ifOperStatus{ifOperStatus="1"}');
  const down = useMetric('ifOperStatus{ifOperStatus="2"}');

  const upCount = up.status === "success" ? up.data.length : 0;
  const downCount = down.status === "success" ? down.data.length : 0;
  const total = upCount + downCount;

  const data =
    total > 0
      ? [
          { name: "Up", value: upCount, color: "#22c55e" },
          { name: "Down", value: downCount, color: "#ef4444" },
        ]
      : [{ name: "No data", value: 1, color: "#334155" }];

  return (
    <Panel title="Interface Status">
      <Donut
        data={data}
        centerLabel={total > 0 ? `${upCount}/${total}\nup` : "—"}
        height={200}
      />
    </Panel>
  );
}

// ── Bandwidth time series ─────────────────────────────────────────────────────
function BandwidthTimeSeries() {
  const now = Math.floor(Date.now() / 1000);

  const inbound = useMetric("rate(ifHCInOctets[2m]) * 8");
  const outbound = useMetric("rate(ifHCOutOctets[2m]) * 8");

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

  return (
    <Panel title="Bandwidth (Mbps)">
      {series.length === 0 ? (
        <EmptyChart height={240} message="Waiting for interface data…" />
      ) : (
        <TimeSeries series={series} unit="Mbps" height={240} />
      )}
    </Panel>
  );
}

// ── CPU gauge ─────────────────────────────────────────────────────────────────
function CpuGauge() {
  const primary = useMetric("100 - avg(ssCpuIdle)");
  const fallback = useMetric("avg(hrProcessorLoad)");

  const pv =
    primary.status === "success" && primary.data.length > 0
      ? parseFloat(primary.data[0]?.value[1] ?? "NaN")
      : NaN;

  const fv =
    fallback.status === "success" && fallback.data.length > 0
      ? parseFloat(fallback.data[0]?.value[1] ?? "NaN")
      : NaN;

  const value = !isNaN(pv) ? pv : !isNaN(fv) ? fv : null;

  return (
    <Panel title="CPU Load">
      <Gauge
        value={value}
        min={0}
        max={100}
        title="CPU %"
        unit="%"
        warn={80}
        crit={90}
        height={180}
      />
    </Panel>
  );
}

// ── Memory gauge ──────────────────────────────────────────────────────────────
function MemoryGauge() {
  const primary = useMetric("100 * (1 - memAvailReal / memTotalReal)");
  const fallback = useMetric("100 * avg(hrStorageUsed / hrStorageSize)");

  const pv =
    primary.status === "success" && primary.data.length > 0
      ? parseFloat(primary.data[0]?.value[1] ?? "NaN")
      : NaN;

  const fv =
    fallback.status === "success" && fallback.data.length > 0
      ? parseFloat(fallback.data[0]?.value[1] ?? "NaN")
      : NaN;

  const value = !isNaN(pv) ? pv : !isNaN(fv) ? fv : null;

  return (
    <Panel title="Memory Load">
      <Gauge
        value={value}
        min={0}
        max={100}
        title="MEM %"
        unit="%"
        warn={80}
        crit={90}
        height={180}
      />
    </Panel>
  );
}

// ── Top devices by CPU ────────────────────────────────────────────────────────
// PromQL: topk(5, hrProcessorLoad)
function TopCpuDevices() {
  const state = useMetric("topk(5, hrProcessorLoad)");

  return (
    <Panel title="Top Devices by CPU">
      {state.status === "loading" && (
        <div className="py-6 text-center text-xs text-slate-500">Loading…</div>
      )}
      {state.status === "success" && state.data.length === 0 && (
        <EmptyChart height={120} message="No CPU data available" />
      )}
      {state.status === "success" && state.data.length > 0 && (
        <div className="space-y-2.5">
          {state.data.map((row, i) => {
            const pct = parseFloat(row.value[1]);
            const label =
              row.metric["instance"] ??
              row.metric["hrDeviceIndex"] ??
              `cpu-${i}`;
            const bar = Math.max(0, Math.min(100, isNaN(pct) ? 0 : pct));
            return (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-28 truncate text-[11px] text-slate-400"
                  title={label}
                >
                  {label}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${bar}%`,
                      backgroundColor: utilColor(bar),
                    }}
                  />
                </div>
                <span
                  className="w-9 text-right text-[11px] tabular-nums"
                  style={{ color: utilColor(bar) }}
                >
                  {isNaN(pct) ? "—" : `${pct.toFixed(0)}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {state.status === "error" && (
        <EmptyChart height={120} message="No host CPU series in range" />
      )}
    </Panel>
  );
}

// ── Catalog stat tiles ────────────────────────────────────────────────────────
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

// ── Alert mapper ──────────────────────────────────────────────────────────────
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

// ── Active alerts panel ───────────────────────────────────────────────────────
function ActiveAlerts() {
  const state = useAlerts(30_000);
  const alerts: Alert[] =
    state.status === "success" ? state.data.map(mapVmAlertToUi) : [];

  return (
    <Panel title="Active Alerts">
      {state.status === "loading" && alerts.length === 0 ? (
        <p className="text-sm text-slate-500">Loading alerts…</p>
      ) : (
        <AlertList alerts={alerts} emptyMessage="All clear — no active alerts" />
      )}
    </Panel>
  );
}

// ── Live header clock ─────────────────────────────────────────────────────────
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

// ── Main dashboard ────────────────────────────────────────────────────────────
export function DashboardClient({ catalog }: DashboardClientProps) {
  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-900 p-6">
        {/* Unified nav bar */}
        <UserNav activePage="dashboard" />

        {/* ── Page header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Network &amp; Server Dashboard
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Live metrics · refreshes every 30 s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/campus"
              className="rounded-md border border-sky-700 bg-sky-900/40 px-3 py-1 text-xs text-sky-200 transition-colors hover:bg-sky-800/60"
            >
              3-D Campus →
            </a>
            <div className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs tabular-nums text-slate-400">
              <HeaderClock />
            </div>
          </div>
        </div>

        {/* ── Catalog strip ── */}
        {catalog.length > 0 && (
          <div className="mb-6 rounded-lg border border-slate-700/60 bg-slate-800/40 px-5 py-3">
            <CatalogTiles catalog={catalog} />
          </div>
        )}

        {/* ══ NETWORK SECTION ══════════════════════════════════════════════════ */}
        <section className="mb-8">
          <SectionHeader label="Network" />

          {/* Network KPI row */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BandwidthKpi />
            <ErrorKpi />
          </div>

          {/* Network charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BandwidthTimeSeries />
            </div>
            <InterfaceDonut />
          </div>
        </section>

        {/* ══ SERVER / HOST SECTION ════════════════════════════════════════════ */}
        <section className="mb-8">
          <SectionHeader label="Server / Host" />

          {/* Server KPI row */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CpuKpi />
            <MemoryKpi />
          </div>

          {/* Server charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <CpuGauge />
            <MemoryGauge />
            <TopCpuDevices />
          </div>
        </section>

        {/* ══ ALERTS ═══════════════════════════════════════════════════════════ */}
        <section>
          <SectionHeader label="Alerts" />
          <ActiveAlerts />
        </section>
      </div>
    </AuthGate>
  );
}
