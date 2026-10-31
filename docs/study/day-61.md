# Day 61 · 1/19 (화) — 컴포넌트·훅 테스트: mock, 비동기

## 오늘의 목표

`fetch`를 mock해서 Daily Log 피드의 API 클라이언트·`usePosts` 훅·화면이 로딩·성공·에러 상태에서 기대대로 동작함을 테스트로 고정한다.

## 읽기(15분)

1. [RNTL — Async utilities](https://oss.callstack.com/react-native-testing-library/docs/api/misc/async)
   - RNTL 문서는 `callstack.github.io`에서 `oss.callstack.com/react-native-testing-library/...`로 이동했다(2026-10-27 확인). 이 카드의 링크는 이동한 주소로 적어 두었다.
   - `findBy*`가 "비동기 동작의 결과로 나중에 나타나는 요소"를 찾는 쿼리라는 설명을 찾는다.
   - `waitFor`의 기본 `timeout`(1000ms)과 `interval`(50ms)을 확인한다.
   - `waitFor` 콜백은 기대가 충족되지 않을 때 **에러를 던져야** 하고, `() => false`처럼 던지지 않으면 즉시 통과한다는 예시를 찾는다.
   - `waitFor` 안에서 `fireEvent.press` 같은 부수 효과를 하면 안 되는 이유를 찾는다.
2. [Jest — Mock Functions API](https://jestjs.io/docs/mock-function-api)
   - `mockResolvedValue`/`mockRejectedValue`가 각각 `Promise.resolve`/`Promise.reject`를 돌려주는 shorthand라는 점과 `...Once` 변형이 한 번의 호출에만 적용된다는 점을 확인한다.
   - `mockClear`(호출 기록만 삭제), `mockReset`(기록과 구현 삭제), `mockRestore`(원본 복원, `jest.spyOn`으로 만든 mock에서만 동작)의 차이를 표로 정리한다.
3. [TanStack Query v5 — Testing](https://tanstack.com/query/latest/docs/framework/react/guides/testing)
   - 테스트용 `QueryClientProvider` wrapper를 만드는 이유를 찾는다.
   - 기본 `retry`가 3회 지수 백오프이기 때문에 실패 쿼리 테스트가 타임아웃될 수 있고, `defaultOptions.queries.retry: false`로 끈다는 문장을 찾는다.
   - Jest가 끝난 뒤 "did not exit" 메시지를 막기 위해 `gcTime: Infinity`를 쓴다는 문장을 찾는다.
   - 확인할 버전: 문서는 v5(`gcTime`) 기준이다. 프로젝트의 `@tanstack/react-query` 버전이 v5인지 `package.json`에서 확인한다.

## 예측(10분)

1. 테스트용 `QueryClient`에 `retry: false`를 주지 않고, `fetch` mock이 실패 응답(`ok: false`)을 돌려주는 상태로 에러 화면을 `findByText`로 기다리면 어떻게 될까?

   > 내 예측:

2. `jest.fn().mockResolvedValue(응답)`(Once 없음)로 만든 fetch가 한 테스트 안에서 2번 호출되면, 두 번째 호출은 무엇을 돌려줄까? `mockResolvedValueOnce`였다면?

   > 내 예측:

3. "로딩 중" 화면을 테스트에서 확실히 붙잡아 두려면 `fetch` mock이 어떤 Promise를 돌려줘야 할까?

   > 내 예측:

## 만들기(40분)

피드 데이터 흐름 3겹(API 클라이언트 → 훅 → 화면)을 테스트로 덮는다. 실제 네트워크는 쓰지 않는다. 앱 코드는 바꾸지 않는 것이 원칙이고, 테스트가 막히는 이유가 앱 코드 구조 때문이면 막힌 점에 적는다.

**준비 파일**
- 새 파일 `test-utils/queryWrapper.tsx`: 호출할 때마다 새 `QueryClient`를 만들어 `QueryClientProvider`로 감싸는 wrapper 컴포넌트를 돌려주는 함수 `createQueryWrapper`. `defaultOptions.queries`에 `retry: false`와 `gcTime: Infinity`를 둔다.
- 이 파일을 `__tests__/`에 두지 않는 이유: Jest 기본 설정은 `__tests__/` 안의 모든 JS/TS 파일을 테스트 파일로 취급한다. 헬퍼는 밖에 둔다.

**테스트 1: API 클라이언트** — 새 파일 `__tests__/posts.test.ts`
- 대상: Day 27에서 만든 `src/api/posts.ts`의 `getPosts`.
- 성공 케이스: `fetch`가 `{ ok: true, json: async () => [글 데이터] }`를 돌려줄 때 결과를 확인한다.
- 실패 케이스: `{ ok: false, status: 500 }`일 때 `await expect(getPosts(...)).rejects.toMatchObject({ kind: 'http', status: 500 })`로 확인한다. `rejects.toBeInstanceOf(ApiError)`는 쓰지 않는다. Day 27의 경고대로 `instanceof`가 `false`일 수 있어서, 필드로 판별하는 `toMatchObject`가 안전하다.
- `fetch`는 테스트 안에서 이렇게 교체하고, 끝나면 원래 값으로 되돌린다.

  ```ts
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => [] });
  ```

**테스트 2: 훅** — 새 파일 `__tests__/usePosts.test.tsx`
- 대상: Day 32에서 `useInfiniteQuery`로 바꾼 `usePosts`.
- 성공: `await renderHook(() => 훅(), { wrapper })` 후 `await waitFor(() => expect(result.current.isSuccess).toBe(true))`로 기다리고 `data.pages`를 확인한다. `renderHook`의 시그니처와 `act` 사용법은 RNTL 문서의 `renderHook` 절(`docs/api/misc/render-hook`)에서 확인한다.
- 로딩: `fetch`가 끝나지 않는 Promise(`new Promise(() => {})`)를 돌려주게 하고 `isPending`이 `true`인지 확인한다.

**테스트 3: 화면 에러 상태** — `__tests__/FeedScreen.test.tsx`
- 대상: 피드 탭 화면. `fetch`를 `{ ok: false, status: 500 }`로 mock하고 wrapper로 감싸 렌더한 뒤 `await screen.findByText(...)`로 Day 25~28에서 정한 에러 문구가 나타나는지 확인한다.
- 화면이 `expo-router`의 `useRouter`/`Link`를 쓰면 해당 모듈만 대체한다. `jest.mock` 공장 함수에서 바깥 변수를 쓰려면 이름이 `mock`으로 시작해야 한다.

  ```ts
  const mockPush = jest.fn();
  jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
  ```

- 피드 헤더가 `useProfile()`·`useLogs()`를 쓰므로 wrapper에 `ProfileProvider`·`LogsProvider`도 감싼다.
- `LogsProvider`가 AsyncStorage를 읽으므로 `jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))`를 둔다.
- `expo-router` mock 공장에는 피드가 import하는 `Link`와(남아 있다면) Day 20의 `useFocusEffect`도 넣는다.
- 피드 화면이 Day 58의 `OfflineBanner`를 렌더하므로 netinfo mock을 추가한다. 경로는 `@react-native-community/netinfo` README의 Troubleshooting(Jest 오류) 절에서 확인한다.

  ```ts
  jest.mock('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock'));
  ```

  이 mock이 필요한 이유: `OfflineBanner`가 쓰는 netinfo는 네이티브 모듈이 필요한데 Jest(Node)에는 없어서, mock 없이는 import하는 시점에 에러를 던져 테스트 파일이 시작도 못 한다.

- `expo-router/testing-library`의 `renderRouter`는 해당 문서가 SDK 58 이상 기준이라 이 Day에서는 쓰지 않는다. SDK 54에서의 사용 가능 여부는 문서에서 확인 필요.

완료 기준
- [ ] `test-utils/queryWrapper.tsx`가 테스트마다 새 `QueryClient`를 만든다.
- [ ] API 클라이언트의 성공·실패, 훅의 성공·로딩, 화면의 에러 상태가 각각 테스트로 존재하고 통과한다.
- [ ] 어떤 테스트도 실제 네트워크(JSONPlaceholder)에 접속하지 않는다. 와이파이를 꺼도 통과한다.
- [ ] `afterEach`에서 `fetch`를 원래 값으로 되돌린다.
- [ ] `npm test`가 끝난 뒤 프로세스가 멈춰 있지 않고 정상 종료된다(`--watchAll`이 아닌 `npx jest`로 1회 실행해서 확인).

## 검증(10분)

- `npx jest`로 1회 실행해 전체 통과와 종료를 확인한다. 와이파이를 끈 상태로도 한 번 실행한다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.

> 실제 결과 / 예측과 다른 지점:

**깨뜨려 보는 실험**: `queryWrapper.tsx`에서 `retry: false`를 지우고 화면 에러 테스트만 실행한다. 어떤 에러가 나고 몇 ms 뒤에 나는지 기록한다. 그다음 `gcTime: Infinity`도 지우고 `npx jest`를 실행해 테스트가 끝난 뒤 프로세스가 곧바로 종료되는지 본다(멈추면 `Ctrl+C`). 실험 후 둘 다 되돌린다.

## 이해 점검 질문

1. 테스트마다 새 `QueryClient`를 만들어야 하는 이유는?
2. `findByText`는 `getByText`+`waitFor`와 어떤 관계이고, `waitFor` 콜백이 `() => false`를 돌려주면 왜 의도대로 기다리지 않는가?
3. `mockClear`, `mockReset`, `mockRestore`는 각각 무엇을 지우거나 되돌리는가? 그리고 `fetch`를 mock하는 이유는?

<details>
<summary>정답</summary>

1. `QueryClient`는 쿼리 결과를 캐시한다. 클라이언트를 공유하면 앞 테스트가 채워 둔 캐시가 뒤 테스트의 로딩·에러 상태를 가려 테스트 순서에 따라 결과가 달라진다. 새로 만들면 각 테스트가 빈 캐시에서 시작해 독립적이다. 테스트용 기본값(`retry: false`, `gcTime: Infinity`)도 한곳에서 일관되게 적용된다.
2. `findBy*`는 `getBy*`를 `waitFor`로 감싼 것과 같아서 요소가 나타날 때까지 반복해 찾는다(기본 1000ms). `waitFor`는 콜백이 **던지지 않으면** 기대가 충족된 것으로 본다. `() => false`는 값을 반환할 뿐 던지지 않으므로 즉시 통과한다. 그래서 콜백 안에서 `expect(...)`처럼 실패 시 던지는 단언을 써야 한다.
3. `mockClear`는 호출 기록만 지우고 구현은 유지한다. `mockReset`은 기록과 구현을 모두 지운다. `mockRestore`는 `reset`에 더해 원본 구현을 복원하지만 `jest.spyOn`으로 만든 mock에서만 동작한다(`globalThis.fetch = jest.fn()`으로 덮어쓴 경우는 직접 원래 값을 되돌려야 한다). `fetch`를 mock하는 이유는 네트워크 상태와 서버 응답에 상관없이 같은 결과를 내는 빠른 테스트를 만들고, 500 같은 에러도 원할 때 재현하기 위해서다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `test: API 클라이언트 fetch mock 테스트`
- `test: 피드 훅과 화면의 로딩·에러 상태 테스트`

## 웹과 다른 점

테스트가 브라우저가 아니라 Node 위의 Jest에서 돌기 때문에 `window`가 없다. `fetch`는 `globalThis.fetch`를 교체하거나 모듈 단위로 `jest.mock`해서 대체한다.
