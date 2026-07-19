import { View, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";
import { useAuth } from "../auth/AuthContext";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// 로그인 화면 (미인증 시 유일 화면)
export function LoginScreen(
  _: NativeStackScreenProps<AuthStackParamList, "Login">,
) {
  const { signIn } = useAuth();
  return (
    <View style={[styles.screen, styles.pad, styles.center]}>
      <Text style={styles.h1}>로그인</Text>
      <Text style={styles.hint}>
        로그인하면 인증 네비게이터 → 앱 네비게이터로 트리가 교체됨.
      </Text>
      <Btn label="하승으로 로그인" onPress={() => signIn("하승")} />
    </View>
  );
}
