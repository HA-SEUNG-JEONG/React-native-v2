import { Image, Pressable, ScrollView, Text } from "react-native";

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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>오늘의 기록</Text>
      {ENTRIES.map((entry) => (
        <Pressable
          key={entry.id}
          onPress={() => console.log(entry.id)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Image
            source={entry.image}
            style={{ width: 64, height: 64 }}
            alt={entry.title}
          />
          <Text style={{ fontSize: 18, fontWeight: "600" }}>{entry.title}</Text>
          <Text numberOfLines={2}>{entry.body}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
