# Day 46 · 12/29 (화) — react-native-maps와 dev build

> 전제: 기록 탭 글쓰기 화면은 `app/(tabs)/write.tsx`(Day 17), 기록 항목 타입은 `src/types/log.ts`의 `LogEntry`(Day 10, Day 12에서 `src/`로 이동), 기록 상태는 Day 22의 `useLogs()`/`useLogsDispatch()`다.

> 건너뛰기 가능: 지도는 플랫폼별 키·네이티브 빌드 설정이 얽혀 환경에 따라 시간이 크게 늘어난다. 3일 이상 밀렸으면 "읽기"와 "예측"까지만 하고 만들기는 건너뛴다.

## 오늘의 목표

기록 상세 화면에 `react-native-maps`의 지도를 넣고 Day 45에서 저장한 위치에 마커를 표시하며, Expo Go와 dev build 중 이 환경에서 무엇이 필요한지 직접 확인한다.

## 읽기(15분)

> 확인할 버전: `docs.expo.dev/versions/latest/...` 링크는 최신 문서(SDK 58)를 보여 준다. SDK 54에 고정되는 `react-native-maps`는 `1.20.1`이다(최신 페이지의 권장 버전은 1.29.11). 아래 사실은 SDK 54 문서 원문 기준이다.

1. [react-native-maps (Expo 문서)](https://docs.expo.dev/versions/latest/sdk/map-view/)
   - 상단의 "Expo Go에서 테스트할 때는 추가 설정이 필요 없고, **앱 스토어용 바이너리를 배포하려면** Google Maps 관련 추가 단계가 필요하다"는 문장을 찾는다. 개발 중에는 Expo Go로 되고, 스토어용 바이너리에서만 키 설정과 재빌드가 필요하다는 뜻이다. 오늘 직접 Expo Go에서 지도가 뜨는지 확인해 기록한다.
   - 이 라이브러리가 Android에서 Google Maps, iOS에서 Apple Maps 또는 Google Maps를 쓴다는 설명을 확인한다.
   - "Deploy app with Google Maps"에서 Android는 Google Cloud의 API 키를 `android.config.googleMaps.apiKey`에 넣고(최신 SDK 58 문서는 `plugins`의 `react-native-maps` 설정에 `androidGoogleMapsApiKey`를 넣는 방식으로 바뀌었다. 이 프로젝트는 SDK 54라 앞의 방식이 맞다), `provider={PROVIDER_GOOGLE}`을 지정한 뒤 앱 바이너리를 다시 빌드해야 한다는 흐름을 읽는다. 오늘은 이 키 설정을 하지 않는다. 설정이 필요한 시점이 언제인지만 파악한다.
2. [Development builds 소개](https://docs.expo.dev/develop/development-builds/introduction/)
   - Expo Go와 development build의 차이를 다시 읽는다(Day 1 복습). 네이티브 설정을 바꾸는 라이브러리를 쓰려면 왜 새 빌드가 필요한지를 문장으로 적는다.

## 예측(10분)

1. Expo Go에서 `<MapView style={{ flex: 1 }} />`만 렌더링하면 iOS 시뮬레이터에서는 어떤 지도가 보일까? 키 설정 없이 Android 에뮬레이터에서도 뜰까?

> 내 예측:

2. `MapView`의 `style`에서 크기를 빼면(부모에 높이가 없는 상태) 지도는 보일까?

> 내 예측:

3. 상태로 좌표를 바꿔 `initialRegion`에 다른 값을 넘기면 이미 떠 있는 지도가 그 위치로 움직일까?

> 내 예측:

## 만들기(40분)

설치:

```bash
npx expo install react-native-maps
```

새로 만들/고칠 파일:

- `app/log/[id].tsx` (새 파일): 기록 상세 화면이다. Day 16에서 만든 동적 라우트 패턴을 따라 `useLocalSearchParams`로 `id`를 읽고, Day 22의 기록 상태(Context)에서 해당 항목을 찾는다.
- `app/_layout.tsx`의 `RootNavigator`: `Stack.Protected guard={!!token}` 안에 `<Stack.Screen name="log/[id]" />`를 추가한다.
- `LogItem`의 `onPress`(Day 10): 항목을 누르면 `/log/[id]`로 `router.push` 하도록 연결한다(Day 20의 router API). `LogItem`은 라우터를 직접 쓰지 않으므로 `router.push`는 `app/(tabs)/write.tsx`에서 `onPress`로 넘기는 콜백 안에서 호출한다.
- 상세 화면의 내용: 본문, 사진(Day 42의 `getPhotoUri`와 Day 41의 `expo-image`), 그리고 `LogEntry.place`(Day 45)가 있으면 `MapView`.
- 지도: 높이를 고정한 컨테이너 안에 `MapView`를 두고 `initialRegion`을 `place`의 좌표와 작은 `latitudeDelta`/`longitudeDelta`로 지정한다. `Marker`는 `coordinate`와 `title`(지역 이름)을 준다. 이 prop 이름은 설치된 `react-native-maps`의 타입 정의로 확인한다(문서에서 확인 필요).
- 위치가 없는 기록은 지도 대신 "위치 없음" 안내만 보여 준다.

핵심 호출 형태:

```tsx
import MapView, { Marker } from 'react-native-maps';

<MapView style={{ width: '100%', height: 200 }} initialRegion={region}>
  <Marker coordinate={place} title={place.label} />
</MapView>
```

완료 기준:

- [ ] `npx expo install react-native-maps`로 설치했다.
- [ ] 기록 목록 항목을 누르면 상세 화면으로 이동한다.
- [ ] 위치가 있는 기록은 지도와 마커가 보인다(Expo Go 또는 dev build 중 실제로 된 쪽을 기록 칸에 적는다).
- [ ] 위치가 없는 기록은 지도 없이 안내 문구가 보인다.
- [ ] Google Maps API 키를 코드나 저장소에 넣지 않았다(오늘은 키가 필요 없는 범위까지만 한다).

## 검증(10분)

- Expo Go에서 지도가 뜨는지 확인하고 예측 1과 비교한다. 뜨지 않으면 에러 메시지 원문을 기록 칸에 적고, dev build가 필요한 이유를 읽기 2의 문서에서 찾아 적는다. dev build를 만드는 작업(`npx expo run:ios` 또는 EAS Build)은 시간이 길어 오늘은 건너뛰고 필요 여부만 적는다.
- 일부러 깨뜨리기: 지도 컨테이너에서 높이를 지우고 화면을 본다. 예측 2와 비교한 뒤 되돌린다.
- 상태로 좌표를 바꾸는 임시 버튼을 만들어 `initialRegion`만 바꾸면 지도가 움직이는지 보고 예측 3과 비교한 뒤 버튼을 지운다.

## 이해 점검 질문

1. 같은 `react-native-maps` 코드가 Expo Go에서는 키 없이 되고, 스토어용 바이너리에서는 Android에 Google Maps API 키를 넣어야 하는 이유는 무엇인가?
2. `MapView`에 `style`로 크기를 주지 않으면 왜 지도가 보이지 않을 수 있는가?
3. Day 45에서 위치 권한을 거부해 `place` 없이 저장된 기록의 상세 화면은 어떻게 보여야 하는가? 상세 화면의 지도에는 위치 권한이 필요한가?

<details>
<summary>정답</summary>

1. Expo Go는 지도 기능이 이미 포함된 미리 만들어진 앱이라 문서 기준으로 개발 중에는 추가 설정 없이 실행된다. 스토어에 올리는 바이너리는 내 앱의 패키지 이름·서명과 묶인 Google Cloud 키를 직접 가져야 Google Maps를 쓸 수 있고, 키는 네이티브 설정에 들어가므로 앱을 다시 빌드해야 반영된다.
2. 네이티브 지도 뷰는 웹의 `<div>`처럼 내용 크기에 맞춰 늘어나지 않는다. 부모와 `style`에서 폭·높이가 정해지지 않으면 높이가 0이 되어 화면에 안 보일 수 있다. 문서 예제가 `width: '100%', height: '100%'`를 주는 이유다.
3. `place`는 선택 필드라서 권한을 거부했거나 위치를 붙이지 않은 기록에는 값이 없다. 상세 화면은 `place`가 없으면 `MapView`를 렌더하지 않고 "위치 없음" 안내만 보여 준다. 지도는 저장된 좌표를 그리기만 하므로 상세 화면에는 위치 권한이 필요 없다. 권한은 현재 위치를 읽는 Day 45의 위치 붙이기 단계에서만 필요하다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

Expo Go에서 지도가 떴는가(iOS / Android):

## 커밋 단위 제안

- `feat: 기록 상세 화면과 목록 연결 추가`
- `feat: 기록 상세에 지도와 위치 마커 표시`

## 웹과 다른 점

웹의 지도(Google Maps JS 등)는 스크립트와 키로 불러오지만, 네이티브 지도는 플랫폼 지도 SDK를 앱에 빌드로 포함하고 키도 네이티브 설정(`app.json`의 `android.config`)에 들어간다.
