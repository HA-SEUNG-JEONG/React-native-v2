import { Linking, Text, View } from "react-native";
import { styles } from "../theme/styles";
import {
  Accuracy,
  getCurrentPositionAsync,
  useForegroundPermissions,
} from "expo-location";
import { Btn } from "../components/Btn";
import { useState } from "react";
import { HomeStackParamList } from "../navigation/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export function LocationScreen(
  _: NativeStackScreenProps<HomeStackParamList, "Location">,
) {
  const [status, requestPermission] = useForegroundPermissions();
  const [scope, setScope] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const blocked = status?.granted === false && !status.canAskAgain;

  const getCurrentPosition = async () => {
    const res = await requestPermission();
    if (!res.granted) {
      return;
    }
    setScope(res.ios?.scope ?? null);
    setErrorMessage(null);

    try {
      const currentLocation = await getCurrentPositionAsync({
        accuracy: Accuracy.Balanced,
      });
      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });
    } catch (e) {
      // 권한 있어도 좌표 못 얻는 경우: 임시권한(한 번만 허용) 워밍업, 실내, GPS 미확보 등
      setErrorMessage(
        e instanceof Error ? e.message : "위치를 가져오지 못했습니다.",
      );
    }
  };

  return (
    <View style={[styles.screen, styles.pad]}>
      <Btn label="현재 위치 가져오기" onPress={() => getCurrentPosition()} />
      {location && (
        <Text
          style={styles.location}
        >{`위도: ${location.latitude} , 경도: ${location.longitude}`}</Text>
      )}
      {blocked && (
        <>
          <Text style={styles.hint}>위치 권한이 꺼져있음</Text>
          <Btn
            label="위치 설정 열기"
            onPress={() => Linking.openSettings()}
            kind="ghost"
          />
        </>
      )}
      {scope && <Text>권한 범위 : {scope}</Text>}
      {errorMessage && <Text style={styles.hint}>{errorMessage}</Text>}
    </View>
  );
}
