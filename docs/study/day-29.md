# Day 29 · 12/4 (금) — 버퍼 + 6주차 점검

## 오늘의 목표

6주차(Day 25~28: fetch 상태 관리, 취소와 경쟁 상태, API 모듈과 에러 모델, `useQuery`) 내용을 정답을 가리고 풀어 보고, 밀린 Day와 질문 목록을 정리한다.

## 주간 점검 퀴즈(30분)

정답은 접힌 상태에서 먼저 자기 답을 적은 뒤 연다. 결과는 `docs/quiz/2026-12-04-day-29.md`에 `AGENTS.md`의 상세 구조(문항별 내 답 → 문제점 → 정답 → 암기 고리 → 근거 절, 종합 약점 패턴, 재복습 일정)로 기록한다.

**Q1 (Day 25).** `fetch('.../postz')`가 404를 받았는데 `catch`에 들어오지 않는다. 왜 그런가, 그리고 어떻게 에러로 처리하는가?

> 내 답:

<details><summary>정답</summary>

`fetch`는 네트워크 수준 실패에서만 reject한다. 서버가 404/500을 응답하면 응답은 정상 도착한 것이어서 Promise가 성공하고 `response.ok`가 `false`가 된다. `if (!response.ok) throw new Error(...)`로 직접 던져서 `catch`에서 한 곳으로 처리한다.

</details>

**Q2 (Day 25).** 개발 환경에서 `useEffect` 안의 `fetch`가 두 번 실행되는 것처럼 보인다. 이것은 버그인가? 어떻게 대응하는 것이 맞는가?

> 내 답:

<details><summary>정답</summary>

React 문서에 따르면 개발 환경(Strict Mode)에서는 Effect를 마운트 직후 한 번 더 실행해 cleanup 누락을 찾는다. 프로덕션에서는 한 번이다. 요청이 한 번만 나가게 숨기는 대신, Effect가 다시 실행되어도 안전하도록 cleanup에서 이전 요청을 무시/취소하게 만든다. 이 앱에서 Day 26이 그 작업이다. 실제로 몇 번 찍히는지는 환경에 따라 다를 수 있으므로 Day 25 검증에서 직접 센 값을 기준으로 한다.

</details>

**Q3 (Day 26).** 사용자 칩 "1"을 누른 직후 "2"를 눌렀는데 화면에는 1번 사용자의 글이 보인다. 원인과 `ignore` 플래그 해법을 설명하라.

> 내 답:

<details><summary>정답</summary>

요청 순서와 응답 도착 순서가 같다는 보장이 없어, 느린 1번 요청의 응답이 나중에 도착해 2번 결과를 덮어썼다(경쟁 상태). `useEffect` 안에서 `let ignore = false`를 두고 cleanup에서 `true`로 바꾸며, 응답 처리 시 `if (!ignore)`일 때만 state를 갱신한다. 의존성(`userId`)이 바뀔 때 이전 Effect의 cleanup이 먼저 실행되므로 오래된 응답이 무시된다.

</details>

**Q4 (Day 27).** `ApiError`에 `kind`와 `status`를 두는 이유와, `AbortError`를 `ApiError`로 감싸지 않고 그대로 던지는 이유를 설명하라.

> 내 답:

<details><summary>정답</summary>

화면이 연결 문제(`network`)와 서버가 돌려준 오류(`http`, `status`)를 다르게 안내하려면 문자열 `message`가 아니라 안정적인 필드가 필요하다. `AbortError`는 의도적인 취소라 에러 화면을 띄우면 안 되므로, `ApiError`로 감싸지 않고 호출자가 이름으로 걸러내게 한다.

</details>

**Q5 (Day 28).** `useQuery({ queryKey: ['posts'], queryFn: () => getPosts({ userId }) })`처럼 `queryKey`에서 `userId`를 뺐을 때 생기는 문제를 설명하고, `isPending`과 `isFetching`의 차이도 한 문장으로 말하라.

> 내 답:

<details><summary>정답</summary>

`queryKey`가 같으면 같은 캐시 항목으로 취급되어, 칩을 바꿔도 새로 가져오지 않고 이전 사용자의 글이 보인다. `queryFn`이 쓰는 변하는 값은 키에 넣어야 한다(`['posts', { userId }]`). `isPending`은 아직 캐시에 데이터가 없는 상태이고, `isFetching`은 데이터 유무와 상관없이 `queryFn`이 실행 중이면 참이다.

</details>

## 구술 1주제(15분)

주제: "피드 화면이 열릴 때 서버 글이 화면에 보이기까지를, 수동 `useEffect` fetch 방식과 `useQuery` 방식으로 나눠 비교해 설명한다."

포함할 핵심어: `response.ok`, 경쟁 상태, `AbortController`, `queryKey`, `isPending`

설명 후 빠뜨린 핵심어를 적는다:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문을 위에서부터 처리한다. 에러 원문과 시도한 것을 다시 읽고, 공식 문서에서 해당 절을 찾아 답을 적는다. Day 26의 "RN 0.81 문서에 `AbortController` 근거가 없었다"와 Day 28 예측 3의 "백그라운드 복귀 시 refetch 여부"가 질문 목록에 있다면 이번에 정리하고, 후자는 Day 33(`focusManager`)까지 보류해도 된다.

- [ ] 이번 주 질문 전부 읽었다
- [ ] 해결한 질문에 답과 근거 문서 링크를 적었다
- [ ] 못 푼 질문 개수:

## 밀린 Day 흡수

달력이 아니라 Day 번호 기준이다. 1~2일 밀렸으면 여기서 하나만 한다(한 번에 Day 둘 금지).

- [ ] Day 25 fetch + useEffect, 로딩·에러 상태
- [ ] Day 26 AbortController와 경쟁 상태
- [ ] Day 27 API 클라이언트 모듈과 에러 모델
- [ ] Day 28 TanStack Query: useQuery
- [ ] 이전 주에서 밀린 Day:

## 기록(5분)

이번 주 가장 헷갈린 개념:

틀린 퀴즈와 이유:

다음 주(7주차 데이터 2: mutation, 낙관적 업데이트, 무한 스크롤) 전에 고칠 것:
