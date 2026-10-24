# Day 4 · 10/27 (화) — 미션 1-1 WebSocket 언마운트 후 재연결 누수

> **오늘의 핵심**: `close()`를 호출한 시점과 `onClose`가 불리는 시점은 다르다. 그래서 cleanup이 끝난 뒤에도 새 재연결 타이머가 생길 수 있다.

**시작 상태**: `src/screens/NetworkScreen.tsx`의 언마운트 cleanup `useEffect`가 통째로 없고 `useEffect` import도 지웠다. 두 단계다. ① cleanup 복원(소켓 `close()`와 재연결 타이머 `clearTimeout`). ② 복원한 cleanup만으로 충분한지 재현으로 확인하고, 남는 누수를 막는다. 규칙: [rules.md](./rules.md)

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch`, `nvm use 22.21.1`, 어제 "내일 할 일" 확인
- [ ] 05~20 읽기: `src/api/network.ts`의 `connectEchoSocket`과 `src/screens/NetworkScreen.tsx` 전체(특히 `wsRef`·`manualCloseRef`·`timeoutRef`, 언마운트 cleanup 자리, `openSocket`, `onClose`) → 적을 것: `p6-study-guide.md` W16 절의 WebSocket 수명주기에서 `close()`와 close 이벤트의 순서
- [ ] 20~30 가설: "화면을 나간 뒤에 무엇이 남아서 돌까?"를 후보 2~3개로 적는다 → 적을 것: 후보마다 "맞다면 Metro 로그에 이렇게 찍힌다" (화면 로그는 언마운트 후에는 안 보이므로 로그로 확인하는 설계가 필요하다)
- [ ] 30~40 ① cleanup 복원: `NetworkScreen.tsx`에 언마운트 cleanup `useEffect`를 직접 타이핑 (소켓 `close()` + 재연결 타이머 `clearTimeout`). 이 상태가 이 미션의 "변경 전"이다
- [ ] 40~55 재현 (임시 코드 있음): `connectEchoSocket`의 `onopen`/`onclose`에 임시 `console.log` → 연결 → 뒤로 가기 → Metro 터미널에서 close 로그 이후 500ms 이상 뒤에 open이 다시 찍히는지 본다 → 재연결 대기 중에 "연결" 버튼을 눌러 소켓이 둘이 되는지도 한 번 시도
- [ ] 55~75 ② 남는 누수 막기: 코딩 전에 아래 `## 참고`의 "정할 것" 4개를 한 줄씩 정한 뒤 직접 수정한다
- [ ] 75~80 검증: 같은 재현을 반복해 open 로그가 다시 찍히지 않는지, 임시 로그를 모두 지웠는지 `git diff`로 `src/api/network.ts`가 깨끗한지 본다
- [ ] 80~90 기록: `docs/improve/reviews/1-1.md`(처음 가설과 틀린 곳, 선택한 플래그 방식과 버린 방식), 내일 할 일 한 줄

## 끝 조건
1. 재현을 반복해도 화면을 나간 뒤 open 로그가 다시 찍히지 않는다. 회귀도 본다: 화면 안에서 "연결 끊기"와 서버발 끊김의 자동 재연결(최대 3회)이 기존처럼 동작한다 (`npm test`에는 이 화면 테스트가 없으므로 시뮬레이터가 유일한 검증).
2. 검증 4종(typecheck · test · eslint · 재현 재실행) 통과 + 임시 로그를 모두 지웠다 (미션 §6 체크).
3. 말로 설명: `close()` 호출 시점과 `onClose` 호출 시점이 왜 다른가.

## 막히면
- 복원 직후에도 누수가 안 재현되면 재연결 대기 중(타이머가 살아 있는 구간)에 화면을 나가는 타이밍을 바꿔 본다. 그래도 15분이면 `1-1 힌트 1`(방향)을 요청한다.
- 플래그 방식 선택이 막히면 StrictMode와 재마운트에서 어떻게 되는지가 힌트 3에 설명돼 있다. `1-1 힌트 3`(함정)까지 요청한다.
- 플래그를 세우는 시점과 `close()` 호출의 순서가 헷갈리면 순서가 바뀌면 무슨 일이 생기는지를 먼저 글로 쓴 뒤 `1-1 힌트 2`(API 이름)를 요청한다.

## 참고 (아래로 밀어 둠)
- **미션 문서**: [tier1-bugs.md](../improve/tier1-bugs.md) 미션 1-1. 읽을 학습 가이드 절: `p6-study-guide.md` W16 절 ([p6-study-guide.md](../p6-study-guide.md)).
- **재현 순서 주의**: 스텁 상태에서는 화면을 나가도 소켓이 닫히지 않아 close 로그 자체가 찍히지 않는다. 재현은 ① 복원 직후의 상태에서 한다.
- **코딩 전에 한 줄씩 정할 것**:
  - 이미 있는 `manualCloseRef`를 재사용할지, 별도 "언마운트됨" 플래그를 둘지. 각각 StrictMode와 재마운트에서 어떻게 될지(힌트 3에 설명)를 비교하고 고른다.
  - 플래그를 세우는 시점과 `close()` 호출의 **순서**. 순서가 바뀌면 무슨 일이 생기는지 설명할 수 있어야 한다.
  - `openSocket` 첫 줄이 플래그를 `false`로 되돌리는 점이 내 설계와 충돌하지 않는지.
  - 언마운트 후 `setWsConnected`/`appendLog`까지 막을지.
- **수정 중 확인**: 없음 (원본에 별도 항목 없음).
- **임시 코드 되돌릴 곳**: `connectEchoSocket`의 `onopen`/`onclose` 로그 → `src/api/network.ts`. 끝나면 `git diff`로 `network.ts`가 깨끗한지 본다.
- **기록 포인트**: 처음 가설이 무엇이었고 어디가 틀렸는지, 선택한 플래그 방식과 버린 방식.
- **다음**: [Day 5~6](./day-05.md) 1-2 (10/28 수).
