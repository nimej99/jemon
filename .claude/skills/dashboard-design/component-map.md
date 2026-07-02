# 큐레이션 컴포넌트 맵 — "무엇을 무엇으로 그리는가"

> 요구사항/이미지의 시각 요소를 아래 카탈로그의 컴포넌트로만 매핑한다.
> 여기 없는 새 패턴이 필요하면 **먼저 이 파일에 항목을 추가**하고 `packages/ui/src/`에 구현한다 (파편화 방지).
> 라이선스 허용목록 고정: ECharts(Apache-2.0) / uPlot(MIT) / three+r3f+drei+postprocessing(MIT) / MapLibre+deck.gl(BSD/MIT) / Tailwind(MIT) / lucide-react(ISC, 앱 레이어만).

## 1. 셸 — `@jemon/ui/shell`

| 컴포넌트 | 언제 | 핵심 props |
|---|---|---|
| `AppShell` | 모든 대시보드 | `nav`, `topBar`, children. NavRail 72px + 우측 column |
| `NavRail` | 항상 | `items[{id,icon,label,href?}]`, `activeId`, `logo?`, `footer?`. 활성=accent 채움 rounded-xl |
| `TopBar` | 항상 | `title`(uppercase), `onMenuClick?`, children=우측 액션 |
| `PageHeader` | 항상 | `title`, `subtitle?`, `right?` |
| `LastUpdated` | PageHeader 우측 | `timestamp?`, `onRefresh?` — 라이브 시계, fmtClock |
| `Panel` | 카드류 공통 래퍼 | `title?`, `action?`("더보기"), `blur?` |

## 2. KPI·수치 — `@jemon/ui/kpi`

| 컴포넌트 | 언제 | 핵심 props |
|---|---|---|
| `StatCard` | 하단 KPI 스트립, 전역 집계값 | `icon`, `label`, `value`(포맷 완료 문자열), `unit?`, `accent`, `series?`(스파크라인) |
| `Sparkline` | StatCard 내부, 최근 추이 | `data`, `color` — uPlot, 축·범례·그리드 제거, gradient fill |
| `MetricBar` | 오버레이 카드 지표 행 | `label`, `fillPct`, `display`, `accent`, `severity?` — 4px 바 |
| `DonutSummary` | 상태 분포 요약 | `segments[{label,value,color}]`, `totalLabel?` — 중앙 총계+우측 범례 |
| `withAlpha` | 액센트 칩 배경 | `(color, alpha)` — hex 리터럴 없이 알파 적용 |
| `echartsBase` | 모든 ECharts 옵션 | 다크 공통 베이스 — 병합 필수 |

## 3. 시계열·분석 — `@jemon/ui` (charts/, primitives/)

| 컴포넌트 | 언제 | 비고 |
|---|---|---|
| `TimeSeries` | 상세 추이(축 필요할 때) | echartsBase 병합 필수 |
| `Gauge` | 단일 값의 임계 대비 위치 | 남용 금지(화면당 ≤2) |
| `Donut` | (legacy) → 신규는 `DonutSummary` | |
| `AlertList` | 실시간 알림 | `items[{id,severity,message,ts}]`, `emptyText` — **빈 상태 문구 필수** |
| `KpiCard`/`StatTile` | (legacy) → 신규는 `StatCard` | |

## 4. 씬 (시그니처 히어로) — `@jemon/ui/scenes`, `@jemon/ui/rack`

| 컴포넌트 | 언제 | 핵심 props |
|---|---|---|
| `IsoCampusScene` | 캠퍼스/사이트/단지 조감도 (레시피 A·E·F) | `buildings: CampusBuilding[]`, `links`, `hoveredId`/`onHover`/`onSelect`, `thresholds` |
| `CampusBuilding`(타입) | 씬 데이터 계약 | `kind`(lecture/library/gym/dorm/apartment/factory/…), `code`, `metrics{cpu,mem,trafficMbps,temp}`, `users`, `cardAnchor` |
| `DeviceOverlayCard` | 씬 앵커 상세 카드 (내장) | 아이콘 칩+코드명+MetricBar×4+접속자, 리더 도트 |
| `NetworkFlowLines` | 씬 위 링크 상태 (내장) | 토폴로지 커브 + dash 흐름 + 파티클. 링크 다운=crit |
| `RackElevation` | 서버실 랙 실장도 (레시피 B) | U단위 슬롯, 상태 emissive |
| `GeoMap` | 다중 사이트 지리 분포 (레시피 C) | **미구현** — 필요 시 MapLibre 다크+deck.gl로 신규 추가 후 이 표 갱신 |
| `TopologyGraph` | 논리 토폴로지 | **미구현** — ECharts graph로 신규 추가 후 갱신 |

### 씬 공통 규칙
- `frameloop="demand"` + AnimationTicker invalidate. draw call ≤300. 나무/가로등/창문/패널은 `InstancedMesh`.
- 노드 30개 초과 또는 WebGL 불가 → 2D 폴백(SVG 아이소메트릭) 자동 전환.
- 씬은 정보의 좌표계다: 모든 발광 요소는 데이터에 바인딩 (장식 이펙트 금지).

## 5. 데이터 연동 규약

- 컴포넌트는 **값을 직접 fetch하지 않는다**. props 또는 전용 훅 경유.
- 실데이터: `@jemon/metric-sdk` — `useMetric(promql, interval)`, `useKpi(promql, warn, crit)`, `useAlerts()`.
- 시연/스크린샷: `randomWalk(key, n, {min,max})` / `walker(key, opts)` — 시드 고정, 같은 key = 같은 시리즈. 페이지 훅(`use<Name>Data.ts`)이 real과 동일한 props 형태로 변환.
- 포맷터: `fmtPercent` `fmtBps`(+`fromMbps`) `fmtTemp` `fmtCount` `fmtClock` (@jemon/ui/lib). 손 포맷팅 금지.
- 임계: 카탈로그 threshold → `severityOf(value, thresholds)` → 시맨틱 토큰. 컴포넌트 안 하드코딩 금지.
