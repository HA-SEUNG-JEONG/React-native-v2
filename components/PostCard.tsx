import { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { Post } from "../data/mock-posts";
import { Card } from "./Card";

type PostCardProps = {
  post: Post;
  onPress: (id: number) => void;
};

export const PostCard = memo(function PostCard({
  post,
  onPress,
}: PostCardProps) {
  return (
    <Card style={styles.card}>
      <Pressable onPress={() => onPress(post.id)} style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {post.title}
        </Text>
        <Text numberOfLines={2}>{post.body}</Text>
      </Pressable>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 6 },
  content: { gap: 4 },
  title: { fontSize: 18, fontWeight: "600" },
});
