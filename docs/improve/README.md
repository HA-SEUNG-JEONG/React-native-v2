# 코드 개선 미션

> 출처: 코드 리뷰 기반 개선 미션 (학습 레포 `React-native-v2`)
> 기준 브랜치: `improve/missions`
> 기준 환경: Expo SDK 54 / RN 0.81

P1~P7 학습 Phase와 이름이 겹치지 않도록 이 미션은 **Tier 1 / 2 / 3**으로 부른다.

---

> **⚠️ 브랜치 `improve/missions-empty`**: 미션 대상 코드를 비웠다. 비운 자리에는 `// TODO(미션 N-N): 힌트` 주석이 있다 (`grep -rn "TODO(미션" src App.tsx`). 이 문서의 줄 번호와 "현재 코드" 설명, 재현 절차는 **원본(`improve/missions`) 기준**이라 이 브랜치에서는 그대로 재현되지 않는다. 원본은 `git show improve/missions:<경로>`로 볼 수 있지만, 정답을 미리 보지 않으려면 열지 않는다.
> 비운 곳: 1-1 `NetworkScreen` effect, 1-2 `SwipeableRow`·`FeedListScreen` 삭제 핸들러, 1-4/1-5 `App.tsx` 알림 링크, 1-4 `fetchPost`, 1-6 `logout`, 2-3 `useDeletePost`, 2-5 `withRetryBackoff`·`LocationScreen` 타임아웃, 2-7 `FeedListScreen` isError 분기. 나머지 미션(1-3, 2-1, 2-2, 2-4, 2-6, 2-8~2-11, 3-x)은 "없는 코드를 추가"하거나 기존 코드를 고치는 작업이라 그대로 뒀다.

## 1. 진행 방식

### 힌트온리 규칙

- Claude는 정답 코드를 주지 않는다. 코드는 사용자가 직접 타이핑한다.
- 사용자가 "직접 수정해줘"라고 명시했을 때만 Claude가 코드를 작성한다.
- 정답은 미션 리뷰가 끝난 뒤 `reviews/` 기록에서만 공개한다.

### 힌트 단계

막히면 낮은 단계부터 요청한다. 한 번에 한 단계씩 올린다.

| 단계 | 내용 | 예시 |
|------|------|------|
| 힌트 1 | 방향: 어디를 봐야 하는지 | "effect가 정리될 때 무엇이 호출되는지 확인해 보세요." |
| 힌트 2 | API: 써야 할 API나 패턴 이름 | "`useEffect`의 cleanup 함수를 찾아보세요." |
| 힌트 3 | 함정: 흔한 실수와 주의점 | "비동기 콜백이 언마운트 후 실행되는 경우를 생각해 보세요." |

### 요청 방법

| 목적 | 입력 예시 |
|------|-----------|
| 리뷰 | 코드를 붙여넣는다 (파일 경로 포함), 또는 `리뷰해줘 1-1` |
| 힌트 | `힌트 2`, 또는 `1-1 힌트 2` |
| 직접 수정 | `1-1 직접 수정해줘` |

---

## 2. 파일 구성

| 경로 | 내용 |
|------|------|
| `docs/improve/README.md` | 진행 방식, 미션 목록, 공통 검증 (이 파일) |
| `docs/improve/tier1-bugs.md` | Tier 1 (버그) 미션별 상세 |
| `docs/improve/tier2-quality.md` | Tier 2 (품질) 미션별 상세 |
| `docs/improve/tier3-cleanup.md` | Tier 3 (정리) 미션별 상세 |
| `docs/improve/reviews/` | 미션별 리뷰 기록 |

---

## 3. 미션 목록

표기: `위치` 는 수정 대상 파일, `선행` 은 먼저 끝나야 할 미션이다.
⚠️ 는 동작이 바뀌는 미션, 📱 는 시뮬레이터로 검증할 수 없는 부분이 있는 미션이다(괄호 안에 어느 부분인지 적는다).

### 권장 진행 순서

1-x는 서로 독립적이라 어느 순서든 가능하다. Tier 2는 2-1 워밍업부터 시작하고 각 미션의 선행 표시를 지킨다. Tier 3은 선행이 없는 3-1, 3-4부터 시작하고, 3-2는 3-1과 2-8 이후, 3-3은 3-2 이후에 진행한다.

### Tier 1 버그

- [ ] 1-1 WebSocket 언마운트 후 재연결 누수, 언마운트 후 setState · 위치: `src/screens/NetworkScreen.tsx:105-143` · 선행: 없음
- [ ] 1-2 삭제가 무시되면 SwipeableRow가 화면 밖에 남음 (isPending 가드) · 위치: `src/screens/FeedListScreen.tsx:178`, `src/components/SwipeableRow.tsx:36-43` · 선행: 없음
- [ ] 1-3 LocationScreen의 스타일 없는 Text (다크 배경에서 안 보임) · 위치: `src/screens/LocationScreen.tsx:93` · 선행: 없음
- [ ] 1-4 딥링크 id 검증/인코딩, 알림 data.url 검증 · 위치: `src/api/posts.ts:42`, `App.tsx:53-58` · 선행: 없음 · 📱 일부 (원격 푸시 end-to-end만 실기기. 로컬 5초 알림은 시뮬레이터 가능)
- [ ] 1-5 ⚠️ 동작 변경: 로그아웃 상태 cold start 알림 딥링크 유실, 로그인 후 재적용 · 위치: `App.tsx:53-58`, `src/navigation/index.tsx:153` · 선행: 없음 · 📱 일부 (cold start 재현만 실기기)
- [ ] 1-6 logout()이 loginInFlight, refreshCount를 리셋하지 않음 / 재시작 후 session=null과 user 복원 불일치 · 위치: `src/api/auth.ts:17,30`, `App.tsx:40` · 선행: 없음

### Tier 2 품질

- [ ] 2-1 eslint --fix로 prettier 9건 정리 + unused 2건 (워밍업) · 선행: 없음
- [ ] 2-2 queryClient: gcTime >= persist maxAge(24h), retry/staleTime, queryFn에 signal 전달 · 선행: 없음
- [ ] 2-3 ⚠️ 동작 변경: useDeletePost의 cancelQueries 후 스냅샷, onSettled invalidate, `["post", id]` 캐시, any를 `InfiniteData<Post[]>`로 · 선행: 2-2
- [ ] 2-4 HttpError 클래스 도입, `as Error`와 `Error & {status}` 캐스트 제거 (instanceof 패턴) · 선행: 없음
- [ ] 2-5 withRetryBackoff: 4xx 비재시도, cause 보존, AbortSignal. LocationScreen Promise.race 타이머 clearTimeout · 선행: 2-4
- [ ] 2-6 권한·미디어 호출 try/catch (Notification, Photo, Network assets[0]), permissionError 렌더 · 선행: 없음 · 📱 일부 (카메라)
- [ ] 2-7 FeedList isError + 캐시 데이터 공존 시 목록 유지 · 선행: 2-2
- [ ] 2-8 접근성: Btn role/label/state, hitSlop, TextInput label · 선행: 없음
- [ ] 2-9 의존성·설정: `@react-navigation/elements` 명시, 미사용 expo-status-bar, eslint-config-prettier(현재 중복 선언 없음, 확인용), engines, app.json 플러그인·권한 문구·userInterfaceStyle · 선행: 없음
- [ ] 2-10 타입 보강: RootParamList 전역 선언, tabsScreenOptions 타입, import type, 죽은 try/catch (Login, Profile) · 선행: 없음
- [ ] 2-11 테스트 확장: groupByTens 분리 후 단위 테스트, withRetryBackoff fake timers, getNextPageParam, 낙관적 롤백. auth.test.ts의 4초 sleep 제거 · 선행: 2-3, 2-5

### Tier 3 정리

- [ ] 3-1 색상 hex(`#8a92a6` 10줄(주석 포함 11회), `#93c5fd` 9회)를 colors 토큰으로, URL을 상수/설정으로 · 선행: 없음
- [ ] 3-2 ErrorView, 무한스크롤 footer, PermissionBlockedNotice 추출. ComposeScreen의 Pressable을 Btn으로 대체. Notification 권한 함수 중복 제거 · 선행: 3-1, 2-8 · ⚠️ 동작 변경 (미세: Android ripple)
- [ ] 3-3 re-render: React Profiler로 먼저 측정한 뒤 renderItem/SwipeableRow memo, 로그 상한, AuthContext 분리. 사용자가 루트 README.md 한계 절의 성능 관련 문구(`:28`)를 갱신 · 선행: 3-2
- [ ] 3-4 잔여 정리: console.log, AuthContext 기본값, import 순서, Splash, CI 워크플로 · 선행: 없음

---

## 4. 환경 / 검증 공통

### 실행 전

```bash
nvm use 22.21.1
```

### 미션마다 실행

```bash
npm run typecheck   # tsc --noEmit
npm test            # node --test "tests/*.test.ts"
npx eslint .
npm start           # 개발 서버 실행 후 `i` 키로 iOS 시뮬레이터에서 재현
```

- 시뮬레이터에서 재현하는 절차를 먼저 적고, 수정 후 같은 절차로 다시 확인한다.
- **실기기 필요**: 푸시 알림 수신, 카메라 등 시뮬레이터로 검증할 수 없는 미션이다. 이 미션은 시뮬레이터 검증을 생략하고 실기기에서 확인한다.

---

## 5. 리뷰 기록 규칙

기록 위치: `docs/improve/reviews/` (예: `reviews/1-1.md`)

### 미션별 기록 구조

요약 표만 쓰지 않는다. 아래 순서로 상세히 쓴다.

1. **내 코드**: 원문 그대로
2. **문제점**: 왜 틀렸는지. "결과는 맞는데 이유 누락" 같은 패턴도 적는다.
3. **정답**: 코드 스니펫 포함
4. **암기 고리**: 다음에 헷갈리지 않을 한 줄 비유나 규칙
5. **가이드 근거**: 해당 가이드 절 번호

⚠️ 동작 변경 미션(1-5, 2-3, 3-2)은 기록 상단에 `⚠️ 동작 변경`을 표기하고, 변경 전후 동작을 함께 적는다.

### Tier 종료 시 추가 절

Tier의 마지막 미션 기록 뒤에 아래 두 절을 붙인다.

- **종합 약점 패턴**: 개별 오답 나열이 아니라 공통점을 적는다. 예: "무엇은 맞히는데 왜를 못 댐", "직관적으로 그럴듯한 오답에 낚임".
- **재복습 일정**
  - 1차 (3일 내): 완전히 모른 항목
  - 2차 (1주 내): 부분정답 또는 오답 항목

### 문서화

미션 완료 후 `/doc`을 실행해 `docs/`에 변경 내용을 기록한다.
