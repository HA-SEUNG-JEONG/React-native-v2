# 학습 증빙 최소 보강: 정확성 버그 4건 + README + 테스트

**날짜**: 2026-10-13
**유형**: fix
**관련 파일**: `App.tsx`, `src/api/posts.ts`, `src/screens/FeedDetailScreen.tsx`, `src/screens/NotificationScreen.tsx`, `README.md`, `tests/auth.test.ts`, `package.json`, `tsconfig.json`

## 변경 내용

이 레포는 학습 증빙용이다. 코드를 열어본 사람이 바로 발견할 정확성 버그 4건만 고쳤다. 접근성, API 응답 zod 검증, CI, 토큰화 같은 나머지 품질 항목은 학습 증빙 범위 밖이라 하지 않았다.

## 주요 구현 사항

1. **Rules of Hooks 위반** (`FeedDetailScreen`): `if (!id) return`이 `useQueryClient`/`useQuery` 앞에 있었다. 가드를 모든 훅 호출 뒤로 옮기고 `useQuery`에 `enabled: !!id`를 추가했다.
2. **콜드 스타트 딥링크 위치** (`NotificationScreen` → `App.tsx`): 처리가 그 화면 안에 있어서, 화면이 마운트되기 전에 탭한 알림은 유실되고 재마운트하면 같은 URL을 중복으로 열었다. `useLastNotificationResponse`를 앱 최상단으로 옮겼다. `isReady` 이후에만 열어서 `NavigationContainer`의 linking 구독이 먼저 붙어 있게 했다. `useLastNotificationResponse`는 실행 중 탭도 돌려주기 때문에 `addNotificationResponseReceivedListener`는 제거했다. 리스너와 훅을 같이 쓰면 실행 중 탭이 두 번 열린다.
3. **로그아웃 캐시 이월** (`App.tsx`): `signOut`이 `auth.ts`의 `logout()`을 호출하지 않았고 쿼리 캐시도 지우지 않았다. 이제 `logout()`과 `queryClient.clear()`를 호출한다. 영속 캐시와 대기 중인 오프라인 좋아요 큐도 함께 비워진다.
4. **오프라인 재생 좋아요 롤백** (`posts.ts`): `setMutationDefaults`에 `onError`를 추가했다. 재시작 후 재생된 뮤테이션에는 컴포넌트와 `onMutate` 컨텍스트가 없어 화면 쪽 `onError`가 돌지 않는다. 그래서 토글 직전 값인 `!next`로 되돌린다. 화면이 마운트돼 있으면 화면의 `onError`가 기본값을 덮어써서 스냅샷으로 복구한다.
5. **부수 작업**: `README.md`(학습 목적, 모의 서버 전제, 소재별 코드 경로, 한계), `typecheck`/`test` 스크립트, `tests/auth.test.ts`(동시 401에서 갱신 1회 검증, `node:test` 사용이라 의존성 추가 없음), `@types/node` devDependency와 `tsconfig`의 `types: ["node"]`·`allowImportingTsExtensions`.

## 동작이 바뀌는 부분

- 알림 탭 딥링크는 어느 화면에서든 동작한다. 같은 알림이 중복으로 열리지 않는다.
- 로그아웃하면 대기 중이던 오프라인 좋아요가 폐기된다.
- 오프라인 재생 중 좋아요가 실패하면 화면 값이 `!next`로 되돌아간다.

## 한계

- 오프라인에서 같은 글을 여러 번 토글한 경우의 재생 순서 꼬임은 처리하지 않았다.
- `queryClient.clear()`가 AsyncStorage 영속 캐시에 빈 상태로 반영된다는 점은 라이브러리 동작에 의존하며 시뮬레이터에서는 확인하지 못했다.

## 검증

- `npx tsc --noEmit`: 통과
- `npm test`: 1건 통과
- `npm run lint`: 기존 9 errors(prettier 9건), 2 warnings(no-unused-vars 2건)가 남아 있음 (이번 변경과 무관, 2026-10-20 재측정)
- 시뮬레이터 확인은 아직 안 했음: (a) 앱 종료 후 알림 탭 → 상세 진입, (b) 로그아웃 후 다른 계정 로그인 시 피드 캐시가 비어 있는지, (c) 비행기 모드 좋아요 → 복구 후 반영 또는 실패 시 롤백

## 관련 커밋

bf2d50f (README.md는 미추적)
