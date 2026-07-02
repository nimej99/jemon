# .claude — jemon Claude 디자인 세트

고객 요구사항·이미지(조감도/도면/랙 실장도/평면도) → 레퍼런스급 실데이터 대시보드 코드를 **일관되게** 생성하기 위한 에이전트 스캐폴딩. 단일 소스는 이 디렉토리다.

## 구성

| 경로 | 역할 |
|---|---|
| `skills/dashboard-design/SKILL.md` | 생성 워크플로 (입력→5단계 설계→구현→검증) |
| `skills/dashboard-design/design-tokens.md` | 토큰 규약 — 실행 소스 `packages/ui/src/theme/tokens.ts` |
| `skills/dashboard-design/component-map.md` | 허용 컴포넌트 카탈로그 (@jemon/ui) |
| `skills/dashboard-design/layout-recipes.md` | 도메인 레시피 A캠퍼스 B랙 C지리 D상세 E아파트 F공장 G홈 |
| `skills/dashboard-design/quality-checklist.md` | 합격 게이트 A~H |
| `skills/dashboard-design/references/` | 골든 레퍼런스 이미지 + 역설계 사양 |
| `agents/design-reviewer.md` | 시각 품질 심사관 (읽기 전용, SHIP/FIX/REJECT) |

## 품질 루프

```
요구사항/이미지 → (스킬) 5단계 설계 → @jemon/ui 조립 →
NEXT_PUBLIC_DEMO=1 dev → node scripts/design-shot.mjs /<slug> →
design-reviewer 심사 → FAIL 수정 반복 → PASS = 완료
```
