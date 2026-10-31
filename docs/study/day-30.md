# Day 30 · 12/7 (월) — useMutation과 캐시 무효화

> 전제: Day 27의 `src/api/client.ts`(`request`, `ApiError`)와 `src/api/posts.ts`(`getPosts`, `getPost`), Day 28의 `src/hooks/usePosts.ts`(키 `['posts', { userId }]`)와 `app/_layout.tsx`의 `QueryClientProvider`, Day 22의 기록 탭(`app/(tabs)/write.tsx`)이 있다.

## 오늘의 목표

기록 탭에서 쓴 글을 `useMutation`으로 서버에 게시하고, 성공하면 피드 쿼리를 무효화해 다시 불러오게 한다.

## 읽기(15분)

- https://tanstack.com/query/latest/docs/framework/react/guides/mutations
  - `useMutation`은 쓰기(생성·수정·삭제) 전용이고 `status`는 `idle`, `pending`, `error`, `success` 중 하나다. v5에서는 진행 중 플래그 이름이 `isPending`이다.
  - `mutate(variables)`는 바로 반환되고, `mutateAsync(variables)`는 Promise를 돌려주며 실패하면 throw한다.
  - 콜백 실행 순서는 `onMutate` → `onSuccess`/`onError` → `onSettled`이고, 콜백이 Promise를 반환하면 다음 콜백 전에 기다린다.
- https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
  - `onSuccess`에서 `queryClient.invalidateQueries({ queryKey: ['todos'] })`를 쓴다. 이 Promise를 `await`하거나 반환하면 재요청이 끝날 때까지 mutation이 `isPending`으로 남는다.
- https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
  - `invalidateQueries`는 일치하는 쿼리를 stale로 표시하고, 지금 화면에서 쓰이는(active) 쿼리는 백그라운드에서 다시 가져온다.
  - `['todos']`는 `['todos', { page: 1 }]`처럼 그 키로 시작하는 쿼리 전부와 일치한다(접두사 일치). 정확히 같은 키만 대상으로 하려면 `exact: true`를 쓴다.

확인할 버전: 위 문서의 콜백 시그니처는 최신 v5 기준(`onSuccess(data, variables, onMutateResult, context)`)이다. 설치된 `@tanstack/react-query` 버전은 `npm ls @tanstack/react-query`로 확인하고, 콜백 인자가 문서와 다르면 에디터에서 `useMutation` 타입 정의를 열어 맞춘다.

## 예측(10분)

코드를 짜기 전에 적는다.

1. 글을 게시해 서버가 성공 응답을 주고 `onSuccess`에서 `['posts']`를 무효화하면, 피드 화면에 방금 쓴 글이 나타날까? 나타난다면/아니라면 왜인가? (JSONPlaceholder의 쓰기 요청 동작은 https://jsonplaceholder.typicode.com/guide/ 의 "Write requests" 부분에서 확인한다.)

> 내 예측:

2. 게시 버튼에 `disabled={isPending}`를 달지 않고 빠르게 두 번 누르면 `mutationFn`은 몇 번 호출될까?

> 내 예측:

3. `onSuccess`에서 `invalidateQueries(...)`를 `return` 하지 않고(`await`도 하지 않고) 호출만 하면, `isPending`이 `false`가 되는 시점은 어떻게 달라질까?

> 내 예측:

## 만들기(40분)

Daily Log의 기록 탭(`app/(tabs)/write.tsx`)에 "서버에 게시" 버튼을 추가한다. Day 22의 "저장"(로컬 기록 추가)은 그대로 둔다.

새로 만들거나 고칠 파일:
- `src/api/posts.ts`: `createPost(input: { title: string; body: string })` 추가(`POST /posts`). Day 27의 `request`가 `GET`만 다룬다면 `method`와 `body`를 받도록 옵션을 넓힌다. body에 `userId: 1`을 함께 보내고, 반환 타입은 `Post`(Day 25의 `src/types/post.ts`)로 한다.
- `src/hooks/useCreatePost.ts`: Day 13의 커스텀 훅 패턴으로 `useMutation`을 감싼다(Day 28의 `src/hooks/usePosts.ts`와 같은 모양).
- `app/(tabs)/write.tsx`: "서버에 게시" `Pressable`을 추가하고 Day 5의 제목·본문 상태를 `mutate`에 넘긴다.
- `src/hooks/usePosts.ts`: `queryFn` 첫 줄에 확인용 `console.log('fetch posts')`를 임시로 넣는다(오늘 검증 후 지운다).

핵심 호출 형태:

```ts
const queryClient = useQueryClient();
return useMutation({
  mutationFn: createPost,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
});
```

완료 기준:
- [ ] "서버에 게시"를 누르면 `mutate({ title, body })`가 호출된다. 제목이 비었거나 공백뿐이면 Day 5의 저장 버튼처럼 비활성화된다.
- [ ] `isPending` 동안 버튼이 비활성화되고 라벨이 "게시 중..."으로 바뀐다.
- [ ] 성공하면 서버가 돌려준 `id`를 화면 하단에 한 줄로 보여 준다. 입력칸은 비우지 않는다(로컬 "저장"과 독립적이다).
- [ ] 실패하면 Day 27의 `getErrorMessage`에 `error`를 넘겨 나온 메시지를 `Text`로 보여 준다.
- [ ] `onSuccess`가 `['posts']`를 무효화하고 그 Promise를 반환한다. 키 `['posts', { userId }]`가 접두사로 일치하므로 칩별 캐시가 모두 stale이 된다.
- [ ] 게시 후 Metro 로그에 `fetch posts`가 한 번 더 찍히는지 확인했다.

## 검증(10분)

1. 시뮬레이터에서 기록 탭에 제목과 본문을 쓰고 "서버에 게시"를 누른다. 버튼 라벨이 바뀌는지, 응답 `id`가 101로 오는지 본다.
2. 피드 탭으로 이동해 새 글이 보이는지 확인하고 예측 1과 비교한다. Metro 로그의 `fetch posts` 횟수도 센다.
3. 예측 2·3을 실제로 확인한다. 예측 3은 `return`을 빼고 중괄호 본문에서 `invalidateQueries`만 호출하도록 바꿔 비교한 뒤 되돌린다.
4. 깨뜨려 보기: `createPost` 안에서 일부러 `throw new Error('boom')` 한다. `onSuccess`가 호출되지 않고 피드가 다시 요청되지 않는지, 에러 문구가 화면에 나오는지 확인한 뒤 되돌린다.

예측과 실제가 다른 지점을 적는다.

> 다른 지점:

## 이해 점검 질문

1. `mutate`와 `mutateAsync`는 어떻게 다르고, 어느 쪽에서 `try/catch`가 필요한가?
2. 무효화 후 피드가 다시 요청되는데도 방금 쓴 글이 목록에 없을 수 있다. 이유는?
3. `invalidateQueries({ queryKey: ['posts'] })`는 `['posts', { userId: 2 }]`도 무효화하는가? 그 범위를 좁히려면 어떻게 하는가?

<details><summary>정답</summary>

1. `mutate`는 결과를 돌려주지 않고 에러를 Query가 상태(`isError`, `error`)로 보관한다. `mutateAsync`는 Promise를 돌려주고 실패하면 throw하므로 `await` 하는 쪽에서 `try/catch`(또는 `.catch`)가 필요하다. 화면에 상태로만 보여 주면 되면 `mutate`가 단순하고, 다른 비동기 작업과 순서를 맞춰야 하면 `mutateAsync`를 쓴다.
2. 무효화는 "서버에서 다시 받아 와라"일 뿐이다. JSONPlaceholder는 POST 응답만 그럴듯하게 꾸며 주고 실제로 저장하지 않으므로 다시 받아 온 목록에는 새 글이 없다. 실제 서버라면 새 글이 포함된다. 즉 재요청은 일어났지만 서버 데이터가 그대로라서다.
3. 포함한다. 키는 앞부분부터 일치(접두사 일치)하므로 `['posts']`는 `['posts', { userId: 2 }]`도 대상으로 삼는다. 정확히 같은 키만 대상으로 하려면 `exact: true`를 주거나, `['posts', { userId: 2 }]`처럼 더 구체적인 키를 넘긴다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 글 게시 useMutation과 피드 쿼리 무효화 추가`
- `chore: 피드 queryFn 확인용 로그 제거`
