# Tier 3 가이드 — 정리

> 출처: [React Native 0.81 profiling](https://reactnative.dev/docs/0.81/profiling) · [React Native DevTools](https://reactnative.dev/docs/0.81/react-native-devtools) · [Performance](https://reactnative.dev/docs/0.81/performance) · [FlatList](https://reactnative.dev/docs/0.81/flatlist) · [Pressable](https://reactnative.dev/docs/0.81/pressable) · [Expo SDK 54 notifications](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/notifications.mdx) · [Expo SDK 54 linking](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/linking.mdx)
> 검증: `improve/missions` 브랜치 현재 코드를 grep/Read로 직접 확인 (RN 0.81 / Expo SDK 54). 라인 번호는 **미션 시작 전 기준**이라 Tier 1·2를 진행하면 밀린다. 작업 직전에 각 미션의 grep 명령으로 다시 확인할 것. docs.expo.dev v54.0.0 URL은 최신 문서로 리다이렉트되므로 SDK 54 원문 링크를 사용한다.

Tier 3은 기능을 바꾸지 않는 정리 단계다. 중복을 걷어내고(3-1, 3-2), **측정한 뒤에만** 최적화하고(3-3), 남은 잔재를 치운다(3-4). 진행 방식과 힌트 단계는 [README.md](./README.md)를 따른다. 정답 코드는 주지 않는다.

| 미션 | 주제 | 선행 |
|------|------|------|
| [3-1](#미션-3-1--색상-hex와-url-상수화) | 색상 hex를 `colors` 토큰으로, URL을 상수로 | 없음 |
| [3-2](#미션-3-2--중복-ui와-로직-추출) | ErrorView, 무한스크롤 footer, PermissionBlockedNotice 추출 등 | 3-1, 2-8 |
| [3-3](#미션-3-3--측정-후-re-render-최적화) | Profiler로 측정 후 memo, 로그 상한, AuthContext 분리 | 3-2 |
| [3-4](#미션-3-4--잔여-정리) | console.log, AuthContext 기본값, import 순서, Splash, CI | 없음 |

---

## 미션 3-1 — 색상 hex와 URL 상수화

선행: 없음

### 1. 증상과 위치

같은 색 리터럴이 파일마다 흩어져 있다. 현재 grep 결과(따옴표 포함 `"#..."` 기준, `src/`와 `App.tsx`):

| 값 | 횟수 | 위치 |
|----|------|------|
| `#8a92a6` | 10 | `src/navigation/index.tsx:37`, `ComposeScreen.tsx:78,89`, `FeedListScreen.tsx:221`, `NetworkScreen.tsx:216`, `LoginScreen.tsx:77,96`, `src/theme/styles.ts:21,36,83` |
| `#93c5fd` | 9 (정의 1 + 사용 8) | 정의 `styles.ts:5`, 사용 `navigation/index.tsx:36`, `FeedSectionsScreen.tsx:36,66`, `ComposeScreen.tsx:134`, `FeedListScreen.tsx:115,116,128`, `FeedDetailScreen.tsx:84` |

- 이미 `src/theme/styles.ts:4-6`에 `colors` 토큰 객체가 있고, 항목은 `ghostText` 하나뿐이다. 사용처는 `Btn.tsx`와 `styles.ts`의 `sectionHeader`.
- `#fff` 9회, `#2b3446` 7회, `#0f1115` 4회 등 다른 값도 반복된다. 이번 미션의 필수 범위는 위 두 색이고, 나머지는 선택이다.
- 하드코딩 URL 5곳:

| 위치 | 용도 |
|------|------|
| `src/api/posts.ts:20` | `API` 상수 (jsonplaceholder). 이미 상수지만 모듈 내부 전용 |
| `src/api/network.ts:57` | 업로드 대상 `https://httpbin.org/post` |
| `src/api/network.ts:92` | WebSocket `wss://ws.postman-echo.com/raw` |
| `src/screens/ComposeScreen.tsx:22` | `AVATAR_SOURCE` (picsum) |
| `src/screens/FeedListScreen.tsx:193` | 썸네일 템플릿 문자열 `https://picsum.photos/seed/${item.id}/100/100` |

재현(변경 전 기준선): `grep -rn "#8a92a6\|#93c5fd" src App.tsx` 결과 줄 수를 기록해 둔다. 이 미션은 화면 모양이 달라지면 안 된다. 시뮬레이터에서 탭바 색, 스피너 색, placeholder 색을 미리 확인해 둔다.


### 2. 왜 문제인가

RN에는 CSS 변수/cascade가 없다. 색을 바꾸려면 리터럴을 전부 찾아 고쳐야 한다. 웹이라면 `:root` 변수나 테마 클래스로 해결하지만, RN은 JS 모듈의 상수가 그 역할을 한다. 그래서 `StyleSheet`뿐 아니라 `placeholderTextColor`, `tintColor`, `ActivityIndicator color`처럼 **style 객체 바깥 props**에 들어간 색이 놓치기 쉽다.

이름 체계가 이미 있다. `ghostText`는 "ghost 버튼 글자색"이라는 **쓰임새** 이름인데, 지금은 스피너·탭 활성색에도 같은 값이 필요하다. 새 토큰을 추가하기 전에 이 이름 체계(쓰임새 기준 vs 의미 기준)를 어떻게 이어갈지 정해야 한다. URL도 같다. 환경별로 바뀌는 값인지, 단순히 한곳에 모으면 되는 값인지 구분한다.

### 3. 공식 문서

- RN 0.81 `StyleSheet`/props 자체는 이 미션에서 새 API가 없다. 대신 [FlatList](https://reactnative.dev/docs/0.81/flatlist)에서 `tintColor`·`colors`가 어느 컴포넌트의 prop인지 확인한다. (`RefreshControl`의 prop 설명 링크는 검증된 목록에 없음. FlatList 문서의 `refreshControl` 항목에서 이동해 확인 필요.)
- Expo 환경변수로 URL을 빼는 방법은 검증된 링크가 없다. 필요하다면 SDK 54 문서에서 직접 확인할 것 (확인 필요).

### 4. 힌트

- **힌트 1 (방향)**: 먼저 `styles.ts`의 `colors`를 읽고, 이름 짓는 규칙을 한 줄로 요약해 본다. 그다음 두 색의 모든 사용처를 style 안/밖으로 나눠 표로 정리한다.
- **힌트 2 (API·패턴)**: 모듈 상수 객체(`as const` 여부), `StyleSheet.create` 안에서 객체 값 참조, URL은 상수 + 필요한 곳만 함수(`(id) => string` 형태)로 분리.
- **힌트 3 (함정)**:
  - `styles.ts` 안의 리터럴(`:21`, `:36`, `:83`)도 대상이다. 토큰 정의가 `StyleSheet.create` 위에 있어야 참조할 수 있다.
  - `ComposeScreen.tsx:78` 주석의 "(#8a92a6 등)"도 grep에 걸린다. 주석을 같이 고칠지 판단.
  - 값은 같아도 의미가 다른 색(예: `#2b3446`은 썸네일 배경, 테두리, ripple에 섞여 있음)을 한 토큰으로 합치면 나중에 따로 못 바꾼다. 필수 범위 밖이면 건드리지 않는 선택도 맞다.
  - `FeedListScreen.tsx:193`은 상수 문자열이 아니라 id가 들어가는 템플릿이다.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npm test
npx eslint .
grep -rn "#8a92a6\|#93c5fd" src App.tsx   # 토큰 정의 외에 남은 곳 없음
grep -rnE "https?://|wss?://" src App.tsx  # URL이 상수 정의부에만 남았는지
```

- 시뮬레이터: 탭바 활성/비활성 색, 피드 pull-to-refresh 색, 로그인·새 글 placeholder 색이 변경 전과 같은지 비교.
- 네트워킹 화면에서 업로드, WebSocket 연결이 계속 동작하는지.

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] RN에서 색이 `StyleSheet` 밖(props)에 들어가는 사례와 이유
- [ ] 토큰 이름을 쓰임새 기준으로 지을 때와 의미 기준으로 지을 때의 차이
- [ ] 환경별로 바뀌는 URL과 단순 중복 URL의 구분

직접 구현했다
- [ ] 두 색의 리터럴이 토큰 정의 한 곳만 남았다
- [ ] 기존 `colors` 이름 체계를 따랐다
- [ ] URL 5곳이 상수/설정으로 모였다
- [ ] 화면 모양 변화 없음 확인

### 7. 흔한 함정

- 정규식 한 번에 치환하다가 `"#fff"` 같은 인접 값이나 주석까지 건드린다.
- 토큰만 추가하고 기존 리터럴을 남겨 두 곳이 어긋난다.
- 토큰을 별도 파일로 뺀 뒤 그 파일이 `styles.ts`나 컴포넌트를 import하면 순환 import가 생긴다 (`Btn.tsx`가 이미 `styles.ts`에 의존).

---

## 미션 3-2 — 중복 UI와 로직 추출

선행: 3-1, 2-8

### 1. 증상과 위치

같은 블록이 여러 화면에 복사되어 있다. 라인은 미션 시작 전 기준이다. 2-6, 2-7, 2-8을 거치면 이동하므로 아래 grep으로 다시 찾는다.

```bash
grep -rn "다시 시도" src
grep -rn "ListFooterComponent" src
grep -rn "openSettings" src
grep -rn "requestPermissionsAsync" src
```

| 중복 | 위치 |
|------|------|
| 에러 화면 (`에러` 제목 + 메시지 + `다시 시도` Btn) | `FeedListScreen.tsx:89-97`, `FeedSectionsScreen.tsx:40-48`, `FeedDetailScreen.tsx:88-98` |
| 무한스크롤 footer (`isFetchingNextPage ? <ActivityIndicator/> : null`) | `FeedListScreen.tsx:125-132`, `FeedSectionsScreen.tsx:64-68` |
| 권한 차단 안내 (`blocked` 문구 + `설정 열기` Btn, `Linking.openSettings()`) | `NotificationScreen.tsx:90-102`, `LocationScreen.tsx:83-92`, `PhotoScreen.tsx:66-78` |
| Notification 권한 요청 함수 두 개 | `NotificationScreen.tsx:39-42` (`requestPermission`), `NotificationScreen.tsx:44-51` (`requestAndSetPermission`) |
| `ComposeScreen`의 수제 버튼 | `ComposeScreen.tsx:122-135` |

차이점도 읽어야 한다.
- 에러 메시지 추출이 다르다. `FeedListScreen.tsx:93`과 `FeedSectionsScreen.tsx:44`는 `(error as Error).message`, `FeedDetailScreen.tsx:93`은 `error instanceof Error ? ... : String(error)`. (2-4가 이 캐스트를 다룬다.)
- 차단 안내 문구는 화면마다 다르고(`알림 권한이...`, `위치 권한이...`, `카메라 권한이...`), 버튼 라벨도 `설정 열기` / `위치 설정 열기`로 다르다.
- footer는 `ActivityIndicator`를 쓰는 곳이 `FeedDetailScreen.tsx:84`, `FeedSectionsScreen.tsx:36`에도 있지만 이쪽은 최초 로딩 스피너라 footer가 아니다.
- `ComposeScreen`의 Pressable(`:122-135`)은 `Btn`과 거의 같지만 `hitSlop`(`:131`), `android_ripple`(`:132`), 글자색 덮어쓰기(`:134`)가 있다. `Btn.tsx`는 `kind="ghost"`일 때 이미 같은 글자색을 준다.

⚠️ 동작 변경 (미세): `Btn`으로 바꾸면 `android_ripple`이 사라질 수 있다 (Android 한정, iOS 영향 없음). 2-8에서 `Btn`에 `hitSlop`이 들어갔다면 그쪽은 유지된다. 유지/제거를 의식적으로 결정하고 기록한다.

Notification 두 함수는 동작이 다르다. 전자는 무조건 요청하고 결과를 반환하지 않으며, 후자는 이미 허용이면 요청을 건너뛰고 boolean을 반환한다. 합칠 때 이 차이가 어느 호출부(`:86`, `:54`, `:64`)에 어떤 영향을 주는지 먼저 표로 적는다.

### 2. 왜 문제인가

같은 UI를 세 곳에 복사하면 문구·접근성·스타일 수정이 세 번 필요하고, 하나만 빠지면 화면끼리 어긋난다. 2-8에서 `Btn`에 접근성 속성을 넣었으므로, 수제 `Pressable`로 남아 있는 버튼은 그 혜택을 못 받는다.

웹과 다른 점: RN에는 스타일 cascade가 없어서 "공용 CSS 클래스"로 중복을 줄일 수 없다. 공용 컴포넌트가 곧 공용 스타일이다. 반대로 과추상화도 경계한다. 문구가 화면마다 다른 `PermissionBlockedNotice`는 어디까지를 props로 열지가 설계 포인트다.

### 3. 공식 문서

- [Pressable](https://reactnative.dev/docs/0.81/pressable): `hitSlop`, `android_ripple` prop 확인.
- [FlatList](https://reactnative.dev/docs/0.81/flatlist): `ListFooterComponent`.
- [Expo SDK 54 linking](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/linking.mdx): 이 프로젝트가 쓰는 `Linking.openSettings()`는 `react-native`의 `Linking`이다 (`NotificationScreen.tsx:2`). `expo-linking`과 어느 쪽 API인지 구분해서 확인. 문서에 `openSettings` 존재 여부는 직접 확인 필요.
- [Expo SDK 54 notifications](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/notifications.mdx): `getPermissionsAsync`, `requestPermissionsAsync`의 반환 형태(`granted`, `canAskAgain`).

### 4. 힌트

- **힌트 1 (방향)**: 세 에러 블록을 나란히 놓고 "똑같은 부분 / 다른 부분"을 적는다. 다른 부분이 곧 props 후보다. 추출 위치는 `src/components/`에 이미 있는 `Btn.tsx`, `FeedSkeleton.tsx`의 모양(파일 하나에 컴포넌트 하나, named export)을 따른다.
- **힌트 2 (API·패턴)**: props 설계(`message`, `onRetry`), `ListFooterComponent`에는 컴포넌트 **요소**를 넘기는 방식(함수도 가능), 권한 안내는 `message`/`label` props. Notification은 "상태 갱신 + 결과 boolean"을 한 함수로 수렴시키는 형태. 호출부에서 반환값이 필요한지 여부가 시그니처를 결정한다.
- **힌트 3 (함정)**:
  - `error`의 타입이 `Error`가 아닐 수 있다. 추출한 컴포넌트가 `unknown`을 받아 어떻게 메시지를 만들지 정한다 (2-4와 충돌하지 않게).
  - footer를 컴포넌트로 만들 때 `isFetchingNextPage`가 false면 `null`을 반환하는 책임을 컴포넌트가 질지 호출부가 질지 한쪽으로 통일.
  - `PermissionBlockedNotice`는 `blocked` 조건(`status?.granted === false && !status.canAskAgain`)도 세 곳에 있다 (`NotificationScreen.tsx:37`, `LocationScreen.tsx:37`, `PhotoScreen.tsx:29`). 조건까지 추출할지는 선택이나, 추출하면 `status` 타입이 훅마다 달라 타입 맞추기가 번거롭다.
  - 2-6이 `permissionError` 렌더를 추가했다면 그 위치와 새 컴포넌트가 겹치지 않는지 확인.
  - `Btn`으로 대체할 때 닫기 버튼이 `kind="ghost"` 맞는지, 글자색이 3-1 토큰을 통해 한 곳에서 나오는지.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npm test
npx eslint .
grep -rn "다시 시도" src        # 에러 화면 정의가 한 곳만
grep -rn "openSettings" src     # 안내 컴포넌트 안에만
```

- 시뮬레이터: 임시로 피드 API URL을 잘못된 경로로 바꿔 4xx/5xx를 유도해 피드 에러 화면 확인(기본 `retry` 3회 뒤 표시, 확인 후 원복) → `다시 시도` 동작. 시뮬레이터에는 비행기 모드가 없고, 오프라인이면 에러가 아니라 쿼리가 pause되어 오프라인 안내가 뜬다. 이어서 피드 끝까지 스크롤해 footer 스피너, Settings 앱에서 알림/위치/카메라 권한을 거부 후 재진입해 안내 표시.
- 📱 카메라 차단 안내는 시뮬레이터에 카메라가 없어 재현이 제한된다. 위치·알림 쪽으로 확인한다 (카메라 경로는 실기기 필요).
- 모달의 `닫기` 버튼 동작·모양이 변경 전과 같은지 (Android ripple 제외).

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] 중복 블록에서 "같은 부분"과 "다른 부분"을 구분한 기준
- [ ] 추출한 컴포넌트의 props가 왜 그 모양인지
- [ ] 추출하지 않고 남긴 것이 있다면 이유

직접 구현했다
- [ ] 에러 화면 3곳을 하나로
- [ ] footer 2곳을 하나로
- [ ] 권한 차단 안내 3곳을 하나로
- [ ] `ComposeScreen`의 `Pressable`을 `Btn`으로 대체
- [ ] Notification 권한 함수 중복 제거 (호출부 3곳 동작 유지)

### 7. 흔한 함정

- 추출하면서 문구를 "통일"해 버려 의도치 않은 화면 변경이 생긴다.
- props가 너무 많아져 호출부가 원래 코드보다 길어진다. 그러면 추출 단위가 잘못된 것이다.
- `Btn`을 쓰면서 `disabled` 스타일이나 `kind` 기본값이 바뀌어 보이는 것을 놓친다.

---

## 미션 3-3 — 측정 후 re-render 최적화

선행: 3-2

핵심 교훈: **측정 없이 `memo`를 붙이지 않는다.** 아래 후보는 "의심 지점"이지 "고칠 지점"이 아니다. Profiler 수치가 문제를 보여 줄 때만 고친다. 측정해 보니 문제가 없다면 "고치지 않음"이 정답이고, 그 기록이 미션 산출물이다.

### 1. 증상과 위치

의심 후보 (코드 기준, 라인은 시작 전 기준):

| 후보 | 위치 | 왜 의심하는가 |
|------|------|---------------|
| `renderItem` 인라인 함수 | `FeedListScreen.tsx:176-212` | 렌더마다 새 함수. 안에서 `SwipeableRow`에 `onDelete`/`onLongPress` 인라인 콜백을 만들어 넘김 (`:178-179`) |
| `SwipeableRow` | `src/components/SwipeableRow.tsx:19-68` | `Gesture.Pan()`/`Gesture.LongPress()`/`Gesture.Race()`를 렌더마다 새로 생성 (`:30-51`, `:63`) |
| 롱프레스 시 목록 전체 재렌더 | `FeedListScreen.tsx:54,58-61` | `setSheetPost`가 화면 상태라 `FlatList`가 있는 `FeedListScreen` 전체가 다시 렌더 |
| 로그 무제한 증가 | `NetworkScreen.tsx:26-27` (`appendLog`), `:224` (`data={logs}`) | `[새 항목, ...prev]`로 계속 쌓임. 상한 없음 |
| `AuthContext` 값 전체가 한 덩어리 | `App.tsx:60-95` (`useMemo`), `src/auth/AuthContext.tsx:5-12` | `user`나 `persistError`가 바뀌면 모든 소비자가 재렌더 |

`AuthContext` 소비자는 3곳이다: `navigation/index.tsx:109` (`user`만), `ProfileScreen.tsx:13` (전부), `LoginScreen.tsx:31` (`signIn`, `persistError`). `App.tsx:94`의 `useMemo` 의존성은 `[user, persistError]`라서 이 둘이 안 바뀌면 값 참조는 안정적이다. 즉 "분리해야 한다"가 아니라 "분리하면 실제로 줄어드는 렌더가 있는가"를 먼저 보는 문제다.

현재 `FeedListScreen.tsx:69`의 `posts`는 이미 `useMemo`다. 그 위에서 `memo`를 쌓을 때 참조 안정성이 어디서 깨지는지가 포인트다.

재현 시나리오(측정용, 3개 이상 정해 놓는다):
1. 피드 목록을 연 직후.
2. 행 하나를 롱프레스해 시트를 열고 닫기.
3. 스크롤로 다음 페이지 로드.
4. 네트워킹 화면에서 `재시도 데모 실행`/WebSocket 송신을 여러 번 눌러 로그를 쌓은 뒤 스크롤.

### 2. 왜 문제인가 (또는 아닌가)

React는 부모가 렌더되면 자식도 기본으로 재렌더한다. `React.memo`는 props 얕은 비교로 이를 건너뛰지만, 비교 자체에도 비용이 있고, 인라인 콜백이나 객체 props가 있으면 매번 새 참조라 건너뛰지 못한다. 그래서 `memo`만 붙여서는 효과가 없는 경우가 많다. 이것이 "측정 먼저"의 이유다.

RN에서 다른 점: 목록은 `FlatList`가 보이는 범위만 렌더하고, JS 스레드가 막히면 프레임이 떨어진다. [Performance](https://reactnative.dev/docs/0.81/performance)는 JS 스레드가 한 프레임 동안 응답하지 못하면 dropped frame이 된다고 설명한다. 또 같은 문서는 **dev 모드에서는 JS 성능이 크게 나빠지므로 release 빌드에서 확인하라**고 한다. 따라서 dev 모드 Profiler 숫자는 절대값이 아니라 "어떤 컴포넌트가 몇 번 다시 그려지는가"의 상대 비교로만 쓴다.

### 3. 공식 문서

- [React Native DevTools](https://reactnative.dev/docs/0.81/react-native-devtools): "React Profiler" 절에 **"The React Profiler panel allows you to record performance profiles to understand the timing of component renders and React commits."** 라고 되어 있다. 같은 문서에 Components 패널도 있다.
- [Profiling](https://reactnative.dev/docs/0.81/profiling): 이 페이지는 Android System Tracing, 네이티브 CPU 핫스팟 중심이며 **React 컴포넌트 렌더 프로파일링은 다루지 않는다.** React 렌더 측정에는 위 DevTools 페이지를 쓴다.
- [Performance](https://reactnative.dev/docs/0.81/performance): JS 프레임레이트, `FlatList` 느릴 때 `getItemLayout`. `React.memo`와 Profiler는 이 페이지에 없다.
- [FlatList](https://reactnative.dev/docs/0.81/flatlist): `renderItem`, 윈도잉 관련 props.

확인 필요 (위 세 페이지에서 확인되지 않았거나 검증 범위 밖):
- React Native DevTools를 여는 방법(단축키/Dev Menu 항목). 페이지 목차는 Core features, React DevTools features, Reconnecting DevTools뿐이다. 열기 절차는 사용자가 직접 문서에서 확인.
- Profiler 패널에서 "왜 렌더됐는가(why did this render)" 정보를 켜는 옵션이 이 환경에서 쓸 수 있는지.
- SDK 54 Expo Go에서 DevTools 연결이 되는지(개발 빌드가 필요한지).
- 코드로 `<Profiler>` 컴포넌트를 감싸는 방법: 검증된 링크 목록에 React 공식 문서가 없어 안내하지 않는다. 필요하면 직접 찾아본다.

### 4. 힌트

작업 순서를 지킨다: **측정 → 가설 → 수정 → 재측정**.

- **힌트 1 (방향)**: 코드를 건드리기 전에 시나리오 1~4를 각각 Profiler로 기록하고, 컴포넌트별 렌더 횟수와 커밋 시간을 표로 남긴다. 가장 비싼 항목이 후보 표의 어느 줄과 맞는지 본다. 맞지 않으면 그 후보는 건드리지 않는다.
- **힌트 2 (API·패턴)**: 측정 도구는 React Native DevTools의 Profiler 패널. 수정 도구는 문제가 확인된 경우에만: `React.memo`, `useCallback`, `renderItem`을 별도 컴포넌트로 분리, 배열 길이 상한(`slice` 등 기존 JS 도구), Context 분리(값/액션 분리 또는 용도별 두 Context).
- **힌트 3 (함정)**:
  - `SwipeableRow`에 `memo`를 붙여도 `FeedListScreen.tsx:178-179`의 인라인 콜백이 그대로면 매번 props가 바뀐다. 반대로 콜백을 안정화해도 `children`(JSX)이 매번 새 요소라 얕은 비교가 실패할 수 있다. 어디서 깨지는지 Profiler에서 확인한다.
  - `Gesture.Pan()` 객체를 렌더마다 새로 만드는 것이 실제로 비싼지는 측정 대상이다. 임의로 `useMemo`를 붙이지 않는다.
  - 로그 상한은 렌더 최적화가 아니라 **메모리 증가 방지**다. 목적이 다르므로 Profiler 없이도 판단할 수 있는 항목이다. 상한 값은 근거와 함께 정한다.
  - `AuthContext` 분리 후에는 `App.tsx:118`의 Provider 구조와 `useAuth` 소비자 3곳이 모두 영향을 받는다. 분리 결과가 측정에서 이득이 없으면 되돌린다.
  - dev 모드의 `StrictMode` 등으로 렌더 횟수가 부풀 수 있다. 이 프로젝트는 `StrictMode`를 쓰지 않는다(`index.ts`, `App.tsx` grep 확인).
  - 최적화 전/후 비교는 같은 시나리오, 같은 순서, 같은 기기 상태로.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npm test
npx eslint .
npm start    # `i` 키로 iOS 시뮬레이터
```

- 시나리오 1~4의 **전/후 Profiler 기록**(렌더 횟수, 커밋 시간)을 `docs/improve/reviews/3-3.md`에 남긴다. 기록 구조는 README의 "리뷰 기록 규칙"을 따른다.
- 수정한 항목마다 "어떤 수치가 이 수정을 정당화했는가"를 한 줄로 쓴다. 수치가 없으면 수정하지 않는다.
- 동작은 그대로여야 한다: 삭제 스와이프, 롱프레스 시트, 무한스크롤이 변경 전과 같은지.

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] `memo`가 막아 주는 것과 막지 못하는 것 (인라인 콜백, `children`)
- [ ] dev 모드 측정값을 어떻게 읽어야 하는지
- [ ] 후보 5개 중 측정으로 문제가 확인된 것/아닌 것

직접 구현했다
- [ ] 측정 표(전)를 먼저 작성했다
- [ ] 측정으로 정당화된 항목만 수정했다
- [ ] 재측정 표(후)를 작성했다
- [ ] 로그 상한을 정했다 (근거 포함)
- [ ] 아래 README 문구를 직접 갱신했다

### README 문구 갱신 (사용자 직접 과제)

프로젝트 루트 `README.md:28`의 "한계" 절에 이렇게 적혀 있다.

> 성능 최적화(`React.memo`, `getItemLayout`)와 접근성은 다루지 않음.

이 줄은 이제 사실과 다르다 (접근성은 2-8, 성능은 이 미션). Claude는 이 문장을 써 주지 않는다. 직접 고친다. 기준:
- 무엇을 다뤘고 무엇을 **여전히 안 다뤘는지** 구분해서 쓴다. 예: `getItemLayout`을 적용하지 않았다면 그대로 남긴다.
- 측정 결과 `memo`를 적용하지 않았다면 "측정 후 불필요 판단"이라고 쓰는 것이 정확하다.
- 이 파일은 현재 git 상태에서 untracked(`?? README.md`)다. 커밋 대상인지 확인 후 진행.

### 7. 흔한 함정

- Profiler를 켜지 않고 "느릴 것 같아서" 먼저 `memo`/`useCallback`을 도배한다.
- 의존성 배열이 틀린 `useCallback`으로 오래된 값을 잡는 버그를 만든다.
- 로그 상한을 두면서 `logIdRef`(`NetworkScreen.tsx:25`) 의미를 깨 key가 겹치게 만든다.
- 측정 환경(dev, 시뮬레이터)과 실제 체감(release, 실기기)을 같은 것으로 취급한다.

---

## 미션 3-4 — 잔여 정리

선행: 없음

현재 코드를 확인했을 때 아래 5개 항목 중 **해당 있는 것과 없는 것**이 갈린다. 없는 항목은 "해당 없음"으로 기록하고 넘어간다.

### 1. 증상과 위치

| 항목 | 현재 상태 | 위치 |
|------|-----------|------|
| console.log | 해당 있음 | 아래 표 |
| AuthContext 기본값 | 해당 있음 | `src/auth/AuthContext.tsx:14-20` |
| import 순서 | 해당 있음 (일부 파일) | `src/navigation/index.tsx:19`, `src/screens/LocationScreen.tsx:1-12` |
| Splash | 해당 있음 (확인 필요 포함) | `app.json:11-15`, `App.tsx:97-103` |
| CI 워크플로 | 해당 있음 (없음을 확인) | `.github/` 디렉터리 자체가 없음 |

**console.\***

| 위치 | 내용 | 비고 |
|------|------|------|
| `FeedListScreen.tsx:34-35` | 포커스/블러 로그 | `useFocusEffect` 학습용 (`docs/p3-study-guide.md:16`, `:111` 참고). 지우면 이 effect 자체가 무의미해지는지 확인 |
| `ComposeScreen.tsx:139` | `저장:` 로그 | 저장 로직이 없어 이 로그가 유일한 동작(뒤이어 `navigation.goBack()`으로 모달만 닫힌다). 줄 끝 주석에 이유가 적혀 있음 |
| `ComposeScreen.tsx:110` | `console.error(error.error)` | 이미지 로드 실패 |
| `src/api/posts.ts:69` | `console.warn` | 캐시에 글이 없을 때 |

`eslint.config.js`에는 `no-console` 규칙이 없다 (`eslint-config-expo` 기본 설정에도 `no-console`은 없다 — `node_modules/eslint-config-expo` grep 0건). 이 4개를 같은 기준으로 분류하는 것이 과제다. "전부 삭제"가 정답이라는 전제는 없다.

**AuthContext 기본값**: `createContext<Auth>({...})`의 기본값이 no-op 함수들이다. `AuthContext.Provider` 밖에서 `useAuth()`를 호출해도 에러 없이 동작하는 척한다. 실제 Provider는 `App.tsx:118`에 하나만 있다.

**import 순서**: 두 곳이 다르다.
- `navigation/index.tsx`는 `react-native` import(`:19`)가 상대경로 import 사이에 끼어 있다.
- `LocationScreen.tsx`는 `react-native`, 상대경로, `expo-location`, 상대경로, `react`, 상대경로, 서드파티가 섞여 있다.
- 이 프로젝트의 다른 파일(`FeedListScreen.tsx`, `NetworkScreen.tsx` 등)은 외부 패키지 → 상대경로 순서다. 이 관례를 따른다.
- `npx eslint src/navigation/index.tsx src/screens/LocationScreen.tsx` 결과는 `LocationScreen.tsx`의 `prettier/prettier` 3건뿐이고, **import 순서 규칙은 걸리지 않는다**. 즉 린터가 잡아 주지 않는 정리다 (prettier 3건은 2-1 범위).

**Splash**
- `app.json:11-15`: splash 배경이 `#ffffff`이고 `userInterfaceStyle`은 `"light"`(`:9`). 앱 화면 배경은 어두운 `#0f1115`다 (`styles.ts`의 `screen`).
- `App.tsx:97-103`: `isReady` 전에는 빈 어두운 `View`만 렌더한다. 네이티브 splash(흰색) → 빈 어두운 화면 → 앱 순으로 이어져 흰색 깜빡임이 있는지 시뮬레이터에서 확인한다.
- `package.json`과 `node_modules`에 `expo-splash-screen`이 **없다**. 코드에서 splash를 제어하는 API는 현재 쓰이지 않는다. splash 제어 방법과 SDK 54에서의 정확한 설정은 검증된 링크가 없다 (확인 필요).
- `app.json`의 `userInterfaceStyle`은 2-9도 다룬다. 같은 줄을 두 미션이 건드리므로 먼저 한 쪽만 정하고 기록한다.

**CI 워크플로**: `ls .github` 결과 없음. 원격은 GitHub(`origin`)이고, 검증 명령은 `package.json`에 이미 있다 (`typecheck`, `test`, `lint`는 `expo lint`). 이 미션은 "없는 것을 만든다"는 점에서 나머지 정리와 성격이 다르다.

재현: 해당 항목은 코드 위치로 확인한다. Splash는 시뮬레이터에서 앱을 완전히 종료한 뒤 cold start 하며 첫 화면 전환을 관찰한다.

### 2. 왜 문제인가

- **console.log**: 개발 중 흔적과 의도된 데모가 섞여 있으면 나중에 구분할 수 없다. 프로덕션 빌드에서 로그가 남는 것, 민감한 값이 찍히는 것이 위험이다. 모바일은 웹처럼 사용자가 콘솔을 열 일이 드물지만, 기기 로그 수집으로 유출될 수 있다.
- **AuthContext 기본값**: Provider 누락을 컴파일러도 런타임도 못 잡는다. 기본값이 "로그아웃 상태 + 아무것도 안 하는 함수"라서 버그가 조용히 묻힌다.
- **import 순서**: 린터가 강제하지 않으므로 팀 관례로만 유지된다.
- **Splash**: RN은 앱 JS가 뜨기 전에 네이티브 splash가 먼저 보인다. JS 쪽 어두운 배경과 색이 다르면 전환이 눈에 띈다.
- **CI**: `tsc`, `eslint`, 테스트가 로컬에서만 돌면 깨진 코드가 브랜치에 들어간다.

### 3. 공식 문서

- Expo/RN 문서 중 이 미션 항목에 직접 대응하는 **검증된 링크는 없다.**
- app config 속성 확인: [app config (SDK 54 원문)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/config/app.mdx). 속성 목록은 최신판 본문이므로 `splash` 관련 속성 이름을 SDK 54 기준으로 직접 확인한다 (확인 필요).
- GitHub Actions 문법: 검증된 링크 없음. 사용자가 공식 문서에서 직접 확인.
- React `createContext` 기본값 동작: 검증된 링크 없음. 직접 확인.

### 4. 힌트

- **힌트 1 (방향)**: 먼저 항목별로 `해당 있음 / 해당 없음 / 의도된 것`을 표로 분류한 뒤 손댄다. console은 "이 로그를 지우면 무엇이 안 보이게 되는가"를 기준으로.
- **힌트 2 (API·패턴)**:
  - Context: 기본값을 "없음"을 뜻하는 값으로 두고, 소비 훅이 그 경우를 처리하는 패턴.
  - import: 외부 패키지 → 내부(상대경로) → 타입 import 순으로 묶는 관례. 린터 규칙으로 강제할 수도 있으나 이 미션 범위에서 필수는 아니다.
  - Splash: 네이티브 설정(`app.json`)과 JS 쪽 로딩 화면의 색을 일치시키는 방향이 있고, `expo-splash-screen`으로 숨김 시점을 제어하는 방향이 있다. 후자는 의존성 추가이므로 추가할지 먼저 판단.
  - CI: 트리거 종류, 런타임(Node) 설정, 로컬에서 쓰는 검증 명령과 같은 단계를 어떻게 옮길지.
- **힌트 3 (함정)**:
  - `useAuth`의 반환 타입을 바꾸면 소비자 3곳(`navigation/index.tsx:109`, `ProfileScreen.tsx:13`, `LoginScreen.tsx:31`)의 `null` 처리가 필요해진다. 타입체크가 어디서 깨지는지 보면서 진행.
  - `ComposeScreen.tsx:139`의 로그를 지우면 입력값이 어디에도 남지 않고 모달만 닫힌다. 지우는 것이 정리인지 기능 제거인지 의식한다.
  - CI는 현재 `npx eslint .`에 prettier 오류가 남아 있으면 실패한다 (2-1 선행 여부 확인). CI를 먼저 켜면 첫 실행부터 빨간색이다.
  - `npm test`는 약 5초 걸리는 테스트가 있다 (2-11에서 줄일 예정). CI 타임아웃과 무관하지만 알고 있을 것.
  - `.github/workflows`는 저장소에 올라가는 파일이다. 시크릿이나 토큰은 쓰지 않는다.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npm test
npx eslint .
```

- console: `grep -rn "console\." src App.tsx`로 남은 항목이 분류표와 일치하는지.
- AuthContext: 의도적으로 Provider를 빼 보면 어떻게 실패하는지 (임시로 확인하고 되돌린다).
- import: 수정한 파일이 `npx eslint .`에서 새 오류를 내지 않는지.
- Splash: 시뮬레이터 cold start 전/후 비교. (변경 시 네이티브 설정 변경은 Expo Go에서는 반영되지 않을 수 있음 - 확인 필요.)
- CI: 푸시하기 전에 로컬에서 같은 명령 세 개가 통과하는지. 실제 Actions 실행 결과는 푸시 후 GitHub에서 확인 (이 가이드에서 검증하지 않음).

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] 항목별 `해당 있음/없음/의도된 것` 분류 근거
- [ ] 기본값 있는 Context와 없는 Context의 실패 방식 차이
- [ ] 네이티브 splash와 JS 로딩 화면이 서로 다른 단계라는 것

직접 구현했다
- [ ] console 4건 분류 후 처리
- [ ] AuthContext 기본값 처리 + 소비자 3곳 정리
- [ ] import 순서 정리 (2개 파일)
- [ ] Splash 판단 기록 (바꿨다면 변경 내용, 안 바꿨다면 이유)
- [ ] CI 워크플로 추가 또는 보류 사유 기록

### 7. 흔한 함정

- "정리"라는 이름으로 의도된 학습용 로그, 주석 처리된 데모를 일괄 삭제한다.
- Context 기본값을 `throw`로 바꾸면서 Provider 바깥에서 렌더되는 곳(테스트, 스토리)이 있는지 확인하지 않는다.
- import 순서를 고치다 `type` import 구분이나 사이드이펙트 import의 순서를 깨뜨린다.
- Splash 설정을 바꾸고 Expo Go에서 반영 안 되는 것을 실패로 오해한다.
- CI를 한 번에 크게 만든다. 최소 단계(설치, typecheck, test, lint)부터.
