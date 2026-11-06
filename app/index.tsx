import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  StyleSheet,
  View,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  SectionList,
} from "react-native";

import { MOCK_POSTS, Post } from "../data/mock-posts";

import { useState, useRef, useCallback, memo } from "react";
import { useHeaderHeight } from "@react-navigation/elements";

type TabState = "log" | "feed";

type Entry = {
  id: string;
  title: string;
  body: string;
  image?: ImageSourcePropType;
};

type PostSection = { title: string; data: Post[] };

const groupByUser = (posts: Post[]): PostSection[] => {
  const map = new Map<number, Post[]>();
  for (const post of posts) {
    const list = map.get(post.userId);
    if (list) list.push(post);
    else map.set(post.userId, [post]);
  }
  return Array.from(map, ([userId, data]) => ({
    title: `User ${userId}`,
    data,
  }));
};

const PostCard = memo(function PostCard({ post }: { post: Post }) {
  console.log("PostCard render", post.id); // TEMP: 렌더 횟수 측정용, 검증 후 제거
  return (
    <View style={styles.postCard}>
      <Text style={styles.title} numberOfLines={1}>
        {post.title}
      </Text>
      <Text numberOfLines={2}>{post.body}</Text>
    </View>
  );
});

const ENTRIES: Entry[] = [
  {
    id: "1",
    title: "아침 러닝",
    body: "한강변을 5km 달렸다. 날씨가 선선해서 페이스가 좋았고 끝나고 먹은 아침이 맛있었다. 이 본문은 두 줄을 넘겨서 말줄임표가 붙는지 확인하기 위해 일부러 길게 썼다.",
    image: require("../assets/images/icon.png"),
  },
  {
    id: "2",
    title: "React Native 공부",
    body: "코어 컴포넌트를 훑었다.",
    image: { uri: "https://reactnative.dev/img/tiny_logo.png" },
  },
  {
    id: "3",
    title: "저녁 독서",
    body: "책을 30쪽 읽었다.",
    image: require("../assets/images/icon.png"),
  },
];

export default function Index() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [entries, setEntries] = useState<Entry[]>(ENTRIES);
  const [tab, setTab] = useState<TabState>("log");

  const [posts, setPosts] = useState(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const sections = groupByUser(posts);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setPosts((prev) => {
        const id = Math.max(...prev.map((p) => p.id)) + 1;
        return [
          { id, userId: 1, title: `새 글 ${id}`, body: `새 글 본문 ${id} ...` },
          ...prev,
        ];
      });
      setRefreshing(false);
    }, 1000);
  };

  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} />,
    [],
  );

  const ref = useRef<TextInput>(null);
  const headerHeight = useHeaderHeight();

  const canSave = title.trim() !== "";

  const handleSave = () => {
    const newEntry: Entry = { id: String(Date.now()), title, body };
    setEntries([newEntry, ...entries]);
    setTitle("");
    setBody("");
    Keyboard.dismiss();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setTab("log")}
          style={[styles.tabButton, tab === "log" && styles.tabActive]}
        >
          <Text>기록</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("feed")}
          style={[styles.tabButton, tab === "feed" && styles.tabActive]}
        >
          <Text>피드</Text>
        </Pressable>
      </View>
      {tab === "log" ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.select({ ios: "padding", android: "height" })}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.diary}>오늘의 기록</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString("ko-KR")}
              </Text>
            </View>
            <TextInput
              placeholder="제목"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={() => ref.current?.focus()}
            />
            <TextInput
              placeholder="본문"
              multiline
              textAlignVertical="top"
              maxLength={200}
              value={body}
              onChangeText={setBody}
              ref={ref}
              style={[styles.input, styles.bodyInput]}
            />
            <Text>{body.length}/200</Text>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={[styles.saveButton, !canSave && styles.disabled]}
            >
              <Text>저장</Text>
            </Pressable>
            {entries.map((entry) => (
              <Pressable
                key={entry.id}
                onPress={() => console.log(entry.id)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                ]}
              >
                {entry.image && (
                  <Image
                    source={entry.image}
                    style={styles.thumb}
                    alt={entry.title}
                  />
                )}
                <View style={styles.textArea}>
                  <Text style={styles.title}>{entry.title}</Text>
                  <Text numberOfLines={2}>{entry.body}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          stickySectionHeadersEnabled={true}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <Text style={styles.feedCount}>피드 {posts.length}개</Text>
          }
          ListEmptyComponent={<Text style={styles.empty}>글이 없습니다</Text>}
        />
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "600" },
  container: { padding: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diary: { fontSize: 24, fontWeight: "bold" },
  date: { fontSize: 14 },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  textArea: { flex: 1 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
    }),
  },
  pressed: { opacity: 0.6 },
  saveButton: {
    backgroundColor: "rgba(17, 14, 204, 0.33)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabled: { opacity: 0.2 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  bodyInput: { minHeight: 100 },
  tabBar: { flexDirection: "row", gap: 8, padding: 12 },
  tabButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tabActive: { backgroundColor: "rgba(17, 14, 204, 0.33)" },
  postCard: { padding: 16, gap: 4 },
  sectionHeader: {
    padding: 16,
    fontWeight: "700",
    backgroundColor: "#fff",
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#ccc" },
  feedCount: { padding: 16, fontWeight: "600" },
  empty: { padding: 16, textAlign: "center" },
});
