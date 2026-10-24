# Day 3 · 10/26 (월) — 미션 2-1 + 1-3 (잔여분)

> **오늘의 핵심**: eslint 자동 수정은 포맷만 바꿔야 하고, RN `Text`는 부모 `View`의 글자색을 상속하지 않으므로 스타일 없는 `Text`는 다크 배경에서 안 보인다.

**시작 상태**: 환경·P1 재복습·흐름 A 읽기와 퀴즈는 완료(10/22~23). 오늘은 잔여분 2-1, 1-3과 `reviews/1-3.md` Q3/Q4 보강만 한다. 2-1은 스텁 브랜치 기준선이 3 errors / 2 warnings다. 규칙: [rules.md](./rules.md)

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch`, `nvm use 22.21.1`, 어제 "내일 할 일" 확인
- [ ] 05~30 2-1 eslint 워밍업: `git diff --stat`을 비워 둔 상태에서 `npx eslint . --fix` → `git diff --stat`으로 포맷만 바뀌었는지 확인 → 남은 warning 2건(`NotificationScreen`의 `permissionError`, `ProfileScreen`의 `e`)을 오늘 고칠지 2-6·2-10으로 넘길지 이유 한 줄과 함께 정한다 → 포맷 변경만 `style:` 커밋으로 분리 (`npm run format`은 쓰지 않는다)
- [ ] 30~40 1-3 가설: `src/screens/LocationScreen.tsx`에서 "권한 범위"(`scope`)를 보여 주는 `Text`와 그 주변 `Text`들을 비교해 스타일이 어떻게 다른지 적는다. 그리고 `getCurrentPosition`에서 `console.log(res)`로 iOS·Android 응답을 찍어 본다 → 적을 것: `scope`가 플랫폼별로 응답의 어디에 있는지(타입 선언의 `res.ios.scope`와 실제가 같은지) 한 줄
- [ ] 40~50 1-3 재현(iOS): 홈 → 위치 설정 → 현재 위치 가져오기 → 권한 허용 → "권한 범위" 줄이 보이는지 확인 → 안 보이면 실제 글자색이 무엇이었는지 메모
- [ ] 50~70 1-3 수정·검증: 이 줄의 역할이 "보조 안내"인가 "값 표시"인가를 정하고 `LocationScreen.tsx`의 `styles`에 이미 있는 스타일 중 맞는 것을 고른다 (새 hex 인라인 금지) → 다크 배경에서 읽히는지 확인
- [ ] 70~75 `docs/improve/reviews/1-3.md` Q3 보강: login()·signIn()이 무엇을 어디에 저장하는지 보강 (현재 답안: `login`은 `auth.ts` 메모리, `signIn`은 SecureStore의 user 이름). "같은 저장소인가?"에 한 문장으로 직접 답하고, 저장 값(토큰 / user 이름)과 저장소(`src/api/auth.ts`의 모듈 변수 `session` / `AUTH_KEY` SecureStore)를 짝지어 적는다
- [ ] 75~80 `docs/improve/reviews/1-3.md` Q4 보강: `App.tsx`의 `signOut` 4가지를 코드 호출 순서대로 다시 적고(현재 답안은 "기기 저장소에 있던 것들을 다 지움"으로 뭉뚱그림) 이 브랜치에서 코드에 빠진 것이 무엇인지(`logout()` 본문이 비어 있음 = Day 3의 출발점) 같이 적는다
- [ ] 80~90 기록: `docs/improve/reviews/2-1.md`(전/후 숫자, 경고 처리 결정과 이유)와 1-3 기록, 내일 할 일 한 줄

## 끝 조건
1. `npx eslint .`가 errors 0, warnings 2 (또는 오늘 처리한 만큼). `git diff`에 로직 변경 없음. 1-3은 다크 배경에서 읽히고 새 하드코딩 색 0.
2. 검증 4종(typecheck · test · eslint · 1-3 재현 재실행) 통과.
3. 말로 설명: `eslint-plugin-prettier`가 포맷 차이를 lint error로 보고하는 구조, 어떤 규칙이 자동 수정되고 어떤 것이 안 되는지 / RN `Text`가 부모 `View`의 글자색을 상속하지 않는 이유.

## 막히면
- 2-1: `--fix`가 로직까지 바꾼 것 같으면 해당 줄만 되돌리고 다시 판단한다. warning 처리 이유를 못 쓰겠으면 2-6·2-10으로 넘기고 그 사실만 기록한다. `2-1 힌트 1`부터 요청.
- 1-3: "안 보이는" 이유가 감이 안 오면 `1-3 힌트 1`(방향)부터 요청한다. Android 에뮬레이터는 `scope`가 `null`이라 줄 자체가 없는 것이 정상이다. 에뮬레이터에서만 확인하고 끝내지 않는다.

## 참고 (아래로 밀어 둠)
- **미션 문서**: 2-1은 [tier2-quality.md](../improve/tier2-quality.md) 미션 2-1, 1-3은 [tier1-bugs.md](../improve/tier1-bugs.md) 미션 1-3. 가장 쉬운 미션이다.
- **2-1을 먼저 하는 이유**: 원본에서는 같은 `LocationScreen`의 위치 타임아웃 블록이 prettier 대상이라 2-1을 먼저 해야 1-3 diff가 깨끗했다. 스텁 브랜치는 그 블록이 2-5 스텁이라 해당이 없지만, 순서는 그대로 둬도 무방하다.
- **숫자 차이**: 2-1 문서는 9 errors / 2 warnings로 적었다. 스텁 브랜치 실측은 3 errors / 2 warnings였다. 다르면 그 사실을 기록한다. 스텁 브랜치의 error 3건은 `Btn.tsx`, `ComposeScreen.tsx`, `LoginScreen.tsx`의 prettier다.
- **코딩 전에 정할 것**: warning 2건을 오늘 고칠지 넘길지(변수 삭제나 `_` 접두사로 조용히 넘기면 그 미션에서 할 일이 사라진다) / 1-3 `Text`의 역할(보조 안내 vs 값 표시)과 쓸 기존 스타일. 새 hex를 인라인으로 쓰지 않는다 (3-1에서 정리될 대상을 늘리는 일이다).
- **수정 중 확인**: `git diff --stat`에서 로직이 바뀐 줄이 있으면 되돌린다.
- **임시 코드 되돌릴 곳**: 없음.
- **기록 포인트**: `reviews/2-1.md`는 짧게(전/후 숫자, 경고 처리 결정과 이유). `docs/improve/reviews/` 디렉터리에는 `2-1.md`, `1-3.md`를 둔다.
- **주의(문서 정합)**: `reviews/1-3.md`에는 이미 흐름 A 퀴즈 답안(Q1~Q4)이 있다. 1-3 미션 기록을 같은 파일에 이어 쓸지 정해서 기록 맨 위에 한 줄로 적는다.
- **오늘 밤**: 보지 않고 흐름 A 4단계를 말해 본다. 이전 이월분 1-6은 [Day 1~2](./day-01.md)(10/24~10/25)에서 끝났다. 다음 학습: [Day 4](./day-04.md) 1-1 (10/27 화).
- **다음 버퍼(10/30)**: P1 재복습과 흐름 A 구술은 [Day 7](./day-07.md)의 참고에 있다.
