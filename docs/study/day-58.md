# Day 58 · 1/14 (목) — NetInfo와 오프라인 처리

## 오늘의 목표

`@react-native-community/netinfo`를 설치하고 `useNetInfo`로 연결 상태를 읽어, 오프라인일 때 피드와 상세 화면에 배너를 보여 주고 앱 시작 직후의 "알 수 없음" 상태에서는 배너가 깜빡이지 않게 만든다.

## 읽기(15분)

1. https://docs.expo.dev/versions/latest/sdk/netinfo/
   - 확인할 사실: 설치 명령은 `npx expo install @react-native-community/netinfo`이고 Expo Go에 포함되어 있다. `NetInfo.fetch()`는 한 번 읽고, `NetInfo.addEventListener()`는 변경을 구독하며 구독 해제 함수를 돌려준다. SDK 54가 고정하는 버전은 11.4.1이다(설치 후 `package.json`에서 확인). 최신 페이지는 권장 버전을 12.0.1로 적으므로 숫자가 다르다.
2. https://github.com/react-native-netinfo/react-native-netinfo (README)
   - 확인할 사실: `useNetInfo()` 훅이 있다. `isConnected`는 "활성 네트워크 연결이 있는가", `isInternetReachable`은 "그 연결로 인터넷에 닿는가"이며 둘은 다른 질문이다. 아직 알 수 없으면 값이 `null`이다. iOS 시뮬레이터는 네트워크 변경 알림을 제대로 받지 못하는 알려진 문제가 있어 실기기에서 테스트하라는 안내가 있다.
3. https://tanstack.com/query/latest/docs/framework/react/react-native 의 "Online status management" 절
   - 확인할 사실: React Native에서는 `onlineManager`가 기본으로 네트워크 변화를 알지 못하므로, NetInfo의 `addEventListener`로 `setOnline`을 연결해야 한다. `isConnected`가 참인 경우를 온라인으로 취급한다. 확인할 버전: 이 프로젝트의 `@tanstack/react-query` 버전과 문서의 v5 표기가 같은지 `package.json`에서 본다.

## 예측(10분)

1. 앱이 막 켜진 첫 렌더에서 `useNetInfo()`의 `isConnected`와 `isInternetReachable`은 어떤 값일까? 배너 조건을 `!isConnected`로 쓰면 시작 직후에 어떻게 보일까?

> 내 예측:

2. Wi-Fi가 연결되어 있지만 인터넷에는 닿지 않는 상황에서 `isConnected`와 `isInternetReachable`은 각각 무엇일까?

> 내 예측:

3. `onlineManager`를 NetInfo와 연결하지 않고 오프라인에서 새 쿼리를 실행하면 어떻게 될까? 연결하고 나면 달라질까?

> 내 예측:

## 만들기(40분)

1. 설치: `npx expo install @react-native-community/netinfo`. `package.json`에 11.4.1이 고정되었는지 확인한다.
2. `src/hooks/useIsOnline.ts`의 `useIsOnline()`을 만든다. `useNetInfo()`를 읽고, `isConnected === false`이거나 `isInternetReachable === false`일 때만 오프라인으로 본다. `null`(아직 모름)은 온라인으로 간주해 시작 직후 배너가 깜빡이지 않게 한다.
3. `src/components/OfflineBanner.tsx`의 `OfflineBanner`를 만든다. 오프라인일 때만 "오프라인이에요. 저장된 글만 보여요" 같은 문구를 보이고, 색은 Day 53의 `useTheme()` 토큰을 쓴다. 배너에는 접근성을 위해 `accessibilityRole="alert"`를 준다(Day 55의 `accessibilityRole` 값 중 `alert`가 문서에 있다).
4. 피드 탭(`app/(tabs)/index.tsx`)의 목록 위와 글 상세 화면(Day 16에서 만든 동적 라우트 파일) 위에 `OfflineBanner`를 둔다.
5. 피드의 로딩·에러 표시(Day 25~28)에서 오프라인일 때는 에러 문구를 "인터넷 연결을 확인해 주세요"로 바꾼다. 새로고침(`RefreshControl`)은 오프라인이면 `refetch`를 호출하지 않고 끝낸다.
6. `app/_layout.tsx` 모듈 최상단(Day 28의 `queryClient` 옆)에서 `onlineManager`와 NetInfo를 연결한다.

```tsx
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected)));
```

완료 기준

- [ ] `package.json`에서 `@react-native-community/netinfo`가 11.4.1임을 확인했다
- [ ] 오프라인일 때만 피드와 상세에 배너가 보이고, 온라인이 되면 사라진다
- [ ] 앱 시작 직후 배너가 한순간 보였다 사라지지 않는다
- [ ] 오프라인에서 새로고침을 당겨도 에러 없이 끝난다
- [ ] `onlineManager`가 NetInfo와 연결되어 있다
- [ ] 타입 오류와 `npm run lint` 경고가 없다

## 검증(10분)

확인할 동작

- Android 에뮬레이터는 빠른 설정에서 비행기 모드를 켜고 끄며 배너가 나타나고 사라지는지 본다. iOS 시뮬레이터는 README가 변경 알림 문제를 경고하므로 Mac의 Wi-Fi를 끈 뒤 결과를 기록하되, 배너가 안 바뀌어도 코드의 오류로 단정하지 말고 `NetInfo.fetch()` 값을 로그로 확인한다.
- 오프라인 상태에서 앱을 새로 켜 보고, 첫 화면에서 배너와 피드 에러 문구를 본다. 예측 1과 비교한다.
- 시뮬레이터에서 오프라인 재현이 불안정하면 `useIsOnline`이 항상 `false`를 돌려주도록 임시로 바꿔 화면 동작만 확인하고 되돌린다.

일부러 깨뜨려 보는 실험

- `useIsOnline`의 조건을 `!isConnected`로 바꿔 앱을 새로 켠다. 시작 직후 배너가 순간적으로 보이는지 본 뒤 원래 조건으로 되돌린다. 예측 1과 비교한다.

> 실험 결과:

## 이해 점검 질문

1. `isConnected`와 `isInternetReachable`은 각각 무엇을 뜻하고, 왜 둘 다 오프라인 판단에 필요할까?
2. `useIsOnline`에서 `null`을 온라인으로 간주하는 이유는 무엇일까?
3. TanStack Query가 React Native에서 오프라인을 알게 하려면 무엇이 필요하고, 왜 웹과 다를까?

<details>
<summary>정답</summary>

1. `isConnected`는 네트워크(Wi-Fi·셀룰러) 연결이 활성인지, `isInternetReachable`은 그 연결로 실제 인터넷에 닿는지를 뜻한다. 카페 Wi-Fi처럼 연결은 되어 있지만 인터넷이 막힌 경우 `isConnected`는 참이고 `isInternetReachable`은 거짓이다. 그래서 `isConnected`만 보면 서버 요청이 실패하는 상황을 오프라인으로 판단하지 못한다.
2. 앱이 막 켜졌을 때 NetInfo는 아직 상태를 알아내지 못해 `isConnected`와 `isInternetReachable`이 `null`(unknown)이다. 이를 오프라인으로 취급하면 온라인인 사용자에게도 시작 직후 배너가 잠깐 나타났다 사라진다. 그래서 "명확히 `false`일 때만" 오프라인으로 본다.
3. 웹은 브라우저의 `online`/`offline` 이벤트를 기본으로 쓰지만 RN에는 그 이벤트가 없어 `onlineManager`가 상태 변화를 알 수 없다. 그래서 `onlineManager.setEventListener`에 NetInfo의 `addEventListener`를 연결해 `isConnected`를 `setOnline`으로 넘겨야 한다. 연결 전에는 오프라인이어도 쿼리가 요청을 시도하고 에러로 끝날 수 있다. 연결 후의 쿼리 동작 변화는 직접 확인해 기록한다.

</details>

## 기록(5분)

배운 것 3줄:

1.
2.
3.

막힌 점:

## 커밋 단위 제안

- `chore: netinfo 설치`
- `feat: 오프라인 배너와 useIsOnline 훅 추가`
- `feat: TanStack Query onlineManager를 NetInfo에 연결`

## 웹과 다른 점

웹은 `navigator.onLine`과 `online`/`offline` 이벤트로 연결 상태를 알 수 있지만, RN에는 그것이 없어 네이티브 모듈인 NetInfo를 설치해 쓰고 시작 시점의 "알 수 없음" 상태도 직접 다뤄야 한다.
