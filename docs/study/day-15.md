# Day 15 · 11/7 (토) — 미션 2-3 useDeletePost 정리 ⚠️ · 2/2일차: 정석 수정 + 변경 후 기록
> **오늘의 핵심**: 낙관적 업데이트의 정석 순서(취소 → 스냅샷 → 수정 → 롤백 → 재동기화)를 따르되, 이 앱의 가짜 DELETE 때문에 `onSettled`의 invalidate가 화면을 되돌리므로 트레이드오프를 적고 고른다.

**시작 상태**: 스텁 브랜치에서 `src/api/posts.ts`의 `useDeletePost`에는 `mutationFn`만 있다. `onMutate`·`onError`·`onSettled`가 없어서 "변경 전"이 비어 있다(삭제해도 목록은 그대로, 롤백도 없음). 그래서 순서를 바꾼다. ① 힌트 없이 떠오르는 대로 낙관적 제거 + 실패 시 롤백을 **1차로 구현**한다. ② 아래 4가지를 기록한다. 이것이 "변경 전"이다. ③ 설계 질문을 풀고 정석으로 **2차 수정**한다. ④ 같은 4가지를 "변경 후"에 쓴다. ⚠️의 실체는 1차와 2차의 차이다. 원본 코드를 열어 "변경 전"을 베끼지 않는다.

**표시**: ⚠️ 동작 변경 — `docs/improve/reviews/2-3.md` 상단에 `⚠️ 동작 변경`과 변경 전후를 적는다. 11/6(금)은 [Tier 1 종료 절 버퍼](./day-07.md)라 이틀이 연속이 아니다.

## 오늘 할 일 (90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 1일차의 "내일 할 일" 확인
- [ ] 05~25 설계 결정 표: `onSettled` 선택지(성공 시에는 하지 않기 / 감수하기 / 다른 방식)의 트레이드오프를 표로 적고 고른다. `["post", id]`의 `id` 타입, `FeedDetailScreen`의 `onMutate`와 스냅샷 순서 비교도 여기서 정한다. Day 5~6의 "세 번째 선택지 재평가"도 한다
- [ ] 25~65 2차 수정: 정석 순서로 고친다. 수정 중 확인(빈 페이지 `filter`와 `getNextPageParam`, `signal` 취소와 `cancelQueries`)은 아래 참고
- [ ] 65~75 검증: `grep -n "any" src/api/posts.ts`에서 삭제 훅의 `any`가 사라졌는지 · `npm run typecheck` · `npx eslint .` · `npm test` · 변경 전 4가지 재확인
- [ ] 75~90 기록: `reviews/2-3.md` "변경 후" 칸(같은 4가지), 선택한 동작과 버린 대안, 2-11 테스트 후보 메모, 내일 할 일 한 줄

## 끝 조건
1. 변경 후 4가지가 변경 전과 나란히 기록돼 있다
2. 순서 수정 · `any` 제거 · `onSettled` 처리 · `["post", id]` 처리 · 선택한 동작과 버린 대안 기록. 검증 4종 통과
3. 말로 설명: `cancelQueries`를 스냅샷 앞에 두는 이유. `onSettled`가 `onSuccess`+`onError`와 다른 점.

## 막히면
- 1차 구현에서 15분 막힘 → 2-3 힌트 1 요청: `onMutate`에서 줄 순서를 `FeedDetailScreen`의 `onMutate`와 나란히 놓고 비교한다
- 다시 15분 → 힌트 2 (`InfiniteData<Post[]>` 타입, `getQueryData<T>` / `setQueryData<T>` 제네릭, `onSettled`, `invalidateQueries` / `removeQueries` / `setQueryData`, context 객체의 타입)
- 다시 15분 → 힌트 3: 가짜 API 때문에 "정석(onSettled invalidate)"이 이 앱에선 화면을 되돌린다. 어떻게 할지는 트레이드오프를 적고 선택한다. 정답이 하나가 아니다
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고 (아래로 밀어 둠)
- **전날 이어받기**: [Day 13](./day-13.md)(11/5 (목))의 "내일 할 일" 한 줄을 이어받는다. 미션 전체의 읽을 절·코딩 전에 정할 것·임시 코드·기록 포인트는 [Day 13](./day-13.md)의 `## 참고`에 있다.
