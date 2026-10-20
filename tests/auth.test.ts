import { test } from "node:test";
import assert from "node:assert/strict";
import { login, fetchProtected, getRefreshCount } from "../src/api/auth.ts";

// 동시 401이 나도 실제 토큰 갱신은 1번만 (refreshInFlight Promise 공유).
test("concurrent 401s trigger a single refresh", async () => {
  await login("u", "1234");
  await new Promise((r) => setTimeout(r, 4100)); // ACCESS_TTL_MS(4000) 경과 → 만료
  const results = await Promise.all([
    fetchProtected(),
    fetchProtected(),
    fetchProtected(),
  ]);
  assert.equal(getRefreshCount(), 1);
  assert.equal(new Set(results).size, 1); // 셋 다 갱신된 같은 토큰으로 성공
});
