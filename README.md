# jemon

오픈소스·상업 라이선스-클린 통합 모니터링 플랫폼 + Claude 디자인 세트.

한국 통합관제(NMS/SIEM) 10개 도메인 메트릭·KPI를 카탈로그로 표준화하고, 수집(SNMP/exporter) → 시계열 저장(VictoriaMetrics) → TypeScript API → Next.js 시각화로 잇는 온프레 어플라이언스. 그 위에 Claude Code 에이전트가 요구사항·이미지(조감도/랙 실장도)로 레퍼런스급 대시보드를 일관되게 코드로 생성하는 디자인 세트를 제공한다.

## 스택 (모두 상업 라이선스-클린)
- 프론트: Next.js/React, Tailwind, shadcn/ui, ECharts(Apache-2.0), uPlot, Three.js/react-three-fiber, MapLibre GL, deck.gl
- API: TypeScript(Node)
- 저장: VictoriaMetrics(OSS), VictoriaLogs, Valkey
- 수집: snmp_exporter / Telegraf + vmagent
- 배포: Docker(멀티아치) + Kubernetes/Helm, 폐쇄망 오프라인 설치

> 회피: Grafana(AGPL), Highcharts/amCharts(상용), Mapbox GL v2+(독점), LibreNMS(GPLv3), Elasticsearch/Kibana(SSPL), VictoriaMetrics Enterprise 전용 기능(다운샘플 등). `pnpm run check:licenses` 로 강제.

## 구조 (pnpm + turborepo)
```
apps/web          Next.js 대시보드
packages/ui       디자인시스템 + 컴포넌트 라이브러리(차트/3D/지도/랙)
packages/metric-sdk  타입드 쿼리/KPI 클라이언트
packages/catalog  10도메인 메트릭/KPI 카탈로그(스키마+데이터)
services/api      통합 쿼리/메트릭 API + 인벤토리 + RBAC
collectors        snmp_exporter/telegraf 설정 + 인벤토리→설정 생성
infra/{compose,docker,helm}  배포
.claude           Claude 디자인 세트 에이전트 스캐폴딩
```

## 빠른 시작
```bash
pnpm install
pnpm -r build
docker compose -f infra/compose/docker-compose.yml up -d   # VictoriaMetrics/Valkey/snmpd_test
```

## 라이선스
MIT (see LICENSE).
