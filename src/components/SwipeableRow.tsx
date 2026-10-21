import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { styles } from "../theme/styles";

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
      // TODO(미션 1-2): 임계값(-80)을 넘으면 화면 밖(-400)으로 withTiming 200ms 후 onDelete 호출,
      //   아니면 withSpring(0)으로 원위치. 상수·애니메이션 import는 직접 추가.
      //   onDelete가 아무 일도 안 하면(삭제 무시) 행은 어디에 남아 있을까요?
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
