# Day 23 · 11/26 (목) — 인증 흐름과 보호된 라우트(모의 로그인)

## 오늘의 목표

모의 로그인으로 토큰 문자열을 `AuthContext`에 넣고, `Stack.Protected`로 로그인 전에는 로그인 화면만, 로그인 후에는 탭 화면만 보이게 만든다.

## 읽기(15분)

1. https://docs.expo.dev/router/advanced/authentication/ — Context 세션 + `Stack.Protected` 예제.
   - 확인할 사실: 모든 라우트는 항상 정의되어 있고, 런타임에 인증 상태로 접근을 막는다. `RootNavigator` 안에서 `<Stack.Protected guard={!!session}>`와 `<Stack.Protected guard={!session}>`로 화면 묶음을 나눈다.
   - 확인할 사실: 로그아웃 화면에서는 `signOut()`만 호출하면 가드가 리다이렉트를 처리한다.
2. https://docs.expo.dev/router/advanced/protected/ — 가드가 `false`가 될 때의 동작.
   - 확인할 사실: 가드가 `true`에서 `false`로 바뀌면 그 화면의 history 항목이 모두 제거되고, 사용자는 anchor 라우트(보통 `index`) 또는 사용 가능한 첫 화면으로 보내진다.
   - 확인할 사실: 보호된 화면은 클라이언트에서만 평가되며 서버 접근 제어를 대체하지 못한다.
   - 주의: 이 두 페이지는 최신 문서다. `redirectTo` prop은 SDK 58+라고 적혀 있으니 쓰지 않는다. `Stack.Protected`가 SDK 54에서 그대로 동작하는지는 직접 실행해서 확인하고, 안 되면 "문서에서 확인 필요"로 막힌 점에 적는다.

## 예측(10분)

1. 로그인 성공 직후 `signIn()`만 호출하고 `router.replace`는 호출하지 않는다. 탭 화면으로 넘어가는가?
   > 내 예측:
2. 로그인한 상태에서 설정 탭의 "로그아웃"을 누르면 어느 화면이 보이는가? 그 상태에서 Android 하드웨어 뒤로가기(또는 iOS 스와이프 뒤로)를 하면 탭 화면이 다시 나오는가?
   > 내 예측:
3. 로그아웃한 뒤 다시 로그인하면, Day 22에서 저장한 내 기록은 남아 있는가 사라지는가? 그 이유는 `LogsProvider`가 어디에 있기 때문인가?
   > 내 예측:

## 만들기(40분)

Daily Log에 로그인 화면을 추가하고, 탭 3개와 상세 화면은 로그인 후에만 보이게 한다. 서버는 없다. 토큰은 메모리(state)에만 있고 앱을 다시 켜면 사라진다. 저장은 Day 36에서 한다.

**새 파일**
- `src/contexts/AuthContext.tsx`: `AuthProvider`, `useAuth()`(Provider 밖이면 throw). 값은 `{ token: string | null; signIn: (email: string, password: string) => Promise<void>; signOut: () => void }`. `signIn`은 `setTimeout` 600ms로 서버 응답을 흉내 낸 뒤, 이메일이 비었거나 비밀번호가 4자 미만이면 `throw new Error('...')`, 아니면 `` `mock-${Date.now()}` `` 같은 문자열을 token으로 저장한다.
- `app/sign-in.tsx`: 이메일·비밀번호 `TextInput`(Day 5, `secureTextEntry`), "로그인" 버튼. 제출 중에는 버튼을 비활성화하고 `ActivityIndicator`를 보이며, `signIn`이 던진 에러 메시지를 화면에 표시한다.

**고칠 파일**
- `app/_layout.tsx`: `AuthProvider`를 `ProfileProvider`, `LogsProvider`와 같은 높이(`Stack` 위)에 둔다. `Stack`은 `RootNavigator` 컴포넌트로 빼서 안에서 `useAuth()`를 쓴다.

```tsx
<Stack.Protected guard={!!token}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="post/[id]" />
  <Stack.Screen name="about" options={{ presentation: 'modal' }} />
</Stack.Protected>
<Stack.Protected guard={!token}>
  <Stack.Screen name="sign-in" />
</Stack.Protected>
```

Day 16·18에서 `app/_layout.tsx`의 `Stack`에 달았던 `Stack.Screen` 옵션(`post/[id]`의 기본 제목, `about`의 `presentation: 'modal'`)은 `RootNavigator` 안의 이 `Stack.Screen`들로 옮긴다.

- 설정 탭 `app/(tabs)/settings/index.tsx`: "로그아웃" 버튼에서 `signOut()` 호출. 현재 로그인 토큰의 앞부분을 작게 보여 주는 `Text`를 하나 둔다(디버깅용).

완료 기준
- [ ] 앱을 켜면 로그인 화면이 먼저 보이고 탭 바는 없다.
- [ ] 잘못된 입력(빈 이메일, 4자 미만 비밀번호)이면 에러 문구가 보이고 화면이 안 넘어간다.
- [ ] 로그인 성공 시 `router.replace`를 직접 호출하지 않았는데도 탭 화면이 나온다.
- [ ] 로그아웃하면 로그인 화면이 나오고, 뒤로가기로 탭 화면에 돌아갈 수 없다.
- [ ] 제출 중에는 버튼이 눌리지 않는다(연타해도 `signIn`이 한 번만 실행된다).

## 검증(10분)

- 위 완료 기준 순서대로 시뮬레이터에서 눌러 본다. 예측 1·2의 실제 결과를 적는다.
- 내 기록을 2개 만든 뒤 로그아웃 → 다시 로그인한다. 기록이 남아 있는지 확인한다(예측 3). 남아 있다면 다른 계정이 로그인해도 보인다는 문제가 있다. `LogsProvider`를 `app/(tabs)/_layout.tsx`로 옮기고 같은 순서를 반복해서 기록이 사라지는지 확인한다(가드가 `false`가 되면 보호된 화면이 제거되므로 그 안의 Provider state도 사라지는지 실험으로 판단한다). 최종 위치는 직접 결정하고 이유를 기록 칸에 적는다.
- 일부러 깨뜨리기: 두 `Stack.Protected` 가드를 모두 `true`로 바꿔 보고 어떤 화면이 첫 화면으로 보이는지 확인한다.

## 이해 점검 질문

1. 로그인 후 `router.replace('/')` 없이 화면이 바뀌는 이유는 무엇인가?
2. 가드가 `false`가 될 때 해당 화면들의 history가 제거되는 것이 로그아웃 후 보안/UX에 왜 중요한가?
3. 이 방식의 보호가 하지 못하는 일은 무엇인가? (서버, 토큰 보관 측면에서)

<details><summary>정답</summary>

1. `token`이 바뀌면 `AuthProvider`가 다시 렌더되어 `RootNavigator`의 가드 값(`!!token`, `!token`)이 바뀐다. 라우터는 가드가 `false`가 된 화면을 제거하고 `true`가 된 화면을 사용 가능하게 한 뒤, 현재 위치가 막히면 anchor 또는 첫 사용 가능 화면으로 보낸다. 상태가 화면을 결정하므로 이동을 명령할 필요가 없다.
2. 가드가 `false`가 되면 history 항목이 지워지므로 로그아웃 뒤 뒤로가기로 이전 로그인 화면(탭, 상세)에 돌아갈 수 없다. history가 남아 있으면 다른 사용자가 이전 사용자의 화면을 볼 수 있다.
3. `Stack.Protected`는 클라이언트에서만 화면 접근을 막을 뿐 서버 접근 제어를 대체하지 못한다. 실제 데이터 보호는 서버가 토큰을 검증해야 한다. 또 오늘의 토큰은 메모리에만 있어서 앱을 재시작하면 로그인이 풀린다(Day 36 SecureStore에서 보관한다).

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: AuthContext와 모의 로그인 화면 추가`
- `feat: Stack.Protected로 로그인 전후 라우트 분리`
- `feat: 설정 탭에 로그아웃 추가`
