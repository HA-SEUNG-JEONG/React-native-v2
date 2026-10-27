# Day 10 · 11/9 (월) — TypeScript props와 이벤트 타입

> 전제: 지금 `app/index.tsx` 한 화면에 글 입력 폼(Day 5~6의 `TextInput`)과 기록 목록(Day 5의 `entries.map`)과 피드(Day 7~8)가 같이 있다. 구조가 다르면 아래 파일 이름만 자기 코드의 위치로 바꿔 읽는다.

## 오늘의 목표

Daily Log의 글 데이터(`LogEntry`)와 컴포넌트 props, 입력 이벤트 핸들러에 타입을 붙여 `tsc`가 실수를 잡게 한다.

## 읽기(15분)

1. React Native 0.81 TypeScript 가이드: https://reactnative.dev/docs/0.81/typescript
   - 확인할 사실: props는 `type Props = {...}`로 선언하고 함수 컴포넌트의 파라미터에 붙인다. 선택 props는 `?`로 표시한다. `useState`의 상태 타입은 초기값에서 추론된다. 타입 검사는 TypeScript 컴파일러(`npx tsc`)로만 하고 번들링은 Babel이 한다.
2. `TextInput` 문서: https://reactnative.dev/docs/0.81/textinput
   - 확인할 사실: `onChangeText`는 변경된 텍스트를 문자열 하나로 받는다. `onSubmitEditing`은 문자열이 아니라 `{nativeEvent: {text, eventCount, target}}` 모양의 이벤트를 받는다. 문서에는 모양만 나오고 타입 이름은 없으므로, 에디터에서 `onSubmitEditing`에 마우스를 올려 실제 타입 이름을 확인한다.
3. `Pressable` 문서: https://reactnative.dev/docs/0.81/pressable
   - 확인할 사실: `onPress`는 이벤트 객체를 받고, `style`은 스타일 객체이거나 `({ pressed })`를 받아 스타일을 돌려주는 함수다.

## 예측(10분)

코드를 짜기 전에 적는다.

1. `onSubmitEditing={(text: string) => addEntry(text)}`처럼 쓰면 `npx tsc --noEmit`이 오류를 내는가? 낸다면 무엇이 맞지 않기 때문인가?

> 내 예측:

2. `const [entries, setEntries] = useState([])`로 쓰고 `setEntries([...entries, newEntry])`를 호출하면 `entries`의 타입은 무엇으로 추론되고, 이 줄은 어떻게 되는가?

> 내 예측:

3. 위 1번처럼 타입 오류가 있는 상태에서 시뮬레이터의 앱은 정상적으로 번들링되어 실행되는가?

> 내 예측:

## 만들기(40분)

글 하나를 나타내는 타입을 만들고, 목록 한 줄을 별도 컴포넌트로 분리해 props에 타입을 붙인다.

새로 만들 파일:
- `types/log.ts` — `LogEntry` 타입: `id: string`, `title: string`, `body: string`, `createdAt: number`(밀리초 타임스탬프).
- `components/LogItem.tsx` — Day 2·5에서 만든 `app/index.tsx`의 기록 카드(`Pressable`) JSX를 옮겨 온다. props 타입 예:

```tsx
type LogItemProps = {
  entry: LogEntry;
  onPress: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};
```

고칠 파일:
- `app/index.tsx`
  1. Day 5의 `type Entry`와 Day 2의 `ENTRIES`는 지운다. `useState<LogEntry[]>([])`로 제네릭을 명시하고 초기값은 빈 배열로 둔다. 저장 `onPress`가 만드는 새 기록에는 `createdAt: Date.now()`를 넣는다.
  2. `onChangeText`는 `(text: string) => void`, `onSubmitEditing`은 이벤트 타입을 붙인 핸들러로 쓴다.
  3. 기록 목록(`entries.map`)을 `FlatList`로 바꾸고 `renderItem`에서 `LogItem`을 쓴다.
  4. 폼 아래에 `FlatList`가 오므로 바깥 `ScrollView`를 `View`(`flex: 1`)로 바꿔 스크롤 컨테이너가 중첩되지 않게 한다. `ScrollView`에 있던 `keyboardShouldPersistTaps="handled"`는 `FlatList`로 옮긴다.

폴더가 아직 정리되지 않았으므로 지금은 상대 경로(`../components/LogItem`)로 import한다. Day 12에서 정리한다.

완료 기준:
- [ ] `types/log.ts`에 `LogEntry`가 있고 `app/index.tsx`와 `components/LogItem.tsx`가 둘 다 이것을 import한다
- [ ] `LogItem`의 props에 `any`가 없다
- [ ] `useState`에 제네릭이 명시되어 있다
- [ ] `onSubmitEditing` 핸들러의 이벤트 타입을 에디터 hover로 확인해 적었다
- [ ] `npx tsc --noEmit`이 오류 0개로 끝난다
- [ ] 글을 입력해 추가하고 항목을 누르면 `onPress`가 항목의 `id`를 받는다(콘솔 로그로 확인)

## 검증(10분)

- 시뮬레이터에서 글을 추가한 뒤 항목을 눌러 `id`가 문자열로 찍히는지 본다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- 일부러 깨뜨려 보기: `LogItem` 안에서 `onPress(entry.id)`를 `onPress(entry)`로 바꾼다. 에디터와 `npx tsc --noEmit`에서 무엇이 표시되는지, 앱은 실행되는지 확인하고 원래대로 되돌린다.

## 이해 점검 질문

1. 타입 오류가 있어도 Metro가 앱을 번들링하고 실행하는 이유는 무엇이고, 그래서 `npx tsc --noEmit`을 따로 돌려야 하는 이유는 무엇인가?
2. `useState([])` 대신 `useState<LogEntry[]>([])`로 쓰는 이유는 무엇인가?
3. `onChangeText`와 `onSubmitEditing`은 입력한 문자열을 얻는 방법이 어떻게 다른가?

<details>
<summary>정답</summary>

1. 번들링 단계에서 Babel이 타입 선언을 지우기만 하고 검사는 하지 않기 때문이다. RN 가이드도 TypeScript 컴파일러는 타입 검사용으로만 쓰라고 한다. 그래서 타입 오류가 있어도 앱은 돌아가고, 오류는 `tsc`나 에디터에서만 드러난다.
2. 빈 배열 리터럴 `[]`에서는 요소 타입을 알 수 없어 `never[]`로 추론된다. 그러면 `LogEntry`를 넣는 순간 타입 오류가 난다. 초기값만으로 타입을 정할 수 없을 때는 제네릭으로 직접 알려 준다.
3. `onChangeText`는 변경된 텍스트를 문자열 인자로 바로 준다. `onSubmitEditing`은 이벤트 객체를 주므로 `e.nativeEvent.text`로 꺼내야 한다. 인자 타입이 달라서 핸들러 시그니처도 다르다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: LogEntry 타입과 LogItem 컴포넌트 추가`
- `refactor: 입력 핸들러와 상태에 타입 지정`

## 웹과 다른 점

웹의 `onChange`는 `e.target.value`로 값을 읽지만, RN `TextInput`은 `onChangeText`가 문자열을 바로 주고 이벤트 객체는 `e.nativeEvent` 아래에 값이 들어 있다.
