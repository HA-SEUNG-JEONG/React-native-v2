# Day 20 · 11/23 (월) — router API(push·replace·back), 중첩 라우트, not-found, useFocusEffect

> 전제: Day 15~19에서 만든 `app/_layout.tsx`(루트 Stack), `app/(tabs)/_layout.tsx`(Tabs), 탭 화면 `app/(tabs)/index.tsx`(피드)·`write.tsx`(기록)·`settings.tsx`(설정), 상세 `app/post/[id].tsx`를 기준으로 쓴다.

## 오늘의 목표

`router.push`·`replace`·`back`이 화면 스택을 어떻게 바꾸는지 직접 확인하고, 설정 탭 안에 중첩 Stack을 만들고, 없는 경로용 not-found 화면과 `useFocusEffect`를 붙인다.

## 읽기(15분)

1. https://docs.expo.dev/versions/latest/sdk/router/ — `useRouter()`가 돌려주는 메서드 표(`push`, `replace`, `navigate`, `back`, `canGoBack`, `dismiss`)와 `useFocusEffect` 항목.
   - 확인할 사실: `replace`는 "history에 추가하지 않고" 이동한다. `back`은 history를 거슬러 간다. `canGoBack()`은 boolean을 돌려준다.
   - 확인할 사실: `useFocusEffect`의 effect는 화면이 포커스를 얻을 때마다 실행되고, 반환한 cleanup은 포커스를 잃을 때 실행된다(언마운트 때가 아니다). 콜백은 `React.useCallback`으로 감싸라고 적혀 있다.
2. https://docs.expo.dev/router/basics/navigation/ — `Link`, `router.navigate`, `router.push`, `router.replace`, `router.back`, `Redirect` 비교.
   - 확인할 사실: `navigate`는 새 화면을 쌓거나 스택에 이미 있는 같은 화면으로 되돌아간다. `push`는 항상 새 화면을 쌓는다. `Redirect`는 `replace`처럼 동작한다.
3. https://docs.expo.dev/router/advanced/nesting-navigators/ — `_layout.tsx`가 navigator를 정의하고, 한 navigator 화면 안에 다른 navigator를 넣을 수 있다.
   - 확인할 사실: 중첩된 화면으로 갈 때 화면 이름을 params로 넘기지 않고 `router.push('/root/settings/media')`처럼 전체 경로를 쓴다.

참고(만들기에서 필요할 때 연다): https://docs.expo.dev/router/error-handling/ — `app/+not-found.tsx`와 `Unmatched`. `docs.expo.dev/router/...` 페이지는 버전 고정 URL이 없는 최신 문서다. v54 동작과 다른 것 같으면 위 1번(v54.0.0) 문서를 우선한다.

## 예측(10분)

코드를 치기 전에 적는다.

1. 피드에서 글 1 상세로 들어간 뒤, 상세에서 `router.push('/post/2')`를 두 번 눌렀다. `router.back()`을 한 번 누르면 어느 글이 보이는가? 피드로 돌아가려면 back을 총 몇 번 눌러야 하는가?
   > 내 예측:
2. 같은 상황에서 `push` 대신 `router.replace('/post/2')`를 두 번 눌렀다. 피드로 돌아가려면 back을 몇 번 눌러야 하는가?
   > 내 예측:
3. 앱 안에 없는 경로(`/nothing`)로 `router.push`하면 화면에 무엇이 보이는가? 피드 탭에서 설정 탭으로 갔다가 돌아오면, 피드 화면의 `useEffect(() => {...}, [])` cleanup은 실행되는가?
   > 내 예측:

## 만들기(40분)

**A. 상세 화면 이동 실험과 안전한 뒤로가기** — Day 16에서 만든 `app/post/[id].tsx`
- 임시 버튼 두 개를 단다: "push로 다음 글"(`router.push`로 `id + 1` 글), "replace로 다음 글"(`router.replace`).
- 헤더 또는 화면 안 "뒤로" 버튼은 갈 곳이 없을 때를 처리한다.

```tsx
const router = useRouter();
const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
```

**B. 설정 탭 중첩 Stack** — Day 17에서 만든 `app/(tabs)/settings.tsx`를 폴더로 바꾼다.
- `app/(tabs)/settings/_layout.tsx`: `<Stack />` 반환.
- `app/(tabs)/settings/index.tsx`(기존 설정 내용), `app/(tabs)/settings/licenses.tsx`("오픈소스 라이선스" 화면, 쓰는 패키지 이름 몇 개를 `Text`로).
- 설정 index에서 `<Link href="/settings/licenses">라이선스</Link>`로 이동. `(tabs)`는 그룹 이름이라 URL에 들어가지 않는다.
- `app/(tabs)/_layout.tsx`의 설정 `Tabs.Screen`에 `options={{ headerShown: false }}`를 줘서 탭 헤더와 Stack 헤더가 겹치지 않게 한다.

**C. not-found** — 새 파일 `app/+not-found.tsx`
- "찾을 수 없는 화면입니다" 문구와 `<Link href="/">피드로 돌아가기</Link>`를 보여 준다.

**D. 포커스 로그** — 피드 탭 `app/(tabs)/index.tsx`
- `useFocusEffect`(`expo-router`에서 import)로 포커스/블러를 콘솔에 찍는다.

```tsx
useFocusEffect(
  useCallback(() => {
    console.log('피드 focus');
    return () => console.log('피드 blur');
  }, []),
);
```

완료 기준
- [ ] 상세에서 push 버튼과 replace 버튼의 back 횟수가 다르게 나오고, 그 횟수를 예측 칸과 비교해 적었다.
- [ ] 탭 화면(피드)에서 `router.canGoBack()`을 찍으면 `false`가 나온다.
- [ ] 설정 탭 안에서 라이선스로 들어가면 Stack 헤더에 뒤로 버튼이 생기고, 다른 탭으로 갔다 와도 탭 바는 그대로다.
- [ ] 존재하지 않는 경로를 열면 `+not-found.tsx` 화면이 나오고 링크로 피드에 돌아간다.
- [ ] 피드/설정 탭을 오갈 때 `피드 focus`/`피드 blur`가 번갈아 찍힌다.
- [ ] 임시 push/replace 버튼은 실험 기록 후 지운다.

## 검증(10분)

- 시뮬레이터에서 피드 → 글 1 → "push로 다음 글" 두 번 → back을 눌러 가며 화면과 횟수를 센다. 같은 순서를 replace로 반복한다. 예측과 다른 지점을 적는다.
- 존재하지 않는 경로는 임시로 피드에 `router.push('/nothing')` 버튼을 만들어 확인한다(확인 후 삭제).
- 피드 탭의 `useEffect(() => { return () => console.log('unmount') }, [])`를 임시로 달고 탭을 오가며 `unmount`가 찍히는지 본다.
- 일부러 깨뜨리기: `useFocusEffect`의 `useCallback`을 지우고 effect 안에서 `useState` 카운터를 올려 본다. 로그가 몇 번 찍히는지, 어떤 경고가 나오는지 적는다.

## 이해 점검 질문

1. `push`, `replace`, `navigate`의 차이를 "뒤로 가기 스택이 어떻게 변하는가"로 설명하라.
2. 탭 화면에서 포커스될 때마다 실행할 코드를 `useEffect(..., [])`로 쓰면 왜 부족한가? `useFocusEffect`는 어떻게 다른가?
3. 상세 화면의 뒤로 버튼에 `router.back()`만 쓰면 어떤 상황에서 문제가 되고, 어떻게 고치는가?

<details><summary>정답</summary>

1. `push`는 항상 새 화면을 스택 맨 위에 쌓아서 back을 누르면 직전 화면으로 돌아간다. `replace`는 현재 화면을 새 화면으로 바꿔서 스택 길이가 늘지 않으므로 교체된 화면은 back으로 돌아갈 수 없다. `navigate`는 이미 스택에 같은 화면이 있으면 새로 쌓지 않고 거기로 되돌아가고, 없으면 쌓는다. 그래서 같은 화면을 반복해서 쌓고 싶지 않을 때 `navigate`가 기본 선택이다.
2. 탭 화면은 한 번 열리면 탭을 옮겨도 보통 언마운트되지 않는다. `useEffect(..., [])`는 마운트 때 한 번만 실행되고 cleanup도 언마운트 때만 실행되므로, 탭을 오갈 때는 아무 일도 일어나지 않는다. `useFocusEffect`는 화면이 포커스를 얻을 때마다 effect를, 잃을 때 cleanup을 실행한다. effect 함수 자체가 deps 역할을 하므로 `useCallback`으로 감싸 안정시켜야 한다.
3. 딥링크나 알림으로 상세 화면이 앱의 첫 화면으로 열리면 스택에 이전 화면이 없어서 `back()`이 아무 일도 하지 않는다. `router.canGoBack()`으로 확인하고 false면 `router.replace('/')`로 피드에 보낸다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 상세 화면 뒤로가기에 canGoBack 분기 추가`
- `refactor: 설정 탭을 중첩 Stack 라우트로 분리`
- `feat: not-found 화면과 피드 useFocusEffect 로그 추가`

## 웹과 다른 점

웹은 브라우저 history 하나에 URL이 쌓이지만, RN의 Stack/Tabs는 navigator마다 자기 history를 가지고 탭 화면은 언마운트되지 않으므로 "화면이 보일 때 실행"은 마운트가 아니라 포커스 이벤트로 다룬다.
