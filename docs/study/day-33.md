# Day 33 · 12/10 (목) — 쿼리 키 설계, staleTime·gcTime, focusManager·onlineManager의 RN 연동

> 전제: Day 28의 `app/_layout.tsx`(모듈 최상단 `queryClient`, `QueryClientProvider`), `src/hooks/usePost.ts`(키 `['post', id]`)와 상세 `app/post/[id].tsx`, Day 32의 `src/hooks/usePosts.ts`(키 `['posts', 'infinite', { userId }]`), Day 30·31의 `src/hooks/useCreatePost.ts`·`src/hooks/useDeletePost.ts`가 있다.

## 오늘의 목표

쿼리 키를 한곳에서 관리하고, `staleTime`·`gcTime`이 화면 전환에서 만드는 차이를 확인하며, 앱이 백그라운드에서 돌아올 때와 오프라인일 때 Query가 어떻게 반응하는지 RN용으로 연결한다.

## 읽기(15분)

- https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
  - 키는 배열이고 JSON으로 직렬화할 수 있어야 한다. 객체 안의 속성 순서는 무시되지만 배열 항목의 순서는 키를 바꾼다.
  - 쿼리 함수가 쓰는 변수는 키에 넣어야 변수마다 캐시 항목이 따로 생기고, 변수가 바뀌면 다시 요청된다.
- https://tanstack.com/query/latest/docs/framework/react/guides/caching
  - `staleTime` 기본값은 0이라 받자마자 stale이고, `gcTime` 기본값은 5분이다. 마지막으로 쓰는 컴포넌트가 사라지면 `gcTime` 타이머가 시작되고, 타이머 전에 다시 쓰이면 캐시를 바로 보여 주면서 뒤에서 다시 요청한다.
- https://tanstack.com/query/latest/docs/framework/react/react-native
  - RN에서는 `AppState`를 `focusManager.setFocused(status === 'active')`에 연결해야 앱 복귀 때 재요청이 동작한다. 웹이 아닐 때만 연결한다(`Platform.OS !== 'web'`).
  - `onlineManager.setEventListener`에 NetInfo(`@react-native-community/netinfo`) 구독을 넘겨 온라인 상태를 연결한다. NetInfo는 Day 58에서 설치하므로 오늘은 연결 방법만 읽고 설치하지 않는다.

## 예측(10분)

1. 키를 `['posts', 'detail', 3]`처럼 `['posts']` 아래에 두면, Day 31의 삭제 mutation이 쓰는 `setQueriesData({ queryKey: ['posts'] }, (old) => old?.filter(...))`는 상세 캐시에도 적용된다. 이때 어떤 일이 생길까?

> 내 예측:

2. 상세 화면에 들어갔다가 뒤로 갔다 다시 들어올 때, `staleTime: 0`(기본)과 `staleTime: 30_000`에서 각각 로딩 스피너가 보일까, 요청이 다시 나갈까?

> 내 예측:

3. 상세 쿼리에 `gcTime: 5000`을 주고 상세를 떠나 10초 뒤 다시 들어가면 무엇이 달라질까? 또 오프라인 상태(`onlineManager.setOnline(false)`)에서 처음 상세에 들어가면 `status`와 `fetchStatus`는 각각 무엇일까?

> 내 예측:

## 만들기(40분)

새로 만들거나 고칠 파일:
- `src/api/queryKeys.ts`: 글 쿼리 키 팩토리 `postKeys`. 항목은 `all`(`['posts']`), `lists`(`['posts', 'infinite']`), `list(userId)`(`['posts', 'infinite', { userId }]`), `detail(id)`(`['posts', 'detail', id]`)로 한다. 상세 키를 `['post', id]`에서 `['posts', 'detail', id]`로 옮겨 `['posts']` 무효화가 상세에도 적용되게 한다. `src/hooks/usePosts.ts`, `src/hooks/usePost.ts`, `useCreatePost`, `useDeletePost`의 키 리터럴을 전부 `postKeys`로 바꾼다.
- `src/hooks/useDeletePost.ts`: 예측 1의 문제를 피하려고 `getQueriesData`·`setQueriesData`의 필터를 `postKeys.lists`로 좁힌다. `cancelQueries`는 `postKeys.all` 그대로 둔다.
- `app/_layout.tsx`: `new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })`로 바꾼다. 같은 파일의 `RootLayout` 안에 `AppState` 연결 `useEffect`를 추가한다.
- `src/hooks/usePost.ts`: 실험용으로 `gcTime: 5000`을 임시로 준다. `app/post/[id].tsx` 상단에 `fetchStatus`와 `isPaused`를 `Text`로 임시 표시한다.
- 설정 탭(`app/(tabs)/settings/index.tsx`): 개발용 임시 `Switch` "오프라인 흉내". 값이 바뀔 때 `onlineManager.setOnline(!value)`를 호출한다(`setOnline`은 온라인 상태를 수동으로 바꾸는 메서드이며, https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/OnlineManager 에서 확인한다. 검증 후 지운다).

핵심 호출 형태:

```ts
useEffect(() => {
  const sub = AppState.addEventListener('change', (status) => {
    if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
  });
  return () => sub.remove();
}, []);
```

완료 기준:
- [ ] 코드에 `['posts', ...]`, `['post', ...]` 형태의 키 리터럴이 남아 있지 않고 모두 `postKeys`를 거친다.
- [ ] 삭제 mutation이 상세 캐시를 건드리지 않는다(상세를 한 번 본 뒤 목록에서 다른 글을 삭제해도 에러가 없다).
- [ ] `staleTime: 30_000`에서 상세 재진입 시 재요청이 나가지 않고, `staleTime: 0`으로 낮추면 캐시를 보여 주면서 뒤에서 재요청이 나가는 것을 로그로 확인했다.
- [ ] `gcTime: 5000`일 때 10초 뒤 재진입하면 캐시가 사라져 로딩부터 시작하는 것을 확인했다. 확인 후 `gcTime` 임시 설정을 지운다.
- [ ] 앱을 백그라운드로 보냈다가(시뮬레이터 홈 버튼) 30초 이상 뒤에 돌아오면 stale인 active 쿼리가 다시 요청된다.
- [ ] 오프라인 스위치를 켠 채로 상세에 들어가면 `fetchStatus`가 `paused`이고, 스위치를 끄면 요청이 이어지는 것을 확인했다.
- [ ] NetInfo 연결은 코드에 넣지 않았고, Day 58에서 `onlineManager.setEventListener`로 바꿀 자리를 주석 한 줄로 표시했다.

## 검증(10분)

1. 상세 진입 → 뒤로 → 재진입을 `staleTime` 값별로 반복하며 요청 로그를 센다.
2. 홈 버튼으로 앱을 내렸다가 30초 이상 뒤에 돌아온다. 요청이 다시 나가는지 본다.
3. 오프라인 스위치로 예측 3의 후반부(`status`와 `fetchStatus`)를 확인한다.
4. 깨뜨려 보기: `AppState` 연결 `useEffect`를 주석 처리하고 같은 백그라운드 복귀 실험을 다시 한다. 재요청이 나가는지 관찰한 결과를 적고 되돌린다. 이 결과를 RN 문서가 `AppState` 연결을 안내하는 이유와 연결해 한 줄로 적는다.

> 다른 지점:

## 이해 점검 질문

1. 쿼리 키를 `['posts', id]`처럼 변수를 넣어 만드는 이유는? 변수를 빼고 `['posts']`로 두면 어떤 증상이 생기는가?
2. `staleTime`과 `gcTime`은 각각 무엇을 정하는가? 둘이 어떻게 다른가?
3. 오프라인일 때 쿼리의 `status`가 `error`가 아니라 `pending` + `fetchStatus: 'paused'`가 되는 이유는?

<details><summary>정답</summary>

1. 키가 캐시 항목의 이름이라서, 변수를 넣어야 변수마다 별도의 캐시가 생기고 변수가 바뀔 때 재요청이 일어난다. `['posts']`로 두면 글 1의 상세와 글 2의 상세가 같은 캐시를 공유해, 다른 글을 열어도 이전 글 내용이 보이거나 재요청이 일어나지 않는다.
2. `staleTime`은 받은 데이터를 "신선하다"고 볼 시간으로, 그 안에는 재요청하지 않는다(기본 0). `gcTime`은 쓰는 곳이 없어진(inactive) 캐시를 메모리에서 지우기까지 기다리는 시간이다(기본 5분). 하나는 재요청 여부, 다른 하나는 캐시 보관 기간이다.
3. 오프라인은 서버가 거부한 것이 아니라 요청을 아직 못 보낸 상태이기 때문이다. `networkMode: 'online'`에서는 연결이 없으면 `queryFn`을 실행하지 않고 대기(`paused`)하다가 연결이 돌아오면 이어서 실행한다. `status`는 데이터를 아직 못 받았다는 뜻의 `pending`으로 남는다. 그래서 스피너를 `pending`만 보고 그리면 오프라인에서 영원히 도는 것처럼 보인다. (근거: https://tanstack.com/query/latest/docs/framework/react/guides/network-mode 의 `fetchStatus` 설명)

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `refactor: 글 쿼리 키를 postKeys 팩토리로 모으기`
- `feat: AppState를 focusManager에 연결하고 staleTime 기본값 설정`
- `chore: 오프라인 흉내 스위치와 확인용 표시 제거`

## 웹과 다른 점

웹의 Query는 브라우저 창 포커스와 `online`/`offline` 이벤트를 자동으로 감지하지만, RN에는 브라우저 이벤트가 없어 `AppState`와 NetInfo를 직접 `focusManager`·`onlineManager`에 연결해야 한다.
