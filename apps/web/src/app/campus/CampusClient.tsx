"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  Cpu,
  Home,
  MemoryStick,
  Moon,
  Network,
  RefreshCw,
  Settings,
  Shield,
  Thermometer,
  Users,
} from "lucide-react";
import {
  AlertList,
  AppShell,
  DonutSummary,
  LastUpdated,
  NavRail,
  PageHeader,
  Panel,
  StatCard,
  TopBar,
  fmtBps,
  fmtCount,
  fmtPercent,
  fmtTemp,
} from "@jemon/ui";
import { tokens, metricAccent } from "@jemon/ui/theme";
import { AuthGate } from "../_lib/auth";
import { useCampusData, CAMPUS_THRESHOLDS } from "./useCampusData";

const IsoCampusScene = dynamic(
  () => import("@jemon/ui/scenes").then((m) => m.IsoCampusScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <span className="text-[13px] text-muted">
          3D 캠퍼스 씬을 불러오는 중…
        </span>
      </div>
    ),
  },
);

const NAV_ITEMS = [
  { id: "home", icon: <Home size={22} />, label: "홈", href: "/campus" },
  { id: "activity", icon: <Activity size={22} />, label: "실시간", href: "/dashboard" },
  { id: "charts", icon: <BarChart3 size={22} />, label: "분석", href: "/dashboard" },
  { id: "security", icon: <Shield size={22} />, label: "보안", href: "/racks" },
  { id: "settings", icon: <Settings size={22} />, label: "설정", href: "/dashboard" },
];

/** Split "4.58 Gbps" → ["4.58", "Gbps"] for StatCard value/unit slots. */
function splitUnit(formatted: string): [string, string | undefined] {
  const i = formatted.lastIndexOf(" ");
  if (i === -1) return [formatted, undefined];
  return [formatted.slice(0, i), formatted.slice(i + 1)];
}

export function CampusClient() {
  const data = useCampusData();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [trafficValue, trafficUnit] = splitUnit(
    fmtBps(data.kpis.totalTrafficBps),
  );

  return (
    <AuthGate>
      <AppShell
        nav={
          <NavRail
            items={NAV_ITEMS}
            activeId="home"
            logo={
              <span className="flex h-8 w-8 flex-col items-center justify-center gap-[3px]">
                <span className="h-[2px] w-5 rounded-full bg-accent-blue" />
                <span className="h-[2px] w-5 rounded-full bg-accent-blue opacity-70" />
                <span className="h-[2px] w-5 rounded-full bg-accent-blue opacity-40" />
              </span>
            }
          />
        }
        topBar={
          <TopBar title="Campus Monitoring System">
            <button
              type="button"
              aria-label="테마 전환"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-on-muted transition-colors hover:bg-[var(--bg-hover)]"
            >
              <Moon size={18} />
            </button>
            <button
              type="button"
              aria-label="알림"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-on-muted transition-colors hover:bg-[var(--bg-hover)]"
            >
              <Bell size={18} />
              {data.alerts.length > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-warn" />
              )}
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-subtle px-3 py-1.5 text-[13px] text-on-muted transition-colors hover:bg-[var(--bg-hover)]"
            >
              전체 캠퍼스
              <ChevronDown size={14} className="text-muted" />
            </button>
          </TopBar>
        }
      >
        <div className="flex min-h-full flex-col gap-4 p-6">
          <PageHeader
            title="캠퍼스 네트워크 현황"
            subtitle="실시간 모니터링 대시보드"
            right={
              <LastUpdated
                timestamp={data.updatedAt}
                onRefresh={data.refresh}
                refreshIcon={<RefreshCw size={15} />}
              />
            }
          />

          {/* Hero scene + side panel */}
          <div className="grid flex-1 grid-cols-[minmax(0,1fr)_300px] gap-4">
            <div className="relative min-h-[520px] overflow-hidden rounded-hero">
              <IsoCampusScene
                buildings={data.buildings}
                links={data.links}
                hoveredId={hoveredId}
                onHover={setHoveredId}
                thresholds={CAMPUS_THRESHOLDS}
                className="h-full w-full"
              />
            </div>

            <div className="flex flex-col gap-4">
              <Panel title="장비 상태 요약">
                <DonutSummary
                  segments={[
                    { label: "정상", value: data.summary.ok, color: tokens.color.statusOk },
                    { label: "주의", value: data.summary.warn, color: tokens.color.statusWarn },
                    { label: "장애", value: data.summary.crit, color: tokens.color.statusCrit },
                  ]}
                />
              </Panel>

              <Panel
                title="실시간 알림"
                action={
                  <button
                    type="button"
                    className="text-xs text-accent-blue transition-colors hover:text-on-surface"
                  >
                    더보기 ›
                  </button>
                }
                className="flex-1"
              >
                <AlertList
                  items={data.alerts}
                  emptyText="모든 시스템이 정상 운영 중입니다."
                />
              </Panel>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              icon={<Cpu size={16} />}
              label="전체 CPU 사용률"
              value={fmtPercent(data.kpis.cpuAvg)}
              accent={metricAccent.cpu}
              series={data.kpis.series.cpu}
              caption="평균 사용률"
            />
            <StatCard
              icon={<MemoryStick size={16} />}
              label="전체 메모리 사용률"
              value={fmtPercent(data.kpis.memAvg)}
              accent={tokens.color.accentPurple}
              series={data.kpis.series.mem}
              caption="평균 사용률"
            />
            <StatCard
              icon={<Network size={16} />}
              label="전체 트래픽"
              value={trafficValue}
              unit={trafficUnit}
              accent={metricAccent.traffic}
              series={data.kpis.series.traffic}
              caption="총 트래픽"
            />
            <StatCard
              icon={<Thermometer size={16} />}
              label="평균 온도"
              value={fmtTemp(data.kpis.tempAvg)}
              accent={metricAccent.temp}
              series={data.kpis.series.temp}
              caption="평균 온도"
            />
            <StatCard
              icon={<Users size={16} />}
              label="총 접속 사용자"
              value={fmtCount(data.kpis.totalUsers)}
              unit="명"
              accent={tokens.color.accentCyan}
              series={data.kpis.series.users}
              caption="현재 접속 수"
            />
          </div>
        </div>
      </AppShell>
    </AuthGate>
  );
}
