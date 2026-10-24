# Day 25 · 11/17 (화) — 미션 2-11 테스트 확장 (2/2): 타이머와 롤백

> **오늘의 핵심**: 실시간 `sleep` 없이 fake timers로 시간 의존 로직을 테스트하고, `auth.test.ts`의 4초 대기를 없애되 검증 내용은 없애지 않는다.

**시작 상태**: [Day 24](./day-24.md)에서 `groupByTens`·`getNextPageParam` 테스트와 순수 로직 분리가 끝났다. 오늘은 `auth.ts` 만료, `withRetryBackoff`, 낙관적 롤백 테스트와 `tests/auth.test.ts`의 sleep 제거다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~15 읽기: Node `mock.timers.enable({ apis })`, `tick(ms)`, `mock.method`. `src/api/auth.ts`의 `Date.now()`와 `setTimeout` 사용처 → 적을 것: 만료·갱신 지연이 몇 단계인가
- [ ] 15~30 설계: 아래 참고의 "결정할 것" 세 가지를 정한다
- [ ] 30~75 작성: `withRetryBackoff`(fake timers), 낙관적 롤백, `auth.ts` 만료 테스트를 쓰고 `tests/auth.test.ts`의 sleep을 제거한다 (주의 사항은 아래 참고)
- [ ] 75~85 검증: `npm test` 시간이 눈에 띄게 줄었는가 (전 약 6초 → 후 ?) · 테스트가 여전히 **단일 갱신을 검증**하는가 · 로직을 일부러 깨뜨려 빨개지는지 확인한 뒤 되돌린다 · `npm run typecheck` · `npx eslint .`
- [ ] 85~90 기록: `docs/improve/reviews/2-11.md`, 내일 할 일 한 줄

## 끝 조건
1. `npm test` 시간이 줄었고(전 약 6초 → 후 ?), 일부러 로직을 깨뜨리면 빨개진다 (확인 후 되돌림)
2. `groupByTens` · `getNextPageParam` · `withRetryBackoff`(fake timers) · 낙관적 롤백 테스트가 있고 `auth.test.ts` sleep이 제거됐다. 검증 4종 통과
3. 말로 설명: fake timers가 `setTimeout`을 어떻게 대체하는가.

## 막히면
- 15분 막힘 → 2-11 힌트 1 요청: 테스트 대상마다 "이 함수가 Node에서 import되는가"부터 확인한다
- 다시 15분 → 힌트 2 (`mock.timers.enable({ apis: [...] })`와 `tick(ms)`, `mock.method(Math, "random", …)`로 jitter 고정, 롤백은 순수 함수로 빼거나 `QueryClient`를 직접 만들어 캐시 조작)
- 다시 15분 → 힌트 3 (`import type`, `.ts` 확장자, `MockTimers` 경고, 마이크로태스크 비우기, `Date`/`setTimeout`이 얽힌 `auth.ts` 만료)
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: Node `mock.timers` 문서. 미션 문서 [tier2-quality.md](../improve/tier2-quality.md)의 2-11 절.
- **결정할 것**
  - `auth.ts` 만료 테스트: `Date`도 가짜로 할지, TTL을 바꿀 수 있게 할지. 대기하는 지연이 여러 단계라 `tick`을 단계마다 줘야 한다.
  - `withRetryBackoff`: `Math.random`을 고정해 jitter 단언이 흔들리지 않게 한다.
  - 낙관적 롤백: 순수 함수로 빼서 테스트하거나, `QueryClient`를 직접 만들어 캐시를 조작한다.
- **수정 중 확인 (주의)**
  - `mock.timers.reset()`을 빼먹으면 다음 테스트로 새어 나간다.
  - `MockTimers`는 Node 22에서 experimental이라 경고가 출력된다. 이상 아님.
  - 가짜 타이머를 진행시킨 뒤에도 Promise 체인이 끝나려면 마이크로태스크를 한 번 비워 줘야 할 수 있다.
  - `HttpError`를 테스트에서 import하는데 parameter property로 정의했다면 로드가 실패한다 (Day 11에서 미리 명시적 필드로 바꿔 뒀다면 문제 없다).
- **임시 코드 되돌릴 곳**: 검증용으로 일부러 깨뜨린 로직. 확인 후 되돌린다.
- **기록 포인트**: `npm test` 전/후 시간, 단일 갱신 검증이 유지됐는지, `Date`를 가짜로 할지 TTL 주입으로 할지 선택과 이유.
