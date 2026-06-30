"use client";

import dynamic from "next/dynamic";
import type { BuildingData } from "@jemon/ui/scenes";
import { AuthGate } from "../_lib/auth";
import { UserNav } from "../_components/UserNav";

const CampusScene = dynamic(
  () => import("@jemon/ui/scenes").then((m) => m.CampusScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[640px] items-center justify-center text-xs text-slate-500">
        Loading 3-D campus…
      </div>
    ),
  },
);

// Static building fixtures — replace with live metric fetches when SNMP campus
// data is available.
const buildings: BuildingData[] = [
  {
    id: "eng",
    label: "공대 1호관",
    position: [-6, -4],
    size: [4, 6, 4],
    metrics: { cpu: 62, mem: 48, traffic: 71, temp: 24 },
  },
  {
    id: "sci",
    label: "자연대",
    position: [6, -4],
    size: [4, 4, 4],
    metrics: { cpu: 35, mem: 55, traffic: 40, temp: 22 },
  },
  {
    id: "lib",
    label: "중앙도서관",
    position: [0, 6],
    size: [5, 8, 5],
    metrics: { cpu: 78, mem: 82, traffic: 90, temp: 27 },
  },
  {
    id: "dorm",
    label: "기숙사",
    position: [-8, 6],
    size: [3, 5, 3],
    metrics: { cpu: 20, mem: 30, traffic: 15, temp: 21 },
  },
];

export function CampusClient() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-900 p-6">
        {/* Unified nav bar */}
        <UserNav activePage="campus" />

        {/* ── Page header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Campus Topology — 3-D
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              건물별 CPU · 메모리 · 트래픽 · 온도 현황
            </p>
          </div>
          {/* Legend chips */}
          <div className="flex items-center gap-3">
            {(
              [
                { color: "#22c55e", label: "OK" },
                { color: "#f59e0b", label: "Warn" },
                { color: "#ef4444", label: "Crit" },
              ] as const
            ).map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3-D scene panel ── */}
        <div className="overflow-hidden rounded-lg border border-slate-700/80 bg-slate-800/60 shadow-sm">
          <div className="border-b border-slate-700/60 px-4 py-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Live Campus View
            </h3>
          </div>
          <div className="p-4">
            <CampusScene buildings={buildings} width={1000} height={620} />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
