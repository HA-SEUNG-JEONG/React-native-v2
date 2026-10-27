# Day 54 · 1/8 (금) — 버퍼 + 11주차 점검

## 오늘의 목표

11주차(Day 50~53)의 제스처·Reanimated·테마 내용을 정답을 가리고 꺼내 보고, 가장 헷갈린 개념 하나를 소리 내어 설명하고, 밀린 Day를 따라잡는다.

## 주간 점검 퀴즈(30분)

정답을 가리고 종이나 메모에 먼저 답한다. 푼 결과는 `docs/quiz/2027-01-08-day-54.md`에 `AGENTS.md`의 상세 구조(문항별 상세, 종합 약점 패턴, 재복습 일정)로 기록한다.

1. `GestureHandlerRootView`를 앱 루트에 두지 않고 `GestureDetector`만 쓰면 어떻게 될까? 이 Day들에서 `RootLayout` 맨 바깥에 둔 이유와 Android `Modal` 안에서 필요한 조치를 함께 말해 보자. (Day 50)
2. 한 뷰에 싱글탭과 더블탭을 같이 붙일 때 `Gesture.Exclusive(doubleTap, singleTap)`를 쓰는 이유는 무엇이고, `Race`나 `Simultaneous`를 쓰면 무엇이 달라질까? (Day 50)
3. 제스처 콜백 안에서 `setState`를 그냥 부르면 왜 에러가 나는지 설명하고, 해결 방법 두 가지를 말해 보자. (Day 50, 52)
4. 하트 팝 애니메이션의 `scale` 값을 `useState`가 아닌 shared value로 두는 이유는 무엇이고, `sv.value = 1.4` 직후 `console.log(sv.value)`가 이전 값을 찍을 수 있는 이유는 무엇일까? (Day 51)
5. 다크 모드를 완성하려면 `useColorScheme()` 기반 색 토큰과 `ThemeProvider`가 각각 왜 필요하고, `Appearance.setColorScheme(null)`은 무엇을 하는가? (Day 53)

<details>
<summary>정답</summary>

1. `GestureHandlerRootView` 밖에서는 제스처가 인식되지 않고 제스처 사이 관계도 같은 root 안에서만 유효하다. 모든 화면을 포함하도록 `RootLayout` 맨 바깥에 한 번 둔다. 중첩된 root는 가장 바깥 것만 쓰인다. Android에서는 `Modal` 안의 제스처가 동작하려면 `Modal` 내용을 별도의 `GestureHandlerRootView`로 감싸야 한다(문서에 명시).
2. `Exclusive`는 앞에 적은 제스처가 우선이고 뒤 제스처는 앞 제스처가 실패해야 활성화된다. 더블탭을 앞에 두면 두 번째 탭이 오지 않아 더블탭이 실패한 뒤에만 싱글탭이 활성화되므로 둘이 섞이지 않는다. `Race`는 먼저 활성화되는 제스처 하나가 나머지를 취소하므로, 싱글탭이 먼저 성공해 더블탭이 못 나온다. `Simultaneous`는 둘 다 활성화될 수 있어 두 번 탭하면 싱글탭과 더블탭이 모두 실행된다.
3. Reanimated(worklets) 플러그인이 제스처 콜백을 worklet으로 바꿔 UI 스레드에서 실행하는데, React `setState` 같은 일반 JS 함수는 UI 스레드에서 동기 호출할 수 없어 "Tried to synchronously call a non-worklet function"류 에러가 난다. 해결은 (1) 제스처에 `.runOnJS(true)`를 붙여 콜백 전체를 JS 스레드에서 실행하거나, (2) 콜백 안에서 `scheduleOnRN(함수, 인자)`로 그 함수만 JS 스레드에서 실행하도록 예약하는 것이다.
4. shared value를 바꿔도 React 리렌더 없이 UI 스레드가 `useAnimatedStyle`로 스타일을 직접 갱신하므로, 매 프레임 JS 리렌더 없이 부드럽게 움직인다. 쓰기는 UI 스레드에서 동기 반영되지만 JS 스레드에서 읽는 값은 비동기로 오기 때문에 쓰기 직후 읽으면 이전 값이 나올 수 있다.
5. `useColorScheme()`로 읽은 값으로 `Colors.light`/`Colors.dark` 토큰을 골라 화면 본문·카드의 색을 칠한다. 헤더·탭바 같은 내비게이션 요소의 색은 `@react-navigation/native`의 `ThemeProvider`(`DarkTheme`/`DefaultTheme`)가 정하므로 둘 다 필요하다. `Appearance.setColorScheme(null)`은 앱의 색상표 강제를 풀어 시스템 설정을 다시 따르게 한다.

</details>

## 구술 1주제(15분)

주제: "제스처 콜백이 UI 스레드에서 실행된다는 것의 의미와, 그 안에서 화면 상태를 바꾸는 방법"

소리 내어 2분 동안 설명한다. 다음 핵심어를 모두 포함한다.

- worklet
- UI 스레드와 JS 스레드
- shared value
- `.runOnJS(true)`
- `scheduleOnRN`

설명이 막힌 지점을 아래에 적고, 해당 Day 카드의 이해 점검 질문으로 돌아가 확인한다.

> 막힌 지점:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문을 위에서부터 처리한다. 15분 안에 못 푼 질문은 에러 원문, 시도한 것, 확인한 문서 링크를 보강해 남기고 다음 주 금요일로 넘긴다.

- [ ] 이번 주 쌓인 질문 개수를 센다
- [ ] 해결한 질문은 해결 방법 한 줄을 적고 표시한다
- [ ] 못 푼 질문은 보강한 내용을 남긴다

## 밀린 Day 흡수

밀린 Day가 있으면 오늘 남는 시간에 Day 번호 순서대로 하나만 한다. 하루에 Day 둘을 하지 않는다. 3일 이상 밀렸다면 Day 52(건너뛰기 가능)는 읽기만 한다.

- [ ] Day 50 만들기와 검증을 끝냈다
- [ ] Day 51 만들기와 검증을 끝냈다
- [ ] Day 52 만들기와 검증을 끝냈다(또는 읽기만 하기로 했다)
- [ ] Day 53 만들기와 검증을 끝냈다
- [ ] 각 Day 이해 점검 질문을 정답 가리고 풀었다

## 기록(5분)

이번 주에 가장 헷갈렸던 것:

다음 주 전에 다시 볼 Day:

막힌 점:
