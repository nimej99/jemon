"use client";

import dynamic from "next/dynamic";
import type { BuildingData } from "@jemon/ui/scenes";

const CampusScene = dynamic(
  () => import("@jemon/ui/scenes").then((m) => m.CampusScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[640px] items-center justify-center text-slate-500">
        Loading 3-D campus…
      </div>
    ),
  },
);

const buildings: BuildingData[] = [
  { id: "eng", label: "공대 1호관", position: [-6, -4], size: [4, 6, 4], metrics: { cpu: 62, mem: 48, traffic: 71, temp: 24 } },
  { id: "sci", label: "자연대", position: [6, -4], size: [4, 4, 4], metrics: { cpu: 35, mem: 55, traffic: 40, temp: 22 } },
  { id: "lib", label: "중앙도서관", position: [0, 6], size: [5, 8, 5], metrics: { cpu: 78, mem: 82, traffic: 90, temp: 27 } },
  { id: "dorm", label: "기숙사", position: [-8, 6], size: [3, 5, 3], metrics: { cpu: 20, mem: 30, traffic: 15, temp: 21 } },
];

export function CampusClient() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Campus Topology — 3-D</h1>
          <p className="text-sm text-slate-500">건물별 CPU / 메모리 / 트래픽 / 온도 현황</p>
        </div>
        <a href="/dashboard" className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700">← Dashboard</a>
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
        <CampusScene buildings={buildings} width={1000} height={640} />
      </div>
    </div>
  );
}
