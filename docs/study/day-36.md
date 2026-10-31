# Day 36 · 12/15 (화) — SecureStore와 토큰 저장

> 전제: Day 23에서 만든 `src/contexts/AuthContext.tsx`(`AuthProvider`, `useAuth()`의 `token`·`signIn`·`signOut`)와 `app/_layout.tsx`의 `RootNavigator`(`Stack.Protected`로 `sign-in`과 탭 화면을 가름), Day 28의 `QueryClientProvider`(`AuthProvider`보다 바깥)가 있다. 토큰은 지금 메모리에만 있다.

## 오늘의 목표

모의 로그인 토큰을 메모리가 아니라 SecureStore에 저장하고, 앱을 다시 열 때 토큰을 복원해 로그인 상태를 유지한다.

## 읽기(15분)

- https://docs.expo.dev/versions/latest/sdk/securestore/
  - 설치는 `npx expo install expo-secure-store`이고 Expo Go에서 쓸 수 있다. Android는 SharedPreferences에 Keystore로 암호화해 저장하고, iOS는 Keychain에 저장한다.
  - 비동기 API는 `setItemAsync(key, value)`, `getItemAsync(key)`(없으면 `null`), `deleteItemAsync(key)`이고, 동기 `setItem`·`getItem`은 JS 스레드를 막는다.
  - 키에는 영문자·숫자와 `.`, `-`, `_`만 쓸 수 있다. 값 크기는 Expo가 제한하지 않지만 플랫폼이 큰 값을 거부할 수 있다(일부 구형 iOS는 약 2048바이트 초과를 거부했다는 보고가 문서에 있다).
  - iOS는 앱을 지웠다가 같은 번들 ID로 다시 설치하면 데이터가 남을 수 있지만 보장되지 않으니 의존하지 않는다. Android는 앱을 지우면 데이터도 사라진다.
- https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient
  - `queryClient.clear()`는 쿼리 캐시와 mutation 캐시를 모두 비운다(재요청은 하지 않는다).

## 예측(10분)

1. 어제 `AsyncStorage`에 쓰던 키 `'daily-log:draft'`를 그대로 `SecureStore.setItemAsync`의 키로 쓰면 어떻게 될까? 문서의 키 규칙으로 근거를 적는다.

> 내 예측:

2. 로그인한 상태에서 앱을 완전히 종료하고 다시 열었을 때, 토큰을 복원하는 비동기 작업이 끝나기 전 짧은 순간에 보호된 라우트 가드는 사용자를 어디로 보낼까? 그 순간을 막지 않으면 어떤 화면이 번쩍일까?

> 내 예측:

3. 로그아웃하고 다른 계정으로 로그인하면, 이전 계정이 보던 피드의 Query 캐시는 어떻게 될까? 아무것도 하지 않았을 때와 `queryClient.clear()`를 했을 때를 비교해 적는다.

> 내 예측:

## 만들기(40분)

설치(오늘 처음 설치한다): `npx expo install expo-secure-store`

새로 만들거나 고칠 파일:
- `src/storage/token.ts`: `saveToken(token)`, `loadToken()`, `clearToken()`. 키는 `'auth.token'`. `loadToken`은 `getItemAsync`가 예외를 던지면 `null`을 돌려준다.
- `src/contexts/AuthContext.tsx`: 상태에 `isRestoring`(초기값 true)을 추가한다. 마운트 때 `loadToken()` → 토큰이 `mock-`로 시작하는지 확인(모의 검증) → 맞으면 `token` 상태에 넣고, 아니면 `clearToken()` → 끝나면 `isRestoring`을 false로 바꾼다. `signIn`은 성공 시 `saveToken`, `signOut`은 `clearToken`과 `queryClient.clear()`(`useQueryClient()`로 얻는다)를 호출한다. `useAuth`가 `isRestoring`을 내보낸다.
- `app/_layout.tsx`: `RootNavigator`가 `isRestoring`이 true인 동안에는 `Stack`을 그리지 않고 `ActivityIndicator` 화면(또는 `null`)을 보여 준다. 복원이 끝난 뒤에만 `Stack.Protected` 가드(`!!token`, `!token`)가 평가되게 한다.

핵심 호출 형태:

```ts
await SecureStore.setItemAsync('auth.token', token);
const token = await SecureStore.getItemAsync('auth.token'); // string | null
await SecureStore.deleteItemAsync('auth.token');
```

완료 기준:
- [ ] 로그인 후 앱을 완전히 종료하고 다시 열면 로그인 화면을 거치지 않고 피드로 들어간다.
- [ ] 복원 중에는 로그인 화면이 번쩍이지 않고 로딩 표시만 보인다.
- [ ] 로그아웃(`signOut`)하면 토큰이 지워져, 앱을 다시 열어도 로그인 화면이 나온다.
- [ ] 저장된 토큰이 모의 검증에 실패하면(예: 형식이 틀린 값) 토큰을 지우고 로그인 화면으로 간다.
- [ ] 로그아웃 시 Query 캐시가 비워져, 다른 계정으로 로그인하면 이전 피드가 보이지 않는다.
- [ ] 토큰이 AsyncStorage 코드 어디에도 쓰이지 않는다(`grep -rn "AsyncStorage" app src`로 확인. `src/storage/draft.ts`는 예외다).

## 검증(10분)

1. 로그인 → 앱 완전 종료 → 재실행으로 로그인 유지를 확인한다.
2. 로그아웃 → 앱 완전 종료 → 재실행으로 로그인 화면이 나오는지 확인한다.
3. 예측 1을 확인한다. 임시 코드로 `'daily-log:draft'` 키를 SecureStore에 써 보고 나오는 에러 메시지 원문을 적는다.
4. 깨뜨려 보기: `RootNavigator`에서 `isRestoring` 확인을 빼고 로그인 상태로 앱을 다시 연다. 로그인 화면이 번쩍이거나 사용자가 로그인 화면에 갇히는지 관찰한 뒤 되돌린다.

> 다른 지점:

## 이해 점검 질문

1. 토큰을 AsyncStorage가 아니라 SecureStore에 두는 이유는? 두 저장소 각각 무엇을 저장하는 게 맞는가?
2. `isRestoring` 상태가 없으면 왜 로그인 상태가 유지되는데도 로그인 화면이 보이는가?
3. 로그아웃에서 `deleteItemAsync`만 하고 `queryClient.clear()`를 빼면 어떤 문제가 생기는가?

<details><summary>정답</summary>

1. AsyncStorage는 암호화되지 않은 평문 저장소이고, SecureStore는 Android Keystore·iOS Keychain으로 암호화·보호한다. 토큰·비밀번호처럼 노출되면 안 되는 값은 SecureStore에, 임시 글·설정처럼 노출돼도 큰 문제가 없는 값은 AsyncStorage에 둔다. SecureStore는 키 문자 규칙과 값 크기 한계가 있어 큰 데이터 저장소로는 맞지 않다.
2. 앱을 열면 인증 상태의 초기값은 "로그인 안 됨"이다. 토큰을 읽는 비동기 작업이 끝나기 전에 가드가 이 초기값을 보면 로그인 안 된 것으로 판단해 로그인 화면으로 보낸다. 복원이 끝나 사용자가 설정되면 다시 피드로 이동한다. `isRestoring`으로 "아직 모르는 상태"를 구분해야 한다.
3. Query 캐시는 메모리에 남아 있어, 다른 계정으로 로그인하면 이전 계정의 피드·상세 데이터가 `staleTime` 동안 그대로 화면에 보이거나 잠깐 번쩍인다. 토큰만 지우면 서버 인증은 끊겨도 앱 안의 이전 사용자 데이터는 지워지지 않는다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: expo-secure-store 설치`
- `feat: 로그인 토큰을 SecureStore에 저장하고 앱 시작 때 복원`
- `fix: 로그아웃 시 토큰과 Query 캐시 초기화`
