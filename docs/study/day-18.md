# Day 18 · 11/10 (화) — 미션 2-5 withRetryBackoff 개선 · 2/2일차: 개선
> **오늘의 핵심**: 재시도해도 소용없는 에러를 구분하고, 원본 에러를 `cause`로 보존하고, 취소 신호를 대기와 요청 양쪽에 연결한다.

**시작 상태**: 스텁 브랜치에서 `src/api/network.ts`의 `withRetryBackoff`가 `fn()` 1회만 부르고, 옵션 인자는 `_options`(미사용)로 바뀌어 있다. `src/screens/LocationScreen.tsx`의 15초 타임아웃도 없다. 두 단계다. ① 지수 백오프 + jitter 재시도 루프와 15초 `Promise.race` 복원(`_options`를 원래 옵션 이름으로 되돌린다). ② 비재시도 에러 · `cause` · `AbortSignal` · 타이머 정리. 빠듯하면 ②의 `AbortSignal`은 [Day 21](./day-21.md) 버퍼로 넘긴다. 선행 2-4는 [Day 11](./day-11.md)에 끝났다.

## 오늘 할 일 (90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 1일차의 "내일 할 일" 확인
- [ ] 05~20 설계 결정: 아래 참고의 "결정할 것" 네 가지를 한 줄씩 정한다 (`flakyFetch` 데모가 깨지지 않는지 먼저 확인)
- [ ] 20~65 개선: 비재시도 에러 · `cause` 보존 · `AbortSignal` 지원 · `LocationScreen` 타이머 정리. `AbortSignal`이 안 끝나면 금요일 버퍼로 넘긴다
- [ ] 65~80 검증: `npm run typecheck` · `npx eslint .` · `npm test` · Network 화면 재시도 데모 로그의 백오프 시간이 지수로 증가 · Location 화면 위치 가져오기가 기존처럼 동작
- [ ] 80~90 기록: `docs/improve/reviews/2-5.md`, 넘긴 항목(`AbortSignal` 등)이 있으면 Day 21로 이월한다고 적기, 내일 할 일 한 줄

## 끝 조건
1. Network 화면 재시도 데모 로그의 백오프 시간이 지수로 증가하고, Location 화면 위치 가져오기가 기존처럼 동작한다
2. 비재시도 조건 · `cause` 보존 · `AbortSignal` 지원 · `LocationScreen` 타이머 정리. 검증 4종 통과
3. 말로 설명: 4xx를 재시도하지 않는 이유. `cause`를 쓰면 호출부가 무엇을 할 수 있나.

## 막히면
- 15분 막힘 → 2-5 힌트 1 요청: "다시 시도해도 소용없는 에러"를 어떻게 알아볼지 정한다. 2-4의 결과물을 쓴다
- 다시 15분 → 힌트 2 (`AbortSignal`, `Error`의 `cause` 옵션, `clearTimeout`, `Promise.race`가 성공·실패 어느 경로에서도 실행되는 블록), 다시 15분 → 힌트 3 (대기 취소 시 `setTimeout` 핸들, 이미 `aborted`인 `signal`, Hermes 지원 확인 필요)
- `AbortSignal`이 끝나지 않으면 억지로 잇지 말고 Day 21 버퍼로 넘긴다. 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고 (아래로 밀어 둠)
- **전날 이어받기**: [Day 17](./day-17.md)(11/9 (월))의 "내일 할 일" 한 줄을 이어받는다. 미션 전체의 읽을 절·코딩 전에 정할 것·임시 코드·기록 포인트는 [Day 17](./day-17.md)의 `## 참고`에 있다.
