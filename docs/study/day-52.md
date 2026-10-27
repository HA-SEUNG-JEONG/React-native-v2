# Day 52 · 1/6 (수) — 제스처 + Reanimated 결합(스와이프 삭제)

> 건너뛰기 가능: 삭제는 항목의 삭제 버튼으로도 같은 기능을 얻을 수 있고, 이후 Day는 이 스와이프 구현에 의존하지 않는다. 건너뛰면 읽기만 한다.

## 오늘의 목표

기록 탭 목록의 각 항목을 왼쪽으로 밀어 삭제하는 `SwipeableRow`를 `Gesture.Pan()`, shared value, `withTiming` 콜백, `scheduleOnRN`으로 만들고, 세로 스크롤과 충돌하지 않게 제스처 활성화 조건을 설정한다.

## 읽기(15분)

1. https://docs.swmansion.com/react-native-gesture-handler/docs/2.x/gestures/pan-gesture (Day 50에서 읽은 페이지의 Config 절을 다시 본다)
   - 확인할 사실: `activeOffsetX`는 "이 범위 안의 움직임은 활성화하지 않고, 범위를 벗어나면 활성화"한다. `failOffsetY`는 "활성화 전에 이 범위를 벗어나면 제스처를 실패 처리"한다. 두 옵션 모두 숫자 하나 또는 `[시작, 끝]` 쌍을 받는다.
2. https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming
   - 확인할 사실: 세 번째 인자 콜백은 `finished`를 받고, 애니메이션이 취소되면 `false`, 아니면 `true`다. 기본 `duration`은 300밀리초다.
3. https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnRN
   - 확인할 사실: `scheduleOnRN(함수, ...인자)`는 UI 스레드(worklet 런타임)에서 React Native(JS) 런타임으로 함수 실행을 예약한다. 상태 갱신이나 reducer `dispatch`처럼 JS 쪽 함수를 부를 때 쓴다. 이전 자료에는 `runOnJS(fn)(...인자)`가 자주 나오는데, SDK 54의 worklets 0.5 소스에서는 `runOnJS`에 "`scheduleOnRN`을 쓰라"는 deprecated 표시가 붙어 있다. 둘이 같은 일을 한다는 것만 알고 이 카드는 `scheduleOnRN`을 쓴다.

## 예측(10분)

1. `activeOffsetX`와 `failOffsetY`를 아무것도 주지 않은 Pan을 FlatList 행에 붙이면 목록의 세로 스크롤은 어떻게 될까?

> 내 예측:

2. 행을 삭제 임계값(예: 80)보다 덜 밀고 손을 떼면 행은 어떻게 움직일까? 임계값을 넘겨서 놓으면?

> 내 예측:

3. 삭제 애니메이션이 끝나기 전에 사용자가 같은 행을 다시 잡아 끌면 `withTiming` 콜백의 `finished`는 무엇일까?

> 내 예측:

## 만들기(40분)

기록 탭(`app/(tabs)/write.tsx`)의 기록 목록 `FlatList` 각 행을 스와이프 삭제 가능하게 만든다. 새 컴포넌트는 `src/components/SwipeableRow.tsx`의 `SwipeableRow({ onDelete, children })`다. 삭제는 Day 22의 `removed` 액션과 Day 42의 `deletePhoto`를 부르는 기존 삭제 핸들러를 `onDelete`로 넘긴다.

1. `SwipeableRow`가 하는 일
   - 바깥 `View`(배경): 오른쪽 끝에 "삭제" 글자를 두고 위험을 뜻하는 배경색을 준다. 행이 밀리면 이 배경이 드러난다.
   - 안쪽 `Animated.View`(내용): `children`을 담고 `translateX` shared value를 `useAnimatedStyle`로 연결한다.
2. Pan 설정: 가로 이동이 일정 거리 이상일 때만 활성화하고, 세로로 먼저 움직이면 실패시켜 `FlatList`의 세로 스크롤이 동작하게 한다.

```tsx
Gesture.Pan()
  .activeOffsetX([-10, 10])
  .failOffsetY([-10, 10])
```

3. 콜백
   - `onUpdate`: `translateX.value = Math.min(0, e.translationX)`로 왼쪽으로만 밀리게 한다.
   - `onEnd`: `e.translationX`가 `-80`(상수로 둔다)보다 작으면 `withTiming(-화면너비, { duration: 200 }, 콜백)`으로 밖으로 밀어내고, 콜백에서 `finished`일 때만 `scheduleOnRN(onDelete)`를 부른다. 아니면 `withSpring(0)`으로 되돌린다. 화면 너비는 `useWindowDimensions().width`(Day 56에서 더 자세히 다룬다)로 얻는다.
   - `scheduleOnRN`은 `react-native-worklets`에서 가져온다. 이 패키지는 템플릿에 이미 있다.
4. `children`으로 Day 10의 `LogItem`(`Pressable`)을 그대로 넣고, 탭과 가로 스와이프가 둘 다 동작하는지 검증에서 확인한다.
5. 기록 목록 `FlatList`의 `renderItem`에서 각 행을 `SwipeableRow`로 감싼다. `keyExtractor`가 기록의 고유 id를 쓰는지 확인한다. index를 키로 쓰면 삭제 후 다른 행에 애니메이션 값이 남을 수 있다.

완료 기준

- [ ] 행을 왼쪽으로 밀면 손가락을 따라 움직이고 뒤에 "삭제" 배경이 보인다
- [ ] 임계값 안쪽에서 놓으면 스프링으로 제자리로 돌아온다
- [ ] 임계값을 넘겨서 놓으면 행이 밖으로 사라진 뒤 목록에서 기록이 삭제된다
- [ ] 목록을 세로로 스크롤할 때 행이 가로로 딸려 움직이지 않는다
- [ ] 오른쪽으로 밀어도 행이 오른쪽으로 움직이지 않는다
- [ ] 삭제 후 앱을 다시 열어도(Day 42의 `saveLogs`로) 삭제 상태가 유지된다.

## 검증(10분)

확인할 동작

- 시뮬레이터에서 기록 탭을 열고 기록을 여러 개 만든 뒤, 한 행을 천천히 왼쪽으로 밀었다 되돌리기, 임계값을 넘겨 삭제하기, 목록 세로 스크롤하기를 차례로 한다. 예측 2와 비교한다.
- 행을 가볍게 탭하면 `LogItem`의 `onPress`(기록 상세 이동)가 동작하고, 가로로 밀면 스와이프가 동작하는지 둘 다 확인한다. Day 46(건너뛰기 가능)을 건너뛰어 기록 상세 화면(`app/log/[id].tsx`)이 없다면 이동 확인은 생략한다. 대신 기록 탭 목록에서만 확인한다: 행을 탭하는 동안 행이 가로로 딸려 움직이지 않고, 탭 직후 바로 가로로 밀면 스와이프가 정상 시작되는지 본다.
- 삭제 직후 아래 행들이 점프하듯 올라오는지 본다. 이번 Day에는 이를 부드럽게 만들지 않는다. 눈에 띄는 점을 기록 칸에 적어 둔다.

일부러 깨뜨려 보는 실험

- `activeOffsetX`와 `failOffsetY` 두 줄을 지우고 목록을 세로로 스크롤해 본다. 어떤 일이 일어나는지 적은 뒤 두 줄을 되돌린다. 예측 1과 비교한다.

> 실험 결과:

## 이해 점검 질문

1. `activeOffsetX([-10, 10])`과 `failOffsetY([-10, 10])`은 각각 무슨 뜻이고, 둘을 같이 쓰면 스크롤 가능한 목록 안에서 어떻게 동작할까?
2. `withTiming`의 콜백에서 삭제 함수를 직접 부르지 않고 `scheduleOnRN`으로 감싸는 이유는 무엇일까?
3. 삭제 콜백에서 `finished`가 `true`일 때만 삭제하는 이유는 무엇일까?

<details>
<summary>정답</summary>

1. `activeOffsetX([-10, 10])`은 가로로 10 포인트 안쪽 움직임은 무시하고 그 범위를 벗어나야 Pan이 활성화된다는 뜻이다. `failOffsetY([-10, 10])`은 활성화되기 전에 세로로 10 포인트를 벗어나면 Pan을 실패 처리한다는 뜻이다. 합치면 가로로 먼저 움직이면 스와이프가 시작되고 세로로 먼저 움직이면 Pan이 빠져 `FlatList`가 스크롤을 가져간다. 대각선으로 시작할 때는 먼저 범위를 벗어나는 축이 이긴다.
2. 이 콜백은 애니메이션이 끝날 때 UI 스레드에서 worklet으로 실행된다. `onDelete`는 reducer `dispatch`를 부르는 일반 JS 함수라서 UI 스레드에서 동기 호출하면 "non-worklet function" 에러가 난다. `scheduleOnRN`이 그 함수를 JS(React Native) 런타임에서 실행하도록 예약해 준다.
3. 애니메이션이 취소되면 콜백이 `finished === false`로 불린다. 삭제 애니메이션 도중에 사용자가 행을 다시 잡아 끌면 `onUpdate`가 값을 덮어써 애니메이션이 취소되는데, 이때 삭제를 호출하면 사용자가 되돌리려던 기록이 지워진다. 끝까지 정상 종료된 경우에만 삭제한다.

</details>

## 기록(5분)

배운 것 3줄:

1.
2.
3.

막힌 점:

## 커밋 단위 제안

- `feat: 기록 항목 스와이프 삭제 SwipeableRow 추가`
- `refactor: 기록 목록 행을 SwipeableRow로 감싸 삭제 reducer 연결`

## 웹과 다른 점

웹은 스크롤 중인지 드래그 중인지를 `touch-action` 같은 CSS와 이벤트 `preventDefault`로 정하지만, RN은 네이티브 제스처 인식기끼리 `activeOffset`·`failOffset`·우선순위로 누가 터치를 가져갈지 정한다.
