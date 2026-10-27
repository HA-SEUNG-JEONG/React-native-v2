# Day 59 · 1/15 (금) — 버퍼 + 12주차 점검

## 오늘의 목표

12주차(Day 55~58)의 접근성·반응형·Error Boundary·오프라인 처리 내용을 정답을 가리고 꺼내 보고, 가장 헷갈린 개념 하나를 소리 내어 설명하고, 밀린 Day를 따라잡는다.

## 주간 점검 퀴즈(30분)

정답을 가리고 종이나 메모에 먼저 답한다. 푼 결과는 `docs/quiz/2027-01-15-day-59.md`에 `AGENTS.md`의 상세 구조(문항별 상세, 종합 약점 패턴, 재복습 일정)로 기록한다.

1. `accessibilityLabel`을 주지 않은 `Pressable` 카드의 스크린 리더 라벨은 어떻게 만들어지고, 아이콘만 있는 좋아요 버튼에는 `accessibilityRole`과 `accessibilityState`를 어떻게 줘야 할까? (Day 55)
2. 스와이프 삭제 행을 스크린 리더 사용자가 쓰게 하려면 무엇을 추가해야 하고 어떤 두 속성이 필요할까? (Day 55)
3. `useWindowDimensions()`가 `Dimensions.get('window')`보다 컴포넌트에서 나은 이유는 무엇이고, 피드의 열 수를 바꿀 때 `FlatList`에 `key`가 필요한 이유는 무엇일까? (Day 56)
4. 에러 경계가 잡을 수 있는 에러와 잡을 수 없는 에러를 구분하고, 카드마다 감싼 클래스 경계와 라우트의 `ErrorBoundary` export의 범위 차이를 말해 보자. (Day 57)
5. `isConnected`와 `isInternetReachable`의 차이는 무엇이고, 앱 시작 직후 `null`일 때 배너를 어떻게 다루고 왜 그래야 할까? (Day 58)

<details>
<summary>정답</summary>

1. 터치 가능한 요소는 기본적으로 접근 가능하고, 라벨은 자식 `Text` 내용을 공백으로 이어 붙여 만들어진다. 읽기 좋지 않으면 `accessibilityLabel`로 직접 준다. 아이콘만 있는 좋아요 버튼은 `accessibilityRole="button"`, 라벨 `"좋아요"`, `accessibilityState={{ selected: liked }}`를 줘서 용도와 현재 상태를 함께 전달한다.
2. 스와이프는 스크린 리더 사용자가 수행하기 어려운 제스처이므로 같은 기능을 `accessibilityActions`로 노출한다. `accessibilityActions`에 `{ name: 'delete', label: '삭제' }` 같은 동작을 정의하고, `onAccessibilityAction`에서 `event.nativeEvent.actionName`을 보고 삭제를 수행한다. 두 속성이 모두 있어야 동작한다.
3. `Dimensions.get`은 호출 시점의 스냅샷이라 크기·글자 크기가 바뀌어도 갱신되지 않고, `useWindowDimensions`는 변경을 구독해 리렌더하므로 렌더에서 레이아웃을 정하는 컴포넌트에 맞는다. `FlatList`는 실행 중 `numColumns`가 바뀌면 에러를 내므로, 열 수가 바뀔 때 `key`도 바꿔 목록을 새로 마운트해야 한다.
4. 렌더 중 자식이 던진 에러는 잡지만 이벤트 핸들러 에러, 비동기 코드 에러, 경계 자신의 에러는 못 잡는다(그런 에러는 `try/catch`나 에러 상태로 처리). 카드마다 감싼 클래스 경계는 그 카드 하나만 폴백으로 바꾸고, 라우트의 `ErrorBoundary` export는 그 라우트 화면 전체를 폴백으로 바꾸며, export가 없으면 에러가 상위 경계로 올라간다.
5. `isConnected`는 활성 네트워크 연결이 있는지, `isInternetReachable`은 그 연결로 인터넷에 닿는지다. 시작 직후에는 상태를 아직 모르므로 `null`이고, `null`을 오프라인으로 보면 온라인 사용자에게도 배너가 잠깐 깜빡인다. 그래서 둘 중 하나가 명확히 `false`일 때만 오프라인으로 본다.

</details>

## 구술 1주제(15분)

주제: "앱에서 실패가 생겼을 때 사용자에게 무엇을 보여 줄 것인가: 렌더 에러, 비동기 에러, 오프라인"

소리 내어 2분 동안 설명한다. 다음 핵심어를 모두 포함한다.

- Error Boundary와 `getDerivedStateFromError`
- 이벤트 핸들러·비동기 에러는 경계가 못 잡는다
- `isConnected`와 `isInternetReachable`
- `onlineManager`
- 폴백 UI와 재시도

설명이 막힌 지점을 아래에 적고, 해당 Day 카드의 이해 점검 질문으로 돌아가 확인한다.

> 막힌 지점:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문을 위에서부터 처리한다. 15분 안에 못 푼 질문은 에러 원문, 시도한 것, 확인한 문서 링크를 보강해 남기고 다음 주 금요일로 넘긴다.

- [ ] 이번 주 쌓인 질문 개수를 센다
- [ ] 해결한 질문은 해결 방법 한 줄을 적고 표시한다
- [ ] 못 푼 질문은 보강한 내용을 남긴다

## 밀린 Day 흡수

밀린 Day가 있으면 오늘 남는 시간에 Day 번호 순서대로 하나만 한다. 하루에 Day 둘을 하지 않는다.

- [ ] Day 55 만들기와 검증을 끝냈다
- [ ] Day 56 만들기와 검증을 끝냈다
- [ ] Day 57 만들기와 검증을 끝냈다
- [ ] Day 58 만들기와 검증을 끝냈다
- [ ] 각 Day 이해 점검 질문을 정답 가리고 풀었다
- [ ] 11주차(Day 54) 퀴즈에서 틀린 항목의 재복습 일정을 확인했다

## 기록(5분)

이번 주에 가장 헷갈렸던 것:

다음 주 전에 다시 볼 Day:

막힌 점:
