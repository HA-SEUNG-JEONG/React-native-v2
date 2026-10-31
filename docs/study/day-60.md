# Day 60 · 1/18 (월) — jest-expo + Testing Library 기초

## 오늘의 목표

Daily Log에 `jest-expo`와 `@testing-library/react-native` 환경을 만들고, 순수 함수(reducer) 테스트 1개와 컴포넌트 테스트 1개를 통과시킨다.

## 읽기(15분)

1. [Expo — Unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)
   - 설치 명령이 `npx expo install jest-expo jest @types/jest --dev` 형태인지 확인한다.
   - `package.json`에 `"jest": { "preset": "jest-expo" }`와 `"test": "jest --watchAll"` 스크립트를 넣는다는 점, TypeScript면 `tsconfig.json`의 `types`에 `"jest"`를 추가한다는 점을 찾는다.
   - `react-test-renderer`가 React 19 이상을 지원하지 않아 deprecated이고, 그 자리를 `@testing-library/react-native`가 대신한다는 문장을 찾는다.
   - UI 검증에는 스냅샷 단위 테스트보다 E2E(Maestro)를 권장한다는 문장을 찾는다.
2. [React Native Testing Library — Quick Start](https://oss.callstack.com/react-native-testing-library/docs/start/quick-start)
   - `test-renderer`가 peer dependency이고 따로 설치해야 한다는 부분을 찾는다.
   - Jest matcher(`toBeOnTheScreen` 등)는 `@testing-library/react-native`를 import하면 자동으로 붙는다는 문장을 찾는다.
   - 확인할 버전: 최신 14.x 기준이다. 14.x는 React 19 이상과 Node.js `^22.13.0 || >=24`를 요구하고 `render`·`fireEvent`·`act`가 비동기다. 같은 사이트의 `Migration to 14.x` 문서에서 확인한다.
3. [RNTL — How should I query?](https://oss.callstack.com/react-native-testing-library/docs/guides/how-to-query)
   - `getBy*`, `queryBy*`, `findBy*`가 각각 "정확히 1개 단언", "0개 또는 1개", "비동기로 1개"라는 표를 찾는다.
   - `queryBy*`는 "없어야 하는 요소"를 확인할 때만 쓰고 `not.toBeOnTheScreen()`과 함께 쓴다는 문장을 찾는다.

## 예측(10분)

코드를 치기 전에 답을 적는다.

1. 테스트 파일이 하나도 없는 상태에서 `npm test`를 실행하면 무엇이 보일까?

   > 내 예측:

2. 화면에 없는 텍스트를 `screen.getByText('없는 글')`로 찾으면 테스트는 어떻게 될까? `screen.queryByText('없는 글')`은 무엇을 돌려줄까?

   > 내 예측:

3. RNTL 14에서 `render(<Card />)` 앞에 `await`를 빼고 바로 `screen.getByText(...)`를 호출하면 어떻게 될까?

   > 내 예측:

## 만들기(40분)

테스트 환경을 만들고 첫 테스트 2개를 작성한다. 앱 화면은 바꾸지 않는다.

**환경 준비**
- 먼저 `node -v`로 Node.js가 22.13 이상인지 확인한다. RNTL 14의 요구 사항이다.
- 설치(이 Day에서 처음 설치한다):

  ```bash
  npx expo install jest-expo jest @types/jest --dev
  npm install --save-dev @testing-library/react-native test-renderer@1.1
  ```

  `test-renderer`는 React 19.1에 맞는 `1.1` 라인을 고른다. 버전을 안 붙이면 더 높은 React용 라인이 깔려 peer dependency 충돌이 날 수 있다(RNTL 14 마이그레이션 문서의 "Recommended Test Renderer versions" 표).
- `package.json`에 `"test": "jest --watchAll"` 스크립트와 `"jest": { "preset": "jest-expo" }`를 추가한다.
- `tsconfig.json`의 `compilerOptions`에 `"types": ["jest"]`를 추가한다.
- 테스트 파일은 프로젝트 루트의 `__tests__/` 폴더에 둔다. `app/` 폴더 안에는 두지 않는다(라우트 폴더이기 때문이다).

**테스트 1: 순수 함수**
- 새 파일 `__tests__/logsReducer.test.ts`.
- 대상: `src/state/logsReducer.ts`의 `logsReducer`(Day 22에서 만든, 기록 목록 상태를 바꾸는 `useReducer`용 함수).
- 액션 2개 이상에 대해 "이전 state와 action을 넣으면 기대한 새 state가 나온다"를 확인한다. 컴포넌트 렌더가 필요 없다.

**테스트 2: 컴포넌트**
- 새 파일 `__tests__/PostCard.test.tsx`.
- 대상: Day 11의 `src/components/PostCard.tsx`(피드 탭의 목록 한 항목).
- 제목이 화면에 보이는지, 누르면 `onPress` 같은 콜백 prop이 1번 호출되는지 확인한다.
- 핵심 API 형태:

  ```tsx
  import { render, screen, userEvent } from '@testing-library/react-native';

  const user = userEvent.setup();
  await render(<PostCard {...props} />);
  await user.press(screen.getByText('제목'));
  expect(onPress).toHaveBeenCalledTimes(1);
  ```

  콜백은 `jest.fn()`으로 만든다.

완료 기준
- [ ] `node -v`가 22.13 이상이다.
- [ ] `npm test`가 watch 모드로 뜨고, 테스트 2개가 모두 통과한다.
- [ ] 테스트 파일이 `app/` 밖의 `__tests__/`에 있다.
- [ ] `getBy*`로 찾은 것과 `queryBy*`로 "없음"을 확인한 것이 각각 1개 이상 있다.
- [ ] 테스트 코드에 `test.skip`, `.only`가 없다.

## 검증(10분)

- `npm test`에서 `a`를 눌러 전체 테스트를 실행하고 초록색 2개를 확인한다.
- 예측 1~3과 실제 결과를 비교해 다른 지점을 적는다.

> 실제 결과 / 예측과 다른 지점:

**깨뜨려 보는 실험**: 컴포넌트 테스트에서 `render` 앞의 `await`를 지우고 실행한다. 에러 메시지 원문을 그대로 옮겨 적고, 어느 줄에서 실패하는지 본다. 그다음 `await`를 되돌린다.

## 이해 점검 질문

1. `getByText('없는 글')`과 `queryByText('없는 글')`은 요소가 없을 때 각각 어떻게 동작하고, 어느 쪽을 "없음 확인"에 써야 하는가?
2. 이 프로젝트가 `react-test-renderer` 대신 `@testing-library/react-native`(와 `test-renderer`)를 쓰는 이유는?
3. Expo 문서가 UI 검증에서 스냅샷 테스트보다 E2E를 권하는 이유를 추측해 보면?

<details>
<summary>정답</summary>

1. `getByText`는 요소가 정확히 1개가 아니면 에러를 던져 테스트가 실패한다. `queryByText`는 없으면 `null`을 돌려주고 던지지 않는다. 그래서 "없어야 한다"를 확인할 때는 `expect(screen.queryByText(...)).not.toBeOnTheScreen()`처럼 `queryBy*`를 쓴다. `getBy*`를 쓰면 요소가 없다는 사실 자체가 에러가 되어 의도를 표현할 수 없다.
2. `react-test-renderer`는 React 19 이상을 지원하지 않아 deprecated이다. Daily Log는 React 19.1이므로 후속 도구가 필요하다. RNTL은 사용자 관점 쿼리(텍스트·역할·라벨)와 React 19 호환 렌더러(`test-renderer`)를 제공한다.
3. 스냅샷은 렌더 결과 트리의 "문자열 모양"만 비교한다. 스타일을 조금만 바꿔도 깨지고, 실제 화면이 올바른지는 알려 주지 않는다. E2E는 실제 앱을 사용자처럼 조작해 동작을 확인하므로 UI 검증에 더 맞다는 취지다. 근거는 읽기 1의 Snapshot 절이다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: jest-expo와 Testing Library 테스트 환경 추가`
- `test: 기록 reducer와 글 카드 컴포넌트 첫 테스트`

## 웹과 다른 점

jsdom이 아니라 React Native의 host 컴포넌트 트리를 대상으로 하므로 `getByRole`은 `role`/`accessibilityRole` prop을 보고, DOM 클래스나 CSS 선택자는 쓸 수 없다.
