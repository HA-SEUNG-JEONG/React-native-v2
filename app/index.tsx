import { FlatList, StyleSheet, Text, View } from "react-native";

import { MOCK_POSTS, Post } from "@/data/mock-posts";

import { Link } from "expo-router";
import { useCallback, useState } from "react";
import { PostCard } from "@/components/PostCard";

export default function FeedScreen() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setPosts((prev) => {
        const id = Math.max(...prev.map((p) => p.id)) + 1;
        return [
          {
            id,
            userId: 1,
            title: `새 글 ${id}`,
            body: `새 글 본문 ${id} ...`,
          },
          ...prev,
        ];
      });
      setRefreshing(false);
    }, 1000);
  };

  const handlePostPress = useCallback((id: number) => console.log(id), []);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard post={item} onPress={handlePostPress} />
    ),
    [handlePostPress],
  );

  return (
    <View style={{ flex: 1 }}>
      <Link href="/write" style={styles.link}>
        글쓰기
      </Link>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <Text style={styles.feedCount}>피드 {posts.length}개</Text>
        }
        ListEmptyComponent={<Text style={styles.empty}>글이 없습니다</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  link: { padding: 12 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#ccc" },
  feedCount: { padding: 16, fontWeight: "600" },
  empty: { padding: 16, textAlign: "center" },
});
