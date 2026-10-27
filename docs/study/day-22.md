# Day 22 · 11/25 (수) — useReducer + Context 상태 관리

## 오늘의 목표

내 기록 목록을 `useReducer` reducer와 Context(state용, dispatch용 둘)로 관리해서, 기록 탭에서 쓴 글이 피드 탭 헤더의 "내 기록 N개"에 바로 반영되게 한다.

## 읽기(15분)

1. https://react.dev/learn/scaling-up-with-reducer-and-context — reducer와 Context를 합치는 방법.
   - 확인할 사실: state용 context와 dispatch용 context를 따로 만든다. `TasksProvider`가 `useReducer`를 소유하고 두 context로 감싼다. `useTasks()`, `useTasksDispatch()` 같은 커스텀 훅으로 `useContext`를 감싼다.
   - 확인할 사실: 문서가 둘로 나누는 이유 — dispatch만 쓰는 컴포넌트는 목록이 바뀌어도 다시 렌더될 필요가 없다.
2. https://react.dev/reference/react/useReducer — reducer 규칙.
   - 확인할 사실: reducer는 순수 함수여야 한다. Strict Mode(개발 환경)에서는 reducer를 두 번 호출한다.
   - 확인할 사실: state를 직접 바꾸고 같은 객체를 반환하면 `Object.is` 비교가 같아서 React가 업데이트를 무시한다.
   - 확인할 사실: `dispatch`는 identity가 안정적이다.

## 예측(10분)

1. reducer의 `added` case를 `state.push(action.log); return state;`로 쓰면 저장 버튼을 눌렀을 때 목록이 갱신되는가? 갱신된다면(또는 안 된다면) 왜인가?
   > 내 예측:
2. 저장 핸들러 안에서 `dispatch({ type: 'added', ... })`를 같은 내용으로 연달아 두 번 호출하고 id를 `Date.now().toString()`으로 만들면 목록과 콘솔에 무엇이 보이는가?
   > 내 예측:
3. 입력창과 저장 버튼만 있는 컴포넌트가 `useLogsDispatch()`만 쓰고 `useLogs()`는 쓰지 않는다. 글이 추가될 때 이 컴포넌트가 다시 렌더되는가?
   > 내 예측:

## 만들기(40분)

기록 탭에서 글을 쓰고, 목록에서 삭제·고정할 수 있게 한다. 피드 탭 헤더에는 "내 기록 N개"를 보여 준다. 피드의 글 목록은 Day 25에서 공개 API로 바꾸므로 오늘은 건드리지 않는다.

**새 파일**
- `src/state/logsReducer.ts`: 순수 함수 `logsReducer(state: LogEntry[], action: LogsAction): LogEntry[]`. 액션은 `{ type: 'added'; log: LogEntry }`, `{ type: 'removed'; id: string }`, `{ type: 'pinToggled'; id: string }` 세 가지(discriminated union). 새 배열을 반환하고 `state`를 바꾸지 않는다. 새 `LogEntry`의 id는 reducer 안이 아니라 저장 핸들러에서 만들어 action에 담아 보낸다.
- `src/contexts/LogsContext.tsx`: `LogsContext`와 `LogsDispatchContext` 두 개, `LogsProvider`(내부에서 `useReducer(logsReducer, [])`), 훅 `useLogs()`, `useLogsDispatch()`(Day 21의 `useProfile`처럼 Provider 밖이면 throw).

```ts
type LogsAction =
  | { type: 'added'; log: LogEntry }
  | { type: 'removed'; id: string }
  | { type: 'pinToggled'; id: string };
```

**고칠 파일**
- `src/types/log.ts`: Day 10의 `LogEntry`(`id: string`, `title`, `body`, `createdAt: number`)에 `pinned: boolean`을 추가한다. 새 타입을 만들지 않고 `text` 필드도 쓰지 않는다.
- `app/_layout.tsx`의 `RootLayout`: `LogsProvider`를 `ProfileProvider`와 같은 높이에 둔다.
- 기록 탭 `app/(tabs)/write.tsx`: Day 5·6의 `TextInput`과 저장 버튼에 `dispatch({ type: 'added', ... })`를 연결하고, 저장 후 입력을 비운다. 그 아래에 Day 10의 기록 `FlatList`와 `LogItem`으로 내 기록 목록을 그린다. 각 행의 "고정"(`pinToggled`)과 "삭제"(`removed`) 버튼은 `LogItem`의 콜백 props로 받는다. 고정된 글이 위로 오게 정렬한다(정렬은 reducer가 아니라 렌더 쪽에서 해도 된다).
- 피드 탭 `app/(tabs)/index.tsx`: 헤더(Day 21의 인사 문구 옆)에 `내 기록 {logs.length}개`.

완료 기준
- [ ] reducer가 `state`를 변경하지 않고 매번 새 배열을 반환한다(`push`, `splice`, `sort`를 state에 직접 쓰지 않는다).
- [ ] 기록 탭에서 저장하면 피드 탭 헤더의 개수가 바로 늘고, 삭제하면 줄어든다.
- [ ] 고정 토글이 동작하고 고정된 글이 목록 맨 위에 보인다.
- [ ] 컴포넌트는 `useReducer`를 직접 부르지 않고 `useLogs()`/`useLogsDispatch()`만 쓴다.
- [ ] 같은 내용을 빠르게 두 번 저장해도 key 경고가 없다(경고가 나면 id 생성 방식을 고친다).

## 검증(10분)

- 기록 탭에서 글 3개를 저장 → 하나 고정 → 하나 삭제하고, 피드 탭의 개수가 매번 맞는지 확인한다.
- 예측 1·2·3의 실제 결과를 적는다. 3번은 입력 컴포넌트 맨 위에 `console.log('입력 render')`를 달아 센다(확인 후 삭제).
- 일부러 깨뜨리기: `added` case를 `state.push(action.log); return state;`로 바꾸고 저장해 본다. 목록이 갱신되는지, 개발 환경에서 항목이 두 번 들어가는지 확인한 뒤 원복한다.

## 이해 점검 질문

1. reducer에서 `state.push(...)`로 바꾸고 `return state`하면 왜 화면이 안 바뀌거나 항목이 중복되는가?
2. 왜 state context와 dispatch context를 나누는가? 합쳐서 `{ logs, dispatch }` 하나로 내려주면 어떤 차이가 생기는가?
3. 새 글의 id를 reducer 안에서 `Date.now()`로 만들면 안 되는 이유는 무엇인가?

<details><summary>정답</summary>

1. React는 이전 state와 다음 state를 `Object.is`로 비교하고, 같으면 업데이트를 무시한다. 같은 배열을 변경해서 반환하면 참조가 같으므로 화면이 안 바뀐다. 또 Strict Mode(개발)는 reducer를 두 번 호출하므로, 직접 변경하는 reducer는 항목이 두 번 들어가는 식으로 실수가 드러난다. 해결은 `[...state, action.log]`처럼 새 배열을 만드는 것이다.
2. dispatch는 identity가 안정적이라 바뀌지 않는다. dispatch만 필요한 컴포넌트(입력창)가 state context까지 구독하면 목록이 바뀔 때마다 불필요하게 다시 렌더된다. 합쳐서 하나의 객체로 내리면 `value`가 렌더마다 새 객체가 되어 dispatch만 쓰는 소비자도 같이 렌더된다. 나누면 dispatch 소비자는 state 변화에 영향받지 않는다.
3. reducer는 순수해야 하는데 `Date.now()`는 호출할 때마다 값이 달라지는 부수 효과다. Strict Mode에서 reducer가 두 번 불리면 결과가 달라질 수 있다. id는 이벤트 핸들러(저장 버튼)에서 만들어 action에 담아야 한다. 같은 밀리초에 두 번 저장하면 `Date.now()` id가 겹치므로 id 생성 방식(카운터 등)도 함께 고려한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 기록 reducer와 LogsContext 추가`
- `feat: 기록 탭에 저장·삭제·고정 연결`
- `feat: 피드 헤더에 내 기록 개수 표시`
