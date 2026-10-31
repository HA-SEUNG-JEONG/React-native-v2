# Day 45 · 12/28 (월) — expo-location: 현재 위치와 권한 상태

> 전제: 기록 탭 글쓰기 화면은 `app/(tabs)/write.tsx`(Day 17), 기록 항목 타입은 `src/types/log.ts`의 `LogEntry`(Day 10, Day 12에서 `src/`로 이동), 기록 상태는 Day 22의 `useLogs()`/`useLogsDispatch()`다.

## 오늘의 목표

기록 작성 폼에 "현재 위치 붙이기"를 넣어 좌표와 지역 이름을 기록에 저장하고, 설정 탭에 위치 권한의 현재 상태를 보여 준다.

## 읽기(15분)

> 확인할 버전: `docs.expo.dev/versions/latest/...` 링크는 최신 문서(SDK 58)를 보여 준다. SDK 54에 고정되는 패키지는 `expo-location ~19.0`이다. 함수 이름과 반환 타입은 설치된 패키지의 타입 정의로 한 번 더 확인한다.

1. [Location](https://docs.expo.dev/versions/latest/sdk/location/)
   - Usage 예제에서 순서를 확인한다: `requestForegroundPermissionsAsync()` -> `status !== 'granted'` 분기 -> `getCurrentPositionAsync({})`.
   - API 절에서 `getCurrentPositionAsync`가 현재 위치를 얻는 데 몇 초 걸릴 수 있어서 빠른 응답이 필요하면 `getLastKnownPositionAsync`를 고려하라는 설명, 그리고 `getLastKnownPositionAsync`가 `null`을 돌려줄 수 있다는 점을 찾는다.
   - `LocationObject`가 `coords`(`latitude`, `longitude` 등)와 `timestamp`를 가진다는 점, `Location.Accuracy`의 단계(`Lowest`부터 `BestForNavigation`)를 확인한다.
   - `LocationPermissionResponse`가 `PermissionResponse`에 더해 iOS는 `ios.scope`(`'whenInUse' | 'always' | 'none'`), Android는 `android.accuracy`(`'fine' | 'coarse' | 'none'`)를 가진다는 점을 찾는다.
   - "Background permissions" 안내의 Collapsible에서 `Allow Once`를 고르면 그 앱 세션에서만 유효하고, iOS는 `Allow Once`와 `Allow While Using the App`을 구분해 알려 주지 않는다는 문장을 읽는다.
   - "Enable emulator location" 절에서 Android 에뮬레이터와 iOS 시뮬레이터에서 위치를 켜는 방법을 확인한다.
   - `reverseGeocodeAsync`가 `{ latitude, longitude }`를 받아 `city`, `district`, `region` 등을 가진 주소 배열을 돌려주며, 한꺼번에 너무 많이 호출하면 에러가 날 수 있다는 주의를 확인한다.
2. [AppState (React Native)](https://reactnative.dev/docs/appstate)
   - 앱이 `active`로 돌아올 때 이벤트를 받는 방법을 확인한다. 사용자가 설정 앱에서 권한을 바꾸고 돌아왔을 때 설정 탭 표시를 갱신하는 데 쓴다.

## 예측(10분)

1. `requestForegroundPermissionsAsync()`로 "앱을 사용하는 동안 허용"을 고른 직후 반환값의 `status`, `granted`, `canAskAgain`, `ios.scope`는 각각 무엇일 것 같은가?

> 내 예측:

2. iOS 시뮬레이터의 Features > Location을 None으로 두고 `getCurrentPositionAsync()`를 호출하면 어떻게 될까? (바로 에러? 오래 기다림? 이전 위치?)

> 내 예측:

3. 설정 앱에서 위치 권한을 끄고 앱으로 돌아왔을 때, 설정 탭의 권한 표시는 저절로 바뀔까?

> 내 예측:

## 만들기(40분)

설치:

```bash
npx expo install expo-location
```

새로 만들/고칠 파일:

- `app.json`의 `plugins`에 `expo-location`을 추가하고 `locationWhenInUsePermission`에 한국어 사용 목적 문구를 쓴다. 배경 위치는 쓰지 않는다(`isIosBackgroundLocationEnabled`, `isAndroidBackgroundLocationEnabled`는 기본값 `false` 그대로 둔다). 이 문구는 새 앱 바이너리를 만들어야 반영된다.
- `src/hooks/useAttachLocation.ts` (새 파일): 아래 순서로 동작하는 커스텀 훅.
  1. `Location.hasServicesEnabledAsync()`로 기기 위치 서비스가 켜져 있는지 확인한다.
  2. 권한을 `getForegroundPermissionsAsync()`로 확인하고 없으면 `requestForegroundPermissionsAsync()`로 요청한다.
  3. `getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`로 좌표를 얻는다.
  4. `reverseGeocodeAsync(coords)`로 지역 이름을 만든다(예: `city`와 `district`를 이어 붙이고, 둘 다 `null`이면 좌표만 쓴다).
  5. `status`(`idle`/`loading`/`error`)와 에러 메시지를 상태로 돌려준다.
- `app/(tabs)/write.tsx`: 폼에 "현재 위치 붙이기" 버튼과 붙은 위치 텍스트, "위치 제거" 버튼을 추가한다. 로딩 중에는 버튼을 막고 `ActivityIndicator`를 보여 준다.
- Day 10의 `src/types/log.ts`의 `LogEntry`에 `place?: { latitude: number; longitude: number; label: string }`을 추가한다. Day 42의 `saveLogs`(AsyncStorage)에도 함께 들어가 앱을 재시작해도 남는지 확인한다.
- `app/(tabs)/settings/index.tsx`: "위치 권한" 행을 추가한다. `Location.useForegroundPermissions()` 훅이 돌려주는 첫 값(권한 응답 객체, 아직 조회 전이면 `null`)의 `status`, `canAskAgain`, `ios?.scope` 또는 `android?.accuracy`를 글자로 보여 준다. 거부 상태에서 `canAskAgain`이 `false`이면 "설정 열기"(`Linking.openSettings()`) 버튼을 보여 준다. 훅이 돌려주는 세 번째 값(`get`)을 `AppState`가 `active`가 될 때 호출해 표시를 갱신한다(Day 13의 cleanup 패턴으로 구독을 해제한다).

핵심 호출 형태:

```ts
import * as Location from 'expo-location';

const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
const [addr] = await Location.reverseGeocodeAsync(pos.coords);
const label = [addr?.city, addr?.district].filter(Boolean).join(' ');
```

완료 기준:

- [ ] `npx expo install expo-location`으로 설치했고 `app.json`에 플러그인과 한국어 문구를 넣었다.
- [ ] 버튼을 누르면 권한 요청 -> 좌표 -> 지역 이름 순서로 진행되고 폼에 위치가 표시된다.
- [ ] 권한 거부, 위치 서비스 꺼짐, 좌표 조회 실패를 각각 다른 메시지로 보여 준다.
- [ ] 저장하면 `LogEntry.place`가 기록에 남고 앱을 재시작해도 유지된다.
- [ ] 설정 탭이 권한 상태(`status`, `canAskAgain`, `ios.scope` 또는 `android.accuracy`)를 보여 주고, 설정 앱에서 돌아오면 갱신된다.
- [ ] 배경 위치(`startLocationUpdatesAsync` 등)는 쓰지 않았다.

## 검증(10분)

- iOS 시뮬레이터에서 Features > Location에서 Custom Location 또는 City Run을 고르고 버튼을 눌러 좌표가 바뀌는지 본다. Android 에뮬레이터는 Settings > Location에서 Use location을 켠다.
- 권한 팝업에서 "앱을 사용하는 동안 허용"과 "허용 안 함"을 각각 눌러 설정 탭 표시가 어떻게 다른지 적고 예측 1과 비교한다.
- 설정 앱에서 권한을 바꾸고 돌아와 예측 3과 비교한다.
- 일부러 깨뜨리기: Features > Location을 None으로 바꾸고 버튼을 누른다. 예측 2와 비교해 어떤 일이 일어나는지 적고, 로딩 상태가 영원히 남지 않도록 `try/catch/finally`를 확인한다.

## 이해 점검 질문

1. `status === 'granted'`만 보지 않고 iOS의 `ios.scope`나 Android의 `android.accuracy`까지 보여 주는 이유는 무엇인가?
2. `getCurrentPositionAsync`와 `getLastKnownPositionAsync`는 어떤 상황에서 각각 쓰는가?
3. 설정 앱에서 권한을 바꾸고 돌아와도 화면이 그대로인 이유는 무엇이고, 어떻게 고치는가?

<details>
<summary>정답</summary>

1. `granted`여도 접근 범위가 다를 수 있다. iOS는 `whenInUse`와 `always`가 있고(`Allow Once`도 `whenInUse`로 보이며 구분되지 않는다), Android는 정밀(`fine`)과 대략(`coarse`) 위치를 구분한다. 앱이 정밀 좌표를 전제로 동작한다면 `coarse`일 때 안내가 필요하다.
2. `getCurrentPositionAsync`는 새로 위치를 측정하므로 정확하지만 몇 초 걸릴 수 있다. `getLastKnownPositionAsync`는 저장된 마지막 위치를 바로 돌려줘 빠르지만 오래됐거나 `null`일 수 있다. 기록에 지금 위치를 붙일 때는 앞의 것, 빠른 초기 표시용으로는 뒤의 것이 맞다.
3. 권한 상태는 한 번 읽어 둔 값이 `state`에 들어 있을 뿐이고, 설정 앱에서 바뀐 것을 React가 알 방법이 없다. 앱이 `active`로 돌아오는 순간(`AppState`)에 권한을 다시 조회(`get`)해 상태를 갱신하면 된다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 기록에 현재 위치와 지역 이름 붙이기`
- `feat: 설정 탭에 위치 권한 상태 표시`
- `chore: expo-location 플러그인 사용 목적 문구 설정`

## 웹과 다른 점

웹 `navigator.geolocation`은 사이트별 브라우저 권한 하나지만, 네이티브는 OS 권한에 범위(`whenInUse`, `always`)와 정밀도(`fine`, `coarse`)가 있다. 또 `expo-location`의 지오코딩은 웹에서 제거되어 경고만 남기고 빈 배열을 돌려준다.
