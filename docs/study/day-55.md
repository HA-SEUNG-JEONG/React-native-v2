# Day 55 · 1/11 (월) — 접근성: accessibilityLabel·role, 스크린 리더 확인

## 오늘의 목표

피드 카드, 글 상세의 좋아요 버튼, 기록 항목 삭제에 `accessibilityLabel`·`accessibilityRole`·`accessibilityState`·`accessibilityActions`를 붙여, 제스처 없이도 스크린 리더로 모든 기능을 쓸 수 있게 만든다.

## 읽기(15분)

1. https://reactnative.dev/docs/accessibility
   - 확인할 사실: 터치 가능한 요소는 기본적으로 `accessible`이고, `accessibilityLabel`을 주지 않으면 라벨은 자식 `Text` 내용을 공백으로 이어 붙여 만들어진다. `accessibilityRole`은 요소의 용도를 알려 주며 `button`, `header`, `image`, `switch` 같은 값이 있다. 같은 목적의 `role` 속성은 `accessibilityRole`보다 우선하고 `heading`, `img`처럼 웹식 이름을 쓴다. `accessibilityState`는 `disabled`, `selected`, `checked`, `busy`, `expanded`를 가진다. `accessibilityActions`를 정의하고 `onAccessibilityAction`을 구현하면 스크린 리더 사용자에게 스와이프 같은 제스처의 대체 동작을 제공할 수 있다. 하단의 테스트 절에서 시뮬레이터/에뮬레이터별 스크린 리더 사용 가능 여부를 확인한다.
2. https://reactnative.dev/docs/accessibilityinfo
   - 확인할 사실: `AccessibilityInfo.isScreenReaderEnabled()`와 `isReduceMotionEnabled()`는 Promise를 돌려주고, `addEventListener('screenReaderChanged' | 'reduceMotionChanged', handler)`는 구독 객체를 돌려주므로 `useEffect` 정리 함수에서 `remove()`를 불러야 한다.
3. https://reactnative.dev/docs/pressable
   - 확인할 사실: `hitSlop`은 요소 바깥으로 터치를 인식하는 영역을 넓히되, 부모 뷰의 경계 밖까지는 확장되지 않는다.

## 예측(10분)

1. 라벨 없이 `Ionicons` 하트 아이콘만 든 `Pressable`을 스크린 리더로 훑으면 무엇이라고 읽을까? 글자 `Text`가 든 피드 카드는 어떻게 읽을까?

> 내 예측:

2. 피드 카드 `Pressable` 안의 제목 `Text`와 작성자 `Text`는 스크린 리더에서 하나의 요소로 읽힐까, 둘로 나뉠까?

> 내 예측:

3. 스와이프로만 삭제되는 기록 행을 스크린 리더로 탐색하면 삭제할 수 있을까? 어떻게 알 수 있을까?

> 내 예측:

## 만들기(40분)

먼저 도구를 정한다. iOS 시뮬레이터에는 VoiceOver가 없다(문서에 명시). Xcode의 Accessibility Inspector(메뉴 이름은 Xcode 버전에 따라 다를 수 있다)로 시뮬레이터 요소의 라벨·트레이트를 확인한다. Android는 Play Store가 있는 에뮬레이터 이미지에 TalkBack을 설치해 설정에서 켠다. 어느 쪽이든 한 가지로 끝까지 확인하고, 사용한 도구를 기록 칸에 적는다.

1. 피드 카드(피드 탭의 카드 `Pressable`): 카드가 하나의 요소로 읽히게 하고 `accessibilityRole="button"`, `accessibilityHint`로 "상세 화면으로 이동" 같은 결과를 알린다. 자식 `Text`를 이어 붙인 기본 라벨이 어색하면 `accessibilityLabel`을 직접 쓴다("제목, 작성자 N번"처럼 읽을 순서를 정한다).
2. 글 상세 화면(Day 16에서 만든 동적 라우트 파일): 제목 `Text`에 `accessibilityRole="header"`를 준다. 이미지가 있다면 장식이면 숨기고 내용이면 라벨을 준다.
3. 좋아요 버튼 신설: Day 50의 더블탭은 스크린 리더 사용자에게 사실상 쓸 수 없는 제스처다. `LikeHeart`를 `Pressable`로 감싼 버튼을 만들어 `onPress`에서 `liked`를 뒤집는다.
   - `accessibilityRole="button"`, `accessibilityLabel="좋아요"`, `accessibilityState={{ selected: liked }}`.
   - 터치 영역이 작으면 `hitSlop`으로 넓힌다.
4. 기록 탭 항목 삭제: Day 52의 `SwipeableRow`가 감싼 행에 스와이프 대체 동작을 준다. Day 52를 건너뛰었다면 `SwipeableRow`가 없으므로 이 코드는 생략하고, 코드 블록 아래의 삭제 버튼 안내를 따른다.

```tsx
accessible
accessibilityActions={[{ name: 'delete', label: '삭제' }]}
onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === 'delete') onDelete(); }}
```

   Day 52를 건너뛰었다면 각 행의 삭제 버튼(없으면 이번에 추가)에 `accessibilityRole="button"`과 `accessibilityLabel="기록 삭제"`를 준다.
5. 선택(시간이 남을 때): `AccessibilityInfo.isReduceMotionEnabled()`로 모션 줄이기가 켜져 있는지 읽어, 켜져 있으면 `LikeHeart`의 팝 애니메이션 대신 즉시 전환한다. Reanimated의 `useReducedMotion()`은 앱 시작 시점의 값만 돌려주고 실행 중 설정 변경에는 리렌더되지 않는다는 점이 문서에 있으므로, 실행 중 변경을 반영하려면 `AccessibilityInfo`의 `reduceMotionChanged` 구독을 쓴다.

완료 기준

- [ ] 피드 카드가 하나의 버튼으로 읽히고 읽는 순서가 자연스럽다
- [ ] 상세 화면 제목이 헤더로 인식된다
- [ ] 좋아요를 더블탭 없이 버튼으로 켜고 끌 수 있고, 켜짐 상태가 스크린 리더/인스펙터에 전달된다
- [ ] 아이콘만 있는 모든 `Pressable`에 라벨이 있다
- [ ] 삭제를 스와이프 없이 스크린 리더의 동작 메뉴(또는 삭제 버튼)로 수행할 수 있다
- [ ] 사용한 확인 도구와 확인한 요소의 라벨/트레이트를 기록 칸에 적었다

## 검증(10분)

확인할 동작

- Accessibility Inspector(또는 TalkBack)로 피드 카드, 상세 제목, 좋아요 버튼, 기록 행을 하나씩 가리켜(또는 한 번씩 이동해) 라벨, 역할(트레이트), 상태, 동작 목록이 의도대로인지 본다. 예측 1, 2와 비교한다.
- 좋아요 버튼을 켠 뒤 상태 표시가 바뀌는지, 기록 행에서 삭제 동작이 목록에 나타나는지 확인한다. 예측 3과 비교한다.

일부러 깨뜨려 보는 실험

- 좋아요 `Pressable`에서 `accessibilityLabel`을 지우고 같은 요소를 다시 가리켜(또는 이동해) 읽는 내용이 어떻게 바뀌는지 적는다. 그 다음 `accessibilityState`만 지우고 켜짐/꺼짐이 전달되는지 본다. 확인 후 둘 다 되돌린다.

> 실험 결과:

## 이해 점검 질문

1. `accessibilityLabel`을 주지 않은 `Pressable` 카드는 스크린 리더가 무엇이라고 읽고, 그 기본 동작이 왜 충분하지 않은 경우가 있을까?
2. `accessibilityRole`과 `accessibilityState`는 각각 무엇을 알려 주고, 좋아요 버튼에는 어떻게 함께 쓰일까?
3. 스와이프 삭제 행에 `accessibilityActions`를 추가해야 하는 이유는 무엇이고, 이를 구현하는 두 가지(속성)는 무엇일까?

<details>
<summary>정답</summary>

1. 터치 가능한 요소는 기본적으로 접근 가능하며 라벨은 자식 `Text` 내용을 공백으로 이어 붙여 만든다. 카드 안의 텍스트 순서가 읽기 좋으면 충분하지만, 아이콘만 있거나 "N번" 같은 약어·숫자만 있어서 문장이 되지 않거나, 시각적 배치와 읽는 순서가 다르면 의미가 전달되지 않는다. 이럴 때 `accessibilityLabel`로 읽을 문장을 직접 준다.
2. `accessibilityRole`은 요소의 용도(버튼, 헤더 등)를, `accessibilityState`는 현재 상태(선택됨, 비활성 등)를 알려 준다. 좋아요 버튼은 역할 `button`과 상태 `{ selected: liked }`를 함께 줘서 "좋아요, 버튼, 선택됨"처럼 전달되게 한다. 라벨을 `liked`에 따라 바꾸면 상태가 중복 전달될 수 있으므로 하나를 고른다.
3. 스와이프는 화면을 눈으로 보고 손가락으로 끌 수 있다는 가정에서 만든 제스처인데, 스크린 리더는 자체 제스처(스와이프로 이동, 더블탭으로 활성화)를 쓰기 때문에 같은 동작을 수행할 수 없다. 그래서 같은 기능을 `accessibilityActions`(동작 이름·라벨 목록)로 노출하고, `onAccessibilityAction`에서 `event.nativeEvent.actionName`을 보고 실제 삭제를 수행한다. 두 속성을 모두 구현해야 동작한다.

</details>

## 기록(5분)

사용한 확인 도구:

배운 것 3줄:

1.
2.
3.

막힌 점:

## 커밋 단위 제안

- `feat: 피드 카드와 상세 화면에 접근성 라벨과 역할 추가`
- `feat: 좋아요 버튼 추가로 더블탭 없이 좋아요 토글`
- `feat: 기록 항목 삭제에 접근성 동작 추가`

## 웹과 다른 점

웹은 시맨틱 HTML(`button`, `h1`)과 `aria-*`가 접근성의 기본이지만, RN은 모든 것이 `View`/`Text`라서 `accessibilityRole`·`accessibilityLabel` 같은 속성을 직접 붙여야 하고 `role`은 웹식 이름을 쓰는 보조 속성이다.
