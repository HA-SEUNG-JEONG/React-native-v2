# Day 15 · 11/16 (월) — expo-router 파일 기반 라우팅

## 오늘의 목표

한 화면이던 Daily Log를 `app/` 폴더의 파일 두 개(피드 `index.tsx`, 기록 `write.tsx`)로 나누고, `Link`로 오가는 것을 확인한다.

## 읽기(15분)

1. Expo Router 핵심 개념: https://docs.expo.dev/router/basics/core-concepts/
   - 확인할 사실: `app`의 파일은 기본 export가 곧 화면이고, 파일 경로가 URL이 된다(`profile/friends.tsx`는 `/profile/friends`). `index.tsx`는 그 폴더의 기본 화면이다. 루트 `_layout.tsx`는 어떤 화면보다 먼저 렌더되고 예전 `App.jsx` 자리를 대신한다. 이 문서는 `src/app`으로 쓰여 있지만 이 프로젝트는 루트의 `app/`이다.
2. 라우트 표기법: https://docs.expo.dev/router/basics/notation/
   - 확인할 사실: `index`, `_layout`, `[param]`, `(group)`, `+not-found`가 각각 무엇을 뜻하는지 표로 정리한다. 특히 `(group)` 폴더 이름은 URL에 포함되지 않는다.
3. 페이지 사이 이동: https://docs.expo.dev/router/basics/navigation/
   - 확인할 사실: `<Link href="/about">`이 기본 이동 수단이다. `Link`는 기본적으로 자식을 `Text`로 감싸므로, `View`나 `Pressable`을 자식으로 쓰려면 `asChild`가 필요하다. 명령형 이동은 `router.push`, `router.replace`, `router.back`이다.

## 예측(10분)

1. `app/write.tsx`를 만들고 어디에서도 import하지 않았을 때, 앱에서 `/write` 화면에 갈 수 있는가?

> 내 예측:

2. `app/` 안에 `Card.tsx`처럼 기본 export가 없는 일반 파일을 두면 어떻게 되는가? (Day 12에서 `components`를 `src/`로 옮긴 이유와 연결해 적는다)

> 내 예측:

3. `Stack`을 쓰는 `_layout.tsx`에서 화면 제목을 따로 지정하지 않았을 때, 헤더에 보이는 제목은 무엇이 될 것 같은가?

> 내 예측:

## 만들기(40분)

지금까지는 `app/index.tsx` 한 화면에 입력 폼과 목록이 같이 있었다. 이를 라우트 두 개로 나눈다.

중요한 변화: 화면을 나누면 기록 화면에서 입력한 글이 피드에 나타나지 않는다. 피드는 `Post`(`MOCK_POSTS`)만 보여 주고 기록(`LogEntry`)과 섞지 않는다. 기록 개수 공유는 Day 22에서 한다. 오늘은 이 상태가 정상이다.

새로 만들 파일:
- `app/write.tsx` — 기존 `app/index.tsx`의 내용(입력 폼 + 이번에 작성한 글 목록)을 그대로 옮겨 기록 화면으로 쓴다. 기본 export 컴포넌트 이름은 `WriteScreen`으로 바꾼다.
- `app/_layout.tsx` — 템플릿 초기화 후 이미 있으면 내용을 확인만 한다. 없으면 `Stack`을 렌더하는 기본 export를 만든다.

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack />;
}
```

고칠 파일:
- `app/index.tsx` — 피드 화면 `FeedScreen`으로 바꾼다. `@/data/mock-posts`의 `MOCK_POSTS`를 `FlatList`와 `PostCard`로 보여 준다(Day 8의 `SectionList`는 `FlatList`로 되돌리고 `refreshing`·`onRefresh`는 유지한다). Day 7의 기록|피드 전환 버튼을 지운다. `now`·`useNow`는 피드에서 빼고 `app/write.tsx`의 `LogItem`에 남긴다. 화면 위쪽에 `<Link href="/write">글쓰기</Link>`를 둔다.
- `app/write.tsx` — 위쪽에 피드로 돌아가는 `<Link href="/">피드</Link>`를 둔다.
- `src/data/entries.ts`와 `ENTRIES`가 남아 있으면 모두 지운다.

완료 기준:
- [ ] `app/`에 `_layout.tsx`, `index.tsx`, `write.tsx`가 있고 `app/` 안에 라우트가 아닌 파일은 없다
- [ ] 피드에서 `글쓰기`를 누르면 기록 화면으로 이동하고 헤더에 뒤로가기가 보인다
- [ ] 기록 화면에서 글을 쓰면 그 화면의 목록에는 나타난다(피드에는 나타나지 않는다)
- [ ] 피드가 `MOCK_POSTS`를 `PostCard`로 보여 준다
- [ ] `npm run typecheck`와 `npx expo lint`가 오류 0개다

## 검증(10분)

- 시뮬레이터에서 `글쓰기`를 누르고, 기록 화면에서 뒤로 가기를 눌러 피드로 돌아오는 것을 확인한다. 헤더의 제목 문자열을 적는다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- 일부러 깨뜨려 보기: `app/write.tsx` 파일 이름을 `app/compose.tsx`로 바꾸고 `Link`의 `href="/write"`는 그대로 둔다. `npm run typecheck`에서 오류가 나는지, 앱에서 `글쓰기`를 눌렀을 때 무엇이 보이는지 적는다. `app.json`의 `experiments.typedRoutes` 값이 `true`인지도 함께 확인해 오류 여부와 연결해 적는다(타입이 지정된 라우트 문서: https://docs.expo.dev/router/reference/typed-routes/). 확인이 끝나면 이름을 되돌린다.

## 이해 점검 질문

1. `app/profile/index.tsx`, `app/(auth)/login.tsx`, `app/post/[id].tsx`는 각각 어떤 URL이 되는가?
2. `Link`가 `<a>`와 달리 자식을 `Text`로 감싸는 이유와, 자식으로 `Pressable`을 쓰고 싶을 때 필요한 prop은 무엇인가?
3. 화면을 둘로 나누자 기록 화면에서 `useState`로 든 글을 다른 화면이 읽을 수 없다. 왜이고, 어떻게 해결하게 되는가?

<details>
<summary>정답</summary>

1. `/profile`, `/login`, `/post/<id 값>`이다. `index.tsx`는 폴더의 기본 화면이라 URL에 `index`가 붙지 않고, `(auth)`처럼 괄호로 묶인 폴더는 URL에 포함되지 않는 그룹이며, `[id]`는 동적 세그먼트다.
2. RN에서는 문자열을 `Text` 안에서만 렌더할 수 있고, 링크의 기본 자식은 글자이기 때문이다. `Link`가 기본으로 `Text`로 감싸는 것이다. `View`나 `Pressable`을 자식으로 쓰려면 `asChild`를 붙여 `onPress`를 받는 자식에게 링크 동작을 위임해야 한다.
3. 상태가 기록 화면 컴포넌트 안의 `useState`에 갇혀 있어, 다른 화면은 그 값에 접근할 수 없기 때문이다. 화면(컴포넌트) 밖에서 상태를 들고 있는 Context를 Day 21~22에서 도입해 해결한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `refactor: 한 화면을 피드와 기록 라우트로 분리`
- `feat: 샘플 데이터와 화면 이동 링크 추가`

## 웹과 다른 점

파일 경로가 URL이 되는 규칙은 Next.js와 비슷하지만, 앱에서 URL은 주소창이 아니라 화면 스택 이동과 딥링크(Day 18)에 쓰인다.
