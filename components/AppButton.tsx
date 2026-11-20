import { Pressable, StyleSheet, Text } from "react-native";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "danger";
  disabled?: boolean;
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primary: { backgroundColor: "rgba(17, 14, 204, 0.33)" },
  danger: { backgroundColor: "rgba(204, 14, 14, 0.33)" },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.2 },
  text: { fontWeight: "600" },
});
