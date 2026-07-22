# P3 학습 가이드 — 네비게이션 (앱 뼈대)

> 대상 코드: 현재 `App.tsx` — 탭 + 중첩 스택 + 모달 + 로그인 게이트 + 타입 안전 params + 딥링크
> 출처: [React Navigation](https://reactnavigation.org/docs/getting-started) · [expo-linking](https://docs.expo.dev/versions/v54.0.0/sdk/linking/)
> 검증: iOS 26.5 시뮬레이터 실측
> 핵심: **웹 라우팅과 근본이 다르다. URL/history가 아니라 "화면 스택"을 컴포넌트 트리로 구성한다.**

---

## 0. 웹 라우팅과 다른 5가지

1. **URL/브라우저 history 없음.** 화면을 "스택"에 push/pop. 뒤로가기 = 하드웨어 버튼/스와이프 제스처.
2. **라우팅 = 컴포넌트 트리.** `<a href>`가 아니라 `NavigationContainer` 안의 Navigator/Screen 트리.
3. **인증 게이트 = redirect가 아니다.** 로그인 상태에 따라 **다른 네비게이터를 렌더**.
4. **params = URL 쿼리가 아니다.** `navigate('Detail', {id})`로 넘기고 `route.params`로 받음. 타입 지정 필수.
5. **화면 생명주기.** `useEffect`는 최초 마운트만. 탭 전환/뒤로 복귀는 `useFocusEffect`.

## 1. 네비게이터 = 컴포넌트, 트리로 중첩

```tsx
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
```
이 앱의 트리 구조:
```
NavigationContainer
└ RootStack (인증 후)
  ├ Tabs (bottom-tabs)
  │  ├ HomeTab → HomeStack (native-stack)
  │  │           ├ FeedList
  │  │           ├ FeedSections
  │  │           └ FeedDetail
  │  └ ProfileTab
  └ Compose (모달 그룹)
```
**탭 하나(HomeTab)가 자기만의 스택**을 가진다(중첩). 그래서 홈 탭 안에서 List↔Detail 히스토리가 프로필 탭과 독립적으로 쌓인다.

## 2. 타입 안전 파라미터

각 네비게이터마다 "화면 → 파라미터" 맵을 타입으로 선언한다.

```tsx
type HomeStackParamList = {
  FeedList: undefined;                        // 파라미터 없음
  FeedSections: undefined;
  FeedDetail: { id: string; title?: string }; // 필수 id + 옵셔널 title
};
```
```tsx
// navigate 인자가 타입과 안 맞으면 컴파일 에러
navigation.navigate("FeedDetail", { id: String(item.id), title: item.title });
// 받는 쪽
const { id } = route.params;   // route.params가 { id: string; title?: string }로 추론됨
```
웹 URL 쿼리(`?id=2`, 전부 문자열)와 달리 **객체를 그대로 넘기고 타입 체크**를 받는다. 화면 컴포넌트는 `NativeStackScreenProps<ParamList, "화면명">`으로 `navigation`/`route` 타입을 얻는다.

## 3. 인증 게이트 = 네비게이터 교체 (핵심 패턴)

```tsx
function RootNavigator() {
  const { user } = useAuth();

  if (user == null) {
    // 미인증: 인증 스택만 렌더. 앱 트리(탭/모달)는 존재조차 안 함.
    return (
      <AuthStack.Navigator>
        <AuthStack.Screen name="Login" component={LoginScreen} />
      </AuthStack.Navigator>
    );
  }
  // 인증: 탭 + 모달
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Tabs" component={TabsScreen} />
      ...
    </RootStack.Navigator>
  );
}
```
웹은 보호 라우트에서 `<Navigate to="/login">`로 **redirect**한다. RN(권장 패턴)은 **조건부로 아예 다른 네비게이터를 렌더**한다.

**이 방식의 자동 보안 효과**: 로그아웃하면 `user`가 `null`이 되고 인증된 `RootStack` 전체가 **언마운트**된다. 보호 화면들이 트리에서 사라지므로 뒤로가기로 되돌아갈 수 없다. redirect 방식처럼 "뒤로가면 캐시된 보호 화면이 잠깐 보이는" 문제가 원천 차단된다.

## 4. 모달 — presentation + getParent 버블링

```tsx
<RootStack.Group screenOptions={{ presentation: "modal" }}>
  <RootStack.Screen name="Compose" component={ComposeScreen} />
</RootStack.Group>
```
`presentation: "modal"` → 카드가 **아래에서 위로** 슬라이드, iOS는 스와이프 다운으로 닫힘.

모달은 **RootStack 소유**인데, 열려는 버튼은 깊숙한 FeedList(HomeStack) 안에 있다. 부모 네비게이터로 올라가 호출한다:

```tsx
navigation
  .getParent<NativeStackNavigationProp<RootStackParamList>>()
  ?.navigate("Compose");
```
`navigate` 액션은 **처리 가능한 네비게이터까지 자동으로 버블링**되지만, 타입 안전을 위해 `getParent`로 명시적으로 올라가 RootStack 타입을 지정했다.

## 5. 화면 생명주기 — useEffect vs useFocusEffect

```tsx
useFocusEffect(
  useCallback(() => {
    console.log("FeedList 포커스됨");        // 탭 진입/뒤로 복귀마다
    return () => console.log("FeedList 블러됨"); // 떠날 때
  }, []),
);
```

| | `useEffect` | `useFocusEffect` |
|--|--|--|
| 실행 시점 | 최초 마운트 1회 | 화면이 **포커스될 때마다** |
| 문제 | 탭 전환/뒤로 복귀를 못 잡음(화면이 언마운트 안 됨) | 복귀마다 재실행 |
| 용도 | 초기 셋업 | 복귀 시 새로고침, 분석 로그, 타이머 재개 |

탭 네비게이션은 화면을 **언마운트하지 않고 유지**한다. 그래서 탭을 떠났다 돌아와도 `useEffect`는 다시 안 돈다 → 복귀 감지는 `useFocusEffect`가 필요. `useCallback`으로 감싸는 게 필수(매 렌더 새 함수면 매번 재구독).

## 6. 딥링크 — URL → 화면 매핑

```tsx
const linking = {
  prefixes: [Linking.createURL("/"), "picsel://"],
  config: {
    screens: {
      Tabs: { screens: { HomeTab: { screens: {
        FeedList: "feed",
        FeedDetail: "feed/:id",   // :id → route.params.id
      } } } },
    },
  },
};
```
- **`prefixes`**: 어떤 URL을 이 앱 링크로 인식할지. `Linking.createURL("/")`가 Expo Go dev용(`exp://.../--/`)과 빌드용(`picsel://`)을 자동 생성.
- **`config.screens`**: **중첩 네비게이터 구조를 그대로 반영**해야 한다. `picsel://feed/2` → `Tabs > HomeTab > FeedDetail(id="2")`로 트리 깊이를 따라 내려간다.
- `:id` = 경로 파라미터 → `route.params.id`로 들어옴.

> 주의: 로그아웃 상태(AuthStack만 마운트)에선 보호 화면 링크가 매칭 대상이 없어 무시된다. 실무는 로그인 후 재적용 로직을 따로 붙인다.

## 7. 이동 액션 3종

| 액션 | 동작 |
|--|--|
| `navigation.navigate("X", params)` | X로 이동(이미 스택에 있으면 그 화면으로) |
| `navigation.push("X", params)` | X를 **새로** 스택에 쌓음(같은 화면 중복 가능) |
| `navigation.goBack()` | 현재 화면 pop |

```tsx
navigation.push("FeedDetail", route.params);  // 같은 상세를 계속 쌓기 (스택 개념 실습)
navigation.goBack();                           // 뒤로(pop)
```

---

## 웹 라우팅 → RN 요약

| 웹 (React Router) | RN (React Navigation) |
|--|--|
| URL + history | 화면 스택(push/pop) |
| `<Route path>` | `<Stack.Screen name>` |
| `<Link to>` / `navigate()` | `navigation.navigate()` |
| `?query`, `:param` (문자열) | `route.params` (타입 있는 객체) |
| 보호 라우트 = redirect | 인증 = 네비게이터 교체 |
| 라우트 = URL 매칭 | 라우트 = 컴포넌트 트리 + (선택) 딥링크 |
| `useEffect`로 마운트 감지 | `useFocusEffect`로 포커스 감지 |

## 복습 체크리스트

> 답이 막히면 위 해당 섹션으로. 코드를 안 보고 **말로 설명**할 수 있어야 통과.

- [ ] RN 네비게이션이 웹 URL 라우팅과 다른 근본 5가지는? — [React Navigation](https://reactnavigation.org/docs/getting-started)
- [ ] 탭이 각자 스택을 가진다(중첩)는 게 무슨 뜻인가? — [Nesting navigators](https://reactnavigation.org/docs/nesting-navigators)
- [ ] `ParamList` 타입이 주는 이점은? navigate 인자가 틀리면? — [Type checking with TypeScript](https://reactnavigation.org/docs/typescript/)
- [ ] 인증 게이트를 redirect가 아니라 네비게이터 교체로 하면 뭐가 자동으로 안전해지나? — [Authentication flows](https://reactnavigation.org/docs/auth-flow/)
- [ ] 깊은 화면에서 조상이 소유한 모달을 어떻게 여나?(`getParent`) — [Navigation object](https://reactnavigation.org/docs/navigation-object/)
- [ ] 탭을 떠났다 돌아왔을 때 `useEffect`가 안 도는 이유와, 대신 쓰는 것은? — [`useFocusEffect`](https://reactnavigation.org/docs/use-focus-effect/)
- [ ] `picsel://feed/2`가 화면까지 도달하려면 `config.screens`가 무엇을 반영해야 하나? — [Configuring links](https://reactnavigation.org/docs/configuring-links/) · [expo-linking](https://docs.expo.dev/versions/v54.0.0/sdk/linking/)
- [ ] `navigate` vs `push`의 차이는? — [Moving between screens](https://reactnavigation.org/docs/navigating/)
