# Day 8 · 10/31 (토) — 미션 1-4 딥링크 id 검증 + 알림 `data.url` 검증 (📱 일부) · 1/2일차: 허용 목록 · `fetchPost` 복원 · id 검증
> **오늘의 핵심**: 외부에서 들어오는 값(딥링크 `:id`, 알림 `data.url`)은 신뢰 경계다. "막을 것"이 아니라 "허용할 것"을 먼저 정의하고, 검증(허용 목록)과 인코딩은 각각 다른 것을 막는다.

**시작 상태**: (a) `src/api/posts.ts`의 `fetchPost`가 항상 `throw new Error("미구현 ...")`라 지금은 피드 상세가 어떤 id로도 열리지 않는다. (b) `App.tsx`에 알림 탭 처리가 통째로 없다(`Linking` import도 지움). 알림을 눌러도 아무 일도 없다. 그래서 **복원이 검증보다 먼저**다. ① `fetchPost` 기본 요청 ② 알림 응답 → `Linking.openURL` 훅 ③ 그 위에 검증. 재현은 ①②를 검증 없이 단순하게 복원한 뒤에야 가능하고, 그래야 "검증 전/후"가 비교된다. 흐름 C의 입구다. 규칙: [rules.md](./rules.md)

**난이도**: Tier 1에서 가장 넓다. 첫째 날(10/31)은 **허용 목록과 id 검증까지 확실히**, 알림 훅과 url 검증은 둘째 날(11/1)에 한다. 구현이 남으면 11/2에 1-4를 먼저 끝내고, 1-5(선행: 1-4, [Day 10](./day-10.md))는 11/6 버퍼로 민다.


## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch`, `nvm use 22.21.1`, 어제 "내일 할 일" 확인
- [ ] 05~20 읽기: 흐름 C 중 `src/screens/NotificationScreen.tsx`(알림 예약, `data.url`), `src/navigation/index.tsx`의 `linking`(`prefixes`, `config`), `FeedDetailScreen.tsx`, `posts.ts`의 `fetchPost` → 적을 것: `FeedDetailScreen.tsx`가 `fetchPost`를 어떻게 부르는지(쿼리 키, 에러 처리). 스텁이라 `fetchPost`는 읽을 코드가 없다
- [ ] 20~35 허용 목록 표 작성: 아래 `## 참고`의 표 두 행 중 딥링크 `:id` 행과 `data.url` 행의 "허용할 것"을 코드를 고치기 전에 글로 채운다 → 적을 것: 검증(허용 목록)과 인코딩이 각각 무엇을 막는지 한 줄씩
- [ ] 35~45 `fetchPost` 복원: `src/api/posts.ts`에 기본 요청을 직접 타이핑 (검증 없이 단순판) → 피드 상세가 열리는지 확인
- [ ] 45~55 (a) id 재현: `FeedDetailScreen`에 임시로 `route.params.id`를 로그로 찍어 React Navigation이 디코딩해 넘기는지 본다 → `Linking.createURL("/")`의 반환값도 임시 로그로 확인해 정확한 접두사를 얻고, 그 접두사 뒤에 `feed/abc`를 붙여 `xcrun simctl openurl booted ...`로 연다
- [ ] 55~80 id 검증 수정: 검증 위치(`fetchPost` 직전 / `FeedDetailScreen` 진입 / 라우팅 config 중 모든 호출 경로가 지나는 곳)와 실패 시 동작을 한 줄씩 정한 뒤 직접 수정 → 정상 링크 `feed/1`은 기존대로, 비정상 id는 요청이 안 나가거나 안전하게 처리되는지 Metro 로그로 확인
- [ ] 80~90 기록: `docs/improve/reviews/1-4.md`에 허용 목록 표 그대로, 검증과 인코딩의 구분, 내일 할 일 한 줄

## 끝 조건
1. 정상 링크 `feed/1`은 기존대로 열리고, 비정상 id(`abc` 등)는 서버 요청 자체가 안 나가거나 안전하게 처리된다 (Metro 로그로 요청 URL 확인).
2. 검증 4종(typecheck · `npm test`(순수 모듈 테스트를 추가했다면) · eslint · 링크 재실행) 통과. 임시 로그 2종(`FeedDetailScreen`의 `route.params.id`, `Linking.createURL`)을 지웠다.
3. 말로 설명: 외부에서 오는 URL과 `data.url`을 왜 그대로 믿으면 안 되나?


## 막히면
- 1일차 복원/재현: `fetchPost`나 접두사(`Linking.createURL`) 값이 막히면 `1-4 힌트 1`(방향)부터 요청한다. `xcrun simctl openurl booted`가 안 열리면 접두사가 `exp://` 개발 접두사인지부터 본다 (환경마다 다르다).
- 허용 목록: 규칙을 어떻게 쓸지 막히면 "막을 것"을 쓰고 있는지 점검한다 ("허용할 것"을 먼저 쓰는 것이 힌트 1의 핵심). 그래도 막히면 `1-4 힌트 2`(API 이름), 정규식·접두사 함정은 `1-4 힌트 3`.

## 참고 (아래로 밀어 둠)
- **미션 문서**: [tier1-bugs.md](../improve/tier1-bugs.md) 미션 1-4. 읽을 학습 가이드 절: [p3-study-guide.md](../p3-study-guide.md) §6(딥링크), [p5-study-guide.md](../p5-study-guide.md) W14(알림). P5는 통독하지 않고 체크리스트에서 막힌 항목의 절만 찾는다.
- **가설 대신 먼저 할 일: 허용 목록** (코드를 고치기 전에 글로 채운다)

| 신뢰 경계 | 외부에서 올 수 있는 값 | **허용할 것** (먼저 정의) | 나머지는 어떻게 처리 |
| --- | --- | --- | --- |
| 딥링크 `:id` → 서버 요청 URL | | | |
| 알림 `data.url` → `Linking.openURL` | | | |

"막을 것"이 아니라 "허용할 것"을 먼저 쓰는 것이 힌트 1의 핵심이다. 검증(허용 목록)과 인코딩이 **각각 무엇을 막는지**를 한 줄씩 구분해 둔다. 둘은 대체 관계가 아니다.
- **코딩 전에 한 줄씩 정할 것**:
  - 검증 위치: `fetchPost` 직전 / `FeedDetailScreen` 진입 / 라우팅 config 중 **모든 호출 경로가 지나는 곳**.
  - 검증 실패 시: 조용히 무시 / 사용자에게 알림. 잘못된 id로 열었을 때 화면이 지금과 달라질 수 있다.
  - 검증 함수를 RN import 없는 순수 모듈로 둘지. `posts.ts`는 `react-native`를 import하므로 `node:test` 대상이 못 된다. 순수 모듈로 빼면 테스트를 하나 더 쌓을 수 있다.
  - **1-5와의 연결**: 1-5(11/2)에서 보관할 링크는 이 검증을 통과한 값이어야 한다. 검증 함수의 입력·출력 모양을 1-5에서도 쓸 수 있게 정한다.
- **수정 중 확인**:
  - 정규식에 `^`/`$` 앵커가 있는가 (`1abc`, `1/../x`).
  - 접두사를 `startsWith`로만 비교하면 호스트 위장이 통과한다. `exp://` 개발 접두사는 환경마다 다르다.
  - 검증 통과 ≠ 서버에 존재. 404 처리는 그대로 필요하다.
- **임시 코드 되돌릴 곳**: `route.params.id` 로그 → `FeedDetailScreen`, `Linking.createURL` 로그 → `FeedDetailScreen`(찍은 곳), 외부 `https://`로 바꾼 `data.url` → `NotificationScreen.tsx`.
- **기록 포인트**: 위 허용 목록 표 그대로, 검증과 인코딩의 구분.
- **재현 주의**: (a)는 `fetchPost` 복원 후, (b)는 알림 훅 복원 후에만 해 볼 수 있다. 복원한 훅의 `useEffect` 의존성 배열은 [Day 10](./day-10.md)의 출발점이니 기록해 둔다.
- **다음 날**: [Day 9](./day-09.md) (11/1 (일)) — 이어서.
