# Day 56 · 1/12 (화) — 반응형: useWindowDimensions, 키보드·SafeArea 다듬기

## 오늘의 목표

`useWindowDimensions`로 피드를 화면 너비에 따라 1열/2열로 바꾸고, 기록 작성 화면에서 SafeArea 하단 여백과 키보드 동작을 iOS·Android에서 비교해 다듬는다.

## 읽기(15분)

1. https://reactnative.dev/docs/0.81/usewindowdimensions
   - 확인할 사실: 반환 필드는 `width`, `height`, `scale`, `fontScale`이다. 화면 크기나 글자 크기 설정이 바뀌면 값이 자동으로 갱신된다. `Dimensions.get`이 호출 시점의 스냅샷인 것과 달리 이 훅은 구독해 리렌더한다는 차이를 `Dimensions` 문서(https://reactnative.dev/docs/0.81/dimensions)와 비교해 확인한다.
2. https://reactnative.dev/docs/0.81/flatlist
   - 확인할 사실: `numColumns`는 `horizontal={false}`일 때만 쓸 수 있고, 모든 항목이 같은 높이여야 한다(masonry 불가). `columnWrapperStyle`은 `numColumns > 1`인 행에 주는 스타일이다. `numColumns`를 실행 중에 바꿀 때의 제약은 이 페이지에 적혀 있지 않다. 이 제약은 직접 만들기에서 에러 메시지로 확인한다.
3. https://docs.expo.dev/versions/v54.0.0/sdk/safe-area-context/
   - 확인할 사실: Expo Router는 `SafeAreaProvider`를 자동으로 설정한다. `SafeAreaView`는 안전 영역을 패딩으로 적용한 `View`이고 문서가 가능하면 이쪽을 우선하라고 한다. `useSafeAreaInsets()`는 `top`·`right`·`bottom`·`left`를 돌려주는 더 세밀한 선택지다.

## 예측(10분)

1. 피드가 1열일 때 `numColumns`를 2로 바꾸는 코드를 `key` 없이 조건부로만 바꾸면 어떻게 될까?

> 내 예측:

2. 2열 피드에서 글이 홀수 개(예: 5개)이면 마지막 행의 카드는 어떤 폭으로 보일까? 카드에 `flex: 1`을 줬다고 가정한다.

> 내 예측:

3. 기록 작성 화면의 저장 버튼을 화면 맨 아래에 붙였을 때, 홈 인디케이터가 있는 iPhone과 제스처 내비게이션 Android에서 버튼은 각각 어떻게 가려질까? 키보드가 올라오면 버튼은 어떻게 될까?

> 내 예측:

## 만들기(40분)

1. 피드 탭(`app/(tabs)/index.tsx`)에서 `useWindowDimensions().width`로 `numColumns`를 구한다. 기준 너비는 상수 하나(예: 600)로 두고, 그 이상이면 2, 아니면 1이다.
   - `FlatList`의 `numColumns`에 넘기고, `key`에도 열 개수를 넣어 열 수가 바뀔 때 목록이 새로 만들어지게 한다(실행 중에 `numColumns`만 바꾸면 에러가 난다. 메시지 원문을 기록 칸에 적는다).
   - 열이 2개일 때만 `columnWrapperStyle`을 준다. 열이 1개일 때 `columnWrapperStyle`을 넘기면 에러가 난다.
   - 카드 폭이 열 수에 맞게 나뉘도록 하고, 홀수 개일 때 마지막 카드만 넓어지는 문제는 카드의 폭을 열 수에 맞춘 퍼센트 값으로 고정해 해결한다.
2. 글 상세 화면(Day 16에서 만든 동적 라우트 파일)에서 큰 화면일 때 본문이 한 줄로 너무 길게 늘어나지 않도록, 본문 컨테이너에 `maxWidth` 상수를 주고 가운데 정렬한다.
3. 기록 작성 화면(`app/(tabs)/write.tsx`)을 다듬는다.
   - 저장 버튼 영역의 하단 패딩을 `useSafeAreaInsets().bottom`과 기본 여백 중 큰 값으로 준다.
   - Day 6의 `KeyboardAvoidingView`가 있다면 `behavior`를 플랫폼별로 직접 지정했는지 확인한다. 문서는 Android와 iOS가 이 속성을 다르게 처리하므로 양쪽 모두 `behavior`를 설정하라고 한다. 값은 두 플랫폼에서 실제로 시험해 정한다.
   - 헤더가 있다면 `keyboardVerticalOffset`을 헤더 높이만큼 주어야 하는지 확인한다.
4. 글자 크기 설정이 커졌을 때 카드가 잘리지 않는지 본다. 카드 높이를 고정값으로 주었다면 `minHeight`로 바꾸거나 제거한다. `useWindowDimensions().fontScale` 값을 임시로 화면에 찍어 설정 변경이 반영되는지 확인한다.
5. `app.json`의 `orientation`은 템플릿에서 `portrait`이다. 가로 회전을 직접 시험하려면 `default`로 바꾸면 되지만, 이 변경이 개발 환경에서 즉시 적용되는지는 문서에서 확인 필요하다(적용되지 않으면 이 항목은 생략하고 iPad 시뮬레이터로 큰 화면만 확인한다).

완료 기준

- [ ] 폭이 600 미만이면 1열, 이상이면 2열로 피드가 바뀐다
- [ ] 2열에서 홀수 개일 때 마지막 카드가 넓어지지 않는다
- [ ] 열 수가 바뀔 때 `numColumns` 관련 에러가 나지 않는다
- [ ] 큰 화면에서 상세 본문이 `maxWidth`에서 멈추고 가운데에 놓인다
- [ ] 기록 작성 화면의 저장 버튼이 홈 인디케이터/내비게이션 막대에 가려지지 않고, 키보드가 올라와도 입력창과 저장 버튼이 보인다
- [ ] 글자 크기를 키워도 피드 카드 글자가 잘리지 않는다
- [ ] iOS와 Android에서 키보드 동작 차이를 기록 칸에 적었다

## 검증(10분)

확인할 동작

- 큰 화면 확인: iPad 시뮬레이터(또는 태블릿 Android 에뮬레이터)에서 앱을 열어 피드가 2열인지 본다(기기를 고르는 방법은 Expo CLI 안내를 따른다). 시뮬레이터가 없으면 `npm run web`으로 열어 브라우저 창 너비를 조절해 열 수 변화를 확인한다. 이 경우는 레이아웃만 확인하고 안전 영역·키보드는 확인할 수 없다는 점을 기록한다.
- 글자 크기: iOS 시뮬레이터 설정의 글자 크기(접근성 > 디스플레이 및 텍스트 크기)를 키우거나 Android 설정의 글꼴 크기를 키운 뒤 피드와 상세를 본다.
- 키보드: 기록 작성 화면에서 입력창을 눌러 키보드를 올리고 저장 버튼과 마지막 입력창이 보이는지, 두 플랫폼에서 비교한다.

일부러 깨뜨려 보는 실험

- 피드 `FlatList`에서 `key`를 지우고 화면 너비를 600 경계 위아래로 바꿔(iPad ↔ 폰, 웹 창 크기) `numColumns` 변경 에러를 일으킨다. 에러 메시지 원문을 적고 `key`를 되돌린다. 예측 1과 비교한다.

> 에러 원문:
>
> 예측과 달랐던 점:

## 이해 점검 질문

1. `Dimensions.get('window')`와 `useWindowDimensions()`는 어떻게 다르고, 왜 컴포넌트에서는 후자를 쓸까?
2. 실행 중에 `numColumns`를 바꾸려면 왜 `FlatList`에 `key`를 줘야 하고, 열이 1개일 때 `columnWrapperStyle`을 주면 어떻게 될까?
3. `SafeAreaView`와 `useSafeAreaInsets()`는 각각 언제 쓰고, 저장 버튼 하단 여백을 `Math.max(insets.bottom, 기본 여백)`으로 주는 이유는 무엇일까?

<details>
<summary>정답</summary>

1. `Dimensions.get('window')`는 호출한 순간의 스냅샷이라 회전·분할 화면·글자 크기 변경 후에도 값이 자동으로 바뀌지 않는다. `useWindowDimensions()`는 변경을 구독해 값이 바뀌면 컴포넌트를 다시 렌더하므로, 렌더에서 레이아웃을 결정하는 컴포넌트에서는 이 훅이 맞다.
2. `FlatList`는 `numColumns`가 바뀌면 `Changing numColumns on the fly is not supported. Change the key prop on FlatList when changing the number of columns to force a fresh render of the component.`라는 에러를 낸다(RN 0.81 소스의 invariant 메시지). `key`를 바꾸면 목록이 새로 마운트되어 이 검사를 피한다. `columnWrapperStyle`은 `numColumns > 1`에서만 허용되어 단일 열에서 넘기면 `columnWrapperStyle not supported for single column lists` 에러가 난다.
3. `SafeAreaView`는 안전 영역을 패딩으로 자동 적용하는 `View`라서 화면 전체를 감싸는 단순한 경우에 쓰고, 문서도 네이티브로 구현되어 있어 가능하면 이쪽을 우선하라고 한다. `useSafeAreaInsets()`는 `top`·`bottom` 같은 값을 직접 받아 특정 요소의 패딩을 따로 계산해야 할 때 쓴다. 홈 인디케이터가 없는 기기는 `insets.bottom`이 0이라 버튼이 바닥에 붙어 답답해 보이므로, 기본 여백과 큰 값을 취해 어떤 기기에서도 최소 여백을 보장한다.

</details>

## 기록(5분)

iOS와 Android의 키보드 동작 차이:

배운 것 3줄:

1.
2.
3.

막힌 점:

## 커밋 단위 제안

- `feat: 피드를 화면 너비에 따라 1열/2열로 전환`
- `style: 상세 본문 최대 너비와 기록 작성 하단 여백 다듬기`

## 웹과 다른 점

웹은 CSS 미디어 쿼리와 `rem`/`vh` 단위로 반응형을 선언하지만, RN에는 미디어 쿼리가 없어서 `useWindowDimensions` 값을 JS로 읽어 레이아웃을 분기하고 SafeArea 여백도 직접 값으로 받아 쓴다.
