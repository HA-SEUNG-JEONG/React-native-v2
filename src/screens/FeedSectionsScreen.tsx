import { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  SectionList,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { usePostsInfinite, groupByTens } from "../api/posts";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// SectionList 데모: 같은 ["posts"] 캐시를 id 구간별 섹션으로 묶어 표시.
// FlatList와 차이 = data 대신 sections({title,data}[]), sticky 섹션 헤더 지원.
export function FeedSectionsScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "FeedSections">) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
    refetch,
  } = usePostsInfinite();

  const sections = useMemo(() => groupByTens(data?.pages.flat() ?? []), [data]);

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
    <SectionList
      style={styles.screen}
      contentContainerStyle={styles.pad}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      stickySectionHeadersEnabled
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color="#93c5fd" style={{ paddingVertical: 16 }} />
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() =>
            navigation.navigate("FeedDetail", {
              id: String(item.id),
              title: item.title,
            })
          }
        >
          <Text
            style={[styles.rowTitle, styles.rowTitleFlex]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.rowSub}>#{item.id}</Text>
        </Pressable>
      )}
    />
  );
}
