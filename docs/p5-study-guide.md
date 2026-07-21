# P5 학습 가이드 — 네이티브 기능 · 권한 플로우

> 대상 PR: [#6 expo-image-picker](https://github.com/HA-SEUNG-JEONG/React-native-v2/pull/6)
> 출처: [expo-image-picker](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/) · [expo-image](https://docs.expo.dev/versions/v54.0.0/sdk/image/) · [RN Linking](https://reactnative.dev/docs/linking)
> 검증: rn-sandbox-app `src/screens/PhotoScreen.tsx`, iOS 26.5 시뮬레이터 실측 (RN 0.81 / Expo SDK 54)

P5는 카메라·위치·저장·알림을 다루지만, 네 기능이 공유하는 뼈대는 하나다: **권한(permission) 플로우**. 기능 API 자체는 문서 보면 30분이면 쓴다. 진짜 어려운 건 **유저가 거부했을 때 앱이 어떻게 행동하느냐**다.

W11(카메라/이미지)에서 이 뼈대를 세우고, W12~W14는 같은 뼈대에 다른 권한을 끼우는 작업이다.

---

## W11 — 갤러리 사진 선택 (`PhotoScreen`)

> **먼저 알아야 할 것 — 이 화면의 권한 코드는 "필수"가 아니다.**
> 공식문서는 `launchImageLibraryAsync`에 대해 이렇게 못박는다:
> *"No permissions request is necessary for launching the image library."*
>
> 갤러리 선택은 OS가 제공하는 별도 프로세스의 피커를 띄우는 것이라, 앱이 라이브러리를 직접 읽지 않는다. 그래서 권한이 필요 없다. 이 화면의 권한 게이트는 **P5 뼈대를 연습하려고 일부러 얹은 것**이다.
>
> 권한이 **진짜 필요한** 지점은 따로 있다:
> - `launchCameraAsync` — 카메라 권한 필수 (`Permissions.CAMERA`)
> - 비디오 + `videoExportPreset: 'Passthrough'` + `allowsEditing: false` — 선택 후 iOS가 다이얼로그를 띄우므로, 문서는 **피커를 열기 전에 미리 요청**하라고 권한다
>
> 문서: [`launchImageLibraryAsync`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#imagepickerlaunchimagelibraryasync) · [`launchCameraAsync`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#imagepickerlaunchcameraasync)
>
> 즉 아래 플로우 자체는 옳고 W12(위치)·카메라에서 그대로 쓰이지만, **갤러리 선택만 놓고 보면 없어도 동작한다.** 이걸 모르고 "다이얼로그가 안 뜨네, 내 코드 버그인가?"로 헤매기 쉽다.

### 왜 권한이 웹과 다른가

> 문서: [Expo Permissions 가이드](https://docs.expo.dev/guides/permissions/) · [Android — 런타임 권한 요청](https://developer.android.com/training/permissions/requesting) · [`PermissionStatus`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#permissionstatus) · [MDN `getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) (웹 쪽 비교 대상)

웹의 `getUserMedia()`는 거부되면 Promise가 reject되고, 대개 그 기능만 빠진 채 페이지는 계속 돈다. 유저가 마음을 바꾸면 주소창 자물쇠를 눌러 바로 되돌릴 수 있다.

모바일은 다르다. **OS가 재요청 자체를 막는다.**

| 상태 | iOS | Android |
|---|---|---|
| 미결정 | 다이얼로그 뜸 | 다이얼로그 뜸 |
| 거부 1회 | **다시는 다이얼로그 안 뜸** | 다시 요청 가능 |
| 거부 2회 | — | **영구 거부** (`USER_FIXED`) |

Expo 문서가 양 플랫폼을 묶어 못박는다:

> *"An operating-system level restriction on both Android and iOS prohibits an app from asking for the same permission more than once."*

**도달 조건은 다르다.** Android 문서 원문:

> *"if the user taps Deny for a specific permission more than once during your app's lifetime of installation on a device, the user will no longer see the system permissions dialog if your app requests that permission again. The user's action implies "don't ask again," and is considered a permanent denial."*

즉 Android는 **거부 2회째에 자동으로** 영구 거부가 된다. 옛 Android UI에 있던 "다시 묻지 않기" 체크박스를 유저가 누르는 게 아니다 — 인터넷 예제/블로그에 그 설명이 아직 많이 남아 있으니 주의. 시뮬레이터/에뮬레이터로 테스트할 땐 **Android는 두 번 거부해야** 이 상태가 재현된다.

어느 쪽이든 코드에서 보는 값은 같다 — `canAskAgain === false`.

즉 앱이 "권한 주세요"를 다시 띄울 수 없는 막다른 상태가 존재한다. 이때 앱이 아무 말 없이 실패하면 유저는 **왜 버튼이 안 먹는지 영원히 모른다**. 앱을 지우고 다시 깔거나, 그냥 떠난다.

그래서 **거부 UX가 P5의 졸업 기준**이다. 기능이 되는 건 절반이고, 안 될 때 유저가 빠져나갈 길을 보여주는 게 나머지 절반.

### 4단계 플로우

> 문서: [`useMediaLibraryPermissions`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#usemedialibrarypermissions) · [`MediaLibraryPermissionResponse`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#medialibrarypermissionresponse) (`canAskAgain` 필드)

```
1. 권한 상태 확인   status?.granted
2. 요청             await requestPermission()   → OS 다이얼로그
3. 거부 처리        canAskAgain 따라 두 갈래
4. 기능 실행        launchImageLibraryAsync()
```

3번이 두 갈래로 쪼개지는 게 핵심이다.

- `canAskAgain === true` → 아직 다시 물어볼 수 있음. 조용히 물러나고 다음에 재시도.
- `canAskAgain === false` → **영구 차단**. 앱은 손쓸 수 없음. 설정 앱으로 안내하는 것 외엔 방법이 없다.

### 구현

```tsx
export function PhotoScreen(
  _: NativeStackScreenProps<HomeStackParamList, "Photo">,
) {
  const [status, requestPermission] = useMediaLibraryPermissions();
  const [uri, setUri] = useState<string | null>(null);

  // 영구 거부 = 요청해봐야 다이얼로그가 안 뜸
  const blocked = status?.granted === false && !status.canAskAgain;

  const pick = async () => {
    if (!status?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;   // 안내는 화면 배너가 담당
    }

    const result = await launchImageLibraryAsync({ mediaTypes: "images" });
    if (result.canceled) return;
    setUri(result.assets[0].uri);
  };
  // ...
}
```

### 함정 1 — `status`는 stale하다

> 문서: [React — state는 스냅샷](https://react.dev/learn/state-as-a-snapshot) (RN 아닌 React 공통 개념)

```tsx
await requestPermission();
if (status.granted) { ... }   // ✗ 아직 옛날 값
```

`status`는 **이번 렌더에 고정된 값**이다. `requestPermission()`이 권한을 받아와도 state 갱신은 다음 렌더에 반영되므로, 같은 함수 안에서 `status`를 다시 읽으면 여전히 거부 상태로 보인다.

웹 React에서 `setCount(1)` 직후 `count`를 읽으면 옛날 값인 것과 **완전히 같은 문제**다. 해법도 같다 — 반환값을 써라.

```tsx
const res = await requestPermission();
if (!res.granted) return;      // ✓ 방금 받은 결과
```

### 훅 반환값은 3개

> 문서: [`useMediaLibraryPermissions`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#usemedialibrarypermissions) · [`useFocusEffect`](https://reactnavigation.org/docs/use-focus-effect/) (설정 앱 복귀 시 재조회 조합용)

```tsx
const [status, requestPermission, getPermission] = useMediaLibraryPermissions();
```

문서상 반환 타입은 `[null | MediaLibraryPermissionResponse, RequestPermissionMethod, GetPermissionMethod]`. 세 번째 `getPermission`은 **요청 없이 현재 상태만 다시 조회**한다. 설정 앱에 갔다 돌아왔을 때 권한이 바뀌었는지 확인하는 데 쓸 수 있다 (`useFocusEffect`와 조합). 이 화면은 안 쓰므로 2개만 구조분해했다.

### `granted`만으로 부족하다 — `accessPrivileges`

> 문서: [`MediaLibraryPermissionResponse`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#medialibrarypermissionresponse) · [`expo-media-library`](https://docs.expo.dev/versions/v54.0.0/sdk/media-library/) (앨범 직접 읽을 때)

iOS 14+ / Android API 34+ 는 "전체 허용"과 "선택한 사진만 허용"을 구분한다. `MediaLibraryPermissionResponse`에는 이를 나타내는 필드가 따로 있다.

| 값 | 의미 |
|---|---|
| `'all'` | 라이브러리 전체 접근 |
| `'limited'` | **유저가 고른 일부 사진만** 접근 |
| `'none'` | 접근 불가 |

`granted === true`인데 `accessPrivileges === 'limited'`인 상태가 존재한다. 즉 "권한 있음"으로만 판단하면 유저가 왜 자기 사진 일부를 못 찾는지 설명할 수 없다. 갤러리 피커를 쓰는 지금 화면에선 OS 피커가 알아서 처리하지만, `expo-media-library`로 직접 앨범을 읽는 기능이라면 이 분기를 반드시 다뤄야 한다.

### 함정 2 — `status`는 처음에 `null`

훅이 마운트되고 권한을 조회하기 전까지 `status`는 `null`이다. `status.granted`로 바로 접근하면 크래시. `status?.granted` optional chaining이 필수다.

`!status?.granted`가 "권한 없음"과 "아직 모름"을 둘 다 잡아주는데, 둘 다 요청을 보내면 되므로 이 케이스에선 합쳐도 안전하다.

### 함정 3 — 거부 안내를 어디에 두느냐

> 문서: [RN `Linking.openSettings()`](https://reactnative.dev/docs/linking#opensettings) · [RN `Alert`](https://reactnative.dev/docs/alert) (왜 안 쓰는지 비교)

처음 짰을 때 이렇게 했다:

```tsx
if (!res.granted) {
  if (!res.canAskAgain) Linking.openSettings();   // ✗
  return;
}
```

동작은 한다. 그런데 유저 체감은 이렇다 — **사진 버튼을 눌렀더니 앱이 갑자기 설정 앱으로 튕겼다.** 왜 튕겼는지, 거기서 뭘 눌러야 하는지 아무 설명이 없다.

`Alert`로 바꿔도 반쪽이다. Alert은 한 번 닫으면 사라지고, 다시 보려면 버튼을 또 눌러야 한다.

해법은 **상태를 화면에 남기는 것**:

```tsx
{blocked && (
  <>
    <Text style={styles.hint}>
      사진 권한이 꺼져 있음. 앱에서 다시 물어볼 수 없어 설정에서 직접 켜야 함.
    </Text>
    <Btn label="설정 열기" onPress={() => Linking.openSettings()} kind="ghost" />
  </>
)}
```

핸들러는 `return`만 한다. 화면에는 **왜 안 되는지**와 **무엇을 하면 되는지**가 상시 떠 있고, 앱을 벗어나는 결정은 유저가 버튼으로 내린다.

> 원칙: 앱이 유저를 밖으로 데려가는 건 유저가 선택할 일. 앱은 이유와 경로만 제시한다.

`Linking.openSettings()`는 RN 코어 API로 **이 앱의 설정 화면**을 연다. 설정 앱 최상단이 아니라 해당 앱 페이지로 바로 간다.

### 함정 4 — `canceled`와 거부는 다른 사건

> 문서: [`ImagePickerResult`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#imagepickerresult)

```tsx
if (result.canceled) return;
```

`canceled`는 **유저가 갤러리에서 그냥 뒤로 나온** 경우다. 거부가 아니다. 여기서 `setUri(null)`을 하면 이전에 고른 사진이 이유 없이 사라진다. 아무것도 안 하고 물러나는 게 맞다.

문서상 **취소되면 `assets`는 `null`** 이다. 그래서 `result.assets[0]`을 먼저 건드리면 크래시한다. `canceled` 체크가 단순 UX 배려가 아니라 **널 가드**라는 뜻이다. TypeScript가 discriminated union으로 잡아주므로 `canceled` 분기 없이 `assets`에 접근하면 컴파일 에러가 난다.

### `mediaTypes` — SDK 54에서 형식이 바뀜

> 문서: [`MediaType`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#mediatype) · [`MediaTypeOptions` (deprecated)](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#mediatypeoptions) · [`ImagePickerOptions`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#imagepickeroptions)

```tsx
launchImageLibraryAsync({ mediaTypes: "images" })
```

SDK 54의 `mediaTypes` 타입은 `MediaType | MediaType[] | MediaTypeOptions`. 문자열 하나, 문자열 배열(`['images', 'videos']`), 그리고 구 열거형까지 셋 다 받는다.

단 열거형은 문서에 명시적으로 deprecated로 표시돼 있다:

> *Deprecated: To set media types available in the image picker use an array of `MediaType` instead.*

즉 `ImagePicker.MediaTypeOptions.Images`를 쓰는 인터넷 예제 대부분이 구버전이다. 권장 형태는 **배열**이다. **버전 고정 문서를 봐야 하는 이유** (`AGENTS.md` 규칙).

### app.json — 권한 설명 문구는 config plugin으로

> 문서: [Configuration in app config](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#configuration-in-app-config) · [예시 app.json](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#example-appjson-with-config-plugin) · [설정 가능한 속성](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#configurable-properties)

iOS는 권한 다이얼로그에 "왜 필요한지" 문구가 없으면 심사에서 반려된다. 네이티브 `Info.plist`를 직접 건드리는 대신 config plugin에 넣는다.

| 키 | 생성되는 네이티브 키 |
|---|---|
| `photosPermission` | `NSPhotoLibraryUsageDescription` |
| `cameraPermission` | `NSCameraUsageDescription` |
| `microphonePermission` | `NSMicrophoneUsageDescription` |

지금 화면은 갤러리 선택만 하므로 권한 다이얼로그가 안 뜨고, 따라서 설정 없이도 동작한다. **W11 카메라 확장이나 출시(P8) 시점엔 필수**다.

### 이미지 표시 — `contentFit`은 style이 아니라 prop

> 문서: [`contentFit`](https://docs.expo.dev/versions/v54.0.0/sdk/image/#contentfit) · [`source`](https://docs.expo.dev/versions/v54.0.0/sdk/image/#source) · [RN Layout Props `aspectRatio`](https://reactnative.dev/docs/layout-props#aspectratio) · [RN 코어 `Image`](https://reactnative.dev/docs/image) (비교)

```tsx
<Image style={styles.image} source={uri} contentFit="cover" />
```

두 가지 실수를 했다.

1. `styles.image`에 `objectFit: "cover"`를 넣었다 — 웹 CSS 습관. tsc는 통과하지만 `expo-image`의 공식 API는 **`contentFit` prop**이다. 같은 앱 안 `FeedListScreen` 썸네일에서 이미 `contentFit`을 쓰고 있었으니 일관성도 깨진다.
2. `style`을 아예 비워뒀다 — 크기를 지정하지 않으면 화면에 아무것도 안 나타났다. 웹 `<img>`처럼 원본 크기로 알아서 커지지 않는다. (문서에 명시된 규칙은 아니고 시뮬레이터 실측. 부모가 크기를 주지 않는 레이아웃이라 그런 것으로 보인다.)

`contentFit`의 기본값은 문서상 `'cover'`라서 위 코드에서 생략해도 결과는 같다. 명시한 건 썸네일 쪽과 읽는 방식을 맞추기 위해서다.

```ts
image: {
  width: "100%",
  aspectRatio: 16 / 9,
  borderRadius: 16,
  backgroundColor: "#2b3446",   // 로드 전 자리 유지
},
```

`aspectRatio`로 비율을 고정하면 이미지 도착 전후로 레이아웃이 튀지 않는다. 배경색은 로딩 중 placeholder 역할.

> `source={uri}` — 문자열을 그대로 넘긴 건 `expo-image`라서 가능. RN 코어 `Image`였다면 `source={{ uri }}` 객체 형태여야 한다.

### 네비게이션 등록 — 타입만으론 부족

> 문서: [React Navigation — TypeScript](https://reactnavigation.org/docs/typescript/) · [Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator/) · [TS Handbook — 타입은 런타임에 안 남음](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#static-type-checking)

`navigation/types.ts`에 라우트를 추가해도 화면은 **생기지 않는다.**

| 파일 | 역할 | 빠지면 |
|---|---|---|
| `types.ts` | "Photo 라우트는 params 없음" 타입 약속 | `navigate("Photo")`에 컴파일 에러 |
| `index.tsx` | `<Stack.Screen name="Photo" .../>` 실제 등록 | 런타임에 라우트 없음 |

TypeScript 타입은 컴파일하면 전부 지워진다(type erasure). 번들에 한 줄도 안 남으므로 런타임 효과가 0이다. 타입만 추가한 상태는 **약속만 하고 물건은 안 넣은 것** — `navigate("Photo")`가 tsc는 통과하는데 실행하면 못 찾는다.

라우트 이름과 컴포넌트 이름은 별개다. 라우트 이름은 "어디로 가냐", 컴포넌트 이름은 "무엇을 그리냐". 기존 규칙(`FeedList` / `FeedDetail` / `FeedSections`)에 맞춰 `Photo`로 통일했다.

---

## 검증 방법

시뮬레이터에서 세 가지를 확인해야 한다. 2번이 핵심이다.

1. 피드 → "🖼 사진 선택" → 갤러리 열리고 선택한 사진 표시
2. **iOS 설정 앱에서 이 앱의 사진 권한을 끄고** 다시 시도 → 배너 노출
3. 배너의 "설정 열기" → 이 앱 설정 페이지로 이동

`canAskAgain === false` 상태는 코드로 만들 수 없고 **설정 앱에서 수동으로 꺼야** 재현된다. 이 경로를 안 밟으면 거부 UX는 테스트되지 않은 코드로 남는다.

> 주의: 여기서 "막힌 상태"를 만드는 건 **OS가 아니라 우리 코드의 게이트**다. 문서대로 `launchImageLibraryAsync`는 권한 없이도 열리므로, `if (!status?.granted)` 가드를 빼면 권한을 꺼놔도 갤러리는 그냥 열린다. 이 화면의 거부 UX는 **연습용 시뮬레이션**이라는 걸 알고 테스트해야 한다.
>
> 진짜 OS가 막는 플로우는 `launchCameraAsync`(카메라 권한)로 넘어가야 나온다. W11을 카메라까지 확장하면 그때 같은 배너가 실제로 값을 한다.

---

## 관련 파일

| 파일 | 변경 |
|---|---|
| `src/screens/PhotoScreen.tsx` | 신규 — 권한 플로우 + 갤러리 선택 |
| `src/navigation/types.ts` | `Photo: undefined` 라우트 타입 |
| `src/navigation/index.tsx` | `<HomeStack.Screen name="Photo">` 등록 |
| `src/screens/FeedListScreen.tsx` | 사진 화면 이동 버튼 |
| `src/theme/styles.ts` | `image` 스타일 (비율 고정 미리보기) |

---

## 남은 작업

- **W11 카메라** — [`launchCameraAsync`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#imagepickerlaunchcameraasync). 여기가 권한이 실제로 필수인 지점이라, 지금 만든 배너가 시뮬레이션이 아니라 진짜로 쓰인다. `app.json`에 `cameraPermission` 문구도 필요.
- **W12** 위치/지도 — [`expo-location`](https://docs.expo.dev/versions/v54.0.0/sdk/location/). 같은 권한 플로우 + "사용 중에만 허용" 같은 부분 권한 개념 추가.
- **W13** 저장/보안 — [`expo-secure-store`](https://docs.expo.dev/versions/v54.0.0/sdk/securestore/), [`AsyncStorage`](https://docs.expo.dev/versions/v54.0.0/sdk/async-storage/). 권한은 없지만 저장 실패 처리가 관건.
- **W14** 알림/공유 — [`expo-notifications`](https://docs.expo.dev/versions/v54.0.0/sdk/notifications/). 권한 + 백그라운드 동작.
