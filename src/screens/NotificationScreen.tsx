import { useEffect, useState } from "react";
import { Linking, Text, View, Platform } from "react-native";
import * as ExpoLinking from "expo-linking";
import * as Notifications from "expo-notifications";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

// expo-notifications엔 카메라/위치처럼 훅 버전 권한 API가 없음 — 직접 상태로 관리.
// Android 13+는 채널이 있어야 권한 프롬프트가 뜬다(문서: "must opt-in via a
// permissions prompt" — 채널 생성이 그 전제조건). iOS는 채널 개념 자체가 없음.
export function NotificationScreen(
  _: NativeStackScreenProps<HomeStackParamList, "Notification">,
) {
  const [status, setStatus] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [scheduled, setScheduled] = useState(0);

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "기본",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
    Notifications.getPermissionsAsync().then(setStatus);

    // 알림을 탭했을 때(포그라운드/백그라운드 공통) content.data.url을 앱 딥링크로
    // 열어 기존 navigation/index.tsx의 linking 설정을 그대로 태운다 — 새 네비게이션
    // 로직을 따로 안 만들고 이미 있는 URL → 화면 매핑을 재사용.
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url;
        if (typeof url === "string") Linking.openURL(url);
      },
    );
    return () => sub.remove();
  }, []);

  // 카메라/위치와 같은 패턴: 영구 거부면 요청해도 OS 다이얼로그가 안 뜬다.
  const blocked = status?.granted === false && !status.canAskAgain;

  const requestPermission = async () => {
    const res = await Notifications.requestPermissionsAsync();
    setStatus(res);
  };

  const scheduleNow = async () => {
    if (!status?.granted) {
      const res = await Notifications.requestPermissionsAsync();
      setStatus(res);
      if (!res.granted) return;
    }
    // trigger: null = 즉시 표시
    await Notifications.scheduleNotificationAsync({
      content: { title: "즉시 알림", body: `${scheduled + 1}번째 테스트` },
      trigger: null,
    });
    setScheduled((n) => n + 1);
  };

  const scheduleDelayed = async () => {
    if (!status?.granted) {
      const res = await Notifications.requestPermissionsAsync();
      setStatus(res);
      if (!res.granted) return;
    }
    // data.url: 탭하면 위 리스너가 이 딥링크를 열어 피드 상세로 이동한다.
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "5초 후 알림",
        body: "탭하면 피드 상세로 이동함 (앱을 백그라운드로 보내도 옴)",
        data: { url: ExpoLinking.createURL("/feed/1") },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
      },
    });
    setScheduled((n) => n + 1);
  };

  return (
    <View style={[styles.screen, styles.pad]}>
      <Text style={styles.hint}>
        권한 상태: {status ? (status.granted ? "허용됨" : "거부됨") : "조회 중"}
      </Text>
      <Btn label="알림 권한 요청" onPress={requestPermission} />
      <Btn label="즉시 알림 보내기" onPress={scheduleNow} kind="ghost" />
      <Btn label="5초 후 알림 예약" onPress={scheduleDelayed} kind="ghost" />
      <Text style={styles.hint}>예약 누적: {scheduled}건</Text>
      {blocked && (
        <>
          <Text style={styles.hint}>
            알림 권한이 꺼져 있음. 앱에서 다시 물어볼 수 없어 설정에서 직접 켜야
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
