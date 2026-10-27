# Day 44 · 12/25 (금) — 버퍼 + 9주차 점검

## 오늘의 목표

이번 주(Day 40~43)에서 가장 헷갈린 개념을 정답을 가리고 풀어 보고, 밀린 Day를 흡수한다.

## 주간 점검 퀴즈(30분)

정답을 가리고 먼저 답을 쓴다. 답을 이 카드에 먼저 적고, 채점 결과는 `docs/rules.md`의 규칙대로 `docs/quiz/2026-12-25-day-44.md`에 `AGENTS.md`의 상세 구조(문항별 내 답, 문제점, 정답, 암기 고리, 근거 절 + 종합 약점 패턴 + 재복습 일정)로 기록한다.

1. (Day 40) `launchImageLibraryAsync`는 권한 요청 없이 호출해도 앨범이 열리는데 `launchCameraAsync`는 권한이 필요하다. 이 차이가 생기는 이유를 설명하고, 앨범 선택을 취소했을 때 `result`가 어떤 모양인지 쓰시오.

> 내 답:

2. (Day 40) 사용자가 카메라 권한을 거부해서 `canAskAgain`이 `false`가 되었다. 앱이 해야 할 일 두 가지를 쓰시오. 이때 `requestCameraPermissionsAsync()`를 다시 호출하면 안 되는 이유도 쓰시오.

> 내 답:

3. (Day 41) `expo-image`의 `cachePolicy` 기본값은 무엇이고, `FlatList` 안의 `expo-image`에 `recyclingKey`를 주는 이유는 무엇인가? `contentFit`은 웹의 어떤 CSS 속성과 대응하는가?

> 내 답:

4. (Day 42) 선택한 사진을 `Paths.cache`에 그대로 두지 않고 `Paths.document`로 복사해야 하는 이유, 그리고 기록 데이터에는 전체 경로 대신 파일 이름만 저장한 이유를 쓰시오.

> 내 답:

5. (Day 42·43) SDK 54에서 `expo-file-system`의 새 API와 legacy API를 가져오는 import 문을 각각 쓰고, `Sharing.shareAsync(url, options)`의 `url`에는 어떤 종류의 값을 넘기는지, `mimeType`과 `UTI`는 각각 어느 플랫폼용인지 쓰시오.

> 내 답:

<details>
<summary>정답</summary>

1. 앨범은 OS가 제공하는 선택 화면이 사진을 골라 앱에 넘겨 주므로 앱이 앨범 전체에 접근할 필요가 없다. 카메라는 앱이 카메라 하드웨어를 직접 쓰므로 권한이 필요하다. 취소하면 `{ canceled: true, assets: null }`이므로 `canceled`를 먼저 확인하고 `assets[0]`을 읽어야 한다. (예외: iOS에서 비디오 선택 시 권한 팝업이 뜰 수 있다.)
2. 이유를 설명하는 `Alert`을 띄우고, `Linking.openSettings()`로 설정 앱을 열어 사용자가 직접 권한을 켜게 한다. `canAskAgain`이 `false`이면 OS가 시스템 팝업을 다시 띄우지 않고 거부 결과를 바로 돌려주므로 호출해도 아무 일도 일어나지 않는다.
3. 기본값은 `'disk'`다. `FlatList`는 화면 밖 행의 뷰를 재활용하므로 새 이미지가 로드되기 전까지 이전 글의 이미지가 잠깐 보일 수 있는데, `recyclingKey`가 바뀌면 이미지 뷰를 비우거나 `placeholder`로 되돌려 이를 막는다. `contentFit`은 CSS `object-fit`에 대응한다.
4. `Paths.cache`는 시스템이 저장 공간이 부족하면 지울 수 있고, 이미지 피커가 돌려준 임시 경로도 그 아래에 있다. 기록 사진이 사라지면 안 되므로 지워지지 않는 `Paths.document`로 복사한다. 파일 이름만 저장하면 매번 `Paths.document`에서 경로를 조립하므로 저장 위치 경로가 바뀌어도 데이터가 영향을 받지 않는다.
5. 새 API: `import { File, Directory, Paths } from 'expo-file-system'`. legacy: `import * as FileSystem from 'expo-file-system/legacy'`. `url`에는 로컬 파일 URL(예: `file.uri`)을 넘긴다. `mimeType`은 Android·iOS, `UTI`는 iOS 전용이며 iOS에서는 `UTI`가 확장자로 매핑되면 `mimeType`보다 우선한다.

</details>

채점 후 틀린 문항은 해당 Day 카드의 이해 점검 질문과 근거 읽기 절을 다시 읽는다.

## 구술 1주제(15분)

주제: "카메라로 찍은 사진이 앱을 껐다 켜도 기록에 남아 있기까지 일어나는 일"을 소리 내어 3분 안에 설명한다. 아래 핵심어를 모두 포함한다.

- `canAskAgain`(권한 거부와 설정 앱 안내)
- `Paths.cache`와 `Paths.document`
- `copy`와 파일 이름만 저장
- `expo-image`의 `cachePolicy`
- `shareAsync`와 로컬 파일 URL

설명하다 막힌 지점을 아래에 적는다.

> 막힌 지점:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문 중 이번 주(Day 40~43)에 적은 것부터 처리한다. 각 질문마다 아래 순서를 지킨다.

1. 에러 메시지 원문으로 검색한다.
2. 공식 문서의 해당 절을 읽는다.
3. 해결하면 질문 옆에 답을 한 줄로 적고, 못 풀면 다음 주 버퍼로 넘긴다고 표시한다.

- [ ] 이번 주 질문 전부를 열어 봤다.
- [ ] 해결한 질문에 답을 적었다.
- [ ] 못 푼 질문은 이월 표시를 했다.

## 밀린 Day 흡수

달력이 아니라 Day 번호가 기준이다. 밀린 Day가 있다면 남는 시간에 한다.

- [ ] Day 40(권한 모델과 expo-image-picker)
- [ ] Day 41(expo-image)
- [ ] Day 42(expo-file-system)
- [ ] Day 43(expo-sharing)

## 기록(5분)

배운 것 3줄:

막힌 점:
