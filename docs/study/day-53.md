# Day 53 · 1/7 (목) — 다크 모드와 테마 토큰

## 오늘의 목표

색을 `src/constants/theme.ts`의 라이트/다크 토큰으로 모으고, `useColorScheme`으로 읽어 모든 탭에 적용하며, 설정 탭에서 시스템/라이트/다크를 고르게 만든다.

## 읽기(15분)

1. https://docs.expo.dev/develop/user-interface/color-themes/
   - 확인할 사실: `app.json`의 `userInterfaceStyle`은 `automatic`(시스템을 따름), `light`, `dark` 중 하나이고, 속성이 없으면 라이트로 동작한다. 기본 템플릿은 `automatic`이다. Android 개발 빌드에서는 `expo-system-ui`가 설치되어 있어야 이 속성이 적용된다. 이 가이드 페이지는 SDK 버전별 주소가 아니므로, 이 프로젝트의 `app.json`(`userInterfaceStyle`)과 `package.json`(`expo-system-ui`)을 직접 열어 위 내용이 맞는지 확인한다.
2. https://reactnative.dev/docs/0.81/usecolorscheme
   - 확인할 사실: 반환값은 `'light'`, `'dark'`, `null`(사용자가 선호를 밝히지 않음) 셋 중 하나다. 이 훅은 색상표 변경을 구독하므로 앱이 켜져 있는 동안 값이 바뀌면 컴포넌트가 다시 렌더된다.
3. https://reactnative.dev/docs/0.81/appearance
   - 확인할 사실: `Appearance.setColorScheme('light' | 'dark' | null)`은 앱이 쓰는 색상표를 강제하고, `null`이면 시스템 설정을 따른다. 시스템 설정 자체를 바꾸지는 않으며, 앱과 앱이 띄우는 네이티브 요소(알럿·피커 등)에 적용된다.

## 예측(10분)

1. 시스템이 다크일 때 `Appearance.setColorScheme('light')`를 호출하면 `useColorScheme()`의 값은 무엇일까? 다시 `setColorScheme(null)`을 호출하면?

> 내 예측:

2. 컴포넌트 색은 전부 토큰으로 바꾸고 루트 레이아웃의 `ThemeProvider`는 라이트 테마로 고정한 채 다크 모드로 전환하면, 화면 본문과 탭바·헤더는 각각 어떤 색일까?

> 내 예측:

3. 어떤 컴포넌트에 `backgroundColor: '#ffffff'`를 하드코딩해 두면 다크 모드에서 어떻게 보일까?

> 내 예측:

## 만들기(40분)

Daily Log 전체(피드·기록·설정·상세)에 다크 모드를 입힌다.

1. `src/constants/theme.ts`의 `Colors`를 만든다. `light`와 `dark` 두 객체가 같은 키를 갖게 한다. 필요한 키: `background`(화면), `surface`(카드·입력창), `text`, `textMuted`, `border`, `primary`, `danger`(삭제 배경 등). 값은 직접 고르되, 각 모드에서 `text`와 `background`가 충분히 구분되는지 눈으로 확인한다. 키 이름과 값 모양은 TypeScript가 `Colors.light`와 `Colors.dark`가 같음을 보장하도록 쓴다(`typeof Colors.light` 같은 타입 활용).
2. `src/hooks/useTheme.ts`의 `useTheme()`를 만든다. `react-native`의 `useColorScheme()`로 현재 값을 읽고, `null`이면 `'light'`로 취급해 해당 색 객체를 돌려준다.
3. 색을 하드코딩한 곳을 모두 찾아 토큰으로 바꾼다. 먼저 `app`과 `src` 아래에서 색 리터럴(`#`로 시작하는 값, `'white'`, `'black'` 등)을 검색해 목록을 만든다.
   - 레이아웃 스타일(패딩·정렬 등)은 `StyleSheet`에 그대로 두고, 색만 `style={[styles.card, { backgroundColor: theme.surface }]}`처럼 렌더 시점에 덧붙인다.
   - 대상: 피드 카드와 목록 배경, 글 상세 화면, 기록 탭의 입력창·목록·`SwipeableRow`의 삭제 배경(Day 52를 건너뛰었다면 생략), 설정 화면, Day 51의 하트·연습 박스.
4. 루트 레이아웃 `app/_layout.tsx`의 `RootLayout`: `@react-navigation/native`의 `ThemeProvider`에 `DarkTheme`/`DefaultTheme`를 현재 색상표에 맞춰 넘기고, `expo-status-bar`의 `StatusBar`는 `style="auto"`로 둔다. reset-project로 지워졌으므로 `GestureHandlerRootView` 바로 안에 새로 추가한다. 이 `ThemeProvider`가 헤더·탭바 같은 내비게이션 요소의 색을 정한다.
5. 설정 탭에 "화면 모드" 선택 항목을 추가한다. 시스템 / 라이트 / 다크 세 개의 `Pressable`을 두고, 누르면 각각 `Appearance.setColorScheme(null | 'light' | 'dark')`를 호출한다. 현재 선택은 `useState`로 표시한다.
6. 시간이 남으면(선택, 완료 기준에는 넣지 않는다): 선택값을 Day 35의 AsyncStorage에 저장하고 앱 시작 시 복원한다. `Appearance.getColorScheme()`은 강제된 색상표만 알려 주고 "시스템"을 구분하지 못하므로, 선택값 자체를 따로 저장해야 한다.

완료 기준

- [ ] `app.json`의 `userInterfaceStyle`이 `automatic`이고 `package.json`에 `expo-system-ui`가 있음을 확인했다
- [ ] `Colors.light`와 `Colors.dark`가 같은 키를 갖고, 컴포넌트에서는 `useTheme()`로 읽는다
- [ ] `app`과 `src`에서 색 리터럴 검색 결과가 `src/constants/theme.ts`에만 남는다(의도한 예외는 기록 칸에 적는다)
- [ ] 시스템 모드를 바꾸면 피드·기록·설정·상세와 탭바·헤더가 모두 따라 바뀐다
- [ ] 설정의 시스템/라이트/다크 선택이 시스템 모드와 무관하게 동작한다
- [ ] 타입 오류와 `npm run lint` 경고가 없다

## 검증(10분)

확인할 동작

- 시뮬레이터의 외관을 앱을 켠 채로 전환한다. iOS 시뮬레이터는 터미널에서 `xcrun simctl ui booted appearance dark`와 `appearance light`를, Android 에뮬레이터는 `adb shell cmd uimode night yes`와 `night no`를 쓴다. 각 탭과 상세 화면에서 본문 색, 탭바, 헤더, 상태 막대 글자색이 모두 따라오는지 본다.
- 설정에서 "다크"를 고른 뒤 시스템을 라이트로 바꿔도 앱은 다크를 유지하는지, "시스템"으로 돌아오면 시스템을 따르는지 본다. 예측 1과 비교한다.

일부러 깨뜨려 보는 실험

- 어떤 컴포넌트 하나에 `backgroundColor: '#ffffff'`를 일부러 하드코딩하고 다크 모드로 전환해 본다. 이어서 `RootLayout`의 `ThemeProvider`를 잠시 지우고(감싸는 껍데기만 제거) 전환해, 헤더·탭바 색이 어떻게 되는지 적는다. 예측 2, 3과 비교한 뒤 둘 다 되돌린다.

> 실험 결과:

## 이해 점검 질문

1. `useColorScheme()`가 `null`을 돌려줄 수 있는 이유는 무엇이고, `useTheme()`는 이를 어떻게 처리해야 할까?
2. `Appearance.setColorScheme(null)`과 `Appearance.setColorScheme('dark')`는 어떻게 다르고, 무엇을 바꾸고 무엇을 바꾸지 않을까?
3. 색을 `StyleSheet.create` 안이 아니라 `useTheme()`의 값으로 렌더 시점에 덧붙이는 이유는 무엇이고, `ThemeProvider`는 이와 무슨 관계일까?

<details>
<summary>정답</summary>

1. 사용자가 선호를 밝히지 않았거나 플랫폼이 알려 주지 못하는 경우가 있어 문서가 `'light' | 'dark' | null`을 반환값으로 정의한다. 타입이 `null`을 포함하므로 `colorScheme ?? 'light'`처럼 기본값을 정해 두고 `Colors[...]`로 접근해야 타입 오류와 `undefined` 접근이 생기지 않는다.
2. `null`은 앱의 색상표 강제를 풀어 시스템 설정을 따르게 하고, `'dark'`는 시스템이 라이트여도 앱을 다크로 고정한다. 어느 쪽도 기기의 시스템 설정이나 다른 앱에는 영향을 주지 않으며, 변경은 앱과 앱이 띄우는 네이티브 요소(알럿·피커)에만 적용된다.
3. `StyleSheet.create`는 모듈이 로드될 때 한 번 계산되므로 런타임에 바뀌는 색상표를 알 수 없다. 색은 렌더 시점의 `useTheme()` 값으로 덧붙이고, 바뀌지 않는 레이아웃만 `StyleSheet`에 둔다. `ThemeProvider`는 `useTheme()`와 별개로, 내비게이션 라이브러리가 헤더·탭바·화면 배경을 칠할 때 쓰는 색을 정한다. 둘 중 하나만 적용하면 본문은 다크인데 헤더·탭바는 라이트인 식으로 어긋난다.

</details>

## 기록(5분)

배운 것 3줄:

1.
2.
3.

막힌 점:

## 커밋 단위 제안

- `feat: 라이트/다크 색상 토큰과 useTheme 훅 추가`
- `refactor: 화면 색상 하드코딩을 테마 토큰으로 교체`
- `feat: 설정 탭에 화면 모드 선택 추가`

## 웹과 다른 점

웹은 CSS `prefers-color-scheme` 미디어 쿼리와 CSS 변수로 색을 한 번에 바꾸지만, RN에는 둘 다 없어서 훅으로 현재 색상표를 읽어 JS 객체의 토큰을 스타일에 직접 넣는다.
