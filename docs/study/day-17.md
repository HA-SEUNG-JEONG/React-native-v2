# Day 17 · 11/9 (월) — 미션 2-5 withRetryBackoff 개선 · 1/2일차: 복원
> **오늘의 핵심**: 재시도해도 소용없는 에러를 구분하고, 원본 에러를 `cause`로 보존하고, 취소 신호를 대기와 요청 양쪽에 연결한다.

**시작 상태**: 스텁 브랜치에서 `src/api/network.ts`의 `withRetryBackoff`가 `fn()` 1회만 부르고, 옵션 인자는 `_options`(미사용)로 바뀌어 있다. `src/screens/LocationScreen.tsx`의 15초 타임아웃도 없다. 두 단계다. ① 지수 백오프 + jitter 재시도 루프와 15초 `Promise.race` 복원(`_options`를 원래 옵션 이름으로 되돌린다). ② 비재시도 에러 · `cause` · `AbortSignal` · 타이머 정리. 빠듯하면 ②의 `AbortSignal`은 [Day 21](./day-21.md) 버퍼로 넘긴다. 선행 2-4는 [Day 11](./day-11.md)에 끝났다.


## 오늘 할 일 (90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~20 읽기: `src/api/network.ts`의 `withRetryBackoff`, `src/screens/NetworkScreen.tsx`의 재시도 데모(`flakyFetch`)와 호출부의 `message` 사용, `src/screens/LocationScreen.tsx`의 `Promise.race` → 적을 것: 호출부가 `message`를 어떻게 쓰나
- [ ] 20~60 복원: `withRetryBackoff`에 지수 백오프 + jitter 재시도 루프를 쓰고(`_options`를 원래 옵션 이름으로 되돌린다), `LocationScreen`의 위치 가져오기에 15초 `Promise.race` 타임아웃을 다시 쓴다
- [ ] 60~75 재현 확인: Network 화면 재시도 데모에서 단순판의 로그를 눈으로 보고 한 줄로 메모한다. Location 화면 위치 가져오기가 기존처럼 동작하는지 본다
- [ ] 75~90 메모: 2일차 결정 후보(아래 참고), 내일 할 일 한 줄

## 끝 조건
1. Network 화면 재시도 데모 로그의 백오프 시간이 지수로 증가한다
2. Location 화면 위치 가져오기가 기존처럼 동작하고, `npm run typecheck` · `npx eslint .` · `npm test`가 통과한다


## 막히면
- 15분 막힘 → 2-5 힌트 1 요청: "다시 시도해도 소용없는 에러"를 어떻게 알아볼지 정한다. 2-4의 결과물을 쓴다
- 다시 15분 → 힌트 2 (`AbortSignal`, `Error`의 `cause` 옵션, `clearTimeout`, `Promise.race`가 성공·실패 어느 경로에서도 실행되는 블록), 다시 15분 → 힌트 3 (대기 취소 시 `setTimeout` 핸들, 이미 `aborted`인 `signal`, Hermes 지원 확인 필요)
- `AbortSignal`이 끝나지 않으면 억지로 잇지 말고 Day 21 버퍼로 넘긴다. 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: MDN의 `Error.cause`, `AbortController`. [p6-study-guide.md](../p6-study-guide.md) W16의 백오프·jitter 절.
- **코딩 전에 정할 것** (2일차 설계 결정)
  - "다시 시도해도 소용없는 에러"를 알아보는 방법. 2-4의 결과물을 쓴다. `flakyFetch`는 `status` 없는 일반 `Error`를 던진다. "재시도하지 않을 에러"의 기본값을 정할 때 이 데모가 깨지지 않는지 먼저 확인한다.
  - 호출부(`NetworkScreen`)가 원본 메시지를 읽는다. `message` 형식을 바꾸면 화면 로그가 달라진다. 바꿀지 유지할지 정한다.
  - `signal`을 `fn`에 넘기는가, 대기에만 쓰는가. 대기만 쓰면 반쪽이다.
  - abort 때 Promise는 reject했는데 타이머가 남는 경우를 어떻게 막는가. 이미 aborted인 signal을 받았을 때는?
- **수정 중 확인 (주의)**
  - `AbortSignal.timeout`, `AbortSignal.any`, `signal.throwIfAborted`가 Hermes(RN 0.81)에서 있는지는 확인 필요다. 기본 API만으로 시작한다.
  - `LocationScreen`에서 고칠 것은 **타이머 정리뿐**이다. `getCurrentPositionAsync` 자체는 중단할 수 없다. 성공과 실패 어느 경로에서도 실행되는 블록이 무엇인지 생각한다.
  - 이 함수는 2-11에서 fake timers로 테스트한다. 테스트하기 쉬운 모양(시간·랜덤이 주입되거나 모킹 가능한 형태)인지 지금 의식만 해 둔다.
- **임시 코드 되돌릴 곳**: 없음.
- **기록 포인트**: 1단계 단순판의 동작(= "변경 전"), `message` 형식 유지/변경 결정과 이유, `signal`을 `fn`에 넘기는지 여부, 이월 항목.
- **다음 날**: [Day 18](./day-18.md) (11/10 (화)) — 이어서.
