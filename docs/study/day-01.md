# Day 1 · 10/27 (화) — 환경, create-expo-app으로 루트에 앱 생성, Expo Go와 dev build 차이

## 오늘의 목표

SDK 54 Expo 앱을 프로젝트 루트에 만들어 iOS 시뮬레이터에서 띄우고, Expo Go와 development build의 차이를 내 말로 설명한다.

## 읽기(15분)

1. [https://docs.expo.dev/get-started/set-up-your-environment/](https://docs.expo.dev/get-started/set-up-your-environment/)
   - 확인할 사실: iOS 시뮬레이터에서는 `npx expo start` 후 `i`를 누르면 Expo CLI가 Expo Go를 자동으로 설치한다. 이 페이지는 "Expo Go" 경로와 "Development build" 경로를 따로 안내하며, Expo Go를 학습·실험용 playground로 설명한다.
2. [https://docs.expo.dev/develop/development-builds/introduction/](https://docs.expo.dev/develop/development-builds/introduction/)
   - 확인할 사실: development build는 `expo-dev-client`를 넣어 직접 컴파일한 "나만의 Expo Go"다. 어떤 네이티브 라이브러리든 쓰고 네이티브 설정을 바꿀 수 있다는 문장, 그리고 개발 서버를 고르는 런처 화면이 생긴다는 문장을 찾는다.
3. [https://docs.expo.dev/more/create-expo/](https://docs.expo.dev/more/create-expo/)
   - 확인할 사실: `--template default@sdk-NN` 형태로 템플릿을 SDK 버전에 고정한다. `--no-install`은 의존성 설치를 건너뛴다. 페이지 예시는 최신 SDK 기준이므로 우리는 숫자를 `54`로 바꿔 쓴다. 실기기에서 Expo Go를 쓰려면 지원되는 SDK 프로젝트를 쓰라는 안내 문장을 찾는다. 페이지는 "Expo Go가 최신 SDK만 지원한다"고 쓰지 않고 "실기기에서 Expo Go를 쓸 계획이면 이 SDK의 프로젝트를 쓰라"고 안내한다(2026-10-27 확인 시점 문구: SDK 58 전환 기간에는 SDK 57 프로젝트).
   - `docs.expo.dev/versions/v54.0.0/...` 형태의 SDK 54 문서 링크는 301로 `versions/latest/...`(최신 문서)로 이동한다(2026-10-27 확인). 열었을 때 주소가 바뀌면 SDK 54 문서가 아니라는 점을 기억하고 읽는다.

> 문서에서 확인 필요: "iOS 실기기의 App Store판 Expo Go는 최신 SDK만 지원한다"는 문장은 위 세 페이지에서 직접 찾지 못했다. 3번 페이지의 실기기 안내가 가장 가깝다. 이 사실은 시험으로 확인된 것이며, 문서 문구를 찾으면 여기에 적는다.

## 예측(10분)

코드를 치기 전에 적는다.

1. 이 프로젝트 루트에는 `AGENTS.md`, `CLAUDE.md`, `.claude/`, `docs/`가 이미 있다. 루트에서 곧바로 `npx create-expo-app@latest . --template default@sdk-54`를 실행하면 어떻게 될까? 왜?
   > 내 예측: 설치 오류가 난다. 구체적인 원인은 잘 모르겠다.
2. 시뮬레이터에서 앱이 열릴 때, 화면 바깥쪽을 감싸는 "껍데기 앱"은 무엇일까? 우리 코드는 그 안에서 어떤 형태로 실행될까?
   > 내 예측: 잘 모르겠다.
3. 앱이 떠 있는 상태에서 `app/(tabs)/index.tsx`의 문구 하나를 바꿔 저장하면 앱 전체가 처음부터 다시 시작될까, 바뀐 부분만 갱신될까?
   > 내 예측: 바뀐 부분만 갱신된다.

## 만들기(40분)

Daily Log의 출발점인 빈 Expo 앱을 루트에 만든다. 오늘은 화면을 만들지 않고 환경과 실행 경로만 확정한다.

1. 사전 준비: Xcode와 iOS Simulator가 설치돼 있어야 한다(읽기 1번 페이지의 iOS Simulator 항목). Android도 쓰려면 Android Studio 에뮬레이터를 준비한다.
2. (선택) 루트에서 `npx create-expo-app@latest . --template default@sdk-54 --no-install`을 한 번 실행해 거부 메시지를 눈으로 확인한다. 예측 1번과 비교한다.
3. 임시 폴더에 생성한다.
   ```bash
    npx create-expo-app@latest _tmp --template default@sdk-54 --no-install
   ```

    (선택) `--no-agents-md`를 붙이면 템플릿이 `AGENTS.md`와 `.claude/settings.json`을 만들지 않는다. `npx create-expo-app@latest --help`의 옵션 목록에 있음을 2026-10-27에 확인했다. 쓰더라도 다음 단계의 `rm -rf`는 그대로 둬도 된다.
4. 템플릿이 만든 `AGENTS.md`와 `.claude`는 루트 것이 이미 있으므로 지운다. 템플릿의 `.git`도 지운다.
   ```bash
    rm -rf _tmp/.git _tmp/AGENTS.md _tmp/.claude
   ```
5. 나머지를 루트로 옮기고 임시 폴더를 지운 뒤 설치한다. 루트 `.gitignore`는 템플릿 것으로 덮이는데 정상이다.
   ```bash
    cp -R _tmp/. . && rm -rf _tmp && npm install
   ```
6. 이름을 바꾼다. 템플릿은 폴더 이름(`_tmp`)을 그대로 쓴다. 루트 `package.json`의 `name`, 루트 `app.json`의 `expo.name`·`expo.slug`를 `daily-log`로 고치고, `expo.scheme`만 `dailylog`로 고친다(Day 18·19가 쓰는 앱 스킴).
7. `npx expo start`를 실행하고 터미널에서 `i`를 눌러 iOS 시뮬레이터로 연다. 첫 실행이면 Expo Go가 자동 설치되는 과정을 본다.
8. 버전을 확인한다. `npm ls expo react-native react expo-router --depth=0`.

완료 기준:

- [ ] 루트에 `AGENTS.md`, `CLAUDE.md`, `.claude/`, `docs/`가 그대로 있다(`git status`로 삭제 표시가 새로 생기지 않았는지 본다)
- [ ] `_tmp/` 폴더가 남아 있지 않다
- [ ] `package.json`과 `app.json`의 이름이 `daily-log`다
- [ ] `npm ls`에서 expo가 54.0.x, react-native 0.81.5, react 19.1.0, expo-router 6.0.x다
- [ ] 시뮬레이터에서 템플릿의 탭 화면(Home, Explore)이 보인다
- [ ] 루트 `app.json`의 `expo.experiments`에서 `reactCompiler`와 `typedRoutes`가 `true`인 것을 눈으로 확인했다(Day 62, 15에서 다룬다)

## 검증(10분)

예측과 실제를 비교한다.

- 시뮬레이터에서 Home 탭과 Explore 탭을 눌러 이동해 본다. 화면 위쪽에 보이는 앱 껍데기가 무엇인지 확인한다(예측 2번).
- `app/(tabs)/index.tsx`에서 제목 문구 하나를 바꿔 저장한다. 앱이 처음부터 재시작됐는지, 바뀐 부분만 갱신됐는지 본다(예측 3번).
- 실험: 같은 파일의 JSX에서 닫는 태그 하나를 지우고 저장한다. 시뮬레이터에 오류 화면이 뜨는지 본다. 태그를 되돌려 저장하면 앱을 다시 켜지 않아도 복구되는지 확인한다.


| 예측  | 실제  | 다른 이유 |
| --- | --- | ----- |
| 1   |     |       |
| 2   |     |       |
| 3   |     |       |


## 이해 점검 질문

1. Expo Go와 development build의 차이를 "무엇을 직접 컴파일하는가" 관점에서 설명하라. 우리가 오늘 SDK 54 앱을 시뮬레이터로 실행한 이유는?
2. 루트에 바로 `create-expo-app`을 실행하지 않고 `_tmp`에 생성한 뒤 옮긴 이유는 무엇인가? `cp -R _tmp/. .`에서 `.`을 뒤에 붙인 이유는?
3. 코드에 구문 오류를 내고 저장했다가 고쳤더니 앱을 다시 켜지 않아도 복구됐다. 이 동작을 가능하게 하는 기능의 이름과, 상태(state)가 어떻게 되는지 설명하라.

<details class="orca-details">
<summary>정답</summary>

1. Expo Go는 Expo가 미리 컴파일해 둔 네이티브 앱이고, 우리는 그 안에 JS 번들만 올린다. development build는 `expo-dev-client`를 포함해 우리 프로젝트의 네이티브 코드까지 직접 컴파일한 앱이라, Expo SDK 밖의 네이티브 라이브러리와 네이티브 설정 변경을 쓸 수 있다. App Store판 Expo Go는 최신 SDK 프로젝트만 열기 때문에(시험으로 확인한 사실) SDK 54 앱은 Expo Go를 자동 설치해 주는 시뮬레이터나 dev build로 실행한다.
2. 루트에는 템플릿도 만드는 `AGENTS.md`, `.claude/`가 이미 있어서 `create-expo-app`이 "files that might be overwritten"으로 거부한다. 임시 폴더에서 만들면 충돌 없이 생성되고, 필요한 것만 골라 옮길 수 있다. `_tmp/.`처럼 `.`을 붙이면 숨김 파일(`.gitignore`, `.vscode`)까지 포함해 폴더 내용 전체가 복사된다. `_tmp/*`는 숨김 파일을 빠뜨린다.
3. Fast Refresh다. 구문 오류가 있는 모듈은 실행되지 않으므로 고쳐 저장하면 오류 화면이 사라지고, 함수 컴포넌트의 state는 기본적으로 유지된다(React Native 문서의 Fast Refresh 절). 그래서 전체 재시작이 필요 없다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `chore: create-expo-app SDK 54 템플릿으로 앱 생성`
- `chore: 앱 이름을 daily-log로 변경`

## 웹과 다른 점

브라우저 새로고침 대신 Metro 번들러가 JS를 보내고 Fast Refresh가 바뀐 모듈만 갱신하며, 화면은 브라우저가 아니라 Expo Go 같은 네이티브 앱 껍데기 안에서 그려진다.