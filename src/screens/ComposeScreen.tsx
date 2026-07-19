import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import type { RootStackParamList } from "../navigation/types";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// 모달 화면 (RootStack에서 presentation:'modal'로 등록 → 아래에서 위로 슬라이드)
const AVATAR_SOURCE = { uri: "https://picsum.photos/200" };

export function ComposeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Compose">) {
  const [isLoading, setIsLoading] = useState(true);
  const bodyRef = useRef<TextInput>(null);
  const headerHeight = useHeaderHeight();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const insets = useSafeAreaInsets();
  return (
    // 바깥 = screen(flex:1, 배경). 화면 꽉 채움.
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight as number}
    >
      {/* 내용 = flex:1로 자라서 footer를 바닥으로 밀어냄 (sticky footer 원리) */}
      <ScrollView
        contentContainerStyle={[styles.pad, styles.modal, { flexGrow: 1 }]}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.h1}>새 글 (모달)</Text>
        <Text style={styles.hint}>
          {
            "presentation:'modal' → 카드가 아래서 위로. 스와이프 다운으로 닫힘(iOS)."
          }
        </Text>
        <TextInput
          value={title}
          autoCorrect
          onChangeText={setTitle} // ← 웹 onChange 아님. 문자열 바로 옴
          placeholder="제목"
          placeholderTextColor="#8a92a6" // 다크배경 → 회색 직접 (#8a92a6 등)
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => bodyRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextInput
          ref={bodyRef}
          value={body}
          onChangeText={setBody}
          placeholder="본문"
          placeholderTextColor="#8a92a6"
          multiline
          style={[styles.input, styles.inputMultiline]}
          autoCorrect
          maxLength={20}
        />
        <Text style={styles.length}>{body.length} / 20</Text>
        <View style={{ width: 200, height: 200 }}>
          <Image
            cachePolicy="disk"
            source={AVATAR_SOURCE}
            style={{ width: 200, height: 200 }}
            contentFit="cover"
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(error) => {
              setIsLoading(false);
              console.error(error.error);
            }}
          />
          {isLoading && (
            <ActivityIndicator
              style={{ position: "absolute", top: 90, left: 90 }}
            />
          )}
        </View>
      </ScrollView>
      {/* 바닥 바 = 버튼만. inset은 정적 스타일 아니므로 inline으로 덧댐. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btn_ghost,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            navigation.goBack();
          }}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          android_ripple={{ color: "#2b3446", radius: 80 }}
        >
          <Text style={[styles.btnText, { color: "#93c5fd" }]}>닫기</Text>
        </Pressable>
        <Btn
          label="저장"
          onPress={() => {
            console.log("저장:", title, body); // ponytail: 실제 저장 로직(서버/스토어) 없음. 학습 목적
            navigation.goBack();
          }}
          disabled={title.trim() === "" || body.trim() === ""}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
