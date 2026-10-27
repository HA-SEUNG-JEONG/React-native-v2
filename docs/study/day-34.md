# Day 34 · 12/11 (금) — 버퍼 + 7주차 점검

## 오늘의 목표

Day 30~33의 서버 상태 관리(mutation, 낙관적 업데이트, 무한 스크롤, 쿼리 키·캐시·RN 연동)를 퀴즈와 구술로 점검하고, 밀린 Day와 질문을 정리한다.

## 주간 점검 퀴즈(30분)

정답을 가리고 풀고, 결과는 `docs/quiz/2026-12-11-day-34.md`에 `AGENTS.md`의 상세 구조(문항별 내 답 → 문제점 → 정답 → 암기 고리 → 근거 절, 종합 약점 패턴, 재복습 일정)로 기록한다.

1. (Day 30) `useMutation`의 `isPending`이 `onSuccess` 안의 `invalidateQueries`와 어떤 관계인지, Promise를 반환할 때와 반환하지 않을 때를 비교해 설명하라.
2. (Day 30) 서버에 글을 만들었는데 피드를 무효화해도 새 글이 보이지 않는다. 의심할 수 있는 원인을 두 가지 들고, 각각 어떻게 구분하는가?
3. (Day 31) 낙관적 업데이트의 `onMutate`, `onError`, `onSettled`에서 각각 무엇을 하는지 순서대로 쓰고, `cancelQueries`가 빠지면 어떤 버그가 생길 수 있는지 설명하라.
4. (Day 32) `useInfiniteQuery`의 `data` 구조, `getNextPageParam`이 `undefined`를 돌려주면 일어나는 일, `onEndReached`에서 `fetchNextPage` 전에 확인해야 할 두 가지 값을 쓰라.
5. (Day 33) `staleTime: 30_000`, `gcTime: 5000`이 설정된 상세 쿼리가 있다. 상세 화면을 떠나 3초 뒤, 그리고 10초 뒤에 다시 들어올 때 각각 화면과 요청이 어떻게 되는지 설명하라. RN에서 `focusManager`를 `AppState`에 연결하지 않으면 무엇이 안 되는가?

<details><summary>정답</summary>

1. `onSuccess`가 Promise를 반환하면(또는 `await`하면) 무효화에 따른 재요청이 끝날 때까지 mutation이 `isPending`으로 남는다. 반환하지 않으면 재요청을 기다리지 않고 바로 `isPending`이 풀린다. 재요청이 끝난 뒤 버튼을 풀고 싶다면 반환해야 하고, 응답만 받으면 충분하면 반환하지 않아도 된다.
2. 첫째, 서버가 쓰기를 저장하지 않는 경우다(JSONPlaceholder는 응답만 꾸며 준다). 둘째, 무효화 키가 피드 쿼리 키와 일치하지 않는 경우다(접두사 일치가 안 되는 키 구조). 구분은 Metro 로그나 `queryFn` 로그로 재요청이 실제로 나가는지 본다. 재요청이 나갔는데 데이터가 같다면 서버 문제이고, 재요청이 안 나갔다면 키 문제다.
3. `onMutate`는 `cancelQueries`로 진행 중인 재요청을 취소하고, `getQueryData`로 이전 값을 저장하고, `setQueryData`로 낙관적 값을 쓰고, 이전 값을 반환한다. `onError`는 반환된 이전 값으로 캐시를 복원한다. `onSettled`는 성공·실패와 무관하게 서버 확정값과 맞추려고 무효화한다. `cancelQueries`가 없으면 이미 날아간 재요청의 응답이 나중에 도착해 낙관적 값을 옛 데이터로 덮어쓰는 깜빡임 버그가 생길 수 있다.
4. `data`는 `{ pages, pageParams }`이고 목록은 `pages.flat()`으로 만든다. `undefined`(또는 `null`)를 돌려주면 `hasNextPage`가 false가 되어 더 이상 불러오지 않는다. `onEndReached`에서는 `hasNextPage`가 true이고 `isFetchingNextPage`가 false일 때만 `fetchNextPage`를 호출한다.
5. 3초 뒤: `gcTime`(5초) 안이라 캐시가 남아 있고, `staleTime`(30초) 안이라 fresh이므로 로딩 없이 캐시를 보여 주고 재요청도 하지 않는다. 10초 뒤: `gcTime`을 넘겨 캐시가 지워졌으므로 로딩부터 다시 시작하고 요청이 나간다. `AppState` 연결이 없으면 앱이 백그라운드에서 돌아와도 Query가 포커스 복귀를 알지 못해 stale 쿼리가 자동 재요청되지 않는다.

</details>

## 구술 1주제(15분)

주제: "mutation이 끝난 뒤 화면을 최신 상태로 맞추는 두 가지 방법(무효화와 낙관적 업데이트)을 비교해 설명하라."

설명에 넣을 핵심어: `invalidateQueries`, `onMutate`, 스냅샷과 롤백, `cancelQueries`, 서버 확정값.

소리 내어 2분 안에 설명하고, 막힌 지점을 아래에 적는다.

> 막힌 지점:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문 중 이번 주(Day 30~33)에 생긴 것을 처리한다.

- [ ] 에러 원문 검색 → 공식 문서 확인 순서로 해결한 질문은 해결 방법을 한 줄 적고 지운다.
- [ ] 해결하지 못한 질문은 다음 주 Day 35 시작 전까지 남기고 재현 조건을 보강한다.

## 밀린 Day 흡수

- [ ] Day 30 완료 기준 전부 확인
- [ ] Day 31 완료 기준 전부 확인
- [ ] Day 32 완료 기준 전부 확인
- [ ] Day 33 완료 기준 전부 확인
- [ ] Day 31·33에서 넣은 임시 코드(지연·실패 재현, 오프라인 흉내 스위치, 확인용 로그) 제거 확인
- [ ] Day 30~33 커밋이 모두 남아 있다

## 기록(5분)

배운 것 3줄:

막힌 점:
