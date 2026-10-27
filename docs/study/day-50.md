# Day 50 · 1/4 (월) — Gesture Handler 기초

## 오늘의 목표

앱 루트에 `GestureHandlerRootView`를 걸고, 글 상세 화면에서 `Gesture.Tap()`(더블탭·싱글탭)과 `Gesture.Pan()`을 붙여 제스처 이벤트 값과 실행 스레드 규칙을 직접 확인한다.

## 읽기(15분)

이 카드는 SDK 54가 고정하는 `react-native-gesture-handler` 2.28 계열 기준이다. 공식 문서 사이트의 기본 주소는 최신 3.x(다른 API 모양)를 보여 줄 수 있으므로 아래 링크처럼 주소에 `2.x`가 들어간 페이지를 읽는다. 설치 명령(`npx expo install react-native-gesture-handler`)과 Expo Go 포함 여부는 https://docs.expo.dev/versions/v54.0.0/sdk/gesture-handler/ 에 있다. 이 템플릿은 이미 설치되어 있으니 `package.json`의 `dependencies`에서 버전이 `~2.28.0`인지만 확인한다.

1. https://docs.swmansion.com/react-native-gesture-handler/docs/2.x/fundamentals/installation
   - 확인할 사실: `GestureHandlerRootView`는 앱 루트에 최대한 가깝게 둔다. 그 밖에서는 제스처가 인식되지 않고, 제스처 간 관계(우선순위 등)도 같은 root 안에서만 동작한다. 중첩된 root는 가장 바깥 것만 쓰인다. `style`을 직접 주면 `flex: 1`을 포함해야 화면이 보인다. Android에서 `Modal` 안의 제스처는 Modal 내용을 따로 `GestureHandlerRootView`로 감싸야 한다.
2. https://docs.swmansion.com/react-native-gesture-handler/docs/2.x/gestures/tap-gesture
   - 확인할 사실: `numberOfTaps`의 기본값, `maxDuration`의 기본값(밀리초)과 의미, `maxDistance`가 하는 일. 페이지 하단 예제가 `Gesture.Exclusive(doubleTap, singleTap)`로 두 탭을 묶는 이유(앞에 적은 제스처가 우선, 뒤 제스처는 앞 제스처가 실패해야 활성화).
3. https://docs.swmansion.com/react-native-gesture-handler/docs/2.x/gestures/pan-gesture
   - 확인할 사실: 콜백 순서(`onBegin`, `onStart`, `onUpdate`, `onEnd`, `onFinalize`)와 각각이 언제 불리는지. 이벤트 값 `translationX`(누적 이동량)와 `velocityX`(초당 포인트)의 의미. `runOnJS`가 "콜백을 JS 스레드에서 실행하도록 강제"하는 공통 옵션이라는 점.

## 예측(10분)

코드를 치기 전에 적는다. 틀려도 된다.

1. 본문 영역에 `Gesture.Exclusive(doubleTap, singleTap)`을 붙였을 때, 한 번만 탭하면 싱글탭 로그는 손을 떼자마자 찍힐까, 조금 늦게 찍힐까? 왜 그럴까?

> 내 예측:

2. Pan의 `onUpdate` 안에서 `useState`의 setter(`setDragX(e.translationX)`)를 `.runOnJS(true)` 없이 그냥 부르면 어떻게 될까?

> 내 예측:

3. 연습 영역을 천천히 밀 때와 빠르게 튕길 때, `onEnd`에서 찍은 `velocityX`는 어떻게 다를까? 부호는 무엇으로 정해질까?

> 내 예측:

## 만들기(40분)

Daily Log의 글 상세 화면에 "더블탭으로 좋아요"와 "제스처 연습 영역"을 추가한다. 상세 화면은 Day 16에서 만든 동적 라우트 파일 `app/post/[id].tsx`이다. 새 컴포넌트 파일은 만들지 않고 이 파일과 루트 레이아웃만 고친다.

1. 루트 레이아웃 `app/_layout.tsx`의 `RootLayout`이 반환하는 JSX 맨 바깥을 `GestureHandlerRootView`로 감싼다. `QueryClientProvider`를 포함한 모든 Provider보다 바깥에 둔다.

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// <GestureHandlerRootView style={{ flex: 1 }}> ... 기존 JSX ... </GestureHandlerRootView>
```

2. 상세 화면 컴포넌트에 `liked` 상태(`useState(false)`)를 만들고, 제목 아래에 "좋아요: 켜짐/꺼짐"을 글자로 보여 준다. 아이콘은 Day 51에서 바꾼다.
3. 본문 카드 `View`를 `GestureDetector`로 감싼다. 제스처는 두 개를 만들어 `Gesture.Exclusive`로 묶는다.
   - 더블탭: `Gesture.Tap().numberOfTaps(2)`. 활성화되면 `liked`를 뒤집는다.
   - 싱글탭: `Gesture.Tap()`. 활성화되면 `console.log('single tap')`만 찍는다.
   - 두 제스처 모두 `setLiked`를 부르거나 상태에 관여하므로 `.runOnJS(true)`를 붙인다. 그 이유는 검증 단계 실험에서 확인한다.
4. 본문 카드 아래에 높이를 준 빈 `View`("여기를 좌우로 밀어 보세요" 글자 포함)를 만들고 이 영역에만 `Gesture.Pan()`을 붙인다. 이 영역은 Day 51에서 애니메이션 연습용 박스로 다시 쓴다.
   - `onUpdate`에서 `e.translationX`를 반올림해 `dragX` 상태에 저장하고 영역 안 글자로 보여 준다.
   - `onEnd`에서 `e.translationX`와 `e.velocityX`를 `console.log`로 찍는다.
   - 이 Pan도 상태를 바꾸므로 `.runOnJS(true)`를 붙인다.
5. `GestureDetector`의 직접 자식은 `Pressable`이 아닌 일반 `View`로 둔다. 같은 영역에 `Pressable`을 겹치면 어느 쪽이 터치를 가져가는지 헷갈리므로 이번 Day에는 피한다.

완료 기준

- [ ] `package.json`의 `react-native-gesture-handler` 버전이 `~2.28.0` 계열임을 확인했다
- [ ] `RootLayout`에서 `GestureHandlerRootView`가 가장 바깥에 있다
- [ ] 본문 카드를 두 번 탭하면 "좋아요" 표시가 바뀐다
- [ ] 본문 카드를 한 번만 탭하면 `single tap` 로그가 한 번 찍힌다
- [ ] 연습 영역을 좌우로 밀면 `dragX`가 실시간으로 바뀌고, 손을 떼면 `onEnd` 로그가 찍힌다
- [ ] 타입 오류와 `npm run lint` 경고가 없다

## 검증(10분)

확인할 동작

- 시뮬레이터에서 글 하나를 눌러 상세 화면으로 이동한다. 본문 카드를 천천히 한 번 탭하고 로그가 찍히는 시점을, 빠르게 두 번 탭했을 때의 동작을 각각 본다. 예측 1과 비교한다.
- 연습 영역을 천천히 밀었다 놓기, 빠르게 오른쪽/왼쪽으로 튕기기를 각각 하고 `velocityX` 부호와 크기를 기록한다. 예측 3과 비교한다.

일부러 깨뜨려 보는 실험

- 연습 영역 Pan에서 `.runOnJS(true)`를 지우고 `onUpdate`에 `setDragX`를 그대로 둔 채 화면에서 밀어 본다. 에러 메시지 원문을 아래에 적고(대략 `Tried to synchronously call a non-worklet function ... on the UI thread`로 시작한다. 정확한 문구는 직접 확인한다), 해결 방법을 두 가지 떠올려 본다(힌트: 함수를 UI 스레드에서 실행하지 않게 하는 방법). 확인 후 `.runOnJS(true)`를 되돌린다. 참고: https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting 의 "Tried to synchronously call a Remote Function" 절에서 원인과 해결책 두 가지를 확인할 수 있다.

> 에러 원문:
>
> 예측과 달랐던 점:

## 이해 점검 질문

1. `GestureHandlerRootView`를 `RootLayout` 안쪽의 일부 화면에만 두면 어떤 문제가 생기고, 왜 "앱 루트에 가깝게" 두라고 할까?
2. `Gesture.Exclusive(singleTap, doubleTap)`처럼 순서를 바꾸면 더블탭은 어떻게 될까? 왜 그럴까?
3. 제스처 콜백에서 `setState`를 직접 부르면 실패하는 이유는 무엇이고, 이를 피하는 방법 두 가지는 무엇일까?

<details>
<summary>정답</summary>

1. 제스처는 `GestureHandlerRootView` 안에서만 인식되고, 제스처 사이의 우선순위·동시 인식 같은 관계도 같은 root 안에서만 유효하다. 일부 화면에만 두면 그 밖의 화면에서는 `GestureDetector`가 조용히 동작하지 않고, 두 화면 사이에서 제스처 관계를 맺을 수도 없다. 그래서 모든 화면을 포함하는 최상단에 한 번만 둔다. 중첩된 root는 가장 바깥 것만 쓰이므로 여러 번 감싸도 이득이 없다.
2. 더블탭이 거의 인식되지 않는다. `Exclusive`는 앞에 적은 제스처가 우선이고 뒤 제스처는 앞 제스처가 실패해야 활성화된다. 싱글탭을 앞에 두면 첫 번째 탭에서 싱글탭이 성공해 버려 더블탭이 활성화될 기회가 없다. 그래서 더블탭을 앞에 두고, 싱글탭은 더블탭이 실패한 뒤(두 번째 탭이 오지 않을 때) 활성화되게 한다. 직접 순서를 바꿔 확인한다.
3. 제스처 콜백은 Reanimated가 설치되어 있으면 Babel 플러그인이 자동으로 worklet으로 바꿔 UI 스레드에서 실행한다. React의 `setState` 같은 일반 JS 함수는 UI 스레드에서 동기 호출할 수 없어 에러가 난다. 피하는 방법은 (1) 제스처에 `.runOnJS(true)`를 붙여 콜백 전체를 JS 스레드에서 실행하거나, (2) 콜백 안에서 `react-native-worklets`의 `scheduleOnRN(함수, 인자)`로 그 함수만 JS 스레드에 예약하는 것이다. (1)은 간단하지만 매 프레임 JS 스레드를 거치므로 애니메이션용 콜백에는 부적합하고, 오늘처럼 상태를 바꾸는 소수의 이벤트에 쓴다.

</details>

## 기록(5분)

배운 것 3줄:

1.
2.
3.

막힌 점:

## 커밋 단위 제안

- `feat: 앱 루트에 GestureHandlerRootView 추가`
- `feat: 글 상세에 더블탭 좋아요와 Pan 연습 영역 추가`

## 웹과 다른 점

웹은 브라우저가 터치·포인터 이벤트를 JS 이벤트 루프로 넘기고 CSS(`touch-action`)로 조정하지만, RN Gesture Handler는 네이티브가 UI 스레드에서 제스처를 인식하고 콜백도 기본적으로 UI 스레드에서 실행한다.
