# Day 6 · 11/3 (화) — KeyboardAvoidingView, Keyboard API, 플랫폼별 키보드 차이

## 오늘의 목표

키보드가 올라와도 기록 작성 폼이 가려지지 않게 하고, 제목에서 다음 칸으로 이동·저장 후 키보드 닫기를 처리한다.

## 읽기(15분)

1. https://reactnative.dev/docs/0.81/keyboardavoidingview
   - 확인할 사실: `behavior`는 `'height'`, `'position'`, `'padding'` 중 하나이며 iOS와 Android 모두 지정하는 것이 권장된다. `keyboardVerticalOffset`은 화면 위쪽에서 이 뷰까지의 거리(예: 헤더가 있을 때)다. `contentContainerStyle`은 `behavior='position'`일 때만 쓴다.
2. https://reactnative.dev/docs/0.81/keyboard
   - 확인할 사실: `Keyboard.dismiss()`는 활성 키보드를 닫고 포커스를 없앤다. `addListener`는 구독 객체를 돌려준다. `keyboardWillShow`·`keyboardWillHide`는 iOS용이고 Android에서는 `keyboardDidShow`·`keyboardDidHide`만 쓸 수 있다는 주의 문장을 찾는다. 구독 해제는 이 페이지에 `remove()`가 따로 문서화돼 있지 않으니 문서에서 확인 필요하다. 코드에서는 `subscription.remove()`로 쓴다.
3. https://reactnative.dev/docs/0.81/textinput
   - 확인할 사실: `returnKeyType`의 공통 값은 `done`, `go`, `next`, `search`, `send`다. `onSubmitEditing`은 키보드의 제출 키를 눌렀을 때 호출된다. 한 줄 입력에서 `submitBehavior`가 정해지지 않으면 제출 시 포커스가 해제(`blurAndSubmit`)된다. `keyboardType`으로 키보드 종류를 정한다. 포커스는 `focus()`로 옮긴다.

## 예측(10분)

1. 하단 근처의 `TextInput`을 `KeyboardAvoidingView` 없이 두고 키보드를 올리면 입력창이 보일까? iOS와 Android가 같을까?
   > 내 예측:
2. 키보드가 올라와 있는 상태에서 `ScrollView` 안의 저장 버튼을 처음 탭하면 저장될까?
   > 내 예측:
3. 제목 입력창에서 키보드의 제출 키(return)를 누르면 기본으로 어떤 일이 일어날까?
   > 내 예측:

## 만들기(40분)

Day 5에서 만든 `app/index.tsx`의 입력 폼(제목·본문 `TextInput`, 저장 `Pressable`)을 키보드 친화적으로 고친다.

1. 화면 전체(`ScrollView`)를 `KeyboardAvoidingView`로 감싸고 `style={{ flex: 1 }}`을 준다. `behavior`는 `Platform.select`로 iOS는 `'padding'`, Android는 `'height'`로 시작한다. 헤더 높이만큼 어긋나면 `keyboardVerticalOffset`으로 맞춘다.
2. `ScrollView`에 `keyboardShouldPersistTaps="handled"`를 준다.
3. 제목 `TextInput`에 `returnKeyType="next"`를 주고 `onSubmitEditing`에서 본문 `TextInput`으로 포커스를 옮긴다. 본문 `TextInput`에 `useRef<TextInput>(null)`로 만든 ref를 달고 `ref.current?.focus()`를 호출한다.
4. 저장 `onPress`의 마지막에 `Keyboard.dismiss()`를 호출한다.
5. 키보드 높이를 로그로 확인하는 도전(선택): `useEffect`는 Day 13에서 정식으로 배우므로 아래 형태를 그대로 쓴다.
   ```tsx
   useEffect(() => {
     const sub = Keyboard.addListener('keyboardDidShow', (e) => console.log(e.endCoordinates.height));
     return () => sub.remove();
   }, []);
   ```
6. iOS 시뮬레이터에서 화면 키보드가 안 보이면 하드웨어 키보드가 연결된 상태다. Simulator 메뉴의 I/O → Keyboard → Toggle Software Keyboard로 켠다.

완료 기준:
- [ ] 본문 입력창을 눌러 키보드가 올라와도 본문 입력창과 저장 버튼이 키보드 위로 보인다(iOS 시뮬레이터)
- [ ] 제목에서 제출 키를 누르면 본문으로 포커스가 이동한다
- [ ] 키보드가 올라온 상태에서 저장 버튼을 첫 탭에 바로 저장할 수 있다
- [ ] 저장 후 키보드가 닫힌다
- [ ] Android 에뮬레이터가 있다면 `behavior`를 바꿔 가며 가려짐 여부를 확인하고 결과를 기록 칸에 적었다

> 문서에서 확인 필요: 이 템플릿은 `app.json`에 `android.edgeToEdgeEnabled: true`가 켜져 있다. Android에서 edge-to-edge와 `android.softwareKeyboardLayoutMode`(기본 `resize`)가 `KeyboardAvoidingView`와 어떻게 상호작용하는지는 읽은 문서에 없다. 에뮬레이터에서 `behavior`를 `'height'`, `'padding'`, 지정 안 함으로 바꿔 직접 관찰한다.

## 검증(10분)

- 예측 1번: iOS 시뮬레이터에서 `KeyboardAvoidingView`를 임시로 `View`로 바꿔 본문 입력창이 가려지는지 본다. Android가 있다면 같은 실험을 한다.
- 예측 3번: `returnKeyType`과 `onSubmitEditing`을 지우고 제출 키를 눌러 포커스가 어떻게 되는지 본다.
- 실험: `ScrollView`의 `keyboardShouldPersistTaps="handled"`를 지우고, 키보드가 올라온 상태에서 저장 버튼을 탭해 본다. 첫 탭에 저장되는지 확인하고 되돌린다.
  > 관찰:

| 예측 | 실제 | 다른 이유 |
|---|---|---|
| 1 |  |  |
| 2 |  |  |
| 3 |  |  |

## 이해 점검 질문

1. `KeyboardAvoidingView`의 `behavior` 값 세 가지는 각각 무엇을 바꾸고, 왜 플랫폼마다 다른 값을 쓰는가?
2. `keyboardWillShow`와 `keyboardDidShow`는 어떻게 다르고, 어느 이벤트를 Android에서 쓸 수 있는가?
3. 키보드가 올라온 상태에서 저장 버튼을 처음 탭하면 저장되지 않는 이유와 해결 방법은?

<details><summary>정답</summary>

1. `height`는 뷰의 높이를 줄이고, `padding`은 아래쪽 padding을 늘리고, `position`은 뷰의 위치를 위로 옮긴다(`contentContainerStyle`은 `position`일 때만 쓴다). 키보드와 화면 크기를 처리하는 방식이 iOS와 Android에서 달라서, 한 값이 두 플랫폼에서 같은 결과를 내지 않는다. 문서도 두 플랫폼 모두 `behavior`를 지정하라고 하고, 보통 `Platform.select`로 나눈다. 정확한 조합은 에뮬레이터와 시뮬레이터에서 확인한다.
2. `Will`은 키보드 애니메이션이 시작되기 직전, `Did`는 표시가 끝난 뒤에 호출된다. 문서는 Android에서 `keyboardDidShow`와 `keyboardDidHide`만 쓸 수 있다고 안내한다. 그래서 두 플랫폼에서 동작하는 코드에는 `Did` 이벤트를 쓴다.
3. `ScrollView`의 `keyboardShouldPersistTaps` 기본값은 `never`라서, 포커스된 입력창 바깥을 탭하면 키보드만 닫히고 자식은 탭을 받지 못한다. `'handled'`로 하면 자식(버튼)이 처리한 탭은 키보드를 유지하면서 그대로 전달된다. `'always'`는 모든 탭을 자식에게 넘긴다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 키보드가 폼을 가리지 않도록 KeyboardAvoidingView 적용`
- `feat: 제목에서 본문으로 포커스 이동, 저장 후 키보드 닫기`

## 웹과 다른 점

웹 브라우저는 입력창이 키보드에 가려지지 않게 알아서 스크롤해 주지만, RN은 키보드를 앱 레이아웃이 직접 피해야 하고 그 방식이 iOS와 Android에서 다르다.
