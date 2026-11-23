import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
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
});
