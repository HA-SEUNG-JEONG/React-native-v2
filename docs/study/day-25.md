# Day 25 · 11/30 (월) — fetch + useEffect, 로딩·에러 상태

## 오늘의 목표

피드 탭이 JSONPlaceholder `/posts`를 `fetch`로 불러오고, 로딩·에러·성공 세 상태를 각각 다른 화면으로 보여 준다.

## 읽기(15분)

1. https://reactnative.dev/docs/network — React Native의 `fetch` 사용법과 에러 처리.
   - 확인할 사실: `fetch`는 Promise를 돌려주며, `fetch`가 던지는 에러를 잡지 않으면 조용히 버려진다고 적혀 있다.
   - 확인할 사실: iOS는 ATS 때문에 HTTP 연결을 기본 차단하고, Android는 API 28부터 cleartext 트래픽을 기본 차단한다. JSONPlaceholder는 HTTPS라 해당 없다.
   - 확인할 사실: 이 페이지에는 `response.ok`와 HTTP 상태 코드 처리가 나오지 않는다. `response.ok`의 정확한 의미는 이 페이지에서 확인할 수 없으므로 오늘 예측 1번 실험으로 직접 확인한다(문서에서 확인 필요).
2. https://react.dev/learn/synchronizing-with-effects — 본문의 "Fetching data" 부분.
   - 확인할 사실: Effect 안에서 데이터를 가져오는 방법과 한계. Strict Mode를 켠 개발 환경에서는 Effect가 마운트 직후 한 번 더 실행되어 요청이 두 번 나갈 수 있고, 프로덕션에서는 한 번이다. Expo/RN 앱은 Strict Mode를 기본으로 켜지 않으므로 이 카드의 기본 상태에서는 한 번만 찍힐 수 있다(아래 예측 3과 선택 과제).
3. https://jsonplaceholder.typicode.com/guide/ — `/posts` 리소스(100개)와 필드. 글은 `{ userId, id, title, body }` 형태다.
   - 확인할 사실: 쓰기 요청(POST 등)은 서버에 저장되지 않고 응답만 흉내 낸다(Day 30에서 쓴다).

## 예측(10분)

1. 주소를 일부러 `https://jsonplaceholder.typicode.com/postz`로 틀리게 쓰면 `await fetch(...)`는 에러를 던지는가, 정상 응답을 돌려주는가? 그때 `response.ok`와 `response.status`는 무엇인가?
   > 내 예측:
2. 네트워크가 끊긴 상태(또는 존재하지 않는 호스트)로 요청하면 `fetch`는 에러를 던지는가? 에러 메시지는 어떤 모양일까? iOS Simulator에는 비행기 모드가 없으므로 실험 방법은 만들기 완료 기준 아래 "오프라인 실험 방법"에서 고른다.
   > 내 예측:
3. 개발 중 피드 화면이 처음 열릴 때 `console.log('fetch start')`는 몇 번 찍힐까? 정상 로드 시 목록 항목은 몇 개일까? 숫자를 먼저 적고, 검증에서 터미널의 실제 횟수와 비교한다.
   > 내 예측(`fetch start` 횟수 / 목록 항목 수):

## 만들기(40분)

피드 탭(`app/(tabs)/index.tsx`)이 서버 글을 보여 주게 바꾼다. Day 7에서 `FlatList`에 넣던 하드코딩 데이터와 Day 8의 `RefreshControl`을 서버 데이터에 연결한다. Day 22의 "내 기록 N개" 헤더는 그대로 둔다.

**새 파일**
- `src/types/post.ts`를 만들고 Day 7의 `Post` 타입(`userId: number`, `id: number`, `title: string`, `body: string`)을 `src/data/mock-posts.ts`에서 옮긴다. `mock-posts.ts`와 `PostCard`는 여기서 import한다.

**고칠 파일** `app/(tabs)/index.tsx`
- state 세 개: `posts: Post[]`, `status: 'loading' | 'error' | 'success'`, `errorMessage: string`.
- `useEffect`에서 `fetch('https://jsonplaceholder.typicode.com/posts')`를 호출한다. 응답이 `!response.ok`이면 `Error`를 던져 `catch`에서 `status: 'error'`로 바꾼다. 성공하면 `response.json()` 결과를 `Post[]`로 저장한다.

```tsx
const response = await fetch(url);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data: Post[] = await response.json();
```

- 로딩 중에는 `ActivityIndicator`, 에러일 때는 에러 문구와 "다시 시도" 버튼, 성공일 때는 `FlatList`(`keyExtractor`는 `String(item.id)`)를 보여 준다. 목록이 비면 "글이 없어요" 문구를 보여 준다.
- 불러오기 로직을 `loadPosts` 함수로 분리해서 `useEffect`, "다시 시도" 버튼, Day 8의 `RefreshControl`(`onRefresh`)이 같이 쓴다.
- 요청 시작 지점에 임시 `console.log('fetch start')`를 단다.

**오프라인 실험 방법** (iOS Simulator에는 비행기 모드가 없다. 하나를 고른다.)
- Android 에뮬레이터의 비행기 모드(또는 Wi-Fi 끄기).
- 존재하지 않는 호스트로의 요청: 주소를 `https://jsonplaceholder.invalid/posts`처럼 바꿔 `fetch`가 던지는 에러를 본다. 서버가 응답하는 `/postz`(404)와 달리 연결 자체가 실패하는 경우다.
- 시뮬레이터가 Mac의 네트워크를 쓰므로 Mac의 Wi-Fi를 끄는 방법도 있다.

**선택 과제**: `app/_layout.tsx`의 `RootLayout` 반환값을 React의 `<StrictMode>`로 감싸 `fetch start`가 몇 번 찍히는지 본 뒤 원복한다(예측 3과 비교).

완료 기준
- [ ] 앱을 열면 로딩 표시가 잠깐 보이고, 이어서 JSONPlaceholder 글 목록이 보인다.
- [ ] 주소를 `/postz`로 틀리게 바꾸면 에러 화면이 나온다(예측 1과 비교한 결과를 적었다).
- [ ] 오프라인 실험 방법 중 하나로 연결을 실패시키면 에러 화면이 나오고, 정상 주소(또는 네트워크)로 복구한 뒤 "다시 시도"로 목록이 뜬다.
- [ ] 아래로 당겨 새로고침하면 `RefreshControl`이 돌고 목록이 다시 로드된다.
- [ ] `fetch`를 감싼 `try/catch`가 있고, `catch`에서 에러 메시지를 화면에 표시한다.
- [ ] 임시 `console.log`는 검증이 끝나면 삭제했다.

## 검증(10분)

- 정상 → 주소 오타 → 오프라인(위 "오프라인 실험 방법") → 복구 순서로 눌러 보며 화면 3상태가 맞게 바뀌는지 본다. 오프라인일 때 에러 메시지 원문을 그대로 `막힌 점`이나 기록에 옮겨 적는다(예측 2 비교).
- 터미널에서 `fetch start`가 몇 번 찍혔는지 센다(예측 3). 한 번이면 Strict Mode가 꺼져 있기 때문인지 읽기 2번 문서와 대응시켜 적는다. 두 번이면 `<StrictMode>`로 감쌌거나 다른 원인으로 Effect가 두 번 실행된 것이므로 이유를 찾아 적고, 모르겠으면 질문 목록에 올린다.
- 일부러 깨뜨리기: `if (!response.ok) throw ...` 한 줄을 지우고 `/postz`로 요청한다. 에러 화면이 나오는지, 어떤 상태가 되는지(빈 목록 또는 다른 오류) 확인하고 원복한다.

## 이해 점검 질문

1. `fetch`가 404 응답에서 에러를 던지지 않는 이유는 무엇이고, 그래서 `response.ok` 검사가 왜 필요한가?
2. 데이터 상태를 `isLoading`, `error`, `data`로 따로 두지 않고 `status` 하나로 나눌 때 얻는 이점은 무엇인가?
3. Strict Mode를 켠 개발 환경에서 같은 요청이 두 번 나가는 것은 버그인가? 어떻게 대응해야 하는가?

<details><summary>정답</summary>

1. `fetch`는 네트워크 수준 실패(연결 불가 등)에서만 Promise를 reject한다. 서버가 404나 500을 응답하면 응답은 정상적으로 도착했으므로 Promise는 성공하고 `response.ok`가 `false`일 뿐이다. 그래서 `response.ok`를 검사해서 직접 에러로 바꿔야 `catch`에서 한 곳으로 처리할 수 있다.
2. 상태 세 값이 따로면 `isLoading`과 `error`가 동시에 참이 되는 등 불가능한 조합이 생길 수 있다. 하나의 `status`는 한 번에 한 상태만 가능하므로 화면 분기가 단순하고 빠뜨린 경우를 줄일 수 있다.
3. 버그가 아니다. React 문서는 Strict Mode를 켠 개발 환경에서 Effect가 마운트 직후 한 번 더 실행되며 프로덕션에서는 한 번만 요청된다고 설명한다. Expo/RN은 Strict Mode를 기본으로 켜지 않으므로 `<StrictMode>`로 감싸지 않았다면 한 번만 찍히는 것이 정상이다. 두 번 찍히는 경우의 대응은 Effect가 다시 실행되어도 안전하도록 cleanup(Day 26의 취소/무시)을 쓰는 것이다. 요청이 한 번만 나가도록 막는 우회(ref로 첫 실행 표시)는 문제를 숨길 뿐이다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: Post 타입 추가`
- `feat: 피드 탭에서 JSONPlaceholder 글 목록 fetch`
- `feat: 피드 로딩·에러·재시도 화면 추가`
