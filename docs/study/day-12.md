# Day 12 · 11/4 (수) — 미션 2-2 queryClient 설정

> **오늘의 핵심**: 영속 캐시의 `gcTime`이 `maxAge`보다 짧으면 캐시가 일찍 사라지므로 `gcTime >= maxAge`여야 한다.

**시작 상태**: 2-2는 스텁이 손대지 않은 미션(원본 그대로)이다. 선행 2-4가 [Day 11](./day-11.md)에 끝났으므로 `HttpError.status`로 4xx를 구분할 수 있다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~20 읽기: `src/api/posts.ts`의 `queryClient`, `App.tsx`의 `PersistQueryClientProvider`와 `maxAge`, `src/api/persist.ts` → 적을 것: 지금 `maxAge`와 `gcTime`이 각각 얼마이고 어디에 정의됐나
- [ ] 20~30 현황표 작성(코딩 전): 아래 참고의 표를 채운다
- [ ] 30~35 재현: 존재하지 않는 글 딥링크(`feed/99999`)를 열고 상세가 스피너로 몇 초 머무는지 초시계로 잰다 (문서는 약 7초로 추정)
- [ ] 35~55 수정 ①: `maxAge` 상수를 한 곳에 두고 `gcTime >= maxAge`로 맞춘다. `staleTime`과 `retry`(4xx 구분)를 정하고 이유를 한 줄 주석으로 남긴다
- [ ] 55~70 수정 ②: 두 queryFn(`fetchPosts`, `fetchPost`) 모두 `signal`을 받아 `fetch`까지 넘긴다
- [ ] 70~80 검증: `npm run typecheck` · `npx eslint .` · 404 재현 전/후 시간 비교 · `gcTime`을 잠깐 짧게 줄여 관찰자 없는 쿼리가 사라진 뒤 재시작 시 캐시가 없는지 보고 **값을 되돌린다**
- [ ] 80~90 기록: `docs/improve/reviews/2-2.md`, "내일 확인할 것"(`signal` 취소 시 롤백 ↔ 2-3의 `cancelQueries`), 내일 할 일 한 줄

## 끝 조건
1. 404 딥링크 재현의 스피너 시간이 수정 전/후로 비교돼 있다
2. `gcTime >= maxAge`, 4xx 비재시도(또는 선택한 정책), 두 queryFn의 `signal` 전달, 정책 이유 한 줄 주석. 검증 4종 통과, `gcTime` 임시 값 원복
3. 말로 설명: `gcTime`이 `maxAge`보다 짧으면 영속 캐시가 왜 일찍 사라지나? `staleTime`과 `gcTime`의 차이는?

## 막히면
- 15분 막힘 → 2-2 힌트 1 요청: 지금 `maxAge`와 `gcTime`이 각각 얼마인지 적어 본다. 설정이 어디에 있고 어디에 없는지부터 찾는다
- 다시 15분 → 힌트 2 (`defaultOptions.queries`, 구조 분해한 `signal`, 함수형 `retry`), 다시 15분 → 힌트 3 (상수 공유 위치, `signal` 소비 시 이전 상태로 되돌려지는 동작)
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: [p4-study-guide.md](../p4-study-guide.md)의 캐시 절, [p6-study-guide.md](../p6-study-guide.md) W17. TanStack 문서: persistQueryClient의 `gcTime` 경고, Important Defaults, Query Retries, Query Cancellation.
- **현황표 (코딩 전)**

| 항목                   | 지금 값 | 어디에 정의 | 내가 바꿀 값과 이유 |
| -------------------- | ---- | ------ | ----------- |
| `gcTime`             |      |        |             |
| persist `maxAge`     |      |        |             |
| `staleTime`          |      |        |             |
| `retry`              |      |        |             |
| queryFn의 `signal` 사용 |      |        |             |

- **코딩 전에 정할 것**
  - `maxAge`를 두 군데 숫자로 적으면 한쪽만 고치다 어긋난다. 한 상수를 어디에 두고 누가 import하나?
  - 재시도 정책: "무엇을 재시도할지"가 정책이다. 2-4가 끝났으니 `HttpError.status`로 4xx를 구분할 수 있다. 전부 끄는 것(`retry: false`)이 왜 나쁜지 설명할 수 있어야 한다.
  - `signal`: 받기만 해서는 취소되지 않는다. 두 queryFn(`fetchPosts`, `fetchPost`) 모두 `fetch`까지 넘겨야 한다.
- **수정 중 확인**: `signal`을 소비하면 취소 시 쿼리가 **이전 상태로 되돌려진다.** 내일 2-3의 `cancelQueries`와 만나는 지점이다. 오늘 기록에 "내일 확인할 것"으로 적는다.
- **임시 코드 되돌릴 곳**: `gcTime`을 잠깐 짧게 → `src/api/posts.ts`. `gcTime` 효과는 5분을 기다릴 수 없어서 값을 줄여 관찰하는 것이고, 관찰 뒤 반드시 되돌린다.
- **기록 포인트**: 현황표(바꾼 값과 이유), 404 재현 전/후 시간, 내일 확인할 것.
