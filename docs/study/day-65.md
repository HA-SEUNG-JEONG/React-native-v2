# Day 65 · 1/25 (월) — 디버깅 도구: DevTools, 네이티브 로그, 시뮬레이터

## 오늘의 목표

Daily Log에 버그 3개를 일부러 넣고, React Native DevTools(Console·Sources·Network·Components)와 LogBox, 시뮬레이터의 네이티브 로그로 각각의 원인을 찾아 고친다.

## 읽기(15분)

1. [Expo — Debugging tools](https://docs.expo.dev/debugging/tools/)
   - 터미널 단축키에서 `M`은 개발자 메뉴, `J`는 React Native DevTools(Hermes 앱)를 연다는 점을 확인한다.
   - DevTools 탭 구성에 Network가 "Expo 전용"으로 들어 있고, `expo-dev-client`가 설치되어 있거나 Expo Go를 쓸 때만 동작한다는 문장을 찾는다.
   - iOS 시뮬레이터에서 개발자 메뉴를 여는 단축키(`Cmd + D` 또는 `Ctrl + Cmd + Z`)를 찾는다.
2. [React Native — Debugging](https://reactnative.dev/docs/debugging)
   - LogBox 표를 읽고 Fatal Error, Console Error, Console Warning이 각각 어떻게 표시되는지 정리한다.
   - "DevTools가 열려 있으면 fatal error를 제외한 모든 에러가 LogBox에 표시되지 않는다"는 문장을 찾는다.
   - DevTools가 Hermes에서만 동작하고 Chrome 또는 Edge가 필요하다는 요구 사항은 RN 0.81 문서에 있던 문장이고 최신(0.88) 문서에서는 삭제됐다. 이 프로젝트(Hermes, RN 0.81.5)에서 `J`로 DevTools가 실제로 열리는지 확인하고, 안 열리면 그 조건을 막힌 점에 적는다.
3. [Expo — Debugging runtime issues](https://docs.expo.dev/debugging/runtime-issues/)
   - 네이티브 로그를 보는 방법을 찾는다. Android는 `adb logcat`, iOS는 macOS의 Console 앱에서 기기 또는 시뮬레이터를 고르고 Start streaming이다.
   - 프로덕션 오류를 다룰 때 가장 먼저 "로컬에서 재현"하고, 어려우면 `npx expo start --no-dev --minify`로 프로덕션 모드를 실행해 본다는 순서를 찾는다.

## 예측(10분)

1. 글 카드의 `onPress` 핸들러 안에서 `undefined`의 속성을 읽는 TypeError가 나면, 시뮬레이터 화면에는 LogBox가 어떤 모양으로 보일까? (전체 화면 / 빨간 배지 / 노란 배지 중에서)

   > 내 예측:

2. DevTools를 열어 둔 상태에서 `keyExtractor`가 같은 값을 반환해 생기는 중복 key 경고는 시뮬레이터의 LogBox에 보일까, DevTools Console에만 보일까?

   > 내 예측:

3. Expo Go로 실행 중일 때 DevTools의 Network 탭은 보일까? 그때 피드 요청이 404면 탭의 어느 칸에서 알 수 있을까?

   > 내 예측:

## 만들기(40분)

새 기능은 없다. 버그를 하나씩 넣고 도구로 찾은 뒤 바로 원복한다. 매 단계마다 "어느 도구의 어느 칸에서 원인을 봤는지"를 기록에 적는다.

**준비**
- 터미널에서 `npx expo start` 후 시뮬레이터에서 Daily Log를 연다. `j`로 DevTools를 열고 Console·Sources·Network·Components 탭이 모두 보이는지 확인한다.

**버그 1: 잘못된 URL (Network 탭)**
- Day 27에서 만든 API 클라이언트 모듈의 글 목록 경로를 오타로 바꾼다(예: `/posts`를 `/postz`로).
- 피드 탭의 에러 상태가 뜨면, DevTools Network 탭에서 해당 요청의 URL과 상태 코드를 찾아 적는다. 앱 쪽 에러 메시지만 보고 짐작한 원인과 Network 탭이 알려 준 원인이 같은지 비교한다.

**버그 2: 핸들러 안의 TypeError (Console, Sources)**
- 글 카드의 `onPress`(Day 16의 상세 이동 핸들러)에서 `post.author.name`처럼 존재하지 않는 값을 읽게 바꾼다.
- 카드를 눌러 에러를 만들고 LogBox 모양과 DevTools Console의 스택 트레이스를 확인한다.
- 같은 핸들러 첫 줄에 `debugger;`를 넣고 다시 누른다. Sources 탭에서 실행이 멈추면 Scope 패널에서 `post`의 실제 모양을 확인하고, Step 버튼으로 한 줄씩 진행해 본다. 확인이 끝나면 `debugger;`를 지운다.

**버그 3: 중복 key (경고와 Components)**
- 피드 `FlatList`의 `keyExtractor`가 항상 같은 값을 반환하게 바꾼다.
- 시뮬레이터 LogBox와 DevTools Console에서 경고가 어디에 어떻게 보이는지 기록한다.
- Components 탭의 "Select element" 버튼을 누르고 시뮬레이터에서 글 카드를 탭해 그 카드의 props를 확인한다.

**네이티브 로그 맛보기**
- macOS Console 앱을 열고 왼쪽 목록에서 실행 중인 iOS 시뮬레이터를 고른 뒤 Start streaming을 누른다. 검색창에 앱 이름을 넣어 걸러 낸 뒤, 시뮬레이터에서 앱을 껐다 켜며 찍히는 줄 3개를 옮겨 적는다. (Android 에뮬레이터가 있으면 `adb logcat`으로 같은 일을 해도 된다.)

**마무리**: `git diff`로 임시 변경이 모두 사라졌는지 확인한다.

완료 기준
- [ ] 버그 3개 각각에 대해 "원인을 확인한 도구와 칸"이 기록에 있다.
- [ ] Sources 탭에서 `debugger;`로 실행을 멈추고 Scope에서 변수 값을 본 적이 있다.
- [ ] 네이티브 로그에서 옮겨 적은 줄 3개가 기록에 있다.
- [ ] `git diff`가 비어 있다(임시 버그와 `debugger;`가 남아 있지 않다).

## 검증(10분)

- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- LogBox만 보고 알 수 있는 것과 DevTools를 열어야 알 수 있는 것을 각각 한 줄로 정리한다.

> 실제 결과 / 예측과 다른 지점:

**깨뜨려 보는 실험**: DevTools를 연 채로 터미널의 Metro(`npx expo start`)를 `Ctrl+C`로 종료한다. 어떤 대화상자가 뜨는지 적고, Metro를 다시 띄운 뒤 Reconnect로 연결이 복구되는지 확인한다.

## 이해 점검 질문

1. LogBox의 Fatal Error, Console Error, Console Warning은 각각 어떻게 표시되고, DevTools를 열어 두면 무엇이 달라지는가?
2. DevTools의 Network 탭이 동작하는 조건은 무엇이고, 이 조건이 Day 66에서 만들 development build와 어떤 관련이 있는가?
3. 프로덕션에서만 나는 오류를 만났을 때 가장 먼저 해야 할 일과, 그것이 어려울 때 확인할 것 두 가지는?

<details>
<summary>정답</summary>

1. Fatal Error(예: JS 구문 오류)는 위치와 함께 LogBox가 열리고 닫을 수 없다. 코드를 고치고 리로드하면 사라진다. Console Error는 빨간 배지와 개수로 표시되며 탭하면 상세를 볼 수 있다. Console Warning은 노란 배지 배너만 보이고 상세는 DevTools에서 봐야 한다. DevTools가 열려 있으면 fatal error를 제외한 에러·경고는 LogBox에 표시되지 않고 DevTools Console로 간다.
2. Expo 문서 기준으로 Network 탭은 `expo-dev-client`가 설치되어 있거나 Expo Go를 쓸 때만 동작한다. 그래서 Day 66에서 `expo-dev-client`를 넣은 development build를 만들어도 Network 탭을 계속 쓸 수 있다. `expo-dev-client`가 없는 빌드(예: production)에서는 이 탭에 기대하면 안 된다.
3. 먼저 로컬에서 재현한다. 재현되면 개발 오류와 같은 방식으로 찾는다. 로컬 재현이 어려우면 플랫폼별 크래시 리포트(Google Play Console, Xcode Crashes Organizer), 네이티브 로그(`adb logcat`, Console 앱), `npx expo start --no-dev --minify`로 프로덕션 모드 실행, Sentry·BugSnag 같은 에러 리포팅 서비스 중에서 확인한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `docs: 디버깅 도구별 원인 확인 방법 기록`

## 웹과 다른 점

브라우저 개발자 도구와 달리 앱 화면 위에 LogBox가 별도로 뜨고, 네이티브 계층(Xcode·Android Studio·Console 앱)의 로그는 DevTools 밖에 있다. Network 탭도 모든 환경에서 쓸 수 있는 것이 아니라 Expo Go 또는 `expo-dev-client`가 있어야 한다.
