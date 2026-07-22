# P4 학습 가이드 — 리스트 이미지 최적화 · 낙관적 업데이트 · SectionList

> 대상 PR: [#1 썸네일](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/1) · [#2 낙관적 업데이트](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/2) · [#3 SectionList](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/3)
> 출처: [expo-image](https://docs.expo.dev/versions/v54.0.0/sdk/image/) · [TanStack Query v5 — Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates) · [SectionList](https://reactnative.dev/docs/sectionlist)
> 검증: rn-sandbox-app `App.tsx`, iOS 26.5 시뮬레이터 실측 (RN 0.81 / Expo SDK 54)

이 세 PR은 전부 **하나의 FlatList 피드 화면**을 프로덕션 품질로 끌어올리는 작업. 관통하는 축은 두 개다.

1. **리스트에서 이미지를 어떻게 안 깨지고 안 느리게 그리나** (PR #1)
2. **TanStack Query 캐시를 화면이 어떻게 공유·수정하나** (PR #2, #3)

---

## PR #1 — 피드 썸네일 (expo-image)

### 문제: FlatList는 행 View를 재활용한다

FlatList는 화면 밖으로 나간 행의 View 객체를 버리지 않고 **재활용(recycle)** 한다. 100개 아이템이 있어도 실제 View는 화면에 보이는 ~12개 + 여유분만 만들고, 스크롤하면 그 View들의 내용만 갈아끼운다. 메모리·성능상 이득이지만 이미지에서 함정이 생긴다.

행 View가 재활용될 때:
- 텍스트는 새 `props`로 즉시 다시 그려짐 → 문제 없음
- 이미지는 **네트워크 로드가 비동기** → 새 이미지가 도착하기 전까지 **재활용된 View에 남아있던 이전 이미지가 잠깐 보임** (잔상/깜빡임)

빠르게 플링하면 엉뚱한 썸네일이 순간적으로 섞여 보이는 게 이 현상이다.

### 해결: `recyclingKey`

```tsx
<Image
  source={{ uri: `https://picsum.photos/seed/${item.id}/100/100` }}
  style={styles.thumb}
  recyclingKey={String(item.id)}   // ★ 핵심
  cachePolicy="memory-disk"
  transition={200}
  contentFit="cover"
/>
```

`recyclingKey`가 **바뀌면** expo-image가 그 View의 현재 이미지를 **즉시 비운다**. 재활용으로 행이 item #17 → #42로 바뀌면 키도 `"17" → "42"`로 바뀌고, #42 이미지가 도착하기 전까지 #17 잔상 대신 **빈 placeholder**가 보인다. 엉뚱한 이미지보다 빈 칸이 낫다.

> 웹 비유: React의 `key`와 비슷한 "이거 다른 거야, 리셋해" 신호. 단 여기선 컴포넌트 remount가 아니라 expo-image 내부의 이미지 상태만 리셋.

### `cachePolicy` — 되돌아왔을 때 재요청 여부

| 값 | 메모리 캐시 | 디스크 캐시 | 체감 |
|----|:---:|:---:|----|
| `none` | ✕ | ✕ | 스크롤 진입마다 매번 재요청 (blank → 로드 반복) |
| `memory` | ✓ | ✕ | 앱 실행 중엔 빠름, 앱 재시작하면 다시 받음 |
| `disk` | ✕ | ✓ | expo-image 기본값 |
| `memory-disk` | ✓ | ✓ | **되돌아가도 재요청 0.** 프로덕션 리스트 권장 |

부정 테스트(negative test)로 검증한 부분: `recyclingKey`를 빼고 `cachePolicy="none"`을 주면, 재스크롤마다 썸네일이 blank로 리로드되는 걸 육안으로 확인할 수 있다. 순수 "잔상"은 200ms 미만이라 스틸 캡처가 어렵지만, `none` + no-key 조합이 증상을 눈에 보이게 만든다.

### 나머지 prop

- **`transition={200}`** — 이미지가 툭 튀지 않고 200ms 페이드인. 숫자 = ms, 객체로 `{duration, effect}`도 가능.
- **`contentFit="cover"`** — 웹 `object-fit: cover`와 동일. 비율 유지하며 꽉 채우고 넘치는 부분 크롭. (다른 값: `contain`, `fill`, `none`, `scale-down`)
- **고정 크기 = placeholder 겸용**

```tsx
thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#2b3446" },
```

너비·높이를 고정하면 이미지 로드 전에도 회색 박스가 자리를 차지한다 → 로드 완료 시 레이아웃이 안 튄다(CLS 방지). 배경색이 곧 placeholder. 별도 placeholder 컴포넌트 불필요.

### 웹 `<img>` vs expo-image

| | 웹 `<img>` | expo-image |
|--|--|--|
| 소스 | `src="url"` | `source={{ uri: "url" }}` |
| 캐시 제어 | 브라우저 자동 | `cachePolicy` 명시 |
| 재활용 잔상 | 없음(DOM 재활용 안 함) | `recyclingKey`로 대응 |
| 페이드인 | CSS 직접 | `transition` prop |
| fit | `object-fit` CSS | `contentFit` prop |

---

## PR #2 — 좋아요 낙관적 업데이트 (useMutation)

### 낙관적(optimistic) vs 비관적(pessimistic)

- **비관적**: 버튼 탭 → 서버 응답 대기(스피너) → 성공하면 UI 갱신. 안전하지만 느리게 느껴짐.
- **낙관적**: 버튼 탭 → **UI 먼저 바꿈** → 서버엔 뒤에서 요청 → **실패하면 되돌림**. 즉각 반응. 좋아요·팔로우처럼 성공률 높고 되돌려도 되는 액션에 적합.

### `useMutation` 콜백 생명주기

```
mutate(변수) 호출
  │
  ├─ onMutate(변수)            ← mutationFn "전에" 실행. 여기서 낙관적 수정 + 스냅샷
  │     └ return context       ← 아래 콜백들에 전달됨(롤백용)
  │
  ├─ mutationFn(변수)          ← 실제 네트워크 요청
  │
  ├─ 성공 → onSuccess(data, 변수, context)
  ├─ 실패 → onError(err, 변수, context)   ← context.prev로 롤백
  │
  └─ onSettled(data, err, 변수, context)  ← 성공/실패 무관 항상. 보통 여기서 invalidate
```

### 코드

```tsx
const qc = useQueryClient();

const likeMutation = useMutation({
  mutationFn: (next: boolean) => toggleLikeApi(next),
  onMutate: async (next) => {
    // 1) 진행 중인 refetch 취소
    await qc.cancelQueries({ queryKey: ["post", id] });
    // 2) 롤백용 스냅샷
    const prev = qc.getQueryData<Post>(["post", id]);
    // 3) 캐시 낙관적 수정 → 하트 즉시 토글
    qc.setQueryData<Post>(["post", id], (old) =>
      old ? { ...old, liked: next } : old,
    );
    return { prev };            // → onError로 전달
  },
  onError: (_e, _next, ctx) => {
    if (ctx?.prev) qc.setQueryData(["post", id], ctx.prev);  // 원상복구
  },
});
```

### onMutate 3단계, 각각 왜 필요한가

**1) `cancelQueries` — 왜 취소부터?**
낙관적으로 캐시를 `liked: true`로 바꿔놨는데, 마침 백그라운드에서 `["post", id]` refetch가 진행 중이었다면? 그 refetch가 늦게 끝나면서 서버의 옛 데이터(`liked` 없음)로 캐시를 **덮어써버린다** → 낙관값이 날아감. 그래서 낙관적 수정 전에 진행 중인 요청을 먼저 취소한다.

**2) `getQueryData` 스냅샷 — 롤백 대비**
실패하면 되돌려야 하므로, 바꾸기 **직전** 값을 저장해 `context`로 넘긴다. onError가 이 스냅샷으로 캐시를 복구한다.

**3) `setQueryData` — 동기 캐시 쓰기**
`invalidateQueries`(재요청)가 아니라 `setQueryData`(즉시 로컬 수정)를 쓴다. 네트워크 왕복 없이 캐시가 바로 바뀌고, 이 캐시를 구독하는 화면이 즉시 리렌더 → 하트가 딸깍 바뀐다.

### 실측 결과

- **성공 경로**: 탭 → 즉시 `♥ 좋아요 취소`(빨강)로 flip. 서버 응답을 안 기다림.
- **실패 경로**: 가짜 API가 40% 확률로 throw → `♥`로 잠깐 바뀌었다가 `onError` 롤백으로 `♡`로 되돌아오고 "저장 실패 — 자동 되돌림" 배너 표시.

### ⚠️ 핵심 교훈: invalidate **범위**

```tsx
// 실서버라면 onSettled에서:
qc.invalidateQueries({ queryKey: ["post", id] });   // ← ["post", id]만! 넓게 잡지 말 것
```

이건 이전에 분석한 **Tailo PR #59 (좋아요 리셋 버그)** 와 정확히 같은 함정이다. 댓글 CRUD 후 `invalidateQueries(['feed', feedId])`처럼 **범위를 넓게** 잡으면, 좋아요와 무관한 피드 전체가 refetch되면서 낙관적 좋아요 상태를 덮어써 리셋시킨다. 교훈:

> **한 페이지가 여러 도메인(피드·좋아요·댓글)을 공유하면, mutation의 캐시 무효화 범위를 그 mutation이 실제로 바꾼 키로 최대한 좁혀라.**

이 학습 앱에서는 가짜 API가 like를 **저장하지 않아서** onSettled invalidate를 아예 생략했다(refetch하면 서버엔 like가 없어 낙관값이 날아가므로). 실서버에서는 onSettled에 좁은 invalidate를 넣어 최종 동기화한다.

### 왜 pending에도 버튼을 비활성화 안 했나

```tsx
onPress={() => likeMutation.mutate(!liked)}   // disabled 없음
```

낙관적 업데이트의 목적이 "즉시 반응"이다. 요청 중(`isPending`)이라고 버튼을 잠그면 즉시성이 사라진다. 이미 캐시가 바뀌어 UI에 반영됐으니 잠글 이유가 없다.

---

## PR #3 — SectionList 구간별 보기

### FlatList vs SectionList

같은 가상화(virtualization) 리스트지만 데이터 모양이 다르다.

| | FlatList | SectionList |
|--|--|--|
| 데이터 prop | `data={평평한 배열}` | `sections={[{title, data}, ...]}` |
| 헤더 | `ListHeaderComponent`(1개) | `renderSectionHeader`(섹션마다) |
| sticky 헤더 | 없음 | `stickySectionHeadersEnabled` (iOS 기본 on) |
| 용도 | 단순 목록 | 그룹핑된 목록(A~Z 연락처, 날짜별 등) |

### `sections` 모양 만들기 — `groupByTens`

```tsx
function groupByTens(posts: Post[]): { title: string; data: Post[] }[] {
  const buckets = new Map<number, Post[]>();
  for (const p of posts) {
    const start = Math.floor((p.id - 1) / 10) * 10 + 1;  // 1~10→1, 11~20→11
    const arr = buckets.get(start);
    if (arr) arr.push(p);
    else buckets.set(start, [p]);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([start, data]) => ({ title: `#${start}–${start + 9}`, data }));
}
```

`Math.floor((id - 1) / 10) * 10 + 1` — id를 10칸 구간의 **시작값**으로 매핑. id 1~10은 모두 1, 11~20은 11. Map으로 그룹핑 후 `{title, data}[]` 모양으로 변환. SectionList가 이 모양을 그대로 먹는다.

### 캐시 공유 — `usePostsInfinite` 훅 추출

FeedList와 SectionList 화면이 **같은 데이터**를 다르게 보여줄 뿐이므로, 쿼리 옵션을 훅으로 묶어 재사용한다.

```tsx
function usePostsInfinite() {
  return useInfiniteQuery({
    queryKey: ["posts"],            // ← 두 화면 동일 키
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,
  });
}
```

**왜 중복 호출이 안전한가**: TanStack Query는 `queryKey`로 캐시를 식별한다. 두 컴포넌트가 같은 `["posts"]` 키로 `useInfiniteQuery`를 호출해도 **캐시 항목은 하나**, 네트워크 요청도 한 번만 나간다(dedupe). FeedList에서 이미 3페이지를 받아놨다면, SectionList로 넘어갈 때 그 캐시를 **즉시** 그대로 쓴다(재요청 없음).

> 훅 추출의 진짜 이득: `getNextPageParam` 같은 페이징 로직이 한 곳에만 있다. 두 화면에 복붙했다면 로직 수정 시 두 곳을 고쳐야 한다.

### `useMemo`로 그룹핑 결과 메모이즈

```tsx
const sections = useMemo(
  () => groupByTens(data?.pages.flat() ?? []),
  [data],
);
```

`groupByTens`는 매 렌더마다 배열을 새로 만든다. 리렌더가 잦은 리스트 화면에서 `data`가 안 바뀌었는데 매번 재계산 + 새 배열 참조를 SectionList에 넘기면 불필요한 작업이 생긴다. `data`가 바뀔 때만 재계산하도록 `useMemo`로 감쌌다.

### sticky 헤더 배경색

```tsx
sectionHeader: {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: "700",
  backgroundColor: "#0f1115",   // ★ sticky 시 아래 행이 비쳐 보이지 않게
  paddingVertical: 8,
},
```

sticky 헤더는 스크롤 시 리스트 상단에 **고정**되면서 아래 행들이 그 뒤로 지나간다. 배경색이 없으면(투명) 지나가는 행 텍스트가 헤더 글자와 겹쳐 보인다. 화면 배경과 같은 색을 깔아 불투명하게 만든다.

---

## 관통 개념 정리

### TanStack Query 캐시 조작 3형제

| 메서드 | 하는 일 | 언제 |
|--|--|--|
| `invalidateQueries` | 캐시를 stale 표시 → **재요청** | 서버가 진실. 최신 데이터 다시 받고 싶을 때 |
| `setQueryData` | 캐시를 **로컬에서 즉시 수정** (네트워크 X) | 낙관적 업데이트, 응답으로 캐시 직접 갱신 |
| `cancelQueries` | 진행 중 요청 **취소** | 낙관적 수정이 늦게 온 응답에 덮이는 것 방지 |

낙관적 업데이트 = 이 셋의 조합이다: cancel → snapshot(get) → set → (실패 시) set으로 롤백.

### 웹 React → RN 이 챕터의 차이 요약

- **이미지**: 브라우저가 알아서 하던 캐시/재활용을 RN에선 `recyclingKey`·`cachePolicy`로 직접 관리.
- **리스트**: `.map()`으로 다 그리던 걸 FlatList/SectionList 가상화로. 재활용 때문에 이미지 잔상 이슈가 생김.
- **데이터 페칭**: TanStack Query 자체는 웹과 동일. 다만 무한스크롤 트리거가 스크롤 이벤트가 아니라 `onEndReached`.

## 복습 체크리스트

> 답이 막히면 위 해당 섹션으로. 코드를 안 보고 **말로 설명**할 수 있어야 통과.

- [ ] `recyclingKey`가 없으면 왜 잔상이 생기는지 (FlatList 재활용) 설명 가능한가? — [`FlatList`](https://reactnative.dev/docs/flatlist) · [expo-image `recyclingKey`](https://docs.expo.dev/versions/v54.0.0/sdk/image/#recyclingkey)
- [ ] `cachePolicy` 4값의 차이와 언제 `memory-disk`를 쓰는가? — [expo-image `cachePolicy`](https://docs.expo.dev/versions/v54.0.0/sdk/image/#cachepolicy)
- [ ] `useMutation`의 onMutate → mutationFn → onError/onSuccess → onSettled 순서를 그릴 수 있나? — [`useMutation`](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation)
- [ ] onMutate에서 `cancelQueries`를 먼저 부르는 이유는? — [Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
- [ ] 낙관적 업데이트에서 `invalidateQueries`가 아니라 `setQueryData`를 쓰는 이유는? — [Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
- [ ] invalidate 범위를 좁혀야 하는 이유 (PR #59 버그) 를 코드로 재현할 수 있나? — [Query Invalidation](https://tanstack.com/query/v5/docs/framework/react/guides/query-invalidation)
- [ ] 두 화면이 같은 `queryKey`를 쓰면 요청이 몇 번 나가는가? — [Query Keys](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys)
- [ ] FlatList `data`와 SectionList `sections`의 모양 차이는? — [`SectionList`](https://reactnative.dev/docs/sectionlist)
