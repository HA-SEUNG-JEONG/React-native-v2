# Day 51 · 1/5 (화) — Reanimated 기초: shared value, animated style

## 오늘의 목표

shared value, `useAnimatedStyle`, `withSpring`/`withTiming`으로 좋아요 하트 팝 애니메이션과 연습 박스의 손가락 추종 애니메이션을 만들고, "값이 바뀌어도 리렌더되지 않는다"는 점을 확인한다.

## 읽기(15분)

이 카드는 SDK 54가 고정하는 `react-native-reanimated` 4.1 계열과 `react-native-worklets` 0.5 기준이다. Reanimated 문서 사이트는 최신 버전(4.4 이상 기능 포함)을 보여 주므로, 문서에서 "4.x.0부터"라고 적힌 기능은 쓰지 않는다. 설치 명령(`npx expo install react-native-reanimated react-native-worklets`)과 "Babel 플러그인은 `babel-preset-expo`에 자동 설정된다"는 설명은 https://docs.expo.dev/versions/v54.0.0/sdk/reanimated/ 에 있다. 이 템플릿은 이미 설치되어 있으니 `package.json`에서 두 패키지의 버전만 확인한다.

1. https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation
   - 확인할 사실: 값은 `useSharedValue`로 만들고 읽고 쓸 때는 항상 `.value`를 쓴다(`sv = 100`이 아니라 `sv.value = 100`). 애니메이션은 값을 `withSpring(목표값)`으로 감싸서 대입하면 시작된다.
2. https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue
   - 확인할 사실: shared value를 바꿔도 React 리렌더가 일어나지 않는다. 쓰기 직후 JS 스레드에서 `.value`를 읽으면 이전 값이 보일 수 있다. 렌더 중에 `.value`를 읽거나 쓰면 안 된다(콜백·`useAnimatedStyle`·`useEffect` 안에서 접근). 구조분해(`const { value } = sv`)와 객체 속성 직접 수정(`sv.value.x = 1`)은 반응성을 잃는다.
3. https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedStyle
   - 확인할 사실: 결과 스타일은 `Animated.View` 같은 Animated 컴포넌트에만 줄 수 있다. 정적 스타일은 `StyleSheet`에 두고 `[styles.box, animatedStyle]`로 합친다. 애니메이션 스타일은 정적 스타일을 덮어쓴다. `useAnimatedStyle` 안에서 shared value를 대입하면 안 된다.

## 예측(10분)

1. 하트가 팝되는 동안 `LikeHeart` 컴포넌트는 몇 번 리렌더될까? 렌더 본문에 `console.log('render')`를 넣었을 때 `liked`가 바뀌는 순간과 `scale.value`가 바뀌는 매 프레임을 구분해서 예측한다.

> 내 예측:

2. `scale.value = 1.4;` 바로 다음 줄에서 `console.log(scale.value)`를 찍으면 무엇이 찍힐까?

> 내 예측:

3. `useAnimatedStyle`의 결과를 `Animated.View`가 아닌 일반 `View`의 `style`에 넘기면 어떻게 될까?

> 내 예측:

## 만들기(40분)

Daily Log 글 상세 화면의 좋아요 표시를 하트 아이콘으로 바꾸고 팝 애니메이션을 준다. 이어서 Day 50에서 만든 연습 영역을 손가락을 따라 움직이는 박스로 바꾼다. 새 컴포넌트는 `src/components/LikeHeart.tsx`에 만든다.

1. `src/components/LikeHeart.tsx`의 `LikeHeart({ liked }: { liked: boolean })`를 만든다.
   - `@expo/vector-icons`의 `Ionicons`에서 `heart`(켜짐)와 `heart-outline`(꺼짐)을 `liked`로 고른다.
   - `scale` shared value(초기값 1)를 만들고, `useAnimatedStyle`이 `transform: [{ scale: scale.value }]`를 돌려주게 한다. 아이콘은 `Animated.View`로 감싼다.
   - `liked`가 바뀔 때 `useEffect`에서 `scale.value = withSequence(withTiming(1.4, { duration: 100 }), withSpring(1))`처럼 커졌다가 스프링으로 돌아오게 한다. 맨 처음 마운트 시점에도 효과가 실행되므로, 첫 렌더에는 팝이 나오지 않게 할 방법을 스스로 정한다(예: 이전 값 `useRef` 비교, 또는 처음 실행은 건너뛰기).
2. Day 50에서 상세 화면에 만든 "좋아요: 켜짐/꺼짐" 글자를 `LikeHeart`로 교체한다. 더블탭 제스처는 그대로 둔다.
3. 상세 화면 연습 영역을 박스로 바꾼다.
   - `translateX` shared value와 `useAnimatedStyle`(`transform: [{ translateX: translateX.value }]`)을 만든다. 박스는 `Animated.View`다.
   - Pan의 `onUpdate`에서 `translateX.value = e.translationX`, `onEnd`에서 `translateX.value = withSpring(0)`.
   - 이제 Pan 콜백은 shared value만 건드리므로 UI 스레드에서 그대로 실행된다. Day 50의 `dragX` 상태와 `.runOnJS(true)`는 제거한다. 왜 이번에는 `runOnJS`가 필요 없는지 기록 칸에 한 줄로 적는다.
4. 상세 화면 본문 카드가 처음 보일 때 서서히 나타나게 한다: `opacity` shared value(초기값 0)를 `useEffect`에서 `withTiming(1, { duration: 300 })`로 올리고, 본문 카드 바깥을 `Animated.View`로 감싼다. `GestureDetector` 바로 아래 자식은 그대로 일반 `View`로 두어 Day 50의 탭 제스처가 계속 동작하게 한다.
5. `expo lint`가 `.value` 대입을 렌더 중 변경으로 경고하면 경고 위치가 이벤트·효과·제스처 콜백 안인지 확인한다. 이 템플릿은 React Compiler가 켜져 있다. Reanimated 문서는 Compiler 사용 시 `.value` 대신 `get()`/`set()`을 권한다. 이 메서드가 4.1에도 있는지는 `react-native-reanimated`의 타입(`SharedValue`)에서 확인하고, 경고가 실제로 나온 경우에만 바꾼다.

완료 기준

- [ ] `package.json`에서 `react-native-reanimated`(`~4.1.x`)와 `react-native-worklets`(`0.5.x`) 버전을 확인했다
- [ ] 더블탭하면 하트가 커졌다가 원래 크기로 돌아오고, 아이콘이 채워진 하트/빈 하트로 바뀐다
- [ ] 화면에 처음 들어올 때 하트 팝이 나오지 않는다
- [ ] 연습 박스가 손가락을 따라 좌우로 움직이고, 손을 떼면 스프링으로 돌아온다
- [ ] 본문 카드가 서서히 나타난다
- [ ] 연습 박스 Pan에 `.runOnJS(true)`와 `useState`가 남아 있지 않다

## 검증(10분)

확인할 동작

- 상세 화면에서 본문을 여러 번 더블탭하며 하트 팝을 본다. 개발 메뉴를 열어 성능 모니터를 켜거나, `LikeHeart` 렌더 본문의 `console.log('render')` 횟수를 센다. 예측 1과 비교한다.
- 연습 박스를 느리게/빠르게 밀었다 놓아 본다. `withSpring`의 감쇠가 어떻게 보이는지 `damping` 값을 바꿔 가며(예: 10과 30) 비교한다. 문서 기본값(`stiffness` 900, `damping` 120, `mass` 4)에서 시작해 값을 바꿀 때 튕김이 어떻게 달라지는지 본다.

일부러 깨뜨려 보는 실험

- 연습 박스의 `Animated.View`를 일반 `View`로 바꿔 보고 화면에 나오는 에러 메시지 원문을 적는다. 예측 3과 비교한 뒤 되돌린다. 이어서 `onUpdate`에서 `translateX.value = e.translationX` 바로 다음 줄에 `console.log(translateX.value)`를 찍어 예측 2와 비교하고, 확인한 뒤 로그를 지운다.

> 에러 원문:
>
> 예측과 달랐던 점:

## 이해 점검 질문

1. `useState`로 `scale`을 관리하는 대신 shared value를 쓰면 무엇이 달라지고, 왜 애니메이션에 유리할까?
2. `sv.value = 100;` 바로 다음 줄에서 `console.log(sv.value)`를 찍으면 왜 100이 아닐 수 있을까?
3. `useAnimatedStyle`로 만든 스타일을 쓰려면 왜 `Animated.View`여야 하고, 정적 스타일과 같이 쓸 때 어떤 점을 조심해야 할까?

<details>
<summary>정답</summary>

1. shared value를 바꾸면 React 리렌더 없이 값이 UI 스레드에 반영되고, `useAnimatedStyle`이 그 값을 읽어 네이티브 뷰의 스타일만 직접 갱신한다. `useState`로 매 프레임 값을 바꾸면 매번 JS 스레드에서 리렌더가 일어나 JS가 바쁠 때 애니메이션이 끊긴다. 그래서 애니메이션 값은 shared value, 화면 구조를 바꾸는 값(`liked` 같은 논리 상태)은 `useState`로 나눈다.
2. shared value의 쓰기는 UI 스레드에서 동기적으로 반영되지만 JS 스레드는 그 변경을 비동기로 받는다. 그래서 쓰기 직후 JS에서 읽으면 이전 값이 보일 수 있다. 같은 이유로 JS 스레드에서 `.value`를 반복해서 읽으면 UI 스레드의 값이 올 때까지 기다리게 되어 느려질 수 있다.
3. `Animated.View` 같은 Animated 컴포넌트만 `useAnimatedStyle`이 만든 스타일(내부적으로 UI 스레드에서 갱신되는 스타일)을 받을 수 있고, 일반 `View`에 넘기면 에러가 난다. 정적 스타일은 `[styles.box, animatedStyle]`처럼 배열로 합치며, 애니메이션 스타일이 정적 스타일의 같은 속성을 덮어쓰므로 `width`처럼 겹치는 속성을 양쪽에 두지 않는다.

</details>

## 기록(5분)

배운 것 3줄:

1.
2.
3.

막힌 점:

## 커밋 단위 제안

- `feat: 좋아요 하트에 Reanimated 팝 애니메이션 추가`
- `feat: 글 상세 연습 박스가 손가락을 따라 움직이게 변경`
- `style: 상세 본문 카드에 fade-in 추가`

## 웹과 다른 점

웹의 CSS transition·animation은 브라우저가 알아서 합성하지만, RN에서는 매 프레임 JS가 리렌더하지 않도록 shared value와 `useAnimatedStyle`로 UI 스레드가 스타일을 직접 갱신하게 만들어야 한다.
