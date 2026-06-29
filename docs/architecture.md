# jemon 아키텍처

수집(snmp_exporter/telegraf + vmagent) → 저장(VictoriaMetrics OSS + VictoriaLogs + Valkey) → API(TypeScript) → 시각화(Next.js + packages/ui). 카탈로그(packages/catalog)가 10도메인 메트릭/KPI 단일 진실원. 상세는 ralplan 계획/스펙 참조.

## ADR 요약
- (b) Next.js(web) + 별도 TS API 분리 모노레포.
- 보존: vmagent stream-aggregation(OSS) 롤업 + 원본30일/롤업장기 retention 2-인스턴스(VM Enterprise 다운샘플 미사용).
- 온프레 단일배포, 단일조직 RBAC, 멀티테넌시 없음.
