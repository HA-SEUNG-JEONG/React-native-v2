# Day 11 · 11/10 (화) — 컴포넌트 분리: children, composition

## 오늘의 목표

`children`을 받는 `Card`와 `variant`를 받는 `AppButton`을 만들어, 화면 코드의 중복 JSX를 조합 가능한 컴포넌트로 바꾼다.

## 읽기(15분)

1. React 공식 문서, props 전달: https://react.dev/learn/passing-props-to-a-component
   - 확인할 사실: 태그 안에 중첩한 JSX는 그 컴포넌트의 `children` prop으로 전달된다. 감싸는 컴포넌트는 안에 무엇이 들어오는지 알 필요가 없다. `children`은 부모가 임의의 JSX로 채우는 "구멍"이다.
2. `FlatList` 문서: https://reactnative.dev/docs/0.81/flatlist
   - 확인할 사실: `ListHeaderComponent`, `ListEmptyComponent`는 컴포넌트 또는 React 요소를 받는다. 목록이 비었을 때 보일 화면을 컴포넌트로 따로 만들어 꽂을 수 있다는 뜻이다.
3. `Pressable` 문서: https://reactnative.dev/docs/0.81/pressable
   - 확인할 사실: `style`에 `({ pressed }) => ...` 함수를 주면 눌린 상태에 따라 스타일을 바꿀 수 있다. `AppButton`의 눌림 효과에 쓴다.

## 예측(10분)

1. `Card`가 `{children}`을 렌더하지 않고 빈 `View`만 반환한다면 `<Card><Text>안녕</Text></Card>`는 화면에 무엇을 보여 주는가?

> 내 예측:

2. `Card`가 `style={[styles.card, style]}`로 받은 `style`을 뒤에 합칠 때, 부모가 `style={{ padding: 0 }}`을 넘기면 `styles.card`의 `padding`과 어느 쪽이 적용되는가?

> 내 예측:

3. `Card`의 props 타입을 `{ style?: StyleProp<ViewStyle> }`로만 쓰고 `<Card><Text>안녕</Text></Card>`를 쓰면 `tsc`는 어떻게 반응하는가?

> 내 예측:

## 만들기(40분)

Day 10에서 만든 `components/LogItem.tsx`와 `app/index.tsx`의 반복되는 껍데기를 컴포넌트로 뽑는다.

새로 만들 파일:
- `components/Card.tsx` — 모서리가 둥글고 그림자(또는 테두리)가 있는 박스. `children`과 선택 `style`을 받는다. `PropsWithChildren`을 쓴다.
- `components/AppButton.tsx` — `title`, `onPress`, `variant`(`'primary' | 'danger'`), `disabled`를 받는 `Pressable` 버튼. 눌렸을 때 `opacity`가 변한다. RN 기본 `Button`과 이름이 겹치지 않게 `AppButton`으로 한다.
- `components/EmptyState.tsx` — `message: string`을 받아 가운데 정렬 안내 문구를 보여 준다.
- `components/PostCard.tsx` — Day 8에서 `app/index.tsx` 안에 만든 `memo` `PostCard`를 옮기고 바깥을 `Card`로 감싼다. props는 `post: Post`, `onPress: (id: number) => void`다. `app/index.tsx`에서는 이 파일을 import해 쓴다.

고칠 파일:
- `components/LogItem.tsx` — 가장 바깥을 `Card`로 감싼다. 제목, 본문 미리보기, 작성 시각은 `Card`의 `children`으로 넣는다.
- `app/index.tsx` — 저장 버튼을 `AppButton`으로 바꾼다. `FlatList`의 `ListEmptyComponent`에 `<EmptyState message="아직 기록이 없어요" />`를 꽂는다.

핵심 형태:

```tsx
type CardProps = PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}
```

완료 기준:
- [ ] `Card`, `AppButton`, `EmptyState`, `PostCard`가 각각 `components/` 아래 파일 하나씩이다
- [ ] `LogItem`의 바깥 껍데기가 `Card`다. 같은 스타일 객체를 `LogItem`에 다시 쓰지 않는다
- [ ] `AppButton`을 `variant="primary"`와 `variant="danger"`로 한 번씩 화면에 써 본다
- [ ] 목록이 비었을 때 `EmptyState`가 보이고, 글을 추가하면 사라진다
- [ ] `npx tsc --noEmit`이 오류 0개다

## 검증(10분)

- 시뮬레이터에서 글이 없을 때의 `EmptyState`, 글을 추가한 뒤의 `Card` 목록, `AppButton`을 누르고 있을 때의 눌림 효과를 차례로 본다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- 일부러 깨뜨려 보기: `Card`의 props 타입에서 `PropsWithChildren`을 빼고 `tsc`가 무엇을 말하는지 읽는다. 그다음 `<Card>안녕</Card>`처럼 문자열을 `Text` 없이 `children`으로 넣어 실행했을 때 시뮬레이터에 나오는 오류 문구를 적는다. 두 가지 모두 원래대로 되돌린다.

## 이해 점검 질문

1. `children`은 무엇이고, `Card`가 안에 무엇이 들어올지 몰라도 되는 이유는 무엇인가?
2. `Card`와 `AppButton`이 받은 `style`을 `[styles.card, style]`처럼 배열로 합칠 때 순서가 왜 중요한가?
3. `PropsWithChildren` 없이 `children`을 쓰면 왜 타입 오류가 나는가?

<details>
<summary>정답</summary>

1. 태그 안에 중첩한 JSX가 `children`이라는 prop으로 들어온다. `Card`는 그 자리를 `{children}`으로 그대로 렌더할 뿐 내용물의 종류에 의존하지 않는다. 그래서 `Card` 하나로 글 항목, 설정 항목, 안내 문구를 다 감쌀 수 있다. 이것이 상속이 아니라 조합(composition)으로 재사용하는 방식이다.
2. 스타일 배열은 뒤에 있는 값이 앞의 같은 속성을 덮어쓴다. 기본 스타일을 앞에, 부모가 넘긴 `style`을 뒤에 두어야 부모가 필요한 속성만 바꿀 수 있다. 순서를 뒤집으면 부모가 넘긴 값이 기본 스타일에 가려진다.
3. 함수 컴포넌트의 props 타입에는 `children`이 자동으로 들어 있지 않다. props 타입에 선언한 것만 받을 수 있으므로, 선언하지 않았는데 자식을 넘기면 타입이 맞지 않는다고 한다. `PropsWithChildren`은 `children?: ReactNode`를 props 타입에 더해 준다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: Card와 AppButton, EmptyState 컴포넌트 추가`
- `refactor: LogItem과 입력 화면에 공용 컴포넌트 적용`

## 웹과 다른 점

웹에서는 `<div>안녕</div>`처럼 문자열을 아무 요소에나 넣을 수 있지만, RN에서는 문자열을 반드시 `Text` 안에 넣어야 한다. 그래서 `Card`의 `children`에 문자열을 바로 넣으면 오류가 난다.
