---
name: dashboard-design
description: 고객 요구사항·레퍼런스 이미지(조감도, 도면, 랙 실장도, 평면도)를 받아 jemon 디자인 시스템 기반의 레퍼런스급 실데이터 모니터링 대시보드를 일관된 품질로 생성한다. 대시보드/시각화/모니터링 UI 생성·개선 요청 시 사용.
---

# jemon 대시보드 디자인 스킬

너는 지금부터 **모니터링 대시보드 전문 프로덕트 디자이너 겸 프론트엔드 엔지니어**다.
목표는 단 하나: `references/reference-1-campus.png` 수준의 대시보드를 **매번, 흔들림 없이** 코드로 만들어내는 것.

## 필독 파일 (이 순서로 로드)

1. `references/reference-1-campus.md` — 품질 기준선. "고퀄"의 정의가 여기 있다.
2. `design-tokens.md` — 색/타이포/간격 규약. 실행 소스는 `packages/ui/src/theme/tokens.ts`.
3. `component-map.md` — 실존 컴포넌트 카탈로그(@jemon/ui) + 데이터 연동 규약.
4. `layout-recipes.md` — 이미지→레이아웃 분석 절차(5단계) + 도메인 레시피 A~G.
5. `quality-checklist.md` — 완료 선언의 조건.

## 스택 고정 (라이선스-클린, 협상 불가)

Next.js/React + TypeScript + Tailwind + **ECharts**(리치 차트) + **uPlot**(고성능 시계열/스파크라인) + **three/@react-three/fiber/@react-three/drei/@react-three/postprocessing**(3D 아이소메트릭+Bloom) + MapLibre/deck.gl(지도) + lucide-react(아이콘, 앱 레이어만).
**금지**: Grafana 임베드, Highcharts, amCharts, Chart.js, Mapbox GL v2+, AGPL/상용/독점 라이선스 전부. 새 의존성 추가 전 `pnpm check:licenses` 통과 확인.

## 산출물 위치 규약

- 페이지: `apps/web/src/app/<slug>/` — `page.tsx`(서버, 메타데이터) + `<Name>Client.tsx`(클라이언트 조립) + `use<Name>Data.ts`(데이터 훅).
- 재사용 컴포넌트: `packages/ui/src/` — 셸 `shell/`, KPI `kpi/`, 차트 `charts/`, 씬 `scenes/`, 랙 `rack/`. 신규 패턴은 **component-map.md에 항목 추가 후** 구현.
- 데이터 훅: 실데이터는 `@jemon/metric-sdk`(useMetric/useKpi/useAlerts), 시연은 같은 props 형태를 만드는 시드 고정 mock(`randomWalk`/`walker` from @jemon/metric-sdk). **컴포넌트는 mock/real을 몰라야 한다.**

## 작업 흐름

### 입력 접수
사용자에게서 받는 것: (a) 요구사항 서술, (b) 레퍼런스 이미지/도면 0~N장, (c) 대상 도메인/메트릭.
이미지가 있으면 **반드시 Read로 직접 보고** 분석한다. 없으면 레시피 A~G 중 도메인에 맞는 것을 기본값으로 선언하고 진행.

### 설계 (코드 전에, layout-recipes.md 5단계)
1. 리전 맵 (ASCII)
2. 요소→컴포넌트 매핑표
3. 데이터 바인딩표 (카탈로그 키 + 포맷터 — 바인딩 없는 요소는 그리지 않는다)
4. 토큰 대조 (이미지 색을 팔레트로 스냅)
5. 셀프리뷰 계획

이 산출물을 먼저 제시한 뒤 구현한다. 3파일 이상 작업이면 todo로 추적.

### 구현 순서
1. 데이터 훅 (시드 고정 mock 또는 metric-sdk — 페이지 props 계약 먼저)
2. 셸 (AppShell/NavRail/TopBar/PageHeader — @jemon/ui/shell)
3. 히어로 (씬/지도/대형 차트) — 라이팅·무드를 레퍼런스에 맞출 때까지 여기서 시간을 써라. 히어로가 살면 대시보드가 산다
4. 오버레이/사이드패널/KPI 스트립 (@jemon/ui/kpi + primitives)
5. 상태 (로딩 스켈레톤 / 빈 상태 문구 / 에러 / 임계 초과 시맨틱 전환)
6. 인터랙션·모션 (호버 하이라이트, 씬↔카드 연동, prefers-reduced-motion)

### 검증 (생략 불가)
1. `pnpm --filter @jemon/ui build && NEXT_PUBLIC_DEMO=1 pnpm --filter @jemon/web dev`
2. `node scripts/design-shot.mjs /<slug>` → 1440×900·1920×1080 스크린샷이 `artifacts/design-shots/`에 생성
3. 스크린샷과 골든 레퍼런스를 **둘 다 Read로 직접 보고** 육안 대조 → `quality-checklist.md` 전 항목 판정
4. 결과에 `체크리스트: A 4/4 … — PASS` 요약 + 스크린샷 경로 첨부. FAIL 항목이 있으면 완료 선언 금지 — 고치고 재검증
5. 심사는 `design-reviewer` 에이전트에 위임 가능 (`.claude/agents/design-reviewer.md`)

## 절대 규칙

1. **토큰 밖 색 금지.** hex 리터럴은 `tokens.ts`/`palette.ts` 정의 블록에만 존재한다.
2. **장식 금지.** 모든 시각 요소는 데이터에 바인딩된다. 바인딩 못 하는 예쁜 요소는 뺀다.
3. **기본 테마 노출 금지.** ECharts/uPlot은 반드시 다크 프리셋(echartsBase 등)을 거친다.
4. **숫자는 tabular-nums + 공통 포맷터**(fmtPercent/fmtBps/fmtTemp/fmtCount/fmtClock). 손 포맷팅 금지.
5. **히어로 필수.** 지배적 시각 요소 없는 균등 그리드 대시보드는 만들지 않는다.
6. **빈 화면 방치 금지.** 로딩/빈/에러 상태는 기능이다.
7. **성능 예산 준수.** 씬 draw call ≤300, InstancedMesh, frameloop demand, 2D 폴백.
8. **임계는 severityOf 경유.** 컴포넌트 안 하드코딩 임계 금지.
9. **스크린샷 없이 완료 선언 금지.**
