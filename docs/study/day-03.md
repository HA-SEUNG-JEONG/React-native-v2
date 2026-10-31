# Day 3 · 10/29 (목) — StyleSheet, Flexbox(기본 column), Platform 분기

## 오늘의 목표

Day 2의 인라인 스타일을 `StyleSheet.create`로 옮기고, Flexbox로 카드 레이아웃을 잡고, iOS와 Android의 그림자 차이를 `Platform`으로 나눈다.

## 읽기(15분)

1. [https://reactnative.dev/docs/style](https://reactnative.dev/docs/style)
   - 확인할 사실: 스타일 이름은 camelCase다. `style`에 배열을 주면 뒤의 요소가 우선한다. 웹 CSS와 달리 `style` prop을 직접 넘겨야 하위 컴포넌트에 "cascade"시킬 수 있다.
2. [https://reactnative.dev/docs/flexbox](https://reactnative.dev/docs/flexbox)
   - 확인할 사실: `flexDirection` 기본값은 웹의 `row`가 아니라 `column`이다. `alignItems` 기본값은 `stretch`, `justifyContent` 기본값은 `flex-start`다. `flex`는 숫자 하나만 받는다. 웹과 다른 점으로 `flexShrink` 기본값이 `0`이라는 문장이 있다. `gap`은 `rowGap`과 `columnGap`의 줄임이다.
3. [https://reactnative.dev/docs/platform-specific-code](https://reactnative.dev/docs/platform-specific-code)
   - 확인할 사실: `Platform.OS`는 `'ios'` 또는 `'android'`다. `Platform.select`는 키 `ios`·`android`·`native`·`default` 중 현재 플랫폼에 맞는 값을 돌려준다. 파일 확장자(`.ios.tsx`, `.android.tsx`)로 파일 자체를 나누는 방법도 있다.

## 예측(10분)

1. 카드가 `flexDirection: 'row'`이고 왼쪽에 `Image`, 오른쪽에 긴 본문 `Text`가 있다. 오른쪽 `Text`를 감싼 `View`에 `flex: 1`을 주지 않으면 긴 글은 어떻게 보일까?
   > 내 예측: 텍스트가 overflow 된다
2. 부모 `View`에 `flexDirection` 을 지정하지 않고 자식 `Text` 두 개를 넣으면 가로로 놓일까 세로로 놓일까? 웹에서 `div` 두 개를 `display: flex`로 두었을 때와 같은가?
   > 내 예측: 세로로 놓인다
3. 카드에 `shadowOpacity`·`shadowRadius`·`shadowOffset`만 주고 `elevation`은 주지 않으면 iOS와 Android에서 각각 그림자가 보일까?
   > 내 예측: 잘 모르겠다

## 만들기(40분)

기록 화면(`app/index.tsx`)의 레이아웃을 다듬는다. Day 2에서 만든 `app/index.tsx`의 `ENTRIES` 목록을 그대로 쓴다.

1. 파일 하단에 `const styles = StyleSheet.create({ ... })`를 만들고 Day 2의 인라인 스타일을 모두 옮긴다.
2. 화면 상단 헤더 행: "오늘의 기록"(왼쪽)과 오늘 날짜 `Text`(오른쪽)를 `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`로 배치한다.
3. 카드: 왼쪽 썸네일(고정 너비·높이, `borderRadius`), 오른쪽 텍스트 영역(`flex: 1`)의 가로 배치로 바꾼다. 카드 사이 간격은 `gap`이나 `marginBottom` 중 하나로 통일한다.
4. 화면 바깥 여백은 `ScrollView`의 `contentContainerStyle`에 `padding`을 준다.
5. 카드 그림자: iOS는 `shadow*` 속성, Android는 `elevation`을 쓰도록 `Platform.select`로 나눈다. 속성 목록은 [https://reactnative.dev/docs/shadow-props](https://reactnative.dev/docs/shadow-props) 에서 확인한다.
6. 화면 맨 위 헤더 제목이 라우트 이름(`index`)으로 보이면 정상이다. 헤더는 Day 18에서 다룬다.

```tsx
card: {
  flexDirection: 'row',
  gap: 12,
  ...Platform.select({
    ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 3 },
  }),
},
```

완료 기준:

- [x] 인라인 스타일 객체가 `app/index.tsx`에 남아 있지 않고 모두 `styles.*`다
- [x] 헤더 행에 제목은 왼쪽, 날짜는 오른쪽 끝에 놓인다
- [x] 카드는 썸네일이 왼쪽, 텍스트가 오른쪽이고 긴 본문이 화면 밖으로 넘치지 않는다
- [x] 카드에 그림자가 iOS 시뮬레이터에서 보인다(Android 에뮬레이터가 있다면 거기서도 확인)
- [x] 간격·반경·색 값이 `styles` 안에서 일관되다(같은 용도에 서로 다른 숫자를 쓰지 않았다). 값을 토큰으로 묶는 일은 Day 53 테마에서 다룬다

## 검증(10분)

- 예측 1번: 텍스트 영역의 `flex: 1`을 지우고 긴 본문으로 확인한 뒤 되돌린다. 예측과 비교해 오른쪽 텍스트가 어떻게 됐는지 적는다.
- 예측 3번: `elevation`을 지웠을 때와 `shadow*`를 지웠을 때 그림자가 각 플랫폼에서 어떻게 되는지 본다.
- 실험: 최상위 컨테이너의 `flexDirection`을 `'row'`로 바꿔 저장하면 화면이 어떻게 변하는지 보고, 웹 기본값과 비교해 한 줄로 적는다.
  > 관찰: row로 바꿨을 때 이름 그대로 가로로 배치된다.


| 예측  | 실제                                                                                                                                           | 다른 이유 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | flex : 1을 지웠을 때 카드 영역에 있던 텍스트들이 바깥으로 침범했다.                                                                                                   | 같음    |
| 2   | 가로로 배치된다.                                                                                                                                    | 같음    |
| 3   | elevation을 지웠을 때 android에서만 그림자가 보이지 않고, ios에서는 변함이 없었으며, ios에서 shadow 관련 부분을 삭제했을 때 ios에서 그림자가 없어지고, 안드로이드에서 지웠던 스타일을 다시 복구하면 원래대로 그림자가 보였음 | 다름    |


## 이해 점검 질문

1. RN의 `flexDirection` 기본값은 무엇이고, 웹과 다르다는 사실이 레이아웃 코드에서 어떤 실수로 이어지는가?
2. `style={[styles.card, { opacity: 0.5 }]}`처럼 배열로 주면 같은 속성이 겹칠 때 어느 쪽이 적용되는가? 이 방식이 왜 유용한가?
3. 그림자를 `Platform.select`로 나눈 이유는 무엇인가? `Platform.select`와 `.ios.tsx`·`.android.tsx` 파일 분리는 각각 언제 쓰는가?

<details class="orca-details" open>
<summary>정답</summary>

1. `column`이다. 웹에서 flex 컨테이너에 자식을 넣으면 가로로 놓이는 데 익숙해, RN에서도 가로로 놓일 거라 생각하고 `flexDirection: 'row'`를 빠뜨려 세로로 쌓이는 실수가 난다. `alignItems`의 기본이 `stretch`이므로 row 안의 자식 높이가 부모에 맞춰 늘어나는 것도 함께 알아 둔다.
2. 배열의 뒤쪽 요소가 우선한다. 기본 스타일 위에 조건부 스타일이나 부모가 넘긴 `style`을 덮어 쓰는 패턴을 쓸 수 있어, 스타일을 복제하지 않고 상속하듯 확장할 수 있다.
3. `shadowColor`를 뺀 `shadowOffset`·`shadowOpacity`·`shadowRadius`는 iOS에서만 동작하고 Android는 `elevation`으로 그림자를 만든다(shadow-props 문서). 그래서 한 `View`에 둘 다 필요하다. 속성 몇 개만 다르면 `Platform.select`나 `Platform.OS` 분기를, 컴포넌트 구조가 크게 다르면 `.ios.tsx`·`.android.tsx` 파일로 나눈다(Metro가 플랫폼에 맞는 파일을 고른다).

</details>

## 기록(5분)

배운 것 3줄:

- ios에서 android에서 그림자 스타일 주는 방식이 다른 것
- flex : 1을 통해 텍스트 스타일을 잘 조절해야 한다는 것
- 인라인 스타일을  StyleSheet로 관리하는 방법

막힌 점: 

- StyleSheet을 오랜만에 봐서 스타일 선언 방법에서 막혔음

## 커밋 단위 제안

- `style: 기록 화면 스타일을 StyleSheet로 정리`
- `feat: 카드 레이아웃과 플랫폼별 그림자 적용`

## 웹과 다른 점

CSS와 달리 `flexDirection` 기본값이 `column`이고, 스타일은 camelCase 객체이며 부모에서 자식으로 상속되지 않는다(텍스트 하위 트리 안의 `Text`만 예외). 숫자는 단위 없이 density-independent 픽셀로 해석된다.