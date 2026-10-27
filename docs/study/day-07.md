# Day 7 · 11/4 (수) — FlatList 기본: data·renderItem·keyExtractor

## 오늘의 목표

JSONPlaceholder 모양의 목 데이터로 피드 목록을 `FlatList`로 그리고, 화면 상단에 기록/피드 전환 버튼을 만든다.

## 읽기(15분)

1. https://reactnative.dev/docs/0.81/flatlist
   - 확인할 사실: `data`와 `renderItem`이 필수다. `renderItem`은 `{ item, index, separators }` 객체를 받는다. `keyExtractor`를 주지 않으면 `item.key`, 그다음 `item.id`, 마지막으로 index를 쓴다. `ItemSeparatorComponent`는 항목 사이에만, `ListEmptyComponent`는 데이터가 빌 때, `ListHeaderComponent`는 목록 맨 위에 렌더된다. `initialNumToRender` 기본값은 10이다.
2. https://reactnative.dev/docs/0.81/scrollview
   - 확인할 사실: `ScrollView`는 모든 자식을 한 번에 렌더하고, `FlatList`는 곧 보일 항목만 렌더하며 멀리 벗어난 항목을 제거한다. 긴 목록에는 `FlatList`를 쓰라는 문장을 찾는다.
3. https://jsonplaceholder.typicode.com/posts
   - 확인할 사실: 응답은 100개의 글 배열이고 각 글은 `userId`, `id`, `title`, `body` 필드를 가진다. 오늘은 네트워크를 쓰지 않고 이 모양을 흉내 낸 목 데이터를 쓴다. 실제 fetch는 Day 25에서 한다.

## 예측(10분)

1. 30개짜리 목록을 `FlatList`로 그릴 때, `renderItem` 안의 `console.log`는 첫 렌더에서 몇 번쯤 찍힐까? 30번일까, 그보다 적을까?
   > 내 예측:
2. `FlatList`를 세로 `ScrollView` 안에 넣으면 어떻게 될까? 개발 중 터미널이나 화면에 경고가 뜰까?
   > 내 예측:
3. `data`를 빈 배열로 바꾸고 `ListEmptyComponent`를 주지 않으면 화면에 무엇이 보일까?
   > 내 예측:

## 만들기(40분)

피드 화면의 목록 부분을 만든다. 탭 구조는 Day 15~17에서 expo-router로 만들므로, 지금은 `app/index.tsx` 안에서 state로 화면을 바꾸는 임시 버튼을 쓴다.

1. 새 파일 `data/mock-posts.ts`를 만든다(`app/` 밖에 둔다. `app/` 아래 파일은 모두 라우트가 되기 때문이다). `Post` 타입(`userId`, `id`, `title`, `body`)을 내보내고, 30개를 `Array.from`으로 생성해 `MOCK_POSTS`로 내보낸다. `id`는 1부터 숫자로 하고 `userId`는 10개마다 1씩 오른다.
   ```ts
   export const MOCK_POSTS: Post[] = Array.from({ length: 30 }, (_, i) => ({
     id: i + 1,
     userId: Math.floor(i / 10) + 1,
     title: `글 제목 ${i + 1}`,
     body: `글 본문 ${i + 1} ...`,
   }));
   ```
2. `app/index.tsx` 최상단에 `tab` state(`'log'` 또는 `'feed'`)와 "기록 | 피드" `Pressable` 두 개를 둔다. `tab === 'log'`이면 Day 6까지 만든 기록 화면(작성 폼과 기록 목록)을, `'feed'`이면 피드 목록을 보여 준다. 이 버튼은 Day 17에서 탭으로 교체되는 임시 구조다.
3. 피드 목록은 `FlatList`로 만든다. `data={MOCK_POSTS}`, `keyExtractor`는 `String(item.id)`를 쓴다. 각 항목은 제목 `Text`(`numberOfLines={1}`)와 본문 `Text`(`numberOfLines={2}`)를 가진 카드다.
4. `ItemSeparatorComponent`로 얇은 구분선을, `ListHeaderComponent`로 "피드 30개" 같은 개수 `Text`를, `ListEmptyComponent`로 "글이 없습니다"를 단다.
5. `renderItem`에 임시로 `console.log(item.id)`를 넣어 몇 번 호출되는지 센다.

완료 기준:
- [ ] "기록 | 피드" 버튼으로 두 화면이 바뀌고, 기록 화면은 Day 6 상태 그대로 동작한다
- [ ] 피드에 30개 글이 스크롤로 모두 보인다
- [ ] 항목 사이에만 구분선이 있고, 맨 위에 개수 헤더가 있다
- [ ] 제목은 한 줄, 본문은 두 줄에서 말줄임표로 잘린다
- [ ] `MOCK_POSTS`를 빈 배열로 바꾸면 "글이 없습니다"가 보인다

## 검증(10분)

- 예측 1번: 첫 렌더에서 `renderItem`이 찍은 로그 수를 세고, 스크롤하면 어떻게 달라지는지 본다. `initialNumToRender`와 비교한다.
- 예측 3번: `ListEmptyComponent`를 지웠다가 되돌려 보고 차이를 적는다.
- 실험: 피드의 `FlatList`를 임시로 `ScrollView` 안에 넣고 저장한다. 터미널이나 화면에 뜬 경고 원문을 옮겨 적는다. 확인 후 되돌린다.
  > 경고 원문:

| 예측 | 실제 | 다른 이유 |
|---|---|---|
| 1 |  |  |
| 2 |  |  |
| 3 |  |  |

## 이해 점검 질문

1. `FlatList`와 `ScrollView` + `map`은 렌더 방식이 어떻게 다르고, 목 데이터가 3천 개로 늘면 어떤 차이가 생기는가?
2. `keyExtractor`는 무엇을 위한 것이고, 기본 동작은 무엇인가? index를 key로 쓰면 어떤 문제가 생길 수 있는가?
3. `renderItem={({ item }) => ...}`에서 인자를 객체로 구조 분해하는 이유는 무엇인가?

<details><summary>정답</summary>

1. `ScrollView` + `map`은 모든 항목을 한 번에 렌더해 항목이 많을수록 첫 렌더가 느려지고 메모리를 더 쓴다. `FlatList`는 화면에 곧 보일 항목만 렌더하고 멀리 벗어난 항목은 제거한다(가상화). 3천 개면 `ScrollView`는 3천 개를 모두 만들지만 `FlatList`는 초기 약 10개(`initialNumToRender` 기본값)와 스크롤 창 안의 항목만 만든다.
2. 항목을 구별하는 안정적인 문자열 key를 만들어 캐시와 React의 `key`로 쓰기 위한 것이다. 기본 동작은 `item.key`, 그다음 `item.id`, 둘 다 없으면 index다. index key는 항목이 삽입·삭제·재정렬되면 같은 위치의 다른 항목이 이전 항목의 key를 물려받아 상태가 엉키거나 불필요하게 다시 그려질 수 있다.
3. `FlatList`는 `renderItem`에 `{ item, index, separators }` 객체 하나를 넘긴다. 필요한 필드만 구조 분해로 꺼내 쓴다. `item`은 `data` 배열의 한 요소다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: JSONPlaceholder 모양의 목 데이터 추가`
- `feat: 피드 목록을 FlatList로 구현하고 기록/피드 임시 전환 추가`

## 웹과 다른 점

웹은 긴 목록도 DOM에 그냥 `map`으로 그리는 일이 흔하지만, RN은 화면 밖 항목을 만들지 않고 제거하는 가상화 목록(`FlatList`)을 기본으로 쓴다.
