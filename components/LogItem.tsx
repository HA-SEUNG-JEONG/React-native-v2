import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { LogEntry } from "../types/log";

type LogItemProps = {
  entry: LogEntry;
  onPress: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

export default function LogItem({ entry, onPress, style }: LogItemProps) {
  return (
    <Pressable
      onPress={() => onPress(entry.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <View style={styles.textArea}>
        <Text style={styles.title}>{entry.title}</Text>
        <Text numberOfLines={2}>{entry.body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  textArea: { flex: 1 },
  title: { fontSize: 18, fontWeight: "600" },
});
