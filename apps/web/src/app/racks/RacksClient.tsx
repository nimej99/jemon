"use client";

import { RackElevation } from "@jemon/ui/rack";
import type { RackUnit } from "@jemon/ui/rack";
import { AuthGate } from "../_lib/auth";
import { UserNav } from "../_components/UserNav";

const rackA: RackUnit[] = [
  { id: "a-patch",   name: "Patch Panel",   startU: 42, sizeU: 1, status: "ok"   },
  { id: "a-core-sw", name: "Core Switch",   startU: 40, sizeU: 2, status: "ok"   },
  { id: "a-agg-sw",  name: "Agg Switch",    startU: 38, sizeU: 1, status: "warn"  },
  { id: "a-srv-01",  name: "server-01",     startU: 20, sizeU: 2, status: "ok"   },
  { id: "a-srv-02",  name: "server-02",     startU: 18, sizeU: 2, status: "crit"  },
  { id: "a-pdu",     name: "PDU",           startU:  1, sizeU: 1, status: "ok"   },
];

const rackB: RackUnit[] = [
  { id: "b-patch",    name: "Patch Panel",    startU: 42, sizeU: 1, status: "ok"  },
  { id: "b-dist-sw",  name: "Dist Switch B",  startU: 40, sizeU: 2, status: "warn" },
  { id: "b-fw",       name: "Firewall",        startU: 36, sizeU: 1, status: "ok"  },
  { id: "b-storage",  name: "Storage Array",  startU: 32, sizeU: 2, status: "ok"  },
  { id: "b-web-01",   name: "web-srv-01",     startU: 20, sizeU: 2, status: "ok"  },
  { id: "b-web-02",   name: "web-srv-02",     startU: 18, sizeU: 2, status: "warn" },
  { id: "b-db",       name: "db-primary",     startU: 16, sizeU: 2, status: "crit" },
  { id: "b-pdu",      name: "PDU",            startU:  1, sizeU: 1, status: "ok"  },
];

const rackC: RackUnit[] = [
  { id: "c-mgmt-sw",  name: "Mgmt Switch",   startU: 42, sizeU: 1, status: "ok"  },
  { id: "c-kvm",      name: "KVM Switch",    startU: 40, sizeU: 1, status: "ok"  },
  { id: "c-backup",   name: "Backup Server", startU: 38, sizeU: 2, status: "warn" },
  { id: "c-app-01",   name: "app-srv-01",    startU: 20, sizeU: 2, status: "ok"  },
  { id: "c-monitor",  name: "Monitoring",    startU: 18, sizeU: 1, status: "ok"  },
  { id: "c-ups",      name: "UPS",           startU:  1, sizeU: 2, status: "ok"  },
];

const STATUS_LEGEND = [
  { color: "#22c55e", label: "정상 (ok)" },
  { color: "#f59e0b", label: "경고 (warn)" },
  { color: "#ef4444", label: "장애 (crit)" },
] as const;

const RACKS = [
  { label: "Rack A", sub: "DC-1", units: rackA },
  { label: "Rack B", sub: "DC-2", units: rackB },
  { label: "Rack C", sub: "DC-3", units: rackC },
] as const;

export function RacksClient() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-900 p-6">
        {/* Unified nav bar */}
        <UserNav activePage="racks" />

        {/* ── Page header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Rack Elevation — 실장도
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              데이터센터 랙 실장 현황
            </p>
          </div>
          {/* Status legend */}
          <div className="flex items-center gap-4">
            {STATUS_LEGEND.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Rack grid ── */}
        <div className="overflow-hidden rounded-lg border border-slate-700/80 bg-slate-800/70 shadow-sm">
          <div className="border-b border-slate-700/60 px-4 py-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Live Rack View
            </h3>
          </div>
          <div className="flex flex-wrap gap-8 p-6">
            {RACKS.map(({ label, sub, units }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="text-center">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {label}
                  </span>
                  <span className="text-[10px] text-slate-500">{sub}</span>
                </div>
                <RackElevation label={`${label} (${sub})`} units={units} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
