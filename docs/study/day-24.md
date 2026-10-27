# Day 24 · 11/27 (금) — 버퍼 + 5주차 점검

## 오늘의 목표

5주차(Day 20~23: router API, Context, reducer, 보호된 라우트) 내용을 정답을 가리고 풀어 보고, 밀린 Day와 질문 목록을 정리한다.

## 주간 점검 퀴즈(30분)

정답은 접힌 상태에서 먼저 자기 답을 적은 뒤 연다. 결과는 `docs/quiz/2026-11-27-day-24.md`에 `AGENTS.md`의 상세 구조(문항별 내 답 → 문제점 → 정답 → 암기 고리 → 근거 절, 종합 약점 패턴, 재복습 일정)로 기록한다.

**Q1 (Day 20).** 피드 → 글 1 → `router.push('/post/2')` → `router.push('/post/3')` 순서로 이동했다. 마지막 화면에서 `router.replace('/post/4')`를 하면 스택은 어떻게 되고, 피드로 돌아가려면 back이 몇 번 필요한가?
> 내 답:

<details><summary>정답</summary>

`push` 두 번으로 스택은 [피드, 글1, 글2, 글3]이고, `replace('/post/4')`는 맨 위(글3)를 글4로 바꿔서 [피드, 글1, 글2, 글4]가 된다. 피드까지 back이 3번 필요하다. `replace`는 history를 추가하지 않는다.

</details>

**Q2 (Day 20).** 탭 화면에서 "탭이 보일 때마다" 데이터를 새로고침하려고 한다. `useEffect(() => {...}, [])` 대신 무엇을 쓰고, 그 콜백에 꼭 필요한 처리는 무엇인가?

> 내 답:

<details><summary>정답</summary>

`expo-router`의 `useFocusEffect`를 쓴다. 탭 화면은 탭을 옮겨도 언마운트되지 않아 `useEffect(..., [])`는 처음 한 번만 실행되기 때문이다. 콜백은 `React.useCallback`으로 감싸 안정시켜야 한다(감싸지 않으면 매 렌더마다 effect가 다시 실행될 수 있다). cleanup은 포커스를 잃을 때 실행된다.

</details>

**Q3 (Day 21).** `useProfile()`을 Provider 밖에서 불렀을 때 `throw new Error`로 막는 이유와, Context `value`가 바뀔 때 다시 렌더되는 컴포넌트를 설명하라.

> 내 답:

<details><summary>정답</summary>

`createContext(null)` 기본값을 그대로 돌려주면 `nickname`을 읽는 순간 원인과 멀리 떨어진 곳에서 TypeError가 난다. `throw`하면 "Provider를 감싸지 않았다"는 원인을 바로 알려 주고, 반환 타입에서 `null`을 제거할 수 있다. `value`가 바뀌면 그 context를 `useContext`로 읽는 컴포넌트만 다시 렌더된다.

</details>

**Q4 (Day 22).** reducer가 `state.push(action.log); return state;`를 하면 어떤 문제가 생기는가? 이유를 `Object.is`와 Strict Mode 두 가지로 설명하라.

> 내 답:

<details><summary>정답</summary>

React는 이전 state와 다음 state를 `Object.is`로 비교하는데, 같은 배열을 변경해 반환하면 참조가 같아 업데이트가 무시되어 화면이 안 바뀐다. 또 개발 환경 Strict Mode는 reducer를 두 번 호출하므로, 직접 변경하는 reducer는 항목이 두 번 들어간다. 해결은 `[...state, action.log]`처럼 새 배열을 반환하는 것이다.

</details>

**Q5 (Day 23).** 로그인 성공 후 `router.replace`를 호출하지 않아도 탭 화면으로 넘어가는 이유와, 로그아웃 후 뒤로가기로 이전 화면에 못 돌아가는 이유를 한 문장씩 설명하라.

> 내 답:

<details><summary>정답</summary>

토큰이 바뀌면 `RootNavigator`의 `Stack.Protected guard` 값이 바뀌고, 라우터가 가드가 `false`가 된 화면을 제거하고 `true`가 된 화면을 열면서 anchor 또는 첫 사용 가능 화면으로 보내기 때문이다. 가드가 `true`에서 `false`로 바뀌면 그 화면들의 history 항목이 모두 제거되므로 뒤로가기로 돌아갈 화면이 없다.

</details>

## 구술 1주제(15분)

주제: "앱을 켠 순간부터 로그인해서 탭 화면이 보이기까지, 상태와 라우터가 어떻게 연결되는지 소리 내어 설명한다."

포함할 핵심어: `AuthProvider`, `token`, `Stack.Protected`, `guard`, history 제거

설명 후 빠뜨린 핵심어를 적는다:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문을 위에서부터 처리한다. 에러 원문과 시도한 것을 다시 읽고, 공식 문서에서 해당 절을 찾아 답을 적는다. 답을 못 찾은 질문은 다음 주 금요일로 넘기고 표시한다.

- [ ] 이번 주 질문 전부 읽었다
- [ ] 해결한 질문에 답과 근거 문서 링크를 적었다
- [ ] 못 푼 질문 개수:

## 밀린 Day 흡수

달력이 아니라 Day 번호 기준이다. 1~2일 밀렸으면 여기서 하나만 한다(한 번에 Day 둘 금지).

- [ ] Day 20 router API·중첩 라우트·not-found·`useFocusEffect`
- [ ] Day 21 Context
- [ ] Day 22 reducer + Context
- [ ] Day 23 인증 흐름과 보호된 라우트
- [ ] 이전 주에서 밀린 Day:

## 기록(5분)

이번 주 가장 헷갈린 개념:

틀린 퀴즈와 이유:

다음 주(6주차 데이터 1) 전에 고칠 것:
