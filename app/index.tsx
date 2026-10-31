import {
  Image,
  Pressable,
  ScrollView,
  Text,
  StyleSheet,
  View,
  Platform,
} from "react-native";

const ENTRIES = [
  {
    id: 1,
    title: "아침 러닝",
    body: "한강변을 5km 달렸다. 날씨가 선선해서 페이스가 좋았고 끝나고 먹은 아침이 맛있었다. 이 본문은 두 줄을 넘겨서 말줄임표가 붙는지 확인하기 위해 일부러 길게 썼다.",
    image: require("../assets/images/icon.png"),
  },
  {
    id: 2,
    title: "React Native 공부",
    body: "코어 컴포넌트를 훑었다.",
    image: { uri: "https://reactnative.dev/img/tiny_logo.png" },
  },
  {
    id: 3,
    title: "저녁 독서",
    body: "책을 30쪽 읽었다.",
    image: require("../assets/images/icon.png"),
  },
];

export default function Index() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.diary}>오늘의 기록</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("ko-KR")}
        </Text>
      </View>
      {ENTRIES.map((entry) => (
        <Pressable
          key={entry.id}
          onPress={() => console.log(entry.id)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Image source={entry.image} style={styles.thumb} alt={entry.title} />
          <View style={styles.textArea}>
            <Text style={styles.title}>{entry.title}</Text>
            <Text numberOfLines={2}>{entry.body}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
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
});
