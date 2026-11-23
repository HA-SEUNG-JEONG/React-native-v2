import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TextInputSubmitEditingEvent,
  View,
} from "react-native";

import { MOCK_POSTS, Post } from "@/data/mock-posts";

import { useHeaderHeight } from "@react-navigation/elements";
import { useCallback, useRef, useState } from "react";
import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import LogItem from "@/components/LogItem";
import { PostCard } from "@/components/PostCard";
import { LogEntry } from "@/types/log";

type TabState = "log" | "feed";

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

export default function Index() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [entries, setEntries] = useState<LogEntry[]>([]);
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

  const ref = useRef<TextInput>(null);
  const headerHeight = useHeaderHeight();

  const canSave = title.trim() !== "";

  const handleSave = () => {
    const newEntry: LogEntry = {
      id: String(Date.now()),
      title,
      body,
      createdAt: Date.now(),
    };
    setEntries([newEntry, ...entries]);
    setTitle("");
    setBody("");
    Keyboard.dismiss();
  };

  return (
    <View style={{ flex: 1, marginHorizontal: 0 }}>
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
          behavior={Platform.select({
            ios: "padding",
            android: "height",
          })}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
        >
          <View style={[styles.container, { flex: 1 }]}>
            <View style={styles.header}>
              <Text style={styles.diary}>오늘의 기록</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString("ko-KR")}
              </Text>
            </View>
            <TextInput
              placeholder="제목"
              value={title}
              onChangeText={(text: string) => setTitle(text)}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={(e: TextInputSubmitEditingEvent) =>
                ref.current?.focus()
              }
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
            <AppButton
              title="저장"
              variant="primary"
              onPress={handleSave}
              disabled={!canSave}
            />
            <AppButton
              title="전체 삭제"
              variant="danger"
              onPress={() => setEntries([])}
              disabled={entries.length === 0}
            />
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              ItemSeparatorComponent={() => <View style={styles.logGap} />}
              ListEmptyComponent={<EmptyState message="아직 기록이 없어요" />}
              renderItem={({ item }) => (
                <LogItem
                  entry={item}
                  onPress={(id) => console.log(id)}
                  style={{ padding: 0 }}
                />
              )}
            />
          </View>
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
  logGap: { height: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },
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
  sectionHeader: {
    padding: 16,
    fontWeight: "700",
    backgroundColor: "#fff",
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#ccc" },
  feedCount: { padding: 16, fontWeight: "600" },
  empty: { padding: 16, textAlign: "center" },
});
