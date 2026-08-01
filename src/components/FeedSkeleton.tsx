import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { styles } from "../theme/styles";

// 초기 로딩 스피너 대신 실제 행 모양 shimmer — "곧 이렇게 채워진다"는 예고라
// 스피너보다 체감 대기시간이 짧게 느껴짐.
export function FeedSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const shimmer = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.pad}>
      {[0, 1, 2, 3].map((i) => (
        <Animated.View key={i} style={[styles.row, shimmer]}>
          <View style={styles.skeletonThumb} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={[styles.skeletonLine, { width: "70%" }]} />
            <View style={[styles.skeletonLine, { width: "40%" }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}
