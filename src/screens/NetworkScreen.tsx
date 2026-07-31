import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { fetchProtected, getRefreshCount } from "../api/auth";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

type LogEntry = { id: number; text: string };

// 네트워킹 기초 데모: 인터셉터(fetchProtected)가 401을 만나면 토큰을 갱신하고
// 1회 재시도. 동시 요청 3개를 던져도 실제 갱신 호출은 1번만 — 아래 버튼으로 확인.
export function NetworkScreen(
  _: NativeStackScreenProps<HomeStackParamList, "Network">,
) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const appendLog = (text: string) =>
    setLogs((prev) => [{ id: prev.length, text }, ...prev]);

  const callOnce = async () => {
    const before = getRefreshCount();
    try {
      const result = await fetchProtected();
      const after = getRefreshCount();
      appendLog(
        after > before
          ? `${result} — 401 → 갱신 → 재시도 성공`
          : `${result} — 갱신 없이 성공`,
      );
    } catch (e) {
      appendLog(`실패: ${(e as Error).message}`);
    }
  };

  const callConcurrent = async () => {
    const before = getRefreshCount();
    const results = await Promise.allSettled([
      fetchProtected(),
      fetchProtected(),
      fetchProtected(),
    ]);
    const after = getRefreshCount();
    const ok = results.filter((r) => r.status === "fulfilled").length;
    appendLog(
      `동시 요청 3개 → 성공 ${ok}건, 실제 갱신 ${after - before}회 (1회여야 레이스 방지 성공)`,
    );
  };

  return (
    <View style={[styles.screen, styles.pad]}>
      <Text style={styles.hint}>
        액세스 토큰은 4초만 유효. 만료 후 호출하면 401 → 인터셉터가 갱신 후
        재시도함. 4초 이상 기다렸다가 버튼을 눌러볼 것.
      </Text>
      <Btn label="보호된 API 호출 (1회)" onPress={callOnce} />
      <Btn
        label="동시 요청 3개 (레이스 테스트)"
        onPress={callConcurrent}
        kind="ghost"
      />
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Text style={styles.rowSub}>{item.text}</Text>
        )}
        ListEmptyComponent={<Text style={styles.hint}>로그 없음</Text>}
      />
    </View>
  );
}
