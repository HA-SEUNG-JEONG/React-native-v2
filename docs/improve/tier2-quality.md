# Tier 2 가이드 — 품질

> 출처: [TanStack Query v5](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults) · [React Native 0.81](https://reactnative.dev/docs/0.81/accessibility) · [React Navigation 7](https://reactnavigation.org/docs/typescript/) · [Expo SDK 54 (sdk-54 브랜치 원문)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/config/app.mdx) · [Node.js 22 test runner](https://nodejs.org/docs/latest-v22.x/api/test.html)
> 검증: 브랜치 `improve/missions` (HEAD `bf2d50f`) 코드에서 `파일:라인`을 직접 확인, `npx eslint .`(9 errors / 2 warnings), `npm test`(통과, 약 6초) 실행 확인 (Expo SDK 54 / RN 0.81 / React Query 5 / React Navigation 7)
> docs.expo.dev v54.0.0 URL은 최신 문서로 리다이렉트되므로 SDK 54 원문(GitHub sdk-54 브랜치) 링크를 사용한다.

Tier 1이 "깨지는 것"이었다면 Tier 2는 "깨지기 쉬운 것"이다. 캐시 설정, 에러 모델, 권한 실패 경로, 접근성, 설정, 타입, 테스트를 손본다. 진행 방식(힌트온리, 힌트 단계)은 [README](./README.md)를 따른다. 정답 코드는 이 파일에 없다.

> 라인 번호는 작성 시점 스냅샷이다. Tier 1 미션을 먼저 하면 밀릴 수 있으니 `grep -n`으로 다시 확인한다.

## 미션 목차

| 미션 | 제목 | 선행 | 표시 |
|------|------|------|------|
| [2-1](#미션-2-1--eslint---fix-워밍업) | eslint --fix 워밍업 | 없음 | |
| [2-2](#미션-2-2--queryclient-설정-gctime-retry-signal) | queryClient 설정 | 없음 | |
| [2-3](#미션-2-3--usedeletepost-정리) | useDeletePost 정리 | 2-2 | ⚠️ 동작 변경 |
| [2-4](#미션-2-4--httperror-도입) | HttpError 도입 | 없음 | |
| [2-5](#미션-2-5--withretrybackoff-개선) | withRetryBackoff 개선 | 2-4 | |
| [2-6](#미션-2-6--권한미디어-호출-에러-처리) | 권한·미디어 호출 에러 처리 | 없음 | 📱 실기기 필요 (카메라) |
| [2-7](#미션-2-7--feedlist-에러와-캐시-데이터-공존) | FeedList 에러와 캐시 데이터 공존 | 2-2 | |
| [2-8](#미션-2-8--접근성) | 접근성 | 없음 | |
| [2-9](#미션-2-9--의존성설정-정리) | 의존성·설정 정리 | 없음 | |
| [2-10](#미션-2-10--타입-보강) | 타입 보강 | 없음 | |
| [2-11](#미션-2-11--테스트-확장) | 테스트 확장 | 2-3, 2-5 | |

---

## 미션 2-1 — eslint --fix 워밍업

선행: 없음

### 증상과 위치

`npx eslint .` 결과는 9 errors + 2 warnings다.

| 구분 | 위치 | 규칙 | 자동 수정 |
|------|------|------|-----------|
| error | `src/api/network.ts:32` | `prettier/prettier` | 가능 |
| error | `src/components/Btn.tsx:28` | `prettier/prettier` | 가능 |
| error | `src/screens/ComposeScreen.tsx:113` | `prettier/prettier` | 가능 |
| error | `src/screens/FeedListScreen.tsx:244` | `prettier/prettier` | 가능 |
| error | `src/screens/LocationScreen.tsx:49, 51, 54` | `prettier/prettier` (3건) | 가능 |
| error | `src/screens/LoginScreen.tsx:50` | `prettier/prettier` | 가능 |
| error | `src/screens/NetworkScreen.tsx:142` | `prettier/prettier` | 가능 |
| warning | `src/screens/NotificationScreen.tsx:19` | `@typescript-eslint/no-unused-vars` (`permissionError`) | 불가, 수동 |
| warning | `src/screens/ProfileScreen.tsx:21` | `@typescript-eslint/no-unused-vars` (`e`) | 불가, 수동 |

### 왜 문제인가

prettier 에러는 포맷 차이일 뿐이라 기계가 안전하게 고친다. `no-unused-vars`는 "지울지, 쓸지"가 의도에 달려 있어 자동 수정이 없다. 이 두 경고는 단순 청소 대상이 아니라 **미해결 설계의 흔적**이다. `NotificationScreen:19`는 에러 상태를 저장만 하고 화면에 안 그린 것(2-6), `ProfileScreen:21`은 실제로 던지지 않는 함수를 감싼 try/catch(2-10)다.

### 공식 문서

- 이 미션에 해당하는 검증된 링크가 없다. `eslint.config.js` 첫 줄 주석이 Expo ESLint 가이드를 가리키니 필요하면 직접 찾아본다.

### 힌트

- 힌트 1: `--fix`가 고치는 범위를 먼저 눈으로 확인한다. 실행 전후 `git diff --stat`을 비교한다.
- 힌트 2: `npx eslint . --fix`. `npm run format`(`prettier --write .`)은 `docs/`의 마크다운까지 건드리므로 쓰지 않는다.
- 힌트 3: 경고 2건을 변수 삭제나 `_` 접두사로 조용히 넘기면 2-6, 2-10에서 할 일이 사라진다. 지금 고칠지 해당 미션으로 넘길지 정하고 이유를 기록한다.

### 검증

```bash
nvm use 22.21.1
npx eslint .          # --fix 직후: errors 0, warnings 2
git diff --stat       # 포맷 변경만 있어야 함
npm run typecheck
```

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: 어떤 규칙이 자동 수정되고 어떤 규칙이 안 되는지, 그 이유
- [ ] 말로 설명할 수 있다: `eslint-plugin-prettier`가 포맷 차이를 lint error로 보고하는 구조
- [ ] 직접 구현했다: `--fix` 실행 후 diff가 포맷 변경뿐임을 확인했다
- [ ] 직접 구현했다: 경고 2건을 각각 어떻게 처리했는지 근거와 함께 정했다

### 흔한 함정

- `--fix` 결과를 diff로 확인하지 않고 커밋한다.
- 포맷 변경과 로직 변경을 한 커밋에 섞는다. 포맷만 `style:` 커밋으로 분리한다.
- `LoginScreen.tsx:50`은 2-10에서 지워질 죽은 try/catch 안에 있다. 순서가 바뀌어도 결과는 같지만 알고 있어야 한다.

---

## 미션 2-2 — queryClient 설정: gcTime, retry, signal

선행: 없음

### 증상과 위치

- `src/api/posts.ts:55` — `export const queryClient = new QueryClient();` `defaultOptions`가 없다.
- `App.tsx:107-112` — `PersistQueryClientProvider`의 `maxAge: 1000 * 60 * 60 * 24`(24시간, 111행).
- `src/api/persist.ts:7-10` — `createAsyncStoragePersister`(키 `rn-sandbox-query-cache`).
- queryFn: `src/api/posts.ts:106`(`fetchPosts(pageParam)`), `src/screens/FeedDetailScreen.tsx:32`(`fetchPost(id)`). `signal`을 받지도 넘기지도 않는다. 호출 대상은 `posts.ts:25`, `posts.ts:41`의 `fetch`.

재현 (retry): 존재하지 않는 글의 딥링크를 연다. jsonplaceholder는 `/posts/99999`에 404를 준다(확인함). Expo Go라면 `exp://…/--/feed/99999` 형태다(정확한 URL은 Metro 터미널의 주소로 확인 필요). 상세 화면이 스피너로 약 7초(기본 재시도 간격 1s + 2s + 4s) 머문 뒤 에러를 보여준다. 404는 다시 해도 같은 결과인데도 재시도한다.

### 왜 문제인가

세 가지가 묶여 있다.

1. **gcTime < maxAge.** 기본 `gcTime`은 5분이다. 영속화는 24시간을 약속하지만 관찰자(화면)가 없는 쿼리는 5분 뒤 GC되고, 그 결과가 저장소에도 반영된다. persistQueryClient 문서는 `gcTime`을 `maxAge` 이상으로 두라고 경고한다. 웹과 다른 점은 화면이 언마운트되는 일이 잦고(스택 pop, 탭 전환) 앱이 자주 죽었다 살아난다는 것이다.
2. **retry/staleTime 정책 부재.** 기본값(`retry: 3`, `staleTime: 0`)을 그대로 쓴다. 4xx를 재시도하는 건 낭비이고, 모바일에선 사용자가 그 시간을 스피너로 기다린다.
3. **signal 미전달.** 쿼리가 취소돼도(언마운트, `cancelQueries`) 이미 나간 `fetch`는 계속 달린다.

### 공식 문서

- [persistQueryClient](https://tanstack.com/query/v5/docs/framework/react/plugins/persistQueryClient) — `gcTime`과 `maxAge` 관계 주의 문구
- [createAsyncStoragePersister](https://tanstack.com/query/v5/docs/framework/react/plugins/createAsyncStoragePersister)
- [Important Defaults](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults)
- [Query Retries](https://tanstack.com/query/v5/docs/framework/react/guides/query-retries)
- [Query Cancellation](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation)
- [AbortSignal (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- RN 0.81 문서에는 AbortController 페이지가 없다. 최신(0.87) 문서임을 감안하고 [global-AbortController](https://reactnative.dev/docs/global-AbortController) 참고.

### 힌트

- 힌트 1: 지금 `maxAge`와 `gcTime`이 각각 얼마인지 적어 본다. 설정이 어디에 있고 어디에 없는지부터 찾는다.
- 힌트 2: `QueryClient` 생성자의 `defaultOptions.queries`(`gcTime`, `staleTime`, `retry`). queryFn의 인자 객체에서 `signal`을 구조 분해해 `fetch`의 옵션으로 넘긴다. `retry`는 `(failureCount, error) => boolean` 형태의 함수도 받는다.
- 힌트 3: `maxAge`를 숫자로 두 군데 적으면 한쪽만 고치다 어긋난다. 한 상수를 공유할지, 어디에 둘지 정한다. `signal`을 소비하면 취소 시 쿼리가 **이전 상태로 되돌려진다**(문서). 그 동작이 2-3의 `cancelQueries`와 어떻게 만나는지 생각한다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
```

시뮬레이터(`npm start` 후 `i`): 위 404 딥링크 재현 절차를 수정 전후로 비교한다. `gcTime` 효과는 5분 기다리기 어려우니, 값을 잠깐 짧게 줄여 "관찰자 없는 쿼리가 사라진 뒤 앱 재시작 시 캐시가 없음"을 확인하고 되돌린다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: `gcTime`이 `maxAge`보다 짧으면 왜 영속 캐시가 일찍 사라지는가
- [ ] 말로 설명할 수 있다: `staleTime`과 `gcTime`의 차이
- [ ] 직접 구현했다: `gcTime >= maxAge`, 4xx 비재시도(또는 선택한 retry 정책), 두 queryFn의 `signal` 전달
- [ ] 직접 구현했다: 선택한 정책의 이유를 한 줄 주석으로 남겼다

### 흔한 함정

- `gcTime`만 올리고 `maxAge`와 값이 따로 놀게 둔다.
- `retry: false`로 전부 끄면 일시적 네트워크 오류도 즉시 실패한다. "무엇을 재시도할지"가 정책이다.
- 4xx 판별은 에러에 status가 있어야 가능하다. 지금은 메시지 문자열뿐이라 2-4(HttpError)가 먼저 있으면 쉽다. 2-2에서 어디까지 할지 범위를 정한다.
- `signal`을 받고 `fetch`에 안 넘긴다. 받기만 해서는 취소되지 않는다.

---

## 미션 2-3 — useDeletePost 정리

선행: 2-2

⚠️ **동작 변경** — 이 미션은 화면이 보여주는 결과를 바꾼다.

- `onSettled`에서 `["posts"]`를 invalidate하면 서버를 다시 조회한다. 이 앱의 가짜 DELETE는 실제로 지우지 않으므로 **삭제에 성공해도 글이 목록에 다시 나타날 수 있다**.
- `["post", id]` 상세 캐시를 정리하면 삭제한 글 상세로 들어갔을 때의 동작이 달라진다.
- 스냅샷 시점이 바뀐다(`cancelQueries` 이후).

### 증상과 위치

`src/api/posts.ts:115-137` `useDeletePost`.

- `:119-120` — `getQueryData`로 스냅샷을 **먼저** 뜨고 `cancelQueries`를 **나중에** 기다린다. 순서가 반대다. 같은 레포의 `FeedDetailScreen.tsx:47-49`는 cancel 후 스냅샷 순서다.
- `:121` — `(old: any)`와 `:126-127`의 `(page: Post[])` 수동 주석. 캐시 모양이 타입으로 보장되지 않는다.
- `onSettled`가 없다. 성공/실패 후 서버 상태와 맞추지 않는다.
- `["post", id]` 캐시는 손대지 않는다. 키의 `id`는 상세에서 **문자열**(`FeedDetailScreen.tsx:31`), 삭제 쪽 `id`는 **숫자**(`posts.ts:118`)다.

재현: 글 상세를 한 번 열어 `["post", id]` 캐시를 만든 뒤 뒤로 가서, 같은 글을 스와이프 삭제한다. 삭제 후 그 글의 상세를 다시 열면(딥링크 `feed/:id` 등) 어떻게 보이는지 확인한다.

### 왜 문제인가

낙관적 업데이트의 순서는 "진행 중 refetch 취소 → 스냅샷 → 캐시 수정 → 실패 시 롤백 → 끝나면 서버와 재동기화"다. 지금 코드는 취소 `await` 사이에 다른 갱신이 끼어들 수 있는 상태에서 스냅샷을 뜬다. 재동기화(`onSettled`)가 없으면 낙관값과 서버 상태의 어긋남이 영구히 남는다. `any`는 캐시 구조가 바뀌어도 컴파일러가 모른다.

### 공식 문서

- [Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)
- [Query Cancellation](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation)
- [Infinite Queries](https://tanstack.com/query/v5/docs/framework/react/guides/infinite-queries) — `data.pages` 구조

### 힌트

- 힌트 1: `onMutate`에서 줄 순서를 `FeedDetailScreen`의 `onMutate`와 나란히 놓고 비교한다.
- 힌트 2: `InfiniteData<Post[]>`(react-query에서 import), `getQueryData<T>` / `setQueryData<T>` 제네릭, `onSettled`, `invalidateQueries` / `removeQueries` / `setQueryData`. 반환하는 context 객체에도 타입이 붙는다.
- 힌트 3: 위 ⚠️ 항목을 직접 확인한다. 가짜 API 때문에 "정석(onSettled invalidate)"이 이 앱에선 화면을 되돌린다. 어떻게 할지(성공 시에는 하지 않기, 감수하기, 다른 방식)는 **트레이드오프를 적고 선택**한다. 정답이 하나가 아니다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
grep -n "any" src/api/posts.ts      # 삭제 훅에서 any가 사라졌는지
```

시뮬레이터: (1) 스와이프 삭제 → 즉시 사라짐 (2) 실패(20%)를 만날 때까지 반복 → 원복되는지 (3) 성공 후 목록 새로고침·재진입 시 어떻게 보이는지 — 이 결과가 ⚠️ 동작 변경의 실체다. 수정 전과 비교해 기록한다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: `cancelQueries`를 스냅샷 앞에 두는 이유
- [ ] 말로 설명할 수 있다: `onSettled`가 `onSuccess`+`onError`와 다른 점, 이 앱에서 invalidate가 일으키는 부작용
- [ ] 직접 구현했다: 순서 수정, `any` 제거(`InfiniteData<Post[]>`), `onSettled` 처리, `["post", id]` 처리
- [ ] 직접 구현했다: 선택한 동작(그리고 버린 대안)을 코드 주석이나 리뷰 기록에 남겼다

### 흔한 함정

- `["post", id]`에 숫자 `id`를 그대로 쓴다. 쿼리 키 비교에서 `3`과 `"3"`은 다르다.
- 빈 페이지를 `filter`로 제거하면 `allPages.length`가 줄어, `getNextPageParam`(`posts.ts:108-109`, `1 + allPages.length`)이 이미 받은 페이지 번호를 다시 가리킬 수 있다. 또 마지막 로드 페이지가 한 글 삭제로 10개 미만이 되면 `hasNextPage`가 `false`가 된다. 코드 읽기 기준 추론이므로 시뮬레이터로 확인한다(2-11 테스트 후보).
- 롤백만 하고 `onSettled` 재동기화를 빼먹는다.

---

## 미션 2-4 — HttpError 도입

선행: 없음

### 증상과 위치

HTTP 실패와 일반 실패가 같은 `Error`라 구분하려면 캐스트나 문자열 파싱밖에 없다.

| 위치 | 현재 |
|------|------|
| `src/api/posts.ts:27`, `:43` | ``throw new Error(`… (${res.status})`)`` — 상태가 메시지 안에 묻힘 |
| `src/api/auth.ts:64-66` | `(err as Error & { status?: number }).status = 401` — 던지는 쪽 캐스트 |
| `src/api/auth.ts:91` | `(e as Error & { status?: number }).status !== 401` — 받는 쪽 캐스트 |
| `src/screens/NetworkScreen.tsx:41, 74, 91` | `(e as Error).message` — `catch`의 `e`는 `unknown` |
| `src/api/network.ts:31` | `const err = e as Error` |
| `src/screens/FeedListScreen.tsx:93`, `FeedSectionsScreen.tsx:44` | `(error as Error).message` |

이미 `instanceof` 패턴을 쓰는 곳도 있다: `FeedDetailScreen.tsx:93`, `NotificationScreen.tsx:31`, `LoginScreen.tsx:54`.

### 왜 문제인가

`catch (e)`의 `e`는 `unknown`이다. 캐스트는 컴파일러의 검사를 끄고 "맞을 것"이라고 선언하는 것이다. 에러에 의미(상태 코드)를 담은 전용 클래스가 있으면 `instanceof`로 좁힌 뒤 필드를 타입 안전하게 읽는다. 이 구분이 2-2의 retry 정책, 2-5의 4xx 비재시도의 토대다.

참고: React Query v5의 기본 에러 타입은 `Error`다(설치된 `@tanstack/query-core`의 `DefaultError`로 확인). `FeedListScreen:93`, `FeedSectionsScreen:44`의 `as Error`는 캐스트를 지워도 타입 에러가 나지 않을 가능성이 높다. 지워 보고 `tsc` 결과로 확인한다.

### 공식 문서

- [Error.cause (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) — 에러 연쇄 (2-5와 함께 쓰임)
- [Query Retries](https://tanstack.com/query/v5/docs/framework/react/guides/query-retries) — 에러 객체로 분기하는 `retry` 함수

### 힌트

- 힌트 1: 지금 `status`를 읽고 쓰는 곳이 몇 군데인지 센다. 전부 같은 클래스를 가리키게 하는 것이 목표다.
- 힌트 2: `class HttpError extends Error`에 `status` 필드, `instanceof HttpError`로 좁히기. `fetch` 응답은 `res.ok` / `res.status`.
- 힌트 3: 함정 두 개. (a) 클래스를 Hermes에서 `extends Error`로 만든 뒤 `instanceof`가 실제로 `true`인지 시뮬레이터에서 로그로 확인한다(확인 필요). (b) 2-11에서 이 클래스를 Node로 테스트하게 되는데, Node의 TS 실행은 **타입 구문 제거만** 하므로 생성자의 `public status: number` 같은 parameter property는 로드 단계에서 실패한다(실험으로 확인함). 필드를 명시적으로 선언해야 한다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
npm test
grep -rn "as Error\|Error & {" src      # 남은 캐스트
```

시뮬레이터: Network 화면에서 "보호된 API 호출 (1회)"를 4초 이상 기다린 뒤 눌러, 401 → 갱신 → 재시도 흐름(`auth.ts:86-96`)이 그대로 동작하는지 확인한다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: `catch (e)`의 `e`가 `unknown`인 이유와 `as` 캐스트의 위험
- [ ] 말로 설명할 수 있다: 전용 에러 클래스가 `instanceof`와 retry 분기에 주는 이점
- [ ] 직접 구현했다: `HttpError` 정의, `posts.ts` 두 곳과 `auth.ts` 두 곳 교체
- [ ] 직접 구현했다: 위 표의 `as Error` 중 불필요한 것을 지우고 필요한 곳은 `instanceof`로 교체

### 흔한 함정

- `HttpError`를 만들고 `fetch*` 쪽 `throw`는 그대로 둔다. 던지는 곳을 전부 바꿔야 의미가 생긴다.
- `auth.ts`의 `"로그인 필요"`처럼 status가 없는 에러까지 `HttpError`로 만든다. 상태 코드가 있는 실패만 해당한다.
- 메시지 문자열(`message.includes("401")`)로 분기한다.

---

## 미션 2-5 — withRetryBackoff 개선

선행: 2-4

### 증상과 위치

`src/api/network.ts:14-40` `withRetryBackoff`.

- `:28-33` — 모든 에러를 재시도한다. 마지막에 ``new Error(`Request failed after … attempts: ${err.message}`)``로 **새 에러를 만들어** 원본(`HttpError`의 `status`, 스택)을 잃는다(`:31`의 캐스트 포함).
- 취소 수단이 없다. 대기(`:37`)와 `fn` 모두 중단할 방법이 없다.
- `src/screens/LocationScreen.tsx:47-54` — `Promise.race`에 쓰는 `setTimeout`(`:49`, 15초)을 **절대 clear하지 않는다**. 위치를 2초에 얻어도 타이머는 15초까지 살아 있다.

재현(백오프): Network 화면 "재시도 데모 실행"을 반복해 로그를 본다. 재시도 불가 에러(예: 4xx)를 흉내 내는 `fn`을 임시로 넘기면 끝까지 재시도하는 것을 볼 수 있다.

### 왜 문제인가

재시도는 "일시적 실패"에만 의미가 있다. 400, 404 같은 응답은 다시 보내도 같은 결과이고 서버 부하만 늘린다. 원본 에러를 문자열로 감싸면 호출부가 `instanceof`로 원인을 볼 수 없다. `Error`의 `cause`는 그 연결을 보존하는 표준 방법이다. 취소는 화면을 떠난 뒤에도 백그라운드에서 타이머와 요청이 도는 것을 막는다. 타이머 누수는 작아 보여도 `setTimeout` 핸들은 정리하는 습관이 필요한 자원이다.

### 공식 문서

- [Error.cause (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [AbortController (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) · [AbortSignal (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [global-AbortController (RN, 최신 0.87 문서)](https://reactnative.dev/docs/global-AbortController)
- [expo-location (SDK 54)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/location.mdx) — `getCurrentPositionAsync`

### 힌트

- 힌트 1: "다시 시도해도 소용없는 에러"를 어떻게 알아볼지 정한다. 2-4의 결과물을 쓴다.
- 힌트 2: 쓸 API 이름은 `AbortSignal`, `Error`의 `cause` 옵션, `clearTimeout`이다. `LocationScreen`의 `Promise.race`는 성공과 실패 어느 경로에서도 실행되는 블록이 무엇인지 생각해 보라.
- 힌트 3: (a) 대기가 취소되면 `setTimeout` 핸들이 남지 않는지, 이미 `aborted`인 `signal`을 받았을 때 어떻게 할지. (b) `AbortSignal.timeout`, `AbortSignal.any`, `signal.throwIfAborted`가 이 런타임(Hermes, RN 0.81)에서 있는지는 확인 필요. 쓰지 말고 기본 API만으로 시작하는 편이 안전하다. (c) `getCurrentPositionAsync` 자체는 중단 못 한다. `LocationScreen`에서 고칠 것은 **타이머 정리**뿐이다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
npm test
```

시뮬레이터: Network 화면 재시도 데모 정상 동작(로그의 백오프 시간이 지수로 증가), Location 화면 "현재 위치 가져오기"가 기존처럼 동작. 단위 테스트는 2-11에서 한다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: 4xx를 재시도하지 않는 이유와 5xx/네트워크 오류와의 차이
- [ ] 말로 설명할 수 있다: `cause`를 쓰면 호출부가 무엇을 할 수 있게 되는가
- [ ] 직접 구현했다: 비재시도 조건, `cause` 보존, `AbortSignal` 지원
- [ ] 직접 구현했다: `LocationScreen`의 타이머가 성공/실패 어느 경로에서도 정리된다

### 흔한 함정

- `signal`을 `fn`에 넘기지 않고 대기에만 쓴다.
- abort 때 `Promise`는 reject했는데 타이머는 안 지운다.
- 호출부(`NetworkScreen.tsx:74`)가 원본 메시지를 읽는다는 사실을 잊고 `message` 형식을 바꾼다.
- `flakyFetch`는 `status` 없는 일반 `Error`를 던진다. "재시도하지 않을 에러"의 기본값을 정할 때 이 데모가 깨지지 않는지 확인한다.

---

## 미션 2-6 — 권한·미디어 호출 에러 처리

선행: 없음

📱 **실기기 필요** — 카메라 성공 경로는 시뮬레이터로 검증할 수 없다. 에러 경로는 시뮬레이터에서도 볼 수 있다(카메라 호출이 실패할 가능성이 높음, 확인 필요).

### 증상과 위치

`await`한 네이티브 호출이 `try/catch` 밖에 있어 거부(reject)되면 처리되지 않은 Promise rejection이 된다.

| 위치 | 호출 |
|------|------|
| `src/screens/NotificationScreen.tsx:23` | `setNotificationChannelAsync` — `await`도 `catch`도 없음 |
| `:40`, `:46` | `requestPermissionsAsync` |
| `:56`, `:66` | `scheduleNotificationAsync` |
| `src/screens/PhotoScreen.tsx:33`, `:36` | `cameraRequestPermission`, `launchCameraAsync` |
| `:42` | `launchImageLibraryAsync` |
| `:51-52` | `isAvailableAsync` / `shareAsync` |
| `src/screens/NetworkScreen.tsx:82`, `:86` | `launchImageLibraryAsync`는 `try` 밖, `picked.assets[0].uri`는 `try`(`:85`) 안이라 잡히긴 하지만, `assets`가 빈 배열이면 `undefined.uri` TypeError 메시지가 그대로 로그에 찍힘 |

`NotificationScreen.tsx:28-33`의 `getPermissionsAsync`는 `catch`로 `permissionError`를 저장한다. 그러나 `permissionError`는 **화면 어디에도 렌더되지 않는다**(2-1의 warning과 같은 변수). `PhotoScreen.tsx:37, 43`에는 이미 `assets` 방어(`!result.assets || length === 0`)가 있다. 같은 패턴이 `NetworkScreen`에는 없다.

참고(범위 밖 관찰): `LocationScreen.tsx:40`의 `requestPermission()`도 `try` 밖이다.

### 왜 문제인가

모바일에선 OS가 권한을 가진다. 호출은 권한 상태, 기기 기능 유무(시뮬레이터 카메라 없음), OS 정책에 따라 거부될 수 있다. 웹의 `getUserMedia` 거부와 비슷하지만 "영구 거부" 상태가 있고 앱이 재요청 자체를 못 한다. 실패를 삼키면 사용자는 버튼을 눌러도 아무 반응이 없는 화면만 본다. 에러를 잡았다면 반드시 **보여줘야** 한다.

### 공식 문서

- [expo-notifications (SDK 54)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/notifications.mdx)
- [expo-image-picker (SDK 54)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/imagepicker.mdx)

### 힌트

- 힌트 1: 이 세 화면에서 "사용자가 누른 뒤 `await`하는 호출"을 모두 표로 만든다. 각 호출이 거부되면 화면에 무엇이 보여야 하는지 한 줄씩 적는다.
- 힌트 2: `try/catch`와 에러 메시지 상태. `NotificationScreen`의 `permissionError`가 이미 있다. `e instanceof Error ? e.message : String(e)` 패턴은 같은 파일 `:31`에 있다. 렌더는 `blocked` 블록(`:90-102`) 근처의 조건부 `Text`.
- 힌트 3: (a) 여러 호출이 같은 상태 하나를 공유할 때, 성공 시 이전 에러를 지우는 위치. (b) `canceled`는 에러가 아니다. 사용자가 취소한 것을 오류로 표시하지 않는다. (c) `NetworkScreen`의 `finally`(`:92-94`)가 `setUploadRatio(null)`을 하므로 `try` 범위를 어디까지 넓힐지 생각한다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .      # NotificationScreen:19 warning 해소 확인
```

시뮬레이터: 알림 권한 요청 → 허용/거부/설정 열기 흐름이 이전과 같은지. Photo 화면 "카메라로 촬영"을 눌렀을 때 시뮬레이터에서 에러가 화면에 보이는지(수정 전에 콘솔 경고만 뜨는지는 확인 필요). 실기기: 카메라 촬영 성공/취소/권한 영구 거부 3경로.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: 어떤 호출이 왜 reject될 수 있는가(권한, 기기 기능, OS 정책)
- [ ] 말로 설명할 수 있다: `canceled`와 에러의 차이
- [ ] 직접 구현했다: 세 화면의 호출을 `try/catch`로 감싸고 메시지를 화면에 렌더(`permissionError` 포함)
- [ ] 직접 구현했다: `NetworkScreen`의 `assets` 방어 추가

### 흔한 함정

- `catch`에서 `console.error`만 하고 UI에 안 보인다.
- 에러 상태를 만들고 성공 경로에서 지우지 않아 오래된 에러가 남는다.
- `canceled`를 에러로 취급한다.
- `blocked`(영구 거부 안내)와 `permissionError`(호출 실패)를 같은 메시지로 뭉갠다. 사용자가 할 수 있는 행동이 다르다.

---

## 미션 2-7 — FeedList 에러와 캐시 데이터 공존

선행: 2-2

### 증상과 위치

`src/screens/FeedListScreen.tsx:89-97`

```tsx
if (isError) {
  return ( /* "에러" 전체 화면 + 다시 시도 */ );
}
```

`isPending`(`:72`)은 "데이터가 아직 없음"이라 올바르다. 그러나 `isError`는 **데이터가 있어도** 참이 될 수 있다. 이미 받은 목록이 있는 상태에서 새로고침이나 다음 페이지가 실패하면, 멀쩡한 목록이 에러 화면으로 통째로 대체된다.

재현: 첫 페이지를 받은 뒤 실패를 만든다. 네트워크 끊김은 `isPaused`(오프라인 배너)로 처리되어 에러가 아니므로 이 재현엔 쓸 수 없다. 임시로 `fetchPosts`(`posts.ts:25`)가 `page === 2`일 때 던지게 바꾸고, 스크롤해서 다음 페이지를 요청한다(확인 후 반드시 되돌린다). 기본 재시도 때문에 실패 확정까지 수 초 걸린다.

같은 패턴: `FeedSectionsScreen.tsx:40-48`(범위 밖, 함께 고칠지는 선택).

### 왜 문제인가

React Query의 `status`는 "마지막 시도의 결과"이고 `data`는 "마지막으로 성공한 값"이다. 둘은 독립이다. 웹에서는 에러 토스트 + 기존 화면 유지가 흔하다. 모바일은 거기에 오프라인 상태까지 얽혀서(`isPaused`) 사용자가 "내 데이터가 사라졌다"고 오해하기 쉽다. 화면 전체 에러 UI는 **보여줄 데이터가 전혀 없을 때만** 맞다.

### 공식 문서

- [Infinite Queries](https://tanstack.com/query/v5/docs/framework/react/guides/infinite-queries)
- [Important Defaults](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults)
- [FlatList (RN 0.81)](https://reactnative.dev/docs/0.81/flatlist) — `ListHeaderComponent`, `ListFooterComponent`

### 힌트

- 힌트 1: 에러가 났을 때 "보여줄 데이터가 있는가"가 분기 기준이다. 현재 조건에 무엇이 빠졌는지 본다.
- 힌트 2: `isError`와 `data`(또는 `posts.length`)의 조합, 그리고 훅이 주는 세분화된 상태 `isRefetchError`, `isFetchNextPageError`(설치된 타입에서 확인함). 에러 표시는 목록 위의 배너(`offlineBar` 스타일 참고, `:102-106`)나 푸터.
- 힌트 3: (a) 다음 페이지 실패 시 `onEndReached`가 같은 요청을 즉시 반복하지 않게 한다. (b) 에러 배너의 "다시 시도"가 `refetch`(전체)인지 `fetchNextPage`인지 상황에 따라 다르다. (c) 에러 화면을 유지해야 하는 경우(데이터 0건)도 남겨 둔다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
```

시뮬레이터: 위 재현 절차로 (1) 목록이 유지된다 (2) 에러가 보인다 (3) 다시 시도가 동작한다. 임시로 넣은 실패 코드는 원복한다. 첫 페이지부터 실패하는 경우(데이터 없음)는 에러 화면 그대로인지도 확인한다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: `status === "error"`인데 `data`가 있을 수 있는 이유
- [ ] 말로 설명할 수 있다: `isPending`과 `isError`의 분기 순서가 의미하는 것
- [ ] 직접 구현했다: 데이터 있을 때는 목록 유지 + 에러 표시, 없을 때만 전체 에러 화면
- [ ] 직접 구현했다: 임시 실패 코드를 되돌렸다

### 흔한 함정

- `isError`를 지우기만 해서 에러가 사용자에게 전혀 안 보인다.
- 다음 페이지 실패 후 `onEndReached` 재호출 루프가 생긴다.
- 임시 실패 코드를 커밋한다. `git diff`로 `posts.ts`가 깨끗한지 확인한다.

---

## 미션 2-8 — 접근성

선행: 없음

### 증상과 위치

`grep -rn "accessib\|aria-\|role=" src`는 결과가 없다. `hitSlop`은 `src/screens/ComposeScreen.tsx:131` 한 곳뿐이다.

- `src/components/Btn.tsx:18-31` — `Pressable`에 role, state가 없다. 텍스트 자식이 있어 라벨은 자동으로 만들어지지만, "로그인 중…" 같은 진행 상태는 전달되지 않는다.
- `TextInput` — `LoginScreen.tsx:74, 93`, `ComposeScreen.tsx:73, 84`, `NetworkScreen.tsx:211`. 모두 `placeholder`뿐이다. 값이 입력되면 placeholder는 사라져서 스크린 리더 사용자는 무슨 입력란인지 알 수 없다.
- 직접 쓴 `Pressable` — `ComposeScreen.tsx:122`(닫기, 이것만 `hitSlop` 있음), `FeedListScreen.tsx:227, 240, 251`(시트 옵션), `FeedSectionsScreen.tsx:70`.

확인 방법: Xcode의 Accessibility Inspector로 시뮬레이터 요소의 role, label, state를 본다.

### 왜 문제인가

웹은 `<button>`, `<label for>` 같은 의미 있는 태그가 접근성 기본값을 준다. RN의 `Pressable`, `View`는 의미가 없는 컨테이너라 role과 state를 직접 알려야 한다. 공통 컴포넌트인 `Btn`을 고치면 앱 전체 버튼이 한 번에 개선된다. `hitSlop`은 보이는 크기는 그대로 두고 터치 영역만 넓힌다. 작은 대상(아이콘 버튼 등)에 의미가 있다.

### 공식 문서

- [Accessibility (RN 0.81)](https://reactnative.dev/docs/0.81/accessibility) — `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, `role`
- [View (RN 0.81)](https://reactnative.dev/docs/0.81/view)
- [Pressable (RN 0.81)](https://reactnative.dev/docs/0.81/pressable) — `hitSlop`
- [TextInput (RN 0.81)](https://reactnative.dev/docs/0.81/textinput)

### 힌트

- 힌트 1: `Btn` 하나만 먼저 고친다. 버튼이 가질 수 있는 상태가 무엇인지(비활성, 진행 중) props와 비교해 본다.
- 힌트 2: `role="button"`(또는 `accessibilityRole`), `accessibilityState`의 `disabled`/`busy`, 입력란의 `accessibilityLabel`. `hitSlop`은 `Rect | number`.
- 힌트 3: (a) 문서상 `role`이 `accessibilityRole`보다 우선한다. 둘을 섞지 않는다. (b) `Pressable`이 `disabled` prop을 `accessibilityState`에 합쳐 주는지 RN 소스(`node_modules/react-native/Libraries/Components/Pressable/Pressable.js` 229행 부근)에서 확인하고, 이미 있는 것을 중복으로 넣지 않는다. (c) `Btn` 높이는 `paddingVertical: 13`(`theme/styles.ts`) 기준으로 이미 충분할 수 있다. `hitSlop`이 필요한 대상을 먼저 정한다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
```

시뮬레이터: Accessibility Inspector로 `Btn`(role=button, 비활성/진행 중 상태), 로그인 입력란(label)을 확인한다. 화면 모양과 레이아웃이 그대로인지도 본다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: 웹 `<button>`과 RN `Pressable`이 접근성 정보에서 다른 점
- [ ] 말로 설명할 수 있다: `placeholder`가 `label`을 대신할 수 없는 이유
- [ ] 직접 구현했다: `Btn`의 role/state, `TextInput` 5곳의 label
- [ ] 직접 구현했다: `hitSlop`을 둘 곳과 그 이유를 정했다 (`ComposeScreen`의 직접 `Pressable`은 3-2에서 `Btn`으로 바뀌므로 그때 `Btn`이 같은 효과를 내야 한다)

### 흔한 함정

- 모든 곳에 `accessibilityLabel`을 붙인다. 텍스트 자식이 있으면 자동 라벨이 이미 있고, 덮어쓰면 보이는 글자와 달라질 수 있다.
- `hitSlop`을 겹치는 이웃 버튼 쪽으로 넓혀 오터치를 만든다.
- `disabled`와 `accessibilityState.disabled`를 서로 다른 값으로 넣는다.

---

## 미션 2-9 — 의존성·설정 정리

선행: 없음

현재 `package.json`과 `app.json`을 읽고 확인한 결과를 정리한다. **해당하는 것만 미션**이고, 해당 없으면 아래에 그렇게 적었다.

| 항목 | 현재 상태 | 판정 |
|------|-----------|------|
| `@react-navigation/elements` | `ComposeScreen.tsx:16`에서 `useHeaderHeight`를 **직접 import**. `package.json` dependencies에 **없음**(`bottom-tabs`·`native-stack`의 하위 의존성으로 설치됨, lock으로 확인) | 해당 |
| `expo-status-bar` | `package.json:35`에 선언. `src`, `App.tsx`, `index.ts`에서 import 0건 | 해당 (제거 or 사용) |
| `eslint-config-prettier` | `package.json:52` **한 번만** 선언 | 중복 선언은 해당 없음 (아래 참고) |
| `engines` | `package.json`에 필드 없음. `.nvmrc`도 없음 | 해당 |
| `app.json` 플러그인·권한 문구 | `expo-image-picker`에 `photosPermission`(영어)만, `cameraPermission` 없음(`app.json:32-35`). `expo-location`, `expo-notifications` 플러그인 항목 없음 | 해당 |
| `app.json` `userInterfaceStyle` | `"light"`(`app.json:9`). 앱은 `DarkTheme`(`App.tsx:120`)와 어두운 배경 | 해당 |

### 증상과 위치

- **elements**: `package.json`에 없는 패키지를 직접 import하면 hoisting 때문에 지금은 되지만, 상위 패키지 버전이 바뀌어 하위 의존성이 사라지거나 위치가 바뀌면 깨진다.
- **expo-status-bar**: 쓰지 않는 의존성은 설치·번들 크기·업그레이드 부담이다. 단, 이 앱은 어두운 배경에 `userInterfaceStyle: "light"`다. 상태바 글자색이 어떻게 보이는지 시뮬레이터에서 먼저 확인한다. "제거"와 "사용"은 이 결과에 따라 갈린다.
- **eslint-config-prettier**: `eslint.config.js`가 직접 require하진 않는다. `eslint-plugin-prettier/recommended`가 내부에서 require하고, `eslint-config-expo`의 의존성에는 없다(확인함). 따라서 지금 선언은 필요한 것으로 보인다. 제거하려면 lint가 깨지지 않는지 먼저 확인해야 하며, 이 항목은 **현재는 해당 없음**.
- **engines**: `react-native`의 `engines.node`는 `>= 20.19.4`다. 한편 `npm test`는 `.ts`를 Node가 직접 실행(타입 제거)하므로 더 높은 Node가 필요하다. README의 `nvm use 22.21.1`과 일치하는 하한을 정해야 한다. 정확한 하한은 확인 필요(Node 문서에서 type stripping 기본 활성 버전).

### 왜 문제인가

설정은 "지금 돌아가므로 괜찮다"가 가장 오래 버티는 부채다. 직접 쓰는 패키지는 직접 선언한다. 안 쓰는 의존성은 정리한다. 권한 문구는 사용자가 OS 팝업에서 보는 문장이라 앱의 신뢰와 스토어 심사에 영향을 준다. 모바일 고유 문제: 문구는 네이티브 빌드에 박힌다.

### 공식 문서

- [app config (SDK 54)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/config/app.mdx) — 속성 목록 자체는 최신판 본문으로 확인된다. **속성 이름은 SDK 54 기준으로 직접 확인한다**.
- [expo-image-picker (SDK 54)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/imagepicker.mdx) — 플러그인 속성 `photosPermission`, `cameraPermission`, `microphonePermission`
- [expo-location (SDK 54)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/location.mdx) — 플러그인 속성 `locationWhenInUsePermission` 등
- [expo-notifications (SDK 54)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/notifications.mdx)
- [status-bar (SDK 54)](https://github.com/expo/expo/blob/sdk-54/docs/pages/versions/v54.0.0/sdk/status-bar.mdx)

### 힌트

- 힌트 1: 먼저 각 항목을 `grep`/설정 파일로 직접 확인해 위 표가 맞는지 검증한다. 틀리면 그 사실을 기록한다.
- 힌트 2: `npx expo install <pkg>`(SDK 호환 버전 선택), `npm uninstall`, `package.json`의 `engines`, `app.json`의 플러그인 배열 `[이름, 옵션객체]` 형식.
- 힌트 3: (a) Expo Go에서는 앱 자체의 권한 문구가 적용되지 않는다(Expo Go 앱의 것이 쓰임). 시뮬레이터로는 `app.json` 문구를 눈으로 확인할 수 없다. 확인하려면 dev build 또는 설정 해석 결과를 본다(`npx expo config` 계열, 정확한 옵션은 `--help`로 확인 필요). (b) 권한 문구는 앱 언어(한국어)와 맞출지 정한다. (c) `userInterfaceStyle`을 바꾸면 상태바, 키보드, 시스템 UI가 함께 바뀐다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck
npx eslint .
npm test
npx expo install --check     # 선언 버전이 SDK 54와 맞는지 (옵션 동작은 확인 필요)
```

시뮬레이터: 상태바 글자가 어두운 배경에서 읽히는지, 앱 정상 기동. 설정 변경은 Metro 재시작이 필요할 수 있다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: 직접 import하는 패키지를 선언해야 하는 이유(phantom dependency)
- [ ] 말로 설명할 수 있다: 권한 문구가 JS가 아니라 네이티브 빌드에 들어가는 이유
- [ ] 직접 구현했다: 해당 항목 처리(elements, status-bar 결정, engines, app.json)
- [ ] 직접 구현했다: "해당 없음" 항목(`eslint-config-prettier`)의 근거를 한 줄 적었다

### 흔한 함정

- `npm install`로 SDK와 안 맞는 버전을 넣는다. `expo install`을 쓴다.
- `expo-status-bar`를 지우고 상태바 가독성 문제를 못 본다.
- `app.json` 플러그인 변경 후 Expo Go에서 반영된 줄 안다.
- `engines` 하한을 React Native 요구치(`>= 20.19.4`)만 보고 정해, `npm test`가 요구하는 Node 버전을 놓친다.

---

## 미션 2-10 — 타입 보강

선행: 없음

### 증상과 위치

- **RootParamList 전역 선언 없음.** `grep -rn "ReactNavigation\|RootParamList" src App.tsx` 결과 없음. `src/navigation/types.ts`에는 `RootStackParamList` 등 **개별 param list 타입**만 있다.
- **`tabsScreenOptions`**: `src/navigation/index.tsx:32-38` 타입 없는 객체 리터럴. `:86`에서 `screenOptions`로 전달. (`theme/styles.ts:138`의 `stackHeader`도 같은 모양이나 범위 밖.)
- **`import type` 누락**: `src/screens/LocationScreen.tsx:10-11` `HomeStackParamList`, `NativeStackScreenProps`가 타입인데 일반 `import`. 다른 화면은 모두 `import type`.
- **죽은 try/catch**: `src/screens/LoginScreen.tsx:47-52`의 안쪽 `try { signIn(...) }`. `signIn`은 `(name: string) => void`(`src/auth/AuthContext.tsx:7`)이고 `App.tsx:64-75` 구현은 동기 구간에서 던지지 않으며 저장 실패는 자체 `.catch`로 처리한다. `src/screens/ProfileScreen.tsx:18-23`의 `await signOut()`도 동기 함수이고(`App.tsx:76-89`) `catch (e)`의 `e`는 쓰이지 않는다(2-1 warning). `clearPersistError?.()`의 `?.`도 필수 필드에 붙어 있다.

### 왜 문제인가

- **RootParamList**: React Navigation의 `useNavigation()`, `navigate`, `Link` 같은 전역 API는 앱의 루트 param list를 알아야 타입 검사를 한다. 선언이 없으면 이런 호출은 타입 보호 밖이다. 단, 현재 코드는 `useNavigation`을 **쓰지 않아**(`grep` 0건) 이득은 미래 확장에 가깝다. 미션을 하기 전에 이 코드에서 무엇이 구체적으로 안전해지는지 직접 확인한다(확인 필요).
- **죽은 try/catch**는 "에러를 처리한다"는 거짓 신호를 준다. 실제 실패 경로(`login`의 reject는 바깥 `catch`가 처리, `SecureStore` 실패는 `persistError`)가 어디 있는지를 흐리게 한다.
- **`import type`**: 타입은 컴파일 후 사라진다. 명시하면 번들러와 Node의 TS 실행(2-11)에서 안전하다. 값처럼 import한 타입은 Node에서 `does not provide an export named …`로 실패한다(실험으로 확인함).

### 공식 문서

- [React Navigation — TypeScript](https://reactnavigation.org/docs/typescript/) (무버전 URL = 현재 7.x)
- 비교용 6.x 문서: [React Navigation 6.x — TypeScript](https://reactnavigation.org/docs/6.x/typescript/)

### 힌트

- 힌트 1: 먼저 두 문서(7.x와 6.x)에서 "루트 타입을 어떻게 등록하는가"를 비교한다. 방식이 다르다.
  - 7.x 문서(문서 원문으로 확인 필요): `declare module '@react-navigation/native' { interface RootNavigator extends … }` 방식
  - 6.x 문서: `declare global { namespace ReactNavigation { interface RootParamList … } }` 방식
  - 설치된 `@react-navigation/core`(7.21.5)의 타입 정의(`node_modules/@react-navigation/core/lib/typescript/src/types.d.ts` 85-106행)에는 `RootNavigator` 인터페이스(주석 예시는 `'@react-navigation/core'` 모듈 확장)와, 그것에서 파생되는 전역 `ReactNavigation.RootParamList`가 함께 있다.
  - **이 프로젝트가 어느 쪽인지는 확인 필요.** 이 프로젝트는 네비게이터를 `createNativeStackNavigator<ParamList>()` 제네릭 방식으로 만들고(`index.tsx:26-29`), 루트가 로그인 여부로 두 갈래(`:112-122`, `:125-143`)다. 문서의 예제가 이 구조에 그대로 맞는지, 어느 네비게이터를 "루트"로 등록할지는 문서를 읽고 직접 판단하며 `tsc`로 확인한다.
- 힌트 2: `BottomTabNavigationOptions`(`@react-navigation/bottom-tabs`에서 export됨, 확인함)로 `tabsScreenOptions`에 타입 부여. 단순 주석 대신 `satisfies` 연산자 사용 여부는 장단을 비교한다. `import type { … }`.
- 힌트 3: 죽은 `try/catch`를 지울 때 **바깥** `try/catch`(`login` 실패 처리, `:53-56`)는 살아 있는 경로다. 안쪽만 지운다. `ProfileScreen`은 `await`가 정말 필요한지 함께 판단한다.

### 검증

```bash
nvm use 22.21.1
npm run typecheck     # 전역 선언 후 기존 코드에서 새 에러가 생기는지
npx eslint .          # ProfileScreen:21 warning 해소
```

시뮬레이터: 로그인(틀린 비밀번호 → 오류 메시지, 맞는 비밀번호 → 진입), 로그아웃. 둘 다 기존과 같아야 한다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: 7.x와 6.x의 루트 타입 등록 방식 차이와 이 프로젝트가 따르는 쪽
- [ ] 말로 설명할 수 있다: `import type`이 런타임에 주는 차이
- [ ] 직접 구현했다: 루트 타입 등록 (또는 "이 코드에선 불필요"라는 근거 있는 결론), `tabsScreenOptions` 타입, `import type`
- [ ] 직접 구현했다: 죽은 try/catch 제거 후 로그인/로그아웃 동작이 그대로임을 확인했다

### 흔한 함정

- 문서 버전을 섞는다(6.x의 `declare global` 방식을 7.x 문서 코드와 합친다).
- 전역 선언을 넣고 `tsc`가 조용하다고 효과가 있다고 믿는다. `useNavigation()` 호출 하나를 임시로 써 보고 잘못된 이름에 에러가 나는지 확인한다.
- 죽은 `try/catch` 정리 중 살아 있는 `catch`까지 지운다.

---

## 미션 2-11 — 테스트 확장

선행: 2-3, 2-5

### 증상과 위치

- `tests/auth.test.ts`는 하나뿐이다. `:8`의 `await new Promise((r) => setTimeout(r, 4100))`로 실제 4초를 기다린다(`npm test` 약 6초).
- `groupByTens`(`src/api/posts.ts:140`)는 순수 함수인데 `posts.ts`가 `react-native`, `@react-native-community/netinfo`를 import해서 Node 테스트에서 불러올 수 없다.
- `withRetryBackoff`(`src/api/network.ts:14`)는 타이머를 쓰는 로직. `network.ts:1`이 `expo-file-system/legacy`를 import한다.
- `getNextPageParam`은 `posts.ts:108-109`에 인라인이라 직접 호출할 수 없다.
- 낙관적 롤백 로직은 `useDeletePost`(`posts.ts:118-135`), `FeedDetailScreen.tsx:45-58`, `setMutationDefaults`의 `onError`(`posts.ts:81`)에 훅/컴포넌트와 얽혀 있다.

테스트 실행 환경: `npm test` = `node --test "tests/*.test.ts"`. Node 22.21.1이 `.ts`를 타입 제거만 해서 실행한다. `tsconfig.json`의 `allowImportingTsExtensions: true`(`:6`) 때문에 TS도 `.ts` 확장자 import를 허용한다. `tests/auth.test.ts:3`이 `"../src/api/auth.ts"`로 확장자를 붙이는 이유다.

### 왜 문제인가

테스트를 쓰기 어려운 코드는 대개 "순수 로직"과 "프레임워크 의존"이 섞인 코드다. 로직을 의존성 없는 파일로 빼면 테스트가 쉬워지고, 빼기 힘든 곳이 설계의 접점이다. 실시간 `sleep`은 느리고 불안정하다. Node의 `MockTimers`로 시간을 가짜로 흘리면 4초를 즉시 지나갈 수 있다. 웹 앱의 Jest/Vitest `useFakeTimers`와 같은 개념이다.

### 공식 문서

- [Node.js test runner (v22)](https://nodejs.org/docs/latest-v22.x/api/test.html) — `mock.timers.enable()`, `tick()`
- [TanStack Query — Testing](https://tanstack.com/query/v5/docs/framework/react/guides/testing)
- [Infinite Queries](https://tanstack.com/query/v5/docs/framework/react/guides/infinite-queries) — `getNextPageParam`
- [Optimistic Updates](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates)

### 힌트

- 힌트 1: 테스트 대상마다 "이 함수가 Node에서 import되는가"부터 확인한다. 안 된다면 순수 부분만 새 파일로 분리한다. 분리한 파일은 `react-native` 등을 import하면 안 된다.
- 힌트 2: `node:test`의 `mock.timers.enable({ apis: [...] })`와 `tick(ms)`, `mock.method(Math, "random", …)`(백오프의 jitter 고정), `assert.deepEqual`. `groupByTens`, `getNextPageParam`은 입력/출력 표만 있으면 되는 순수 함수 테스트다. 롤백은 순수 함수(예: 페이지 배열에서 항목 제거, 스냅샷 복원)로 빼서 테스트하거나, `QueryClient`를 직접 만들어 캐시를 조작한다(Testing 문서 참고).
- 힌트 3: 이 환경에서 직접 확인한 제약과 주의점.
  - 분리한 파일이 타입을 쓸 때 `import { Post } from …`처럼 값 import하면 Node 로드가 실패한다. `import type`.
  - import 경로에 `.ts` 확장자가 없으면 Node가 모듈을 못 찾는다.
  - `MockTimers`는 Node 22에서 experimental이라 실행 시 경고가 출력된다(이상 아님). 가짜 타이머를 진행시킨 뒤에도 Promise 체인이 끝나려면 마이크로태스크를 한 번 비워 줘야 하는 경우가 있다.
  - `auth.ts`의 만료는 `Date.now()`와 `setTimeout`이 같이 얽혀 있다(`Date`: `:38`, `:62` / `setTimeout`: `:46`, `:58`, `:74`). `Date`도 가짜로 할지, TTL을 바꿀 수 있게 할지는 선택이다. 대기하는 지연이 여러 단계라 tick을 단계마다 줘야 한다.

### 검증

```bash
nvm use 22.21.1
npm test                # 목표: 4초 sleep 제거로 전체 시간이 눈에 띄게 줄어듦
npm run typecheck       # tests/ 도 tsc 대상이다 (tsconfig include 미지정)
npx eslint .
```

테스트가 **실패할 수 있는지** 확인한다. 대상 로직을 일부러 깨뜨려 빨개지는지 보고 되돌린다.

### 자기 체크리스트

- [ ] 말로 설명할 수 있다: 왜 `posts.ts`를 그대로 테스트에서 import할 수 없는가
- [ ] 말로 설명할 수 있다: fake timers가 `setTimeout`을 어떻게 대체하는가
- [ ] 직접 구현했다: `groupByTens`, `getNextPageParam`, `withRetryBackoff`(fake timers), 낙관적 롤백 테스트
- [ ] 직접 구현했다: `auth.test.ts`의 4초 sleep 제거, 테스트가 여전히 단일 갱신을 검증한다

### 흔한 함정

- 로직을 분리하면서 동작까지 바꾼다(예: 2-3에서 정한 정책과 다른 함수).
- 가짜 타이머를 켜고 `mock.timers.reset()`을 빼먹어 다음 테스트로 새어 나간다.
- `Math.random`을 고정하지 않아 백오프 시간 단언이 가끔 실패한다.
- `HttpError`(2-4)를 테스트에서 import하는데 parameter property로 정의해 로드가 실패한다.
- 테스트가 구현을 그대로 복사한 기대값을 쓴다.
