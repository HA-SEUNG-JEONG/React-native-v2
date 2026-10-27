# Day 37 · 12/16 (수) — react-hook-form + zod 폼 검증

> 전제: Day 30의 "서버에 게시" mutation(`src/hooks/useCreatePost.ts`), Day 22의 로컬 "저장", Day 35의 임시 저장(`src/storage/draft.ts`의 `loadDraft`·`saveDraft`·`clearDraft`)이 붙은 기록 탭(`app/(tabs)/write.tsx`)이 있다.

## 오늘의 목표

기록 탭 글쓰기 폼의 `useState` 입력 관리를 react-hook-form과 zod 스키마 검증으로 바꾼다.

## 읽기(15분)

- https://react-hook-form.com/docs/usecontroller/controller
  - RN의 `TextInput`은 `register`가 아니라 `Controller`로 감싼다. `render`가 받는 `field`에는 `value`, `onChange`, `onBlur`, `ref`가 있고, `fieldState.error`로 그 필드의 에러를 읽는다. RN 예시에서는 `onChangeText={onChange}`로 연결한다.
- https://react-hook-form.com/docs/useform
  - `defaultValues`는 필드마다 주고 `undefined`는 피한다. `resolver`에 스키마 검증기를 연결한다(`validate`나 `required` 같은 내장 규칙과는 함께 못 쓴다). `mode` 기본값은 `onSubmit`이고, `onTouched`는 필드를 벗어난 뒤부터 변경마다 검증한다.
  - `formState`는 렌더 중에 읽은 속성만 구독한다.
- https://zod.dev/api
  - Zod 4 기준이다. 객체는 `z.object({...})`, 타입은 `z.infer<typeof schema>`로 얻고, 이메일은 `z.email()`을 쓴다. 에러 메시지는 `{ error: '...' }` 옵션으로 준다(`message`는 deprecated이지만 아직 동작한다. 변경 내역: https://zod.dev/v4/changelog).

> 확인할 버전과 설치(2026-10-27 확인):
> - `zod`는 4.x가 최신이고 `@hookform/resolvers`는 zod 3.25 이상과 4를 지원한다.
> - `@hookform/resolvers` 최신 6.0.0은 `npm install`이 `ERESOLVE`(옵션 peer 의존성 `effect` 충돌)로 실패했다. 그래서 `@hookform/resolvers@5`로 고정해 설치한다(5.9.2 + zod 4.6.7 + react-hook-form 7.91에서 검증이 동작함을 확인했다). 6.0.0이 정상 설치되는 환경이면 그대로 써도 된다.
> - `import { zodResolver } from '@hookform/resolvers/zod'`로 가져온다. 안 되면 `tsconfig.json`의 `moduleResolution`이 `bundler`, `node16`, `nodenext` 중 하나인지 확인한다(react-hook-form 시작 문서의 안내).

## 예측(10분)

1. 제목 칸을 비운 채 "서버에 게시"를 누르면 `mutate`가 호출될까? 에러 문구는 언제(제출 시/입력 중/칸을 벗어날 때) 나타날까? `mode`를 `onTouched`로 두었을 때와 기본값일 때를 나누어 적는다.

> 내 예측:

2. 제목에 앞뒤 공백이 있는 `"  abc  "`를 입력하고 스키마에 `.trim()`이 있을 때, `onSubmit`의 `values.title`은 `"  abc  "`일까 `"abc"`일까?

> 내 예측:

3. `useForm`의 `defaultValues`에서 `body`를 빼면, 본문을 한 번도 건드리지 않고 제출했을 때 본문 에러 문구는 어떻게 보일까?

> 내 예측:

## 만들기(40분)

설치(오늘 처음 설치한다): `npm install react-hook-form zod @hookform/resolvers@5`

시간 배분(40분): 스키마·`useForm`·`Controller` 교체와 두 버튼 25분 / 임시 저장 연결 10분 / 완료 기준 확인 5분. 임시 저장 연결이 길어지면 `subscribe` 디바운스 저장만 선택 과제로 미루고, 복원(`reset(draft)`)과 제출 성공 뒤 `clearDraft()`까지만 필수로 한다.

새로 만들거나 고칠 파일:
- `src/schemas/post.ts`: `postSchema`와 `PostForm` 타입. 제목은 `trim()` 후 2자 이상 60자 이하, 본문은 `trim()` 후 10자 이상. 모든 에러 문구는 `{ error: '...' }`로 한국어로 준다.
- `app/(tabs)/write.tsx`: 제목·본문 `useState` 두 개를 `useForm<PostForm>`으로 바꾼다. `Controller`로 제목·본문 `TextInput`을 연결하고, 각 입력 아래에 `fieldState.error?.message`를 빨간 `Text`로 보여 준다. "저장"(Day 22의 `dispatch`)과 "서버에 게시"(Day 30의 `mutate`) 두 버튼 모두 `handleSubmit(values => ...)`로 감싸 같은 스키마로 검증한다. 성공하면 `reset({ title: '', body: '' })`하고 Day 35의 `clearDraft()`를 호출해 임시 저장을 지운다(두 버튼의 `handleSubmit` 콜백 모두). `subscribe` 저장을 붙였다면 `reset`이 부른 빈 값 콜백이 디바운스로 `clearDraft()` 뒤에 빈 임시 저장을 다시 쓰지 않게, 대기 중인 타이머를 지우거나 빈 값이면 저장하지 않는다.
- 같은 파일의 임시 저장(Day 35): 마운트 때 `loadDraft()` 결과가 있으면 `reset(draft)`로 채운다. Day 35의 `isLoaded` 보호 장치는 그대로 유지한다.
- 선택 과제(시간이 모자라면 미룬다): 변경 저장을 `subscribe`로 값 변화를 받아 500ms 디바운스 뒤 `saveDraft`를 호출하도록 붙인다.

핵심 호출 형태:

```tsx
const { control, handleSubmit, reset, subscribe } = useForm<PostForm>({
  resolver: zodResolver(postSchema),
  defaultValues: { title: '', body: '' },
  mode: 'onTouched',
});
// <Controller control={control} name="title" render={({ field, fieldState }) => ( ... )} />
```

`subscribe`는 `useEffect` 안에서 `subscribe({ formState: { values: true }, callback: ({ values }) => ... })`를 호출하고 반환된 함수로 해제한다(https://react-hook-form.com/docs/useform/subscribe).

완료 기준:
- [ ] 스키마를 어기면 `dispatch`·`mutate`가 호출되지 않고 해당 칸 아래에 한국어 에러가 보인다.
- [ ] `PostForm` 타입을 `z.infer`로 얻었고, `useForm`과 `createPost` 입력 타입과 호환된다.
- [ ] 제목 앞뒤 공백이 서버로 가는 값에서 제거된다(`onSubmit`에서 `console.log(values)`로 확인 후 로그를 지운다).
- [ ] 앱을 껐다 켜면 임시 저장이 `reset`으로 폼에 복원된다(`subscribe` 저장을 미뤘다면 `saveDraft`를 임시로 한 번 호출해 둔 뒤 확인한다).
- [ ] "저장"이나 게시 성공 뒤 폼이 비고 `clearDraft()`가 호출되어 `loadDraft()`가 빈 값을 돌려준다.

## 검증(10분)

1. 빈 폼으로 게시 → 제목 한 글자 → 본문 9자 순으로 시도해 각 에러 문구를 확인한다.
2. `"  abc  "` 제목으로 제출하고 로그의 값을 예측 2와 비교한다.
3. 깨뜨려 보기: `defaultValues`에서 `body`를 빼고 본문을 건드리지 않은 채 제출해 에러 문구를 본다(예측 3). zod 기본 영어 메시지(`Invalid input: expected string, received undefined`)가 나오는 것을 확인하고 되돌린다.

> 다른 지점:

## 이해 점검 질문

1. 검증 규칙을 컴포넌트가 아니라 zod 스키마에 두면 무엇이 좋아지는가? 타입은 어떻게 얻는가?
2. RN에서 `register` 대신 `Controller`를 쓰는 이유는?
3. `defaultValues`를 비워 두면 안 되는 이유는? (zod와 `formState.isDirty` 관점에서)

<details><summary>정답</summary>

1. 규칙과 에러 문구가 한곳에 모이고 UI와 분리되어, 같은 스키마를 다른 폼이나 서버 응답 검증에도 재사용하고 단위 테스트할 수 있다. 타입은 `z.infer<typeof schema>`로 스키마에서 바로 얻어서 규칙과 타입이 어긋나지 않는다.
2. RN의 `TextInput`은 `onChangeText`처럼 값을 직접 받는 콜백을 쓴다. 공식 RN 예시도 `register`를 펼치지 않고 `Controller`가 넘겨 주는 `field.value`, `field.onChange`, `field.onBlur`를 `value`, `onChangeText`, `onBlur`에 직접 연결한다. 폼이 에러 필드에 포커스를 줄 수 있으려면 `field.ref`도 `TextInput`의 `ref`에 연결해야 한다.
3. 값이 `undefined`로 시작하면 zod는 "문자열이 아니라 undefined"라는 타입 에러를 먼저 내서 의도한 최소 길이 메시지가 나오지 않는다. 또 `isDirty`는 현재 값을 `defaultValues`와 비교하므로 기본값이 없으면 변경 여부 판단이 어긋난다. RHF 문서도 기본값에 `undefined`를 피하라고 한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: react-hook-form, zod, @hookform/resolvers 설치`
- `refactor: 글쓰기 폼을 react-hook-form과 zod 스키마 검증으로 교체`
- `feat: 임시 저장을 폼 reset·subscribe와 연결`
