import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  login,
  logout,
  isLoggedIn,
  fetchProtected,
  getRefreshCount,
} from "../src/api/auth.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 모듈 상태가 테스트 사이로 새지 않게 매번 로그아웃.
afterEach(() => logout());

// 동시 401이 나도 실제 토큰 갱신은 1번만 (refreshInFlight Promise 공유).
test("concurrent 401s trigger a single refresh", async () => {
  await login("u", "1234");
  await sleep(4100); // ACCESS_TTL_MS(4000) 경과 → 만료
  const results = await Promise.all([
    fetchProtected(),
    fetchProtected(),
    fetchProtected(),
  ]);
  assert.equal(getRefreshCount(), 1);
  assert.equal(new Set(results).size, 1); // 셋 다 갱신된 같은 토큰으로 성공
});

test("logout clears the session", async () => {
  await login("u", "1234");
  assert.equal(isLoggedIn(), true);
  logout();
  assert.equal(isLoggedIn(), false);
});

// 경로 B: 로그인 진행 중 로그아웃 → 로그인이 로그아웃을 되살리면 안 됨.
test("logout during login cancels the login", async () => {
  const p = login("u", "1234");
  logout();
  await assert.rejects(p, /로그아웃됨/);
  assert.equal(isLoggedIn(), false);
});

// 옛 login의 .finally가 새 login의 loginInFlight를 지우면 안 됨.
test("stale login does not clobber a newer login", async () => {
  const old = login("u", "1234");
  logout();
  const fresh = login("u", "1234");
  await assert.rejects(old, /로그아웃됨/);
  await fresh;
  assert.equal(isLoggedIn(), true);
});

// 경로 C: 갱신 진행 중 로그아웃 → 갱신이 세션을 되살리면 안 됨.
test("logout during refresh cancels the refresh", async () => {
  await login("u", "1234");
  await sleep(4100);
  const p = fetchProtected();
  await sleep(500); // callProtectedApi(300ms) 401 → 갱신(600ms) 진행 중
  logout();
  await assert.rejects(p, /로그아웃됨/);
  assert.equal(isLoggedIn(), false);
  assert.equal(getRefreshCount(), 0);
});
