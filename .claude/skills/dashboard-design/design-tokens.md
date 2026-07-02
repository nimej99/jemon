# jemon 디자인 토큰

> **실행 소스는 `packages/ui/src/theme/tokens.ts`** — 이 문서는 그 미러 + 사용 규약이다. 값 변경은 반드시 둘 다.
> 대시보드 코드에 토큰 밖 리터럴 색을 쓰면 불합격. 씬 전용 파생색은 `packages/ui/src/scenes/palette.ts`에만 추가 허용.

## 1. 사용 경로

- **Tailwind** (권장): `bg-page` `bg-navrail` `bg-card` `bg-card-solid` `bg-elevated` `bg-track` / `text-on-surface` `text-on-muted` `text-muted` / `text-ok|warn|crit|info` / `accent-blue|green|teal|amber|purple|pink|cyan|violet|emerald` / `border-subtle` `border-strong` / `rounded-card`(12px) `rounded-hero`(24px) / `shadow-card` / `tracking-micro`
- **TS(차트/씬)**: `import { tokens, devicePalette, metricAccent } from "@jemon/ui/theme"` (패키지 내부는 `../theme/tokens.js`)
- **CSS 변수**: `<ThemeStyles/>`가 `:root`에 주입 — `var(--bg-page)` 등. 변수명은 tokens.ts의 kebab 매핑과 동일.

## 2. 컬러 (다크 기본)

| 그룹 | 토큰 | 값 | 용도 |
|---|---|---|---|
| surface | `--bg-page` | `#0A1220` | 페이지 배경 |
| | `--bg-navrail` | `#070D18` | 좌측 레일 |
| | `--bg-card` | `rgba(15,27,48,.92)` | 카드 (+backdrop-blur 6px 조합) |
| | `--bg-card-solid` | `#0F1B30` | 불투명 카드 |
| | `--bg-elevated` | `#16233C` | 호버·팝오버 |
| | `--bg-track` | `rgba(255,255,255,.08)` | 프로그레스 트랙 |
| | `--bg-hover` | `rgba(255,255,255,.06)` | 호버 오버레이 |
| border | `--border-subtle` | `rgba(148,163,184,.12)` | 기본 1px 보더 |
| | `--border-strong` | `rgba(148,163,184,.24)` | 강조 보더 |
| text | `--text-primary` | `#F1F5F9` | 제목·값 |
| | `--text-secondary` | `#94A3B8` | 라벨 |
| | `--text-muted` | `#64748B` | 캡션·타임스탬프 |
| status | `--status-ok` | `#22C55E` | 정상 (의미 고정, 재배정 금지) |
| | `--status-warn` | `#F59E0B` | 주의 |
| | `--status-crit` | `#EF4444` | 장애 |
| | `--status-info` | `#38BDF8` | 정보 |
| accent | `--accent-primary` | `#3B82F6` | CPU, 활성 nav, 네트워크 라인 |
| | `--accent-green` | `#22C55E` | MEM |
| | `--accent-teal` | `#2DD4BF` | TRAFFIC |
| | `--accent-amber` | `#F59E0B` | TEMP |
| | `--accent-purple` | `#A855F7` | 보조 시계열 |
| | `--accent-pink` `--accent-cyan` `--accent-violet` `--accent-emerald` | `#EC4899` `#06B6D4` `#8B5CF6` `#10B981` | 디바이스 아이덴티티 |
| scene | `--scene-ambient` | `#0B1830` | 씬 앰비언트 |
| | `--scene-window` | `#FFD98A` | emissive 창문 |
| | `--scene-glow` | `#38BDF8` | 네트워크 라인/노드 bloom |

- **디바이스 아이덴티티 팔레트** `devicePalette`: green → blue → purple → amber → cyan → pink → violet → emerald 순환. 같은 화면 인접 카드에 같은 색 금지.
- **지표별 고정 액센트** `metricAccent`: cpu=blue, mem=green, traffic=teal, temp=amber. 재배정 금지.
- 상태 컬러는 상태 표현에만. 장식으로 red/green 쓰지 않는다.

## 3. 타이포그래피

- 폰트: `Pretendard Variable`(한글) + `Inter` 폴백 (`font-sans`). 숫자는 항상 `tabular-nums`.

| 토큰 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| display | 28–32 | 700 | KPI 큰 값 |
| h1 | 24–28 | 700 | 페이지 제목 |
| h2 | 16 | 600 | 패널 제목 |
| body | 13–14 | 400–500 | 본문·알림 |
| label | 12–13 | 500 | 카드 라벨 |
| caption | 11 | 400 | 타임스탬프·서브텍스트 |
| micro | 9–10 | 600, uppercase, `tracking-micro` | 지표 라벨(CPU/MEM…) |

- 앱 타이틀: uppercase + tracking-wide. 큰 값+단위: 값 display, 단위 절반 크기 `text-on-muted` baseline 정렬 (`4.58 Gbps`).

## 4. 간격·형태

- 4pt 그리드. 카드 내부 padding 16–20, 카드 간 gap 16, 리전 간 24.
- radius: 컨트롤 8 / 카드 12–16 (`rounded-card`~`rounded-2xl`) / 히어로 컨테이너 24 (`rounded-hero`) / 칩·활성 nav 10–12.
- 보더 항상 1px `border-subtle`. 2px 보더 금지. 그림자 `shadow-card`. 오버레이 카드 + `backdrop-blur-[6px]`.
- 프로그레스 바 h-1(4px) rounded-full 트랙 `bg-track`. 도넛 두께 12–14px, 세그먼트 2° 갭.

## 5. 임계 기본값 (카탈로그 미지정 시)

| 지표 | warn | crit |
|---|---|---|
| CPU/MEM/트래픽 사용률 % | 70 | 85 |
| 온도 °C (사무·강의 공간) | 38 | 45 |
| 온도 °C (전산실/랙) | 27 | 32 |

판정은 반드시 `severityOf(value, thresholds)` (@jemon/ui/lib) 경유.

## 6. 모션

- 기본 트랜지션 150–200ms ease-out. 숫자 갱신 300ms, 깜빡임 금지.
- 씬: 라인 dash-offset 2–4s linear, 노드 펄스 2s. 카메라 자동 회전 OFF.
- `prefers-reduced-motion` 존중 (globals.css 전역 + 씬 AnimationTicker 정지).
