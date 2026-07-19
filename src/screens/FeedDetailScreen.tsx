import { View, Text, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { fetchPost, toggleLikeApi, type Post } from "../api/posts";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// 상세: route.params의 id로 단건 조회. 딥링크(picsel://feed/:id)로 목록 없이 바로
// 들어와도 자립하도록 목록 캐시가 아닌 자체 useQuery로 가져온다.
export function FeedDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "FeedDetail">) {
  const { id } = route.params;
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
  const likeMutation = useMutation({
    mutationFn: (next: boolean) => toggleLikeApi(next),
    onMutate: async (next) => {
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
    onError: (_e, _next, ctx) => {
      if (ctx?.prev) qc.setQueryData(["post", id], ctx.prev); // 원상복구
    },
    // 실서버라면 onSettled에서 invalidateQueries로 최종 동기화.
    // 여기 가짜 API는 like를 저장 안 해서 refetch하면 낙관값이 날아감 → 생략.
  });
  const liked = post?.liked ?? false;

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
        <Text style={styles.hint}>{(error as Error).message}</Text>
        <Btn label="다시 시도" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, styles.pad]}>
      <Text style={styles.h1}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.rowSub}>딥링크: picsel://feed/{id}</Text>
      <Btn
        label={liked ? "♥ 좋아요 취소" : "♡ 좋아요"}
        // 낙관적이라 pending에도 비활성화 안 함 — 즉시 반영이 핵심
        onPress={() => likeMutation.mutate(!liked)}
        kind={liked ? "danger" : "primary"}
      />
      {likeMutation.isError && (
        <Text style={styles.hint}>저장 실패 — 자동 되돌림. 다시 시도.</Text>
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
    </View>
  );
}
