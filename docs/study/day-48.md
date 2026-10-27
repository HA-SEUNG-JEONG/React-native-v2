# Day 48 · 12/31 (목) — 푸시 토큰과 알림 탭 처리

> 건너뛰기 가능: 푸시 토큰은 실기기와 development build, 플랫폼 자격 증명(iOS는 유료 Apple Developer 계정, Android는 FCM 설정)이 있어야 끝까지 확인할 수 있다. 3일 이상 밀렸으면 "읽기"만 한다. 이 카드의 A부(알림 탭 처리)는 시뮬레이터에서 되므로 시간이 있으면 A부만 해도 의미가 있다.

## 오늘의 목표

알림을 탭하면 알림에 담긴 경로로 앱이 이동하게 만들고(A부), 푸시 토큰 발급 코드를 환경 가드와 함께 작성한다(B부).

## 읽기(15분)

> 확인할 버전: `docs.expo.dev/...` 링크는 지금 열면 최신 문서(SDK 58 기준)로 넘어간다. SDK 54에 고정되는 패키지는 `expo-notifications ~0.32`다. 푸시 관련 사실은 SDK 54 문서 원문에서 확인했지만, 최신 문서와 경고 문구가 다를 수 있다.

1. [Notifications — Handle push notifications with navigation](https://docs.expo.dev/versions/v54.0.0/sdk/notifications/)
   - Expo Router 탭의 예제에서 `Notifications.getLastNotificationResponse()`(앱이 알림 탭으로 막 시작됐을 때의 응답)와 `Notifications.addNotificationResponseReceivedListener`(실행 중 탭)를 한 `useEffect` 안에서 함께 쓰는 형태를 확인한다. 반환된 구독의 `remove()`를 cleanup에서 호출하는 줄도 확인한다.
   - 예제 주석 두 개를 찾는다: "Push the URL. You may want to verify the format before navigating"과 "Ensure this layout never returns null or the navigation will go unhandled".
   - 상단 경고에서 Android Expo Go의 원격 푸시 제한을 다시 읽는다.
2. [푸시 알림 설정 가이드](https://docs.expo.dev/push-notifications/push-notifications-setup/)
   - Prerequisites 경고: Android 에뮬레이터와 iOS 시뮬레이터에서는 푸시가 지원되지 않고 실기기가 필요하다.
   - 클라이언트가 준비해야 할 두 가지가 "사용자의 푸시 권한"과 "앱의 `ExpoPushToken`"이라는 점, 토큰을 받는 코드에서 `projectId`를 `Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId`로 읽는 부분을 확인한다.
   - "Get credentials for development builds"에서 iOS는 유료 Apple Developer 계정이 필요하고 Android는 FCM 자격 증명 설정이 필요하다는 문장을 찾는다.
   - "Test using the push notifications tool" 절에서 Expo의 푸시 알림 테스트 도구로 토큰을 입력해 시험 알림을 보내는 절차를 읽는다.
3. [알림 종류와 동작(What you need to know)](https://docs.expo.dev/push-notifications/what-you-need-to-know/)
   - "Remote and Local notifications" 절에서 푸시(원격)와 로컬 알림의 정의, 그리고 푸시는 Expo Go에 내장되어 있지 않아 development build가 필요하다는 문장을 확인한다.
   - 앱 상태 세 가지(Foreground, Background, Terminated)의 정의와, 알림과 상호작용(탭)했을 때 상태별로 어떤 리스너가 불리는지 보여 주는 표를 읽는다. iOS는 세 상태 모두 `NotificationResponseReceivedListener`이고, Android는 Terminated에서 JS task라는 점을 적는다.
   - 앱이 종료된 상태에서 알림 탭으로 시작될 때 iOS에서는 리스너를 모듈 최상위처럼 일찍 등록해야 한다는 info 문장을 찾는다.

## 예측(10분)

1. 앱이 완전히 종료된 상태에서 로컬 알림을 탭해 앱을 켰다. 처음 렌더링된 뒤 어떤 함수로 "방금 탭한 알림"을 알 수 있을까? 앱이 이미 실행 중일 때 탭하는 경우와 API가 같을까, 다를까?

> 내 예측:

2. 시뮬레이터에서 `getExpoPushTokenAsync`를 그대로 호출하면 어떻게 될까? 호출 전에 어떤 값으로 막아야 할까?

> 내 예측:

3. 알림의 `data.url`에 앱에 없는 경로가 담겨 있으면 `router.push(url)`은 어떤 화면으로 가게 될까?

> 내 예측:

## 만들기(40분)

### A부. 알림 탭 처리 (시뮬레이터 가능, 25분)

- `src/hooks/useNotificationObserver.ts` (새 파일): 읽기 1의 예제 형태를 따르는 훅.
  - `useEffect` 안에서 `getLastNotificationResponse()`로 시작 시 응답을 처리하고, `addNotificationResponseReceivedListener`로 실행 중 응답을 처리한다.
  - `data.url`이 문자열이고 `/`로 시작할 때만 `router.push(url)`을 호출한다(경로 형식 검증). 검증을 통과하지 못하면 아무것도 하지 않는다.
  - cleanup에서 구독을 `remove()`한다(Day 13).
- `app/_layout.tsx`: 루트 레이아웃 컴포넌트에서 이 훅을 호출한다. Day 23의 로그인 보호 로직이 로딩 중에 `null`을 반환하고 있다면, 알림 처리가 놓치지 않도록 훅 호출 위치와 반환 구조를 점검한다.
- Day 47의 `enableDailyReminder`와 테스트 알림에 넣어 둔 `data: { url: '/(tabs)/write' }`로 탭 이동을 시험한다.

### B부. 푸시 토큰 (코드 작성 15분, 실행은 실기기 + dev build에서만)

설치: `expo-notifications`와 `expo-device`는 Day 47에서 설치했다. `expo-constants`는 템플릿에 이미 들어 있는지 `package.json`으로 확인하고, 없을 때만 `npx expo install expo-constants`를 실행한다.

- `src/lib/notifications.ts`(Day 47)에 `registerForPushToken()`을 추가한다. 순서는 다음과 같다.
  1. `Device.isDevice`가 `false`이면 `{ ok: false, reason: '실기기에서만 발급됩니다' }`를 돌려준다.
  2. Day 47의 `ensureNotificationPermission()`으로 권한을 확인한다. 거부되면 `{ ok: false, reason: '알림 권한이 필요합니다' }`.
  3. `projectId`를 읽고 없으면 `{ ok: false, reason: 'EAS projectId가 없습니다' }`.
  4. `Notifications.getExpoPushTokenAsync({ projectId })`의 `data`를 `{ ok: true, token }`으로 돌려준다.
- `app/(tabs)/settings/index.tsx`: "푸시 토큰 받기" 버튼과 결과 영역을 추가한다. 성공하면 토큰을 `selectable` 텍스트로, 실패하면 `reason`을 보여 준다.
- 토큰은 화면 표시와 개발 중 복사 용도로만 쓴다. 저장소, 로그 공유, 스크린샷 공유에 올리지 않는다.

핵심 호출 형태:

```ts
const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
if (!projectId) return { ok: false, reason: 'EAS projectId가 없습니다' };
const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
```

완료 기준:

- [ ] 앱이 실행 중일 때 알림을 탭하면 `data.url`의 화면으로 이동한다.
- [ ] 앱을 완전히 종료한 상태에서 알림을 탭해 시작해도 같은 화면으로 이동한다.
- [ ] `data.url`이 문자열이 아니거나 `/`로 시작하지 않으면 이동하지 않는다.
- [ ] 구독을 cleanup에서 해제한다.
- [ ] 시뮬레이터에서 "푸시 토큰 받기"를 누르면 앱이 죽지 않고 "실기기에서만 발급됩니다"가 보인다.
- [ ] (환경이 있을 때만) dev build를 설치한 실기기에서 토큰이 표시된다.

## 검증(10분)

- A부: Day 47의 5초 테스트 알림을 눌러 앱을 완전히 종료(앱 전환기에서 위로 밀어 종료)하고 알림이 뜨면 탭한다. 예측 1과 비교한다. 같은 흐름을 앱이 켜진 상태에서도 해 본다.
- B부: 시뮬레이터에서 버튼을 눌러 예측 2와 비교한다. 실기기·dev build가 준비되어 있다면 토큰을 얻고, 푸시 가이드의 테스트 도구로 시험 알림을 보내 탭 이동까지 확인한다. 환경이 없으면 "실기기 확인 못 함"이라고 기록 칸에 적는다.
- 일부러 깨뜨리기: 테스트 알림의 `data.url`을 앱에 없는 경로(예: `/없는경로`)로 바꿔 탭한다. 예측 3과 비교해 Day 20에서 만든 not-found 화면이 뜨는지 보고, 검증 로직을 어떻게 더 엄격하게 할지 한 줄로 적은 뒤 되돌린다.

## 이해 점검 질문

1. 알림 탭을 처리할 때 `getLastNotificationResponse()`와 `addNotificationResponseReceivedListener`를 둘 다 써야 하는 이유는 무엇인가?
2. 푸시 토큰이 시뮬레이터나 Android Expo Go에서 발급되지 않는 이유는 각각 무엇이고, 어떤 환경이 필요한가?
3. 알림 `data.url`을 검증 없이 `router.push`에 넘기면 안 되는 이유는 무엇인가?

<details>
<summary>정답</summary>

1. 실행 중에 탭하면 리스너가 이벤트를 받지만, 앱이 종료된 상태에서 탭해 시작되면 리스너를 등록하기 전에 이미 응답이 발생한 뒤다. `getLastNotificationResponse()`가 그 "시작 시점의 마지막 응답"을 조회하고, 리스너는 이후의 탭을 처리한다. 둘이 서로의 빈틈을 메운다.
2. 시뮬레이터와 에뮬레이터는 푸시 서비스에 등록할 수 있는 실기기가 아니라서 지원되지 않는다(가이드의 경고). Android Expo Go는 SDK 53부터 원격 푸시가 제거되어 development build가 필요하다. 따라서 실기기 + development build + 플랫폼 자격 증명(iOS는 유료 Apple Developer 계정, Android는 FCM)이 필요하다.
3. 알림의 `data`는 보낸 쪽이 임의로 채울 수 있는 값이다. 앱에 없는 경로, 인증이 필요한 화면, 외부 주소가 담겨도 그대로 이동하면 예기치 않은 화면이 열린다. 문서 예제도 이동 전에 형식을 검증하라고 안내한다. 최소한 문자열인지, 허용된 경로 형태인지 확인한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

실기기 + dev build로 토큰까지 확인했는가(예 / 아니오 / 환경 없음):

## 커밋 단위 제안

- `feat: 알림 탭 시 data.url 경로로 이동하는 훅 추가`
- `feat: 설정 탭에 푸시 토큰 발급 버튼과 환경 가드 추가`
- `fix: 알림 응답 구독 cleanup 누락 수정`

## 웹과 다른 점

웹 푸시는 서비스 워커와 구독 객체를 쓰지만, 앱의 푸시는 플랫폼 푸시 서비스(FCM·APNs)에 등록한 토큰을 서버가 알고 있어야 하고, 실기기와 네이티브 자격 증명이 있어야 시험할 수 있다.
