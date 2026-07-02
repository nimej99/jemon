"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { walker, randomWalk } from "@jemon/metric-sdk";
import { severityOf, type Thresholds } from "@jemon/ui/lib";
import type {
  CampusBuilding,
  TopologyLink,
  SceneSeverity,
} from "@jemon/ui/scenes";

/**
 * Campus demo data — seeded random walks shaped exactly like the future
 * metric-sdk campus queries. Components never know mock vs real.
 * Swap point: replace tick() with useMetric(promql) aggregation.
 */

export const CAMPUS_THRESHOLDS: {
  cpu: Thresholds;
  mem: Thresholds;
  temp: Thresholds;
  traffic: Thresholds;
} = {
  cpu: { warn: 70, crit: 85 },
  mem: { warn: 70, crit: 85 },
  temp: { warn: 38, crit: 45 },
  traffic: { warn: 70, crit: 85 },
};

interface BuildingSeed {
  id: string;
  code: string;
  label: string;
  kind: CampusBuilding["kind"];
  position: [number, number];
  floors: number;
  footprint: [number, number];
  cardAnchor: "left" | "right" | "top" | "bottom";
  cpu: [number, number];
  mem: [number, number];
  traffic: [number, number];
  temp: [number, number];
  users: [number, number];
}

const SEEDS: BuildingSeed[] = [
  { id: "b1", code: "NOVA-01", label: "강의동 A", kind: "lecture", position: [-9, -5], floors: 4, footprint: [4.2, 2.6], cardAnchor: "left", cpu: [15, 35], mem: [30, 55], traffic: [420, 700], temp: [34, 40], users: [90, 180] },
  { id: "b2", code: "ORION-02", label: "연구동 B", kind: "lab", position: [-2.5, -7.5], floors: 5, footprint: [3.6, 2.8], cardAnchor: "top", cpu: [22, 42], mem: [40, 62], traffic: [560, 860], temp: [35, 41], users: [110, 210] },
  { id: "b3", code: "PULSAR-03", label: "도서관 C", kind: "library", position: [4.5, -6.5], floors: 3, footprint: [4.8, 3.2], cardAnchor: "top", cpu: [10, 28], mem: [28, 48], traffic: [240, 420], temp: [36, 42], users: [60, 140] },
  { id: "b4", code: "VEGA-04", label: "체육관 D", kind: "gym", position: [10.5, -3], floors: 2, footprint: [4.6, 3.4], cardAnchor: "right", cpu: [18, 36], mem: [36, 58], traffic: [440, 720], temp: [35, 41], users: [140, 260] },
  { id: "b5", code: "SOLARIS-05", label: "기숙사 E", kind: "dorm", position: [11, 6], floors: 7, footprint: [2.8, 2.2], cardAnchor: "right", cpu: [12, 30], mem: [34, 54], traffic: [330, 560], temp: [33, 38], users: [220, 360] },
  { id: "b6", code: "AXIOM-06", label: "행정동 F", kind: "admin", position: [-11.5, 2.5], floors: 3, footprint: [3.4, 2.4], cardAnchor: "left", cpu: [16, 34], mem: [36, 56], traffic: [380, 640], temp: [34, 39], users: [90, 170] },
  { id: "b7", code: "ZENITH-07", label: "IT센터 G", kind: "itcenter", position: [-4, 6.5], floors: 4, footprint: [3.2, 2.6], cardAnchor: "bottom", cpu: [26, 48], mem: [46, 68], traffic: [620, 940], temp: [37, 43], users: [120, 220] },
  { id: "b8", code: "LUMEN-08", label: "학생회관 H", kind: "hall", position: [4, 6], floors: 3, footprint: [3.8, 2.8], cardAnchor: "bottom", cpu: [14, 32], mem: [32, 52], traffic: [360, 620], temp: [34, 40], users: [80, 160] },
];

/** Star topology: IT center (core) → every building. */
export const CAMPUS_LINKS: TopologyLink[] = SEEDS.filter(
  (s) => s.id !== "b7",
).map((s) => ({ from: "b7", to: s.id, status: "up" as const }));

const KPI_HISTORY = 30;
const TICK_MS = 4000;

export interface CampusAlert {
  id: string;
  severity: "ok" | "warn" | "crit" | "info";
  message: string;
  ts: number;
}

export interface CampusKpis {
  cpuAvg: number;
  memAvg: number;
  totalTrafficBps: number;
  tempAvg: number;
  totalUsers: number;
  series: {
    cpu: number[];
    mem: number[];
    traffic: number[];
    temp: number[];
    users: number[];
  };
}

export interface CampusData {
  buildings: CampusBuilding[];
  links: TopologyLink[];
  alerts: CampusAlert[];
  kpis: CampusKpis;
  summary: { ok: number; warn: number; crit: number; total: number };
  updatedAt: number;
  refresh: () => void;
}

function overallSeverity(
  b: { cpu: number; mem: number; temp: number },
): SceneSeverity {
  const levels = [
    severityOf(b.cpu, CAMPUS_THRESHOLDS.cpu),
    severityOf(b.mem, CAMPUS_THRESHOLDS.mem),
    severityOf(b.temp, CAMPUS_THRESHOLDS.temp),
  ];
  if (levels.includes("crit")) return "crit";
  if (levels.includes("warn")) return "warn";
  return "ok";
}

export function useCampusData(): CampusData {
  // Stable per-building walkers (seeded → deterministic across reloads).
  const walkers = useRef(
    SEEDS.map((s) => ({
      seed: s,
      cpu: walker(`${s.code}:cpu`, { min: s.cpu[0], max: s.cpu[1] }),
      mem: walker(`${s.code}:mem`, { min: s.mem[0], max: s.mem[1] }),
      traffic: walker(`${s.code}:traffic`, {
        min: s.traffic[0],
        max: s.traffic[1],
      }),
      temp: walker(`${s.code}:temp`, {
        min: s.temp[0],
        max: s.temp[1],
        volatility: 0.08,
      }),
      users: walker(`${s.code}:users`, { min: s.users[0], max: s.users[1] }),
    })),
  );

  const tick = useMemo(
    () => () => {
      const buildings: CampusBuilding[] = walkers.current.map((w) => {
        const metrics = {
          cpu: Math.round(w.cpu()),
          mem: Math.round(w.mem()),
          trafficMbps: Math.round(w.traffic()),
          temp: Math.round(w.temp() * 10) / 10,
        };
        return {
          id: w.seed.id,
          code: w.seed.code,
          label: w.seed.label,
          kind: w.seed.kind,
          position: w.seed.position,
          floors: w.seed.floors,
          footprint: w.seed.footprint,
          cardAnchor: w.seed.cardAnchor,
          metrics,
          users: Math.round(w.users()),
          severity: overallSeverity(metrics),
        };
      });
      return buildings;
    },
    [],
  );

  const [buildings, setBuildings] = useState<CampusBuilding[]>(tick);
  const [updatedAt, setUpdatedAt] = useState<number>(() => Date.now());
  const [history, setHistory] = useState(() => ({
    cpu: randomWalk("kpi:cpu", KPI_HISTORY, { min: 18, max: 34 }),
    mem: randomWalk("kpi:mem", KPI_HISTORY, { min: 38, max: 54 }),
    traffic: randomWalk("kpi:traffic", KPI_HISTORY, { min: 3.6, max: 5.4 }),
    temp: randomWalk("kpi:temp", KPI_HISTORY, { min: 34, max: 40 }),
    users: randomWalk("kpi:users", KPI_HISTORY, { min: 1000, max: 1600 }),
  }));

  useEffect(() => {
    const id = setInterval(() => {
      const next = tick();
      setBuildings(next);
      setUpdatedAt(Date.now());
      const cpuAvg = next.reduce((a, b) => a + b.metrics.cpu, 0) / next.length;
      const memAvg = next.reduce((a, b) => a + b.metrics.mem, 0) / next.length;
      const traffic =
        next.reduce((a, b) => a + b.metrics.trafficMbps, 0) / 1000;
      const tempAvg =
        next.reduce((a, b) => a + b.metrics.temp, 0) / next.length;
      const users = next.reduce((a, b) => a + b.users, 0);
      setHistory((h) => ({
        cpu: [...h.cpu.slice(1), cpuAvg],
        mem: [...h.mem.slice(1), memAvg],
        traffic: [...h.traffic.slice(1), traffic],
        temp: [...h.temp.slice(1), tempAvg],
        users: [...h.users.slice(1), users],
      }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  const alerts: CampusAlert[] = useMemo(
    () =>
      buildings
        .filter((b) => b.severity !== "ok")
        .map((b) => {
          const tempSev = severityOf(b.metrics.temp, CAMPUS_THRESHOLDS.temp);
          const what =
            tempSev !== "ok"
              ? "온도"
              : severityOf(b.metrics.cpu, CAMPUS_THRESHOLDS.cpu) !== "ok"
                ? "CPU"
                : "메모리";
          return {
            id: `${b.id}-${what}`,
            severity: (b.severity ?? "warn") as CampusAlert["severity"],
            message: `${b.code} ${what} ${b.severity === "crit" ? "장애" : "주의"}`,
            ts: updatedAt,
          };
        })
        .slice(0, 5),
    [buildings, updatedAt],
  );

  const kpis: CampusKpis = useMemo(() => {
    const cpuAvg =
      buildings.reduce((a, b) => a + b.metrics.cpu, 0) / buildings.length;
    const memAvg =
      buildings.reduce((a, b) => a + b.metrics.mem, 0) / buildings.length;
    const totalMbps = buildings.reduce((a, b) => a + b.metrics.trafficMbps, 0);
    const tempAvg =
      buildings.reduce((a, b) => a + b.metrics.temp, 0) / buildings.length;
    const totalUsers = buildings.reduce((a, b) => a + b.users, 0);
    return {
      cpuAvg,
      memAvg,
      totalTrafficBps: totalMbps * 1e6,
      tempAvg,
      totalUsers,
      series: history,
    };
  }, [buildings, history]);

  const summary = useMemo(() => {
    const warn = buildings.filter((b) => b.severity === "warn").length;
    const crit = buildings.filter((b) => b.severity === "crit").length;
    return {
      ok: buildings.length - warn - crit,
      warn,
      crit,
      total: buildings.length,
    };
  }, [buildings]);

  return {
    buildings,
    links: CAMPUS_LINKS,
    alerts,
    kpis,
    summary,
    updatedAt,
    refresh: () => {
      setBuildings(tick());
      setUpdatedAt(Date.now());
    },
  };
}
