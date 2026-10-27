# Day 57 · 1/13 (수) — Error Boundary

## 오늘의 목표

클래스 기반 `AppErrorBoundary`로 피드 카드 하나의 렌더 오류가 목록 전체를 죽이지 않게 하고, expo-router의 라우트 `ErrorBoundary` export로 화면 단위 폴백을 만들어 두 방식의 범위 차이를 확인한다.

## 읽기(15분)

1. https://react.dev/reference/react/Component 의 "Catching rendering errors with an error boundary" 절
   - 확인할 사실: 에러 경계는 클래스 컴포넌트이고 `static getDerivedStateFromError(error)`(필수, 폴백을 그리도록 state를 돌려줌)와 `componentDidCatch(error, info)`(선택, 로깅 같은 부수 효과)를 정의한다. 이벤트 핸들러 안의 에러, `setTimeout` 같은 비동기 코드의 에러, 경계 컴포넌트 자신의 에러는 잡지 못한다. 함수 컴포넌트로 에러 경계를 쓰는 방법은 현재 없다.
2. https://docs.expo.dev/router/error-handling/
   - 확인할 사실: 라우트 파일에서 `ErrorBoundary`라는 이름으로 컴포넌트를 export하면 그 라우트가 에러 경계로 감싸지고, 컴포넌트는 `error`와 `retry` props를 받는다(타입은 `expo-router`의 `ErrorBoundaryProps`). export하지 않으면 에러는 가장 가까운 상위 `ErrorBoundary`로 올라간다. 문서 하단에 React Native LogBox가 `console.error`에도 뜨는 개발 중 불편이 적혀 있다.

## 예측(10분)

1. 피드의 한 카드(`PostCard`) 렌더 중에 `throw new Error('테스트')`가 나는데 어디에도 에러 경계가 없으면, 개발 모드에서 화면은 어떻게 될까?

> 내 예측:

2. `renderItem`이 반환하는 각 카드를 `AppErrorBoundary`로 감싸 두면, 카드 3번이 렌더 중에 던진 에러는 다른 카드와 목록 스크롤에 어떤 영향을 줄까?

> 내 예측:

3. 카드의 `onPress` 핸들러 안에서 같은 에러를 던지면 `AppErrorBoundary`의 폴백이 보일까?

> 내 예측:

## 만들기(40분)

1. `src/components/AppErrorBoundary.tsx`에 `AppErrorBoundary`를 만든다. 클래스 컴포넌트이고 TypeScript로 `Props`(`children`, `fallback`)와 `State`(`hasError`)를 정의한다.
   - `static getDerivedStateFromError()`는 `{ hasError: true }`를 돌려준다.
   - `componentDidCatch(error, info)`에서는 `console.error`로 `error`와 `info.componentStack`을 남긴다(실제 앱이라면 크래시 리포팅 서비스에 보낼 자리다).
   - 폴백에서 "다시 시도"를 누르면 `hasError`를 `false`로 되돌려 자식을 다시 렌더하게 한다.
2. 피드 탭(`app/(tabs)/index.tsx`)의 `FlatList` `renderItem`에서 각 `PostCard`를 `AppErrorBoundary`로 감싼다. 폴백은 작은 카드 모양의 "이 글을 표시할 수 없어요"와 "다시 시도" 버튼이다. 폴백 색은 Day 53의 `useTheme()` 토큰을 쓴다.
3. 같은 피드 탭 파일에서 라우트용 폴백도 export한다.

```tsx
import { type ErrorBoundaryProps } from 'expo-router';
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) { /* error.message와 retry 버튼 */ }
```

   `retry`를 누르면 무슨 일이 일어나는지는 직접 확인해 기록 칸에 적는다(문서에는 내부 동작 설명이 없다).
4. `PostCard`의 폴백과 라우트 폴백이 각각 언제 보이는지 구분되게 서로 다른 문구를 쓴다.
5. 선택: 루트 레이아웃 `app/_layout.tsx`에도 `ErrorBoundary`를 export해 앱 전체의 마지막 폴백을 둔다.

완료 기준

- [ ] 클래스 컴포넌트 `AppErrorBoundary`가 `getDerivedStateFromError`와 `componentDidCatch`를 갖는다
- [ ] 한 카드가 렌더 중 에러를 던져도 다른 카드가 정상 표시되고 목록 스크롤이 된다
- [ ] 카드 폴백의 "다시 시도"를 누르면 자식이 다시 렌더된다(원인이 남아 있으면 다시 폴백이 보인다)
- [ ] 피드 탭 파일이 `ErrorBoundary`를 export하고 `error.message`를 보여 준다
- [ ] 임시로 넣은 `throw` 코드를 모두 제거했다

## 검증(10분)

확인할 동작

- 개발 모드에서는 에러가 경계에 잡혀도 LogBox 오류 화면이 먼저 뜰 수 있다(문서의 LogBox 언급 참고). 오류 화면을 닫으면 폴백이 보이는지 확인하고, 앱 안에서 보인 것을 기록한다. 릴리스 빌드에서의 동작은 EAS Build를 다루는 Day 66 이후 확인 대상이므로 지금은 가정하지 않는다.
- "다시 시도"를 눌러 폴백이 다시 나오는지, 원인을 제거한 뒤 누르면 카드가 복구되는지 본다.

일부러 깨뜨려 보는 실험

- `PostCard`에 `post.id === 3`이면 렌더 중 에러를 던지는 줄을 임시로 넣고 카드 3번이 폴백으로 바뀌고 나머지 카드는 정상인지 본다. 이어서 같은 `throw`를 카드 `onPress` 안으로 옮겨 카드를 눌러 보고, 폴백이 보이는지와 화면에 무엇이 나타나는지 적는다. 예측 1, 2, 3과 비교한 뒤 임시 코드를 지운다.

> 실험 결과:

## 이해 점검 질문

1. 에러 경계가 잡지 못하는 에러 세 가지와, 그 에러를 처리하는 방법은 무엇일까?
2. 에러 경계를 함수 컴포넌트로 만들 수 없는 이유와, 클래스를 직접 쓰지 않고 해결하는 방법은 무엇일까?
3. 카드마다 감싼 `AppErrorBoundary`와 라우트의 `ErrorBoundary` export는 잡는 범위와 쓰임이 어떻게 다를까?

<details>
<summary>정답</summary>

1. 이벤트 핸들러 안의 에러, `setTimeout`·`requestAnimationFrame` 같은 비동기 코드의 에러, 경계 컴포넌트 자신의 에러는 잡지 못한다(React 문서). 이벤트 핸들러와 비동기 코드는 렌더 과정 밖에서 실행되어 React가 렌더 트리에서 에러를 추적하지 않기 때문이다. 이런 에러는 `try/catch`, Day 25~27에서 만든 로딩·에러 상태, TanStack Query의 `error`로 직접 처리하고 사용자에게 상태로 보여 준다.
2. 에러 경계는 `getDerivedStateFromError`·`componentDidCatch` 같은 클래스 생명주기 메서드로만 만들 수 있고, 같은 일을 하는 Hook이 아직 없다(React 문서). 직접 클래스를 쓰기 싫으면 문서가 언급하는 `react-error-boundary` 패키지를 쓸 수 있다. 이 카드는 의존성을 늘리지 않으려고 작은 클래스를 직접 쓴다.
3. 카드마다 감싼 경계는 그 카드의 자식만 보호하므로 한 카드가 죽어도 나머지 화면은 그대로 보인다. 라우트의 `ErrorBoundary` export는 그 라우트 화면 전체를 감싸고, export하지 않으면 에러가 가장 가까운 상위 경계로 올라간다. 그래서 세밀한 단위(카드)는 클래스 경계로, 화면 단위의 마지막 폴백은 라우트 export로 나눈다.

</details>

## 기록(5분)

배운 것 3줄:

1.
2.
3.

막힌 점:

## 커밋 단위 제안

- `feat: 피드 카드를 감싸는 AppErrorBoundary 추가`
- `feat: 피드 탭에 라우트 ErrorBoundary 폴백 추가`

## 웹과 다른 점

에러 경계 자체는 웹 React와 같지만, RN 개발 모드에서는 경계가 에러를 잡아도 LogBox 오류 화면이 먼저 뜰 수 있어 닫아야 폴백이 보인다.
