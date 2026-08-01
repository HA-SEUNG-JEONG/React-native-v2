# W1–W20 코드 리뷰 수정 기록

> 출처: W1–W20 전체 `src/` 코드 리뷰 (4개 서브시스템 병렬 리뷰, ~39건) 후 전량 수정.
> 검증: `tsc --noEmit` 통과. 프로젝트에 테스트 스위트 없음(커리큘럼 앱) — 수동 스모크로 대체.
> PR: #18–#31 (14개, `main` 기준 브랜치 분리, `fix/screen-login-profile`만 `fix/api-auth-race` 위에 스택).

## api + auth (`src/api/`, `src/auth/`)

- **로그인/재발급 동시성**: `refreshInFlight`를 `logout()`에서도 clear 안 하던 버그. `login()`도 동시 호출 시 상태 덮어쓰기 가능 — refresh와 같은 in-flight promise dedup 패턴 적용.
- **posts 캐시 race**: `onMutate`가 `cancelQueries` 이후에 snapshot을 읽고 있었음 — 순서를 snapshot 먼저로 뒤집음. 이 순서가 틀리면 취소된 요청의 응답이 optimistic 상태를 덮어쓸 수 있음.
- **페이지네이션**: `getNextPageParam`이 `allPages.length + 1`이라 `initialPageParam` 기준을 무시하고 있었음.
- **삭제 후 빈 페이지**: 필터링 없어서 삭제 직후 빈 페이지 헤더가 UI에 노출됨.
- **좋아요 토글**: 캐시에 post 없을 때 조용히 no-op → 명시적 처리(로그 + invalidate)로 변경.
- **네트워크 재시도**: jitter가 고정값이라 backoff 배수와 무관 → backoff 비례로 수정. 마지막 실패 시 원본 에러만 던져서 재시도 횟수 컨텍스트 없던 것도 보강.
- **AuthContext**: `clearPersistError()` 부재 — Profile/Login 화면에서 에러 상태를 못 지우던 문제의 근본 원인.

## 데이터 화면 (Feed*, Compose)

- `data?.pages.flat()`가 매 렌더마다 새 배열 생성 → `useMemo` 적용.
- 시트 닫기 시 `sheetPost` 안 지워지던 버그.
- 스와이프 삭제·시트 삭제 두 경로에 중복 호출 가드 없음 → in-flight 가드 추가.
- `FeedDetailScreen`: `route.params.id` null 가드 없이 바로 사용 → 명시적 "찾을 수 없음" 상태 추가. `as Error` 캐스팅도 안전한 타입 체크로 교체.
- `ComposeScreen`: 이미지 로딩 실패 시 스피너가 무한 대기할 수 있어 타임아웃 폴백 추가. 인라인 스타일/중복 핸들러 정리.

## 디바이스 연동 화면 (Photo/Location/Notification/Network/Login/Profile)

- `PhotoScreen`: `result.assets[0]` 인덱싱 전 length 가드 없음 → 빈 배열일 때 크래시 가능.
- `LocationScreen`: `getCurrentPositionAsync()`에 타임아웃 없어 무한 대기 가능 → `Promise.race`로 15초 제한.
- `NotificationScreen`: 권한 요청 로직이 두 곳에 중복 → 헬퍼로 통합, `getPermissionsAsync()` 에러 처리 추가.
- `NetworkScreen`: WebSocket/타이머가 unmount 시 정리 안 됨(누수), FlatList key가 `prev.length` 기반이라 불안정, `p.ratio`가 [0,1] 범위 밖으로 나갈 수 있었음.
- `LoginScreen`: `login()` 성공 후 `signIn()` 실패 시 에러 처리 없어 auth context가 불일치 상태로 남을 수 있었음.
- `ProfileScreen`: signOut 중복 탭 가능 → 버튼 비활성화, 성공 시 `clearPersistError()` 호출.

## 컴포넌트 + 네비게이션 + 테마

- `#93c5fd` 하드코딩이 `Btn.tsx`와 `theme/styles.ts` 두 곳에 중복 → `colors.ghostText` 토큰으로 통합.
- `SwipeableRow`의 매직넘버(`-80`, `-400`)를 상수로 명명, `Gesture.Race(pan, longPress)` 의도 주석 추가.
- `FeedSkeleton`의 스켈레톤 개수·인라인 스타일을 상수/스타일로 추출.
- `navigation/index.tsx`: 딥링크 설정에 `FeedSections` 라우트 누락, 탭 `screenOptions`가 다른 화면의 stackHeader 패턴과 불일치했던 것 정리.
