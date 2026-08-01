import * as FileSystem from "expo-file-system/legacy";

// ============================================================
// P6 W16 — 네트워킹 심화: 재시도/백오프, 업로드 진행률, WebSocket
//
// W15(NetworkScreen 인터셉터)의 후속. 업로드 진행률 콜백은 신규 class 기반
// FileSystem API엔 없고 legacy(createUploadTask)에만 있어 `expo-file-system/legacy`로 임포트.
// ============================================================

export type RetryAttempt = { attempt: number; delayMs: number };

// 지수 백오프 + jitter. maxRetries=3이면 최대 4번 시도(최초 1 + 재시도 3).
// onAttempt로 화면에 시도 로그를 실시간 노출.
export async function withRetryBackoff<T>(
  fn: () => Promise<T>,
  {
    maxRetries = 3,
    baseDelayMs = 500,
    onAttempt,
  }: {
    maxRetries?: number;
    baseDelayMs?: number;
    onAttempt?: (info: RetryAttempt) => void;
  } = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= maxRetries) throw e;
      const delayMs = baseDelayMs * 2 ** attempt + Math.random() * baseDelayMs;
      onAttempt?.({ attempt: attempt + 1, delayMs });
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// 데모용 가짜 API — toggleLikeApi와 같은 패턴(인위적 실패율)으로 재시도 동작을 눈으로 확인.
export async function flakyFetch(): Promise<string> {
  await new Promise((r) => setTimeout(r, 300));
  if (Math.random() < 0.6) throw new Error("일시적 네트워크 오류");
  return "성공";
}

export type UploadProgress = { sent: number; total: number; ratio: number };

// httpbin.org/post는 받은 요청을 그대로 echo 응답하는 공개 테스트 엔드포인트 — 실서버 없이 진행률 데모 목적.
export function uploadWithProgress(
  fileUri: string,
  onProgress: (p: UploadProgress) => void,
): Promise<FileSystem.FileSystemUploadResult> {
  const task = FileSystem.createUploadTask(
    "https://httpbin.org/post",
    fileUri,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
      mimeType: "image/jpeg",
    },
    ({ totalBytesSent, totalBytesExpectedToSend }) => {
      onProgress({
        sent: totalBytesSent,
        total: totalBytesExpectedToSend,
        ratio:
          totalBytesExpectedToSend > 0
            ? totalBytesSent / totalBytesExpectedToSend
            : 0,
      });
    },
  );
  return task.uploadAsync().then((result) => {
    if (!result) throw new Error("업로드 결과 없음");
    return result;
  });
}

export type EchoSocketHandlers = {
  onOpen?: () => void;
  onMessage?: (data: string) => void;
  onClose?: (event: { code: number; reason: string }) => void;
  onError?: (message: string) => void;
};

// postman-echo의 공개 raw WebSocket echo 서버 — 보낸 메시지를 그대로 돌려줌.
// 재연결 정책은 화면(호출부)이 onClose에서 결정 — 여기선 연결 자체만 담당.
export function connectEchoSocket(handlers: EchoSocketHandlers): WebSocket {
  const ws = new WebSocket("wss://ws.postman-echo.com/raw");
  ws.onopen = () => handlers.onOpen?.();
  ws.onmessage = (e) => handlers.onMessage?.(String(e.data));
  ws.onclose = (e) => handlers.onClose?.({ code: e.code, reason: e.reason });
  ws.onerror = () => handlers.onError?.("WebSocket 오류");
  return ws;
}
