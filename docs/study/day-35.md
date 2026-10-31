# Day 35 · 12/14 (월) — AsyncStorage

> 전제: Day 5·6에서 만든 기록 탭 글쓰기 폼(`app/(tabs)/write.tsx`, 제목·본문 `useState`), Day 22의 로컬 "저장"(`dispatch`), Day 30의 "서버에 게시" mutation(`src/hooks/useCreatePost.ts`), Day 13의 `useEffect` cleanup 패턴이 있다.

## 오늘의 목표

기록 탭에서 쓰던 글을 앱을 완전히 껐다 켜도 남도록 AsyncStorage에 임시 저장하고, 작성에 성공하면 지운다.

## 읽기(15분)

- https://docs.expo.dev/versions/latest/sdk/async-storage/
  - 설치는 `npx expo install @react-native-async-storage/async-storage`이고 Expo Go에 포함되어 있다. 암호화되지 않은 비동기 영구 key-value 저장소다.
  - SDK 54에서 `expo install`이 고정하는 버전은 2.2.0이다(Expo의 `bundledNativeModules.json`, 2026-10-27 확인). npm 최신은 3.x이므로 `npm install`로 직접 설치하지 말고 `expo install`을 쓴다.
- https://react-native-async-storage.github.io/2.0/API/
  - 값은 문자열만 저장된다. 객체는 `JSON.stringify`로 저장하고 `JSON.parse`로 읽는다. `getItem`은 값이 없으면 `null`을 돌려준다.
  - `removeItem`, `multiGet`(`[key, value]` 쌍의 배열 반환), `multiSet`, `multiRemove`가 있다. `clear()`는 이 저장소의 모든 데이터를 지우므로 다른 라이브러리가 쓴 키까지 사라진다.
- https://react-native-async-storage.github.io/2.0/advanced/Limits/
  - Android는 전체 6MB 기본 제한이 있고, 항목 하나는 약 2MB를 넘으면 한 번에 읽을 수 없다. 큰 데이터를 넣는 저장소가 아니다.

확인할 버전: 라이브러리 문서 사이트는 `2.0` 경로가 있는 문서를 기준으로 읽는다. 설치 뒤 `npm ls @react-native-async-storage/async-storage`로 2.x가 깔렸는지 확인한다.

## 예측(10분)

1. `AsyncStorage.setItem('draft', { title: 'a' })`처럼 객체를 바로 넘기면 TypeScript와 실행에서 각각 어떻게 될까?

> 내 예측:

2. 입력 중인 글이 있는 상태에서 (a) 코드를 저장해 Fast Refresh가 일어날 때, (b) 앱 스위처에서 앱을 위로 밀어 완전히 종료한 뒤 다시 열 때, `useState` 값과 AsyncStorage 값은 각각 어떻게 될까?

> 내 예측:

3. 키 입력마다 `setItem`을 호출하면 어떤 문제가 생길까? 어떻게 줄일 수 있을까?

> 내 예측:

## 만들기(40분)

설치(오늘 처음 설치한다): `npx expo install @react-native-async-storage/async-storage`

새로 만들거나 고칠 파일:
- `src/storage/draft.ts`: `loadDraft()`, `saveDraft(draft)`, `clearDraft()` 세 함수. 키는 `'daily-log:draft'`, 값은 `{ title: string; body: string }`의 JSON 문자열이다. `loadDraft`는 값이 없으면 `null`을 돌려주고, `JSON.parse`가 실패하면 그 키를 지우고 `null`을 돌려준다.
- `app/(tabs)/write.tsx`: 마운트 때 `loadDraft()`로 제목·본문을 채운다. 불러오는 동안은 `isLoaded`가 false이고 입력칸을 `editable={false}`로 둔다. 제목·본문이 바뀌면 500ms 디바운스(`setTimeout` + `useEffect` cleanup, Day 13) 뒤 `saveDraft`를 호출한다. 단 `isLoaded`가 true가 되기 전에는 저장하지 않는다.
- 로컬 "저장"을 누를 때와 Day 30의 "서버에 게시"가 성공했을 때 `clearDraft()`를 호출한다.

핵심 호출 형태:

```ts
await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
const raw = await AsyncStorage.getItem(DRAFT_KEY); // string | null
```

완료 기준:
- [ ] 글을 쓰다 앱을 완전히 종료하고 다시 열면 제목·본문이 복원된다.
- [ ] 불러오기가 끝나기 전에는 빈 값이 저장소에 덮어써지지 않는다(복원 전 저장 차단).
- [ ] "저장" 또는 "서버에 게시"에 성공하면 임시 저장이 지워져, 다시 열었을 때 빈 폼이 나온다.
- [ ] 저장된 값이 깨져 있어도(JSON이 아님) 앱이 죽지 않고 빈 폼으로 시작한다.
- [ ] 키 입력마다 저장하지 않고 입력이 멈춘 뒤에만 저장한다(로그로 호출 횟수 확인).

## 검증(10분)

1. 제목에 "임시", 본문에 "저장 테스트"를 입력하고 1초 기다린 뒤 앱을 완전히 종료했다가 다시 연다. 복원되는지 본다.
2. Fast Refresh만 일으켰을 때와 완전 종료했을 때를 비교해 예측 2와 맞추어 본다.
3. "저장"을 눌러 글을 추가하고 앱을 다시 열어 폼이 비어 있는지 본다.
4. 깨뜨려 보기: 임시 코드로 `AsyncStorage.setItem('daily-log:draft', 'not-json')`을 한 번 실행하고 앱을 다시 연다. `loadDraft`에서 `JSON.parse` 예외 처리를 빼면 어떻게 되는지, 넣으면 어떻게 되는지 비교한 뒤 임시 코드를 지운다.

> 다른 지점:

## 이해 점검 질문

1. AsyncStorage에 객체를 저장하려면 왜 `JSON.stringify`가 필요한가? 읽을 때 왜 `JSON.parse`를 방어적으로 써야 하는가?
2. 복원 전에 저장을 막지 않으면 어떤 데이터 손실이 생길 수 있는가?
3. AsyncStorage에 로그인 토큰을 저장하면 안 되는 이유는? (내일 Day 36의 주제와 연결된다.)

<details><summary>정답</summary>

1. 저장소의 값은 문자열뿐이라 객체를 직접 넣을 수 없다. 읽은 값은 앱이 이전 버전에서 쓴 형식이거나 저장 중 깨진 값일 수 있어, `JSON.parse`가 예외를 던질 수 있다. 예외 처리가 없으면 앱 시작 때 바로 죽는 상태가 영구히 반복되므로, 실패하면 값을 지우고 기본값으로 시작해야 한다.
2. 마운트 직후 상태는 빈 문자열인데, 저장 `useEffect`가 그 빈 값을 먼저 `setItem`으로 써 버리면 아직 읽지 않은 기존 임시 글을 덮어써서 사라진다. `isLoaded`가 true가 된 뒤에만 저장해야 한다.
3. AsyncStorage는 암호화되지 않은 평문 저장소라 기기의 저장 파일에 접근하면 값이 그대로 읽힌다. 토큰처럼 노출되면 안 되는 값은 Android는 Keystore, iOS는 Keychain을 쓰는 SecureStore에 둔다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: AsyncStorage 설치`
- `feat: 기록 탭 임시 저장·복원 추가`

## 웹과 다른 점

`localStorage`처럼 문자열 key-value지만 모든 호출이 Promise를 반환하는 비동기 API이므로, 읽기가 끝나기 전의 상태를 화면에서 직접 처리해야 한다.
