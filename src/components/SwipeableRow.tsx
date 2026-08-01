import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { styles } from "../theme/styles";

const DELETE_THRESHOLD = -80;
const OFFSCREEN = -400;

// 좌측 스와이프 = 삭제, 롱프레스 = 옵션 시트. 두 제스처가 같은 행 위에서 충돌하지
// 않도록 Gesture.Race — 먼저 조건을 만족한(가로로 움직이거나, 안 움직이고 오래 누른)
// 쪽이 승리하고 나머지는 자동 취소됨.
export function SwipeableRow({
  children,
  onDelete,
  onLongPress,
}: {
  children: ReactNode;
  onDelete: () => void;
  onLongPress: () => void;
}) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        translateX.value = withTiming(
          OFFSCREEN,
          { duration: 200 },
          (finished) => {
            if (finished) runOnJS(onDelete)();
          },
        );
      } else {
        translateX.value = withSpring(0);
      }
    });

  const longPress = Gesture.LongPress()
    .minDuration(400)
    .onStart(() => runOnJS(onLongPress)());

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View>
      <View style={styles.swipeDeleteBg}>
        <Text style={styles.swipeDeleteText}>삭제</Text>
      </View>
      {/* Race: pan과 longPress는 상호배타적 — 먼저 조건을 만족한 것만 처리되고 나머지는 취소됨 */}
      <GestureDetector gesture={Gesture.Race(pan, longPress)}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
