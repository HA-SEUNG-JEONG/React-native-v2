# Day 66 · 1/26 (화) — EAS Build

## 오늘의 목표

Daily Log에 `expo-dev-client`와 `eas.json`을 추가하고, EAS Build로 iOS 시뮬레이터용 development build를 만들어 설치한 뒤 개발 서버에 연결한다.

## 읽기(15분)

1. [Expo — Create your first build](https://docs.expo.dev/build/setup/)
   - `npx eas-cli@latest`로 전역 설치 없이 실행할 수 있고, 로그인은 `eas login`, 확인은 `eas whoami`라는 점을 찾는다.
   - Expo 계정은 무료 플랜에서도 쓸 수 있고, 스토어 업로드를 하려면 Google Play 개발자 등록(일회성 25달러)과 Apple Developer Program(연 99달러)이 필요하다는 문장을 찾는다.
   - iOS 시뮬레이터용 빌드는 스토어 계정 없이 만들 수 있다는 문장을 찾는다.
2. [Expo — eas.json (Build profiles)](https://docs.expo.dev/build/eas-json/)
   - `development`는 `developmentClient: true`와 `distribution: "internal"`, `preview`는 `distribution: "internal"`, `production`은 빈 객체라는 기본 프로필 3종의 용도를 정리한다.
   - `ios.simulator: true`를 쓰면 시뮬레이터용 빌드가 되고, 시뮬레이터 빌드와 실기기용 빌드는 프로필을 따로 두는 것이 권장된다는 문장을 찾는다.
3. [Expo — Introduction to development builds](https://docs.expo.dev/develop/development-builds/introduction/)
   - `npx expo install expo-dev-client` 후 `eas build --platform ios --profile development` 순서를 확인한다.
   - 빌드가 끝나면 CLI가 시뮬레이터 설치를 묻고, 그 뒤 `npx expo start`를 실행하면 Expo Go 대신 development build를 대상으로 한다는 문장을 찾는다.
   - 클라우드 빌드 대신 Xcode가 있을 때 `npx expo run:ios`로 로컬 빌드할 수 있다는 대안을 찾는다.

## 예측(10분)

1. development build와 Expo Go는 무엇이 다를까? 한 문장으로 적는다.

   > 내 예측:

2. `ios.simulator: true`로 만든 빌드를 내 iPhone 실기기에 설치할 수 있을까?

   > 내 예측:

3. 빌드를 설치한 뒤 피드 화면의 JS 코드 한 줄을 고치면 앱을 다시 빌드해야 할까? `app.json`의 `name`을 고치면 홈 화면 앱 이름이 바뀔까?

   > 내 예측:

## 만들기(40분)

클라우드 빌드는 시간이 걸리므로 설정을 마치는 즉시 빌드를 걸어 두고, 기다리는 동안 EAS 대시보드의 빌드 로그를 읽는다.

**1. 패키지와 앱 식별자**
- 설치(이 Day에서 처음 설치한다): `npx expo install expo-dev-client`
- `app.json`의 `expo`에 식별자를 추가한다. 스토어에서 고유해야 하는 값이므로 본인만 쓰는 이름으로 정한다.

  ```json
  "ios": { "supportsTablet": true, "bundleIdentifier": "com.본인아이디.dailylog" },
  "android": { "package": "com.본인아이디.dailylog" }
  ```

  기존 `ios`/`android` 객체에 필드를 추가하는 것이고 기존 값은 지우지 않는다.

**2. EAS 로그인과 설정**
- `npx eas-cli@latest login`, `npx eas-cli@latest whoami`로 로그인을 확인한다.
- `npx eas-cli@latest build:configure`로 프로젝트를 설정한다. 생성·변경된 파일을 `git diff`와 `git status`로 확인해 적는다(`eas.json`이 생겨야 한다).

**3. development 프로필을 시뮬레이터용으로**
- `eas.json`의 `build.development`에 시뮬레이터 설정을 추가한다.

  ```json
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "ios": { "simulator": true }
  }
  ```

**4. 빌드와 설치**
- `npx eas-cli@latest build --platform ios --profile development`
- 빌드가 끝나면 CLI의 설치 질문에 Y로 답해 시뮬레이터에 설치한다. 설치 질문이 나오지 않으면 expo.dev 대시보드의 빌드 페이지에서 받는 방법을 문서에서 찾는다.
- 클라우드 큐 대기가 길면(무료 플랜 빌드 횟수와 대기 시간은 문서에서 확인 필요) 대안으로 `npx expo run:ios`를 쓴다. 이 경우 Xcode가 필요하고 프로젝트에 `ios` 폴더가 생기지만 `.gitignore`에 이미 들어 있다.

**5. 연결**
- `npx expo start`를 실행하고 시뮬레이터의 development build에서 개발 서버에 연결해 Daily Log 3탭이 뜨는지 확인한다.

(선택) Android: `eas build --platform android --profile development`로 APK를 만들어 에뮬레이터가 있을 때 설치한다.

완료 기준
- [ ] `app.json`에 `ios.bundleIdentifier`와 `android.package`가 있다.
- [ ] `eas.json`의 `development` 프로필에 `developmentClient: true`와 `ios.simulator: true`가 있다.
- [ ] EAS 대시보드에 성공한 빌드 1개가 있고 시뮬레이터에 Daily Log가 설치되어 있다.
- [ ] development build가 개발 서버(`npx expo start`)에 연결되어 3탭이 뜬다.
- [ ] 인증서·키 파일(`*.jks`, `*.p12`, `*.p8` 등)이 저장소에 추가되지 않았다.

## 검증(10분)

- 시뮬레이터 앱에서 `j`로 DevTools를 열어 Day 65에서 쓴 Network 탭이 development build에서도 동작하는지 확인한다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.

> 실제 결과 / 예측과 다른 지점:

**깨뜨려 보는 실험**: 피드 화면 텍스트 한 줄을 고쳐 저장해 재빌드 없이 반영되는지 본다. 그다음 `app.json`의 `name`을 바꾸고 `npx expo start`를 다시 띄운 뒤 시뮬레이터 홈 화면의 앱 이름이 바뀌는지 관찰해 기록한다. 끝나면 `name`을 되돌린다.

## 이해 점검 질문

1. Expo Go 대신 development build가 필요해지는 경우는 언제이고, 이 커리큘럼에서 어느 Day가 그런가?
2. `development`, `preview`, `production` 프로필의 용도 차이는?
3. iOS 시뮬레이터용 빌드와 실기기용 빌드는 계정 요건과 설치 방식에서 어떻게 다른가?

<details>
<summary>정답</summary>

1. Expo Go에 이미 들어 있지 않은 네이티브 코드가 필요할 때다. development build는 프로젝트가 쓰는 네이티브 라이브러리를 직접 컴파일해 넣고 `expo-dev-client`로 개발 서버에 연결한다. 이 커리큘럼에서는 Day 46(`react-native-maps`)이 dev build를 요구한다. 푸시 토큰(Day 48)은 추가로 실기기가 필요하다.
2. `development`는 `developmentClient: true`에 `distribution: "internal"`로, 개발 도구가 들어간 빌드를 만들어 스토어에 올리지 않는다. `preview`는 `distribution: "internal"`로, 개발 도구 없이 팀원이 프로덕션과 비슷한 환경에서 테스트하는 용도다(Android는 APK 권장). `production`은 스토어 제출이나 TestFlight 같은 스토어 기반 테스트용이다.
3. 시뮬레이터 빌드는 스토어 계정이 없어도 만들 수 있지만 실기기에는 설치할 수 없다(그래서 프로필을 분리한다). 실기기용 iOS 빌드는 유료 Apple Developer 계정과 기기 UDID 등록(ad hoc)이 필요하다. Android internal 빌드는 APK로 만들어져 보안 경고를 수락하면 직접 설치할 수 있다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: expo-dev-client 추가`
- `chore: EAS 빌드 설정과 앱 식별자 추가`

## 웹과 다른 점

웹은 빌드 결과를 서버에 올리면 끝이지만 모바일 앱은 OS가 요구하는 바이너리 서명과 앱 식별자가 필요하고, 네이티브 코드나 설정이 바뀌면 JS 수정과 달리 새 빌드가 필요하다.
