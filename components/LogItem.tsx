import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { LogEntry } from "../types/log";
import { Card } from "./Card";

type LogItemProps = {
  entry: LogEntry;
  onPress: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

export default function LogItem({ entry, onPress, style }: LogItemProps) {
  return (
    <Card style={style}>
      <Pressable
        onPress={() => onPress(entry.id)}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
      >
        <Text style={styles.title}>{entry.title}</Text>
        <Text numberOfLines={2}>{entry.body}</Text>
        <Text style={styles.time}>
          {new Date(entry.createdAt).toLocaleTimeString("ko-KR")}
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 4 },
  pressed: { opacity: 0.6 },
  title: { fontSize: 18, fontWeight: "600" },
  time: { fontSize: 12, color: "#888" },
});
