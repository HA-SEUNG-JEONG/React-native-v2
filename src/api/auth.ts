// ============================================================
// P6 W15 — 네트워킹 기초: 인터셉터 + 토큰 갱신 레이스
//
// 실제 서버 없이 메모리 세션으로 흉내. 핵심은 "동시에 여러 요청이 401을
// 만나도 실제 리프레시 호출은 1번만" — refreshInFlight로 진행 중인 갱신
// Promise를 공유(dedupe)해서 레이스를 막는다.
// ============================================================

type Tokens = {
  accessToken: string;
  accessExpiresAt: number;
  refreshToken: string;
};

const ACCESS_TTL_MS = 4000; // 데모용 — 실서비스는 보통 수분~수십 분

let session: Tokens | null = null;
let refreshInFlight: Promise<Tokens> | null = null;
let loginInFlight: Promise<void> | null = null;
let refreshCount = 0;

export function getRefreshCount() {
  return refreshCount;
}

export function isLoggedIn() {
  return session !== null;
}

export function logout() {
  session = null;
  refreshInFlight = null;
}

function issueTokens(): Tokens {
  return {
    accessToken: `access-${Math.random().toString(36).slice(2, 8)}`,
    accessExpiresAt: Date.now() + ACCESS_TTL_MS,
    refreshToken: `refresh-${Math.random().toString(36).slice(2, 8)}`,
  };
}

export async function login(username: string, password: string): Promise<void> {
  if (loginInFlight) return loginInFlight;
  loginInFlight = (async () => {
    await new Promise((r) => setTimeout(r, 400));
    if (password !== "1234")
      throw new Error("비밀번호가 틀림 (데모 비밀번호: 1234)");
    session = issueTokens();
  })().finally(() => {
    loginInFlight = null;
  });
  return loginInFlight;
}

// 서버가 accessToken을 검증한다고 가정 — 여기선 만료 시각만 비교해 401을 흉내.
async function callProtectedApi(accessToken: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 300));
  if (
    !session ||
    session.accessToken !== accessToken ||
    Date.now() > session.accessExpiresAt
  ) {
    const err = new Error("401 액세스 토큰 만료");
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
  return `보호된 데이터 (${accessToken})`;
}

function refreshAccessToken(): Promise<Tokens> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    await new Promise((r) => setTimeout(r, 600));
    if (!session) throw new Error("리프레시 토큰 없음 — 재로그인 필요");
    refreshCount += 1;
    session = issueTokens();
    return session;
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

// 인터셉터: 401 받으면 갱신 후 1회만 재시도.
export async function fetchProtected(): Promise<string> {
  if (!session) throw new Error("로그인 필요");
  try {
    return await callProtectedApi(session.accessToken);
  } catch (e) {
    if ((e as Error & { status?: number }).status !== 401) throw e;
    await refreshAccessToken();
    if (!session) throw new Error("not authenticated");
    return callProtectedApi(session.accessToken);
  }
}
