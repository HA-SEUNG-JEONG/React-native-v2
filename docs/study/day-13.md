# Day 13 · 11/12 (목) — 커스텀 훅과 useEffect 기초, cleanup

## 오늘의 목표

`useEffect`로 타이머와 키보드 이벤트를 구독하고 cleanup으로 해제하는 커스텀 훅 `useNow`, `useKeyboardVisible`을 만들어 Daily Log에 붙인다.

## 읽기(15분)

1. React 공식 문서, Effect 동기화: https://react.dev/learn/synchronizing-with-effects
   - 확인할 사실: Effect가 시작한 일을 되돌려야 하면 함수를 반환한다. 그 cleanup은 Effect가 다시 실행되기 직전과 컴포넌트가 사라질 때 호출된다. 의존성 배열이 `[]`이면 마운트 때 한 번, `[a, b]`이면 값이 바뀔 때마다 다시 실행된다. cleanup이 필요 없는 Effect도 있다.
2. React 공식 문서, 커스텀 훅: https://react.dev/learn/reusing-logic-with-custom-hooks
   - 확인할 사실: 훅 이름은 `use`로 시작해야 한다. 커스텀 훅은 상태 로직을 공유하지만 상태 자체를 공유하지 않는다. 같은 훅을 두 번 호출하면 서로 독립된 상태가 생긴다.
3. `Keyboard` 문서: https://reactnative.dev/docs/0.81/keyboard
   - 확인할 사실: `Keyboard.addListener(eventName, callback)`은 구독 객체를 돌려주고, 문서 예제는 정리할 때 `.remove()`를 호출한다. Android에서는 `keyboardDidShow`, `keyboardDidHide`만 쓸 수 있다. `keyboardWillShow`류는 iOS 전용이다.

## 예측(10분)

1. `setInterval`을 시작하는 Effect에 cleanup을 쓰지 않고, 그 컴포넌트를 화면에서 사라지게(언마운트) 하면 타이머는 멈추는가?

> 내 예측:

2. 서로 다른 두 컴포넌트가 각각 `useNow(1000)`을 호출하면 두 컴포넌트가 받는 `now` 값은 같은 상태를 공유하는가, 각자 따로인가?

> 내 예측:

3. Effect의 의존성 배열에 `intervalMs`를 빼고 `[]`로 두었는데 코드 안에서 `intervalMs`를 쓰고 있다면 `npx expo lint`가 어떤 반응을 보이는가?

> 내 예측:

## 만들기(40분)

Day 12에서 정리한 `src/` 구조에 훅 폴더를 만들고, 글 목록에 "방금 전 / N분 전" 표시를 얹는다.

새로 만들 파일:
- `src/hooks/useNow.ts` — `useNow(intervalMs: number): number`. 현재 시각(`Date.now()`)을 상태로 들고, `setInterval`로 `intervalMs`마다 갱신하고, cleanup에서 `clearInterval`한다.
- `src/hooks/useKeyboardVisible.ts` — `useKeyboardVisible(): boolean`. `keyboardDidShow`와 `keyboardDidHide`를 구독하고 cleanup에서 두 구독을 모두 `remove()`한다. Day 6에서 화면에 직접 쓴 `Keyboard` 코드가 있으면 이 훅으로 옮긴다.
- `src/utils/formatRelative.ts` — `formatRelative(createdAt: number, now: number): string`. 1분 미만이면 `방금 전`, 이후는 `N분 전`, 60분 이상은 `N시간 전`. 순수 함수다.

핵심 형태:

```tsx
useEffect(() => {
  const id = setInterval(() => setNow(Date.now()), intervalMs);
  return () => clearInterval(id);
}, [intervalMs]);
```

고칠 파일:
- `app/index.tsx` — 화면에서 `useNow(10_000)`을 한 번만 호출하고 `now`를 `LogItem`에 props로 내려 준다. `FlatList`에는 `extraData={now}`를 준다. 입력창이 있는 영역에는 `useKeyboardVisible()`이 `true`일 때만 "키보드 닫기" `AppButton`을 보여 주고, 누르면 `Keyboard.dismiss()`를 호출한다.
- `src/components/LogItem.tsx` — props에 `now: number`를 추가하고 작성 시각 줄에 `formatRelative(entry.createdAt, now)`를 쓴다.

항목마다 `useNow`를 따로 호출하면 항목 수만큼 타이머가 생긴다. 그래서 화면에서 한 번만 호출해 내려 준다(점검 질문 2번).

완료 기준:
- [ ] `useNow`와 `useKeyboardVisible`이 `src/hooks/`에 있고 이름이 `use`로 시작한다
- [ ] 두 훅의 Effect가 모두 cleanup을 반환한다
- [ ] 글 항목에 "방금 전"이 보이고, 시간이 지나면 "1분 전"으로 바뀐다(테스트용으로 `createdAt`을 5분 전 값으로 만들어 확인해도 된다)
- [ ] 입력창을 누르면 "키보드 닫기" 버튼이 나타나고, 누르면 키보드와 버튼이 같이 사라진다
- [ ] `npm run typecheck`와 `npx expo lint`가 오류 0개다(의존성 배열 경고 포함)

## 검증(10분)

- 시뮬레이터에서 글을 추가하고 "방금 전"이 바뀌는 것을 본다. 키보드를 올렸다 내리며 버튼이 따라오는지 본다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- 일부러 깨뜨려 보기: 화면에 `visible` 상태로 토글되는 임시 컴포넌트를 만들어, 그 안에서 `useNow` 대신 Effect에 `console.log('tick')`을 찍는 `setInterval`을 쓰되 cleanup을 뺀다. 컴포넌트를 껐다 켜며 로그가 어떻게 되는지 보고, cleanup을 넣은 뒤 다시 비교한다. 확인이 끝나면 임시 컴포넌트를 지운다.

## 이해 점검 질문

1. cleanup 없이 `setInterval`을 쓴 컴포넌트가 사라지면 어떤 문제가 생기고, cleanup은 언제 호출되는가?
2. 같은 커스텀 훅 `useNow`를 두 컴포넌트에서 각각 호출하면 상태를 공유하는가? 이 때문에 `useNow`를 화면에서 한 번만 호출해 내려 주는가?
3. `useKeyboardVisible`에서 `keyboardWillShow` 대신 `keyboardDidShow`를 쓰는 이유는 무엇인가?

<details>
<summary>정답</summary>

1. 컴포넌트가 사라져도 타이머는 JS 런타임에 남아 계속 실행되며 낭비와 중복 실행을 낳는다. 다시 마운트될 때마다 타이머가 하나씩 더 쌓인다. cleanup은 의존성이 바뀌어 Effect가 다시 실행되기 직전과 컴포넌트가 언마운트될 때 호출된다.
2. 공유하지 않는다. 커스텀 훅은 로직만 공유하고 상태는 호출마다 독립적이다. 그래서 항목마다 호출하면 항목 수만큼 상태와 타이머가 생긴다. 화면에서 한 번 호출해 `props`로 내려 주면 타이머가 하나이고 모든 항목이 같은 `now`를 본다.
3. `keyboardWillShow`는 iOS에서만 발생하고 Android에서는 `keyboardDidShow`와 `keyboardDidHide`만 발생한다. 양쪽 플랫폼에서 같은 훅이 동작하려면 공통으로 지원되는 Did 이벤트를 써야 한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: useNow 훅과 상대 시간 표시 추가`
- `feat: useKeyboardVisible 훅과 키보드 닫기 버튼 추가`

## 웹과 다른 점

브라우저처럼 `window.addEventListener('resize')`에 쓰는 DOM 이벤트가 없다. RN은 `Keyboard`, `AppState` 같은 모듈에 `addListener`로 구독하고, 반환된 구독 객체의 `remove()`로 해제한다.
