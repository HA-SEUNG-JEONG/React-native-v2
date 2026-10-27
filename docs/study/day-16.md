# Day 16 · 11/17 (화) — Stack, 동적 라우트, 파라미터

## 오늘의 목표

피드에서 글을 누르면 `app/post/[id].tsx` 상세 화면으로 이동해 URL 파라미터로 글 하나를 보여 주고, Stack 헤더 제목을 글 제목으로 바꾼다.

## 읽기(15분)

1. URL 파라미터: https://docs.expo.dev/router/reference/url-parameters/
   - 확인할 사실: `[user].tsx` 같은 파일 이름이 동적 세그먼트이고, `useLocalSearchParams`가 현재 화면의 파라미터를 돌려준다. 파라미터는 항상 문자열이다. `useLocalSearchParams<{ user: string }>()`처럼 제네릭으로 타입을 준다. `useLocalSearchParams`는 현재 화면의 값을, `useGlobalSearchParams`는 주소 전체의 값을 돌려준다.
2. Stack 레이아웃: https://docs.expo.dev/router/advanced/stack/
   - 확인할 사실: `_layout.tsx`의 `<Stack.Screen name="..." options={{...}} />`로 화면별 옵션을 정적으로 정하고, 화면 파일 안에서 `<Stack.Screen options={{ title: ... }} />`를 렌더하면 파라미터에 따라 옵션을 동적으로 정할 수 있다. `title`을 안 주면 화면 이름이 제목이 된다.
3. 페이지 사이 이동: https://docs.expo.dev/router/basics/navigation/
   - 확인할 사실: `router.push`는 새 화면을 스택에 쌓고 `router.back`은 이전 화면으로 돌아간다. 동적 라우트로 이동할 때 `typedRoutes`가 켜져 있으면 문자열 대신 객체 `href`가 필요할 수 있는데, 정확한 형식은 https://docs.expo.dev/router/reference/typed-routes/ 에서 확인한다.

## 예측(10분)

1. `/post/3`으로 이동했을 때 `useLocalSearchParams<{ id: string }>()`가 돌려준 `id`를 `typeof`로 찍으면 무엇인가? 그리고 `MOCK_POSTS.find((p) => p.id === id)`는 글을 찾는가?

> 내 예측:

2. 피드에서 글을 눌러 상세로 갔다가 뒤로 오면, 피드 화면 컴포넌트는 언마운트되었다가 다시 마운트되는가, 계속 살아 있는가?

> 내 예측:

3. 존재하지 않는 `/post/999`로 이동하면 무엇이 보이는가?

> 내 예측:

## 만들기(40분)

Day 7에서 만든 `@/data/mock-posts`의 `MOCK_POSTS`를 상세 화면의 데이터로 쓴다.

새로 만들 파일:
- `app/post/[id].tsx` — `useLocalSearchParams<{ id: string }>()`로 `id`를 읽고, `Number(id)`로 숫자로 바꿔 `MOCK_POSTS`에서 글을 찾는다. 글이 있으면 제목, 본문을 `Card`로 보여 주고, 없으면 `EmptyState message="글을 찾을 수 없어요"`를 보여 준다. 글이 있을 때 `<Stack.Screen options={{ title: entry.title }} />`로 헤더 제목을 글 제목으로 정한다.

고칠 파일:
- `app/_layout.tsx` — `Stack` 안에 `index`는 `title: '피드'`, `write`는 `title: '기록'`, `post/[id]`는 기본 제목 `글`로 정적 옵션을 준다.
- `app/index.tsx` — `PostCard`의 `onPress`에서 `router.push`로 `/post/<id>`로 이동한다. 템플릿 문자열을 쓰거나 `typedRoutes`가 요구하면 객체 `href`를 쓴다.

핵심 형태:

```tsx
const { id } = useLocalSearchParams<{ id: string }>();
const entry = MOCK_POSTS.find((p) => p.id === Number(id));
```

이번 Day의 상세 화면은 `MOCK_POSTS`만 보여 준다. 기록 상세는 Day 46의 `app/log/[id].tsx`가 맡는다.

완료 기준:
- [ ] `app/post/[id].tsx`가 있고 피드의 글을 누르면 해당 글의 상세가 열린다
- [ ] 헤더 제목이 글 제목으로 바뀌고 뒤로가기가 동작한다
- [ ] 없는 id(`/post/999`)에서 "글을 찾을 수 없어요"가 보이고 앱이 죽지 않는다
- [ ] `id` 비교에서 `Number(id)` 변환이 빠지면 `npm run typecheck`가 잡는 것을 확인했다
- [ ] `npm run typecheck`와 `npx expo lint`가 오류 0개다

## 검증(10분)

- 시뮬레이터에서 피드의 글 3개를 차례로 눌러 각 상세가 맞는지 본다. 피드 화면 컴포넌트에 임시 `useEffect`로 마운트/언마운트 로그를 찍고 상세로 갔다 돌아올 때 로그가 어떻게 나오는지 본다. 확인 후 로그를 지운다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- 일부러 깨뜨려 보기: `Number(id)`를 빼고 `p.id === id`로 비교한다. `npm run typecheck`가 무엇을 지적하는지, 이 코드가 타입 검사 없이 실행되었다면 어떤 화면이 나왔을지 적는다. 확인 후 되돌린다.

## 이해 점검 질문

1. `useLocalSearchParams`가 돌려주는 값의 타입이 숫자가 아니라 문자열인 이유는 무엇이고, 어떻게 처리하는가?
2. 상세 화면의 헤더 제목을 `_layout.tsx`의 정적 옵션이 아니라 화면 파일 안의 `<Stack.Screen options>`로 정하는 이유는 무엇인가?
3. Stack 안에서 상세로 이동했다가 뒤로 오면 피드 화면은 어떻게 되며, 그래서 어떤 점이 웹 페이지 이동과 다른가?

<details>
<summary>정답</summary>

1. 라우트 파라미터는 URL 경로와 쿼리 문자열에서 오므로 항상 문자열이다. 숫자 `id`와 비교하려면 `Number(id)`처럼 변환해야 하고, 변환하지 않으면 `3 === "3"`이 거짓이라 글을 못 찾는다. 이 불일치를 `tsc`가 비교 단계에서 잡아 준다.
2. 제목이 글 내용(파라미터로 찾은 글의 `title`)에 따라 달라지는데, `_layout.tsx`는 데이터를 모르는 정적 설정 자리이기 때문이다. 화면 파일은 파라미터를 알고 있어서 글을 찾은 뒤 그 값으로 옵션을 정할 수 있다.
3. Stack은 새 화면을 쌓고 뒤로 가면 맨 위 화면만 제거하므로, 이전 화면(피드)은 보통 언마운트되지 않고 스크롤 위치와 상태를 유지한 채 남는다. 실제 동작은 위 검증의 로그로 확인한다. 웹 SPA처럼 이전 페이지를 내리고 새로 그리는 것과 다르다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 글 상세 동적 라우트 추가`
- `feat: Stack 헤더 제목을 글 제목으로 설정`

## 웹과 다른 점

웹에서는 링크를 따라가면 이전 페이지가 내려가는 것이 보통이지만, RN의 Stack은 화면을 쌓아 두고 뒤로 가기가 위 화면만 걷어내므로 이전 화면의 상태가 남아 있다.
