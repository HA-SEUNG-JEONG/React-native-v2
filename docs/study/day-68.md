# Day 68 · 1/28 (목) — EAS Update(OTA)와 스토어 제출 준비

> 건너뛰기 가능: 마지막 Day 69는 버퍼라 이 Day의 결과에 의존하지 않고, 스토어 제출은 읽기와 점검표만 다룬다. 건너뛰면 "읽기"만 한다.

## 오늘의 목표

`expo-updates`와 EAS Update를 설정해 설정 탭의 문구 한 줄을 새 빌드 없이 OTA로 바꿔 보고, 스토어 제출 전 준비 항목을 점검표로 정리한다.

## 읽기(15분)

1. [EAS Update — Introduction](https://docs.expo.dev/eas-update/introduction/)
   - 업데이트로 바꿀 수 있는 것(JS 코드, 스타일, 이미지 등 비네이티브 요소)과 바꿀 수 없는 것(네이티브 코드·의존성 변경, 앱 권한 변경, Expo SDK 버전 업데이트)을 표로 정리한다.
   - `npx expo install expo-updates` → `eas update:configure` → 업데이트가 들어 있는 **새 빌드**를 만든다는 3단계를 찾는다. 기존 빌드에는 라이브러리가 없어 업데이트를 받을 수 없다는 문장도 찾는다.
2. [EAS Update — Get started](https://docs.expo.dev/eas-update/getting-started/)
   - `eas update:configure`가 `app.json`에 `runtimeVersion`과 `updates.url`(필요하면 `extra.eas.projectId`)을 쓰고, `eas.json`의 `preview`·`production` 프로필에 `channel`을 쓴다는 점을 확인한다.
   - `eas update --channel [채널] --message "[메시지]"` 형태를 확인한다. 이 문서의 `--environment` 옵션은 SDK 55 이상에서 필수라고 적혀 있으므로 SDK 54인 이 프로젝트에서는 문서에서 필요 여부를 확인한다.
   - 릴리스 빌드에서는 업데이트가 앱 시작 때 백그라운드로 내려받아지고, 앱을 강제 종료했다 다시 여는 과정을 최대 두 번 해야 반영될 수 있다는 문장을 찾는다.
3. [EAS Update — Runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)
   - `runtimeVersion`이 "빌드의 네이티브 코드와 업데이트의 호환"을 보장하는 값이라는 정의를 찾는다.
   - 정책 `appVersion`과 `fingerprint`의 차이(앱 버전을 올리는 것을 잊으면 불일치 가능 / 빌드를 더 자주 만들어야 함)를 정리한다.

## 예측(10분)

1. 설정 탭 문구를 바꾼 업데이트를 게시한 뒤 시뮬레이터 앱을 한 번만 종료했다 켜면 새 문구가 보일까?

   > 내 예측:

2. 새 네이티브 라이브러리를 추가한 코드를 `runtimeVersion` 변경 없이 업데이트로 게시하면, 그 라이브러리가 없는 기존 빌드에서는 어떤 일이 생길 수 있을까?

   > 내 예측:

3. `preview` 채널로 만든 빌드에 `production` 채널로 게시한 업데이트가 반영될까?

   > 내 예측:

## 만들기(40분)

클라우드 빌드 대기가 길면 3번의 `eas update`와 검증은 다음 학습일 시작에 이어서 해도 된다.

**1. expo-updates 설정**
- 설치(이 Day에서 처음 설치한다): `npx expo install expo-updates`
- `npx eas-cli@latest update:configure`를 실행한다. `git diff`로 `app.json`에 추가된 `runtimeVersion`, `updates.url`과 `eas.json`에 추가된 `channel`을 확인해 기록에 적는다. 어떤 `runtimeVersion` 정책이 설정됐는지는 문서에서 확인 필요.

**2. 시뮬레이터용 preview 빌드**
- `eas.json`의 `build.preview`에 `"ios": { "simulator": true }`를 추가한다(Day 66의 `development` 프로필과 같은 방식).
- 설정 탭 화면 파일 하단에 `Text` 한 줄을 추가한다: `업데이트 테스트: 1`.
- 빌드: `npx eas-cli@latest build --platform ios --profile preview` 후 시뮬레이터에 설치하고 문구가 `1`인지 확인한다. 이 빌드가 expo-updates를 포함한 첫 빌드다.

**3. OTA 업데이트 게시**
- 같은 `Text`를 `업데이트 테스트: 2`로 바꾼다. 앱 코드만 바꿨고 네이티브 의존성은 건드리지 않는다.
- `npx eas-cli@latest update --channel preview --message "설정 탭 문구 변경"`
- 시뮬레이터에서 앱을 강제 종료하고 다시 열어 문구를 본다. 바뀌지 않았으면 한 번 더 종료·재시작한다. 몇 번째에 바뀌었는지 기록한다.

**4. 스토어 제출 준비 점검표 (읽기 기반)**
- [제출 문서(EAS Submit)](https://docs.expo.dev/deploy/submit-to-app-stores/)를 읽고 아래 점검표의 각 항목에 "됨 / 안 됨 / 해당 없음"과 한 줄 메모를 적는다.

| 항목 | 상태 | 메모 |
|---|---|---|
| 앱 식별자 확정 (`ios.bundleIdentifier`, `android.package`) | | |
| 앱 버전과 빌드 번호 정책 (`version`, `ios.buildNumber`, `android.versionCode`) | | |
| 아이콘·스플래시를 release 빌드에서 확인 | | |
| 스토어 계정 (Apple Developer 연 99달러, Google Play 일회성 25달러) | | |
| 스토어 등록 정보·스크린샷·릴리스 노트 (EAS Submit이 관리하지 않음) | | |
| 서명 자격 증명 (Android 키스토어, iOS 인증서·프로비저닝 프로필) | | |
| 권한 사용 이유 문구 (사진 Day 40, 위치 Day 45, 알림 Day 47) | | |

권한 사용 이유 문구를 어느 설정에서 바꾸는지는 문서에서 확인 필요.

완료 기준
- [ ] `app.json`에 `runtimeVersion`과 `updates.url`이 있고, `eas.json`의 `preview` 프로필에 `channel`이 있다.
- [ ] 설정 탭에 `업데이트 테스트` 문구가 있고 OTA 업데이트로 `1`이 `2`로 바뀌는 것을 직접 확인했다. 몇 번째 재시작에서 바뀌었는지 기록했다.
- [ ] 점검표의 모든 행에 상태가 적혀 있다.
- [ ] 실험 후 `업데이트 테스트` 문구와 임시 변경을 정리했다(남기고 싶으면 커밋 메시지에 이유를 적는다).

## 검증(10분)

- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- OTA로 바뀐 것은 무엇이었는지, 그리고 읽기 1의 "바꿀 수 없는 것" 목록에서 오늘 시도하지 않은 항목은 무엇인지 한 줄로 정리한다.

> 실제 결과 / 예측과 다른 지점:

**깨뜨려 보는 실험**: 문구를 `업데이트 테스트: 3`으로 바꾸고 `--channel production`으로 게시해 본다(학습용 프로젝트에서만 한다). `preview` 빌드 앱을 두 번 재시작해도 `3`이 나타나지 않는지 확인하고, 나타나지 않는 이유를 채널과 연결해 적는다.

## 이해 점검 질문

1. EAS Update로 바꿀 수 있는 것과 없는 것을 각각 예로 들고, 그 경계가 생기는 이유는?
2. `runtimeVersion`이 없거나 항상 같은 값이면 어떤 문제가 생길 수 있는가? `appVersion` 정책과 `fingerprint` 정책의 차이는?
3. EAS Submit이 해 주는 일과 사람이 직접 준비해야 하는 일을 구분하라.

<details>
<summary>정답</summary>

1. 바꿀 수 있는 것: JS 코드, 스타일, 이미지 같은 비네이티브 요소(예: 설정 탭 문구). 바꿀 수 없는 것: 네이티브 코드나 의존성 변경, 앱 권한 변경, Expo SDK 버전 업데이트(예: 새 `react-native-maps` 추가). 설치된 앱 바이너리의 네이티브 레이어는 스토어를 통해 새로 설치해야만 바뀌고, 업데이트는 그 위에서 교체 가능한 JS·에셋 레이어만 내려받기 때문이다.
2. 새 네이티브 라이브러리를 쓰는 업데이트가 그 코드가 없는 기존 빌드에도 배포되어 오류가 나고, `expo-updates`가 이전 업데이트로 롤백을 시도할 수 있다. `appVersion` 정책은 앱 버전이 올라갈 때 런타임 버전도 올라가는데, 네이티브 변경 때 앱 버전 올리는 것을 잊으면 불일치가 생길 수 있다. `fingerprint` 정책은 네이티브 런타임에 영향을 줄 수 있는 요소가 바뀌면 자동으로 올라가 비호환 가능성이 매우 낮지만 빌드를 더 자주 만들어야 한다.
3. EAS Submit은 빌드된 `.aab`/`.ipa`를 Google Play Console/App Store Connect에 업로드하는 일을 한다(`eas submit`). 스토어 등록 정보·스크린샷·릴리스 노트는 관리하지 않으므로 Play Console과 App Store Connect에서 직접 준비해야 하고, 스토어 계정과 서명 자격 증명, 비대화형(CI) 제출 시 서비스 계정 키·App Store Connect API 키도 사람이 준비한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: expo-updates와 EAS Update 채널 설정`
- `docs: 스토어 제출 준비 점검표 작성`

## 웹과 다른 점

웹은 서버에 새 JS를 올리면 모든 사용자가 새로고침 때 바로 받지만, 모바일 앱은 이미 설치된 바이너리와 호환되는 업데이트만 받을 수 있고(`runtimeVersion`) 네이티브 변경은 스토어 심사를 거친 새 빌드가 필요하다.
