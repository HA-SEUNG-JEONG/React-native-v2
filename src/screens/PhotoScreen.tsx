import { useState } from "react";
import { Linking, Text, View } from "react-native";
import { Image } from "expo-image";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  useCameraPermissions,
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

  const [cameraStatus, cameraRequestPermission] = useCameraPermissions();

  const [uri, setUri] = useState<string | null>(null);

  // 영구 거부: 요청해봐야 OS 다이얼로그가 안 뜸 → 설정 앱으로 보내는 수밖에 없음
  const blocked = cameraStatus?.granted === false && !cameraStatus.canAskAgain;

  const takePhoto = async () => {
    if (!cameraStatus?.granted) {
      const res = await cameraRequestPermission();
      if (!res.granted) return;
    }
    const result = await launchCameraAsync({ mediaTypes: "images" });
    if (result.canceled) return;
    setUri(result.assets[0].uri);
  };

  const pickPhoto = async () => {
    const result = await launchImageLibraryAsync({ mediaTypes: "images" });
    if (result.canceled) return;
    setUri(result.assets[0].uri);
  };

  return (
    <View style={[styles.screen, styles.pad]}>
      {uri ? (
        <Image style={styles.image} source={uri} contentFit="cover" />
      ) : (
        <Text style={styles.hint}>선택된 사진 없음</Text>
      )}

      <Btn label="갤러리에서 사진 선택" onPress={pickPhoto} />
      <Btn label="카메라로 촬영" onPress={takePhoto} />
      {blocked && (
        <>
          <Text style={styles.hint}>
            카메라 권한이 꺼져 있음. 앱에서 다시 물어볼 수 없어 설정에서 직접
            켜야 함.
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
