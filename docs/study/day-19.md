# Day 19 · 11/20 (금) — 버퍼 + 4주차 점검

## 오늘의 목표

4주차(Day 15~18) 내용을 정답을 가리고 풀어 보고, Daily Log의 라우트 트리를 직접 그려 설명하며, 밀린 Day를 흡수한다.

## 주간 점검 퀴즈(30분)

정답을 가리고 먼저 답을 적는다. 결과는 `docs/quiz/2026-11-20-day-19.md`에 `AGENTS.md`의 상세 구조(문항별 상세, 종합 약점 패턴, 재복습 일정)로 기록한다.

1. (Day 15) `app/profile/index.tsx`, `app/(auth)/login.tsx`, `app/post/[id].tsx`의 URL을 각각 쓰고, `app/` 안에 컴포넌트 파일을 두면 안 되는 이유를 말하라.

> 내 답:

2. (Day 16) `/post/3`으로 이동한 화면에서 `id`를 읽는 코드를 쓰고, `MOCK_POSTS.find((p) => p.id === id)`가 글을 못 찾는 이유와 고치는 방법을 말하라.

> 내 답:

3. (Day 17) `(tabs)/_layout.tsx`와 루트 `_layout.tsx`가 각각 무엇을 렌더하고, 루트에서 `(tabs)`에 `headerShown: false`를 주는 이유는 무엇인가?

> 내 답:

4. (Day 17) 헤더를 끈 화면에서 상태바·노치와 겹치지 않게 하려면 무엇을 어디서 import해서 쓰는가? RN의 `SafeAreaView`를 쓰지 않는 이유는 무엇인가?

> 내 답:

5. (Day 18) 모달 라우트를 만드는 두 가지(파일, 설정)를 말하라. 그리고 Expo Go에서 `dailylog://post/3`이 열리지 않는 이유와 대신 쓸 주소 형태는 무엇인가?

> 내 답:

<details>
<summary>정답</summary>

1. `/profile`, `/login`, `/post/<id 값>`이다. `index`는 폴더 기본 화면이라 URL에 안 붙고, 괄호 그룹 `(auth)`는 URL에 포함되지 않으며, `[id]`는 동적 세그먼트다. `app/` 안의 파일은 기본 export가 곧 화면이 되고 경로가 URL이 되므로, 컴포넌트를 두면 화면이 아닌 파일이 라우트로 취급된다.
2. `const { id } = useLocalSearchParams<{ id: string }>();`로 읽는다. 라우트 파라미터는 URL에서 오므로 항상 문자열이라 숫자 `id`와 `===` 비교가 거짓이 된다. `Number(id)`로 바꿔 비교한다. `tsc`가 이 비교의 타입 불일치를 지적해 준다.
3. 루트 `_layout.tsx`는 `Stack`을 렌더해 `(tabs)`와 `post/[id]`, `about`을 쌓는다. `(tabs)/_layout.tsx`는 `Tabs`를 렌더해 피드·기록·설정 탭을 만든다. 탭 화면이 자기 헤더를 가지므로 바깥 Stack 헤더까지 보이면 헤더가 두 겹이 되어, 루트에서 `(tabs)`의 헤더를 숨긴다.
4. `react-native-safe-area-context`의 `SafeAreaView`(필요한 가장자리만 `edges`로 지정) 또는 `useSafeAreaInsets()`를 쓴다. RN 0.81에서 `react-native`의 `SafeAreaView`는 deprecated이고 문서가 이 라이브러리를 쓰라고 안내한다.
5. 모달 라우트는 `app/` 아래 일반 라우트 파일을 만들고, 루트 `_layout.tsx`의 `Stack.Screen`에 `presentation: 'modal'` 옵션을 주면 된다. `scheme`은 빌드 시점 설정이라 Expo Go에서는 효과가 없고 Expo Go는 `exp://` 스킴을 쓴다. 따라서 `exp://<Metro 주소>/--/post/3` 형태로 연다.

</details>

## 구술 1주제(15분)

주제: Daily Log의 라우트 트리(루트 Stack, `(tabs)` 3탭, 상세, 모달)를 종이에 그리고, 피드에서 글을 눌러 상세로 가는 흐름을 1분 안에 소리 내어 설명한다.

설명에 포함할 핵심어: 파일 기반 라우팅, `_layout`, `(tabs)` 그룹, 동적 라우트 `[id]`와 `useLocalSearchParams`, `presentation: 'modal'`

- [ ] 핵심어 5개를 모두 썼다
- [ ] 라우트 트리 그림을 기록 절에 사진이나 텍스트로 남겼다

막힌 부분:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문을 위에서부터 처리한다. 해결한 질문은 해결 방법 한 줄을 적고, 그래도 안 풀린 질문은 에러 원문과 시도한 것을 남겨 다음 주 금요일로 넘긴다.

- [ ] 해결한 질문 수:
- [ ] 다음 주로 넘긴 질문 수:

## 밀린 Day 흡수

- [ ] Day 15 (expo-router 파일 기반 라우팅) 완료 기준을 모두 채웠다
- [ ] Day 16 (Stack, 동적 라우트) 완료 기준을 모두 채웠다
- [ ] Day 17 (Tabs, SafeArea) 완료 기준을 모두 채웠다
- [ ] Day 18 (Modal, 헤더, 딥링크) 완료 기준을 모두 채웠다
- [ ] `npm run typecheck`와 `npx expo lint`가 오류 0개다
- [ ] 이번 주 커밋이 모두 `<type>: <한국어 요약>` 형식이다
- [ ] 다음 주 Day 20 전에, 기록 화면에서 쓴 글이 피드·상세에 나타나지 않는 문제를 한 줄로 적어 두었다(Day 21에서 해결한다)

## 기록(5분)

이번 주 배운 것 3줄:

가장 헷갈렸던 개념:

라우트 트리 그림:
