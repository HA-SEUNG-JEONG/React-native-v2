# Day 14 · 11/13 (금) — 버퍼 + 3주차 점검

## 오늘의 목표

3주차(Day 10~13) 내용을 정답을 가리고 풀어 보고, 밀린 Day를 흡수하며, 가장 헷갈린 개념 하나를 소리 내어 설명한다.

## 주간 점검 퀴즈(30분)

정답을 가리고 먼저 답을 적는다. 결과는 `docs/quiz/2026-11-13-day-14.md`에 `AGENTS.md`의 상세 구조(문항별 상세, 종합 약점 패턴, 재복습 일정)로 기록한다.

1. (Day 10) 아래 코드에서 `entries`의 타입은 무엇이고, 마지막 줄은 왜 문제인가? 고치는 방법은?

```tsx
const [entries, setEntries] = useState([]);
setEntries([...entries, { id: '1', title: '첫 글', body: '', createdAt: 0 }]);
```

> 내 답:

2. (Day 10) `TextInput`의 `onChangeText`와 `onSubmitEditing`에 넘기는 핸들러의 인자는 각각 무엇인가?

> 내 답:

3. (Day 11) `Card` 컴포넌트가 `<Card><Text>안녕</Text></Card>`로 쓰이려면 props 타입과 본문에서 무엇이 필요한가? 그리고 `style` prop을 `[styles.card, style]`로 합치는 순서의 이유는?

> 내 답:

4. (Day 12) `src/components/Card.tsx`를 `@/components/Card`로 import하려면 어디를 고치는가? `app/` 폴더 안에 `Card.tsx`를 두면 왜 안 되는가?

> 내 답:

5. (Day 13) `useEffect` 안에서 `setInterval`을 쓰고 cleanup을 빼면 어떤 일이 생기는가? 같은 커스텀 훅을 두 컴포넌트에서 호출하면 상태는 공유되는가?

> 내 답:

<details>
<summary>정답</summary>

1. `useState([])`는 빈 배열 리터럴에서 요소 타입을 알 수 없어 `never[]`로 추론된다. 그래서 객체를 넣는 마지막 줄은 `never`에 할당할 수 없다는 타입 오류가 난다. `useState<LogEntry[]>([])`처럼 제네릭으로 요소 타입을 알려 준다.
2. `onChangeText`는 변경된 텍스트를 문자열 하나로 받는다. `onSubmitEditing`은 `{ nativeEvent: { text, eventCount, target } }` 모양의 이벤트 객체를 받으므로 `e.nativeEvent.text`로 값을 읽는다. 인자가 달라서 핸들러 타입도 다르다.
3. props 타입에 `children`을 포함해야 하고 `PropsWithChildren<...>`가 이를 더해 준다. 본문에서는 `{children}`을 렌더한다. `style`은 뒤의 값이 앞의 같은 속성을 덮어쓰므로 기본 스타일을 앞에, 부모가 넘긴 `style`을 뒤에 둬야 부모가 필요한 부분만 바꿀 수 있다.
4. `tsconfig.json`의 `paths`에 `"@/*": ["src/*"]`를 쓴다. Expo CLI가 이 설정을 자동으로 읽어 Metro에서도 동작한다. `app/` 안의 파일은 기본 export가 곧 라우트가 되고 파일 경로가 URL이 되므로, 컴포넌트를 두면 화면이 아닌 파일이 라우트로 취급된다.
5. 컴포넌트가 사라져도 타이머가 계속 돌고, 다시 마운트될 때마다 타이머가 하나씩 쌓인다. cleanup(`clearInterval`)은 언마운트 때와 의존성이 바뀌어 Effect가 다시 실행되기 직전에 호출된다. 커스텀 훅은 로직만 공유하고 상태는 호출마다 독립적이므로, 두 컴포넌트가 훅을 따로 호출하면 상태를 공유하지 않는다.

</details>

## 구술 1주제(15분)

주제: "Effect를 쓰면 왜 cleanup을 신경 써야 하는가"를 Daily Log의 `useNow`와 `useKeyboardVisible`을 예로 1분 안에 소리 내어 설명한다.

설명에 포함할 핵심어: 구독, 해제(cleanup), 언마운트, 의존성 배열, 상태 비공유(커스텀 훅)

- [ ] 핵심어 5개를 모두 썼다
- [ ] 막힌 부분을 아래에 적었다

막힌 부분:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문을 위에서부터 처리한다. 해결한 질문은 해결 방법 한 줄을 적고, 그래도 안 풀린 질문은 에러 원문과 시도한 것을 남겨 다음 주 금요일로 넘긴다.

- [ ] 해결한 질문 수:
- [ ] 다음 주로 넘긴 질문 수:

## 밀린 Day 흡수

- [ ] Day 10 (TypeScript props와 이벤트 타입) 완료 기준을 모두 채웠다
- [ ] Day 11 (children, composition) 완료 기준을 모두 채웠다
- [ ] Day 12 (폴더 구조, path alias, lint·prettier) 완료 기준을 모두 채웠다
- [ ] Day 13 (커스텀 훅, useEffect cleanup) 완료 기준을 모두 채웠다
- [ ] `npm run typecheck`와 `npx expo lint`가 오류 0개다
- [ ] 이번 주 커밋이 모두 `<type>: <한국어 요약>` 형식이다

## 기록(5분)

이번 주 배운 것 3줄:

가장 헷갈렸던 개념:

다음 주(Day 15 expo-router) 전에 확인할 것:
