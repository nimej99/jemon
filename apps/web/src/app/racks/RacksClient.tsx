"use client";

import { RackElevation } from "@jemon/ui/rack";
import type { RackUnit } from "@jemon/ui/rack";

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

export function RacksClient() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Rack Elevation — 실장도
          </h1>
          <p className="text-sm text-slate-500">
            데이터센터 랙 실장 현황 · 상태 색상: 녹=정상 · 황=경고 · 적=장애
          </p>
        </div>
        <a
          href="/dashboard"
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >
          ← Dashboard
        </a>
      </div>

      {/* ── Legend ── */}
      <div className="mb-6 flex flex-wrap gap-4">
        {(
          [
            { color: "#16a34a", label: "정상 (ok)" },
            { color: "#f59e0b", label: "경고 (warn)" },
            { color: "#ef4444", label: "장애 (crit)" },
          ] as const
        ).map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span
              style={{ backgroundColor: color }}
              className="inline-block h-3 w-3 rounded-sm"
            />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Rack grid ── */}
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rack A · DC-1
          </span>
          <RackElevation label="Rack A (DC-1)" units={rackA} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rack B · DC-2
          </span>
          <RackElevation label="Rack B (DC-2)" units={rackB} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rack C · DC-3
          </span>
          <RackElevation label="Rack C (DC-3)" units={rackC} />
        </div>
      </div>
    </div>
  );
}
