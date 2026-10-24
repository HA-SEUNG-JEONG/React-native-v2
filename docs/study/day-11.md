# Day 11 · 11/3 (화) — 미션 2-4 HttpError 도입

> **오늘의 핵심**: 에러에 상태 코드를 담는 전용 클래스를 만들고, 던지는 곳을 전부 바꿔야 캐스트가 `instanceof`로 바뀐다.

**시작 상태**: 2-4는 스텁이 손대지 않은 미션이지만 인벤토리 숫자가 스텁 영향을 받는다. `src/screens/FeedListScreen.tsx`의 `(error as Error).message`(2-7, Day 16)와 `src/api/network.ts`의 `e as Error`(2-5, Day 17~18)는 아직 없고, `src/api/posts.ts` `fetchPost`의 `throw`는 Day 8~9에서 내가 쓴 것이다. 그래서 오늘 인벤토리는 원본보다 짧다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~20 읽기: `src/api/posts.ts`의 두 `throw`, `src/api/auth.ts`의 `status` 읽기/쓰기, `src/screens/NetworkScreen.tsx`의 `catch`들 → 이미 `instanceof`를 쓰는 곳(`FeedDetailScreen`, `NotificationScreen`, `LoginScreen`)과 비교해 적을 것: 차이 한 줄
- [ ] 20~30 인벤토리: 아래 `grep` 두 개를 돌려 status를 쓰는 곳, 읽는 곳, 캐스트가 필요한 곳을 표로 만든다. 미션 문서의 표와 다르면 그 사실을 기록한다
- [ ] 30~35 실험 ①(코딩 전): 캐스트 일부를 지워 보고 `npm run typecheck`가 실제로 에러를 내는지 본다
- [ ] 35~60 수정: `HttpError` 클래스를 만들고 던지는 곳을 **전부** 바꾼다. 필드는 명시적으로 선언한다
- [ ] 60~65 실험 ②: 클래스를 만든 뒤 Hermes에서 `instanceof`가 `true`인지 임시 로그로 확인하고, 확인 후 로그를 지운다
- [ ] 65~75 검증: `npm run typecheck` · `npx eslint .` · `npm test` · Network 화면에서 "보호된 API 호출"을 4초 이상 기다린 뒤 눌러 401 → 갱신 → 재시도 흐름이 그대로인지
- [ ] 75~90 기록: `docs/improve/reviews/2-4.md`, "이후 미션에서 쓸 곳"(Day 16·17~18에 새로 쓰는 코드는 처음부터 `HttpError`/`instanceof`), 내일 할 일 한 줄

```bash
grep -rn "as Error\|Error & {" src
grep -rn "\.status" src
```

## 끝 조건
1. Network 화면의 "보호된 API 호출" 401 → 갱신 → 재시도 흐름이 이전과 같다
2. `grep`에 남는 캐스트가 모두 "필요해서 남긴 것"이고 이유가 있다. 검증 4종 통과, `instanceof` 확인 로그 제거
3. 말로 설명: `catch (e)`의 `e`가 `unknown`인 이유와 `as` 캐스트의 위험

## 막히면
- 15분 막힘 → 2-4 힌트 1 요청: 지금 `status`를 읽고 쓰는 곳이 몇 군데인지 센다. 전부 같은 클래스를 가리키게 하는 것이 목표다
- 다시 15분 → 힌트 2 (API 이름), 다시 15분 → 힌트 3 (함정). Hermes `instanceof`와 Node에서 로드되는 클래스 모양이 함정이다
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: 원본에 별도 지정 없음. 미션 문서 [tier2-quality.md](../improve/tier2-quality.md)의 2-4 절.
- **코딩 전에 정할 것**
  - 던지는 곳을 **전부** 바꿔야 의미가 생긴다. 일부만 바꾸면 클래스가 있는데 쓰이지 않는다.
  - `src/api/auth.ts`의 "로그인 필요"처럼 상태 코드가 없는 실패까지 `HttpError`로 만들지 않는다.
  - 2-11에서 이 클래스를 Node로 테스트한다. `constructor(public status: number)` 같은 parameter property는 Node의 TS 실행에서 로드 단계에 실패한다. 필드를 명시적으로 선언한다. 지금 바꿔 두면 2-11에서 안 헤맨다.
  - 실험 ①: React Query v5의 기본 에러 타입이 `Error`라서 지워도 되는 캐스트가 있을 수 있다.
- **수정 중 확인**: 클래스를 만든 뒤 Hermes에서 `instanceof`가 실제로 `true`인지 임시 로그로 확인한다 (문서도 "확인 필요"로 남겼다).
- **임시 코드 되돌릴 곳**: `instanceof` 확인 로그 → 해당 파일. 끝낼 때 `git diff`로 확인한다.
- **기록 포인트**: 인벤토리 표(미션 문서와 다른 점), 이후 미션(2-7, 2-5)에서 쓸 곳.
