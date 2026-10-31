# Day 43 · 12/24 (목) — 공유(expo-sharing)와 파일 내보내기

> 전제: 기록 탭 글쓰기 화면은 `app/(tabs)/write.tsx`(Day 17), 기록 항목 타입은 `src/types/log.ts`의 `LogEntry`(Day 10, Day 12에서 `src/`로 이동), 기록 상태는 Day 22의 `useLogs()`/`useLogsDispatch()`다.

## 오늘의 목표

설정 탭에서 기록 전체를 JSON 파일로 만들어 공유 시트로 내보내고, 기록 항목의 사진도 시트로 공유한다.

## 읽기(15분)

> 확인할 버전: `docs.expo.dev/versions/latest/...` 링크는 최신 문서(SDK 58)를 보여 준다. SDK 54에 고정되는 패키지는 `expo-sharing ~14.0`이다. 오늘 쓰는 `File`, `Paths`는 Day 42에서 쓴 `expo-file-system ~19.0`의 새 API다.

1. [Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
   - `Sharing.shareAsync(url, options)`의 `url`이 "로컬 파일 URL"이라는 설명을 찾는다. 문자열을 바로 넘기는 API가 아니다.
   - `options`의 세 가지를 구분해서 적는다: `mimeType`(Android·iOS), `dialogTitle`(Android·웹), `UTI`(iOS 전용이고, iOS가 파일 확장자로 매핑할 수 있으면 `mimeType`보다 우선한다).
   - `Sharing.isAvailableAsync()`가 `Promise<boolean>`이고, 웹은 Web Share API가 제한적이라 먼저 확인하라는 안내를 확인한다.
   - 상단 안내에서 이 라이브러리가 "내 앱에서 다른 앱으로" 보내는 용도만 지원하고, 다른 앱의 공유를 받는 기능은 없다는 점을 확인한다.
2. [Share (React Native)](https://reactnative.dev/docs/share)
   - RN 내장 `Share.share({ message })`가 텍스트·URL을 공유하는 API라는 점과 `expo-sharing`이 파일을 공유한다는 차이를 문장으로 적는다.

## 예측(10분)

1. iOS 시뮬레이터에서 JSON 파일을 `shareAsync`로 열면 공유 시트가 뜰까? 시트에 어떤 항목(예: 파일에 저장)이 보일 것 같은가?

> 내 예측:

2. 사용자가 시트를 아무것도 고르지 않고 닫으면 `await Sharing.shareAsync(...)`는 resolve될까, 에러를 던질까?

> 내 예측:

3. 존재하지 않는 파일의 `uri`를 `shareAsync`에 넘기면 어떻게 될까?

> 내 예측:

## 만들기(40분)

설치:

```bash
npx expo install expo-sharing
```

새로 만들/고칠 파일:

- `src/lib/exportLogs.ts` (새 파일): `exportLogsAsJson(entries)` 함수를 만든다. `entries`는 설정 탭에서 `useLogs()`로 읽은 기록 목록(Day 22)이다.
  1. `Paths.cache` 아래 `daily-log-날짜.json` `File`을 `create({ overwrite: true })`로 만들고 `write(JSON.stringify(entries, null, 2))`로 쓴다. 내보내기용 임시본이라 지워져도 되므로 `cache`에 둔다.
  2. `Sharing.isAvailableAsync()`가 `false`이면 사용자에게 알리고 끝낸다.
  3. `Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Daily Log 내보내기' })`를 호출한다.
- JSON에는 `LogEntry`의 필드를 넣되 사진은 Day 42의 `photoName`(파일 이름)만 포함한다. 사진 파일 자체는 JSON에 넣지 않는다.
- `app/(tabs)/settings/index.tsx`: "기록 내보내기" 버튼을 추가한다. 실행 중에는 버튼을 비활성화하고 로딩 표시를 보여 준다(Day 38의 제출 중 상태와 같은 패턴). 기록이 0건이면 버튼을 비활성화하고 이유를 한 줄로 보여 준다.
- `src/components/LogItem.tsx`(Day 42에서 사진을 그리는 기록 목록 항목): 사진이 있는 항목에 "사진 공유" 버튼을 추가해 Day 42의 `getPhotoUri(photoName)`을 `shareAsync`에 넘긴다. 사진 형식이 JPEG일 때의 `mimeType`은 `'image/jpeg'`, `UTI`는 `'public.jpeg'`다.
- 두 호출 모두 `try/catch`로 감싸 실패하면 `Alert`로 알린다.

핵심 호출 형태:

```ts
import * as Sharing from 'expo-sharing';

if (await Sharing.isAvailableAsync()) {
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
}
```

완료 기준:

- [ ] `npx expo install expo-sharing`으로 설치했다.
- [ ] 설정 탭 버튼을 누르면 JSON 파일이 만들어지고 공유 시트가 뜬다.
- [ ] 시트에서 "파일에 저장"(iOS) 또는 다른 앱(Android)으로 보낸 JSON을 열어 기록 내용이 맞는지 확인했다.
- [ ] 시트를 그냥 닫아도 앱이 에러 없이 정상으로 돌아온다.
- [ ] 기록이 0건이면 내보내기 버튼이 막혀 있다.
- [ ] 사진이 있는 항목에서 "사진 공유"가 동작한다.

## 검증(10분)

- 내보낸 JSON 파일을 열어 `photoName`만 들어 있고 사진 데이터는 없는지 확인한다.
- 시트를 닫아 보고 예측 2와 비교한다. `await` 뒤의 코드가 실행되는지 `console.log`로 확인한다.
- 일부러 깨뜨리기: 존재하지 않는 `file://` 경로를 `shareAsync`에 넘긴다. 에러 메시지 원문을 적고 예측 3과 비교한 뒤 되돌린다.
- iOS와 Android 중 가능한 쪽에서 시트 모양이 어떻게 다른지 한 줄로 적는다. 환경이 한쪽뿐이면 한쪽만 적는다.

## 이해 점검 질문

1. JSON 문자열을 바로 공유하지 않고 먼저 파일로 쓰는 이유는 무엇인가?
2. `mimeType`과 `UTI`는 각각 어느 플랫폼에서 쓰이고, iOS에서 둘 다 주면 어느 쪽이 우선하는가?
3. `Sharing.isAvailableAsync()`를 먼저 호출해야 하는 환경은 어디이고 왜인가?

<details>
<summary>정답</summary>

1. `shareAsync`의 `url`은 로컬 파일 URL을 받는다. 파일이 있어야 공유 시트가 그 파일을 받는 앱에 넘길 수 있다. 문자열만 보내고 싶으면 RN 내장 `Share.share({ message })`를 쓴다.
2. `mimeType`은 Android와 iOS에서, `UTI`는 iOS에서만 쓰인다. iOS가 `UTI`를 파일 확장자로 매핑할 수 있으면 `UTI`가 우선하고, 매핑할 수 없을 때 무시된다.
3. 웹이다. 웹의 공유는 브라우저 Web Share API 위에 만들어졌고 지원 범위가 좁으며 HTTPS가 필요하다. 지원하지 않는 환경에서 `shareAsync`를 부르면 실패할 수 있으므로 먼저 확인한다. 이 앱의 대상인 iOS·Android에서는 보통 `true`지만, 같은 코드를 웹에서 열 가능성에 대비한 안전장치이기도 하다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 설정 탭에 기록 JSON 내보내기 추가`
- `feat: 기록 항목 사진 공유 버튼 추가`

## 웹과 다른 점

웹에서는 `<a download>`로 파일을 내려받게 하지만, 네이티브는 OS 공유 시트로 파일을 다른 앱에 넘기고 시트 항목은 기기마다 다르다.
