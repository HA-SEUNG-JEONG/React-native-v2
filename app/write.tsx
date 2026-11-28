import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useHeaderHeight } from "@react-navigation/elements";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { AppButton } from "@/components/AppButton";
import { EmptyState } from "@/components/EmptyState";
import LogItem from "@/components/LogItem";
import { LogEntry } from "@/types/log";

export default function WriteScreen() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [entries, setEntries] = useState<LogEntry[]>([]);

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({
        ios: "padding",
        android: "height",
      })}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      <View style={[styles.container, { flex: 1 }]}>
        <Link href="/">피드</Link>
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
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diary: { fontSize: 24, fontWeight: "bold" },
  date: { fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },
  bodyInput: { minHeight: 100 },
  logGap: { height: 12 },
});
