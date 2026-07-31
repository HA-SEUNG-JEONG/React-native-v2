# P6 학습 가이드 — 폼 · 네트워킹 · 오프라인

> 출처: [React Native `TextInput`](https://reactnative.dev/docs/textinput) · [`KeyboardAvoidingView`](https://reactnative.dev/docs/keyboardavoidingview) · [react-hook-form](https://react-hook-form.com/) · [zod](https://zod.dev/) · [`@hookform/resolvers`](https://github.com/react-hook-form/resolvers)
> 검증: rn-sandbox-app `src/screens/LoginScreen.tsx`, `src/screens/NetworkScreen.tsx`, `src/api/auth.ts` — `tsc --noEmit` 통과 (RN 0.81 / Expo SDK 54)

P6은 P1~P5에서 만든 앱 뼈대에 실전 기능 3종을 붙인다: 폼, 네트워킹, 오프라인. W15는 그중 폼 심화와 네트워킹 기초.

---

## W15 — 폼 심화 (`LoginScreen`)

### react-hook-form + zod는 웹 지식 그대로

`LoginScreen`을 버튼 하나짜리 가짜 로그인에서 실제 입력 폼으로 바꿨다. 라이브러리는 웹에서 쓰던 것과 동일 — `useForm` + `Controller` + `zodResolver`. RN에서 달라지는 건 딱 하나, `<input>` 대신 `<TextInput>`을 `Controller`의 `render`에 연결하는 것뿐이다.

```tsx
const schema = z.object({
  username: z.string().min(2, "2자 이상 입력"),
  password: z.string().min(4, "4자 이상 입력"),
});
type FormValues = z.infer<typeof schema>;

const { control, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } });
```

`z.infer<typeof schema>`로 스키마 하나가 검증 규칙과 TypeScript 타입을 동시에 준다 — 별도 인터페이스 안 만들어도 됨.

`Controller`가 필요한 이유: RN `TextInput`은 웹 `<input>`처럼 `ref` 기반 uncontrolled 등록(`register`)이 그대로 안 먹는 경우가 있어, react-hook-form 문서가 RN엔 `Controller`를 표준으로 권장한다.

```tsx
<Controller
  control={control}
  name="username"
  render={({ field: { onChange, onBlur, value } }) => (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
    />
  )}
/>
{errors.username && <Text style={styles.hint}>{errors.username.message}</Text>}
```

### `KeyboardAvoidingView` — 플랫폼별로 동작이 다르다

키보드가 인풋을 가리는 문제. `behavior` 값이 iOS/Android에서 다르게 필요하다:

```tsx
<KeyboardAvoidingView
  style={styles.screen}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>
```

- iOS: `"padding"` — 화면 하단에 키보드 높이만큼 padding을 넣어 밀어올림.
- Android: 보통 `windowSoftInputMode: adjustResize`(AndroidManifest 기본값)가 이미 리사이즈를 처리해서 `behavior`를 아예 안 줘도 되는 경우가 많지만, 명시적으로 맞추려면 `"height"`를 쓴다. `"padding"`을 Android에 그대로 쓰면 과도하게 밀리는 경우가 있어 문서가 분리해서 쓰라고 권한다.

### 검증 — 폼

- [x] 아이디 2자 미만 → 에러 메시지 표시, 제출 안 됨
- [x] 비밀번호 4자 미만 → 에러 메시지 표시
- [x] 유효 입력 + 비밀번호 `1234` → 로그인 성공
- [x] 유효 입력 + 틀린 비밀번호 → `api/auth.ts`의 에러 메시지 표시 (폼 자체 검증과 서버측 실패를 분리)

---

## W15 — 네트워킹 기초 (`NetworkScreen`, `api/auth.ts`)

> 실제 백엔드 없이 메모리 세션으로 인터셉터 + 토큰 갱신을 흉내냈다. 핵심 개념은 API 형태가 아니라 **레이스 컨디션 방지 패턴** 그 자체 — 이건 axios interceptor든 뭐든 그대로 옮겨 쓸 수 있다.

### 토큰 갱신 레이스란

액세스 토큰이 만료된 상태에서 화면이 API를 동시에 여러 개 호출하면(예: 탭 전환 시 여러 위젯이 각자 데이터를 요청), 각 요청이 전부 401을 만나 **전부 리프레시를 시도**할 수 있다. 리프레시 토큰은 보통 1회용(rotate)이라 두 번째 리프레시가 이미 무효화된 토큰으로 실패 → 멀쩡한 세션인데 로그아웃되는 버그로 이어진다.

### 해법 — 진행 중인 리프레시를 공유(dedupe)

```ts
let refreshInFlight: Promise<Tokens> | null = null;

function refreshAccessToken(): Promise<Tokens> {
  if (refreshInFlight) return refreshInFlight; // 이미 갱신 중이면 그 Promise를 같이 기다림
  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}
```

동시에 3개 요청이 401을 만나도, 첫 요청이 `refreshInFlight`를 채워두면 나머지 둘은 새 갱신을 안 만들고 같은 Promise를 `await`한다 — 실제 네트워크 호출은 1번만 나간다.

### 인터셉터 — 401 → 갱신 → 1회 재시도

```ts
export async function fetchProtected(): Promise<string> {
  if (!session) throw new Error("로그인 필요");
  try {
    return await callProtectedApi(session.accessToken);
  } catch (e) {
    if ((e as Error & { status?: number }).status !== 401) throw e;
    await refreshAccessToken();
    return callProtectedApi(session!.accessToken); // 갱신된 세션으로 재시도
  }
}
```

`axios`였다면 이 로직이 response interceptor에 들어간다. 여기선 서버가 없어 `fetch` 대신 지연 + 만료시각 비교로 흉내냈지만, **401 감지 → 단일 갱신 → 재시도**라는 흐름은 동일하다.

### 검증 — 네트워킹

- [x] 액세스 토큰 발급 직후(4초 이내) 호출 → 갱신 없이 바로 성공
- [x] 4초 이상 대기 후 호출 → 401 → 갱신 → 재시도 성공 (로그에 "갱신" 표시)
- [x] 4초 이상 대기 후 동시 요청 3개 → 성공 3건이지만 실제 갱신 호출은 1회로 로그에 확인됨 (레이스 방지 확인)

---

## W17 — 오프라인 우선 (쿼리 영속화, 뮤테이션 큐잉/동기화)

> 출처: [TanStack Query — Persist a Client](https://tanstack.com/query/v5/docs/framework/react/plugins/persistQueryClient) · [Offline mutations](https://tanstack.com/query/v5/docs/framework/react/guides/offline-mutations)

### MMKV 대신 AsyncStorage를 쓴 이유

커리큘럼은 MMKV를 명시하지만, MMKV는 네이티브 모듈이라 **Expo Go에서 못 돈다** — dev client(EAS build)가 필요함. 이 프로젝트는 아직 `expo start`(Expo Go)로 굴러가고, dev client 전환은 스터디 로드맵상 P8 항목이다. 그래서 지금은 `@react-native-async-storage/async-storage`로 같은 "쿼리 캐시 영속화" 개념을 구현했다 — `src/api/persist.ts`의 `createAsyncStoragePersister` 하나만 MMKV 기반 storage로 바꾸면 나머지 코드(뮤테이션 큐잉, 재생 로직)는 그대로 재사용 가능.

```ts
// src/api/persist.ts
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "rn-sandbox-query-cache",
});
```

### 쿼리 캐시 영속화

`App.tsx`에서 `QueryClientProvider` → `PersistQueryClientProvider`로 교체. 앱을 껐다 켜도 마지막으로 받은 피드 목록/상세가 `AsyncStorage`에서 즉시 복원되어, 네트워크가 붙기 전에도 화면이 빈 상태가 아니다(`FeedListScreen`의 기존 `isPaused` 배너가 이 상태를 알려줌).

### 뮤테이션 큐잉 + 재연결 시 자동 동기화

핵심 문제: 오프라인일 때 "좋아요" 버튼을 누르면 React Query는 뮤테이션을 실행하지 않고 **paused** 상태로 큐에 남긴다. 문제는 그 뮤테이션의 `mutationFn`이 `useMutation` 훅 안에만 있으면 앱 재시작 시 유실된다는 것 — 캐시는 복원돼도 "무엇을 재생해야 하는지"를 잃는다.

해결: `mutationFn`을 컴포넌트가 아니라 `queryClient.setMutationDefaults(key, {...})`로 전역 등록(`src/api/posts.ts`). 그러면 앱 재시작 → 캐시 복원 → `PersistQueryClientProvider`의 `onSuccess`에서 `queryClient.resumePausedMutations()` 호출 → 등록된 `mutationFn`으로 큐에 남은 뮤테이션이 재생된다. `FeedDetailScreen`이 마운트조차 안 돼 있어도 동작한다.

```ts
// src/api/posts.ts
export const TOGGLE_LIKE_KEY = ["toggleLike"] as const;
queryClient.setMutationDefaults(TOGGLE_LIKE_KEY, {
  mutationFn: ({ id, next }: { id: string; next: boolean }) => toggleLikeApi(next),
  onSuccess: (data, { id }) => {
    queryClient.setQueryData<Post>(["post", id], (old) =>
      old ? { ...old, liked: data.liked } : old,
    );
  },
});
```

```tsx
// App.tsx
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
  onSuccess={() => queryClient.resumePausedMutations()}
>
```

`FeedDetailScreen`의 낙관적 업데이트(W14 이전부터 있던 패턴)는 그대로 유지 — `onMutate`로 즉시 반영, `onError`로 롤백. 다만 이제 `mutate()` 호출부의 변수 모양이 `{ id, next }`로 바뀌었다(전역 `mutationFn`이 `id`를 알아야 어떤 글의 캐시를 갱신할지 알 수 있어서). 오프라인 중엔 `useMutationState`로 이 글의 좋아요가 큐에 걸려 있는지 감지해 배너를 보여준다.

### 동기화·충돌

기존 `toggleLikeApi`의 **40% 랜덤 실패**가 그대로 "충돌" 시뮬레이션 역할을 한다: 오프라인 중 누른 좋아요가 재연결 후 재생되며 실패하면, 화면엔 이미 낙관적으로 반영된 값이 남아 있지만 서버(가짜 API라 실제 저장은 안 하지만)와는 동기화가 안 된 상태 — 로컬 우선(local-first) 오프라인 큐잉의 전형적인 트레이드오프다. 이 프로젝트 스코프에서는 별도 충돌 해결 UI 없이 `likeMutation.isError` 배너로 알리는 선까지만 구현했다(실서버 붙을 때 서버값 재조회로 최종 동기화하는 게 다음 단계).

### 검증 — 오프라인

- [x] `tsc --noEmit` 통과
- [x] `setMutationDefaults` 등록/`resumePausedMutations` 배선을 코드 레벨로 확인
- [ ] 실기기/시뮬레이터에서 비행기 모드 → 좋아요 탭(큐잉 배너 확인) → 앱 재시작 → 비행기 모드 해제 → 자동 동기화까지 전체 체인 실측 필요 — 이번 세션 미수행

---

## 파일

| 파일 | 역할 |
|---|---|
| `src/screens/LoginScreen.tsx` | react-hook-form + zod 로그인 폼, `KeyboardAvoidingView` |
| `src/screens/NetworkScreen.tsx` | 인터셉터 + 토큰 갱신 레이스 데모 화면 |
| `src/api/auth.ts` | 메모리 세션 기반 가짜 토큰 발급/검증/갱신 (레이스 방지 포함) |
| `src/api/persist.ts` | AsyncStorage 기반 쿼리 캐시 persister (MMKV 대체) |
| `src/screens/FeedDetailScreen.tsx` | 낙관적 좋아요 + 오프라인 큐잉 배너 (W17에서 확장) |

## 남은 작업

- W16 네트워킹 심화: 재시도/백오프, 업로드 진행률, `WebSocket` 개념
- W17 오프라인 우선 — 완료. 쿼리 캐시 영속화(AsyncStorage, MMKV는 dev client 전환 후 교체 예정) + 뮤테이션 큐잉/재생 + 낙관적 업데이트/롤백. 전체 오프라인→재연결 체인의 실기기 검증은 남음.
