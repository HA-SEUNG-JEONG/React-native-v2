# Tier 1 가이드 — 버그 수정

> 출처: [Expo SDK 54 notifications](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/notifications.mdx) · [Expo SDK 54 linking](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/linking.mdx) · [Expo SDK 54 secure-store](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/securestore.mdx) · [React Native 0.81 network](https://reactnative.dev/docs/0.81/network) · [React Navigation deep-linking](https://reactnavigation.org/docs/deep-linking/) · [React Navigation auth-flow](https://reactnavigation.org/docs/auth-flow/) · [TanStack Query v5 optimistic-updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
> 검증: `src/screens/NetworkScreen.tsx`, `src/screens/FeedListScreen.tsx`, `src/screens/LocationScreen.tsx`, `src/components/SwipeableRow.tsx`, `src/api/posts.ts`, `src/api/auth.ts`, `src/navigation/index.tsx`, `App.tsx`, `tests/auth.test.ts`를 브랜치 `improve/missions`에서 직접 읽고 라인 확인 (Expo SDK 54 / RN 0.81 / React 19.1). 이 가이드의 재현 절차는 작성 시점에 시뮬레이터에서 실행하지 않았다. 코드 추적 결과이며, 실측이 필요한 부분은 "확인 필요"로 표시했다.
> 참고: `docs.expo.dev` v54.0.0 URL은 최신 문서로 리다이렉트되므로 SDK 54 원문 링크(GitHub `sdk-54` 브랜치)를 사용한다.

Tier 1은 코드 리뷰에서 나온 실제 버그 6개다. 진행 방식(힌트온리 규칙, 힌트 단계)은 [README](./README.md)를 따른다. 이 문서에는 정답 코드가 없다.

| 미션 | 주제 | 표시 |
|------|------|------|
| [1-1](#미션-1-1--websocket-언마운트-후-재연결-누수) | WebSocket 언마운트 후 재연결 누수 | |
| [1-2](#미션-1-2--삭제가-무시되면-swipeablerow가-화면-밖에-남음) | 삭제가 무시되면 SwipeableRow가 화면 밖에 남음 | |
| [1-3](#미션-1-3--스타일-없는-text) | 스타일 없는 Text (가장 쉬움) | |
| [1-4](#미션-1-4--딥링크-id-검증과-알림-dataurl-검증) | 딥링크 id 검증/인코딩, 알림 `data.url` 검증 | 📱 일부 |
| [1-5](#미션-1-5--로그아웃-상태-알림-딥링크-유실) | 로그아웃 상태 알림 딥링크 유실 | ⚠️ 동작 변경 · 📱 |
| [1-6](#미션-1-6--logout이-모듈-레벨-상태를-리셋하지-않음) | `logout()`이 모듈 레벨 상태를 리셋하지 않음 | |

1-x는 서로 독립이다. 다만 1-5는 1-4의 URL 검증과 함께 설계하면 중복이 줄어든다.

---

## 미션 1-1 — WebSocket 언마운트 후 재연결 누수

### 1. 증상과 위치

- `src/screens/NetworkScreen.tsx`의 언마운트 cleanup `useEffect`(빈 의존성 배열). `ws.close()`와 `clearTimeout`만 한다.
- `src/screens/NetworkScreen.tsx`의 `openSocket`. `connectEchoSocket`에 넘기는 `onClose` 핸들러가 있고, 그 끝의 `setTimeout`이 재연결 타이머다.
- `src/screens/NetworkScreen.tsx` 컴포넌트 본문의 `wsRef`, `manualCloseRef`, `timeoutRef` 선언 (`useRef`).

코드로 추적한 흐름 (연결된 상태에서 화면을 나갈 때):

1. 화면 언마운트 → cleanup이 `wsRef.current.close()` 호출 (cleanup 안의 `if (wsRef.current)` 블록). `manualCloseRef`는 `false` 그대로다.
2. `close()`는 즉시 끝나지 않는다. 소켓의 close 이벤트가 **나중에** 와서 `onClose`가 호출된다. (직접 끊기 버튼 경로도 `onClose`의 `manualCloseRef.current` 분기에서 "연결 종료(직접 끊음)" 로그를 남기므로 같은 이벤트에 의존한다.)
3. `onClose`가 `setWsConnected(false)`와 `appendLog`를 **이미 언마운트된 컴포넌트**에서 호출한다. React 19에는 "언마운트된 컴포넌트 setState" 경고가 없어서 조용히 지나간다.
4. `manualCloseRef.current`가 `false`이고 `reconnectAttempt < WS_MAX_RECONNECT`라서 `onClose` 끝의 재연결 `setTimeout`이 **새 타이머를 예약**한다. cleanup은 이미 끝났으므로 이 타이머는 아무도 지우지 않는다.
5. 지연 후 `openSocket(reconnectAttempt + 1)`이 새 `WebSocket`을 만든다. 이 소켓을 닫는 코드는 없다.

추가 경로 (같은 뿌리): 재연결 대기 중에는 `wsConnected`가 `false`라서 "연결" 버튼이 보인다(JSX의 `wsConnected` 삼항 분기). 대기 중에 누르면 `openSocket()`이 직접 호출되는데, 대기 중이던 타이머(`timeoutRef`)는 그대로 남아서 소켓이 둘이 된다. `wsRef`가 덮어써지면서 앞 소켓의 참조도 잃는다.

재현 (시뮬레이터, 화면 로그는 언마운트 후 보이지 않으므로 임시 로그가 필요):

1. `src/api/network.ts`의 `connectEchoSocket` 안 `onopen`/`onclose` 핸들러에 임시 `console.log`를 넣는다. 확인 후 반드시 지운다.
2. 홈 → 네트워킹 → "연결" → "[WS] 연결됨" 확인.
3. 뒤로 가기로 화면을 나간다.
4. Metro 터미널에서 화면을 나간 직후 close 로그, 500ms 이상 뒤(재연결 지연 + 핸드셰이크) **open 로그가 다시 찍히는지** 본다. 찍히면 누수다.

> 확인 필요: 누수된 소켓이 이후에도 열려 있는지는 echo 서버 동작에 달려 있다. 로그로 직접 확인한다.

### 2. 왜 문제인가

웹은 탭을 닫으면 페이지의 소켓과 타이머가 함께 사라진다. RN은 JS 런타임이 앱 프로세스와 같이 살아 있어서, 화면이 언마운트돼도 소켓과 타이머는 계속 산다. 정리는 오직 cleanup에서만 일어난다.

핵심은 **"정리 요청"과 "정리 완료"가 다른 시점**이라는 것이다. `close()`는 요청이고, 그 결과로 오는 close 이벤트는 비동기 콜백이다. 이 콜백이 "직접 끊음"인지 "서버가 끊음"인지 구분하는 장치(`manualCloseRef`)가 이미 있는데, 언마운트 경로는 그 장치를 쓰지 않는다. 그래서 언마운트로 인한 close가 "비정상 종료"로 오인돼 재연결이 시작된다.

### 3. 공식 문서

- [React Native 0.81 — Networking (WebSocket 절)](https://reactnative.dev/docs/0.81/network)

### 4. 힌트

- **힌트 1 (방향)**: cleanup이 `close()`를 부른 뒤에 어떤 콜백이 한 번 더 불리는지, 그 콜백이 지금 "직접 끊음"과 "언마운트로 끊김"을 구분할 수 있는지 따라가 보세요.
- **힌트 2 (API/패턴)**: 이미 파일 안에 "직접 끊었는지"를 나타내는 `useRef` 플래그가 있습니다. 그 플래그를 재사용하는 쪽과 별도의 "언마운트됨" 플래그를 두는 쪽의 장단점을 비교해 보세요. 타이머는 `timeoutRef`로 이미 추적하고 있습니다.
- **힌트 3 (함정)**:
  - 플래그를 세우는 시점과 `close()` 호출의 순서가 왜 중요한지 설명할 수 있어야 합니다.
  - `openSocket`의 첫 줄이 `manualCloseRef`를 `false`로 되돌립니다. 언마운트 후에 어떤 경로로든 `openSocket`이 다시 불리면 플래그가 풀립니다.
  - 새 타이머를 예약하기 전에 기존 `timeoutRef`가 비어 있다고 가정해도 되는지 생각해 보세요 (위 "추가 경로").
  - 개발 모드 StrictMode는 effect를 mount → cleanup → mount로 두 번 실행합니다. 별도의 "언마운트됨" 플래그를 쓰면서 재마운트 때 되돌리지 않으면 재마운트 후 재연결이 영영 꺼집니다. 이 레포에는 `StrictMode` 사용이 없지만(grep 확인), 개념은 이해하고 넘어가세요.
  - 언마운트 후의 `setWsConnected`/`appendLog` 호출까지 막을지, 소켓 핸들러 자체를 떼는 방식과 플래그 방식 중 무엇이 나은지 장단점을 비교해 보세요.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
```

- `npm test`에는 이 화면을 검증하는 테스트가 없다 (RN 컴포넌트는 `node --test` 대상이 아님). 시뮬레이터 확인이 유일한 검증이다.
- 시뮬레이터: 위 재현 절차를 그대로 반복. 수정 후에는 화면을 나간 뒤 open 로그가 다시 찍히지 않아야 한다. 화면 안에서 "연결 끊기"와 서버발 끊김(자동 재연결 최대 3회)이 기존처럼 동작하는지도 확인한다.
- 임시 `console.log`는 제거한다.

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] `close()` 호출과 close 이벤트가 다른 시점인 이유
- [ ] 언마운트 시 재연결 타이머가 cleanup 이후에 새로 생기는 경로
- [ ] `manualCloseRef`가 이미 하던 역할과 언마운트에 필요한 역할의 차이

직접 구현했다
- [ ] 언마운트 후 재연결이 예약되지 않는다
- [ ] 언마운트 후 불필요한 state 업데이트가 일어나지 않는다
- [ ] (선택) 재연결 대기 중 "연결" 버튼으로 소켓이 둘이 되지 않는다
- [ ] 임시 로그를 제거했다

### 7. 흔한 함정

- cleanup에 `close()`와 `clearTimeout`이 있으니 충분하다고 판단함. 정리 이후에 도착하는 콜백이 타이머를 새로 만든다.
- 플래그를 갱신하는 위치를 한쪽 경로에만 둠.
- 플래그를 세우고 되돌릴 시점을 안 정해서, 재연결 정책이 영구히 꺼짐.
- 화면 로그만 보고 "문제 없음"으로 판단함. 언마운트 후의 동작은 화면에 안 찍힌다.

---

## 미션 1-2 — 삭제가 무시되면 SwipeableRow가 화면 밖에 남음

### 1. 증상과 위치

- `src/screens/FeedListScreen.tsx`의 `renderItem` 안 `SwipeableRow`에 넘기는 `onDelete` prop — 스와이프 삭제 가드.
- `src/components/SwipeableRow.tsx`의 `pan` 제스처 `onEnd` 콜백 — `translateX.value < DELETE_THRESHOLD` 분기가 임계값을 넘으면 `OFFSCREEN`(`-400`)으로 애니메이션하고, 끝나면 `runOnJS(onDelete)()`를 호출한다.
- `src/api/posts.ts`의 `deletePostApi`는 요청 후 400ms를 더 기다린다. `isPending`이 그만큼 길게 `true`로 유지된다.
- `src/api/posts.ts`의 `useDeletePost` 안 `onMutate`가 캐시에서 해당 행을 **즉시** 제거한다.
- `src/screens/FeedListScreen.tsx`의 바텀시트 "삭제" `Pressable`의 `onPress` — 같은 가드.

문제 위치: `FeedListScreen.tsx`의 `renderItem` 안 `SwipeableRow`에 넘기는 `onDelete` 핸들러. 코드는 직접 열어서 본다.

코드로 추적한 시나리오:

1. 행 A를 왼쪽으로 스와이프. `translateX`가 `-80`보다 작아 `OFFSCREEN`으로 이동, 완료 후 `onDelete` 호출 → `deletePost.mutate(A)`. `onMutate`가 A를 목록에서 제거한다.
2. 삭제 요청이 끝나기 전(`isPending === true`인 동안) 행 B를 같은 방식으로 스와이프.
3. `SwipeableRow`는 `translateX.value < DELETE_THRESHOLD`만 보고 B를 `OFFSCREEN`으로 보낸다. 그 사이 `onDelete`가 호출되지만 `FeedListScreen`의 `onDelete` 가드가 `false`라서 아무 일도 하지 않는다.
4. 결과: B는 데이터에 그대로 남아 있는데 `translateX`는 `-400`. 행 내용은 화면 밖으로 나가고, 뒤에 깔린 빨간 "삭제" 배경(`src/theme/styles.ts`의 `styles.swipeDeleteBg`)만 보인다. 행의 제스처가 화면 밖에 있어서 대부분의 폰 폭에서 사용자는 되돌릴 수 없다.

복구 시점은 해당 행 컴포넌트가 언마운트되어 새로 만들어질 때뿐이다. 그 시점이 FlatList 가상화에 의존하는지 포함해서 실제로 언제 복구되는지는 확인 필요.

재현 (시뮬레이터): 첫 행을 스와이프로 삭제한 직후(약 0.5초 이내) 바로 다음 행을 스와이프. 타이밍이 어려우면 여러 번 시도한다.

같은 가드의 다른 증상: 시트의 "삭제"(바텀시트 "삭제" `Pressable`의 `onPress`)도 진행 중이면 조용히 무시된다. 시각적 깨짐은 없지만 사용자는 눌렀는데 아무 일도 안 일어난다.

### 2. 왜 문제인가

`SwipeableRow`는 "삭제가 항상 받아들여진다"는 낙관적 가정으로 만들어졌다. 스와이프가 끝나는 순간 행을 화면 밖으로 보내고, 이후 행이 목록에서 사라져(언마운트) 상태가 리셋되기를 기대한다. 그런데 부모는 삭제를 **거부**할 수 있고, 그 거부를 `SwipeableRow`에 알릴 길이 없다.

웹 CSS transition과 다른 지점이 둘 있다.
- `translateX`는 Reanimated의 shared value다. 애니메이션은 UI 스레드에서 돌고, React 리렌더와 무관하게 값을 유지한다. 리렌더가 일어나도 `-400`은 되돌아가지 않는다.
- "삭제를 받아들일지"는 JS 스레드의 React 상태(`isPending`)이고, 제스처 종료 판정은 UI 스레드 워클릿이다. 삭제가 수락됐는지 여부가 워클릿 쪽으로 돌아오지 않는다.

### 3. 공식 문서

- [TanStack Query v5 — Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
- Reanimated(`withTiming` 콜백, `runOnJS`)와 Gesture Handler 문서는 이 가이드의 검증된 링크 목록에 없다. 공식 사이트(swmansion)에서 해당 API 절을 직접 확인한다. 링크는 넣지 않았다.

### 4. 힌트

- **힌트 1 (방향)**: 스와이프가 끝나는 시점에 "이 삭제를 받아들일 수 있는지"를 누가 알고 있고, `SwipeableRow`가 그것을 알 수 있는 순간은 언제인지 따라가 보세요.
- **힌트 2 (API/패턴)**: 선택지가 둘 이상입니다. 각각 무엇이 바뀌는지 비교한 뒤 하나를 고르세요.
  - 거부됐을 때 `SwipeableRow`가 `translateX`를 원위치로 되돌리게 한다. 이 파일에 이미 쓰는 `withSpring(0)` 복귀 패턴이 있다. 거부 신호는 prop이나 콜백 등 어떤 방식으로 전달할지 결정해야 한다.
  - 거부될 상황이면 애초에 `OFFSCREEN`으로 보내지 않는다.
  - 가드를 없애고 동시 삭제를 허용한다. 이 경우 `useDeletePost`가 무엇을 하는지 먼저 읽어야 한다 (아래 힌트 3).
- **힌트 3 (함정)**:
  - 제스처 콜백(워클릿)은 만들어진 시점의 값을 캡처합니다. 워클릿 안에서 `deletePost.isPending`을 직접 읽으면 오래된 값을 볼 수 있습니다.
  - `runOnJS`로 부른 함수의 반환값은 워클릿으로 돌아오지 않습니다. "반환값으로 수락 여부를 알려 주기"는 그대로는 안 됩니다.
  - 가드를 단순히 지우면 동시 삭제 중 롤백이 문제가 됩니다. B를 삭제하기 전에 찍은 A의 스냅샷으로 A가 롤백하면, 그 사이 삭제된 B가 되살아날 수 있습니다. (Tier 2의 2-3과 같은 뿌리)
  - 시트 경로(바텀시트 "삭제" `onPress`)도 같은 가드를 쓴다는 점을 놓치지 마세요.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
```

- `npm test`로는 검증할 수 없다 (제스처/애니메이션).
- 시뮬레이터: 위 재현 절차를 반복. 수정 후 거부된 행이 원위치로 돌아와야 한다. 단독 삭제는 기존처럼 동작해야 하고, 20% 확률의 서버 실패(`posts.ts`의 `deletePostApi`) 시 롤백도 기존처럼 동작해야 한다.

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] 행이 화면 밖에 남는 이유 (shared value가 리렌더로 안 돌아옴)
- [ ] 워클릿이 React 상태를 직접 읽으면 안 되는 이유
- [ ] 가드를 지우는 방식이 왜 롤백과 충돌하는지

직접 구현했다
- [ ] 삭제가 거부된 행이 원위치로 돌아온다
- [ ] 정상 삭제와 실패 롤백 동작이 그대로다
- [ ] 시트 삭제 경로도 검토했다

### 7. 흔한 함정

- `FeedListScreen`만 고치고 `SwipeableRow`의 "항상 수락" 가정은 그대로 둠.
- 워클릿 안에서 JS 상태를 직접 참조함.
- 가드를 삭제하고 끝냄 (롤백 경합).
- 한 번의 스와이프로만 테스트함. 재현은 연속 스와이프가 필요하다.

---

## 미션 1-3 — 스타일 없는 Text

가장 쉬운 미션이다. 워밍업으로 시작해도 좋다.

### 1. 증상과 위치

- `src/screens/LocationScreen.tsx`의 `return` JSX 하단, `errorMessage` 줄 바로 위 — `{scope && <Text>권한 범위 : {scope}</Text>}`. `style`이 없다.
- `getCurrentPosition` — `scope`는 `res.ios?.scope`에서 오므로 **iOS에서만** 값이 생긴다. Android에서는 이 줄이 렌더되지 않는다.
- 화면 배경은 `styles.screen`의 `#0f1115`(`src/theme/styles.ts`)로 어둡다. 같은 화면의 다른 `Text`는 스타일을 받는다.

재현 (iOS 시뮬레이터): 홈 → 위치 설정 → "현재 위치 가져오기" → 권한 허용 → 지도 아래에 "권한 범위" 줄이 있어야 하는데 배경에 묻혀 보이지 않는다.

기본 글자색은 플랫폼/테마에 따라 다를 수 있다. 이 앱은 `app.json`에서 `userInterfaceStyle`이 `"light"`이므로 어두운 글자색일 가능성이 높다. 정확한 값은 시뮬레이터에서 확인 필요.

### 2. 왜 문제인가

RN `Text`는 웹의 `color` 상속과 다르다. 부모 `View`에 글자색을 줘도 `Text`로 내려가지 않는다. `Text` 안의 중첩 `Text`만 상속된다. 그래서 `Text` 자체에 스타일이 없으면 플랫폼 기본색이 쓰이고, 이 앱처럼 배경을 하드코딩한 다크 화면에서는 보이지 않는다.

### 3. 공식 문서

검증된 링크 없음. RN 0.81 `Text` 문서는 이 가이드의 검증 목록에 없으므로 링크를 넣지 않았다. reactnative.dev에서 0.81 버전을 선택해 Text의 스타일 상속 설명을 직접 확인한다.

### 4. 힌트

- **힌트 1 (방향)**: 같은 파일에서 이 줄 위아래의 `Text`들이 어떻게 스타일을 받는지 비교해 보세요.
- **힌트 2 (API/패턴)**: 이미 `styles` 객체에 의미가 맞는 스타일이 있습니다. 이 줄이 어떤 역할(보조 안내 vs 값 표시)인지 판단해서 고르세요.
- **힌트 3 (함정)**: 새 hex 색을 인라인으로 만들지 마세요. 프로젝트 규칙상 색 하드코딩은 금지이고 Tier 3의 3-1에서 정리 대상입니다. 어두운 배경 위에서 대비가 충분한지 눈으로 확인하세요.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
```

시뮬레이터(iOS): 위 재현 절차 후 "권한 범위" 줄이 읽혀야 한다. Android는 `scope`가 `null`이라 이 줄 자체가 없는 것이 정상이다.

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] RN `Text`가 부모 `View`의 글자색을 상속하지 않는 이유
- [ ] 이 줄이 iOS에서만 나타나는 이유

직접 구현했다
- [ ] 다크 배경에서 읽을 수 있다
- [ ] 새 하드코딩 색을 추가하지 않았다

### 7. 흔한 함정

- `View`에 `color`를 줘서 해결하려고 함.
- 눈에 보이게 하려고 임의의 hex를 인라인으로 씀.
- Android 에뮬레이터에서만 확인하고 "줄이 없네"로 넘어감.

---

## 미션 1-4 — 딥링크 id 검증과 알림 `data.url` 검증

📱 **일부 실기기 필요**

- id 검증(a): 시뮬레이터에서 재현/검증 가능.
- `data.url` 검증(b): 검증 로직은 **로컬 알림**(NotificationScreen의 "5초 후 알림 예약")으로 시뮬레이터에서 같은 코드 경로를 탄다. 원격 푸시(APNs/FCM)를 실제로 받는 end-to-end만 실기기가 필요하다. 단, Expo Go 시뮬레이터에서 알림 탭 응답이 앱에 전달되는지는 직접 시도해서 확인 필요.

### 1. 증상과 위치

**(a) 딥링크 id**

- `src/api/posts.ts`의 `fetchPost(id: string)`. 함수 본문 첫 문장에서 `fetch(`${API}/${id}`)`로 URL을 조립한다.
- `src/screens/FeedDetailScreen.tsx`의 `useQuery`(`queryKey`/`queryFn`/`enabled`) — `route.params.id`가 그대로 `fetchPost(id)`로 간다. `enabled: !!id`는 빈 문자열만 막는다.
- `src/navigation/index.tsx`의 `linking.config` 중 `HomeTab`의 `FeedDetail: "feed/:id"`. 딥링크의 `:id` 구간이 그대로 `route.params.id`가 된다.

문제 위치: `posts.ts`의 `fetchPost` 안 `fetch` 호출. 코드는 직접 열어서 본다.

`id`는 외부 입력(딥링크)인데 형식 검증도, URL 인코딩도 없다. 숫자가 아닌 값(`abc`)은 404로 끝나 에러 화면이 뜨지만, `/`, `..`, `?`, `#` 같은 문자가 들어오면 URL 구조가 바뀔 수 있다. 예: 디코딩된 id가 `../users/1`이면 `.../posts/../users/1`이 되어 다른 엔드포인트가 요청될 수 있다.

> 확인 필요: React Navigation이 `:id` 구간을 디코딩해서 `route.params.id`에 넣는지, 그리고 `fetch`/URL 정규화가 `..`를 실제로 정리하는지는 이 가이드에서 단정하지 않는다. `FeedDetailScreen`에서 임시로 `route.params.id`를 로그로 찍어 확인한다 (확인 후 제거).

재현 (시뮬레이터, 로그인 상태에서): Expo Go는 `picsel://`이 아니라 `exp://` 주소로 연다.

```bash
# Metro 터미널에 표시되는 exp:// 주소 + /--/ 뒤에 경로를 붙인다 (형태는 환경마다 다름)
xcrun simctl openurl booted "exp://127.0.0.1:8081/--/feed/abc"
```

`Linking.createURL("/")`이 돌려주는 값이 정확한 접두사다. 이 값을 임시로 로그해서 확인한다. 로그아웃 상태에서는 링크가 무시된다 (1-5 참고).

**(b) 알림 `data.url`**

- `App.tsx`의 알림 탭 처리 `useEffect` — `lastResponse?.notification.request.content.data?.url`이 `string`이기만 하면 `Linking.openURL(url)`에 그대로 넘긴다.

문제 위치: `App.tsx`의 알림 탭 처리 `useEffect` 안 `data.url` 처리부. 코드는 직접 열어서 본다.

`typeof`가 `string`인지만 본다. 알림 payload의 `data`는 보내는 쪽(푸시 서버, 또는 서버가 잘못된 값을 보낸 경우)이 정한다. `https://...`, `tel:`, `sms:`, 다른 앱의 scheme도 전부 열린다. 이 앱이 열어야 하는 건 자기 앱의 딥링크뿐이다.

시뮬레이터 재현 (임시 수정, 확인 후 되돌릴 것): `src/screens/NotificationScreen.tsx`의 `scheduleDelayed` 안 `data.url`을 외부 `https://` 주소로 바꾸고 "5초 후 알림 예약" → 알림 탭 → 앱 대신 외부 페이지가 열리는지 본다.

### 2. 왜 문제인가

웹 라우터는 same-origin 내부에서만 이동하지만, RN의 `Linking.openURL`은 OS에 위임한다. OS는 scheme이 무엇이든 처리해 준다. 그리고 딥링크 경로(`:id`)는 다른 앱, 문자, 웹페이지가 누구나 만들어 보낼 수 있는 **외부 입력**이다. "우리 앱 라우팅이 만든 값이니 안전하다"는 가정이 성립하지 않는다.

신뢰 경계가 두 군데다.
- 링크 경로 → `route.params.id` → 서버 요청 URL
- 알림 payload `data.url` → `Linking.openURL`

### 3. 공식 문서

- [Expo SDK 54 — Linking](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/linking.mdx)
- [Expo SDK 54 — Notifications](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/notifications.mdx)
- [React Navigation — Deep linking](https://reactnavigation.org/docs/deep-linking/)

### 4. 힌트

- **힌트 1 (방향)**: 외부 값이 들어오는 두 지점을 따로 생각하세요. 각 지점에서 "허용할 것"을 먼저 정의합니다 (허용 목록 방식). 검증을 어디에 두면 모든 호출 경로가 지나가는지도 고민하세요.
- **힌트 2 (API/패턴)**:
  - id: 서버 id가 정수라는 사실에 맞춘 형식 검증 + URL 조립 시 `encodeURIComponent`. 검증 위치 후보는 `fetchPost` 직전 / `FeedDetailScreen` 진입 / 라우팅 config. React Navigation deep-linking 문서의 config 항목에서 `:id`를 가공하는 방법이 있는지 확인해 보세요.
  - url: "우리 앱 링크인가"는 이미 `linking.prefixes`(`src/navigation/index.tsx`의 `linking` 객체)가 정의하고 있습니다. 같은 기준을 재사용할 수 있는지 보세요. URL 파싱은 `expo-linking`의 `parse`를 먼저 보되, RN 전역 `URL`은 웹과 동작이 다를 수 있으니 (확인 필요) 쓰기 전에 직접 확인하세요.
- **힌트 3 (함정)**:
  - 정규식 검증에 `^`/`$` 앵커가 없으면 `1abc`나 `1/../x`가 통과합니다.
  - 접두사를 문자열 `startsWith`로만 비교하면 호스트 위장(`https://example.com.attacker.test`)이 통과합니다. scheme만 허용하면 이 문제는 줄지만 `exp://` 개발 접두사는 환경마다 값이 달라집니다.
  - 검증 통과 ≠ 서버에 존재. 404 처리(`fetchPost`의 `res.ok` 검사)는 그대로 필요합니다.
  - 검증 실패 시 무시할지, 사용자에게 알릴지 직접 정하세요. 잘못된 id로 열었을 때 화면이 지금과 달라질 수 있습니다.
  - 검증 함수를 RN import 없는 순수 모듈로 두면 `tests/*.test.ts`(node:test)로 단위 테스트할 수 있습니다. `posts.ts`는 `react-native`를 import하므로 직접 테스트 대상이 못 됩니다.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npm test            # 검증 함수를 순수 모듈로 분리해 테스트를 추가했을 때
npx eslint .
```

- 시뮬레이터: 정상 링크(`.../--/feed/1`)는 기존대로 상세가 열린다. 비정상 id(`abc`, 인코딩된 `/`)는 요청 자체가 나가지 않거나 안전하게 처리된다. Metro 로그로 요청 URL을 확인한다.
- 시뮬레이터(로컬 알림): 정상 `data.url`(앱 링크)은 상세로 이동, 외부 `https://`는 열리지 않는다.
- 📱 실기기: 원격 푸시로 같은 payload를 받아 탭하는 경로.

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] 딥링크 `:id`와 알림 `data.url`이 각각 왜 신뢰할 수 없는 입력인지
- [ ] `Linking.openURL`이 http(s) 외에 무엇을 열 수 있는지
- [ ] 검증(허용 목록)과 인코딩이 각각 막는 것이 다르다는 점

직접 구현했다
- [ ] id 형식 검증 + URL 조립 시 인코딩
- [ ] `data.url`이 앱 링크일 때만 `openURL`
- [ ] 정상 경로가 그대로 동작함을 시뮬레이터로 확인

### 7. 흔한 함정

- 인코딩만 하고 검증은 생략 (또는 반대).
- 앵커 없는 정규식, 느슨한 `startsWith`.
- `FeedDetailScreen`에서만 막고 `fetchPost`를 다른 곳에서 호출할 때를 놓침.
- 임시로 바꾼 `NotificationScreen.tsx`의 `scheduleDelayed` `data.url`을 되돌리지 않음.

---

## 미션 1-5 — 로그아웃 상태 알림 딥링크 유실

⚠️ **동작 변경** · 📱 **cold start는 실기기 필요**

연관: 1-4의 URL 검증과 함께 설계하면 좋다.

### 1. 증상과 위치

- `App.tsx`의 알림 탭 처리 `useEffect` — 알림 탭 → `Linking.openURL(url)`. effect 의존성은 `[isReady, lastResponse]`이고 로그인 상태(`user`)는 없다.
- `src/navigation/index.tsx`의 `RootNavigator`. `user == null` 조기 반환 분기: **`AuthStack`(Login 화면 하나)만** 렌더. 그 아래 반환부: 로그인되어 있으면 `RootStack`(Tabs + Compose 모달 그룹).
- `src/navigation/index.tsx`의 `linking.config`에는 `Tabs`와 `Compose`만 있다. `Login`에는 경로가 없다.
- `src/navigation/index.tsx`의 `linking` 선언 위 주석 블록의 "주의" 항목: 로그아웃 상태에서는 보호 화면 링크가 매칭 대상이 없어 무시되고, 로그인 후 재적용은 따로 붙여야 한다고 적혀 있다.

코드로 추적한 흐름 (로그아웃 상태에서 알림 탭):

1. `user == null`이므로 앱 트리에는 `AuthStack`의 `Login`만 있다. `Tabs`/`FeedDetail`은 존재하지 않는다.
2. `isReady`가 되어 `useEffect`의 `if (!isReady) return` 가드를 지나고 `lastResponse`가 있으면 `Linking.openURL("…/feed/1")`이 호출된다.
3. linking이 URL을 `Tabs > HomeTab > FeedDetail` 액션으로 바꾸지만, 그 액션을 처리할 네비게이터가 마운트돼 있지 않아 버려진다. (개발 모드 콘솔에서 "not handled by any navigator" 계열 경고가 보일 수 있음 — 확인 필요.)
4. 사용자가 로그인하면 `RootNavigator`가 `RootStack`으로 교체되지만, effect는 다시 돌지 않는다 (`isReady`, `lastResponse` 불변, `user`는 의존성에 없음). 링크는 유실되고 사용자는 홈(FeedList)에 도착한다.

로그인 상태에서의 cold start는 정상이다. `App.tsx`의 부팅 `useEffect`(`SecureStore.getItemAsync`)가 SecureStore에서 `user`를 복원하고, `isReady` 이후에 `Tabs`가 렌더된다 (`docs/fixes/2026-10-13-portfolio-minimal-fixes.md`에서 고친 부분).

참고: 일반 딥링크(예: 사파리에서 `picsel://feed/1`, dev build/standalone 기준이며 Expo Go에서는 이 scheme이 열리지 않는다)로 로그아웃 상태 cold start를 해도 같은 이유로 유실된다. 이 미션의 범위는 알림 경로이고, 일반 딥링크는 별도다.

**재현**

시뮬레이터 (같은 코드 경로를 타는 대체 재현, cold start 아님):
1. 로그인 → 알림 화면 → "5초 후 알림 예약".
2. 5초 안에 프로필 탭에서 로그아웃 (예약된 로컬 알림은 로그아웃과 무관하게 발화한다. 놓쳤으면 알림 센터에 남은 알림을 탭해도 된다).
3. 알림 배너가 뜨면 탭.
4. 로그인 화면에 그대로 있다. 로그인하면 `FeedDetail`이 아니라 홈이다.

📱 실기기 (cold start): 위 1-2 후 앱을 **완전히 종료**하고 알림을 탭한다. 이 프로젝트는 Expo Go를 쓰므로(`expo-dev-client` 없음), 시뮬레이터의 Expo Go에서 종료 상태 알림 탭이 이 프로젝트를 다시 여는지는 확인 필요다. `docs/fixes/2026-10-13-portfolio-minimal-fixes.md`에도 "앱 종료 후 알림 탭 → 상세 진입"은 시뮬레이터 미확인으로 남아 있다.

#### ⚠️ 동작 변경 사전 고지

| | 지금 | 수정 후 |
|---|------|---------|
| 로그아웃 상태에서 알림 탭 | 링크 버려짐. 로그인 후 홈 | 링크를 보관했다가 **로그인 직후 해당 화면으로 자동 이동** |

바뀌는 점과 부작용 가능성 (설계 전에 각각 어떻게 할지 정하세요):
- 로그인 직후 홈 대신 `FeedDetail`로 바로 간다. 사용자가 예상하지 못한 화면 이동이 된다.
- 알림은 이전 계정의 것일 수 있다. 다른 계정으로 로그인해도 이동시킬지 정책이 필요하다.
- 한 번 쓴 링크를 비우지 않으면 로그아웃 → 로그인을 반복할 때마다 같은 화면으로 이동한다.
- 오래된 알림의 링크를 시간이 한참 지난 뒤 열게 된다. 보관 링크의 수명을 정할지 판단한다.
- 보관 링크를 앱 종료 후에도 유지할지(영속), 메모리에만 둘지 정한다.
- `linking.config`에 `initialRouteName`이 없어서 `FeedDetail`만 단독으로 열리면 뒤로 갈 곳이 없을 수 있다. 로그인 상태의 기존 딥링크도 같은 구조이므로 이 미션의 변경은 아니다 (확인 필요).
- 이미 로그인된 상태에서 받은 링크의 동작(즉시 이동)은 바뀌면 안 된다 (회귀).

### 2. 왜 문제인가

인증 분기 네비게이터(`auth-flow` 패턴)는 로그아웃 상태에서 보호 화면을 **마운트하지 않는다**. 그래서 "링크 열기"는 그 순간 대상 화면이 없으면 소리 없이 사라진다. 웹은 URL이 주소창에 남아 있어서 로그인 후 `redirect` 쿼리 등으로 되돌릴 수 있지만, 알림 탭은 일회성 이벤트이고 `lastResponse`는 로그인으로 바뀌지 않는다.

핵심은 "링크 **열기**"와 "링크 **보관**"을 분리하는 것이다.

### 3. 공식 문서

- [React Navigation — Authentication flows](https://reactnavigation.org/docs/auth-flow/)
- [React Navigation — Deep linking](https://reactnavigation.org/docs/deep-linking/)
- [Expo SDK 54 — Notifications](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/notifications.mdx) (`useLastNotificationResponse`)
- [Expo SDK 54 — Linking](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/linking.mdx)

### 4. 힌트

- **힌트 1 (방향)**: 링크가 사라지는 정확한 순간은 "열기를 시도했을 때 대상 화면이 없다"입니다. 그 시점에 URL을 어디에 둘 수 있는지, 언제 다시 꺼내야 하는지 생각해 보세요.
- **힌트 2 (API/패턴)**: 링크를 보관할 곳과, 로그인 전이를 감지하는 방법. 링크를 "소비"하는 시점을 명시적으로 정하세요.
- **힌트 3 (함정)**:
  - effect 의존성에 `user`만 추가하면 `lastResponse`가 그대로라 로그인할 때마다 같은 링크를 다시 엽니다.
  - 로그인 상태에서 받은 링크는 보관하지 말고 지금처럼 즉시 열어야 합니다 (회귀 방지).
  - 보관하는 링크는 1-4의 검증을 통과한 값이어야 합니다.
  - `user`가 바뀐 직후 네비게이터가 `RootStack`으로 교체되기 전에 `openURL`을 부르면 또 무시될 수 있습니다. 타이밍은 실측으로 확인하세요 (확인 필요).
  - 보관소 비우는 시점(열기 직전 vs 이동 성공 후)에 따라 실패 시 재시도 여부가 달라집니다.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
```

- `npm test`로는 검증할 수 없다 (알림/네비게이션).
- 시뮬레이터 (대체 재현): 위 절차로 로그아웃 상태에서 알림 탭 → 로그인 → `FeedDetail`로 이동. 이어서 로그아웃 → 로그인을 다시 했을 때 **같은 화면으로 다시 가지 않아야** 한다.
- 시뮬레이터 비회귀: 로그인 상태에서 알림 탭 → 즉시 `FeedDetail`.
- 📱 실기기: 로그아웃 후 앱 종료 → 알림 탭(cold start) → 로그인 → 이동.

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] 로그아웃 상태에서 링크가 무시되는 이유 (대상 네비게이터 미마운트)
- [ ] effect 의존성에 `lastResponse`만 있으면 로그인 후 왜 재실행되지 않는지
- [ ] 동작 변경으로 사용자가 겪게 될 일과 그 위험

직접 구현했다
- [ ] 로그아웃 상태 링크가 로그인 직후 한 번만 열린다
- [ ] 로그인 상태의 즉시 이동이 그대로다
- [ ] 계정/수명/영속 정책을 정하고 한 줄로 적었다

### 7. 흔한 함정

- `RootNavigator` 분기를 고쳐 보호 화면을 항상 마운트하려 함 (인증 경계 파괴).
- 보관 링크를 비우지 않아 반복 이동.
- 로그인 상태까지 보관 경로로 보내 즉시 이동이 느려짐.
- 시뮬레이터 대체 재현만 하고 cold start 검증을 "됐다"고 보고함. cold start는 별도 확인이 필요하다.

---

## 미션 1-6 — `logout()`이 모듈 레벨 상태를 리셋하지 않음

### 1. 증상과 위치

- `src/api/auth.ts` 모듈 최상단의 변수 4개: `session`, `refreshInFlight`, `loginInFlight`, `refreshCount`.
- `src/api/auth.ts`의 `logout()`은 `session`과 `refreshInFlight`만 비운다. `loginInFlight`와 `refreshCount`는 그대로다.
- `App.tsx`의 `auth` `useMemo` 안 `signOut`이 `logout()` → `queryClient.clear()` → `setUser(null)` 순서로 부른다. 쿼리 캐시는 비우는데 auth 모듈 상태는 일부만 비운다.
- `App.tsx`의 부팅 `useEffect` — 부팅 시 SecureStore에서 `user`만 복원한다. `session`(토큰)은 복원하지 않는다.
- `tests/auth.test.ts`의 "concurrent 401s trigger a single refresh" 테스트 — `assert.equal(getRefreshCount(), 1)`처럼 절대값을 비교한다.

모듈 상태가 로그아웃 이후에 영향을 주는 경로를 코드로 추적했다.

**경로 A — `refreshCount`가 새는 경로**

`refreshCount`는 `refreshAccessToken`에서만 증가하고 어디서도 줄거나 초기화되지 않는다. 앱 화면은 `NetworkScreen`의 `callOnce`/`callConcurrent`가 호출 전후 차이(`getRefreshCount()` before/after)로만 쓰므로 눈에 안 띈다. 그러나 `tests/auth.test.ts`의 위 테스트는 절대값 `1`을 단정한다. 같은 파일에 갱신이 일어나는 테스트가 하나 더 생기면, 먼저 실행된 테스트의 카운트가 남아서, 뒤에 실행되는 테스트의 절대값 단정이 실패한다 (한 파일의 테스트는 같은 모듈 인스턴스를 공유하고 순차 실행된다).

**경로 B — 진행 중인 `login`이 로그아웃을 되살리는 경로**

`login`은 400ms 대기 후 `session = issueTokens()`를 실행한다. 그 사이에 `logout()`이 불리면:
- `logout()`은 `loginInFlight`를 건드리지 않는다.
- 대기가 끝나면 `login` 안의 `session = issueTokens()`가 `session`을 다시 채운다. 로그아웃했는데 `isLoggedIn()`이 `true`인 상태가 된다.
- 이전 호출이 아직 진행 중인 동안(약 400ms 창)이라면, 다음 `login()` 호출은 `login` 첫 줄의 `if (loginInFlight) return loginInFlight`로 **진행 중이던 이전 호출의 결과**를 돌려받는다. 새 호출의 비밀번호는 평가되지 않는다.

UI에서 이 경로에 도달하기는 어렵다. 로그아웃 버튼은 로그인이 끝난 뒤에만 보이기 때문이다. 테스트나 프로그램적 호출(예: 로그아웃을 자동으로 부르는 코드가 생길 때)에서 드러난다. `login(a)`를 await하지 않고 `logout()`을 부른 뒤 `isLoggedIn()`을 확인하는 식으로 재현할 수 있다.

**경로 C — 같은 뿌리의 `refreshInFlight`**

`logout()`이 `refreshInFlight`를 `null`로 만들어도, 진행 중이던 갱신 async는 계속 실행된다.
- 그 사이 재로그인해서 새 갱신(P2)이 시작되면, 이전 갱신(P1)이 끝날 때 `refreshAccessToken`의 `.finally`가 **무조건** `refreshInFlight = null`을 실행해서 P2의 중복 제거 참조를 지운다.
- 이전 갱신이 `session`이 다시 채워진 뒤에 끝나면, `refreshAccessToken`의 `!session` 검사를 통과해 새 세션을 덮어쓰고 `refreshCount`를 올린다.

**경로 D — 재시작 후 `user`와 `session` 불일치**

로그인 시 SecureStore에 저장되는 건 사용자 이름뿐이다 (`App.tsx`의 `signIn`에서 `SecureStore.setItemAsync`). 앱을 다시 시작하면 `user`는 복원되어(부팅 `useEffect`) `Tabs`가 렌더되지만, `session`은 메모리 변수라 `null`이다. `fetchProtected`는 첫 줄의 `!session` 검사에서 "로그인 필요"를 던진다.

재현 (시뮬레이터): 로그인 → 앱 리로드(Metro 터미널에서 `r`) 또는 앱 종료 후 재실행 → 홈 → 네트워킹 → "보호된 API 호출 (1회)" → 로그에 "실패: 로그인 필요". 화면은 로그인된 것처럼 보이지만 보호 API는 못 쓰고, 로그아웃 → 재로그인 외에 복구 방법이 없다.

### 2. 왜 문제인가

웹 서버는 요청 단위로 상태가 끝나고, 웹 클라이언트는 새로고침이 상태를 비워 준다. RN 앱은 JS 모듈 변수가 **프로세스가 끝날 때까지** 산다. 로그아웃은 새로고침이 아니다. "로그아웃 = 사용자 범위 상태를 전부 폐기"가 되려면, 모듈 변수 하나하나를 "사용자 범위인가, 프로세스 범위인가"로 분류해서 사용자 범위인 것은 모두 비워야 한다. 이 레포는 쿼리 캐시는 `queryClient.clear()`(`App.tsx`의 `signOut`)로 이미 비우는데 auth 모듈은 그 원칙이 절반만 적용됐다.

또 하나의 원인은 **진실의 원천이 둘**이라는 점이다. "로그인 여부"를 디스크(SecureStore의 `user`)와 메모리(`session`)가 따로 갖고, 재시작에서 하나만 복원된다.

### 3. 공식 문서

- [Expo SDK 54 — SecureStore](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/securestore.mdx)
- [React Navigation — Authentication flows](https://reactnavigation.org/docs/auth-flow/) (토큰 복원/스플래시 패턴)
- [Node.js test runner](https://nodejs.org/docs/latest-v22.x/api/test.html)

### 4. 힌트

- **힌트 1 (방향)**: `auth.ts` 모듈 변수 4개를 "로그아웃 후에도 살아 있어야 하나?"로 분류해 보세요. 그다음 `logout()`이 그 분류와 맞는지 대조합니다. 재시작 불일치는 "로그인 여부의 진실이 어디에 있어야 하나"를 먼저 정하세요.
- **힌트 2 (API/패턴)**:
  - 진행 중인 비동기 작업을 무효화하는 방법: 작업 시작 시점의 "세대(generation)" 값을 기억해 두었다가 완료 시점에 현재 값과 비교하거나, 완료 시점에 현재 상태를 다시 확인합니다. 변수를 `null`로 만드는 것만으로는 이미 돌고 있는 async를 막지 못합니다.
  - `refreshCount`는 진단용 카운터입니다. 로그아웃 때 리셋할지, 테스트가 호출 전후 차이로 비교하도록 할지는 설계 선택입니다. 이유를 한 줄로 적어 두세요.
  - 재시작 불일치의 선택지: 토큰도 SecureStore에 저장/복원 / `user`는 있는데 `session`이 없으면 로그아웃 취급 / 보호 API 호출 시 재로그인 유도. 보안과 UX 트레이드오프를 비교하세요.
- **힌트 3 (함정)**:
  - `.finally(() => { x = null })`는 나중 세대의 변수를 지웁니다. 비울 때 "내 것인지" 확인해야 합니다.
  - 변수를 리셋해도 이미 돌던 promise가 끝나면서 다시 채웁니다 (경로 B).
  - 토큰을 SecureStore에 저장할 때 무엇을 저장하는지(특히 refresh token) 보안 영향을 생각하세요. 복원이 `isReady` 전에 끝나야 로그인 화면 깜빡임이 생기지 않습니다 (`App.tsx`의 `isReady` 선언 위 주석).
  - 재시작 불일치의 해법에 따라 재시작 후 로그인 화면이 다시 뜨는 등 **사용자 체감 동작이 달라질 수 있습니다.** 어떤 선택이든 바뀌는 점을 한 줄로 적어 두세요.
  - 새 테스트를 같은 파일에 추가하면 모듈 상태를 공유합니다 (경로 A). 테스트 순서/격리를 어떻게 처리할지 고민하세요. 기존 테스트의 4초 대기(`tests/auth.test.ts`에서 `login` 직후의 `setTimeout` 대기)는 Tier 2의 2-11 대상이므로 이 미션에서 손대지 않아도 됩니다.

### 5. 검증

```bash
nvm use 22.21.1
npm run typecheck
npm test            # tests/auth.test.ts (4.1초 대기 포함, 약 5초)
npx eslint .
```

- 테스트 추가 권장: 로그아웃 후 `isLoggedIn()`이 `false`, 진행 중 `login`을 await하지 않고 로그아웃했을 때 `isLoggedIn()`이 `false`로 유지, 그리고 테스트 순서와 무관하게 통과할 것.
- 시뮬레이터: 경로 D 재현 절차를 반복. 선택한 해법에 따라 재시작 후 기대 동작이 달라지므로, 먼저 기대 동작을 적고 확인한다.

### 6. 자기 체크리스트

말로 설명할 수 있다
- [ ] 모듈 변수 4개 각각이 사용자 범위인지 프로세스 범위인지, 이유 포함
- [ ] 진행 중인 `login`/갱신이 리셋을 어떻게 되살리는지
- [ ] 재시작 후 `user`와 `session`이 어긋나는 이유

직접 구현했다
- [ ] 로그아웃 후 다음 로그인에 이전 상태가 영향을 주지 않는다
- [ ] 진행 중 작업이 로그아웃을 되살리지 못한다
- [ ] 재시작 불일치를 하나의 방식으로 해결했고, 바뀐 동작을 적었다
- [ ] 위 동작을 `npm test`로 확인하는 테스트를 추가했다

### 7. 흔한 함정

- `logout()`에 모듈 변수 리셋만 추가하고 끝냄. 이미 돌던 async가 되살리는 경로(B, C)가 남는다.
- 테스트가 통과한 것만으로 충분하다고 판단함 (한 파일에 테스트 하나뿐이면 상태 누수가 안 보인다).
- 재시작 불일치를 "개발 중 리로드 때문"으로 치부함. 실제 앱 재시작에서도 동일하다.
- 해법이 바뀌는 사용자 동작(재시작 후 로그인 화면 등)을 고지하지 않음.
