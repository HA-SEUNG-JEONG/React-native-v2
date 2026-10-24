# Day 16 · 11/8 (일) — 미션 2-7 FeedList 에러와 캐시 데이터 공존

> **오늘의 핵심**: `status`는 "마지막 시도의 결과"이고 `data`는 "마지막으로 성공한 값"이라 서로 독립이므로, 에러여도 데이터가 있으면 목록을 유지한다.

**시작 상태**: 스텁 브랜치에서 `src/screens/FeedListScreen.tsx`가 `isError`·`error`를 구조 분해하지 않고 에러 UI가 전혀 없다. 지금은 다음 페이지가 실패해도 목록만 보이고 아무 표시가 없다. 순서는 ① 에러 화면 단순판 복원(`isError`면 전체 에러 화면 + 다시 시도) → ② 재현 → ③ "데이터가 있으면 목록 유지"로 개선이다. ①의 단순판이 곧 미션이 고치려는 증상이라, 복원하면 재현이 된다. 선행 2-2는 [Day 12](./day-12.md)에 끝났다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~15 읽기: `src/screens/FeedListScreen.tsx`의 분기 순서(`isPending` → `isError` → 목록), `offlineBar` 스타일, `FlatList`의 `ListFooterComponent` → 적을 것: 지금 분기 기준이 무엇인가
- [ ] 15~25 단순판 복원: `isError`·`error`를 구조 분해하고 `isError`면 전체 에러 화면 + 다시 시도
- [ ] 25~40 재현(임시 코드): `src/api/posts.ts`의 `fetchPosts`가 `page === 2`일 때 던지게 임시로 바꾸고, 스크롤해서 다음 페이지를 요청한다. 2-2로 재시도 정책이 바뀌었으니 문서의 "수 초 걸림"과의 차이를 기록한다
- [ ] 40~70 개선: 데이터가 있으면 목록을 유지하고 에러 배너(또는 푸터)를 보여 준다. 분기 기준, 표시 위치, 다시 시도, `onEndReached` 반복 방지는 아래 참고
- [ ] 70~80 검증: 아래 끝 조건 (1)~(4) 확인 · `npm run typecheck` · `npx eslint .` · `npm test` · `git diff src/api/posts.ts`로 임시 실패 코드가 깨끗이 사라졌는지 확인
- [ ] 80~90 기록: `docs/improve/reviews/2-7.md`, `FeedSectionsScreen` 처리 여부와 이유, 내일 할 일 한 줄

## 끝 조건
1. (1) 목록 유지 (2) 에러 표시 (3) 다시 시도 동작 (4) 첫 페이지부터 실패(데이터 0건)하면 에러 화면 그대로
2. 미션 §체크 4개 통과 + `page === 2` 임시 코드 원복 + 검증 4종 통과
3. 말로 설명: `status === "error"`인데 `data`가 있을 수 있는 이유

## 막히면
- 15분 막힘 → 2-7 힌트 1 요청: 에러가 났을 때 "보여줄 데이터가 있는가"가 분기 기준이다. 현재 조건에 무엇이 빠졌는지 본다
- 다시 15분 → 힌트 2 (`isError`와 데이터 조합, `isRefetchError`·`isFetchNextPageError`, 배너는 `offlineBar` 참고), 다시 15분 → 힌트 3 (`onEndReached` 반복 방지, 다시 시도가 `refetch`인지 `fetchNextPage`인지, 데이터 0건이면 에러 화면 유지)
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: [p4-study-guide.md](../p4-study-guide.md)의 4상태 절.
- **재현 (임시 코드 있음, 반드시 되돌림)**
  - `fetchPosts`가 `page === 2`일 때 던지게 임시로 바꾸고, 스크롤해서 다음 페이지를 요청한다. 오프라인(네트워크 끊김)은 `isPaused`로 처리돼 에러가 아니므로 이 재현에 쓸 수 없다.
  - 재시도 정책이 바뀌었으므로(2-2) 문서의 "수 초 걸림"과 다를 수 있다. 그 차이를 기록한다.
  - 작업이 끝나면 `git diff src/api/posts.ts`로 임시 실패 코드가 깨끗이 사라졌는지 확인한다. 이 미션에서 가장 흔한 사고는 임시 코드 커밋이다.
- **코딩 전에 정할 것**
  - 전체 에러 화면은 "보여줄 데이터가 전혀 없을 때만"이다. 분기 기준이 `isError` 단독이 아니라 무엇과의 조합인가.
  - 에러 표시 위치(목록 위 배너 / 푸터). "다시 시도"가 `refetch`인지 `fetchNextPage`인지는 상황에 따라 다르다. 훅이 주는 세분화된 상태(`isRefetchError`, `isFetchNextPageError`)를 쓸지 결정한다.
  - 다음 페이지 실패 후 `onEndReached`가 같은 요청을 즉시 반복하지 않게 하는 방법.
- **선택**: `src/screens/FeedSectionsScreen.tsx`에 같은 패턴이 있다. 범위 밖이므로 같이 고칠지 여부는 기록에 이유와 함께 적는다. 고치지 않아도 된다.
- **임시 코드 되돌릴 곳**: `page === 2`에서 던지기 → `src/api/posts.ts`.
- **기록 포인트**: 재시도 정책 변경으로 달라진 대기 시간, 분기 기준 선택 이유, `FeedSectionsScreen` 처리 여부.
