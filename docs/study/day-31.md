# Day 31 · 12/8 (화) — 낙관적 업데이트와 롤백

> 전제: Day 30의 `src/hooks/useCreatePost.ts`와 `src/api/posts.ts`, Day 28의 `src/hooks/usePosts.ts`(키 `['posts', { userId }]`, 데이터는 `Post[]`)와 피드(`app/(tabs)/index.tsx`)가 있다.

## 오늘의 목표

피드에서 글을 삭제할 때 서버 응답을 기다리지 않고 목록에서 먼저 지우고, 실패하면 원래대로 되돌린다.

## 읽기(15분)

- https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates
  - 방법이 두 가지다. `variables`를 이용해 UI에서만 임시 항목을 그리는 방법(캐시를 건드리지 않음)과, `onMutate`에서 캐시를 직접 고치는 방법이다. 여러 화면이 같은 데이터를 보면 캐시 방식을 쓴다.
  - 캐시 방식의 순서는 `cancelQueries` → `getQueryData`로 이전 값 저장 → `setQueryData`로 낙관적 값 쓰기 → `onMutate`가 이전 값을 반환 → `onError`에서 그 값으로 복원 → `onSettled`에서 `invalidateQueries`다.
  - `cancelQueries`는 진행 중인 재요청이 낙관적 값을 덮어쓰지 못하게 막는다.
- https://tanstack.com/query/v5/docs/framework/react/guides/mutations
  - `onMutate`가 반환한 값이 `onError`, `onSuccess`, `onSettled`의 `onMutateResult`(세 번째 인자)로 전달된다. 롤백용 스냅샷을 여기에 담는다.
- https://tanstack.com/query/v5/docs/reference/QueryClient
  - 우리 피드는 칩마다 캐시가 따로(`['posts', { userId: 1 }]`, `['posts', { userId: null }]` 등) 있다. `getQueriesData(filters)`는 일치하는 캐시 전부를 `[queryKey, data]` 쌍의 배열로 돌려주고, `setQueriesData(filters, updater)`는 일치하는 기존 캐시 전부를 한 번에 고친다(새 캐시는 만들지 않는다). updater는 불변으로 새 값을 만들어야 하고, 현재 값은 `undefined`일 수 있다.

확인할 버전: 최신 문서의 `onMutate(variables, context)`는 `context.client`를 주지만, 이 카드는 `useQueryClient()`로 얻은 `queryClient`를 클로저로 쓴다. 이 방식은 버전과 무관하게 동작한다. 콜백 인자 순서는 설치된 버전의 타입 정의로 확인한다.

## 예측(10분)

1. 삭제 버튼을 누른 직후, 서버 응답이 오기 전에 목록에서 그 글이 사라질까? 사라진다면 어떤 코드 때문인가?

> 내 예측:

2. 서버가 실패했을 때 롤백(`setQueryData`)을 하지 않고 `invalidateQueries`만 호출하면 화면은 어떻게 보일까? 롤백을 하면 무엇이 달라질까?

> 내 예측:

3. JSONPlaceholder는 DELETE를 저장하지 않는다. 삭제 성공 뒤 `onSettled`에서 `['posts']`를 무효화하면 삭제한 글은 어떻게 될까? (https://jsonplaceholder.typicode.com/guide/ 의 "Write requests" 부분을 다시 본다.)

> 내 예측:

## 만들기(40분)

피드 항목에 삭제 버튼을 달고 낙관적 삭제를 구현한다.

새로 만들거나 고칠 파일:
- `src/api/posts.ts`: `deletePost(id: number)` 추가(`DELETE /posts/:id`, Day 30처럼 `request`에 `method` 옵션이 필요하다). 낙관적 업데이트가 눈에 보이도록 요청 전에 800ms 지연(`await new Promise(r => setTimeout(r, 800))`)을 임시로 넣고, `id % 5 === 0`이면 지연 후 `throw new Error('삭제 실패')` 하게 한다. 둘 다 오늘 검증 후 지운다.
- `src/hooks/useDeletePost.ts`: Day 30의 `useCreatePost`와 같은 모양의 훅. 낙관적 업데이트는 여기서 한다.
- Day 11에서 분리한 피드 항목 컴포넌트(`src/components/PostCard.tsx`): 삭제 `Pressable`을 추가한다. `accessibilityLabel`로 "글 삭제"를 준다.
- `app/(tabs)/index.tsx`: `useDeletePost()`를 쓰고 항목 컴포넌트에 `onDelete(id)`를 내려 준다.

핵심 호출 형태:

```ts
onMutate: async (id: number) => {
  await queryClient.cancelQueries({ queryKey: ['posts'] });
  const previous = queryClient.getQueriesData<Post[]>({ queryKey: ['posts'] });
  queryClient.setQueriesData<Post[]>({ queryKey: ['posts'] }, (old) => old?.filter((p) => p.id !== id));
  return { previous };
},
onError: (_e, _id, onMutateResult) =>
  onMutateResult?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data)),
```

완료 기준:
- [ ] 삭제를 누르면 지연 시간(800ms) 전에 항목이 사라진다.
- [ ] 칩 "전체"에서 `id` 1 글을 삭제한 직후 칩 "1"로 바꾸면, 캐시가 먼저 보이는 순간에는 그 글이 없다(칩별 캐시를 모두 고쳤기 때문). 곧이어 stale 재요청이 끝나면 서버가 삭제를 저장하지 않으므로 글이 다시 나타난다. 이 두 순간을 모두 관찰했다.
- [ ] `id`가 5의 배수인 글을 삭제하면 사라졌다가 실패 후 원래 자리로 돌아온다.
- [ ] 실패 시 사용자에게 "삭제하지 못했습니다" 문구를 보여 준다(`Alert.alert` 또는 화면 `Text`).
- [ ] JSONPlaceholder가 삭제를 저장하지 않으므로, `onSettled`에서 무효화하면 삭제된 글이 되살아나는 현상을 직접 확인했다.
- [ ] 위 현상을 피하려고 이 학습 앱에서는 무효화를 `onError` 안으로 옮기고, "실제 서버라면 `onSettled`에서 무효화해 서버 확정값과 맞춘다"는 이유를 주석 한 줄로 남겼다.

## 검증(10분)

1. 시뮬레이터 피드에서 `id`가 1인 글을 삭제한다. 지연 시간 전에 사라지는지 본다.
2. `id`가 5인 글을 삭제한다. 사라졌다가 되돌아오는지, 실패 문구가 뜨는지 본다.
3. 예측 3을 확인한다. `onSettled`에 무효화를 둔 상태에서 `id` 1 글을 삭제하고 되살아나는지 본다.
4. 깨뜨려 보기: `onError`의 롤백(`setQueryData`) 줄만 주석 처리하고(무효화는 둔다) `id` 5를 삭제한다. 글이 롤백 없이 사라진 상태로 남는 시간과, 그 뒤 무효화로 돌아오는 시점을 비교한 뒤 되돌린다. 롤백이 하는 일이 "서버 재요청을 기다리지 않는 즉시 복구"임을 확인한다.

> 다른 지점:

## 이해 점검 질문

1. `onMutate` 맨 앞에서 `cancelQueries`를 호출하는 이유는?
2. 롤백에 쓸 스냅샷을 `onMutate`의 반환값에 담는 이유는? 컴포넌트 상태 변수에 담으면 어떤 문제가 있는가?
3. 낙관적 업데이트를 "캐시 방식"과 "`variables` 방식" 중 어느 쪽으로 할지는 무엇으로 정하는가?

<details><summary>정답</summary>

1. 삭제 직전에 이미 진행 중이던 목록 재요청이 있으면, 그 응답이 나중에 도착해 방금 지운 항목을 다시 캐시에 써 넣을 수 있다. `cancelQueries`로 그 요청을 취소해 낙관적 값이 덮어써지지 않게 한다.
2. `onMutate`의 반환값은 같은 mutation 호출의 `onError`, `onSettled`에 그대로 전달되므로 호출마다 자기 스냅샷을 갖는다. 컴포넌트 변수나 `useRef`에 담으면 빠르게 연달아 삭제할 때 앞 호출의 스냅샷을 뒤 호출이 덮어써서 엉뚱한 값으로 되돌릴 수 있다.
3. 그 데이터를 화면 한 곳에서만 쓰면 캐시를 건드리지 않는 `variables` 방식이 코드가 짧고 롤백도 필요 없다. 여러 화면(목록과 상세, 칩별 목록 등)이 같은 데이터를 보면 캐시를 직접 고쳐야 모두 즉시 바뀐다. 오늘 피드 삭제는 칩마다 따로 있는 목록 캐시를 함께 고쳐야 하므로 캐시 방식으로 연습한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 피드 글 삭제 낙관적 업데이트와 롤백 추가`
- `chore: 삭제 지연·실패 재현용 임시 코드 제거`
