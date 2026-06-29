# jemon 진행 현황 (ultragoal 스냅샷)

소스: deep-interview 스펙 + ralplan 합의 계획(.gjc). 원장 아키텍처는 docs/architecture.md.

## 완료 (검증·푸시·체크포인트)
- **P0 모노레포 스캐폴드** (G001 complete): pnpm+turbo workspace, 라이선스-클린 게이트(allowlist/denylist, UNKNOWN=fail, SPDX 보수) + 적대 테스트 8/8, CI(frozen-lockfile), infra compose/docker/helm 스켈레톤, MIT. HEAD 6264e18.

## 진행 중 (P1, G002)
- collectors+compose: VictoriaMetrics(30d)+VM-rollup(365d)+snmp_exporter+vmagent(if_mib scrape, stream-agg OSS 롤업)+snmpd_test+valkey. compose config 유효, 스택 기동함.
- packages/catalog: network/server 메트릭+KPI(zod) — executor 구현.
- services/api: /metrics/query(VM 프록시), /catalog, /devices(인벤토리+AES-GCM 자격증), configgen — executor 구현.

## 남은 일 (멀티세션)
P1 통합검증+게이트+커밈, P2 카탈로그 10도메인, P3 Next.js 대시보드+vmalert, P4 Claude 디자인 세트(r3f 조감도), P5 멀티아치+Helm+오프라인, P6 e2e.

## 재개
원장: .gjc/_session-*/ultragoal/ (goals.json G001~G007, ledger.jsonl). 스택: docker compose -f infra/compose/docker-compose.yml up -d. 검증: curl localhost:8428/api/v1/query?query=count(ifHCInOctets).
