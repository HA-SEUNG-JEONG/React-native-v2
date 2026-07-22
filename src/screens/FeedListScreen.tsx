import { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useFocusEffect } from "@react-navigation/native";
import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type {
  HomeStackParamList,
  RootStackParamList,
} from "../navigation/types";
import { usePostsInfinite } from "../api/posts";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// 목록: FeedList → 항목 누르면 FeedDetail로 이동 (타입 안전 params)
export function FeedListScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "FeedList">) {
  // 탭을 떠났다 돌아올 때마다 로그 (useEffect는 최초 1회만이라 이걸 못 잡음)
  useFocusEffect(
    useCallback(() => {
      console.log("FeedList 포커스됨");
      return () => console.log("FeedList 블러됨");
    }, []),
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isPending,
    isPaused,
    isError,
    error,
  } = usePostsInfinite();

  // data.pages(2차원) → flat으로 1차원화. FlatList는 평평한 배열만 받음.
  const posts = data?.pages.flat() ?? [];

  // 4상태 ①최초 로딩 ②에러 (③빈 ④정상은 아래 FlatList가 처리)
  if (isPending) {
    return (
      <View style={[styles.screen, styles.center, styles.pad]}>
        {isPaused ? (
          // 오프라인이라 쿼리가 pause됨 → 스피너면 무한로딩처럼 보임. 안내로 대체.
          <Text style={styles.hint}>
            오프라인 — 연결되면 자동으로 불러옵니다
          </Text>
        ) : (
          <ActivityIndicator color="#93c5fd" />
        )}
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
    <View style={styles.screen}>
      {/* 데이터 있는데 새로고침이 오프라인으로 막힌 상태 = pause. 배너로 알림. */}
      {isPaused && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>오프라인 — 저장된 내용 표시 중</Text>
        </View>
      )}
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.pad}
        data={posts}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#93c5fd"
            colors={["#93c5fd"]}
          />
        }
        ListEmptyComponent={<Text style={styles.hint}>글이 없음</Text>}
        // 가드 2개 없으면 스크롤 튐마다 중복 호출
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color="#93c5fd"
              style={{ paddingVertical: 16 }}
            />
          ) : null
        }
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <>
            <Text style={styles.hint}>
              아래로 스크롤 = 다음 페이지 자동 로드. 당겨서 새로고침.
            </Text>
            {/* 모달은 조상 네비게이터(RootStack) 소유. getParent로 올라가 navigate.
                  navigate 액션은 처리 가능한 네비게이터까지 자동으로 버블링됨. */}
            <Btn
              label="＋ 새 글 (모달 열기)"
              onPress={() =>
                navigation
                  .getParent<NativeStackNavigationProp<RootStackParamList>>()
                  ?.navigate("Compose")
              }
            />
            <Btn
              label="≡ 구간별 보기 (SectionList)"
              onPress={() => navigation.navigate("FeedSections")}
              kind="ghost"
            />
            <Btn
              label="🖼 사진 선택 (권한 플로우)"
              onPress={() => navigation.navigate("Photo")}
              kind="ghost"
            />
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            // navigate 인자가 HomeStackParamList['FeedDetail'] 모양이 아니면 컴파일 에러
            onPress={() =>
              navigation.navigate("FeedDetail", {
                id: String(item.id),
                title: item.title,
              })
            }
          >
            <Image
              source={{ uri: `https://picsum.photos/seed/${item.id}/100/100` }}
              style={styles.thumb}
              // ★ FlatList가 행 View를 재활용 → recyclingKey 없으면 스크롤 시
              //   이전 item 썸네일이 잠깐 남아 깜빡임. 키 바뀌면 즉시 리셋.
              recyclingKey={String(item.id)}
              cachePolicy="memory-disk" // 메모리+디스크 캐시 → 되돌아가도 재요청 없음
              transition={200} // 페이드인, 툭 튀는 느낌 제거
              contentFit="cover"
            />
            <Text
              style={[styles.rowTitle, styles.rowTitleFlex]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={styles.rowSub}>#{item.id}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
