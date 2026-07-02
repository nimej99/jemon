# 골든 레퍼런스 1 — 캠퍼스 네트워크 모니터링 (3D 조감도형)

> 원본: `./reference-1-campus.png` (1536×1024). jemon 스펙(deep-interview-jemon-platform.md)의 "레퍼런스1".
> 이 문서는 이미지의 **모든 시각적 결정**을 재현 가능한 사양으로 역설계한 것이다.
> 새 대시보드 생성 시 이 문서 = 품질 기준선. "이 정도가 안 되면 미완성"이다.

## 1. 왜 이게 고퀄인가 (핵심 4가지)

1. **씬-앵커 정보 구조**: 3D 조감도가 장식이 아니라 정보의 좌표계다. 디바이스 카드가 건물에 리더라인으로 앵커되어 "어디의 무엇"이 즉시 읽힌다.
2. **토큰 일관성**: 배경/카드/보더/텍스트/시맨틱 컬러가 전부 하나의 다크 팔레트에서 나온다. 임의 색이 단 하나도 없다.
3. **밀도와 여백의 균형**: 카드 하나에 지표 4개 + 인원수를 넣고도 안 답답하다 — 초소형 uppercase 라벨, 얇은 프로그레스 바, 우측정렬 tabular 숫자 덕분.
4. **살아있는 씬**: 야간 조명, 발광 창문, 건물 간 흐르는 네트워크 라인, 노드 글로우 — "실시간 시스템"이라는 느낌을 시각적으로 증명한다.

## 2. 레이아웃 리전 맵

```
┌──┬──────────────────────────────────────────────────────────┐
│N │ TopBar: 앱타이틀 ──────────── 테마토글 · 알림 · 스코프 드롭다운 │
│a ├──────────────────────────────────────────────┬───────────┤
│v │ PageHeader: H1+서브타이틀 ──── 마지막 업데이트+새로고침       │
│R │ ┌──────────────────────────────────────────┐ │ SidePanel │
│a │ │  Hero: 3D 아이소메트릭 씬 (rounded island) │ │ ·상태요약  │
│i │ │  + 디바이스 오버레이 카드 ×8 (씬 위 float)   │ │  도넛+범례 │
│l │ │  + 발광 네트워크 라인/노드                  │ │ ·실시간알림│
│  │ └──────────────────────────────────────────┘ │  리스트    │
│  ├──────────────────────────────────────────────┴───────────┤
│  │ KPI Strip: 스탯카드 ×5 (아이콘+라벨 / 큰숫자 / 스파크라인)     │
└──┴──────────────────────────────────────────────────────────┘
```

- 그리드: NavRail ~72px 고정 / 본문 12col / SidePanel ~300px / Hero는 화면 높이의 ~65%, KPI Strip ~20%.
- 전 리전 간격 16~24px, 카드 radius 12~16px(rounded-xl~2xl), Hero 씬 컨테이너는 rounded-3xl.

## 3. 리전별 사양

### 3.1 NavRail (좌측 72px)
- 배경: 페이지보다 한 톤 어두움 (`bg-navrail`).
- 아이콘 5~6개 수직, 24px, 비활성 `text-muted`.
- **활성 상태**: 44×44 rounded-xl 채움 블록(`accent-primary` #2563EB 계열) + 흰 아이콘. 호버는 8% 흰색 오버레이.

### 3.2 TopBar (높이 ~64px)
- 좌: 햄버거 + 앱 타이틀 — uppercase, tracking-wide, font-semibold, 15~16px.
- 우: 아이콘 버튼(테마 토글·알림) + **스코프 셀렉터**(보더 1px `border-subtle`, rounded-lg, "전체 캠퍼스 ▾").
- 하단 보더 1px `border-subtle`로 본문과 분리.

### 3.3 PageHeader
- H1: 24~28px bold, `text-primary` ("캠퍼스 네트워크 현황").
- 서브: 13px `text-muted` ("실시간 모니터링 대시보드").
- 우측: "마지막 업데이트 HH:MM:SS" 13px muted + 원형 새로고침 아이콘 버튼. **라이브 타임스탬프는 신뢰의 신호 — 반드시 실데이터.**

### 3.4 Hero — 3D 아이소메트릭 씬
- **컨테이너**: rounded-3xl 아일랜드 실루엣, 씬 배경은 페이지 배경과 자연스럽게 블렌드(경계 하드에지 금지).
- **씬 내용**: 저폴리 건물(각각 식별 가능한 형태 — 강의동/도서관/체육관/기숙사/IT센터…), 도로+가로등, 운동장 트랙, 분수, 태양광 패널, 수목, 연못. 카메라: 클래식 아이소메트릭(방위 ~45°, 고도 ~35°), 살짝 부감.
- **라이팅**: 야간. 짙은 남색 앰비언트 + 창문 emissive(웜 옐로) + 가로등 포인트라이트 + 은은한 bloom. 씬이 배경보다 밝아서 자연히 히어로가 된다.
- **네트워크 오버레이**: 건물 간 발광 커브 라인(`accent-primary` 글로우), 라인 위 흐르는 파티클/대시 애니메이션, 각 건물 위 펄스 노드(밝은 시안/블루 스피어 + 글로우 링).
- **성능 예산**: draw call ≤ 300, 인스턴싱(나무/가로등), frameloop="demand" + 애니메이션 구간만 invalidate, 노드 30개 초과 시 2D 폴백.

### 3.5 디바이스 오버레이 카드 (×8) — 이 대시보드의 시그니처
- **위치**: 씬 위 absolute, 각 건물 근처에 배치 + 리더라인(글로우 도트)으로 건물과 연결. 서로 겹치지 않게 씬 가장자리로 분산.
- **카드**: 폭 ~180px, `bg-card`(≈92% 불투명), 1px `border-subtle`, rounded-xl, shadow-lg, backdrop-blur(sm).
- **헤더**: 28px 컬러 아이콘 칩(rounded-lg, **디바이스마다 고유 액센트** — green/blue/purple/orange/cyan/pink/violet/emerald) + 코드명(`NOVA-01` 13px bold white) + 위치명(`강의동 A` 11px muted).
- **지표 행 ×4** (CPU/MEM/TRAFFIC/TEMP):
  - 라벨: 9~10px uppercase `text-muted`, 좌측 고정폭.
  - 바: 높이 4px, rounded-full, 트랙 `bg-track`(흰 8%), 채움은 **지표별 고정 액센트**(CPU=blue, MEM=green, TRAFFIC=teal/컬러, TEMP=amber→값 높으면 red).
  - 값: 우측정렬, 11px, `tabular-nums`, 단위 포함(`31%`, `750 Mbps`, `40℃`).
- **푸터**: 인원 아이콘 + 접속자 수 (11px muted).
- 상태 이상 디바이스는 카드 보더/아이콘 칩이 시맨틱 컬러(amber/red)로 전환.

### 3.6 SidePanel (우측 ~300px)
- **장비 상태 요약 카드**: 제목 14px semibold → 도넛 차트(두께 ~14px, 세그먼트 = 시맨틱 컬러, 중앙에 총계 큰 숫자 + "TOTAL" 캡션) + 우측 범례(컬러 도트 + 라벨 + 우측정렬 카운트: 정상 7 / 주의 1 / 장애 0).
- **실시간 알림 카드**: 헤더(제목 + "더보기 ›" 링크 12px accent) → 알림 행(시맨틱 아이콘(⚠ amber) + 메시지 13px + 타임스탬프 11px muted). **빈 상태 문구 필수**: "모든 시스템이 정상 운영 중입니다." — 빈 영역 방치 금지.

### 3.7 KPI Strip (하단, 카드 ×5)
- 카드: `bg-card`, 1px `border-subtle`, rounded-2xl, padding 20px, 5등분 그리드(gap 16px).
- 구조: 상단(24px 컬러 아이콘 + 라벨 13px muted) / 좌하(**큰 값** 28~32px bold + 단위 14px, `tabular-nums`) / 우하(**스파크라인** — area gradient fill + 라인, 카드 폭 절반).
- 스파크라인 컬러 = 카드별 고유 액센트(blue/purple/green/orange/blue). 축·그리드·범례 전부 제거.
- 값 포맷: `25%`, `4.58 Gbps`(유효숫자 3), `38℃`, `1,323명`(천단위 콤마).

## 4. 컬러 실측 (씬 컨텍스트: 다크 네이비)

| 역할 | 값 | 용도 |
|---|---|---|
| bg-page | `#0A1220` ≈ hsl(217 52% 8%) | 페이지 배경 |
| bg-navrail | `#070D18` | 좌측 레일 |
| bg-card | `#0F1B30` / rgba(15,27,48,.92) | 카드·패널 |
| border-subtle | rgba(148,163,184,.12) | 1px 보더 |
| bg-track | rgba(255,255,255,.08) | 프로그레스 트랙 |
| text-primary | `#F1F5F9` | 제목·값 |
| text-secondary | `#94A3B8` | 라벨 |
| text-muted | `#64748B` | 캡션·타임스탬프 |
| accent-primary | `#2563EB`→`#3B82F6` | 활성 nav·네트워크 라인·CPU |
| status-ok | `#22C55E` | 정상 |
| status-warn | `#F59E0B` | 주의·TEMP |
| status-crit | `#EF4444` | 장애 |
| accent-purple | `#A855F7` | MEM 스파크라인 등 |
| accent-teal | `#2DD4BF` | TRAFFIC |
| glow-network | `#38BDF8` + bloom | 씬 네트워크 라인/노드 |

## 5. 데이터 바인딩 (jemon 카탈로그 매핑)

| UI 요소 | 카탈로그 메트릭 | 비고 |
|---|---|---|
| 카드 CPU | server: `hrProcessorLoad` (avg by device) | % |
| 카드 MEM | server: memory used% | % |
| 카드 TRAFFIC | network: `ifHCInOctets+ifHCOutOctets` rate → Mbps | 유효숫자 |
| 카드 TEMP | server/IoT: 온도 센서 | 임계 초과 시 시맨틱 전환 |
| 접속자 수 | network: 액티브 세션/클라이언트 수 | |
| 도넛 정상/주의/장애 | KPI: device status 집계 | 카탈로그 threshold 기준 |
| 실시간 알림 | alert/event API (firing/ack) | WS/SSE |
| KPI Strip 5종 | 전체 평균 CPU/MEM, 총 트래픽, 평균 온도, 총 접속자 | 스파크라인 = 최근 1h 시계열 |
