# Day 62 · 1/20 (수) — 리렌더 측정과 React Compiler

## 오늘의 목표

피드 탭에 검색 입력을 얹고, 글 카드가 입력할 때마다 다시 렌더되는 횟수를 React Compiler를 켠 경우와 끈 경우로 측정해 비교한다.

## 읽기(15분)

1. [React Native DevTools](https://reactnative.dev/docs/0.81/react-native-devtools)
   - 패널 구성(Console, Sources, Memory, React Components, React Profiler)을 확인한다.
   - React Components 패널 설정(톱니바퀴)의 "Highlight updates when components render" 항목이 리렌더를 눈으로 보여 준다는 문장을 찾는다.
   - React Compiler로 최적화된 컴포넌트에 "Memo" 배지가 표시된다는 문장을 찾는다.
2. [Expo — React Compiler](https://docs.expo.dev/guides/react-compiler/)
   - 켜는 방법이 `app.json`의 `expo.experiments.reactCompiler: true`이고 SDK 54에서는 Babel 설정이 자동이라는 점을 확인한다.
   - 클래스 컴포넌트는 최적화되지 않고 `node_modules`는 대상이 아니라는 제한을 찾는다.
   - 특정 함수를 제외하는 `"use no memo"` 지시어와 `babel.config.js`를 바꾼 뒤 `npx expo start --clear`가 필요하다는 문장을 찾는다.
   - 컴파일러가 켜져 있으면 `useCallback`, `useMemo`, `React.memo`를 제거할 수 있다는 문장을 찾는다.
3. [React — `<Profiler>`](https://react.dev/reference/react/Profiler)
   - `onRender(id, phase, actualDuration, baseDuration, ...)`의 각 인자 뜻을 확인한다. 특히 `actualDuration`은 이번 업데이트에 실제로 걸린 시간, `baseDuration`은 메모이제이션 없이 전체를 다시 렌더한다고 가정한 시간이다.
   - 프로덕션 빌드에서는 기본으로 비활성화된다는 문장을 찾는다.

## 예측(10분)

글 카드는 인라인 `onPress={() => ...}`를 prop으로 받고, `React.memo`와 `useCallback`은 쓰지 않았다고 가정한다.

1. 검색창에 글자 1개를 입력할 때 화면에 보이는 글 카드의 `render` 로그가 몇 번 찍힐까? (컴파일러 ON일 때 / OFF일 때 각각)

   > 내 예측:

2. 같은 상황에서 `Profiler`의 `actualDuration`은 `baseDuration`보다 작을까, 비슷할까, 클까? (ON / OFF 각각)

   > 내 예측:

3. 개발 모드에서 잰 ms 숫자를 그대로 "앱이 이만큼 빠르다"고 말해도 될까?

   > 내 예측:

## 만들기(40분)

**기능 추가: 피드 검색**
- 파일: 피드 탭 화면(Day 25~32에서 `FlatList`로 글 목록을 그리는 화면 파일).
- 화면 상단에 `TextInput`(Day 5에서 쓴 방식)을 두고 `query` state를 만든다. 제목에 `query`가 포함된 글만 `FlatList`의 `data`로 넘긴다.
- 글 카드(Day 11에서 만든 컴포넌트)에는 `onPress={() => ...}` 형태의 인라인 함수를 그대로 둔다.

**측정 준비 (임시 코드, 커밋 전에 지운다)**
- 글 카드 함수 본문 맨 위에 `console.log('render PostCard', 글.id)`를 넣는다.
- `FlatList`를 `<Profiler id="feed" onRender={...}>`로 감싸고, `onRender`에서 `phase`, `actualDuration`, `baseDuration`을 `console.log`로 찍는다.
- 로그는 DevTools Console에서 본다(Metro 터미널에서 `j`).

**측정 절차**
1. 컴파일러 ON(템플릿 기본값): 검색창을 비운 상태에서 로그를 지우고 글자 5개를 입력한다. `PostCard` 로그 수와 마지막 `actualDuration`을 표에 적는다.
2. `app.json`의 `expo.experiments.reactCompiler`를 `false`로 바꾸고 `npx expo start --clear`로 재시작한 뒤 같은 입력을 반복한다.
3. DevTools의 React Components 패널에서 "Highlight updates when components render"를 켜고 두 조건에서 어느 카드가 깜빡이는지 본다. 컴파일러 ON일 때 글 카드에 Memo 배지가 보이는지도 확인한다.
4. 측정 후 `reactCompiler`를 `true`로 되돌리고 임시 로그와 `Profiler`를 지운다.

| 조건 | 글자 5개 입력 시 PostCard 로그 수 | 마지막 actualDuration (ms) | Memo 배지 |
|---|---|---|---|
| Compiler ON | | | |
| Compiler OFF | | | |

완료 기준
- [ ] 피드 탭에 검색 입력이 있고, 입력하면 목록이 제목 기준으로 걸러진다.
- [ ] 위 표의 두 행이 모두 채워져 있다.
- [ ] 두 조건에서 어느 카드가 하이라이트되는지 한 문장으로 적었다.
- [ ] `experiments.reactCompiler`가 `true`로 돌아와 있다.
- [ ] 임시 `console.log`와 `Profiler`가 커밋에 남아 있지 않다.

## 검증(10분)

- 예측 1~3과 표의 실제 값을 비교해 다른 지점을 적는다. 숫자가 흔들리면 같은 조건에서 2번 측정한다.
- 개발 모드 숫자의 한계를 한 문장으로 적는다(React Native 성능 문서에서 개발 모드와 릴리스 빌드의 차이를 확인한다: https://reactnative.dev/docs/0.81/performance ).

> 실제 결과 / 예측과 다른 지점:

**깨뜨려 보는 실험**: 컴파일러를 ON으로 되돌린 뒤, 글 카드 컴포넌트 함수 본문 첫 줄에 `'use no memo'`를 넣고 같은 입력을 반복한다. 로그 수와 Memo 배지가 어떻게 달라지는지 적고, 실험 뒤 지시어를 지운다.

## 이해 점검 질문

1. `actualDuration`이 `baseDuration`보다 크게 작다는 것은 무엇을 뜻하는가?
2. React Compiler가 켜져 있으면 인라인 함수를 prop으로 넘겨도 글 카드가 덜 렌더되는 이유는? 그래도 컴파일러가 도와주지 못하는 경우는?
3. 개발 모드에서 잰 렌더 시간을 앱 성능의 증거로 쓰면 안 되는 이유는?

<details>
<summary>정답</summary>

1. 메모이제이션이 효과를 내고 있다는 뜻이다. `baseDuration`은 최적화 없이 서브트리 전체를 다시 렌더한다고 가정한 최악의 시간이고, `actualDuration`은 이번 업데이트에서 실제로 렌더한 시간이다. 변하지 않은 하위 컴포넌트가 건너뛰어졌다면 두 값의 차이가 크다.
2. 컴파일러가 컴포넌트와 그 안의 값(인라인 함수 포함)을 입력이 바뀔 때만 다시 만들도록 자동으로 캐시한다. 그래서 `onPress`가 매 렌더 새 함수처럼 보여도 캡처한 값이 같으면 같은 참조가 재사용되어 자식이 건너뛰어진다. 문서가 밝힌 제한은 클래스 컴포넌트는 최적화되지 않고 `node_modules`는 대상이 아니라는 점, 그리고 `"use no memo"`로 제외한 함수다. 컴파일러가 React의 규칙을 어기는 코드를 안전하게 최적화하지 못할 수 있으므로 `react-compiler-healthcheck`로 확인한다.
3. 개발 모드(`dev=true`)에서는 경고·에러 메시지를 위한 추가 작업 때문에 JS 성능이 크게 떨어지고, `<Profiler>`도 프로덕션에서는 기본 비활성화되어 있다. 개발 모드의 절대 ms는 사용자가 겪는 속도와 다르다. 같은 환경에서 조건만 바꾼 상대 비교(오늘의 ON/OFF)는 의미가 있지만, 실제 성능 주장은 릴리스에 가까운 빌드에서 측정해야 한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 피드 탭에 제목 검색 입력 추가`
- `docs: React Compiler ON/OFF 리렌더 측정 결과 기록`

## 웹과 다른 점

웹 React처럼 브라우저의 React DevTools 확장을 쓰지 않고, Hermes 앱에 연결되는 React Native DevTools의 React Components/Profiler 패널로 렌더를 측정한다.
