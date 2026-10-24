# Day 21 · 11/13 (금) — 버퍼 + Tier 2 전반 점검

> **오늘의 핵심**: 새 미션 없이 밀린 일을 흡수하고, Tier 2 전반(2-4 · 2-2 · 2-3 · 2-7 · 2-5 · 2-6)에 임시 코드나 범위 밖 파일이 섞이지 않았는지 한 번에 점검한다.

**시작 상태**: 금요일 고정 버퍼다. 어제까지의 미션 기록(`docs/improve/reviews/`)과 이월 항목(예: [Day 17~18](./day-17.md)의 `AbortSignal`)이 출발점이다.

## 오늘 할 일 (총 90분)
- [ ] 00~30 밀린 미션 마무리: 이월 항목을 끝낸다 (`AbortSignal` 등)
- [ ] 30~40 점검 ①: 모든 검증 명령을 한 번에 돌려 0 errors를 확인한다
- [ ] 40~50 점검 ②: `git diff main...HEAD --stat`으로 이번 주 변경 파일 목록을 보고 **미션 범위 밖 파일이 섞이지 않았는지** 본다
- [ ] 50~55 점검 ③: `grep -rn "console\." src App.tsx`로 임시 로그가 남지 않았는지 본다 (의도된 4건은 3-4 분류 대상이니 목록과 대조)
- [ ] 55~70 점검 ④ 체크리스트 구술: [p4-study-guide.md](../p4-study-guide.md)(캐시), [p6-study-guide.md](../p6-study-guide.md)(인증·네트워크·재시도)의 복습 체크리스트를 보지 않고 답한다. 막힌 항목은 [Day 28](./day-28.md)(Tier 2 종료 절)의 재복습 칸으로
- [ ] 70~90 회고: 이번 주 가장 오래 걸린 미션, 힌트 단계, 가설이 틀린 곳을 세 문장으로 쓴다

```bash
npm run typecheck && npm test && npx eslint .
git diff main...HEAD --stat
grep -rn "console\." src App.tsx
```

## 끝 조건
1. `npm run typecheck && npm test && npx eslint .`가 0 errors이고, `git diff main...HEAD --stat`에 범위 밖 파일이 없다
2. `grep`에 남는 `console.`이 모두 의도된 것으로 설명된다. 밀린 미션이 끝났거나 이월 사유가 적혀 있다
3. 말로 설명: 이번 주 가장 오래 걸린 미션과 가설이 틀린 이유

## 막히면
- 밀린 미션이 막히면 해당 미션의 힌트 단계 규칙을 따른다 ([rules.md](./rules.md)). 힌트 3까지 갔는데도 20분 막히면 멈추고 막힌 지점을 기록한다
- 범위 밖 파일이 diff에 보이면 해당 커밋을 찾아 사용자에게 보고한다. 임의로 되돌리지 않는다

## 참고
- **읽을 학습 가이드 절**: [p4-study-guide.md](../p4-study-guide.md)와 [p6-study-guide.md](../p6-study-guide.md)의 복습 체크리스트.
- **시간표 원본**: 밀린 미션 30 · 점검 40 · 회고 20.
- **임시 코드 되돌릴 곳**: 이번 주 미션별 임시 코드(2-4 `instanceof` 로그, 2-2 `gcTime`, 2-7 `page === 2` 던지기)가 남지 않았는지 `git diff`로 확인한다.
- **기록 포인트**: 회고 세 문장, 재복습 칸으로 보낸 막힌 항목.
