# Day 5 · 11/2 (월) — useState, 이벤트, TextInput

## 오늘의 목표

기록 화면에 제목·본문 `TextInput`과 저장 버튼을 추가하고, `useState`로 입력값과 기록 목록을 관리해 새 기록이 목록 맨 위에 쌓이게 한다.

## 읽기(15분)

1. [https://react.dev/learn/state-a-components-memory](https://react.dev/learn/state-a-components-memory)
   - 확인할 사실: 지역 변수는 렌더 사이에 유지되지 않고, 바꿔도 렌더를 일으키지 않는다. `useState`는 값을 유지하는 state 변수와 렌더를 일으키는 setter, 두 가지를 준다.
2. [https://reactnative.dev/docs/handling-text-input](https://reactnative.dev/docs/handling-text-input)
   - 확인할 사실: `TextInput`의 `onChangeText`는 글자가 바뀔 때마다 호출되고 새 문자열을 인자로 받는다. `onSubmitEditing`은 제출 동작 때 호출된다. 입력값은 시간에 따라 바뀌므로 state에 둔다.
3. [https://reactnative.dev/docs/textinput](https://reactnative.dev/docs/textinput)
   - 확인할 사실: `value`를 주면 입력창이 그 값에 맞춰진 제어 컴포넌트가 된다. `defaultValue`는 초기값만 준다. `multiline`의 기본값은 `false`이고, Android에서 여러 줄 텍스트는 기본이 가운데 정렬이라 `textAlignVertical="top"`이 필요하다. `maxLength`는 글자 수 제한이다.

## 예측(10분)

1. 저장 버튼의 `onPress`에서 `setEntries([newEntry, ...entries])` 바로 다음 줄에 `console.log(entries.length)`를 찍으면, 목록이 3개였을 때 몇이 찍힐까?
   > 내 예측: 3, setEntries 호출 다음에 바로 entries의 length를 측정하려고 하면 entries가 바로 반영이 되지 않기 때문에 3이 된다.
2. 저장 버튼에서 `entries.push(newEntry); setEntries(entries);`라고 쓰면 화면에 새 기록이 나타날까?
   > 내 예측: 동기화가 되지 않기 때문에 나타나지 않는다.  
   > 이유는 부정확함. 정답은 push가 같은 배열 객체를 수정하고 setter에 같은 참조가 들어가서 === 비교로 변경 없음으로 보고 렌더를 건너뜀
3. `TextInput`에 `onChangeText`만 달고 `value`는 주지 않았다. 저장 후 `setTitle('')`을 호출하면 입력창의 글자가 지워질까?
   > 내 예측: 지워지지 않는다.
   >
   >  value가 없으면 비제어 입력이라 글자를 네이티브 입력창이 쥐고 있습니다. setTitle('')은 state만 비우고 입력창은 그대로

## 만들기(40분)

Day 2~3에서 만든 `app/index.tsx`(ScrollView 위에 목록이 있는 기록 화면)에 입력 폼을 얹는다. 폼은 목록 위쪽에 둔다.

1. 파일 상단에 타입을 한 줄 선언한다. TypeScript는 Day 10에서 정식으로 배우고, 오늘은 에디터가 요구하는 만큼만 쓴다.
   ```tsx
     type Entry = { id: string; title: string; body: string };
   ```
2. 화면 컴포넌트 안에 state 세 개를 둔다: `title`, `body`, `entries`. `entries`의 초기값은 Day 2의 하드코딩 `ENTRIES`다. 목록은 `entries`를 `map`한다.
3. 제목 `TextInput`(한 줄)과 본문 `TextInput`(`multiline`, `textAlignVertical="top"`, `maxLength={200}`)을 `value`와 `onChangeText`로 state에 연결한다. 본문 아래에 `{body.length}/200`을 `Text`로 보여 준다.
4. 저장 `Pressable`을 만든다. `onPress`에서 `id`를 `String(Date.now())`로 정한 새 기록을 `entries` 맨 앞에 넣고 `title`, `body`를 비운다. 제목이 빈 문자열(공백만 있는 경우 포함)이면 `disabled`로 하고 `style`로 흐리게 보이게 한다.
5. 새 기록 추가는 새 배열을 만든다. 배열 갱신 방법은 [https://react.dev/learn/updating-arrays-in-state](https://react.dev/learn/updating-arrays-in-state) 의 표(spread, filter, map)를 참고한다.

완료 기준:

- [x] 제목과 본문을 입력하면 글자가 즉시 입력창에 반영된다
- [x] 본문 글자 수가 `n/200`으로 실시간 갱신되고 200자를 넘기지 못한다
- [x] 저장하면 새 기록이 목록 맨 위에 나타나고 입력창이 비워진다
- [x] 제목이 비었거나 공백뿐이면 저장 버튼이 눌리지 않는다
- [x] Android 에뮬레이터를 쓴다면 본문 입력 글자가 위쪽부터 시작한다

## 검증(10분)

- 예측 1번: 저장 직후 `console.log(entries.length)`가 찍힌 값을 보고 왜 그 값인지 한 줄로 적는다.
- 예측 3번: `value`를 임시로 지워 보고 `setTitle('')` 뒤 입력창이 비워지는지 본다.
- 실험: 저장 `onPress`를 `entries.push(...)`와 `setEntries(entries)`로 바꿔 저장 버튼을 눌러 보고, 화면이 바뀌는지와 그 이유를 적는다. 확인 후 되돌린다.
  > 관찰:


| 예측  | 실제      | 다른 이유 |
| --- | ------- | ----- |
| 1   | 3으로 찍힘  | 동일    |
| 2   | 렌더 건너뜀  | 동일    |
| 3   | 지워지지 않음 | 동일    |


## 이해 점검 질문

1. `let count = 0`으로 선언한 지역 변수를 버튼으로 바꾸면 화면이 갱신되지 않는다. 왜 안 되고, `useState`가 무엇을 해결하는가? 좀 헷갈림
   - 지역 변수 count는 컴포넌트 함수가 다시 호출될때마다 0으로 초기화 됨
   - 값을 바꿔도 React가 렌더를 다시 할 이유가 없음, 그래서 화면이 바뀌지 않음
2. 제어 입력(`value` + `onChangeText`)과 비제어 입력(`defaultValue`)은 무엇이 다른가? 저장 후 입력창을 비우려면 어느 쪽이 쉬운가? 제어 입력은 브라우저에서 직접 제어, 비제어 입력은 기본값이 폼에 반영되며 브라우저가 제어하지 않는다?(헷갈림), 저장 후 입력창을 비울려면 제어 입력이 더 유리함
   - 브라우저 제어는 틀렸음. 제어 입력은 입력창의 값이 항상 state와 같고, 화면의 글자가 곧 state
   - 비제어 입력은 defaultValue가 초기값만 주고 이후에는 네이티브 입력창이 값을 쥠
3. state 배열에 `push`하지 않고 `[newEntry, ...entries]`로 새 배열을 만드는 이유는 무엇인가? push로는 setter 함수에 같은 참조가 들어가기 때문에 React가 렌더를 건너뜀

<details class="orca-details">
<summary>정답</summary>

1. 지역 변수는 컴포넌트 함수가 다시 호출될 때마다 초기화되고, 값을 바꿔도 React가 렌더를 다시 할 이유가 없다. `useState`는 렌더 사이에 값을 유지하는 state 변수와, 호출하면 새 값을 저장하고 렌더를 일으키는 setter를 함께 준다.
2. 제어 입력은 입력창의 값이 항상 state와 같아서 화면에 보이는 글자가 곧 state다. 비제어 입력은 `defaultValue`로 초기값만 주고 이후는 네이티브 입력창이 값을 쥔다. 저장 후 비우기, 글자 수 세기, 검증처럼 코드가 값을 알아야 하거나 바꿔야 하면 제어 입력이 쉽다.
3. React는 state가 바뀌었는지 참조(`===`)로 비교한다. `push`는 같은 배열 객체를 수정하므로 `setEntries(entries)`에 같은 참조가 들어가 변경이 없다고 판단하고 렌더하지 않을 수 있다. 새 배열을 만들면 참조가 달라 변경으로 인식한다(React 문서: 배열 state는 읽기 전용으로 다루고 새 배열을 setter에 넘긴다).

</details>

## 기록(5분)

배운 것 3줄: 

앱 환경에서 제어입력과 비제어 입력 간의 차이

let 지역 변수 개념을 다시 익힘

새 배열을 만들때 push를 쓰지 않는 이유

막힌 점: 지역변수를 쓰면 화면이 제대로 업데이트 되지 않는 이유에 대해 잘 기억이 안났음

## 커밋 단위 제안

- `feat: 기록 작성 폼 추가 (제목·본문 TextInput)`
- `feat: 새 기록을 목록 맨 위에 추가`

## 웹과 다른 점

`[[ORCA_RICH_MD:6e227477f3e727c0fc2f8759a4be47bc:inline-html:%3Cform%3E]]`의 submit과 `onChange(e)` 이벤트 객체 대신, `TextInput`은 문자열을 바로 주는 `onChangeText`를 쓰고 제출은 버튼의 `onPress`나 `onSubmitEditing`으로 직접 처리한다.