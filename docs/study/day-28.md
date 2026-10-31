# Day 28 · 12/3 (목) — TanStack Query: useQuery

> 확인할 버전: TanStack Query v5(`@tanstack/react-query`). 블로그나 예전 글의 `useQuery(key, fn)`(인자 나열), `isLoading` 중심 분기, `cacheTime`은 v4 이전 문법이다. v5는 객체 하나(`useQuery({ queryKey, queryFn })`)를 받고, 캐시 보관 시간 옵션은 `gcTime`이다. 아래 링크의 `/v5/` 경로만 쓴다.

## 오늘의 목표

`@tanstack/react-query`를 설치하고 루트 레이아웃에 `QueryClientProvider`를 둔 뒤, 피드 목록과 상세 화면의 수동 `useEffect` fetch 코드를 `useQuery`로 바꾼다.

## 읽기(15분)

1. https://tanstack.com/query/latest/docs/framework/react/overview — 설치 직후의 기본 예제.
   - 확인할 사실: `const queryClient = new QueryClient()`를 만들고 `<QueryClientProvider client={queryClient}>`로 앱을 감싼다. `useQuery({ queryKey, queryFn })`가 `{ isPending, error, data }`를 돌려준다.
   - 확인할 사실: 예제 `queryFn`은 `response.ok`를 확인하고 아니면 `Error`를 던진다(Day 27에서 이미 `src/api/client.ts`에 만든 로직과 같다).
2. https://tanstack.com/query/latest/docs/framework/react/guides/queries — query의 상태.
   - 확인할 사실: `status`는 `pending`(데이터 없음) / `error` / `success`이고, `fetchStatus`는 `fetching` / `paused` / `idle`이다. 둘은 서로 다른 질문이다. 데이터가 없는데 가져오지 않는(`pending`이면서 `idle` 또는 `paused`) 쿼리도 있을 수 있다.
3. https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults — 기본값.
   - 확인할 사실: 쿼리는 기본적으로 "stale"로 취급되고, 실패한 쿼리는 에러가 화면에 나오기 전에 3번 자동 재시도(지수 백오프)된다. 비활성 쿼리는 5분 뒤에 가비지 컬렉션된다(`gcTime`).
   - 참고: 설치 절차는 https://tanstack.com/query/latest/docs/framework/react/installation 에서 `npm i @tanstack/react-query`를 확인했다. React Native용 추가 설정은 거기에 없다. 포커스·온라인 연동은 Day 33에서 다룬다.

## 예측(10분)

1. `QueryClientProvider`를 `app/_layout.tsx`의 `RootLayout`에서 `Stack`을 감싸게 두면, 피드 → 상세 → 피드로 오갈 때 피드 목록은 다시 로딩 표시가 나오는가? 처음 한 번만 나오는가?
   > 내 예측:
2. 존재하지 않는 경로 `/postz`로 요청해 에러를 만들면 에러 화면이 뜨기까지 얼마나 걸리는가? (기본 `retry`를 생각해서 몇 초인지 대략 적는다)
   > 내 예측:
3. 피드를 보다가 홈 버튼으로 앱을 백그라운드로 보냈다가 돌아오면 `queryFn`이 다시 실행되는가? (`queryFn` 안에 `console.log`를 넣어 센다)
   > 내 예측:

## 만들기(40분)

**설치** (Day 28이 첫 설치 Day이므로 이날만 한다)
- 터미널에서 `npm install @tanstack/react-query` (Expo 패키지가 아니므로 `npx expo install`이 아니다).

**고칠 파일** `app/_layout.tsx`
- 컴포넌트 바깥(모듈 최상단)에 `const queryClient = new QueryClient();`를 만든다(컴포넌트 안에서 만들면 렌더마다 새 캐시가 생긴다).
- `RootLayout`에서 가장 바깥에 `<QueryClientProvider client={queryClient}>`를 두고, 그 안에 `AuthProvider`, `ProfileProvider`, `LogsProvider`, `RootNavigator`를 둔다. QueryClient가 로그인 화면에도 필요하므로 `Stack.Protected` 위여야 한다.

**새 파일** `src/hooks/usePosts.ts`, `src/hooks/usePost.ts` (Day 13의 커스텀 훅 패턴)
- `usePosts(userId: number | null)`: `useQuery({ queryKey: ['posts', { userId }], queryFn: ({ signal }) => getPosts({ userId, signal }) })`를 반환.
- `usePost(id: number)`: `queryKey: ['post', id]`, `queryFn`은 `getPost(id, { signal })`.

```tsx
const { data, isPending, isError, error, refetch, isRefetching } = usePosts(userId);
```

**고칠 파일**
- `app/(tabs)/index.tsx`: Day 25~26의 `posts/status/errorMessage` state, `useEffect`, `ignore`, `AbortController` 코드를 지우고 `usePosts(userId)` 결과로 분기한다. 로딩은 `isPending`, 에러는 `isError`(Day 27의 `getErrorMessage`에 `error`를 넘긴다), `RefreshControl`은 `refreshing={isRefetching}`, `onRefresh={() => refetch()}`.
- `app/post/[id].tsx`: `usePost(Number(id))`로 교체.

완료 기준
- [ ] `npm install @tanstack/react-query`로 설치했고 `package.json`에 `@tanstack/react-query`가 들어 있다.
- [ ] `QueryClientProvider`가 `app/_layout.tsx` 최상위에 있고 `queryClient`는 컴포넌트 바깥에서 만들었다.
- [ ] 피드와 상세에서 수동 `useEffect` + `useState` fetch 코드가 사라졌다.
- [ ] 칩을 전환하고 연타해도 목록이 항상 선택된 칩과 일치한다(Day 26 경쟁 상태가 `queryKey`로 해결됨).
- [ ] 한 번 본 칩으로 다시 돌아가면 목록이 즉시 보인다.
- [ ] `queryFn`에 임시로 넣은 `console.log`는 지웠다.

## 검증(10분)

- 피드 → 글 열기 → 뒤로 → 칩 전환을 반복하며 로딩 표시가 언제 나오는지 센다(예측 1). 처음 보는 칩은 `isPending` 로딩이 나오고, 본 칩은 즉시 데이터가 보이면서 뒤에서 다시 가져오는지(`isFetching`)를 `console.log(isPending, isFetching)`으로 확인한다.
- `/postz`로 임시 변경해서 에러 화면이 뜨기까지 시간을 잰다(예측 2). 그 다음 `usePosts`에 `retry: false`를 주고 다시 잰다. 둘의 차이를 적는다.
- 앱을 백그라운드로 보냈다 돌아와 `queryFn` 로그가 찍히는지 센다(예측 3). 찍히지 않으면 그 사실만 기록하고 이유는 Day 33 질문으로 남긴다(문서에서 확인 필요).
- 일부러 깨뜨리기: `queryKey`에서 `userId`를 빼고 `['posts']`만 쓴 채 칩을 눌러 본다. 어떤 일이 생기는지 확인하고 원복한다.

## 이해 점검 질문

1. `queryKey`에 `userId`를 넣어야 하는 이유는 무엇이고, Day 26에서 직접 짠 경쟁 상태 방지 코드는 어디로 갔는가?
2. `isPending`과 `isFetching`의 차이를 말하고, 이미 목록이 화면에 있을 때 `RefreshControl`의 `refreshing`에 `isRefetching`을 쓰는 이유를 설명하라.
3. `QueryClient`를 컴포넌트 안에서 `new QueryClient()`로 만들면 왜 문제인가?

<details><summary>정답</summary>

1. `queryKey`는 캐시 항목의 이름이자 쿼리를 구분하는 값이다. `queryFn`이 쓰는 값(`userId`)이 바뀌면 키도 바뀌어야 TanStack Query가 다른 쿼리로 보고 새로 가져오거나 캐시에서 보여 준다. 키는 해시로 비교되고, 키 안의 객체는 속성 순서가 달라도 같은 키로 취급된다. 경쟁 상태는 키마다 별도 캐시 항목이 있고 화면은 현재 키의 결과만 읽으므로, 오래된 응답이 최신 키의 데이터를 덮어쓰지 못해 해결된다. `queryFn`이 받는 `signal`을 `fetch`에 넘기면 키가 바뀌어 필요 없어진 요청은 취소된다(Day 26의 `AbortController`와 같은 원리).
2. `isPending`은 아직 데이터가 없는 상태(처음 로딩)이고, `isFetching`은 `queryFn`이 실행 중이기만 하면 참이다(처음 로딩과 백그라운드 재요청 모두). 이미 데이터가 있을 때 `refetch`하면 `isPending`은 거짓이고 `isFetching`만 참이다. `isRefetching`은 `isFetching && !isPending`이므로 처음 로딩에서는 스피너를 이중으로 보이지 않게 하고, 당겨서 새로고침할 때만 `RefreshControl`을 돌린다.
3. 컴포넌트 안에서 만들면 렌더마다 새 `QueryClient`가 생기고 캐시가 비워져 이전에 가져온 데이터를 잃는다. 모듈 최상단에서 한 번 만들어 앱 전체가 같은 캐시를 공유하게 한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: @tanstack/react-query 설치`
- `feat: 루트 레이아웃에 QueryClientProvider 추가`
- `refactor: 피드·상세의 수동 fetch를 useQuery 훅으로 교체`

## 웹과 다른 점

TanStack Query의 "창 포커스·재연결 시 자동 재요청"은 웹 브라우저 이벤트를 전제로 하므로 RN에서는 앱 상태·네트워크 상태를 직접 연결해야 한다(Day 33에서 `focusManager`·`onlineManager`로 다룬다). 오늘은 연결 없이 기본 동작만 관찰하고, RN에서의 정확한 동작은 문서에서 확인 필요.
