import { useRef, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { launchImageLibraryAsync } from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { fetchProtected, getRefreshCount } from "../api/auth";
import {
  connectEchoSocket,
  flakyFetch,
  uploadWithProgress,
  withRetryBackoff,
} from "../api/network";
import { Btn } from "../components/Btn";
import { styles } from "../theme/styles";

type LogEntry = { id: number; text: string };

const WS_MAX_RECONNECT = 3;

// 네트워킹 기초(W15, 인터셉터) + 심화(W16, 재시도·업로드 진행률·WebSocket) 데모.
export function NetworkScreen(
  _: NativeStackScreenProps<HomeStackParamList, "Network">,
) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const appendLog = (text: string) =>
    setLogs((prev) => [{ id: prev.length, text }, ...prev]);

  // ---- W15: 인터셉터 + 토큰 갱신 레이스 ----
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

  // ---- W16: 재시도/백오프 ----
  // flakyFetch는 60% 확률로 실패하는 가짜 API — 재시도 3회(최대 4번 시도) 동안
  // 시도마다 대기시간이 지수로 늘어나는 걸 로그로 확인.
  const retryDemo = async () => {
    try {
      const result = await withRetryBackoff(flakyFetch, {
        maxRetries: 3,
        baseDelayMs: 500,
        onAttempt: ({ attempt, delayMs }) =>
          appendLog(`[재시도] ${attempt}회차 실패 → ${Math.round(delayMs)}ms 대기 후 재시도`),
      });
      appendLog(`[재시도] 최종 ${result}`);
    } catch (e) {
      appendLog(`[재시도] 최대 재시도 초과 — ${(e as Error).message}`);
    }
  };

  // ---- W16: 업로드 진행률 ----
  const [uploadRatio, setUploadRatio] = useState<number | null>(null);

  const pickAndUpload = async () => {
    const picked = await launchImageLibraryAsync({ mediaTypes: "images" });
    if (picked.canceled) return;
    setUploadRatio(0);
    try {
      const result = await uploadWithProgress(picked.assets[0].uri, (p) =>
        setUploadRatio(p.ratio),
      );
      appendLog(`[업로드] 완료 — status ${result.status}`);
    } catch (e) {
      appendLog(`[업로드] 실패 — ${(e as Error).message}`);
    } finally {
      setUploadRatio(null);
    }
  };

  // ---- W16: WebSocket ----
  // wsRef: 현재 연결. manualCloseRef: 사용자가 직접 끊었는지 — 아닐 때만 자동 재연결.
  const wsRef = useRef<WebSocket | null>(null);
  const manualCloseRef = useRef(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsMessage, setWsMessage] = useState("");

  const openSocket = (reconnectAttempt = 0) => {
    manualCloseRef.current = false;
    const ws = connectEchoSocket({
      onOpen: () => {
        setWsConnected(true);
        appendLog(
          reconnectAttempt > 0
            ? `[WS] 재연결 성공 (${reconnectAttempt}회 시도 끝)`
            : "[WS] 연결됨",
        );
      },
      onMessage: (data) => appendLog(`[WS] 수신: ${data}`),
      onClose: () => {
        setWsConnected(false);
        if (manualCloseRef.current) {
          appendLog("[WS] 연결 종료(직접 끊음)");
          return;
        }
        if (reconnectAttempt >= WS_MAX_RECONNECT) {
          appendLog(`[WS] 재연결 ${WS_MAX_RECONNECT}회 실패 — 중단`);
          return;
        }
        const delayMs = 500 * 2 ** reconnectAttempt;
        appendLog(`[WS] 연결 끊김 — ${delayMs}ms 후 재연결 시도 (${reconnectAttempt + 1}회차)`);
        setTimeout(() => openSocket(reconnectAttempt + 1), delayMs);
      },
      onError: (message) => appendLog(`[WS] 오류: ${message}`),
    });
    wsRef.current = ws;
  };

  const disconnectSocket = () => {
    manualCloseRef.current = true;
    wsRef.current?.close();
  };

  const sendMessage = () => {
    if (!wsMessage.trim() || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(wsMessage);
    appendLog(`[WS] 송신: ${wsMessage}`);
    setWsMessage("");
  };

  return (
    <View style={[styles.screen, styles.pad]}>
      <Text style={styles.sectionHeader}>인터셉터 (W15)</Text>
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

      <Text style={styles.sectionHeader}>재시도/백오프 (W16)</Text>
      <Text style={styles.hint}>60% 확률로 실패하는 가짜 API — 지수 백오프로 최대 3회 재시도.</Text>
      <Btn label="재시도 데모 실행" onPress={retryDemo} kind="ghost" />

      <Text style={styles.sectionHeader}>업로드 진행률 (W16)</Text>
      <Btn label="갤러리에서 선택 후 업로드" onPress={pickAndUpload} kind="ghost" />
      {uploadRatio !== null && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(uploadRatio * 100)}%` }]} />
        </View>
      )}

      <Text style={styles.sectionHeader}>WebSocket (W16)</Text>
      <Text style={styles.hint}>
        공개 echo 서버 — 보낸 메시지를 그대로 돌려줌. 연결 끊기면 지수
        백오프로 자동 재연결(최대 {WS_MAX_RECONNECT}회).
      </Text>
      {wsConnected ? (
        <Btn label="연결 끊기" onPress={disconnectSocket} kind="danger" />
      ) : (
        <Btn label="연결" onPress={() => openSocket()} kind="ghost" />
      )}
      {wsConnected && (
        <>
          <TextInput
            style={styles.input}
            value={wsMessage}
            onChangeText={setWsMessage}
            placeholder="보낼 메시지"
            placeholderTextColor="#8a92a6"
            onSubmitEditing={sendMessage}
          />
          <Btn label="전송" onPress={sendMessage} />
        </>
      )}

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
