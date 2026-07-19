import { Pressable, Text } from "react-native";
import { styles } from "../theme/styles";

// 공용 버튼 — kind로 색만 바꿈. Pressable style에 ({pressed}) 함수를 줘 눌림 상태 표현.
// cascade가 없으니 style 배열로 겹쳐 쌓음(뒤 요소가 앞을 덮음).
export function Btn({
  label,
  onPress,
  kind = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  kind?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        styles[`btn_${kind}`],
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.btnText, kind === "ghost" && { color: "#93c5fd" }]}>
        {label}
      </Text>
    </Pressable>
  );
}
