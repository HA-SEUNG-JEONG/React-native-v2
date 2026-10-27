# Day 26 · 12/1 (화) — 요청 취소(AbortController)와 경쟁 상태

## 오늘의 목표

피드에 사용자 필터를 달아 경쟁 상태(오래된 응답이 최신 화면을 덮어쓰는 버그)를 일부러 재현하고, `ignore` 플래그와 `AbortController`로 고친다.

## 읽기(15분)

1. https://react.dev/learn/synchronizing-with-effects — "Fetching data"의 race condition 설명과 `ignore` 패턴.
   - 확인할 사실: Effect가 데이터를 가져오면 cleanup은 요청을 abort하거나 결과를 무시해야 한다. 이미 나간 요청을 "취소"할 수는 없고, 더 이상 필요 없는 요청이 앱에 영향을 주지 않게 막는다.
   - 확인할 사실: `ignore` 변수는 Effect 실행마다 따로 존재하고, 의존성이 바뀌거나 언마운트될 때 cleanup이 그 Effect의 `ignore`를 `true`로 만든다.
   - 확인할 사실: 문서의 해설은 `AbortController`만으로는 경쟁 상태를 완전히 막지 못하고(fetch 뒤에 다른 비동기 단계가 이어질 수 있다), 명시적 `ignore` 플래그가 가장 확실하다고 한다.
2. https://reactnative.dev/docs/0.81/network — fetch 에러 처리 복습. `AbortController`는 이 페이지에 언급이 없다. 취소 동작은 오늘 실험(콘솔에 `AbortError` 확인)으로 확인하고, 문서 근거는 확인하지 못했음을 막힌 점에 적는다(문서에서 확인 필요).
3. https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation — Day 28 예고. `queryFn`이 `signal`을 받아 `fetch(url, { signal })`에 넘기는 형태를 확인한다(Day 28에서 쓴다. 지금은 `signal`이 `AbortController`에서 온다는 것만 본다).

## 예측(10분)

1. 사용자 필터 "1번 사용자"는 응답이 2초, "2번 사용자"는 0.2초 걸리게 만들었다. "1번"을 누르고 곧바로 "2번"을 누르면 최종 화면에는 어느 사용자의 글이 보이는가? 선택된 칩은 무엇인가?
   > 내 예측:
2. 같은 코드에 `ignore` 플래그를 넣으면 위 상황에서 결과가 어떻게 달라지는가? 그때 1번 사용자 요청은 네트워크에서 실제로 취소되는가?
   > 내 예측:
3. `AbortController`로 `abort()`한 `fetch`의 Promise는 어떻게 되는가(성공/reject)? `catch`에 들어오는 에러의 `name`은 무엇이라고 생각하는가?
   > 내 예측:

## 만들기(40분)

피드 탭 상단에 필터 칩 "전체 / 1 / 2 / 3"을 달아 `userId`로 글을 거른다. JSONPlaceholder는 `/posts?userId=1`처럼 쿼리 파라미터로 거르기를 지원한다.

**고칠 파일** `app/(tabs)/index.tsx` (Day 25의 `loadPosts`와 `useEffect`)
- state 추가: `userId: number | null`(null이면 전체). 칩은 `Pressable` 네 개로, 눌린 칩이 구분되게 스타일을 준다(Day 3 StyleSheet).
- URL은 `userId`가 있으면 `?userId=${userId}`를 붙인다. `useEffect`의 deps에 `userId`를 넣어 칩을 누를 때마다 다시 요청한다.

**1단계: 경쟁 상태 재현.** 임시로 `fetch` 앞에 지연을 넣는다. 이 지연 코드는 단계 3이 끝나면 지운다.

```tsx
await new Promise((r) => setTimeout(r, userId === 1 ? 2000 : 200));
```

"1"을 누르고 곧바로 "2"를 눌러 최종 화면과 선택된 칩이 어긋나는지 본다.

**2단계: `ignore` 플래그.** `useEffect` 안에서 `let ignore = false;`를 만들고, 결과를 state에 넣기 전에 `if (!ignore)`로 검사한다. cleanup에서 `ignore = true`. (`loadPosts`를 Effect 안으로 옮기거나 `ignore`를 인자로 넘기는 구조는 자유다.) 새로고침(Day 25의 `RefreshControl`, 다시 시도 버튼)이 같은 `loadPosts`를 쓰고 있으면 그 경로도 어떻게 처리할지 정한다.

**3단계: `AbortController`.** 같은 `useEffect`에서 `const controller = new AbortController();`를 만들고 `fetch(url, { signal: controller.signal })`로 넘긴다. cleanup에서 `controller.abort()`. `catch`에서 `error.name === 'AbortError'`이면 에러 화면으로 바꾸지 않고 조용히 return한다. 2단계의 `ignore` 플래그는 남겨 두고 둘을 같이 쓴다. 지연 코드를 삭제한다.

완료 기준
- [ ] 1단계 코드에서 "1 → 2" 빠른 전환 시 버그가 실제로 재현됐고 화면과 칩이 어긋난 모습을 기록했다.
- [ ] 2단계 후 같은 조작에서 최종 화면이 선택된 칩과 일치한다.
- [ ] 3단계 후 취소된 요청이 에러 화면을 띄우지 않는다. 콘솔에 `AbortError`를 임시로 찍어 확인한 뒤 로그를 지운다.
- [ ] 피드를 벗어났다 돌아오거나 필터를 연타해도 에러 화면이나 크래시가 없다.
- [ ] 임시 지연 코드와 `console.log`를 모두 지웠다.

## 검증(10분)

- 1단계 상태에서 "1 → 2"를 눌러 예측 1과 비교한다. 칩과 목록의 `userId`가 서로 다른 화면 상태를 캡처하듯 글로 적는다.
- 2단계, 3단계마다 같은 조작을 반복한다. 예측 2·3과 비교하고, `catch`에서 찍은 `error.name`을 그대로 적는다. RN 0.81 문서에는 `AbortController` 근거가 없으므로 이 실험 결과가 오늘의 유일한 증거다.
- 일부러 깨뜨리기: `catch`에서 `AbortError` 분기를 지우고 칩을 연타한다. 에러 화면이 깜빡이는지 확인한 뒤 원복한다.

## 이해 점검 질문

1. 경쟁 상태가 왜 생기는가? 요청을 보낸 순서와 응답이 도착하는 순서는 어떤 관계인가?
2. `ignore` 플래그는 요청을 취소하는가? 무엇을 해 주는가?
3. `abort()`된 `fetch`를 `catch`에서 에러 화면으로 처리하면 안 되는 이유는 무엇이고, 어떻게 구분하는가?

<details><summary>정답</summary>

1. 비동기 요청은 보낸 순서대로 응답이 온다는 보장이 없다. 먼저 보낸 느린 요청의 응답이 나중에 도착하면 최신 요청의 결과를 덮어써서 화면이 선택과 어긋난다.
2. 요청 자체는 취소하지 않는다. cleanup이 그 Effect 실행의 `ignore`를 `true`로 바꿔서, 오래된 응답이 도착해도 `if (!ignore)` 검사에서 걸려 state를 갱신하지 못하게 한다. 응답 처리 뒤에 다른 비동기 단계가 이어져도 같은 검사를 두면 되므로 가장 확실하다.
3. `abort()`는 의도한 동작이므로 사용자에게 보여 줄 오류가 아니다. abort된 fetch는 reject되고, 에러의 `name`이 `AbortError`이면 무시하고 그 외 에러만 에러 상태로 처리한다. 실제 `name` 값은 검증 단계의 실험 결과와 같아야 하고, 다르면 그 값을 기준으로 분기를 고친다. `AbortController`는 불필요한 네트워크 사용을 줄이고, 응답 뒤 처리까지 막는 일은 `ignore`가 맡는다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 피드에 userId 필터 칩 추가`
- `fix: 필터 전환 시 오래된 응답이 덮어쓰는 경쟁 상태 수정`
- `fix: 피드 요청을 AbortController로 취소`
