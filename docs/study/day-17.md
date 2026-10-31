# Day 17 · 11/18 (수) — Tabs, SafeArea

## 오늘의 목표

피드·기록·설정 3탭 구조를 `app/(tabs)/`로 만들고, 헤더가 없는 설정 화면에서 SafeArea로 노치·상태바 영역을 피한다.

## 읽기(15분)

1. Tabs 레이아웃: https://docs.expo.dev/router/advanced/tabs/
   - 확인할 사실: `(tabs)` 폴더 안의 `_layout.tsx`가 `Tabs`를 렌더하고, 탭 하나마다 `Tabs.Screen`의 `name`이 같은 폴더의 파일 이름과 일치한다. `title`이 탭 글자가 된다. 루트 Stack에서 `<Stack.Screen name="(tabs)" options={{ headerShown: false }} />`로 Stack 헤더를 숨겨 헤더가 두 겹이 되는 것을 막는다.
2. `react-native-safe-area-context` Expo 문서: https://docs.expo.dev/versions/latest/sdk/safe-area-context/
   - 확인할 사실: `SafeAreaView`는 안전 영역 가장자리를 padding으로 적용하는 `View`이고 `edges` 배열(`'top'` 등)로 적용할 가장자리를 고른다. `useSafeAreaInsets()`는 `top`, `bottom` 같은 숫자를 돌려준다. 웹에서는 값이 0이다. 이 패키지는 템플릿에 이미 들어 있다.
3. RN `SafeAreaView` 문서: https://reactnative.dev/docs/safeareaview
   - 확인할 사실: RN 0.81에서 `react-native`의 `SafeAreaView`는 deprecated이고 `react-native-safe-area-context`를 쓰라고 한다. import 출처가 어디인지 확인한다.

## 예측(10분)

1. `app/(tabs)/write.tsx`의 URL은 `/(tabs)/write`인가 `/write`인가? Day 15에서 쓴 `<Link href="/write">`는 그대로 동작하는가?

> 내 예측:

2. 피드 탭에서 스크롤하고 기록 탭으로 갔다가 돌아오면 피드의 스크롤 위치와 상태는 어떻게 되는가?

> 내 예측:

3. 헤더를 끈 설정 화면에서 `SafeAreaView` 없이 제목을 맨 위에 그리면, iPhone 시뮬레이터에서 제목이 어디에 놓이는가?

> 내 예측:

## 만들기(40분)

Day 15~16의 라우트를 `(tabs)` 그룹으로 옮겨 3탭을 완성한다. 상세 화면은 탭이 아니라 루트 Stack에 남긴다.

목표 구조:

```
app/_layout.tsx         루트 Stack: (tabs) 숨김 헤더, post/[id]
app/(tabs)/_layout.tsx  Tabs: index(피드), write(기록), settings(설정)
app/(tabs)/index.tsx    Day 15의 피드
app/(tabs)/write.tsx    Day 15의 기록
app/(tabs)/settings.tsx 새 설정 화면
app/post/[id].tsx       Day 16의 상세 (그대로)
```

해야 할 일:
1. `app/index.tsx`, `app/write.tsx`를 `app/(tabs)/` 아래로 옮긴다. 편집기 이동으로 import가 깨지면 `@/` 별칭 경로로 바로잡는다.
2. `app/(tabs)/_layout.tsx`를 만들어 `Tabs`와 `Tabs.Screen` 세 개를 쓴다. `title`은 `피드`, `기록`, `설정`이다.
3. `app/_layout.tsx`의 `Stack`에서 `(tabs)`의 헤더를 숨기고 `post/[id]`는 그대로 둔다.
4. `app/(tabs)/settings.tsx`를 만든다. `Card` 안에 앱 이름 `Daily Log`와 "로그인은 Day 23에서 붙인다" 안내 문구를 둔다. 이 탭의 헤더는 `Tabs.Screen`의 `options`에서 `headerShown: false`로 끄고, 화면 최상단을 `react-native-safe-area-context`의 `SafeAreaView edges={['top']}`로 감싸 큰 제목 `설정`을 직접 그린다.
5. `app/post/[id].tsx` 화면 맨 아래에 `useSafeAreaInsets().bottom`을 `paddingBottom`으로 쓰는 하단 영역을 두고 "목록으로" `AppButton`(`router.back()`)을 놓는다. 홈 인디케이터에 가려지지 않아야 한다.

탭 아이콘은 선택 과제다. 템플릿의 `package.json`에 아이콘 패키지가 있으면 `tabBarIcon`을 써 보고, 없으면 글자 탭으로 둔다.

완료 기준:
- [ ] 하단에 `피드`, `기록`, `설정` 3개 탭이 보이고 누르면 전환된다
- [ ] `Link href="/write"`와 피드의 상세 이동(`/post/<id>`)이 URL을 바꾸지 않고 그대로 동작한다
- [ ] 상세 화면은 탭바 위로 덮여서 열리고 뒤로가기로 돌아온다
- [ ] 설정 탭의 제목이 상태바·노치와 겹치지 않는다
- [ ] 상세 화면 하단 버튼이 홈 인디케이터에 가려지지 않는다
- [ ] `import { SafeAreaView } from 'react-native'`가 어디에도 없다
- [ ] `npm run typecheck`와 `npx expo lint`가 오류 0개다

## 검증(10분)

- iPhone 시뮬레이터(노치 있는 기종)에서 설정 탭의 제목 위치와 상세 화면 하단 버튼 위치를 눈으로 확인한다. 피드를 스크롤한 뒤 다른 탭에 다녀와 스크롤이 유지되는지 본다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- 일부러 깨뜨려 보기: 설정 화면의 `SafeAreaView`를 일반 `View`로 바꿔 제목이 상태바와 겹치는 것을 확인하고 되돌린다.

## 이해 점검 질문

1. `(tabs)` 폴더 이름의 괄호는 무슨 뜻이며, 그 안의 `write.tsx`의 URL은 무엇인가?
2. 루트 Stack에서 `(tabs)`에 `headerShown: false`를 주는 이유는 무엇인가?
3. 설정 화면에서 `View`가 아니라 `react-native-safe-area-context`의 `SafeAreaView`를 쓰는 이유는 무엇이며, `edges={['top']}`만 주는 이유는 무엇인가?

<details>
<summary>정답</summary>

1. 괄호는 URL에 들어가지 않는 라우트 그룹이다. 그래서 `(tabs)/write.tsx`의 URL은 `/write`이고, 그룹 이름이 URL에 없으므로 기존 `Link href="/write"`가 그대로 동작한다. `(tabs)` 폴더 안의 `_layout.tsx`에서 `Tabs`를 쓰면 이 그룹이 탭 구조가 된다.
2. 탭 화면들이 이미 자기 헤더를 갖고 있는데 루트 Stack도 `(tabs)`를 하나의 화면으로 보고 헤더를 그리면 헤더가 두 겹이 되기 때문이다. 바깥 Stack 헤더를 숨겨 안쪽 Tabs의 헤더만 쓴다.
3. 헤더를 끄면 상태바·노치 영역을 헤더가 피해 주지 않으므로 직접 안전 영역을 비워야 하고, `SafeAreaView`가 그 크기를 기기에 맞게 padding으로 넣어 준다. RN 기본 `SafeAreaView`는 deprecated다. 하단은 탭바가 이미 안전 영역을 처리하므로 위쪽만 필요해서 `edges={['top']}`로 한정한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `refactor: 라우트를 (tabs) 그룹으로 옮기고 3탭 구성`
- `feat: 설정 탭과 SafeArea 적용`

## 웹과 다른 점

웹에는 노치·상태바·홈 인디케이터처럼 화면에서 피해야 할 영역이 없다. 모바일은 `SafeAreaView`나 `useSafeAreaInsets`로 직접 피하며, 웹 환경에서는 이 값들이 0이다.
