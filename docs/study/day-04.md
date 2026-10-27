# Day 4 · 10/30 (금) — 버퍼 + 1주차 점검

## 오늘의 목표

1주차(Day 1~3)에서 배운 환경, 코어 컴포넌트, 스타일·Flexbox를 퀴즈와 구술로 점검하고 밀린 Day를 흡수한다.

> 1주차는 화~금 4일이라 학습 Day가 3개(Day 1~3)다. 퀴즈 5문항은 이 3개 Day에서 낸다.

## 주간 점검 퀴즈(30분)

정답을 가리고 풀고, 맞은 뒤에도 "왜"를 한 문장으로 적는다. 결과는 `docs/quiz/2026-10-30-day-04.md`에 `AGENTS.md`의 상세 구조(문항별 상세, 종합 약점 패턴, 재복습 일정)로 기록한다.

1. Expo Go와 development build는 무엇이 다른가? SDK 54 앱을 iOS 시뮬레이터에서 바로 열 수 있는 이유는?
2. `npm run reset-project`가 지우거나 만드는 것을 말하고, 질문에 `n`과 `y` 중 무엇을 골랐는지, 왜 그렇게 골랐는지 설명하라.
3. 다음 코드는 오류가 난다. 이유와 고치는 방법은?
   ```tsx
   <View>
     <Text>제목</Text>
     오늘의 기록
   </View>
   ```
4. 카드 `View`에 `flexDirection: 'row'`를 주고 자식으로 `Image`와 `View`(안에 긴 `Text`)를 놓았더니 글이 오른쪽 밖으로 넘친다. 원인과 해결 방법은?
5. iOS에서는 그림자가 보이는데 Android에서는 안 보인다. 이유와 한 파일 안에서 해결하는 방법은?

<details><summary>정답</summary>

1. Expo Go는 Expo가 미리 만든 앱 안에 JS 번들만 올려 실행하고, development build는 `expo-dev-client`를 넣어 우리 프로젝트를 직접 컴파일한 앱이라 SDK 밖의 네이티브 라이브러리와 네이티브 설정을 쓸 수 있다. 시뮬레이터는 `npx expo start`에서 `i`를 누르면 Expo CLI가 Expo Go를 자동으로 설치해 주기 때문에 프로젝트 SDK에 맞는 Expo Go가 준비된다(실기기의 App Store판은 최신 SDK만 열기 때문에 SDK 54는 시뮬레이터를 쓴다).
2. `app`, `components`, `hooks`, `constants`, `scripts`를 지우거나(`n`) `app-example/`로 옮기고(`y`) 새 `app/index.tsx`와 `app/_layout.tsx`를 만든다. `n`을 고르면 Day 1 커밋으로 복구할 수 있고 `app-example`이 `tsconfig.json`의 `include` 때문에 타입 검사에 섞이는 일을 피한다.
3. 문자열(`오늘의 기록`)이 `Text` 없이 `View` 바로 아래에 있다. RN에서는 모든 텍스트 노드가 `<Text>` 안에 있어야 한다. `<Text>오늘의 기록</Text>`로 감싸면 된다.
4. `flexShrink` 기본값이 `0`(웹은 `1`)이고 텍스트 영역에 폭 제한이 없어서다. 텍스트를 감싼 `View`에 `flex: 1`을 주면 남는 폭만 차지하고 글이 줄바꿈된다.
5. `shadowOffset`·`shadowOpacity`·`shadowRadius`는 iOS에서만 동작하고 Android는 `elevation`을 쓴다. `Platform.select({ ios: {...}, android: { elevation: n } })`를 스타일에 펼치거나 `Platform.OS`로 분기한다.

</details>

## 구술 1주제(15분)

주제: React Native의 `View`·`Text`가 웹의 `div`·`p`와 어떻게 다르고, 그 차이가 레이아웃에 어떤 영향을 주는지. 소리 내어 3분 동안 설명하고, 막힌 지점을 아래에 적는다.

포함할 핵심어: 네이티브 뷰, `Text` 안의 문자열, `flexDirection` 기본값 `column`, `flex: 1`, `StyleSheet.create`

> 막힌 지점:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 항목을 연다. 항목마다 다음 중 하나로 처리한다.

- [ ] 오늘 답을 찾았다 → 질문 옆에 답을 한 줄 적고 지운다
- [ ] 아직 모르겠다 → 에러 원문과 시도한 것을 보강해 다음 주 금요일(Day 9)로 넘긴다
- [ ] 질문이 틀렸다(오타·환경 문제였다) → 원인을 적고 지운다

## 밀린 Day 흡수

달력이 아니라 Day 번호 기준이다. 밀린 Day가 있으면 남는 시간에 한다. 하루에 Day 둘을 하지 않는다는 규칙은 지킨다.

- [ ] Day 1 만들기(앱 생성, 이름 변경, 시뮬레이터 실행)
- [ ] Day 2 만들기(reset-project, 기록 목록 정적 화면)
- [ ] Day 3 만들기(StyleSheet, Flexbox, 플랫폼별 그림자)
- [ ] 퀴즈에서 틀린 문항의 해당 Day 검증 실험을 다시 해 본다

## 기록(5분)

배운 것 3줄:

막힌 점:

다음 주(Day 5~8) 준비: `app/index.tsx`가 Day 3 상태로 커밋돼 있는지 `git status`로 확인한다.
