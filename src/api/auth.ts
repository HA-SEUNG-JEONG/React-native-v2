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

let session: Tokens | null = null; //  현재 로그인 상태
let refreshInFlight: Promise<Tokens> | null = null; // 진행 중인 토큰 갱신 Promise. 갱신 중복 호출 막는 용도
let loginInFlight: Promise<void> | null = null; // 진행 중인 로그인 Promise, 로그인 버튼 연타 방어
let refreshCount = 0; // 실제 갱신이 몇 번 일어났는지 센 카운터

let generation = 0; // 로그아웃마다 +1 — 이전 세대에서 시작한 비동기 작업을 무효화

export function getRefreshCount() {
  return refreshCount;
}

export function isLoggedIn() {
  return session !== null;
}

export function logout() {
  generation += 1;
  session = null;
  refreshInFlight = null;
  loginInFlight = null;
  refreshCount = 0;
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
  const myGen = generation;
  loginInFlight = (async () => {
    await new Promise((r) => setTimeout(r, 400));
    if (password !== "1234")
      throw new Error("비밀번호가 틀림 (데모 비밀번호: 1234)");
    if (myGen !== generation) throw new Error("로그아웃됨 — 로그인 취소");
    session = issueTokens();
  })().finally(() => {
    if (myGen === generation) loginInFlight = null;
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
  const myGen = generation;
  refreshInFlight = (async () => {
    await new Promise((r) => setTimeout(r, 600));
    if (myGen !== generation) throw new Error("로그아웃됨 — 갱신 취소");
    if (!session) throw new Error("리프레시 토큰 없음 — 재로그인 필요");
    refreshCount += 1;
    session = issueTokens();
    return session;
  })().finally(() => {
    if (myGen === generation) refreshInFlight = null;
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
