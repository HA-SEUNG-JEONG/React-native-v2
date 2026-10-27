# Day 38 · 12/17 (목) — 폼 UX: 포커스 이동, 에러 표시, 제출 중 상태

> 전제: Day 23·36의 모의 로그인 화면(`app/sign-in.tsx`)과 `src/contexts/AuthContext.tsx`의 `signIn`(성공하면 토큰을 SecureStore에 저장), Day 6의 `KeyboardAvoidingView`와 제목→본문 포커스 이동(`useRef`), Day 37의 `react-hook-form`·`zod` 설치와 `Controller` 패턴이 있다. Day 23의 모의 `signIn`은 빈 이메일이나 4자 미만 비밀번호만 reject하므로, 서버 에러를 재현하려고 비밀번호가 `'wrong-password'`일 때 reject하는 임시 분기를 추가한다.

## 오늘의 목표

로그인 폼을 react-hook-form으로 바꾸고, 이메일에서 다음 칸으로 포커스를 넘기며, 제출 중 상태와 서버 에러를 화면에 보여 준다.

## 읽기(15분)

- https://reactnative.dev/docs/0.81/textinput
  - `returnKeyType`(또는 우선하는 `enterKeyHint`)은 키보드의 return 키 모양이다. `onSubmitEditing`은 return 키를 눌렀을 때 호출된다.
  - 한 줄 입력의 `submitBehavior` 기본값은 `'blurAndSubmit'`(입력을 블러하고 제출)이다. 키보드를 내리지 않고 다음 칸으로 넘기려면 `'submit'`을 준다. `blurOnSubmit`은 deprecated다.
  - `ref.focus()`로 포커스를 옮긴다. `autoComplete`와 iOS 전용 `textContentType`을 둘 다 주면 `textContentType`이 우선하므로 하나만 쓴다.
- https://react-hook-form.com/docs/useform/handlesubmit
  - `formState.isSubmitting`은 `onSubmit`이 반환한 Promise가 끝날 때까지 true다(요청을 `await`하거나 반환하지 않으면 바로 false가 된다). `handleSubmit`은 중복 제출을 막아 주지 않으므로 버튼을 비활성화해야 한다.
  - `onSubmit`이 throw하면 `handleSubmit`이 다시 던지고 `formState.errors`에는 아무것도 들어가지 않는다. try/catch에서 `setError('root.server', { message })`로 서버 에러를 담고 `errors.root?.server`로 읽는다.
- https://react-hook-form.com/docs/useform/setfocus
  - `setFocus(name)`은 그 필드의 `ref`에 `focus()`를 호출하므로 `Controller`의 `field.ref`를 `TextInput`의 `ref`에 연결해야 한다.

## 예측(10분)

1. 이메일 칸에서 return 키를 눌렀을 때 `submitBehavior`를 지정하지 않으면 키보드는 어떻게 될까? `submitBehavior="submit"`을 주고 `setFocus('password')`를 호출하면 어떻게 달라질까?

> 내 예측:

2. 로그인 요청이 0.6초 걸리는 동안 로그인 버튼을 두 번 빠르게 누르면 `signIn`은 몇 번 호출될까? 버튼에 `disabled={isSubmitting}`를 달았을 때는?

> 내 예측:

3. 키보드가 열린 채로 `ScrollView` 안의 로그인 버튼을 한 번 누르면, `keyboardShouldPersistTaps` 기본값(`'never'`)에서 버튼의 `onPress`가 호출될까?

> 내 예측:

## 만들기(40분)

새로 만들거나 고칠 파일:
- `src/schemas/auth.ts`: `loginSchema`(`z.email({ error: '...' })`, 비밀번호 4자 이상 — Day 23의 모의 규칙과 같게)와 `LoginForm` 타입.
- `app/sign-in.tsx`: Day 23의 `useState` 폼을 `useForm<LoginForm>`과 `Controller` 두 개로 바꾼다. Day 6의 `useRef` 포커스 이동은 `setFocus`로 대체한다.
  - 이메일 칸: `keyboardType="email-address"`, `autoCapitalize="none"`, `autoComplete="email"`, `returnKeyType="next"`, `submitBehavior="submit"`, `onSubmitEditing={() => setFocus('password')}`.
  - 비밀번호 칸: `secureTextEntry`, `autoComplete="current-password"`, `enterKeyHint="go"`, `onSubmitEditing={handleSubmit(onSubmit)}`.
  - 각 칸의 `ref`에 `field.ref`를 연결한다.
  - 칸 아래에 `fieldState.error?.message`를 보여 주고, 에러가 있는 칸은 테두리 색을 바꾼다. 색은 Day 53 테마 토큰이 없으므로 `StyleSheet`의 상수 하나로 둔다.
  - `onSubmit`은 `async`로 `await signIn(...)`한다. 실패하면 `catch`에서 `setError('root.server', { message: '이메일 또는 비밀번호가 올바르지 않습니다' })`를 호출하고, 폼 상단에 `errors.root?.server?.message`를 보여 준다.
  - 버튼은 `isSubmitting` 동안 비활성화하고 라벨 대신 `ActivityIndicator`를 보여 준다.
  - 폼은 `ScrollView`로 감싸고 `keyboardShouldPersistTaps="handled"`를 준다.

핵심 호출 형태:

```tsx
const { control, handleSubmit, setFocus, setError, formState: { isSubmitting, errors } } =
  useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
// <TextInput ref={field.ref} ... onSubmitEditing={() => setFocus('password')} />
```

완료 기준:
- [ ] 이메일 칸에서 return 키를 누르면 키보드가 내려가지 않고 비밀번호 칸으로 포커스가 이동한다.
- [ ] 비밀번호 칸에서 return 키를 누르면 폼이 제출된다.
- [ ] 형식이 틀린 이메일로 제출하면 이메일 칸 아래에 한국어 에러가 보이고 `signIn`은 호출되지 않는다.
- [ ] 제출이 끝날 때까지 버튼이 비활성화되고 중복 제출이 되지 않는다.
- [ ] `signIn`이 실패하면 폼 상단에 서버 에러 문구가 나오고, 다시 제출하면 그 문구가 사라진다.
- [ ] 키보드가 열린 상태에서도 로그인 버튼 첫 탭이 동작한다.

## 검증(10분)

1. 시뮬레이터에서 이메일 → return → 비밀번호 → return 순서로 입력해 로그인한다. 키보드가 내려가지 않는지 본다. iOS와 Android를 모두 쓸 수 있으면 각각 확인한다.
2. 비밀번호를 `wrong-password`로 두고 제출해 서버 에러 문구와 `isSubmitting` 동안의 버튼 상태를 확인한다.
3. 예측 2를 확인한다. 로그인 요청 안에 `console.log`를 넣어 호출 횟수를 센다.
4. 깨뜨려 보기: `keyboardShouldPersistTaps="handled"`를 지우고 키보드가 열린 상태에서 버튼을 눌러 본다. 첫 탭이 키보드만 닫고 `onPress`를 무시하는지 관찰한 뒤 되돌린다.

> 다른 지점:

## 이해 점검 질문

1. `submitBehavior`의 기본값이 `'blurAndSubmit'`이면 왜 이메일 칸에서 다음 칸으로 넘기려 할 때 `'submit'`을 줘야 하는가?
2. `formState.isSubmitting`이 제출 내내 true이려면 `onSubmit`을 어떻게 써야 하는가? `mutate`로 요청을 시작만 하고 반환하면 어떻게 되는가?
3. 서버가 거부한 로그인 실패를 `fieldState.error`가 아니라 `setError('root.server', ...)`로 다루는 이유는?

<details><summary>정답</summary>

1. 한 줄 입력의 기본값 `'blurAndSubmit'`은 return 키에서 입력을 블러하고 제출 이벤트를 보내므로 키보드가 내려갈 수 있다. `'submit'`은 블러 없이 제출 이벤트(`onSubmitEditing`)만 보내므로, 거기서 `setFocus('password')`를 호출하면 키보드를 닫지 않고 커서가 다음 칸으로 이동한다(RN `TextInput` 문서 예시의 설명이다).
2. `onSubmit`을 `async`로 만들고 요청을 `await`하거나 Promise를 반환해야 한다. `mutate`처럼 요청을 시작만 하고 바로 반환하면 Promise가 즉시 끝나 `isSubmitting`이 거의 바로 false가 되고, 요청이 진행 중인데도 버튼이 풀려 중복 제출이 가능해진다. `await`가 필요하면 `mutateAsync`를 쓴다.
3. 이메일·비밀번호 형식 검증은 필드 하나의 문제지만, 로그인 실패는 어느 칸이 틀렸는지 서버가 알려 주지 않는 폼 전체의 문제다. `root`는 필드에 속하지 않는 에러 자리이고, 다음 제출 때 자동으로 지워져 오래된 서버 에러가 남지 않는다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `refactor: 로그인 폼을 react-hook-form과 zod로 교체`
- `feat: 로그인 폼 포커스 이동과 제출 중·서버 에러 표시 추가`

## 웹과 다른 점

웹 `<form>`에는 Enter 제출과 Tab 이동이 기본으로 있지만, RN에는 form 요소가 없어 return 키의 동작과 칸 사이 포커스 이동을 `onSubmitEditing`, `submitBehavior`, `ref.focus()`로 직접 만들어야 한다.
