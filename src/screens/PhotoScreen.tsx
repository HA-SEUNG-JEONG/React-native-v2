import { useState } from "react";
import { Linking, Text, View } from "react-native";
import { Image } from "expo-image";
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// 권한 플로우 데모: 확인 → 요청 → 거부 처리 → 실행.
// 웹과 가장 다른 지점. 웹은 거부돼도 대개 기능만 빠지지만, 모바일은 OS가
// 재요청 자체를 막아버려서(canAskAgain=false) 앱이 설정 앱으로 안내해야 한다.
export function PhotoScreen(
  _: NativeStackScreenProps<HomeStackParamList, "Photo">,
) {
  // 훅 버전 권한 API. status는 렌더에서 읽을 수 있어 거부 상태 UI를 만들기 좋다.
  // 최초엔 조회 전이라 null → optional chaining 필수.
  const [status, requestPermission] = useMediaLibraryPermissions();
  const [uri, setUri] = useState<string | null>(null);

  // 영구 거부: 요청해봐야 OS 다이얼로그가 안 뜸 → 설정 앱으로 보내는 수밖에 없음
  const blocked = status?.granted === false && !status.canAskAgain;

  const pick = async () => {
    if (!status?.granted) {
      // ★ requestPermission()의 반환값을 써야 함. status는 이번 렌더에 고정된
      //   값이라 요청 직후에도 아직 옛날 값 (setState 직후 읽기와 같은 함정).
      const res = await requestPermission();
      // 거부는 여기서 조용히 끝. 화면 아래 배너가 상태와 다음 행동을 알려준다.
      // (여기서 바로 openSettings 하면 유저는 영문도 모르고 앱 밖으로 튕김)
      if (!res.granted) return;
    }

    const result = await launchImageLibraryAsync({ mediaTypes: "images" });
    if (result.canceled) return; // 유저가 갤러리에서 취소 → 기존 선택 유지
    setUri(result.assets[0].uri);
  };

  return (
    <View style={[styles.screen, styles.pad]}>
      {uri ? (
        <Image style={styles.image} source={uri} contentFit="cover" />
      ) : (
        <Text style={styles.hint}>선택된 사진 없음</Text>
      )}

      <Btn label="갤러리에서 사진 선택" onPress={pick} />

      {blocked && (
        <>
          <Text style={styles.hint}>
            사진 권한이 꺼져 있음. 앱에서 다시 물어볼 수 없어 설정에서 직접 켜야
            함.
          </Text>
          <Btn
            label="설정 열기"
            onPress={() => Linking.openSettings()}
            kind="ghost"
          />
        </>
      )}
    </View>
  );
}
