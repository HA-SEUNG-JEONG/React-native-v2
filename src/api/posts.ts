import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";
import {
  QueryClient,
  focusManager,
  onlineManager,
  useInfiniteQuery,
} from "@tanstack/react-query";

// ============================================================
// P4 — TanStack Query 무한스크롤 (실 API)
//
// 웹과 다른 핵심: 스크롤 이벤트 직접 안 씀. FlatList onEndReached가 다음 페이지 트리거.
//  - useInfiniteQuery: data.pages = 페이지별 배열의 배열(2차원). flat()으로 펼쳐 FlatList에 전달.
//  - getNextPageParam: 다음 페이지 번호 리턴 = 계속, undefined = 끝.
//  - onEndReached 가드(hasNextPage && !isFetchingNextPage) 없으면 중복 호출 폭탄.
// ============================================================
export const PAGE_SIZE = 10;
const API = "https://jsonplaceholder.typicode.com/posts";

// liked = 서버가 안 주는 클라 전용 필드. 낙관적 업데이트로 캐시에만 써넣음.
export type Post = { id: number; title: string; body: string; liked?: boolean };

export async function fetchPosts(page: number): Promise<Post[]> {
  const res = await fetch(`${API}?_page=${page}&_limit=${PAGE_SIZE}`);
  if (!res.ok) throw new Error(`목록 불러오기 실패 (${res.status})`);
  return res.json();
}

// 가짜 좋아요 API — jsonplaceholder는 like 저장 안 함. 지연 + 40% 랜덤 실패로
// 낙관적 업데이트의 "즉시 반영 후 실패 시 롤백"을 눈으로 보게 함.
export async function toggleLikeApi(
  next: boolean,
): Promise<{ liked: boolean }> {
  await new Promise((r) => setTimeout(r, 600));
  if (Math.random() < 0.4) throw new Error("좋아요 저장 실패 (서버 오류)");
  return { liked: next };
}

export async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error(`글 불러오기 실패 (${res.status})`);
  return res.json();
}

export const queryClient = new QueryClient();

// onlineManager 연결 — netinfo로 온라인/오프라인을 React Query에 알림 (import 시 1회 등록)
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (state) => {
    handleFocus(state === "active");
  });
  return () => sub.remove();
});

// 무한스크롤 쿼리 옵션 — FeedList와 SectionList 화면이 같은 캐시(["posts"])를 공유.
// 훅으로 묶어 두 곳 중복 제거. 키가 같아 React Query가 자동 dedupe.
export function usePostsInfinite() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,
  });
}

// 평평한 posts → id 10칸 구간별 섹션. SectionList는 {title, data}[] 모양을 먹음.
export function groupByTens(posts: Post[]): { title: string; data: Post[] }[] {
  const buckets = new Map<number, Post[]>();
  for (const p of posts) {
    const start = Math.floor((p.id - 1) / 10) * 10 + 1;
    const arr = buckets.get(start);
    if (arr) arr.push(p);
    else buckets.set(start, [p]);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([start, data]) => ({ title: `#${start}–${start + 9}`, data }));
}
