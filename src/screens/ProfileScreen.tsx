import { useState } from "react";
import { View, Text } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { TabParamList } from "../navigation/types";
import { useAuth } from "../auth/AuthContext";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// Profile 탭: 로그아웃 → 인증 네비게이터로 자동 전환됨 (redirect 코드 없음)
export function ProfileScreen(
  _: BottomTabScreenProps<TabParamList, "ProfileTab">,
) {
  const { user, signOut, persistError, clearPersistError } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      clearPersistError?.();
    } catch (e) {
      // signOut error is handled by auth context
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View style={[styles.screen, styles.pad]}>
      <Text style={styles.h1}>{user}</Text>
      <Text style={styles.hint}>
        로그아웃하면 이 스택 전체가 언마운트 → 뒤로가기로 못 돌아옴.
      </Text>
      <Btn
        label={isSigningOut ? "로그아웃 중…" : "로그아웃"}
        onPress={handleSignOut}
        disabled={isSigningOut}
        kind="danger"
      />
      {persistError && <Text style={styles.hint}>{persistError}</Text>}
    </View>
  );
}
