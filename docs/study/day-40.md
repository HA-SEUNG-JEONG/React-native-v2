# Day 40 · 12/21 (월) — 권한 모델과 expo-image-picker

> 전제: 기록 탭 글쓰기 화면은 `app/(tabs)/write.tsx`(Day 17), 기록 항목 타입은 `src/types/log.ts`의 `LogEntry`(Day 10, Day 12에서 `src/`로 이동), 기록 상태는 Day 22의 `useLogs()`/`useLogsDispatch()`다.

## 오늘의 목표

기록 탭 작성 폼에 앨범 선택과 카메라 촬영으로 사진 1장을 붙이고, 권한 거부(`canAskAgain`)를 설정 앱 안내로 처리한다.

## 읽기(15분)

> 확인할 버전: `docs.expo.dev/versions/v54.0.0/...` 링크는 지금 열면 최신 문서(SDK 58)로 넘어간다. SDK 54에 고정되는 패키지는 `expo-image-picker ~17.0`이다. 문서와 설치된 패키지의 타입 정의(에디터에서 `ImagePicker`를 따라가 열린 `.d.ts`)가 다르면 타입 쪽이 맞다.

1. [ImagePicker](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/)
   - 사용 예제 주석 "No permissions request is necessary for launching the image library"를 찾는다. 앨범 열기는 대부분 권한 요청이 필요 없다는 사실이다. 예외(iOS에서 비디오 선택 시 권한 팝업)가 무엇인지도 문장으로 적는다.
   - `launchCameraAsync`는 카메라 권한이 항상 필요하다는 문장과 `requestCameraPermissionsAsync`, `getCameraPermissionsAsync`의 반환 타입(`PermissionResponse`)을 확인한다.
   - 반환값이 `{ canceled, assets }`이고 취소하면 `assets`가 `null`이라는 점, 각 asset에 `uri`, `width`, `height`가 있다는 점을 확인한다.
   - "Configuration in app config" 절에서 `photosPermission`, `cameraPermission`이 iOS 사용 목적 문자열이고, 새 앱 바이너리를 만들어야 반영된다는 문장을 찾는다. Expo Go에서는 이 문구가 바뀌지 않는다는 뜻이다.
2. [Permissions 가이드](https://docs.expo.dev/guides/permissions/)
   - Expo Go에서는 네이티브 권한 설정 없이 런타임 요청이 되지만, dev build와 배포 빌드는 빌드 시점 설정이 필요하다는 문장을 찾는다.
   - iOS는 권한마다 사용 목적 설명이 필요하고, 설명이 부실하면 심사에서 거절될 수 있다는 경고를 확인한다.
3. [Linking.openSettings](https://reactnative.dev/docs/0.81/linking)
   - `Linking.openSettings()`가 앱의 설정 화면을 여는 API라는 설명을 찾는다.

## 예측(10분)

코드를 짜기 전에 적는다.

1. 권한 요청 코드를 하나도 쓰지 않고 `launchImageLibraryAsync()`만 호출하면, 처음 누를 때 권한 팝업이 뜰까, 앨범이 바로 열릴까?

> 내 예측:

2. 앨범 화면에서 사진을 고르지 않고 닫으면 `result.assets`는 무엇이고, `result.assets[0].uri`를 그대로 읽으면 어떻게 될까?

> 내 예측:

3. 카메라 권한 팝업에서 "허용 안 함"을 누른 뒤 같은 버튼을 다시 누르면 시스템 팝업이 다시 뜰까? 안 뜬다면 앱은 무엇을 보여줘야 할까?

> 내 예측:

## 만들기(40분)

Daily Log의 기록 탭 작성 폼(Day 5~6에서 만든 `TextInput` 폼, Day 37~38에서 다듬은 폼)에 사진 1장을 붙이는 기능을 넣는다. 위치는 기록 탭 `app/(tabs)/write.tsx`다.

설치:

```bash
npx expo install expo-image-picker
```

새로 만들 파일과 고칠 파일:

- `src/hooks/usePhotoPicker.ts` (새 파일. 폴더 위치는 Day 12에서 정한 규칙을 따른다). 앨범 선택 함수 `pickFromLibrary`, 촬영 함수 `takePhoto`, 선택된 사진 `uri` 상태를 반환하는 커스텀 훅(Day 13 패턴)이다.
- `app/(tabs)/write.tsx`: 폼에 "앨범" 버튼, "카메라" 버튼, 선택된 사진 썸네일(RN `Image`), "사진 제거" 버튼을 추가한다. 이미지 표시는 Day 2에서 쓴 RN `Image`를 쓴다. `expo-image`는 Day 41에서 바꾼다.
- `src/types/log.ts`의 `LogEntry`에 `photoUri?: string`을 추가하고, Day 22의 `dispatch({ type: 'added', ... })`를 호출하는 저장 핸들러에서 선택된 `uri`를 담는다. Day 30의 서버 전송 mutation은 건드리지 않는다. JSONPlaceholder는 사진 필드를 저장하지 않으므로 사진은 앱 안의 기록(`useLogs()` 상태)에만 둔다. 오늘은 임시 `uri` 그대로 저장하고, 영구 저장은 Day 42에서 한다.
- `app.json`의 `plugins`에 `expo-image-picker`를 추가하고 `photosPermission`, `cameraPermission`에 이 앱에 맞는 한국어 사용 목적 문구를 쓴다.

핵심 호출 형태:

```ts
const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
if (!result.canceled) setUri(result.assets[0].uri);

const perm = await ImagePicker.requestCameraPermissionsAsync();
if (!perm.granted && !perm.canAskAgain) Linking.openSettings();
```

완료 기준:

- [ ] `npx expo install expo-image-picker`로 설치했고 `app.json`에 플러그인과 한국어 문구를 넣었다.
- [ ] 앨범 버튼으로 사진을 고르면 폼에 썸네일이 보인다.
- [ ] 앨범 선택 창을 취소해도 앱이 죽지 않고 이전 상태가 유지된다(`canceled` 분기).
- [ ] 카메라 버튼은 권한을 확인(`getCameraPermissionsAsync`)하고, 없으면 요청(`requestCameraPermissionsAsync`)한다.
- [ ] 권한이 거부되고 `canAskAgain`이 `false`이면 `Alert`로 이유를 설명하고 "설정 열기" 버튼이 `Linking.openSettings()`를 호출한다.
- [ ] 저장하면 `LogEntry.photoUri`에 값이 들어간다(기록 목록에서 확인하려면 `console.log`로 충분하다).

## 검증(10분)

- iOS 시뮬레이터: 앨범 버튼을 누른다. 시뮬레이터 사진 앱에 사진이 없으면 Finder에서 이미지 파일을 시뮬레이터 창에 끌어 놓아 먼저 넣는다. 예측 1과 비교한다.
- 카메라 버튼: iOS 시뮬레이터에는 카메라가 없다(문서에 적힌 제약). 시뮬레이터에서 어떤 일이 일어나는지 직접 보고 적는다. 카메라까지 확인하려면 Android 에뮬레이터의 가상 카메라나 실기기를 쓴다.
- 권한 거부 흐름: 카메라 권한 팝업에서 "허용 안 함"을 누르고 다시 버튼을 눌러 예측 3과 비교한다.
- 일부러 깨뜨리기: `canceled` 검사를 지우고 앨범 창을 취소로 닫는다. 어떤 에러가 나는지 메시지 원문을 적고 검사를 되돌린다.
- 선택된 `uri`를 `console.log`로 찍어 경로가 `cache` 폴더 아래인지 확인한다. 이 경로가 왜 문제가 되는지는 Day 42에서 다룬다.

## 이해 점검 질문

1. 앨범을 여는 `launchImageLibraryAsync`는 권한 요청 없이 되는데, `launchCameraAsync`는 왜 권한이 필요한가?
2. `result.canceled`를 확인하지 않고 `result.assets[0].uri`를 읽으면 왜 에러가 나는가?
3. 권한을 거부한 사용자에게 같은 `requestCameraPermissionsAsync()`를 계속 호출하면 안 되는 이유는 무엇이고, 대신 무엇을 해야 하는가?

<details>
<summary>정답</summary>

1. 앨범 선택은 OS가 제공하는 선택 UI가 대신 앨범을 보여주고 앱에는 고른 사진만 넘겨주기 때문에, 앱이 앨범 전체를 읽을 권한이 필요 없다. 카메라는 앱이 카메라 하드웨어를 직접 쓰는 것이라 OS가 권한을 요구한다.
2. 취소하면 `assets`가 `null`이다. `null[0]`을 읽으면 TypeError가 난다. TypeScript는 `canceled`가 `false`일 때만 `assets`가 배열이라고 좁혀 주므로, 분기를 두면 타입 에러로도 막을 수 있다.
3. 사용자가 거부하고 `canAskAgain`이 `false`가 되면 OS는 시스템 팝업을 다시 띄우지 않고 거부 결과만 즉시 돌려준다. 호출해도 아무 일도 일어나지 않아 버튼이 고장 난 것처럼 보인다. 이유를 설명하고 `Linking.openSettings()`로 설정 앱을 열어 사용자가 직접 켜게 해야 한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 기록 작성 폼에 앨범·카메라 사진 선택 추가`
- `fix: 카메라 권한 영구 거부 시 설정 앱 안내`
- `chore: expo-image-picker 플러그인 사용 목적 문구 설정`

## 웹과 다른 점

웹의 `<input type="file">`은 사용자가 고른 파일만 받고 권한 개념이 없지만, 네이티브는 OS 권한 모델을 거치고 한 번 거부하면 앱이 다시 물을 수 없다(`canAskAgain`).
