# Day 39 · 12/18 (금) — 버퍼 + 8주차 점검

## 오늘의 목표

Day 35~38의 저장소(AsyncStorage, SecureStore)와 폼(react-hook-form, zod, 폼 UX)을 퀴즈와 구술로 점검하고, 밀린 Day와 질문을 정리한다.

## 주간 점검 퀴즈(30분)

정답을 가리고 풀고, 결과는 `docs/quiz/2026-12-18-day-39.md`에 `AGENTS.md`의 상세 구조(문항별 내 답 → 문제점 → 정답 → 암기 고리 → 근거 절, 종합 약점 패턴, 재복습 일정)로 기록한다.

1. (Day 35) AsyncStorage에 `{ title, body }` 객체를 저장하고 읽는 두 줄을 쓰고, 저장된 값이 깨져 있을 때 앱이 죽지 않도록 하는 방법을 설명하라. 복원 전에 저장을 막아야 하는 이유도 쓰라.
2. (Day 36) 로그인 토큰을 AsyncStorage가 아니라 SecureStore에 두는 이유와, SecureStore 키로 쓸 수 있는 문자를 쓰라. `'daily-log:draft'`는 SecureStore 키로 쓸 수 있는가?
3. (Day 36) 앱 시작 때 토큰 복원 중에 `isRestoring` 상태가 필요한 이유를 보호된 라우트 가드의 동작과 엮어 설명하라. 로그아웃에서 토큰 삭제 외에 해야 할 일은?
4. (Day 37) `useForm`에서 `zodResolver(schema)`를 쓸 때 `defaultValues`를 반드시 채워야 하는 이유, RN에서 `Controller`를 쓰는 이유, `schema`에 `.trim()`이 있을 때 `onSubmit`이 받는 값을 쓰라.
5. (Day 38) 이메일 칸에서 return을 눌러 키보드를 내리지 않고 비밀번호 칸으로 가는 데 필요한 `TextInput` 속성과 RHF 함수를 쓰라. 그리고 `isSubmitting`이 제출 내내 true이기 위한 조건과, 서버 로그인 실패를 담는 방법을 쓰라.

<details><summary>정답</summary>

1. 저장: `await AsyncStorage.setItem(KEY, JSON.stringify(draft))`, 읽기: `const raw = await AsyncStorage.getItem(KEY)` 뒤 `JSON.parse(raw)`(값이 없으면 `null`). 값은 문자열만 저장되기 때문이다. `JSON.parse`는 `try/catch`로 감싸고 실패하면 그 키를 지운 뒤 기본값으로 시작한다. 복원 전에 저장을 막지 않으면 아직 읽지 못한 기존 값을 마운트 직후의 빈 상태가 덮어써서 사라진다.
2. AsyncStorage는 암호화되지 않은 평문 저장소이고, SecureStore는 Android Keystore·iOS Keychain으로 보호한다. SecureStore 키는 영문자·숫자와 `.`, `-`, `_`만 쓸 수 있으므로 `:`가 들어간 `'daily-log:draft'`는 쓸 수 없다(`'auth.token'`처럼 쓴다).
3. 토큰을 읽는 일이 비동기라서 복원이 끝나기 전 인증 상태는 "로그인 안 됨"이다. 가드가 이 값을 믿으면 로그인한 사용자를 로그인 화면으로 보냈다가 복원 뒤 다시 피드로 옮기는 깜빡임이 생긴다. `isRestoring`이 true인 동안은 가드가 판단을 미루고 로딩만 보여 준다. 로그아웃에서는 `queryClient.clear()`로 Query 캐시도 비워야 이전 계정의 데이터가 남지 않는다.
4. 값이 `undefined`로 시작하면 zod는 최소 길이 규칙이 아니라 "문자열이 아니라 undefined" 타입 에러를 내고, RHF도 `isDirty` 비교와 `undefined` 방지를 위해 기본값을 요구한다. RN의 `TextInput`은 `onChangeText`로 값을 받으므로 `Controller`가 넘겨 주는 `field.value`·`onChange`·`onBlur`를 직접 연결한다. resolver가 검증한 결과를 `onSubmit`에 주므로 `.trim()`이 적용된 값(`"  abc  "`가 아니라 `"abc"`)이 온다.
5. `TextInput`: `submitBehavior="submit"`(블러 없이 제출 이벤트만 보냄), `onSubmitEditing={() => setFocus('password')}`, 비밀번호 칸 `ref`에 `field.ref` 연결. `isSubmitting`은 `onSubmit`이 반환한 Promise가 끝날 때까지 true이므로 요청을 `await`(또는 반환)해야 한다. 서버 실패는 `try/catch`에서 `setError('root.server', { message })`로 담고 `errors.root?.server?.message`로 보여 준다.

</details>

## 구술 1주제(15분)

주제: "로그인 토큰을 어디에 어떻게 저장하고, 앱을 다시 열 때 어떻게 복원하는가."

설명에 넣을 핵심어: SecureStore, AsyncStorage와의 차이, `isRestoring`, 보호된 라우트 가드, 로그아웃 시 삭제와 캐시 초기화.

소리 내어 2분 안에 설명하고, 막힌 지점을 아래에 적는다.

> 막힌 지점:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문 중 이번 주(Day 35~38)에 생긴 것을 처리한다.

- [ ] 에러 원문 검색 → 공식 문서 확인 순서로 해결한 질문은 해결 방법을 한 줄 적고 지운다.
- [ ] 해결하지 못한 질문은 다음 주 Day 40 시작 전까지 남기고 재현 조건을 보강한다.

## 밀린 Day 흡수

- [ ] Day 35 완료 기준 전부 확인
- [ ] Day 36 완료 기준 전부 확인
- [ ] Day 37 완료 기준 전부 확인
- [ ] Day 38 완료 기준 전부 확인
- [ ] Day 37·38에서 넣은 확인용 `console.log`와 모의 로그인 임시 분기 정리 확인
- [ ] Day 35~38 커밋이 모두 남아 있다

## 기록(5분)

배운 것 3줄:

막힌 점:
