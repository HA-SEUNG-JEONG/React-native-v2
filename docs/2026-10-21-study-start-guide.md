# 내일부터의 학습 시작 가이드

**작성일**: 2026-10-21 (수) · **시작일**: 2026-10-22 (목)
**유형**: 학습 계획
**기준 브랜치**: `improve/missions` (HEAD `9e389da`)
**일자별 상세**: [study/README.md](./study/README.md) (Day 1~35, 하루 한 장 카드. Day 1 = 10/24)
**관련 문서**: [react-native-curriculum.md](./react-native-curriculum.md) · [improve/README.md](./improve/README.md) · [p1~p7 study-guide](./p1-study-guide.md)

> 이 문서는 `src/`, `App.tsx`, `tests/` 전체(약 2,300줄)를 직접 읽고 기존 docs와 대조해 만들었다. 시뮬레이터 실행은 하지 않았다.
> 시간 배분은 커리큘럼의 "주 5~10h"를 기준으로 하루 1.5~2h로 가정했다. 실제 가용 시간이 다르면 일 단위 칸수만 늘리거나 줄이면 된다.

---

## 1. 지금 어디에 있나

| 항목 | 상태 |
|------|------|
| P1~P7 구현 (W1~W20) | 완료. 코드는 `src/`에 누적됨 |
| P1~P7 학습 가이드 | 7개 작성 완료. 복습 체크리스트 총 114항목 (P1 11 · P2 8 · P3 8 · P4 8 · P5 55 · P6 16 · P7 8) |
| 퀴즈 기록 | **P1만 있음** (2026-08-28, 11문항 중 완전정답 3). P2~P7은 아직 퀴즈 기록 없음 |
| P8 (출시) | 미착수. 커리큘럼상 W21~24 (빌드 → 스토어 → Sentry → OTA) |
| 개선 미션 21개 (Tier 1/2/3) | 가이드는 작성 완료, **진행 0개**. `docs/improve/reviews/`도 아직 없음 |
| 작업 트리 | `README.md`만 staged (`A`). 나머지는 clean |

정리하면 "구현은 P7까지 끝났고, 이해 검증과 품질 개선이 아직 시작 전"인 상태다. 그래서 다음 단계는 새 기능(P8)이 아니라 **이미 만든 코드를 다시 읽고, 미션으로 직접 고쳐 보며 이해를 굳히는 것**이다. P8은 Tier 1~2가 끝난 뒤 들어가는 편이 맞다. 출시 대상 코드가 버그를 안고 있으면 P8 내내 같은 문제를 다시 만난다.

### P1 퀴즈에서 나온 약점 (공부 방식에 반영)

- "무엇"은 맞히는데 "왜"를 못 댄다 (1번, 7번). → 코드를 읽을 때마다 **"이게 없으면 무슨 증상이 나나?"** 를 한 문장으로 말해 본다.
- 그럴듯한 오답에 낚인다 (2번). → 원인 후보를 두세 개 적고 **순서를 매긴 뒤** 확인한다.
- 가이드 뒷부분 세부 절이 약하다 (§2-1, §3-1, §4, §6). → 새 챕터를 시작하기 전에 해당 절만 먼저 다시 본다.

---

## 2. 코드 지도

```
index.ts                 registerRootComponent(App)
App.tsx          130줄   트리 최상단 배선 + 부팅 + 알림 탭 딥링크
src/
  auth/AuthContext.tsx    22   Auth 타입 + Context (값은 App.tsx가 만들어 주입)
  navigation/
    types.ts              24   네비게이터별 ParamList
    index.tsx            184   Auth/Root/Tab/Home 네비게이터 + linking(딥링크 매핑)
  api/
    auth.ts               96   모의 세션, 401 → refreshInFlight 공유
    network.ts            98   withRetryBackoff, 업로드 진행률, WebSocket
    posts.ts             151   queryClient, 무한스크롤 훅, 낙관적 삭제, 오프라인 좋아요 큐
    persist.ts            10   AsyncStorage persister
  components/
    Btn.tsx               33   공용 버튼
    SwipeableRow.tsx      68   Pan + LongPress 경쟁(Gesture.Race)
    FeedSkeleton.tsx      44   Reanimated shimmer
  screens/                     (아래 표)
  theme/styles.ts        142   colors + 공용 StyleSheet
tests/auth.test.ts        16   동시 401 → 갱신 1회
```

### 파일 → 개념 → 학습 가이드 → 관련 미션

미션 열은 `docs/improve/README.md`의 위치 필드를 기준으로 했다.

| 파일 | 핵심 개념 | 학습 가이드 | 관련 미션 |
|------|-----------|-------------|-----------|
| `App.tsx` | 부팅 플래시 방지(`isReady`), SecureStore 영속, `useLastNotificationResponse`, `PersistQueryClientProvider` + `resumePausedMutations` | P3 §3, P5 W13·W14, P6 W17 | 1-4, 1-5, 1-6 |
| `navigation/index.tsx` | 인증 게이트 = 네비게이터 교체, 중첩 네비게이터, `linking.config`가 트리 깊이를 따름 | P3 §1~§6 | 1-5, 2-10, 3-1 |
| `api/auth.ts` | 토큰 갱신 레이스, Promise 공유(dedupe) | P6 W15 | 1-6, 2-4, 2-11 |
| `api/network.ts` | 지수 백오프 + jitter, `createUploadTask`(legacy), WebSocket | P6 W16 | 2-5, 2-11, 3-1 |
| `api/posts.ts` | 무한스크롤 2차원 캐시, `setMutationDefaults`, 낙관적 업데이트 + 롤백, `onlineManager`/`focusManager` | P4, P6 W17 | 1-4, 2-2, 2-3, 2-4, 2-11, 3-1 |
| `FeedListScreen.tsx` | FlatList(무한스크롤·RefreshControl·`recyclingKey`), 4상태, 바텀시트, 스와이프 삭제 | P4, P7 | 1-2, 2-7, 3-2, 3-3 |
| `FeedDetailScreen.tsx` | `useQuery` + 낙관적 좋아요, `useMutationState`로 오프라인 대기 표시 | P3 §2·§6, P6 W17 | 2-3 |
| `FeedSectionsScreen.tsx` | SectionList, `groupByTens` | P4 | 2-11, 3-2 |
| `SwipeableRow.tsx` | `Gesture.Race`, `activeOffsetX`, `runOnJS` | P7 | 1-2, 3-3 |
| `NetworkScreen.tsx` | 인터셉터 데모, 재시도, 업로드, WebSocket 수명주기 | P6 W15·W16 | 1-1, 2-6 |
| `LocationScreen.tsx` | 권한 scope, 좌표 실패 경로, `react-native-maps` | P5 W12 | 1-3, 2-5, 2-6 |
| `PhotoScreen.tsx` | 권한 4단계 플로우, `canceled` vs 거부, 공유 | P5 W11·W14 | 2-6 |
| `NotificationScreen.tsx` | 알림 권한(훅 없음), Android 채널, 예약 + `data.url` | P5 W14 | 2-6, 3-2 |
| `LoginScreen.tsx` | react-hook-form + zod, KeyboardAvoidingView | P6 W15 | 2-8, 2-10 |
| `ProfileScreen.tsx` | 로그아웃 = 스택 언마운트 | P3 §3 | 2-8, 2-10 |
| `ComposeScreen.tsx` | 모달, 키보드 대응, SafeArea | P2 §5·§6, P3 §4 | 2-8, 3-2 |
| `Btn.tsx`, `theme/styles.ts` | 스타일 배열(cascade 대용), 토큰 | P1 §3-1·§4, P2 §8 | 2-8, 3-1, 3-2 |

---

## 3. 먼저 머릿속에 넣을 흐름 3개

코드를 파일 단위로 읽기 전에, 파일을 가로지르는 흐름 3개를 먼저 잡는다. 미션 21개의 대부분이 이 흐름 위에 있다.

### 흐름 A — 부팅과 인증

1. `App`이 마운트되면 `SecureStore`에서 `auth_user`를 읽는다. 끝나기 전에는 `isReady=false`라서 빈 화면만 그린다.
2. `isReady` 이후 `AuthContext.Provider`가 `user`를 내려주고, `RootNavigator`가 `user == null`이면 `AuthStack`, 아니면 `RootStack(Tabs + Compose 모달)`을 렌더한다.
3. 로그인은 두 갈래다. `login()`(`api/auth.ts`, 메모리 세션 토큰)과 `signIn()`(`App.tsx`, SecureStore에 이름 저장). **서로 다른 저장소를 쓴다.** 이 불일치가 어디서 문제가 되는지 찾아보는 것이 미션 1-6이다.
4. 로그아웃(`signOut`)은 `logout()` + `queryClient.clear()` + `setUser(null)` + SecureStore 삭제.

### 흐름 B — 데이터와 오프라인

1. `queryClient`(`posts.ts`)가 `PersistQueryClientProvider`를 통해 AsyncStorage에 영속화된다. `maxAge`는 `App.tsx`에서 24시간.
2. `usePostsInfinite`가 `["posts"]` 캐시를 만들고, FeedList와 FeedSections가 같은 캐시를 공유한다.
3. 스와이프 삭제(`useDeletePost`)는 `["posts"]`의 2차원 `pages`에서 항목을 빼고 실패 시 스냅샷으로 되돌린다.
4. 좋아요는 `setMutationDefaults(TOGGLE_LIKE_KEY)`로 `mutationFn`을 등록해 둬서, 오프라인에서 paused된 뮤테이션이 재시작 후에도 재생된다. 재생은 `onSuccess={resumePausedMutations}`가 트리거한다.

### 흐름 C — 알림 탭 → 딥링크

1. `NotificationScreen`이 `data.url = createURL("/feed/1")`인 알림을 예약한다.
2. 사용자가 탭하면 `App.tsx`의 `useLastNotificationResponse()`가 (cold start든 실행 중이든) 응답을 돌려주고, `isReady` 이후 `Linking.openURL(url)`을 호출한다.
3. `NavigationContainer`의 `linking.config`가 URL을 `Tabs > HomeTab > FeedDetail(id)`로 해석한다.
4. 로그아웃 상태에서는 `AuthStack`만 마운트돼 있어 매칭할 화면이 없다. 이때 링크가 어떻게 되는지가 미션 1-5다.

---

## 4. 학습 루프 (모든 날 공통)

한 미션은 아래 순서로 끝낸다. 힌트온리 규칙에 따라 Claude는 정답 코드를 주지 않고, 코드는 직접 타이핑한다.

1. **읽기 (20~30분)**: 해당 흐름의 코드를 읽고, 위 지도의 학습 가이드 절을 본다. 새 챕터 전에 `p*-study-guide.md`의 복습 체크리스트 해당 항목을 먼저 소리 내어 답해 본다. 막힌 항목만 본문으로 간다.
2. **재현 (10~20분)**: 미션 문서의 재현 절차를 시뮬레이터에서 먼저 실행한다. 증상을 눈으로 본 뒤에 고친다. 📱 표시 미션은 실기기가 필요한 부분을 따로 둔다.
3. **직접 수정**: 막히면 `힌트 1`(방향) → `힌트 2`(API) → `힌트 3`(함정) 순서로 한 단계씩만 올린다. "정답 보여줘"는 하지 않는다.
4. **검증 4종**: `npm run typecheck` · `npm test` · `npx eslint .` · 같은 재현 절차 재실행. 시작 전 `nvm use 22.21.1`.
5. **리뷰 요청**: 파일 경로와 함께 코드를 붙여넣거나 `리뷰해줘 N-N`.
6. **기록**: `docs/improve/reviews/N-N.md`에 "내 코드 → 문제점 → 정답 → 암기 고리 → 가이드 근거" 순서로 쓴다. ⚠️ 미션(1-5, 2-3, 3-2)은 상단에 `⚠️ 동작 변경`과 변경 전후를 적는다. 완료 후 `/doc`.
7. **말로 설명**: 끝나면 "이 버그가 왜 났고, 고치지 않으면 어떤 증상인가"를 두 문장으로 말한다. 못 하면 완료로 치지 않는다.

`docs/improve/reviews/`는 첫 리뷰 때 만들면 된다.

---

## 5. 일정

### 1주차 (10/22 ~ 10/28) — 지도 만들기 + Tier 1 (버그 6개)

Tier 1은 서로 독립이라 순서가 자유롭다. 아래는 **학습 의존성** 기준 순서다 (쉬운 것 → 흐름 A → B → C).

| 일 | 날짜 | 읽기 | 미션 | 말로 설명할 것 |
|----|------|------|------|----------------|
| 1 | 10/22 목 | 환경 확인(`npm ci`, `typecheck`, `test`, Expo Go 실행) → 흐름 A, `App.tsx`·`AuthContext`·`navigation/` → P3 §0~§3 | **2-1** (워밍업, lint 정리) → **1-3** (가장 쉬움) | `isReady`가 없으면 부팅 때 무슨 화면이 보이나? 인증 게이트를 `if (!user) redirect`가 아니라 네비게이터 교체로 하는 이유는? |
| 2 | 10/23 금 | 흐름 A 이어서 `api/auth.ts`·`tests/auth.test.ts`·`LoginScreen` → P6 W15 | **1-6** | `refreshInFlight`가 없으면 동시 401 3건에서 `refreshCount`는? `login()`과 `signIn()`이 따로 노는 지점은? |
| 3 | 10/24 토 | `NetworkScreen`·`api/network.ts` → P6 W16 | **1-1** | `close()`를 호출한 시점과 `onClose`가 불리는 시점이 왜 다른가? `manualCloseRef`는 무엇을 구분하나? |
| 4 | 10/25 일 | 흐름 B 전반: `posts.ts`·`FeedListScreen`·`SwipeableRow` → P4, P7 | **1-2** | `Gesture.Race`에서 pan이 이기면 longPress는 어떻게 되나? 삭제가 무시되면 행의 위치는 누가 책임지나? |
| 5 | 10/26 월 | 흐름 C: `App.tsx` 딥링크 effect, `linking.config`, `NotificationScreen` → P3 §6, P5 W14 | **1-4** | 외부에서 오는 URL과 `data.url`을 왜 그대로 믿으면 안 되나? |
| 6 | 10/27 화 | 1-4와 같은 파일 | **1-5** (⚠️ 동작 변경, 📱 cold start는 실기기) | 로그아웃 상태 cold start 링크가 지금 유실되는 경로는? 로그인 후 재적용하면 사용자 눈에 무엇이 달라지나? |
| 7 | 10/28 수 | 여유일 | **Tier 1 종료 절 작성**: 종합 약점 패턴 + 재복습 일정 (README §5) | 6개 버그의 공통점은? (예: "정리 요청과 정리 완료는 다른 시점") |

1-4와 1-5는 URL 검증이 겹친다. 1-4를 풀 때 1-5까지 염두에 두고 설계하면 중복이 줄어든다.

### 2주차 (10/29 ~ 11/4) — Tier 2 전반 (캐시 · 에러 · 권한)

선행 관계를 지킨다. `2-2 → 2-3`, `2-2 → 2-7`, `2-4 → 2-5`. 2-4는 선행이 없고 에러 모델의 기반이라 **맨 앞**에 둔다.

| 일 | 날짜 | 미션 | 메모 |
|----|------|------|------|
| 8 | 10/29 목 | 2-4 HttpError | `as Error` 캐스트를 `instanceof`로 |
| 9 | 10/30 금 | 2-2 queryClient 설정 | `gcTime`과 persist `maxAge`의 관계. `App.tsx`의 `maxAge`와 같이 본다 |
| 10 | 10/31 토 | 2-3 useDeletePost 정리 ⚠️ | 동작이 바뀐다. 변경 전후를 기록에 적는다 |
| 11 | 11/1 일 | 2-7 FeedList 에러 + 캐시 공존 | 2-2 이후 |
| 12 | 11/2 월 | 2-5 withRetryBackoff 개선 | 2-4 이후 |
| 13 | 11/3 화 | 2-6 권한·미디어 try/catch 📱 | 카메라는 실기기 |
| 14 | 11/4 수 | 버퍼 + 2주차 점검 | |

### 3주차 (11/5 ~ 11/11) — Tier 2 후반 + Tier 3 시작

| 일 | 날짜 | 미션 | 메모 |
|----|------|------|------|
| 15 | 11/5 목 | 2-8 접근성 | 3-2의 선행 |
| 16 | 11/6 금 | 2-9 의존성·설정 | 독립 |
| 17 | 11/7 토 | 2-10 타입 보강 | 독립 |
| 18~19 | 11/8~9 | 2-11 테스트 확장 (2일) | 2-3, 2-5 이후. `auth.test.ts`의 4초 sleep 제거 포함 |
| 20 | 11/10 화 | **Tier 2 종료 절 작성** + 퀴즈 | |
| 21 | 11/11 수 | 3-1 색상·URL 상수화 | 선행 없음 |

### 4주차 (11/12 ~ 11/18) — Tier 3: 정리와 측정

3-2, 3-3은 각각 하루를 넘기는 미션이라 이틀씩 배정했다. 처음 계획은 3주차에 Tier 3 전체를 넣었으나 과밀해 4주차로 옮겼다.

| 일 | 날짜 | 미션 | 메모 |
|----|------|------|------|
| 22 | 11/12 목 | 3-4 잔여 정리 | 선행 없음 |
| 23~24 | 11/13~14 | 3-2 중복 추출 ⚠️ (2일) | 3-1, 2-8 이후. 1일차 조사·설계, 2일차 구현 |
| 25~26 | 11/15~16 | 3-3 측정 후 re-render 최적화 (2일) | 3-2 이후. 1일차는 **Profiler 측정만**, 2일차에 가설 → 수정 → 재측정. README의 한계 절 문구 갱신은 사용자가 직접 |
| 27 | 11/17 화 | **Tier 3 종료 절 작성** + P8 준비 읽기 | |
| 28 | 11/18 수 | 버퍼 | 비면 P8을 하루 앞당겨도 된다 |

### 5주차 이후 — P8(출시)로 이동 (11/19 목부터)

Tier 1~3 종료 후 커리큘럼의 P8에 들어간다.

- W21 빌드: `eas build`, `app.config`, 아이콘/스플래시, 버전, 환경/시크릿
- 이때 `persist.ts` 주석에 적힌 대로 Expo Go → dev build 전환과 **MMKV 교체**를 함께 한다
- 이후 W22 iOS 출시, W23 Android + Sentry, W24 OTA

P8 전에 `app.json`(2-9에서 다룸)이 정리돼 있어야 빌드 설정이 덜 흔들린다.

---

## 6. 퀴즈와 재복습

- **P1 재복습이 이미 늦었다.** 2026-08-28 기록의 1차 재복습 기한(3일 내)이 지났다. [Day 7](./study/day-07.md)(10/30)에서 P1 §2-1, §3-1, §4, §6을 먼저 훑고, 4·5·8·9·10번을 말로 답해 본다.
- P2~P7은 퀴즈 기록이 없다. 각 Tier 종료 후 해당 Phase 체크리스트로 퀴즈를 보고, `AGENTS.md`의 형식(문항별 상세 → 종합 약점 패턴 → 재복습 일정)으로 `/doc` 기록한다. 요약 표만 쓰지 않는다.
- **P5 가이드는 65KB, 체크리스트 55항목이다.** 통독하지 말고 체크리스트로 답이 막힌 항목의 절만 찾아 읽는다.

---

## 7. 막힐 때와 주의

- Expo SDK 54 문서 링크(`docs.expo.dev/versions/v54.0.0/`)는 최신 문서로 리다이렉트된다. 미션 가이드가 걸어 둔 GitHub `sdk-54` 브랜치 원문을 우선한다.
- 미션 문서의 라인 번호는 작성 시점 스냅샷이다. Tier 1을 고치면 밀리므로 `grep -n`으로 다시 찾는다.
- 미션 가이드의 재현 절차는 작성 시점에 시뮬레이터에서 실행하지 않은 코드 추적 결과다. 재현이 문서와 다르면 문서가 틀렸을 수 있으니, 그 사실 자체를 기록해 둔다.
- 컨텍스트가 80%를 넘으면 완료 단위로 커밋하고 `/compact` 후 `--continue`로 이어간다.
- 범위를 지킨다. 미션 대상이 아닌 파일은 고치지 않는다.

---

## 8. 내일 아침 첫 30분

1. `git status --short --branch`로 `improve/missions`인지 확인한다. `README.md`가 staged 상태이니 의도한 것인지 본다.
2. `nvm use 22.21.1` → `npm ci` → `npm run typecheck` → `npm test` (약 5초).
3. `npx expo start` → 시뮬레이터에서 로그인(비밀번호 `1234`) → 홈의 버튼 6개를 하나씩 눌러 본다.
4. P1 §2-1, §3-1, §4, §6을 훑는다.
5. `App.tsx`를 위에서 아래로 한 번 읽고, 흐름 A의 4단계를 보지 않고 말해 본다.
6. 미션 2-1(`npx eslint . --fix`)로 첫 승리를 챙긴다.
