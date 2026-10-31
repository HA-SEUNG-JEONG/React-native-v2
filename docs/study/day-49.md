# Day 49 · 1/1 (금) — 버퍼 + 10주차 점검

## 오늘의 목표

이번 주(Day 45~48)에서 가장 헷갈린 개념을 정답을 가리고 풀어 보고, 밀린 Day를 흡수한다. 건너뛴 Day(46, 48)가 있다면 읽기만이라도 여기서 채운다.

## 주간 점검 퀴즈(30분)

정답을 가리고 먼저 답을 쓴다. 답을 이 카드에 먼저 적고, 채점 결과는 `docs/rules.md`의 규칙대로 `docs/quiz/2027-01-01-day-49.md`에 `AGENTS.md`의 상세 구조(문항별 내 답, 문제점, 정답, 암기 고리, 근거 절 + 종합 약점 패턴 + 재복습 일정)로 기록한다.

1. (Day 45) `requestForegroundPermissionsAsync()`가 `status: 'granted'`를 돌려줘도 설정 탭에서 `ios.scope`나 `android.accuracy`를 함께 보여 주는 이유를 쓰시오. 그리고 `getCurrentPositionAsync`와 `getLastKnownPositionAsync`를 언제 각각 쓰는지 쓰시오.

> 내 답:

2. (Day 45) 사용자가 설정 앱에서 위치 권한을 끄고 돌아왔는데 설정 탭의 권한 표시가 그대로다. 원인과 해결 방법을 쓰시오.

> 내 답:

3. (Day 46) 지도 코드가 Expo Go에서는 추가 설정 없이 동작하는데 스토어용 Android 바이너리에서는 무엇을 추가로 해야 하는가? `MapView`가 화면에 보이지 않는 대표적인 원인 한 가지도 쓰시오.

> 내 답:

4. (Day 47) 앱이 포그라운드일 때 로컬 알림 배너를 보이게 하려면 무엇을 어디에 설정해야 하는가? `DAILY` 트리거로 21시 알림을 예약하는 호출 형태와, Android 13 이상에서 권한 요청 전에 해야 할 일을 쓰시오.

> 내 답:

5. (Day 48) 알림을 탭해 앱 안의 특정 화면으로 이동시키려면 어떤 두 API를 함께 써야 하는가? 푸시 토큰이 시뮬레이터에서 발급되지 않는 이유와, 알림 `data.url`을 `router.push`에 넘기기 전에 해야 할 일을 쓰시오.

> 내 답:

<details>
<summary>정답</summary>

1. `granted`여도 접근 범위가 다르다. iOS는 `whenInUse`와 `always`가 있고(`Allow Once`도 `whenInUse`로 보여 구분되지 않는다), Android는 정밀(`fine`)과 대략(`coarse`) 위치를 구분한다. `getCurrentPositionAsync`는 새로 측정하므로 정확하지만 몇 초 걸릴 수 있어 "지금 위치를 기록에 붙일 때" 쓰고, `getLastKnownPositionAsync`는 마지막 값을 바로 돌려주므로 빠르지만 오래됐거나 `null`일 수 있어 빠른 초기 표시용으로 쓴다.
2. 권한 상태는 한 번 조회해 `state`에 둔 값일 뿐이라 설정 앱에서 바뀐 것을 React가 알지 못한다. `AppState`가 `active`로 바뀔 때 권한을 다시 조회(`useForegroundPermissions`가 돌려주는 `get`)해 상태를 갱신하고, 구독은 cleanup에서 해제한다.
3. 스토어용 Android 바이너리는 Google Cloud에서 받은 API 키를 `app.json`의 `android.config.googleMaps.apiKey`에 넣고(최신 SDK 58 문서는 `plugins`의 `react-native-maps` 설정에 `androidGoogleMapsApiKey`를 넣는 방식으로 안내한다. SDK 54에서는 앞의 방식이다) `provider={PROVIDER_GOOGLE}`을 지정한 뒤 앱을 다시 빌드해야 한다(SDK 54 문서). 지도가 안 보이는 대표 원인은 `MapView`나 부모에 폭·높이가 정해지지 않아 크기가 0이 되는 것이다.
4. 앱 최상위(`app/_layout.tsx`의 컴포넌트 밖)에서 `Notifications.setNotificationHandler`를 호출하고 `shouldShowBanner`, `shouldShowList`를 `true`로 반환한다(`shouldShowAlert`는 deprecated). 예약은 `scheduleNotificationAsync({ content, trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 } })`다. Android 13 이상은 알림 채널이 하나 이상 만들어져야 권한 프롬프트가 뜨므로 `setNotificationChannelAsync`를 먼저 호출한다.
5. 앱 시작 시의 응답을 얻는 `getLastNotificationResponse()`와 실행 중 탭을 받는 `addNotificationResponseReceivedListener`를 함께 쓴다. 시뮬레이터·에뮬레이터는 푸시 서비스에 등록할 수 있는 실기기가 아니라서 지원되지 않는다. `data.url`은 보낸 쪽이 채우는 값이므로 문자열인지, 허용된 경로 형태(예: `/`로 시작)인지 검증한 뒤에만 이동한다.

</details>

채점 후 틀린 문항은 해당 Day 카드의 이해 점검 질문과 근거 읽기 절을 다시 읽는다.

## 구술 1주제(15분)

주제: "기록 작성 화면에서 현재 위치를 붙이고, 매일 알림을 받고, 알림을 탭하면 기록 탭으로 돌아오기까지"를 소리 내어 3분 안에 설명한다. 아래 핵심어를 모두 포함한다.

- `requestForegroundPermissionsAsync`와 `canAskAgain`
- `getCurrentPositionAsync`와 `reverseGeocodeAsync`
- `setNotificationHandler`
- `DAILY` 트리거
- `getLastNotificationResponse`와 `data.url` 검증

설명하다 막힌 지점을 아래에 적는다.

> 막힌 지점:

## 질문 목록 처리(15분)

`docs/questions.md`에 쌓인 질문 중 이번 주(Day 45~48)에 적은 것부터 처리한다. 각 질문마다 아래 순서를 지킨다.

1. 에러 메시지 원문으로 검색한다.
2. 공식 문서의 해당 절을 읽는다.
3. 해결하면 질문 옆에 답을 한 줄로 적고, 못 풀면 다음 주 버퍼로 넘긴다고 표시한다.

- [ ] 이번 주 질문 전부를 열어 봤다.
- [ ] 해결한 질문에 답을 적었다.
- [ ] 못 푼 질문은 이월 표시를 했다.

## 밀린 Day 흡수

달력이 아니라 Day 번호가 기준이다. 밀린 Day가 있다면 남는 시간에 한다. Day 46과 Day 48은 건너뛸 수 있는 Day이므로, 건너뛰었다면 카드의 읽기 절만 읽고 아래에 체크한다.

- [ ] Day 45(expo-location)
- [ ] Day 46(react-native-maps) 만들기 또는 읽기만
- [ ] Day 47(로컬 알림)
- [ ] Day 48(푸시 토큰과 알림 탭 처리) 만들기 또는 읽기만

## 기록(5분)

배운 것 3줄:

막힌 점:
