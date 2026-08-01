import { View, Text, ActivityIndicator } from "react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import {
  useQuery,
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { TOGGLE_LIKE_KEY, fetchPost, type Post } from "../api/posts";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// 상세: route.params의 id로 단건 조회. 딥링크(picsel://feed/:id)로 목록 없이 바로
// 들어와도 자립하도록 목록 캐시가 아닌 자체 useQuery로 가져온다.
export function FeedDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "FeedDetail">) {
  const { id } = route.params;

  // Guard against missing id (e.g., deep-link without id)
  if (!id) {
    return (
      <View style={[styles.screen, styles.pad, styles.center]}>
        <Text style={styles.h1}>글을 찾을 수 없음</Text>
        <Btn label="← 뒤로" onPress={() => navigation.goBack()} />
      </View>
    );
  }
  const qc = useQueryClient();
  const {
    data: post,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  // ★ 낙관적 업데이트: 서버 응답 기다리지 않고 캐시를 먼저 바꿔 화면 즉시 반영.
  //   실패하면 스냅샷으로 롤백. (PR #59 교훈 — invalidate 범위를 ["post", id]로 좁게)
  //
  // mutationFn은 여기 없음 — posts.ts의 setMutationDefaults(TOGGLE_LIKE_KEY)에 등록됨.
  // 오프라인일 때 이 뮤테이션은 paused 상태로 캐시와 함께 영속화되고, 앱을 다시 열어
  // 온라인이 되면 컴포넌트가 마운트 안 돼 있어도 재생(sync)된다 — 그러려면 mutationFn이
  // "등록"되어 있어야 하는데, useMutation 안에만 넣으면 재시작 후 유실됨.
  const likeMutation = useMutation({
    mutationKey: TOGGLE_LIKE_KEY,
    onMutate: async ({ next }: { id: string; next: boolean }) => {
      // 1) 진행 중 refetch 취소 — 안 그러면 늦게 온 응답이 낙관값을 덮어씀
      await qc.cancelQueries({ queryKey: ["post", id] });
      // 2) 롤백용 스냅샷
      const prev = qc.getQueryData<Post>(["post", id]);
      // 3) 캐시 낙관적 수정 → 하트 즉시 토글
      qc.setQueryData<Post>(["post", id], (old) =>
        old ? { ...old, liked: next } : old,
      );
      return { prev }; // onError로 전달됨
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["post", id], ctx.prev); // 원상복구
    },
  });
  const liked = post?.liked ?? false;

  // 이 글의 좋아요가 오프라인이라 큐에 걸려 있는지 — 재연결 시 자동 재생됨을 알림.
  // status "pending"만 보면 온라인 중 600ms 진행 중인 정상 요청도 잡힘 — isPaused로 좁힘.
  const pendingSync = useMutationState({
    filters: { mutationKey: TOGGLE_LIKE_KEY, status: "pending" },
    select: (m) => ({
      id: (m.state.variables as { id: string }).id,
      isPaused: m.state.isPaused,
    }),
  }).some((v) => v.id === id && v.isPaused);

  if (isPending) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color="#93c5fd" />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={[styles.screen, styles.pad, styles.center]}>
        <Text style={styles.h1}>에러</Text>
        <Text style={styles.hint}>{error instanceof Error ? error.message : String(error)}</Text>
        <Btn label="다시 시도" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    // P7 — 목록에서 밀고 들어오는 느낌 + 내용 페이드인. 진짜 shared-element 없이도
    // "부드러운 전환" 체감은 충분 — 무거운 라이브러리 없이 Reanimated 내장 프리셋만.
    <Animated.View
      entering={SlideInRight.duration(220)}
      style={[styles.screen, styles.pad]}
    >
      <Animated.View entering={FadeIn.duration(400).delay(100)}>
        <Text style={styles.h1}>{post.title}</Text>
      </Animated.View>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.rowSub}>딥링크: picsel://feed/{id}</Text>
      {pendingSync && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            오프라인 — 재연결되면 좋아요가 자동으로 동기화됨
          </Text>
        </View>
      )}
      <Btn
        label={liked ? "♥ 좋아요 취소" : "♡ 좋아요"}
        // 낙관적이라 pending에도 비활성화 안 함 — 즉시 반영이 핵심
        onPress={() => likeMutation.mutate({ id, next: !liked })}
        kind={liked ? "danger" : "primary"}
      />
      {likeMutation.isError && (
        <Text style={styles.hint}>
          저장 실패 — 자동 되돌림. 서버와 상태가 어긋났을 수 있음, 다시 시도.
        </Text>
      )}
      <Btn
        label="같은 화면 push (스택 쌓기)"
        onPress={() => navigation.push("FeedDetail", route.params)}
      />
      <Btn
        label="← 뒤로 (pop)"
        onPress={() => navigation.goBack()}
        kind="ghost"
      />
    </Animated.View>
  );
}
