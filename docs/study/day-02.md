# Day 2 · 10/28 (수) — 코어 컴포넌트(View, Text, Image, ScrollView, Pressable). 웹과 다른 점

## 오늘의 목표

템플릿 예제를 비우고, View·Text·Image·ScrollView·Pressable만으로 Daily Log의 정적 기록 목록 화면을 만든다.

## 읽기(15분)

1. https://reactnative.dev/docs/0.81/text
   - 확인할 사실: 모든 문자열은 `<Text>` 안에 있어야 하고 `<View>` 바로 아래에 둘 수 없다는 문장. 중첩 `Text`의 스타일 상속이 "텍스트 하위 트리 안에서만" 일어난다는 문장. `numberOfLines`가 줄 수 제한 후 말줄임표를 붙인다는 설명.
2. https://reactnative.dev/docs/0.81/image
   - 확인할 사실: 네트워크 이미지는 `width`와 `height`를 직접 줘야 하고 로컬 `require` 이미지는 파일에서 크기를 알 수 있다는 문장. `resizeMode`의 기본값이 `cover`라는 점. `alt`가 스크린 리더용 설명이라는 점.
3. https://reactnative.dev/docs/0.81/pressable
   - 확인할 사실: `onPress`는 손가락을 뗀 뒤 `onPressOut` 다음에 호출된다. `onLongPress`는 기본 500ms 이상 누르면 호출된다. `style`에 `({ pressed }) => ...` 함수를 줄 수 있다.

## 예측(10분)

1. `<View>오늘의 기록</View>`처럼 `Text` 없이 문자열을 `View` 바로 아래에 두면 어떻게 될까?
   > 내 예측:
2. `<Image source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} />`에 `style`로 크기를 주지 않으면 화면에 보일까?
   > 내 예측:
3. 세로 `ScrollView` 안의 카드를 손가락으로 끌어 스크롤하면 그 카드의 `Pressable`의 `onPress`가 호출될까?
   > 내 예측:

## 만들기(40분)

Daily Log의 기록 화면 첫 버전이다. 이 Day부터 Day 14까지 화면은 `app/index.tsx` 하나이고, Day 15에서 expo-router 탭으로 나눈다.

1. Day 1에서 만든 앱 루트에서 `npm run reset-project`를 실행한다. 질문 "Do you want to move existing files to /app-example instead of deleting them? (Y/n)"에는 `n`을 답한다.
   - `n`: 예제 폴더를 삭제한다. Day 1에서 커밋했으므로 필요하면 git으로 복구할 수 있다.
   - `y`: `app-example/`로 옮긴다. 남은 폴더도 `tsconfig.json`의 `include`(`**/*.tsx`) 때문에 타입 검사 대상이 되어 오류가 섞인다.
   - 결과: `app/index.tsx`와 `app/_layout.tsx`(Stack)만 새로 생기고 `components/`, `hooks/`, `constants/`, `scripts/`는 사라진다. `assets/`는 남는다.
2. `package.json`의 `scripts`에서 `reset-project` 항목을 지운다(스크립트 파일이 이미 없다).
3. `app/index.tsx`를 고쳐 화면을 만든다.
   - 최상위는 `ScrollView`, 첫 자식은 `Text`로 "오늘의 기록" 제목.
   - 파일 상단에 하드코딩 배열 `ENTRIES`(id, title, body 3개)를 두고 `map`으로 카드를 그린다. 각 카드는 `Pressable` 안에 `Image`, 제목 `Text`, 본문 `Text`(`numberOfLines={2}`).
   - 한 카드는 로컬 이미지 `require('../assets/images/icon.png')`, 다른 카드는 네트워크 이미지(위 읽기 2번 예시 URI + 크기 지정)를 쓴다.
   - `Pressable`의 `onPress`에서 `console.log`로 카드 id를 찍고, `style`을 함수로 줘서 누르는 동안 `opacity`를 낮춘다.
4. 스타일은 오늘 인라인 객체로 최소한만 준다. `StyleSheet`는 Day 3에서 정리한다.
5. ScrollView 상세는 https://reactnative.dev/docs/0.81/scrollview 에서 `contentContainerStyle`을 확인한다.

```tsx
<Pressable
  onPress={() => console.log(entry.id)}
  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
>
  {/* Image, Text 두 개 */}
</Pressable>
```

완료 기준:
- [ ] `npm run reset-project`를 실행했고 `app/`에 `index.tsx`, `_layout.tsx`만 있다
- [ ] `package.json`에 `reset-project` 스크립트가 없다
- [ ] 시뮬레이터에 제목과 카드 3개가 보이고 세로로 스크롤된다
- [ ] 로컬 이미지와 네트워크 이미지가 모두 보인다
- [ ] 카드를 탭하면 터미널에 id가 찍히고, 누르는 동안 카드가 흐려진다
- [ ] 본문이 두 줄을 넘으면 말줄임표가 붙는다(본문 하나를 길게 써서 확인)

## 검증(10분)

- 시뮬레이터에서 카드를 짧게 탭할 때와 끌어서 스크롤할 때, 터미널 로그가 찍히는지 비교한다(예측 3번).
- 네트워크 이미지의 `width`·`height`를 지우고 저장해 본다(예측 2번).
- 실험: `View` 바로 아래에 문자열을 넣어 저장하고, 화면에 뜬 오류 메시지 원문을 아래에 옮겨 적는다. 원문을 그대로 검색창에 넣어 보는 것이 막힘 규칙 1번 연습이다.
  > 오류 원문:

| 예측 | 실제 | 다른 이유 |
|---|---|---|
| 1 |  |  |
| 2 |  |  |
| 3 |  |  |

## 이해 점검 질문

1. 웹의 `div`, `p`, `img`, `input`, `button`은 각각 어떤 RN 컴포넌트에 대응하는가? 문자열을 반드시 `Text` 안에 둬야 하는 이유는?
2. `ScrollView`와 `FlatList`의 렌더링 방식 차이는 무엇이고, 각각 어떤 상황에 쓰는가?
3. `Pressable`의 `style`에 함수를 주는 이유는 무엇이며, `onPress`가 호출되는 시점은 언제인가?

<details><summary>정답</summary>

1. `div`는 `View`, `p`는 `Text`, `img`는 `Image`, `input`은 `TextInput`이 가깝다. `button`은 `Pressable`로 직접 만들거나 `Button`을 쓴다(RN 컴포넌트 소개 문서의 대응표는 View/div, Text/p, Image/img, TextInput/input type="text"를 든다). RN은 브라우저 DOM이 아니라 iOS의 `UILabel` 같은 네이티브 뷰를 만든다. 텍스트는 별도의 네이티브 텍스트 뷰가 그리기 때문에 문자열을 담당하는 `Text`가 있어야 한다. 그래서 `View` 바로 아래 문자열은 오류다.
2. `ScrollView`는 자식을 한 번에 전부 렌더하므로 항목이 많으면 느려지고 메모리를 더 쓴다. `FlatList`는 화면에 곧 보일 항목만 렌더하고 멀리 벗어난 항목은 제거한다(Day 7). 적은 고정 콘텐츠는 `ScrollView`, 긴 목록은 `FlatList`가 맞다.
3. 눌린 동안만 다른 스타일을 주려면 현재 눌림 상태를 알아야 한다. `style` 함수는 `{ pressed }`를 인자로 받아 눌림 상태에 따라 스타일을 반환한다. `onPress`는 손가락을 뗀 뒤 `onPressOut` 다음에 호출된다. 그래서 끌어서 스크롤하는 동작은 보통 `onPress`로 이어지지 않는다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: reset-project로 템플릿 예제 제거`
- `feat: 코어 컴포넌트로 기록 목록 화면 구성`

## 웹과 다른 점

`div`·`span`에 글자를 바로 쓰는 웹과 달리 모든 글자는 `Text` 안에 있어야 하고, `onClick` 대신 `Pressable`의 `onPress`를 쓰며, 네트워크 이미지는 크기를 직접 줘야 한다.
