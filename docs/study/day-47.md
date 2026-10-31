# Day 47 · 12/30 (수) — expo-notifications: 로컬 알림

## 오늘의 목표

설정 탭에 "매일 기록 알림" 스위치를 만들어 정해진 시각에 로컬 알림을 예약·취소하고, 앱이 열려 있을 때의 표시 방식을 제어한다.

## 읽기(15분)

> 확인할 버전: `docs.expo.dev/versions/latest/...` 링크는 최신 문서(SDK 58)를 보여 준다. SDK 54에 고정되는 패키지는 `expo-notifications ~0.32`, `expo-device ~8.0`이다. `setNotificationHandler`가 돌려주는 객체의 필드 이름(`shouldShowBanner`, `shouldShowList`)은 SDK 54 문서 기준이고, 예전 글에 나오는 `shouldShowAlert`는 deprecated다.

1. [Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
   - 상단 경고(warning)를 읽는다: 원격 푸시는 SDK 53부터 Android Expo Go에서 쓸 수 없고 development build가 필요하지만, **로컬 알림은 Expo Go에서도 가능**하다. 오늘은 로컬 알림만 다룬다.
   - "Present a local (in-app) notification to the user" 예제에서 `setNotificationHandler`의 반환 객체(`shouldPlaySound`, `shouldSetBadge`, `shouldShowBanner`, `shouldShowList`)와 `scheduleNotificationAsync({ content, trigger: null })`이 즉시 표시라는 점을 확인한다.
   - Usage 예제의 `schedulePushNotification`에서 `trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 }` 형태를 확인한다. `SchedulableTriggerInputTypes`에 `DAILY`(`hour`, `minute`), `WEEKLY`, `DATE`, `TIME_INTERVAL`이 있다는 점은 API 절에서 확인한다.
   - Permissions 절의 Android 설명: Android 13에서는 알림 채널이 하나 이상 만들어져야 권한 프롬프트가 뜬다는 문장을 찾는다.
   - iOS 권한 해석 절: 루트 `status`가 아니라 `ios.status`(`NOT_DETERMINED`, `DENIED`, `AUTHORIZED`, `PROVISIONAL`, `EPHEMERAL`)를 보라는 안내를 확인한다.
   - `getAllScheduledNotificationsAsync`, `cancelScheduledNotificationAsync`, `cancelAllScheduledNotificationsAsync`가 있는지 API 절에서 확인한다.
2. [Device](https://docs.expo.dev/versions/latest/sdk/device/)
   - `Device.isDevice`가 실기기인지 시뮬레이터·에뮬레이터인지 알려 주는 값이라는 설명을 확인한다. Day 48의 푸시 토큰에서 쓸 값이다.

## 예측(10분)

1. 앱이 화면에 열려 있는(포그라운드) 상태에서 `setNotificationHandler`를 설정하지 않고 5초 뒤 알림을 예약하면 배너가 보일까?

> 내 예측:

2. `DAILY` 트리거로 알림을 예약한 뒤 앱을 완전히 종료하면 예약은 유지될까? 앱을 다시 켰을 때 스위치 상태를 어떻게 복원할 수 있을까?

> 내 예측:

3. 알림 권한을 거부한 상태에서 `scheduleNotificationAsync`를 호출하면 에러가 날까, 조용히 아무 일도 없을까?

> 내 예측:

## 만들기(40분)

설치:

```bash
npx expo install expo-notifications expo-device
```

새로 만들/고칠 파일:

- `app/_layout.tsx`(루트 레이아웃): 컴포넌트 밖 최상위에서 `Notifications.setNotificationHandler`를 한 번 호출해 포그라운드에서도 배너와 목록에 표시되게 한다(`shouldShowBanner`, `shouldShowList`는 `true`, 소리·배지는 `false`).
- `src/lib/notifications.ts` (새 파일): 함수 4개를 만든다.
  - `ensureNotificationPermission()`: Android이면 먼저 `setNotificationChannelAsync('default', ...)`로 채널을 만들고, `getPermissionsAsync()`로 확인한 뒤 없으면 `requestPermissionsAsync()`로 요청해 허용 여부(`boolean`)를 돌려준다.
  - `enableDailyReminder(hour, minute)`: 권한을 확인하고 `scheduleNotificationAsync`를 `DAILY` 트리거로 호출한다. 내용(`title`, `body`)은 한국어 문구, `data`에는 `{ url: '/(tabs)/write' }`를 넣는다(Day 48에서 탭 처리에 쓴다).
  - `disableDailyReminder()`: 예약된 알림을 취소한다.
  - `isDailyReminderScheduled()`: `getAllScheduledNotificationsAsync()` 결과에 알림이 있는지 돌려준다.
- `app/(tabs)/settings/index.tsx`: 다음을 추가한다.
  - "매일 기록 알림" 행: RN `Switch`와 시각 선택(20시, 21시, 22시 같은 고정 선택지 3개를 `Pressable`로). 스위치를 켜면 `enableDailyReminder`, 끄면 `disableDailyReminder`를 부른다.
  - 앱을 켰을 때 `isDailyReminderScheduled()`로 스위치 초기값을 복원한다(예측 2).
  - "5초 뒤 테스트 알림" 버튼: `TIME_INTERVAL` 트리거로 `seconds: 5`.
  - 권한이 거부되어 있고 다시 물을 수 없으면 Day 40처럼 `Alert`와 `Linking.openSettings()`로 안내한다.
  - `Device.isDevice` 값을 "실행 환경: 실기기/시뮬레이터" 한 줄로 표시한다.

핵심 호출 형태:

```ts
await Notifications.scheduleNotificationAsync({
  content: { title: '오늘 기록 남겼나요?', body: '1분이면 충분해요.', data: { url: '/(tabs)/write' } },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
});
```

완료 기준:

- [ ] `npx expo install expo-notifications expo-device`로 설치했다.
- [ ] `setNotificationHandler`를 컴포넌트 안이 아니라 `app/_layout.tsx` 최상위에서 한 번만 호출한다.
- [ ] 스위치를 켜면 권한을 확인·요청하고 `DAILY` 알림이 예약된다. 끄면 예약이 사라진다.
- [ ] 앱을 완전히 종료했다 켜도 스위치 상태가 예약 상태와 일치한다.
- [ ] "5초 뒤 테스트 알림"이 앱이 열려 있을 때와 홈 화면으로 나갔을 때 모두 표시된다.
- [ ] 권한 거부 시 앱이 죽지 않고 안내가 나온다.

## 검증(10분)

- 테스트 알림을 눌러 5초 안에 홈 화면으로 나가서 배너가 뜨는지 확인한다. 다시 앱을 연 상태로도 해 본다. 예측 1과 비교한다.
- `DAILY` 시각을 지금보다 1~2분 뒤로 잡아 실제로 도착하는지 확인한다(확인 후 원래 선택지로 되돌린다).
- `getAllScheduledNotificationsAsync()` 결과를 `console.log`로 찍어 예약 객체의 모양(`identifier`, `content`, `trigger`)을 적는다.
- 일부러 깨뜨리기: `setNotificationHandler` 호출을 주석 처리하고 앱을 연 채로 테스트 알림을 눌러 본다. 배너가 나오는지 확인하고 예측 1과 비교한 뒤 되돌린다.
- Android에서 가능하면 채널 생성 호출을 빼고 첫 권한 프롬프트가 뜨는지 확인한다(Android 13 이상 기기·에뮬레이터에서만 의미가 있다).

## 이해 점검 질문

1. `setNotificationHandler`는 무엇을 결정하고, 왜 컴포넌트 안이 아니라 최상위에서 한 번 호출하는가?
2. 푸시(원격) 알림과 로컬 알림의 차이는 무엇이며, SDK 54의 Expo Go에서는 각각 어떤 제한이 있는가?
3. Android 13 이상에서 알림 채널을 만들기 전에 권한을 요청하면 어떻게 되는가? 이를 고려해 `ensureNotificationPermission`은 어떤 순서로 호출해야 하는가?

<details>
<summary>정답</summary>

1. 앱이 포그라운드일 때 도착한 알림을 어떻게 보여 줄지(배너, 목록, 소리, 배지)를 정한다. 핸들러가 없으면 포그라운드에서는 사용자에게 보이지 않을 수 있다. 화면이 다시 그려질 때마다 호출하면 불필요하고 시점이 어긋날 수 있으므로, 알림이 올 수 있는 모든 순간에 적용되도록 앱 시작 시 한 번 등록한다.
2. 로컬 알림은 앱이 기기 안에서 스스로 예약하고 표시하는 알림이고, 원격 푸시는 서버가 푸시 서비스(FCM·APNs·Expo Push)를 거쳐 보내는 알림이다. SDK 53부터 Android의 Expo Go에서는 원격 푸시를 쓸 수 없어 development build가 필요하지만, 로컬 알림은 Expo Go에서도 쓸 수 있다.
3. 문서에 따르면 Android 13에서는 알림 채널이 하나 이상 만들어진 뒤에야 권한 프롬프트가 뜬다. 따라서 `setNotificationChannelAsync` -> `getPermissionsAsync` -> (필요하면) `requestPermissionsAsync` 순서로 호출해야 한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 설정 탭에 매일 기록 알림 예약 스위치 추가`
- `feat: 포그라운드 알림 표시 핸들러와 테스트 알림 추가`
- `chore: expo-notifications, expo-device 설치`

## 웹과 다른 점

웹 알림은 사이트별 브라우저 권한을 따르지만, 네이티브 로컬 알림은 앱이 꺼져 있어도 OS가 예약된 시각에 띄운다. 알림 권한은 iOS·Android(13 이상)에서 OS가 별도로 묻는다.
