# 로그아웃 시 모듈 상태 리셋 (미션 1-6)

**날짜**: 2026-10-25  
**유형**: fix  
**관련 파일**: `src/api/auth.ts`, `App.tsx`, `tests/auth.test.ts`, `docs/improve/reviews/1-6.md`

## 변경 내용

`src/api/auth.ts`의 `logout()` 본문이 비어 있어 로그아웃해도 모듈 상태가 남았다. 더 큰 문제는 진행 중이던 `login()`/토큰 갱신이 끝나면서 `session`을 다시 채워 로그아웃을 되살리는 것(경로 B·C)이었다. 또 앱 재시작 시 `App.tsx`가 `SecureStore`의 `user`만 복원하고 메모리 `session`은 없어 둘이 어긋났다(경로 D).

## 주요 구현 사항

- `logout()`이 `generation`을 `+= 1` 하고 `session`, `refreshInFlight`, `loginInFlight`, `refreshCount`를 리셋한다. `generation`은 프로세스 범위라 리셋하지 않는다.
- `login()`, `refreshAccessToken()`은 시작 시 `myGen = generation`을 잡고, `await` 뒤 `myGen !== generation`이면 throw 한다. `.finally`도 같은 세대일 때만 in-flight 변수를 비워 옛 작업이 새 로그인의 in-flight를 지우지 못한다.
- 대안 "완료 시점에 `session` 재확인"은 로그아웃 → 재로그인 뒤 옛 작업이 새 세션을 덮어쓰는 것을 못 막아 버렸다.
- `App.tsx` 부팅 `useEffect`: `SecureStore` 값이 있어도 `isLoggedIn()`이 `false`면 값을 지우고 로그아웃 취급한다.
- **바뀐 사용자 동작**: 앱을 재시작하면 항상 로그인 화면이 뜬다 (토큰이 메모리에만 있음). `isReady` 전에 끝나므로 로그인 화면 깜빡임은 없다.
- `tests/auth.test.ts`: `afterEach`에서 `logout()` 호출로 격리. 로그아웃 후 상태, 경로 B, 옛 login의 `.finally` 격리, 경로 C 테스트 추가. 가드를 주석 처리하면 3개가 실패함을 확인.

## 검증

- `npm test` 5개 통과, `npm run typecheck`, eslint 통과.
- 미확인: 시뮬레이터에서 로그인 → 재시작 → 로그인 화면 확인.

## 범위 밖

`NetworkScreen`의 `refreshCount` 사용(전후 차이 방식이라 영향 없음), 테스트의 4초 대기 개선(Tier 2 2-11), 토큰 영속화.

## 관련 커밋

아직 커밋 없음 (작업 트리 변경 상태). 직전 커밋: `271d048 chore: 네이티브 빌드 설정 추가 (bundleIdentifier, run 스크립트)`
