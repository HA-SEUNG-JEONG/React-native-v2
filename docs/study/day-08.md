# Day 8 · 11/5 (목) — SectionList, RefreshControl, 리스트 성능 기본

## 오늘의 목표

피드를 작성자(`userId`)별 섹션으로 나눈 `SectionList`로 바꾸고, 당겨서 새로고침과 항목 리렌더 줄이기를 적용한다.

## 읽기(15분)

1. https://reactnative.dev/docs/sectionlist
   - 확인할 사실: `sections`의 각 요소는 `data` 배열을 가진 객체이고 `key`는 선택이다. `renderSectionHeader`는 섹션 맨 위에 렌더된다. `stickySectionHeadersEnabled`는 iOS에서만 기본으로 켜진다. `keyExtractor`는 항목 key를 만들 뿐 섹션 자체에도 key가 필요하다는 문장.
2. https://reactnative.dev/docs/refreshcontrol
   - 확인할 사실: 스크롤이 맨 위일 때 아래로 당기면 `onRefresh`가 호출된다. `refreshing`은 제어되는 prop이라 `onRefresh`에서 `true`로 바꾸지 않으면 인디케이터가 바로 사라진다. iOS는 `tintColor`, Android는 `colors`·`progressBackgroundColor`로 색을 바꾼다.
3. https://reactnative.dev/docs/optimizing-flatlist-configuration
   - 확인할 사실: `windowSize` 기본값 21(화면 높이 단위), `initialNumToRender` 기본값 10, `maxToRenderPerBatch` 기본값 10. 값을 키우면 빈 영역(blank areas)은 줄지만 메모리를 더 쓴다. 항목은 `memo()`로 감싸고 `renderItem`은 `useCallback`으로 고정하라는 팁.

## 예측(10분)

1. `stickySectionHeadersEnabled`를 따로 지정하지 않고 iOS와 Android에서 스크롤하면 섹션 헤더가 어떻게 보일까?
   > 내 예측:
2. `onRefresh` 안에서 `setRefreshing(true)`를 호출하지 않고 시간 지연 후 `setRefreshing(false)`만 호출하면 화면에는 어떻게 보일까?
   > 내 예측:
3. 항목 컴포넌트를 `memo`로 감싸기 전에는 새 글을 맨 앞에 하나 추가할 때 `console.log`로 센 `PostCard` 렌더가 몇 번 일어날까? `memo`로 감싼 뒤에는?
   > 내 예측:

## 만들기(40분)

Day 7에서 만든 `app/index.tsx`의 피드 화면을 고친다. 기록 화면은 건드리지 않는다.

1. `MOCK_POSTS`(`data/mock-posts.ts`)를 화면 컴포넌트의 `posts` state 초기값으로 쓴다.
2. `posts`를 `userId`별로 묶어 `sections`를 만든다. 형태는 `{ title: 'User 1', data: [...] }`이다. 묶는 함수는 `app/index.tsx` 안에 둔다.
3. 피드의 `FlatList`를 `SectionList`로 바꾼다. `renderSectionHeader`에서 `section.title`을 보여 주고 `keyExtractor`는 Day 7과 같게 쓴다. `ItemSeparatorComponent`와 `ListEmptyComponent`는 유지한다.
4. `refreshing` state와 `onRefresh`를 `SectionList`의 같은 이름 props에 연결한다. `onRefresh`에서는 `setRefreshing(true)` → `setTimeout`으로 1초 뒤 새 글(`id`는 현재 최대 id + 1, `userId`는 1)을 `posts` 앞에 추가 → `setRefreshing(false)`.
5. 항목 카드를 같은 파일의 별도 함수 컴포넌트 `PostCard`로 빼고 `memo`로 감싼다. `renderItem`은 `useCallback`으로 감싼다. `PostCard` 안에 임시 `console.log`를 넣어 렌더 횟수를 센다.
6. 이 템플릿은 React Compiler가 켜져 있다(`app.json`의 `expo.experiments.reactCompiler`). 수동 `memo`·`useCallback`이 필요한지는 Day 62에서 측정으로 확인한다. 오늘은 `memo`의 동작만 익힌다.

```tsx
<SectionList
  sections={sections}
  keyExtractor={(p) => String(p.id)}
  renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
  refreshing={refreshing}
  onRefresh={onRefresh}
/>
```

완료 기준:
- [ ] 피드가 User 1, 2, 3 섹션으로 나뉘어 보이고 각 섹션 아래에 글 10개가 있다
- [ ] 아래로 당기면 인디케이터가 약 1초 보이고 맨 위에 새 글이 한 개 생긴다
- [ ] iOS에서는 섹션 헤더가 스크롤 중 위에 붙어 있다
- [ ] `PostCard`가 `memo`로 감싸져 있고, 새 글 추가 시 로그로 센 렌더 수가 `memo` 전보다 줄었다
- [ ] 임시 `console.log`를 제거했다

## 검증(10분)

- 예측 1번: iOS에서 섹션 헤더가 붙는지 확인한다. Android 에뮬레이터가 있다면 같이 본다. 없으면 `stickySectionHeadersEnabled={true}`를 줘서 차이를 알아본다.
- 예측 3번: `memo`를 제거했다가 다시 붙여 렌더 로그 수를 비교하고 표에 숫자를 적는다.
- 실험: `onRefresh`에서 `setRefreshing(true)` 줄을 지우고 당겨 본다. 인디케이터가 어떻게 되는지 적고 되돌린다.
  > 관찰:

| 예측 | 실제 | 다른 이유 |
|---|---|---|
| 1 |  |  |
| 2 |  |  |
| 3 |  |  |

## 이해 점검 질문

1. `SectionList`의 `sections`는 어떤 모양이어야 하고, `keyExtractor`로 충분하지 않은 이유(섹션 key)는 무엇인가?
2. `refreshing`이 "제어되는 prop"이라는 말은 무슨 뜻이며, `onRefresh`에서 `setRefreshing(true)`를 호출해야 하는 이유는?
3. `windowSize`를 키우면 어떤 이득과 비용이 있는가? 항목을 `memo`로 감싸는 효과는 무엇인가?

<details><summary>정답</summary>

1. `[{ title, data: [...] }, ...]`처럼 각 섹션이 `data` 배열을 가진 객체인 배열이다. `keyExtractor`는 항목의 key만 만든다. 섹션 자체에도 key가 필요하며, 지정하지 않으면 섹션 배열 index가 기본으로 쓰인다(섹션 순서를 바꿀 계획이면 `key`를 지정).
2. 리스트가 스스로 로딩 여부를 기억하지 않고 부모가 준 `refreshing` 값을 그대로 표시한다는 뜻이다. 당긴 순간 `onRefresh`가 호출되지만 부모가 `refreshing`을 `true`로 올리지 않으면 값이 `false`로 유지돼 인디케이터가 바로 사라진다(문서에 명시).
3. 이득: 빈 영역(blank areas)이 줄어 빠르게 스크롤해도 비어 보이는 구간이 적다. 비용: 렌더하는 항목이 늘어 메모리를 더 쓴다. 기본값 21은 화면 높이 기준 위 10 + 현재 1 + 아래 10이다. `memo`는 props가 같으면 항목을 다시 그리지 않아, 목록 일부만 바뀔 때 나머지 항목의 렌더를 건너뛴다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 피드를 작성자별 섹션으로 나눈 SectionList로 변경`
- `feat: 당겨서 새로고침 추가`
- `refactor: PostCard를 memo로 분리해 불필요한 리렌더 줄이기`

## 웹과 다른 점

웹에는 pull-to-refresh와 sticky 섹션 헤더를 컴포넌트가 기본으로 주지 않지만, RN 리스트는 이를 prop으로 제공하며 sticky 헤더는 iOS에서만 기본으로 켜져 플랫폼마다 기본 동작이 다르다.
