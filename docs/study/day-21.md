# Day 21 · 11/24 (화) — Context로 전역 상태 공유

## 오늘의 목표

`createContext`·Provider·`useContext`로 설정 탭에서 바꾼 닉네임을 피드 탭 헤더까지 props 없이 전달한다.

## 읽기(15분)

1. https://react.dev/learn/passing-data-deeply-with-context — 만들기(create) → 읽기(`useContext`) → 제공(Provider) 3단계.
   - 확인할 사실: `createContext(defaultValue)`의 인자는 Provider가 위에 없을 때 `useContext`가 돌려주는 값이다.
   - 확인할 사실: Provider의 `value`가 다음 렌더에서 바뀌면 그 아래에서 해당 context를 읽는 컴포넌트가 다시 렌더된다.
   - 확인할 사실: 문서 끝에서 context를 쓰기 전에 props 전달이나 `children` 전달로 해결되는지 먼저 보라고 권한다.
2. https://docs.expo.dev/router/advanced/authentication/ — "Session context" 부분과 루트 레이아웃 예제만 본다(인증 전체는 Day 23).
   - 확인할 사실: `useSession()`은 `SessionProvider` 밖에서 쓰면 에러를 던진다. `SessionProvider`가 `app/_layout.tsx`에서 navigator(`Stack`)를 감싼다.

## 예측(10분)

1. Provider 없이 `useProfile()`을 호출하는 화면을 열면 어떻게 되는가? `createContext`의 기본값을 `null`로 둔 경우와 `{ nickname: '나', setNickname: () => {} }`로 둔 경우를 나눠서 적는다.
   > 내 예측:
2. 설정 탭에서 닉네임 `TextInput`에 한 글자 칠 때마다, (가) 설정 화면 (나) 피드 화면(닉네임을 읽음) (다) 기록 화면(닉네임을 읽지 않음) 중 어느 화면의 render 로그가 찍히는가?
   > 내 예측:
3. 설정에서 닉네임을 "민수"로 바꾼 뒤 앱을 Reload하면 피드 헤더에는 무엇이 보이는가? 그 이유는?
   > 내 예측:

## 만들기(40분)

Daily Log에 "닉네임" 기능을 얹는다. 설정 탭에서 바꾸고, 피드 탭 헤더에 "{닉네임}님의 하루"를 보여 준다.

**새 파일** `src/contexts/ProfileContext.tsx`
- `ProfileProvider`: `useState`로 `nickname`(초기값 `'나'`)을 들고 `{ nickname, setNickname }`을 Provider `value`로 내려준다.
- `useProfile()`: `useContext`를 감싸고, Provider 밖이면 `throw new Error`로 알려 준다.

```tsx
const ProfileContext = createContext<ProfileValue | null>(null);

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile은 ProfileProvider 안에서만 쓸 수 있습니다');
  return value;
}
```

**고칠 파일**
- `app/_layout.tsx`의 `RootLayout`: `<Stack>`을 `<ProfileProvider>`로 감싼다. 위치가 "화면보다 위, 모든 탭보다 위"인 이유를 주석 한 줄로 남긴다.
- 설정 탭 `app/(tabs)/settings/index.tsx`: 닉네임 `TextInput`(Day 5)을 `useProfile().setNickname`에 연결한다.
- 피드 탭 `app/(tabs)/index.tsx`: `FlatList`의 `ListHeaderComponent`에 `{nickname}님의 하루`를 보여 준다.

완료 기준
- [ ] `ProfileProvider`가 `app/_layout.tsx`에 있고, 설정과 피드가 같은 `nickname`을 본다.
- [ ] 설정에서 입력하면 피드 탭 헤더가 바로 바뀐다(props를 한 번도 넘기지 않았다).
- [ ] Provider 밖에서 `useProfile()`을 부르면 위 에러 메시지가 뜬다(확인 후 원복).
- [ ] 각 탭 화면 맨 위의 `console.log('xxx render')` 로그로 예측 2번 결과를 기록했다(확인 후 로그 삭제).

## 검증(10분)

- 설정에서 닉네임을 입력하며 터미널의 render 로그를 센다. 예측과 다른 화면이 있으면 이유를 적는다.
- 앱을 새로고침(Reload)한 뒤 닉네임이 `'나'`로 돌아가는 것을 확인한다. 저장은 Day 35 이후에 다룬다.
- 일부러 깨뜨리기: `RootLayout`에서 `ProfileProvider`를 `app/(tabs)/_layout.tsx` 안으로 옮기고, 탭 바깥(`app/post/[id].tsx`)에서 `useProfile()`을 불러 본다. 어떤 에러가 나는지, Provider 위치가 "읽는 화면 전부를 포함하는 가장 가까운 위"여야 하는 이유를 적고 원복한다.

## 이해 점검 질문

1. 3단계 중 Provider를 빼먹으면 무슨 일이 생기고, 그걸 `useProfile`에서 `throw`로 막는 이유는 무엇인가?
2. Context `value`가 바뀌면 누가 다시 렌더되는가? 닉네임을 읽지 않는 기록 탭은 왜 영향이 없는가(또는 있는가)?
3. props로 충분한 경우와 Context가 어울리는 경우를 하나씩 들어라.

<details><summary>정답</summary>

1. Provider가 없으면 `useContext`는 `createContext`에 준 기본값을 돌려준다. 기본값이 `null`이면 `nickname`을 읽는 순간 TypeError가 나서 원인이 멀리서 드러난다. `throw`로 막으면 "Provider를 안 감쌌다"는 실제 원인을 바로 알려 주고, TypeScript에서도 `null` 체크가 끝난 값만 반환할 수 있다.
2. Provider의 `value`가 바뀌면 그 context를 `useContext`로 읽는 컴포넌트가 다시 렌더된다. `RootLayout`이 `<ProfileProvider><Stack /></ProfileProvider>`를 쓰면 `Stack` 엘리먼트는 `RootLayout`이 만든 그대로여서, state가 바뀌어도 `ProfileProvider`만 다시 렌더되고 `children`은 같은 엘리먼트라 읽지 않는 화면은 다시 렌더되지 않는다. 실제 로그와 같은지 검증 단계에서 확인한 결과로 판단한다.
3. 부모가 바로 아래 한두 단계 자식에게 값을 주는 경우(버튼의 `title`)는 props가 낫다. 앱 전체의 여러 깊이에서 읽는 값(닉네임, 이후의 로그인 정보)은 중간 컴포넌트를 거치지 않는 Context가 어울린다. 문서도 context 전에 props와 `children` 전달을 먼저 고려하라고 한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: ProfileContext로 닉네임을 앱 전체에서 공유`
- `feat: 설정 탭 닉네임 입력과 피드 헤더 인사 문구 추가`

## 웹과 다른 점

Context 자체는 웹 React와 같지만, 앱에서는 Provider를 라우터의 루트 레이아웃(`app/_layout.tsx`)에 두고, 탭 화면이 언마운트되지 않아 렌더 로그가 웹 페이지 이동과 다르게 찍힌다.
