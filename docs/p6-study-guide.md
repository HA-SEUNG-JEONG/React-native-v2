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

## 파일

| 파일 | 역할 |
|---|---|
| `src/screens/LoginScreen.tsx` | react-hook-form + zod 로그인 폼, `KeyboardAvoidingView` |
| `src/screens/NetworkScreen.tsx` | 인터셉터 + 토큰 갱신 레이스 데모 화면 |
| `src/api/auth.ts` | 메모리 세션 기반 가짜 토큰 발급/검증/갱신 (레이스 방지 포함) |

## 남은 작업

- W16 네트워킹 심화: 재시도/백오프, 업로드 진행률, `WebSocket` 개념
- W17 오프라인 우선: React Query 영속화(MMKV), 낙관적 업데이트+롤백, 동기화/충돌
