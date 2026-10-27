# Day 64 · 1/22 (금) — 버퍼 + 13주차 점검

## 오늘의 목표

Day 60~63(Jest 환경, 비동기·mock 테스트, 리렌더 측정, FlatList 튜닝)을 정답을 가리고 다시 설명할 수 있는지 점검하고, 밀린 Day를 따라잡는다.

## 주간 점검 퀴즈(30분)

정답을 가리고 소리 내어 또는 글로 답한 뒤 확인한다. 모르면 "모른다"고 적는다. 찍어서 맞힌 문항은 맞힌 것으로 치지 않는다.

1. (Day 60) RNTL 14에서 `render(<Card />)`의 `await`를 빼고 `screen.getByText(...)`를 쓰면 어떤 에러가 나는가? 그리고 "없어야 하는 요소"를 확인할 때 `getByText`가 아니라 `queryByText`를 써야 하는 이유는?
2. (Day 60) `react-test-renderer` 대신 `@testing-library/react-native`와 `test-renderer`를 쓰는 이유와, React 19.1 프로젝트에서 `test-renderer`를 `1.1`로 고르는 이유는?
3. (Day 61) TanStack Query 훅·화면 테스트에서 테스트마다 새 `QueryClient`를 만들고 `retry: false`, `gcTime: Infinity`를 두는 이유를 각각 설명하라.
4. (Day 62) `<Profiler>`의 `actualDuration`과 `baseDuration`의 차이는? React Compiler가 실제로 적용되었는지 DevTools에서 어떻게 확인하는가?
5. (Day 63) `FlatList`에서 `windowSize`를 줄이면 얻는 것과 잃는 것은? 성능 비교를 `--no-dev` 모드로 해야 하는 이유는?

<details>
<summary>정답</summary>

1. `` `render` function has not been called `` 에러가 난다. RNTL 14의 `render`는 비동기여서 `await`로 렌더 완료를 기다리기 전에는 `screen`이 비어 있다. `getByText`는 정확히 1개가 아니면 던지므로 "없음"을 표현할 수 없다. `queryByText`는 없으면 `null`을 돌려주어 `expect(...).not.toBeOnTheScreen()`으로 확인할 수 있다.
2. `react-test-renderer`는 React 19 이상을 지원하지 않아 deprecated이고 RNTL 14는 React 19용 렌더러인 `test-renderer`를 peer dependency로 쓴다. `test-renderer`는 React 마이너 버전에 맞춘 라인(19.1은 `1.1`)이 있어, 더 높은 라인을 깔면 peer dependency 경고나 npm 설치 오류가 날 수 있다.
3. 새 `QueryClient`: 캐시가 테스트 사이에 공유되면 앞 테스트의 데이터가 뒤 테스트를 가려 순서에 따라 결과가 달라진다. `retry: false`: 기본 재시도가 3회 지수 백오프라 실패 케이스가 `waitFor`/`findBy`의 기본 1000ms 안에 끝나지 않아 타임아웃된다. `gcTime: Infinity`: 가비지 컬렉션 타이머가 남아 테스트가 끝나도 Jest 프로세스가 종료되지 않는 문제를 막는다.
4. `actualDuration`은 이번 업데이트에서 실제로 렌더한 시간이고 `baseDuration`은 메모이제이션 없이 서브트리 전체를 다시 렌더한다고 가정한 시간이다. 컴파일러가 적용된 컴포넌트는 React Components 패널에 Memo 배지가 표시된다. "Highlight updates when components render"로 리렌더 여부를 눈으로도 볼 수 있다.
5. 얻는 것은 동시에 마운트되는 항목 감소로 인한 메모리·렌더 부담 감소이고, 잃는 것은 빠른 스크롤 때 빈 영역이 보일 가능성이다. 개발 모드(`dev=true`)는 추가 검사 작업과 `console.*` 때문에 JS 성능이 크게 낮아 사용자가 겪는 성능을 대표하지 못하므로, 릴리스에 가까운 `--no-dev` 모드로 비교해야 옵션의 효과를 구분할 수 있다.

</details>

퀴즈 결과는 `docs/quiz/2027-01-22-day-64.md`에 `AGENTS.md`의 상세 구조(문항별 내 답 → 문제점 → 정답 → 암기 고리 → 근거 절, 종합 약점 패턴, 재복습 일정)로 기록한다.

## 구술 1주제(15분)

주제: "Daily Log의 피드 데이터 로딩을 어떻게 테스트로 고정하는가." 소리 내어 3분 안에 설명한다. 설명에 아래 핵심어가 모두 들어가야 한다.

- `globalThis.fetch` mock (실제 네트워크를 쓰지 않는 이유)
- 새 `QueryClient`와 `retry: false`
- `findBy*` / `waitFor` (비동기를 기다리는 방법)
- 로딩 상태를 붙잡는 방법(끝나지 않는 Promise)
- `renderHook`과 `await`

핵심어가 빠지거나 "왜"를 못 댄 곳을 아래에 적는다.

> 빠진 핵심어 / 설명이 막힌 곳:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문을 위에서부터 처리한다.

- [ ] 에러 원문으로 먼저 검색하고, 해결한 항목에는 해결 방법을 한 줄 적는다.
- [ ] 15분 안에 못 푼 항목은 내용을 그대로 두고 다음 주 금요일로 넘긴다.
- [ ] 이번 주(Day 60~63) 질문 중 Jest 설정이나 mock 관련 항목을 우선 처리한다.

## 밀린 Day 흡수

- [ ] Day 60: Jest 환경과 첫 테스트 2개
- [ ] Day 61: fetch mock과 `QueryClient` wrapper 테스트
- [ ] Day 62: Compiler ON/OFF 측정 표
- [ ] Day 63 (건너뛰기 가능): 건너뛰었다면 읽기 3개만 확인했는지
- [ ] 월요일(Day 65) 시작 전에 `npx jest` 1회 실행으로 모든 테스트가 통과하는지 확인

## 기록(5분)

배운 것 3줄:

막힌 점:

다음 주(Day 65 디버깅 도구) 준비:
