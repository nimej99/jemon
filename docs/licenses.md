# 라이선스 정책 (policy = implementation)

jemon은 상업 재배포 가능한 퍼미시브 라이선스만 허용한다. scripts/license-classify.mjs 의 ALLOW/DENY 와 이 문서는 항상 일치해야 한다.

## Allowlist (허용)
MIT, MIT*, ISC, 0BSD, BSD-2-Clause, BSD-3-Clause, Apache-2.0, MPL-2.0, CC0-1.0, Unlicense, BlueOak-1.0.0, Python-2.0, Zlib

## Denylist (하드 거부)
AGPL, SSPL, Elastic-2.0 / Elastic License, Business Source / BUSL, Commons Clause, RSAL, GPL-1.0 / 2.0 / 3.0

## 규칙
- 허용목록·거부목록 모두에 없으면 UNKNOWN → 게이트 실패(fail-closed).
- SPDX OR/AND/괄호 표현은 보수적 평가(괄호/AND 포함 시 모든 identifier 허용이어야 펵스).
- denylist 매칭은 OR 포함 여부와 무관하게 거부(예: 'AGPL-3.0 OR MIT' → denied).
- 검증: pnpm run check:licenses (실데이터) + pnpm test:scripts (classify 적대적) + license-gate CI(self-test).
