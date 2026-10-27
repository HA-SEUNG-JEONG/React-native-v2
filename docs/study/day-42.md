# Day 42 · 12/23 (수) — 파일 시스템(expo-file-system)

> 전제: 기록 탭 글쓰기 화면은 `app/(tabs)/write.tsx`(Day 17), 기록 항목 타입은 `src/types/log.ts`의 `LogEntry`(Day 10, Day 12에서 `src/`로 이동), 기록 상태는 Day 22의 `useLogs()`/`useLogsDispatch()`다.

## 오늘의 목표

Day 40에서 고른 사진을 캐시 경로에서 앱 문서 폴더로 복사해 영구 저장하고, 기록에는 파일 이름만 저장해 앱을 다시 켜도 사진이 보이게 한다.

## 읽기(15분)

> 확인할 버전: `docs.expo.dev/versions/v54.0.0/...` 링크는 지금 열면 최신 문서(SDK 58)로 넘어간다. 이 카드는 SDK 54의 `expo-file-system ~19.0`을 기준으로 한다. SDK 54에는 두 API가 공존한다: 클래스 기반 새 API(`import { File, Directory, Paths } from 'expo-file-system'`)와 함수 기반 legacy API(`import * as FileSystem from 'expo-file-system/legacy'`). **오늘은 새 API만 쓴다.**

1. [FileSystem](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/)
   - Usage 절에서 `File`, `Directory`, `Paths` import 형태를 확인한다. `File`과 `Directory`는 존재하지 않는 경로도 가리킬 수 있고, 이미 있는 디렉터리 경로로 `File`을 만들 때처럼 클래스가 틀렸을 때만 생성자에서 에러가 난다는 문장을 찾는다.
   - "Writing and reading text files" 예제에서 `file.create()`가 파일이 이미 있으면 에러를 던질 수 있다는 주석, `file.write(...)`, `file.textSync()` 흐름을 확인한다.
   - "Moving and copying files" 예제에서 `file.copy(대상)`의 대상이 `File`일 때와 `file.move(Directory)`일 때 `uri`가 어떻게 바뀌는지 읽는다.
   - `Paths.cache`는 시스템이 저장 공간이 부족할 때 지울 수 있고 `Paths.document`는 지워지지 않는다는 설명을 API 절의 `Paths`에서 찾는다.
2. [FileSystem (legacy)](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem-legacy/)
   - 상단 안내에서 legacy 버전이 같은 패키지 안에 호환성 때문에 함께 들어 있다는 문장을 찾는다.
   - 예전 튜토리얼에 나오는 `documentDirectory`, `readAsStringAsync`, `writeAsStringAsync`, `getInfoAsync` 같은 이름이 여기 있고, 새 API에서는 각각 `Paths.document`, `file.text()`, `file.write()`, `file.info()`로 대응된다는 점을 확인한다.

## 예측(10분)

1. `console.log(Paths.cache.uri)`와 `console.log(Paths.document.uri)`를 찍으면 두 경로는 어떻게 다를까? Day 40에서 찍어 본 사진 `uri`는 둘 중 어느 쪽 아래에 있었나?

> 내 예측:

2. `new File(Paths.document, 'a.txt')`만 만들고 `create()`나 `write()`를 호출하지 않았을 때 `file.exists`는 무엇일까?

> 내 예측:

3. 사진 파일을 복사했다면 앱을 완전히 종료했다 켜도 `Paths.document` 아래 파일은 남아 있을까? 반면 Day 22의 `useReducer` 기록 상태(메모리)는 앱을 종료하면 어떻게 될까? 둘을 이어 붙이려면 무엇이 더 필요할까?

> 내 예측:

## 만들기(40분)

설치:

```bash
npx expo install expo-file-system
```

새로 만들/고칠 파일:

- `src/lib/photoStorage.ts` (새 파일. Day 12의 `src/` 규칙을 따른다). 함수 3개를 만든다.
  - `savePhoto(sourceUri)`: `Paths.document` 아래 `photos` 폴더를 `create({ intermediates: true, idempotent: true })`로 보장하고, 선택된 사진을 고유한 이름(예: 현재 시각 기반 + 확장자)의 `File`로 `copy`한 뒤 **파일 이름만** 반환한다.
  - `getPhotoUri(name)`: 파일 이름으로 `new File(Paths.document, 'photos', name)`을 만들어 `uri`를 돌려준다.
  - `deletePhoto(name)`: 파일이 `exists`일 때만 `delete()`한다.
- `src/types/log.ts`: `LogEntry`의 `photoUri`(Day 40)를 `photoName`(파일 이름)으로 바꾼다. 의미가 바뀌는 변경이므로 커밋을 따로 한다.
- `app/(tabs)/write.tsx`: 저장 핸들러에서 `savePhoto(선택된 uri)`를 호출하고 반환된 이름을 `photoName`에 담아 `dispatch`한다. 호출은 `try/catch`로 감싸 실패하면 `Alert`를 띄운다.
- 기록 목록을 그리는 컴포넌트(`src/components/LogItem.tsx`): `photoName`이 있으면 `getPhotoUri(photoName)`으로 `uri`를 만들어 Day 41의 `expo-image`에 넘긴다.
- 삭제: Day 22의 "삭제" 버튼 핸들러에서 `dispatch({ type: 'removed', ... })`와 함께 `deletePhoto(항목.photoName)`을 호출한다(reducer 안이 아니라 핸들러에서 호출한다. reducer는 순수해야 한다).
- 기록 목록 영속화(예측 3의 답): `src/storage/logs.ts`에 `loadLogs()`, `saveLogs(logs)`를 만든다. 저장 키는 `'daily-log:logs'`다. Day 35의 `src/storage/draft.ts`와 같은 방식(AsyncStorage에 JSON 문자열 저장, 값이 없으면 빈 배열, `JSON.parse` 실패 시 키를 지우고 빈 배열)이다. `LogsProvider`(`src/contexts/LogsContext.tsx`)가 마운트 때 `loadLogs()` 결과로 상태를 채우도록 `src/state/logsReducer.ts`의 reducer에 `{ type: 'loaded'; logs }` 액션을 하나 더하고, 상태가 바뀔 때 `saveLogs`를 호출한다. 단 불러오기가 끝나기 전에는 저장하지 않는다(Day 35의 `isLoaded` 보호 장치와 같은 이유다).
- (선택) `app/(tabs)/settings/index.tsx`: "저장된 사진 용량"을 표시한다. `Directory`의 `size`(숫자 또는 `null`)를 MB로 환산하고, 폴더가 없으면 0으로 표시한다.

핵심 호출 형태:

```ts
import { Directory, File, Paths } from 'expo-file-system';

const dir = new Directory(Paths.document, 'photos');
dir.create({ intermediates: true, idempotent: true });
const dest = new File(dir, `${Date.now()}.jpg`);
new File(sourceUri).copy(dest);
```

완료 기준:

- [ ] `expo-file-system`을 `npx expo install`로 설치했고 `import { File, Directory, Paths } from 'expo-file-system'`만 썼다(legacy import 없음).
- [ ] 저장하면 `photos` 폴더에 파일이 복사되고, `LogEntry`에는 파일 이름만 들어간다.
- [ ] 앱을 완전히 종료했다가 다시 열어도 기록 목록과 사진이 복원되어 보인다(`loadLogs`로 기록이, `Paths.document`의 파일로 사진이 돌아온다).
- [ ] 기록을 삭제하면 `photos` 폴더의 해당 파일도 사라진다(`console.log(new Directory(Paths.document, 'photos').list())`로 확인한다).
- [ ] 파일 작업이 있는 곳은 `try/catch`로 에러를 잡는다.

## 검증(10분)

- 사진을 3장 저장하고 `console.log(new Directory(Paths.document, 'photos').list())`로 파일이 3개인지 본다. 하나를 삭제해 2개가 되는지 본다.
- 앱을 완전 종료 후 재실행해 사진이 남는지 확인하고 예측 3과 비교한다.
- 예측 1: `Paths.cache.uri`와 `Paths.document.uri`를 `console.log`로 찍어 Day 40에서 본 사진 경로와 비교한다. 선택 직후의 임시 경로를 그대로 저장하면 왜 위험한지 한 줄로 적는다.
- 일부러 깨뜨리기: SDK 54에서 `import { readAsStringAsync } from 'expo-file-system'`으로 가져와 임의 파일에 호출해 본다. 터미널과 앱에 어떤 메시지가 나오는지 원문을 적고, `expo-file-system/legacy`에서 가져오는 형태와 새 API(`file.text()`) 중 어느 쪽이 이 카드의 방식인지 확인한 뒤 코드를 되돌린다.

## 이해 점검 질문

1. 사진을 `Paths.cache`에 두지 않고 `Paths.document`로 복사한 이유는 무엇인가?
2. 기록에 파일의 전체 `uri` 대신 파일 이름만 저장하는 설계는 어떤 문제를 피하려는 것인가?
3. SDK 54에서 `expo-file-system`에는 새 API와 legacy API가 공존한다. 예전 예제의 `readAsStringAsync`를 `import { readAsStringAsync } from 'expo-file-system'`으로 가져와 호출하면 어떻게 되고, 어떻게 고치는가?

<details>
<summary>정답</summary>

1. `Paths.cache`는 시스템이 저장 공간이 부족하면 지울 수 있는 폴더다. 사용자가 남긴 기록의 사진이 어느 날 사라지면 안 되므로, 지워지지 않는 `Paths.document`에 복사해 둔다. 이미지 피커가 돌려준 경로도 캐시 아래에 있다.
2. 전체 경로에는 앱 저장소 위치가 들어 있어 OS나 빌드가 바뀌면 달라질 수 있다(iOS는 앱 업데이트나 재설치 때 컨테이너 경로가 달라질 수 있다고 알려져 있으나, 이 점은 문서에서 확인 필요). 이름만 저장하면 그때그때 `Paths.document`에서 경로를 다시 조립하므로 저장된 데이터가 경로 변화에 영향을 받지 않는다.
3. SDK 54의 메인 export에 남아 있는 옛 함수 이름은 호출하면 경고를 출력하고 에러를 던진다. 메시지가 "legacy API는 `expo-file-system/legacy`에서 가져오거나 `File`·`Directory` 클래스로 옮기라"고 안내한다. 이 앱은 `file.text()`처럼 새 API로 옮기는 쪽을 택한다. 급하게 예전 코드를 살려야 할 때만 `expo-file-system/legacy`에서 가져온다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 선택한 사진을 문서 폴더에 복사해 영구 저장`
- `refactor: LogEntry의 사진 필드를 파일 이름 기반으로 변경`
- `feat: 기록 목록을 AsyncStorage에 저장하고 복원`

## 웹과 다른 점

웹에는 브라우저가 제공하는 저장소(localStorage, IndexedDB)만 있지만, 네이티브 앱은 앱별 샌드박스 안에 실제 파일 경로가 있고 `cache`는 OS가 비울 수 있는 폴더라 저장 위치를 직접 골라야 한다.
