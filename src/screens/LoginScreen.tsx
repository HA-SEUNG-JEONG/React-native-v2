import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AuthStackParamList } from "../navigation/types";
import { useAuth } from "../auth/AuthContext";
import { login } from "../api/auth";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// react-hook-form + zod: 스키마 하나가 타입(z.infer)과 검증 규칙을 동시에 준다.
// 웹과 동일한 라이브러리 — RN에서 다른 건 TextInput뿐, 폼 로직은 그대로 재활용.
const schema = z.object({
  username: z.string().min(2, "2자 이상 입력"),
  password: z.string().min(4, "4자 이상 입력"),
});
type FormValues = z.infer<typeof schema>;

// 로그인 화면 (미인증 시 유일 화면)
export function LoginScreen(
  _: NativeStackScreenProps<AuthStackParamList, "Login">,
) {
  const { signIn, persistError } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoginError(null);
    try {
      // api/auth.ts가 액세스/리프레시 토큰 세션을 발급 — 뒤 네트워킹 화면이 이 세션으로 데모함.
      await login(values.username, values.password);
      signIn(values.username);
    } catch (e) {
      setLoginError((e as Error).message);
    }
  };

  return (
    // 키보드가 인풋을 가리는 걸 막음. iOS는 화면을 padding만큼 밀어올리고,
    // Android는 height 조정 — 플랫폼별 동작 방식이 다름.
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.pad, styles.center, { flex: 1 }]}>
        <Text style={styles.h1}>로그인</Text>
        <Text style={styles.hint}>데모 비밀번호: 1234</Text>

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="아이디"
              placeholderTextColor="#8a92a6"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.username && (
          <Text style={styles.hint}>{errors.username.message}</Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#8a92a6"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.hint}>{errors.password.message}</Text>
        )}

        <Btn
          label={isSubmitting ? "로그인 중…" : "로그인"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
        {(loginError || persistError) && (
          <Text style={styles.hint}>{loginError ?? persistError}</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
