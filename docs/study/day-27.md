# Day 27 · 12/2 (수) — API 클라이언트 모듈과 에러 모델

## 오늘의 목표

화면마다 흩어진 `fetch` 코드를 `api/` 모듈로 모으고, 네트워크 실패와 HTTP 오류를 구분하는 `ApiError`로 피드와 상세 화면이 에러 문구를 다르게 보여 주게 한다.

## 읽기(15분)

1. https://reactnative.dev/docs/network — `fetch`의 두 번째 인자(`method`, `headers`, `body`)와 에러 처리 예시.
   - 확인할 사실: 요청 옵션에 `headers`의 `Accept`, `Content-Type`을 주는 형태가 예시로 있다. 이 모양을 `request()` 함수에 한 번만 쓰면 된다.
   - 확인할 사실: 이 페이지의 알려진 문제 목록에 "같은 이름의 헤더는 Android에서 마지막 하나만 남는다"가 있다. 공통 헤더를 한 곳에서 관리하는 이유로 기억해 둔다.
2. https://jsonplaceholder.typicode.com/guide/ — `/posts`, `/posts/1`, `/posts/1/comments` 등 엔드포인트.
   - 확인할 사실: 없는 id(예: `/posts/99999`)는 404를 돌려주는지 오늘 `curl`이나 앱에서 직접 확인한다. 이 가이드에는 404 동작이 적혀 있지 않다(문서에서 확인 필요).
3. https://react.dev/learn/synchronizing-with-effects — Day 25~26에서 읽은 "Fetching data"를 다시 훑는다. 오늘 만들 모듈은 Effect 밖으로 나가는 `fetch` 부분이고, Effect(취소 처리)는 화면에 남는다는 점을 구분한다.

## 예측(10분)

1. `class ApiError extends Error`를 만들어 `throw new ApiError(...)`한 뒤 `catch`에서 `error instanceof ApiError`를 쓰면 `true`가 나오는가?
   > 내 예측:
2. 비행기 모드일 때와 `/posts/99999`(404)일 때, 각각 `fetch`가 던지는 것/돌려주는 것은 무엇이고 `ApiError`의 `kind`를 어떻게 정해야 두 경우를 구분할 수 있는가?
   > 내 예측:
3. 요청 함수가 `signal`을 받아 `fetch`에 넘겼다가 abort되면, 이 `AbortError`도 `ApiError`로 감싸야 하는가?
   > 내 예측:

## 만들기(40분)

**새 파일**
- `src/api/client.ts`: 공통 `request<T>(path: string, options?: { signal?: AbortSignal }): Promise<T>`.
  - `BASE_URL = 'https://jsonplaceholder.typicode.com'`을 한 곳에 둔다.
  - `fetch` 자체가 reject되면(`catch`) `new ApiError('network', ...)`를 던진다. 단, `error.name === 'AbortError'`이면 감싸지 않고 그대로 다시 던진다.
  - `!response.ok`이면 `new ApiError('http', ..., response.status)`를 던진다.
  - 성공하면 `response.json()`을 `T`로 반환한다.
- `src/api/client.ts` 안의 `ApiError`: `class ApiError extends Error`, 필드는 `kind: 'network' | 'http'`와 `status?: number`.

```ts
export class ApiError extends Error {
  constructor(public kind: 'network' | 'http', message: string, public status?: number) {
    super(message);
  }
}
```

- `src/api/posts.ts`: `getPosts({ userId, signal })`와 `getPost(id, { signal })`. 둘 다 `request`를 호출하고 `Post` 타입(Day 25의 `src/types/post.ts`)을 반환한다.

**고칠 파일**
- `app/(tabs)/index.tsx`: Day 25~26의 `fetch` 직접 호출을 `getPosts`로 교체한다. `ignore`/`AbortController` 구조는 그대로 둔다. 에러 문구를 `ApiError`로 고른다: `kind === 'network'`이면 "인터넷 연결을 확인해 주세요", `status`가 404이면 "글을 찾을 수 없어요", `status`가 500 이상이면 "서버에 문제가 있어요", 그 외는 "알 수 없는 오류".
- `app/post/[id].tsx`(Day 16의 상세): `id` 파라미터로 `getPost`를 호출해 제목과 본문을 보여 준다. 로딩·에러·성공 3상태는 Day 25 피드와 같은 구조로 만든다. 에러 문구 선택은 피드와 같은 함수를 쓰도록 `src/api/messages.ts`의 `getErrorMessage(error: unknown): string`에 한 번만 쓴다.

완료 기준
- [ ] 화면 파일에 `fetch(`와 `BASE_URL` 문자열이 없다(grep으로 확인).
- [ ] 비행기 모드에서 "인터넷 연결을 확인해 주세요", 존재하지 않는 글 id(임시로 하드코딩한 `99999`)에서 "글을 찾을 수 없어요"가 보인다.
- [ ] 필터 칩 연타 시 `AbortError`가 에러 화면으로 새지 않는다(Day 26 동작 유지).
- [ ] `request`의 반환 타입이 `Promise<T>`이고 `getPosts`/`getPost`의 반환이 `Post[]`/`Post`로 추론된다(`npx tsc --noEmit`에 에러 없음).
- [ ] 에러 문구 선택 로직이 피드와 상세에 중복되어 있지 않다.

## 검증(10분)

- 예측 1을 확인한다. `catch`에서 `error instanceof ApiError`를 콘솔에 찍는다. `false`가 나오면 `error.kind`나 `error.name === 'ApiError'`처럼 필드로 판별하도록 `ApiError`에 `name`을 지정하거나 판별 함수 `isApiError`를 만든다. 결과를 적는다(문서에서 확인 필요한 동작이라 실험으로 판단한다).
- 상세 화면에서 존재하는 글과 존재하지 않는 글(임시 id 99999) 둘을 열어 본다. 404일 때 `ApiError.status` 값을 찍어 확인한다.
- 일부러 깨뜨리기: `request`에서 `AbortError` 예외 처리를 지우고(모든 `catch`를 `network`로 감싼다) 칩을 연타한다. "인터넷 연결을 확인해 주세요"가 잘못 뜨는지 확인한 뒤 원복한다.

## 이해 점검 질문

1. 에러에 `kind`와 `status`를 두는 이유는 무엇인가? 문자열 `message`만으로 구분하면 어떤 문제가 생기는가?
2. 왜 `AbortError`는 `ApiError`로 감싸지 않고 그대로 던지는가?
3. 화면에서 `fetch`를 직접 부르는 방식과 `api/` 모듈을 거치는 방식을 비교하면 무엇이 좋아지는가? (Day 28의 TanStack Query와 연결해서 한 가지 이상)

<details><summary>정답</summary>

1. 화면이 "연결 문제"와 "서버가 거부한 요청"을 다르게 안내하려면 원인 종류와 상태 코드가 필요하다. `message` 문자열은 번역이나 문구 수정으로 바뀌고 파싱이 취약해서 분기 기준으로 쓸 수 없다. `kind`와 `status`는 코드가 의존할 수 있는 안정적인 값이다.
2. abort는 사용자에게 알릴 오류가 아니라 의도된 취소이므로, `ApiError`로 감싸면 호출한 쪽이 일반 오류로 처리해 에러 화면을 띄운다. 그대로 던져서 호출하는 쪽에서 `error.name === 'AbortError'`로 걸러야 한다.
3. 기본 URL, 헤더, `response.ok` 검사, JSON 파싱, 에러 변환이 한 곳에 모이므로 바꿀 곳이 하나다. 화면은 `getPosts()`가 성공 시 `Post[]`를 주고 실패 시 `ApiError`를 던진다는 계약만 알면 된다. Day 28의 `useQuery`는 `queryFn`에 이 `getPosts`를 그대로 넘기면 되므로 모듈을 분리해 둔 덕에 화면 쪽 변경이 작다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `refactor: fetch를 api 클라이언트 모듈로 분리`
- `feat: ApiError로 네트워크·HTTP 오류 구분`
- `feat: 상세 화면이 getPost로 글 불러오기`
