# Day 32 · 12/9 (수) — useInfiniteQuery + FlatList 무한 스크롤

> 전제: Day 28의 `src/hooks/usePosts.ts`(키 `['posts', { userId }]`)와 피드(`app/(tabs)/index.tsx`, 사용자 필터 칩), Day 7·8의 `FlatList`·`RefreshControl`, Day 31의 `src/hooks/useDeletePost.ts`가 있다.

## 오늘의 목표

피드를 10개씩 페이지로 불러오고, 목록 끝에 가까워지면 다음 페이지를 자동으로 이어 붙인다.

## 읽기(15분)

- https://tanstack.com/query/v5/docs/framework/react/guides/infinite-queries
  - v5의 `useInfiniteQuery`는 `initialPageParam`이 필수이고, `queryFn`은 `({ pageParam })`을 받으며, `getNextPageParam`이 다음 페이지 파라미터를 돌려준다. `undefined`나 `null`을 돌려주면 다음 페이지가 없는 것이다.
  - `data`는 배열이 아니라 `{ pages, pageParams }` 객체다. `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`로 다음 페이지 상태를 다룬다.
  - 하나의 무한 쿼리는 캐시 항목 하나를 공유하므로 동시에 하나의 요청만 돈다. 사용자가 직접 호출하지 않는 곳에서는 `fetchNextPage` 전에 `isFetching`을 확인해야 한다.
  - 다시 가져올 때는 첫 페이지부터 순서대로 가져온다. `setQueryData`로 직접 고칠 때는 `{ pages, pageParams }` 구조를 유지해야 한다.
- https://reactnative.dev/docs/0.81/virtualizedlist (Props의 `onEndReached`, `onEndReachedThreshold`)
  - `onEndReachedThreshold`의 단위는 픽셀이 아니라 리스트 보이는 길이의 배수이고, 기본값은 2다. 0.5이면 끝이 화면 절반 길이 안으로 들어올 때 `onEndReached`가 호출된다.
- https://reactnative.dev/docs/0.81/flatlist
  - `ListFooterComponent`는 모든 항목 아래에, `ListEmptyComponent`는 항목이 없을 때 그려진다.

JSONPlaceholder 페이지네이션: 공식 가이드(https://jsonplaceholder.typicode.com/guide/)에는 설명이 없지만, `/posts?_page=2&_limit=5`는 해당 구간만 돌려주고 `x-total-count` 헤더(전체 100)를 준다. `userId=1`과 함께 쓸 수도 있고 그 사용자의 글은 10개뿐이다(2026-10-27 직접 요청으로 확인). 따라서 칩 "전체"는 10페이지, 사용자 칩은 1페이지다.

## 예측(10분)

1. 앱을 처음 열었을 때 `/posts?_page=...` 요청은 몇 번 나갈까? `onEndReachedThreshold`를 기본값(2)으로 둘 때와 0.5로 둘 때를 따로 적는다.

> 내 예측:

2. 3페이지까지 불러온 상태에서 아래로 당겨 새로고침(`refetch`)하면 요청은 몇 번, 어떤 순서로 나갈까?

> 내 예측:

3. 칩 "전체"에서 10페이지를 받은 뒤 `getNextPageParam`이 다음 페이지 번호를 항상 돌려주면 어떻게 될까?

> 내 예측:

## 만들기(40분)

피드를 `useInfiniteQuery`로 바꾼다.

새로 만들거나 고칠 파일:
- `src/api/posts.ts`: `getPostsPage({ userId, page, signal })` 추가. `GET /posts?_page=${page}&_limit=10`에 `userId`가 있으면 `&userId=...`를 붙이고 본문(`Post[]`)을 돌려준다. Day 27의 `request`를 그대로 쓴다.
- `src/hooks/usePosts.ts`: `useQuery`를 `useInfiniteQuery`로 교체한다. 키는 `['posts', 'infinite', { userId }]`로 한다(Day 30의 `['posts']` 무효화가 접두사로 함께 적용된다). `queryFn`은 `({ pageParam, signal })`을 받는다.
- `app/(tabs)/index.tsx`: `FlatList`의 `data`를 `data?.pages.flat() ?? []`로 만들고 `onEndReached`, `ListFooterComponent`, Day 8의 `RefreshControl`을 연결한다.
- `src/hooks/useDeletePost.ts`: Day 31의 `setQueriesData` updater는 `Post[]`를 가정한다. 무한 쿼리 캐시는 `{ pages, pageParams }`이므로 각 페이지를 `map`으로 돌며 필터링하도록 고친다.

핵심 호출 형태:

```ts
const query = useInfiniteQuery({
  queryKey: ['posts', 'infinite', { userId }],
  queryFn: ({ pageParam, signal }) => getPostsPage({ userId, page: pageParam, signal }),
  initialPageParam: 1,
  getNextPageParam: (lastPage, _all, lastPageParam) => (lastPage.length === 0 ? undefined : lastPageParam + 1),
});
```

완료 기준:
- [ ] 칩 "전체"에서 첫 화면에 10개가 보이고, 아래로 스크롤하면 11번째부터 이어 붙는다.
- [ ] `onEndReached`에서 `hasNextPage && !isFetchingNextPage`일 때만 `fetchNextPage()`를 호출한다.
- [ ] 다음 페이지를 받는 동안 목록 아래에 `ActivityIndicator`가 보인다(`ListFooterComponent`).
- [ ] 100개를 모두 받으면 더 요청하지 않는다. 마지막 응답이 빈 배열이어서 `getNextPageParam`이 `undefined`를 돌려주는 흐름을 설명할 수 있다.
- [ ] 사용자 칩으로 바꾸면 그 사용자의 글만 나오고, 칩마다 캐시가 따로 유지된다.
- [ ] 당겨서 새로고침이 동작한다(`RefreshControl`에 `refetch`, `isRefetching`을 연결한다).
- [ ] Day 31의 낙관적 삭제가 무한 쿼리 구조에서도 동작하고, 실패 시 롤백된다.

## 검증(10분)

1. 임시 `console.log(pageParam)`을 `queryFn`에 넣어 첫 로드 때 요청 횟수를 세고 예측 1과 비교한다.
2. 칩 "전체"에서 끝까지 스크롤해 100번째 글까지 도달하는지, 그 뒤 추가 요청이 멈추는지 본다.
3. 3페이지까지 불러온 뒤 당겨서 새로고침하고 요청 순서를 로그로 확인한다(예측 2).
4. 깨뜨려 보기: `getNextPageParam`이 항상 `lastPageParam + 1`을 돌려주게 바꾼다. 끝에 도달했을 때 빈 배열 요청이 반복되는지, `hasNextPage`가 어떻게 되는지 확인하고 되돌린다. 확인 후 임시 로그를 지운다.

> 다른 지점:

## 이해 점검 질문

1. `data`가 `Post[]`가 아니라 `{ pages, pageParams }`인 이유는? 그래서 어떤 코드를 바꿔야 했는가?
2. `onEndReached`에서 `fetchNextPage()` 앞에 `hasNextPage && !isFetchingNextPage`를 확인하는 이유는?
3. 당겨서 새로고침하면 왜 첫 페이지만이 아니라 불러온 페이지를 순서대로 다시 요청하는가?

<details><summary>정답</summary>

1. 페이지마다 응답을 따로 보관하고(`pages`), 각 페이지를 요청할 때 쓴 파라미터(`pageParams`)도 함께 기억해야 첫 페이지부터 같은 파라미터로 다시 받을 수 있기 때문이다. 그래서 목록으로 쓸 때 `pages.flat()`이 필요했고, 삭제 mutation의 `setQueriesData`도 각 페이지를 `map`으로 돌며 필터링하도록 고쳐야 했다.
2. `onEndReached`는 스크롤 중 여러 번 호출될 수 있고, 무한 쿼리는 요청을 하나만 돌릴 수 있다. 이미 받는 중(`isFetchingNextPage`)이거나 다음 페이지가 없는데(`hasNextPage`가 false) 호출하면 중복·불필요한 요청이 생기거나 진행 중인 요청이 취소될 수 있다(`fetchNextPage`의 `cancelRefetch` 기본값이 true이기 때문이다).
3. 문서는 다시 가져올 때 첫 페이지부터 순서대로 가져와야 커서(페이지 파라미터)가 유효하게 이어진다고 설명한다. 한 캐시 항목에 여러 페이지가 묶여 있어서, 일부만 새로 받으면 페이지 사이가 어긋날 수 있기 때문이다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 피드를 useInfiniteQuery로 바꿔 무한 스크롤 구현`
- `fix: 낙관적 삭제가 무한 쿼리 pages 구조를 다루도록 수정`
