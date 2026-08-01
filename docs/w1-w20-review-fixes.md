# W1–W20 코드 리뷰 수정 기록

> 출처: W1–W20 전체 `src/` 코드 리뷰 (4개 서브시스템 병렬 리뷰, ~39건) 후 전량 수정.
> 검증: `tsc --noEmit` 통과. 프로젝트에 테스트 스위트 없음(커리큘럼 앱) — 수동 스모크로 대체.
> PR: [#18](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/18)–[#31](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/31), [#33](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/33) (총 14개, `main` 기준 브랜치 분리 후 각각 병합).
> `fix/screen-login-profile`(로그인/프로필)은 원래 `fix/api-auth-race` 위에 스택된 PR #27이었으나, base 브랜치가 먼저 삭제되며 GitHub가 자동 close — 동일 브랜치를 `main` 기준으로 재오픈한 게 PR #33.

## api + auth (`src/api/`, `src/auth/`)

### 로그인 동시 호출 시 상태 덮어쓰기 — [`src/api/auth.ts`](../src/api/auth.ts) · [#18](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/18)

`login()`을 연타하면(예: 더블탭, 느린 네트워크 중 재시도) 각 호출이 독립적으로 400ms를 기다린 뒤 `session`을 덮어썼다. 먼저 시작한 호출이 나중에 끝나면 오래된 세션으로 덮어써질 수 있는 race. `refreshAccessToken()`엔 이미 `refreshInFlight` dedup이 있었는데 `login()`엔 없었던 게 비대칭.

```ts
// before
export async function login(username: string, password: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  if (password !== "1234")
    throw new Error("비밀번호가 틀림 (데모 비밀번호: 1234)");
  session = issueTokens();
}
```

```ts
// after
let loginInFlight: Promise<void> | null = null;

export async function login(username: string, password: string): Promise<void> {
  if (loginInFlight) return loginInFlight;
  loginInFlight = (async () => {
    await new Promise((r) => setTimeout(r, 400));
    if (password !== "1234")
      throw new Error("비밀번호가 틀림 (데모 비밀번호: 1234)");
    session = issueTokens();
  })().finally(() => {
    loginInFlight = null;
  });
  return loginInFlight;
}
```

동시 호출은 같은 Promise를 공유 — 먼저 들어온 요청 하나만 실제로 실행되고 나머지는 그 결과를 기다린다. `refreshAccessToken()`과 동일한 in-flight dedup 패턴.

### logout 후에도 살아있는 refresh promise

`logout()`이 `session`만 지우고 `refreshInFlight`는 그대로 뒀다. 로그아웃 직후 새로 로그인하면, 이전 refresh가 뒤늦게 resolve되며 새 세션을 덮어쓸 여지가 있었다.

```ts
// before
export function logout() {
  session = null;
}

// after
export function logout() {
  session = null;
  refreshInFlight = null;
}
```

### 401 처리 후 session null 단언

`fetchProtected()`가 refresh 이후 `session!`으로 non-null 단언하고 있었다 — refresh가 실패해도 컴파일러는 믿고 넘어가지만 런타임엔 `session`이 여전히 `null`일 수 있어 `session.accessToken` 접근 시 크래시.

```ts
// before
await refreshAccessToken();
return callProtectedApi(session!.accessToken);

// after
await refreshAccessToken();
if (!session) throw new Error("not authenticated");
return callProtectedApi(session.accessToken);
```

### AuthContext에 없던 에러 클리어 메서드 — [`src/auth/AuthContext.tsx`](../src/auth/AuthContext.tsx), [`App.tsx`](../App.tsx)

`persistError`(SecureStore 저장 실패 메시지)는 세팅만 있고 지우는 방법이 없어서, 로그아웃 후 재로그인해도 이전 에러 메시지가 화면에 계속 남아있었다. `clearPersistError()`를 context에 추가하고 `App.tsx`에서 구현. Batch 3의 `ProfileScreen.tsx`가 로그아웃 성공 시 이걸 호출하도록 연결됨.

```ts
// App.tsx — context value에 추가
clearPersistError: () => {
  setPersistError(null);
},
```

## 네트워크 재시도 — [`src/api/network.ts`](../src/api/network.ts) · [#19](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/19)

### jitter가 backoff 배수와 무관

```ts
// before
const delayMs = baseDelayMs * 2 ** attempt + Math.random() * baseDelayMs;
```

`attempt`가 커질수록 `2 ** attempt`로 지수 증가하는데, jitter 폭은 `baseDelayMs` 고정이라 attempt가 클수록 지터 비중이 상대적으로 작아진다(전체 지연에서 무의미해짐). 원래 지터의 목적(동시 재시도 요청들의 재시도 시점을 분산시켜 thundering herd 방지)이 attempt가 커질수록 약해지는 셈.

```ts
// after
const baseBackoff = baseDelayMs * 2 ** attempt;
const delayMs = baseBackoff * (1 + Math.random() * 0.5);
```

지터를 현재 backoff 값에 비례(최대 +50%)하게 바꿔서, attempt 크기와 무관하게 항상 유의미한 분산 효과를 유지.

### 마지막 실패의 에러 컨텍스트 소실

```ts
// before
if (attempt >= maxRetries) throw e;

// after
if (attempt >= maxRetries) {
  const err = e as Error;
  throw new Error(`Request failed after ${attempt + 1} attempts: ${err.message}`);
}
```

원본 에러만 그대로 던지면 호출부/로그에서 "몇 번 재시도하다 실패했는지"를 알 수 없다. 시도 횟수를 메시지에 포함.

## posts 캐시 — [`src/api/posts.ts`](../src/api/posts.ts) · [#20](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/20)

### optimistic update의 snapshot/cancel 순서

```ts
// before
onMutate: async (id: number) => {
  await queryClient.cancelQueries({ queryKey: ["posts"] });
  const prev = queryClient.getQueryData(["posts"]);
  ...
}

// after
onMutate: async (id: number) => {
  const prev = queryClient.getQueryData(["posts"]);
  await queryClient.cancelQueries({ queryKey: ["posts"] });
  ...
}
```

`cancelQueries`는 진행 중인 요청을 취소하는데, 그 요청이 취소되기 직전에 이미 캐시에 응답을 반영해버릴 수 있다. `cancelQueries` **이후**에 snapshot을 뜨면, 그 사이에 끼어든 응답이 반영된 상태를 "롤백 지점"으로 잘못 저장하게 된다. 롤백 시 원치 않는 상태로 복원되는 버그로 이어짐 — 순서를 snapshot 먼저로 뒤집어야 안전.

### 페이지네이션 오프바이원

```ts
// before
getNextPageParam: (lastPage, allPages) =>
  lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,

// after
getNextPageParam: (lastPage, allPages) =>
  lastPage.length < PAGE_SIZE ? undefined : 1 + allPages.length,
```

`initialPageParam: 1`인데 다음 페이지 계산이 `allPages.length + 1`로 1-based 기준을 하드코딩하고 있었다. 값 자체는 우연히 같지만(1페이지 로드 후 `allPages.length`가 1이므로 결과는 동일), `initialPageParam`을 바꾸면 깨지는 암묵적 결합이었다 — 명시적으로 `initialPageParam` 기준임을 드러내는 표현으로 정리.

### 삭제 후 빈 페이지 잔존

```ts
// before
pages: old.pages.map((page: Post[]) =>
  page.filter((p) => p.id !== id),
),

// after
pages: old.pages
  .map((page: Post[]) => page.filter((p) => p.id !== id))
  .filter((page: Post[]) => page.length > 0),
```

한 페이지의 마지막 글을 삭제하면 빈 배열 페이지가 그대로 남아, `FlatList`가 그 페이지의 섹션 헤더(있다면)나 빈 공간을 렌더링할 수 있었다. 삭제 후 빈 페이지를 걸러냄.

### 좋아요 토글 시 캐시 미스 무시

```ts
// before
onSuccess: (data, { id }) => {
  queryClient.setQueryData<Post>(["post", id], (old) =>
    old ? { ...old, liked: data.liked } : old,
  );
},

// after
onSuccess: (data, { id }) => {
  const old = queryClient.getQueryData<Post>(["post", id]);
  if (!old) {
    console.warn(`Post ${id} not found in cache after like toggle`);
    queryClient.invalidateQueries({ queryKey: ["post", id] });
  } else {
    queryClient.setQueryData<Post>(["post", id], { ...old, liked: data.liked });
  }
},
```

캐시에 해당 post가 없으면(예: 상세 화면을 벗어나 캐시가 gc된 상태) 이전 코드는 조용히 아무 일도 안 했다 — 서버는 좋아요가 반영됐는데 클라이언트 캐시는 다음에 그 post를 다시 열 때까지 낡은 상태로 남는다. 캐시 미스를 로그로 남기고 `invalidateQueries`로 다음 접근 시 최신값을 강제로 재조회하게 함.

## 데이터 화면 (Feed*, Compose)

### FlatList 배열 참조 불안정 — [`src/screens/FeedListScreen.tsx`](../src/screens/FeedListScreen.tsx) · [#21](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/21)

```tsx
// before
const posts = data?.pages.flat() ?? [];

// after
const posts = useMemo(() => data?.pages.flat() ?? [], [data]);
```

`data`가 안 바뀐 리렌더(예: 다른 state 변경으로 인한 리렌더)에서도 `.flat()`이 매번 새 배열을 만든다. `FlatList`는 `data` prop 참조가 바뀌면 재조정을 더 하게 되므로, `data`가 실제로 바뀔 때만 새 배열을 만들도록 `useMemo`로 참조를 고정.

### 시트 닫을 때 상태 잔존

```tsx
// before
const closeSheet = useCallback(() => sheetRef.current?.close(), []);

// after
const closeSheet = useCallback(() => {
  setSheetPost(null);
  sheetRef.current?.close();
}, []);
```

바텀시트를 닫아도 `sheetPost` state가 이전 글을 계속 참조하고 있었다 — 다음에 시트가 다시 열리기 전 잠깐이라도 `sheetPost` 참조 코드가 실행되면 낡은 글을 대상으로 동작할 수 있는 여지.

### 삭제 중복 호출

```tsx
// before
onDelete={() => deletePost.mutate(item.id)}
...
if (sheetPost) deletePost.mutate(sheetPost.id);

// after
onDelete={() => !deletePost.isPending && deletePost.mutate(item.id)}
...
if (sheetPost && !deletePost.isPending) deletePost.mutate(sheetPost.id);
```

스와이프 삭제와 시트 삭제 두 경로 모두 in-flight 가드가 없어서, 삭제 요청이 아직 안 끝난 상태에서 같은 글을 다시 삭제 트리거할 수 있었다(더블탭, 스와이프+시트 동시 등). `deletePost.isPending`으로 가드.

### id 없는 상세 화면 진입 — [`src/screens/FeedDetailScreen.tsx`](../src/screens/FeedDetailScreen.tsx) · [#22](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/22)

```tsx
// after (추가)
const { id } = route.params;

if (!id) {
  return (
    <View style={[styles.screen, styles.pad, styles.center]}>
      <Text style={styles.h1}>글을 찾을 수 없음</Text>
      <Btn label="← 뒤로" onPress={() => navigation.goBack()} />
    </View>
  );
}
```

딥링크(`feed/:id`)로 `id` 없이 진입하는 경로가 이론상 가능한데 이전엔 가드가 없어 `id`가 `undefined`인 채로 아래 쿼리 로직까지 흘러갔다. 명시적 "글을 찾을 수 없음" 상태로 조기 반환.

```tsx
// before
<Text style={styles.hint}>{(error as Error).message}</Text>

// after
<Text style={styles.hint}>{error instanceof Error ? error.message : String(error)}</Text>
```

`as Error` 캐스팅은 실제로 `Error` 인스턴스가 아닌 값(문자열 throw, 다른 라이브러리의 커스텀 에러 등)이 들어와도 컴파일러가 통과시킨다 — 런타임에 `.message`가 `undefined`로 조용히 깨짐. `instanceof` 체크 후 아니면 `String()`으로 안전하게 변환.

### 이미지 로딩이 영원히 안 끝나는 경우 — [`src/screens/ComposeScreen.tsx`](../src/screens/ComposeScreen.tsx) · [#23](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/23)

`onLoad`/`onError` 둘 다 안 불리는 상황(네트워크 자체가 멈춤 등)이면 스피너가 무한히 돈다.

```tsx
// after (추가)
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  timeoutRef.current = setTimeout(() => {
    setIsLoading(false);
  }, 10000); // 10초 타임아웃

  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, []);
```

`onLoad`/`onError` 각각에서도 성공/실패로 끝났으면 이 타임아웃을 `clearTimeout`으로 해제. 두 핸들러가 거의 동일했던 것도 이 김에 정리:

```tsx
// before
onLoad={() => setIsLoading(false)}
onLoadEnd={() => setIsLoading(false)}

// after
onLoad={() => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  setIsLoading(false);
}}
```

기타: `headerHeight as number` 캐스팅을 `headerHeight ?? 0`으로(값이 없을 때 캐스팅은 `undefined`를 `number`라 속이는 것뿐, 실제 안전장치가 안 됨), 인라인 스피너 위치 스타일을 `StyleSheet.create`로 추출.

## 디바이스 연동 화면

### 사진/카메라 결과 빈 배열 인덱싱 — [`src/screens/PhotoScreen.tsx`](../src/screens/PhotoScreen.tsx) · [#24](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/24)

```tsx
// before
if (result.canceled) return;
setUri(result.assets[0].uri);

// after
if (result.canceled || !result.assets || result.assets.length === 0) return;
setUri(result.assets[0].uri);
```

`canceled`가 `false`여도 `assets`가 빈 배열인 엣지 케이스(플랫폼/버전에 따라 발생 가능)에서 `[0]` 인덱싱이 `undefined.uri`로 크래시. 카메라/갤러리 두 호출 지점 모두 동일하게 가드.

### 위치 조회 무한 대기 — [`src/screens/LocationScreen.tsx`](../src/screens/LocationScreen.tsx)

```tsx
// before
const currentLocation = await getCurrentPositionAsync({
  accuracy: Accuracy.Balanced,
});

// after
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("위치 조회 시간 초과")), 15000)
);
const currentLocation = await Promise.race([
  getCurrentPositionAsync({ accuracy: Accuracy.Balanced }),
  timeoutPromise,
]) as Awaited<ReturnType<typeof getCurrentPositionAsync>>;
```

권한이 있어도 실내/GPS 미확보 상태면 `getCurrentPositionAsync`가 응답 없이 계속 대기할 수 있다. `Promise.race`로 15초 타임아웃을 걸고, 실패 시 기존 에러 처리 경로(`catch`)로 흘러가 사용자에게 메시지 표시.

### 알림 권한 요청 중복 및 에러 미처리 — [`src/screens/NotificationScreen.tsx`](../src/screens/NotificationScreen.tsx) · [#25](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/25)

`scheduleNow()`와 `scheduleDelayed()`에 완전히 동일한 권한 요청 블록이 중복돼 있었다.

```tsx
// before (양쪽에 중복)
if (!status?.granted) {
  const res = await Notifications.requestPermissionsAsync();
  setStatus(res);
  if (!res.granted) return;
}

// after — 헬퍼로 통합
const requestAndSetPermission = async () => {
  if (!status?.granted) {
    const res = await Notifications.requestPermissionsAsync();
    setStatus(res);
    if (!res.granted) return false;
  }
  return true;
};

const scheduleNow = async () => {
  if (!(await requestAndSetPermission())) return;
  ...
};
const scheduleDelayed = async () => {
  if (!(await requestAndSetPermission())) return;
  ...
};
```

또한 마운트 시 `getPermissionsAsync()`에 에러 처리가 없어 실패 시(플랫폼 이슈 등) 조용히 죽었던 것을 `.catch()`로 잡아 `permissionError` state에 반영.

### WebSocket/타이머 누수 · 불안정 key · ratio 범위 — [`src/screens/NetworkScreen.tsx`](../src/screens/NetworkScreen.tsx) · [#26](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/26)

```tsx
// after (추가)
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  return () => {
    if (wsRef.current) wsRef.current.close();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, []);
```

화면을 벗어나도 WebSocket 연결과 재연결 예약용 `setTimeout`이 정리되지 않아, 언마운트 후에도 재연결 루프가 백그라운드에서 계속 돌 수 있었다. cleanup 추가, 기존 `setTimeout(...)` 호출도 `timeoutRef`에 담아 추적하도록 변경.

```tsx
// before
const appendLog = (text: string) =>
  setLogs((prev) => [{ id: prev.length, text }, ...prev]);

// after
const logIdRef = useRef(0);
const appendLog = (text: string) =>
  setLogs((prev) => [{ id: logIdRef.current++, text }, ...prev]);
```

`prev.length`를 key로 쓰면 로그를 삭제/필터링하는 경우 중복 key가 생길 수 있다(현재 코드엔 삭제 로직이 없지만, key 안정성은 배열 길이가 아니라 발급 시점에 고정된 값이어야 함이 원칙). 단조 증가 카운터로 교체.

```tsx
// before
setUploadRatio(p.ratio)

// after
setUploadRatio(Math.min(1, Math.max(0, p.ratio)))
```

업로드 진행률 콜백이 반환하는 `ratio`가 구현/플랫폼 차이로 `[0,1]` 범위를 살짝 벗어날 수 있어(예: 1.0001) 프로그레스바 렌더링이 이상해질 여지 — clamp 추가.

### 로그인 성공 후 signIn 실패 처리 — [`src/screens/LoginScreen.tsx`](../src/screens/LoginScreen.tsx) · [#33](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/33)

```tsx
// before
await login(values.username, values.password);
signIn(values.username);
...
} catch (e) {
  setLoginError((e as Error).message);
}

// after
await login(values.username, values.password);
try {
  signIn(values.username);
} catch (signInError) {
  const message = signInError instanceof Error ? signInError.message : String(signInError);
  setLoginError(message);
}
...
} catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  setLoginError(message);
}
```

`login()`(서버 세션 발급)은 성공했는데 `signIn()`(로컬 auth context 갱신, SecureStore 저장 등)이 실패하면 바깥 `catch`가 이걸 잡아 "로그인 실패"로 잘못 표시하면서, 실제로는 서버 세션이 이미 발급된 채로 로컬 상태만 어긋난 채 남는 상황이 생길 수 있었다. `signIn()`을 별도 try/catch로 감싸 원인을 구분.

### 로그아웃 중복 탭 · persistError 잔존 — [`src/screens/ProfileScreen.tsx`](../src/screens/ProfileScreen.tsx) · [#33](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/33)

```tsx
// before
<Btn label="로그아웃" onPress={signOut} kind="danger" />

// after
const [isSigningOut, setIsSigningOut] = useState(false);

const handleSignOut = async () => {
  setIsSigningOut(true);
  try {
    await signOut();
    clearPersistError?.();
  } catch (e) {
    // signOut error is handled by auth context
  } finally {
    setIsSigningOut(false);
  }
};

<Btn
  label={isSigningOut ? "로그아웃 중…" : "로그아웃"}
  onPress={handleSignOut}
  disabled={isSigningOut}
  kind="danger"
/>
```

버튼에 in-flight 가드가 없어 연타 시 `signOut()`이 중복 호출될 수 있었다. 성공 후 Batch 1에서 추가한 `clearPersistError()`를 호출해, 이전 세션에서 남은 SecureStore 저장 실패 메시지가 다음 로그인까지 화면에 남아있던 문제도 같이 해소.

## 컴포넌트 + 네비게이션 + 테마

### 색상 하드코딩 중복 — [`src/theme/styles.ts`](../src/theme/styles.ts), [`src/components/Btn.tsx`](../src/components/Btn.tsx) · [#28](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/28)

`#93c5fd`(ghost 텍스트 색)가 `Btn.tsx`와 `theme/styles.ts` 두 곳에 각각 하드코딩돼 있었다 — 색을 바꾸려면 두 파일을 같이 고쳐야 하고, 하나만 놓치면 화면마다 색이 미묘하게 달라지는 버그가 생긴다.

```ts
// theme/styles.ts (추가)
export const colors = {
  ghostText: "#93c5fd",
};
```

```tsx
// Btn.tsx
// before
<Text style={[styles.btnText, kind === "ghost" && { color: "#93c5fd" }]}>

// after
import { styles, colors } from "../theme/styles";
<Text style={[styles.btnText, kind === "ghost" && { color: colors.ghostText }]}>
```

`sectionHeader.color`도 같은 토큰 참조로 변경.

### SwipeableRow 매직넘버 · 제스처 의도 — [`src/components/SwipeableRow.tsx`](../src/components/SwipeableRow.tsx) · [#29](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/29)

`DELETE_THRESHOLD`/`OFFSCREEN` 상수는 이전 작업에서 이미 추출돼 있었음(리뷰 시점 기준). 이번엔 `Gesture.Race(pan, longPress)`가 왜 필요한지(두 제스처가 같은 행 위에서 충돌하므로 상호배타적으로 묶어야 함) 설명하는 주석 한 줄만 추가:

```tsx
// Race: pan과 longPress는 상호배타적 — 먼저 조건을 만족한 것만 처리되고 나머지는 취소됨
<GestureDetector gesture={Gesture.Race(pan, longPress)}>
```

### FeedSkeleton 하드코딩 — [`src/components/FeedSkeleton.tsx`](../src/components/FeedSkeleton.tsx) · [#30](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/30)

```tsx
// before
{[0, 1, 2, 3].map((i) => (
  <Animated.View key={i} style={[styles.row, shimmer]}>
    <View style={styles.skeletonThumb} />
    <View style={{ flex: 1, gap: 8 }}>

// after
const SKELETON_COUNT = 4;
const localStyles = StyleSheet.create({
  skeletonRow: { flex: 1, gap: 8 },
});
...
{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
  <Animated.View key={i} style={[styles.row, shimmer]}>
    <View style={styles.skeletonThumb} />
    <View style={localStyles.skeletonRow}>
```

스켈레톤 개수(`[0,1,2,3]`)가 매직 리터럴이었던 것을 이름 있는 상수로, 인라인 스타일 객체(매 렌더 새로 생성)를 `StyleSheet.create`로 추출.

### 딥링크 누락 · 탭 옵션 패턴 불일치 — [`src/navigation/index.tsx`](../src/navigation/index.tsx) · [#31](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/31)

```tsx
// linking config — before엔 FeedSections 항목 자체가 없었음
HomeTab: {
  screens: {
    FeedList: "feed",
    FeedSections: "feed/sections", // 추가
    FeedDetail: "feed/:id",
  },
},
```

`FeedSections` 화면 자체는 있는데 딥링크 설정엔 라우트가 없어서, 그 화면으로의 딥링크가 동작하지 않았다.

```tsx
// before — Tab.Navigator에 screenOptions 인라인
<Tab.Navigator
  screenOptions={{
    headerStyle: styles.header,
    headerTintColor: "#fff",
    tabBarStyle: styles.tabBar,
    tabBarActiveTintColor: "#93c5fd",
    tabBarInactiveTintColor: "#8a92a6",
  }}
>

// after — 다른 곳의 stackHeader 패턴처럼 상수로 추출
const tabsScreenOptions = {
  headerStyle: styles.header,
  headerTintColor: "#fff",
  tabBarStyle: styles.tabBar,
  tabBarActiveTintColor: "#93c5fd",
  tabBarInactiveTintColor: "#8a92a6",
};

<Tab.Navigator screenOptions={tabsScreenOptions}>
```

기능 변화는 없음 — 다른 네비게이터들이 이미 쓰던 "screenOptions를 모듈 상단 상수로 분리" 패턴과 통일해 일관성 확보.
