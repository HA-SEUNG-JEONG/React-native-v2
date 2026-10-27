# Daily Log로 배우는 React Native — 69 Day 커리큘럼

## 목표

빈 Expo 앱에서 시작해 14주(약 3개월) 동안 **Daily Log**(일상 기록 앱)를 직접 쌓아 올리며 React Native를 처음부터 다시 익힌다. 기존 코드는 보지 않는다. 옛 문서와 코드는 git 태그 `archive/pre-reset`에 남아 있다.

- 기술 기준: Expo SDK 54, React Native 0.81, React 19.1, TypeScript, expo-router 6.
- 공식 문서 기준: `https://docs.expo.dev/versions/v54.0.0/`, `https://reactnative.dev/docs/0.81/getting-started`. 코드를 쓰기 전에 해당 Day의 문서를 먼저 읽는다.
- 일정: Day 1 = 2026-10-27(화), Day 69 = 2027-01-29(금). **월~금 주 5일**, 금요일은 버퍼다. 첫 주만 화~금 4일이다. 운영 방식은 `docs/rules.md`를 따른다.
- 구성: 학습 Day 55개 + 버퍼 Day 14개. 학습 Day 하나는 90분이다.

## 만들 앱: Daily Log

3탭 구조다.

| 탭 | 내용 | 주로 다루는 주 |
|---|---|---|
| 피드 | 외부 공개 API(JSONPlaceholder 등)에서 글 목록을 읽고 상세로 이동한다 | 2, 4, 6, 7 |
| 기록 | 글을 쓰고 사진·위치를 붙인다 | 2, 8, 9, 10 |
| 설정 | 모의 로그인·로그아웃, 다크 모드, 알림 | 5, 8, 11 |

- 인증은 모의 로그인이다. 서버 없이 토큰 문자열을 저장·검증하는 흐름만 연습한다.
- 한 번에 완성하지 않는다. 매일 Daily Log에 기능 하나를 얹고 커밋한다.

## 14주 일정

금요일(Day 4·9·14·…·69)은 버퍼다. 각 Day의 카드는 `docs/study/day-NN.md`다.

| 주 | Day | 날짜 | 주제 |
|---|---|---|---|
| 1. 환경·기초 UI | 1 | 10/27 (화) | 환경, create-expo-app으로 루트에 앱 생성, Expo Go와 dev build 차이 |
|  | 2 | 10/28 (수) | 코어 컴포넌트(View, Text, Image, ScrollView, Pressable). 웹과 다른 점 |
|  | 3 | 10/29 (목) | StyleSheet, Flexbox(기본 column), Platform 분기 |
|  | 4 | 10/30 (금) | 버퍼 + 1주차 점검 |
| 2. 상태·입력·리스트 | 5 | 11/2 (월) | useState, 이벤트, TextInput |
|  | 6 | 11/3 (화) | KeyboardAvoidingView, Keyboard API, 플랫폼별 키보드 차이 |
|  | 7 | 11/4 (수) | FlatList 기본: data·renderItem·keyExtractor |
|  | 8 | 11/5 (목) | SectionList, RefreshControl, 리스트 성능 기본 |
|  | 9 | 11/6 (금) | 버퍼 + 2주차 점검 |
| 3. TypeScript·구조 | 10 | 11/9 (월) | TypeScript props와 이벤트 타입 |
|  | 11 | 11/10 (화) | 컴포넌트 분리: children, composition |
|  | 12 | 11/11 (수) | 폴더 구조, path alias, expo lint·prettier |
|  | 13 | 11/12 (목) | 커스텀 훅과 useEffect 기초, cleanup |
|  | 14 | 11/13 (금) | 버퍼 + 3주차 점검 |
| 4. 네비게이션 1 | 15 | 11/16 (월) | expo-router 파일 기반 라우팅 |
|  | 16 | 11/17 (화) | Stack, 동적 라우트, 파라미터 |
|  | 17 | 11/18 (수) | Tabs, SafeArea |
|  | 18 | 11/19 (목) | Modal, 헤더 설정, 딥링크 scheme 기본 |
|  | 19 | 11/20 (금) | 버퍼 + 4주차 점검 |
| 5. 네비게이션 2·상태 관리 | 20 | 11/23 (월) | router API(push·replace·back), 중첩 라우트, not-found, useFocusEffect |
|  | 21 | 11/24 (화) | Context로 전역 상태 공유 |
|  | 22 | 11/25 (수) | useReducer + Context 상태 관리 |
|  | 23 | 11/26 (목) | 인증 흐름과 보호된 라우트(모의 로그인) |
|  | 24 | 11/27 (금) | 버퍼 + 5주차 점검 |
| 6. 데이터 1 | 25 | 11/30 (월) | fetch + useEffect, 로딩·에러 상태 |
|  | 26 | 12/1 (화) | 요청 취소(AbortController)와 경쟁 상태 |
|  | 27 | 12/2 (수) | API 클라이언트 모듈과 에러 모델 |
|  | 28 | 12/3 (목) | TanStack Query: useQuery |
|  | 29 | 12/4 (금) | 버퍼 + 6주차 점검 |
| 7. 데이터 2 | 30 | 12/7 (월) | useMutation과 캐시 무효화 |
|  | 31 | 12/8 (화) | 낙관적 업데이트와 롤백 |
|  | 32 | 12/9 (수) | useInfiniteQuery + FlatList 무한 스크롤 |
|  | 33 | 12/10 (목) | 쿼리 키 설계, staleTime·gcTime, focusManager·onlineManager의 RN 연동 |
|  | 34 | 12/11 (금) | 버퍼 + 7주차 점검 |
| 8. 저장·폼 | 35 | 12/14 (월) | AsyncStorage |
|  | 36 | 12/15 (화) | SecureStore와 토큰 저장 |
|  | 37 | 12/16 (수) | react-hook-form + zod 폼 검증 |
|  | 38 | 12/17 (목) | 폼 UX: 포커스 이동, 에러 표시, 제출 중 상태 |
|  | 39 | 12/18 (금) | 버퍼 + 8주차 점검 |
| 9. 네이티브 기능 1 | 40 | 12/21 (월) | 권한 모델과 expo-image-picker |
|  | 41 | 12/22 (화) | expo-image: 캐시·placeholder·contentFit |
|  | 42 | 12/23 (수) | 파일 시스템(expo-file-system) |
|  | 43 | 12/24 (목) | 공유(expo-sharing)와 파일 내보내기 |
|  | 44 | 12/25 (금) | 버퍼 + 9주차 점검 |
| 10. 네이티브 기능 2 | 45 | 12/28 (월) | expo-location: 현재 위치와 권한 상태 |
|  | 46 | 12/29 (화) | react-native-maps와 dev build *(건너뛰기 가능)* |
|  | 47 | 12/30 (수) | expo-notifications: 로컬 알림 |
|  | 48 | 12/31 (목) | 푸시 토큰과 알림 탭 처리 *(건너뛰기 가능)* |
|  | 49 | 1/1 (금) | 버퍼 + 10주차 점검 |
| 11. 애니메이션·테마 | 50 | 1/4 (월) | Gesture Handler 기초 |
|  | 51 | 1/5 (화) | Reanimated 기초: shared value, animated style |
|  | 52 | 1/6 (수) | 제스처 + Reanimated 결합(스와이프 삭제) *(건너뛰기 가능)* |
|  | 53 | 1/7 (목) | 다크 모드와 테마 토큰 |
|  | 54 | 1/8 (금) | 버퍼 + 11주차 점검 |
| 12. 접근성·견고성 | 55 | 1/11 (월) | 접근성: accessibilityLabel·role, 스크린 리더 확인 |
|  | 56 | 1/12 (화) | 반응형: useWindowDimensions, 키보드·SafeArea 다듬기 |
|  | 57 | 1/13 (수) | Error Boundary |
|  | 58 | 1/14 (목) | NetInfo와 오프라인 처리 |
|  | 59 | 1/15 (금) | 버퍼 + 12주차 점검 |
| 13. 테스트·성능 | 60 | 1/18 (월) | jest-expo + Testing Library 기초 |
|  | 61 | 1/19 (화) | 컴포넌트·훅 테스트: mock, 비동기 |
|  | 62 | 1/20 (수) | 리렌더 측정과 React Compiler |
|  | 63 | 1/21 (목) | FlatList 튜닝과 시작 성능 *(건너뛰기 가능)* |
|  | 64 | 1/22 (금) | 버퍼 + 13주차 점검 |
| 14. 디버깅·출시 | 65 | 1/25 (월) | 디버깅 도구: DevTools, 네이티브 로그, 시뮬레이터 |
|  | 66 | 1/26 (화) | EAS Build |
|  | 67 | 1/27 (수) | app config, 환경 변수, 아이콘·스플래시 |
|  | 68 | 1/28 (목) | EAS Update(OTA)와 스토어 제출 준비 *(건너뛰기 가능)* |
|  | 69 | 1/29 (금) | 버퍼 + 최종 구술·회고 |

## 의존성 도입 시점

라이브러리는 해당 Day에 처음 설치한다. 미리 깔아 두지 않는다. 단, "템플릿 기본 포함" 패키지는 Day 1에서 앱을 만들 때 이미 들어 있다. 해당 Day는 그 패키지를 **처음 쓰는 날**이다.

| 패키지 | 처음 쓰는 Day | 비고 |
|---|---|---|
| prettier, eslint-config-prettier, eslint-plugin-prettier | 12 | 설치 필요. `npx expo install ... --dev` |
| expo-router, react-native-screens, react-native-safe-area-context | 15 | 템플릿 기본 포함 |
| expo-linking(18), expo-constants(48), @expo/vector-icons(51), @react-navigation/native·expo-status-bar·expo-system-ui(53) | 표의 괄호 Day | 템플릿 기본 포함. 설치하지 않고 `package.json`에서 확인만 한다 |
| @tanstack/react-query | 28 | 설치 필요. Expo 패키지가 아니므로 `npm install`. v5 문법(`useQuery({ queryKey, queryFn })`, `gcTime`) |
| @react-native-async-storage/async-storage | 35 | 설치 필요. `npx expo install`이 SDK 54 고정 버전 2.2.0을 깐다 |
| expo-secure-store | 36 | 설치 필요 |
| react-hook-form, zod, @hookform/resolvers | 37 | 설치 필요. `npm install react-hook-form zod @hookform/resolvers@5`. zod는 4 계열(`{ error: '...' }`, `z.email()` 문법). resolvers는 5 계열로 고정한다(6.0.0은 2026-10-19 출시라 카드가 5 기준이다. 5·6 모두 zod 4 지원, 2026-10-27 npm 확인) |
| expo-image-picker | 40 | 설치 필요 |
| expo-image | 41 | 템플릿 기본 포함 |
| expo-file-system | 42 | 설치 필요 |
| expo-sharing | 43 | 설치 필요 |
| expo-location | 45 | 설치 필요 |
| react-native-maps | 46 | 설치 필요(SDK 54 고정 1.20.1). SDK 54 문서 기준 개발 중에는 Expo Go에서 추가 설정 없이 동작한다. 스토어용 바이너리는 Android Google Maps API 키(`android.config.googleMaps.apiKey`)와 재빌드가 필요하다 |
| expo-notifications, expo-device | 47 | 설치 필요. 푸시 토큰은 실기기 필요 |
| react-native-gesture-handler, react-native-reanimated, react-native-worklets | 50 | 템플릿 기본 포함 |
| @react-native-community/netinfo | 58 | 설치 필요. `npx expo install`이 11.4.1을 고정한다. Day 33은 NetInfo 없이 `onlineManager.setOnline`만 쓴다 |
| jest-expo, @testing-library/react-native | 60 | 설치 필요. `npx expo install jest-expo jest @types/jest --dev`, 이어서 `npm install --save-dev @testing-library/react-native test-renderer@1.1`. RNTL 14는 Node 22.13 이상이 필요하고, `test-renderer` 1.1 라인이 React 19.1용(`react-reconciler` 0.32)이다(2026-10-27 npm 확인) |
| React Compiler (`experiments.reactCompiler`) | 62 | 템플릿 기본 켜짐. 켜고 끈 차이를 측정한다 |
| eas-cli | 66 | `npx eas-cli`로 실행 |

Expo 패키지는 `npx expo install <패키지>`로 설치한다. SDK 54에 맞는 버전이 자동으로 고정된다.

## 환경상 주의

- `create-expo-app@latest`의 기본 템플릿은 최신 SDK(58)를 만든다. SDK 54로 고정하려면 `--template default@sdk-54`를 붙인다. 이 템플릿은 expo 54, react-native 0.81.5, react 19.1.0, expo-router 6을 설치한다(2026-10-27 확인).
- 루트에 `AGENTS.md`, `CLAUDE.md`, `.claude/`, `docs/`가 있고, 템플릿도 `AGENTS.md`와 `.claude/`를 만든다. 그래서 루트에서 바로 `create-expo-app`을 실행하면 "files that might be overwritten"으로 거부된다(확인함). Day 1은 임시 폴더에 생성한 뒤 파일을 옮기는 절차를 쓴다.
- iOS 실기기의 App Store판 Expo Go는 최신 SDK만 지원한다. SDK 54 앱은 시뮬레이터(Expo Go 자동 설치) 또는 dev build로 실행한다. Day 1에서 실행 경로를 확정한다.
- 템플릿에는 예제 화면이 들어 있다. Day 1~2에서 `npm run reset-project`로 비운 뒤 직접 쌓는다.

## 앱 구조 규약

69개 카드가 쓰는 파일 경로·이름·절 제목의 기준이다. 카드와 이 절이 다르면 이 절이 맞고, 카드는 아래 "카드별 수정 지시"대로 고친다. 이름은 가장 많은 카드가 이미 쓰는 것을 골랐고, 서로 어긋나는 곳은 앞 Day의 설계에 뒤 Day를 맞췄다.

### 핵심 결정

1. 라우트는 루트 `app/`에 둔다. 라우트가 아닌 코드는 Day 12부터 `src/` 아래에 두고 `@/*` 별칭은 `./src/*`를 가리킨다(Day 12 전에는 루트 `components/`·`types/`·`data/`와 상대 경로를 쓴다).
2. 파일 이름: 컴포넌트는 PascalCase(`LogItem.tsx`), 훅은 `use`로 시작하는 camelCase(`useNow.ts`), 그 밖의 모듈은 camelCase(`formatRelative.ts`, `queryKeys.ts`)다. 템플릿식 kebab-case(`like-heart.tsx`)는 쓰지 않는다.
3. 데이터 모델은 둘이다. 피드는 JSONPlaceholder 글 `Post`(`userId`, `id: number`, `title`, `body`), 기록 탭은 내 기록 `LogEntry`(`id: string`, `title`, `body`, `createdAt`, 이후 필드 추가)다. 피드에는 `LogEntry`가 섞이지 않는다. `Log` 타입, `text` 필드, `src/data/entries.ts`는 없다.
4. 피드 카드는 `PostCard`, 기록 행은 `LogItem`이다. `PostCard`는 Day 8에 화면 안에서 만들고 Day 11에 `components/PostCard.tsx`로 뺀다. 둘 다 라우터를 직접 쓰지 않고 `onPress` 같은 콜백 props만 받는다.
5. 탭 파일은 `app/(tabs)/index.tsx`(피드), `app/(tabs)/write.tsx`(기록), 설정은 Day 20부터 `app/(tabs)/settings/index.tsx`다. `record.tsx`, `log.tsx`, `compose.tsx`(Day 15의 일부러 깨뜨리기 실험 제외)는 없다.
6. 상세는 글 `app/post/[id].tsx`(Day 16, Day 16~26은 `MOCK_POSTS`, Day 27부터 서버), 기록 `app/log/[id].tsx`(Day 46, 건너뛰기 가능)다. 모달은 `app/about.tsx`(Day 18) 하나이고, Day 20의 설정 중첩 Stack 두 번째 화면은 `settings/licenses.tsx`로 해서 겹치지 않게 한다.
7. 전역 상태는 `src/contexts/`(`ProfileContext`, `LogsContext`, `AuthContext`)와 `src/state/logsReducer.ts`다. 훅 이름은 `useProfile()`, `useLogs()`, `useLogsDispatch()`, `useAuth()`, 테마는 `useTheme()`(`src/hooks/useTheme.ts`)다. `useTasks()`, `useSession()`은 공식 문서 예제의 이름일 뿐 앱에는 없다.
8. 저장소는 서로 충돌하지 않는다. Day 35 임시 저장은 `src/storage/draft.ts`(키 `'daily-log:draft'`), Day 42 기록 영속화는 `src/storage/logs.ts`(키 `'daily-log:logs'`), Day 36 토큰은 `src/storage/token.ts`(SecureStore 키 `'auth.token'`)다.
9. Day 33은 NetInfo를 쓰지 않는다(`onlineManager.setOnline` 임시 스위치만). NetInfo 설치와 `onlineManager.setEventListener` 연결은 Day 58이 처음이다.
10. 앱 스킴은 `dailylog`다(Day 18·19가 쓰는 값). `expo.name`·`expo.slug`·`package.json`의 `name`은 `daily-log`다.

### 파일 트리 스냅샷

각 줄의 괄호는 그 파일을 처음 만드는 Day, 화살표 뒤는 이동·개명 Day다. 템플릿이 만든 설정 파일(`app.json`, `package.json`, `tsconfig.json`, `eslint.config.js`, `assets/`)은 Day 1부터 계속 있으므로 이후 스냅샷에서는 바뀔 때만 적는다.

Day 1 직후(템플릿 그대로):

```
app/_layout.tsx  app/modal.tsx  app/(tabs)/_layout.tsx  app/(tabs)/index.tsx  app/(tabs)/explore.tsx
components/  constants/  hooks/  scripts/reset-project.js     템플릿 예제(Day 2에 삭제)
assets/images/  app.json  package.json  tsconfig.json  eslint.config.js
AGENTS.md  CLAUDE.md  .claude/  docs/                          기존 파일(건드리지 않음)
```

Day 2 직후(`npm run reset-project`, `n` 선택):

```
app/_layout.tsx        reset-project가 만든 Stack
app/index.tsx          기록 화면. Day 14까지 유일한 화면 (Day 7부터 기록|피드 임시 전환)
```

Day 3~11에 추가되는 파일(아직 루트에 둔다):

```
data/mock-posts.ts     (7)  Post 타입, MOCK_POSTS 30개      → src/data/mock-posts.ts (12)
types/log.ts           (10) LogEntry                       → src/types/log.ts (12)
components/LogItem.tsx (10)                                 → src/components/ (12)
components/Card.tsx, AppButton.tsx, EmptyState.tsx (11)     → src/components/ (12)
components/PostCard.tsx (11) Day 8의 화면 안 PostCard를 뺀다  → src/components/ (12)
```

Day 12 직후:

```
app/_layout.tsx
app/index.tsx
src/components/AppButton.tsx  Card.tsx  EmptyState.tsx  LogItem.tsx  PostCard.tsx
src/types/log.ts
src/data/mock-posts.ts
.prettierrc                   (12)
tsconfig.json                 paths: "@/*" → ["./src/*"] (12)
package.json                  scripts.typecheck 추가, reset-project 제거(2)
```

Day 13에 `src/hooks/useNow.ts`, `src/hooks/useKeyboardVisible.ts`, `src/utils/formatRelative.ts`가 추가된다.

Day 15 직후:

```
app/_layout.tsx        Stack
app/index.tsx          FeedScreen: MOCK_POSTS를 FlatList + PostCard로 (Day 7의 기록|피드 전환 제거)
app/write.tsx          WriteScreen: 기존 app/index.tsx의 입력 폼 + 기록 FlatList(LogItem)
```

Day 16에 `app/post/[id].tsx`가 추가된다.

Day 17 직후:

```
app/_layout.tsx            루트 Stack: (tabs) 헤더 숨김, post/[id]
app/(tabs)/_layout.tsx     Tabs: index(피드), write(기록), settings(설정)
app/(tabs)/index.tsx       ← app/index.tsx (17)
app/(tabs)/write.tsx       ← app/write.tsx (17)
app/(tabs)/settings.tsx    (17)                         → settings/index.tsx (20)
app/post/[id].tsx          (16)
```

이후 추가 시점:

| Day | 추가·변경 파일 |
|---|---|
| 18 | `app/about.tsx`(모달) |
| 20 | `app/(tabs)/settings.tsx` → `app/(tabs)/settings/_layout.tsx`·`index.tsx`·`licenses.tsx`, `app/+not-found.tsx` |
| 21 | `src/contexts/ProfileContext.tsx` |
| 22 | `src/state/logsReducer.ts`, `src/contexts/LogsContext.tsx`, `src/types/log.ts`에 `pinned` 추가 |
| 23 | `src/contexts/AuthContext.tsx`, `app/sign-in.tsx` |
| 25 | `src/types/post.ts`(`Post`를 `src/data/mock-posts.ts`에서 옮긴다) |
| 27 | `src/api/client.ts`, `src/api/posts.ts`, `src/api/messages.ts`. 이후 `src/data/mock-posts.ts`는 쓰지 않는다(지워도 된다) |
| 28 | `src/hooks/usePosts.ts`, `src/hooks/usePost.ts` |
| 30 | `src/hooks/useCreatePost.ts` |
| 31 | `src/hooks/useDeletePost.ts` |
| 33 | `src/api/queryKeys.ts` |
| 35 | `src/storage/draft.ts` |
| 36 | `src/storage/token.ts` |
| 37 | `src/schemas/post.ts` |
| 38 | `src/schemas/auth.ts` |
| 40 | `src/hooks/usePhotoPicker.ts` |
| 42 | `src/lib/photoStorage.ts`, `src/storage/logs.ts` |
| 43 | `src/lib/exportLogs.ts` |
| 45 | `src/hooks/useAttachLocation.ts` |
| 46 | `app/log/[id].tsx`(건너뛰기 가능) |
| 47 | `src/lib/notifications.ts` |
| 48 | `src/hooks/useNotificationObserver.ts` |
| 51 | `src/components/LikeHeart.tsx` |
| 52 | `src/components/SwipeableRow.tsx`(건너뛰기 가능) |
| 53 | `src/constants/theme.ts`, `src/hooks/useTheme.ts` |
| 57 | `src/components/AppErrorBoundary.tsx` |
| 58 | `src/hooks/useIsOnline.ts`, `src/components/OfflineBanner.tsx` |
| 60 | `__tests__/logsReducer.test.ts`, `__tests__/PostCard.test.tsx` |
| 61 | `test-utils/queryWrapper.tsx`, `__tests__/posts.test.ts`, `__tests__/usePosts.test.tsx`, `__tests__/FeedScreen.test.tsx` |
| 66 | `eas.json` |
| 67 | `app.config.ts`, `.env`, `assets/images/icon.png` 교체 |

최종 트리(Day 69):

```
app/
  _layout.tsx                 RootLayout + RootNavigator (아래 Provider 순서)
  +not-found.tsx
  about.tsx                   모달
  sign-in.tsx
  (tabs)/_layout.tsx
  (tabs)/index.tsx            피드
  (tabs)/write.tsx            기록
  (tabs)/settings/_layout.tsx
  (tabs)/settings/index.tsx   설정
  (tabs)/settings/licenses.tsx
  post/[id].tsx               글 상세
  log/[id].tsx                기록 상세 (Day 46)
src/
  api/client.ts  posts.ts  messages.ts  queryKeys.ts
  components/AppButton.tsx  AppErrorBoundary.tsx  Card.tsx  EmptyState.tsx  LikeHeart.tsx
             LogItem.tsx  OfflineBanner.tsx  PostCard.tsx  SwipeableRow.tsx
  constants/theme.ts
  contexts/AuthContext.tsx  LogsContext.tsx  ProfileContext.tsx
  data/mock-posts.ts          Day 27 이후 미사용
  hooks/useAttachLocation.ts  useCreatePost.ts  useDeletePost.ts  useIsOnline.ts  useKeyboardVisible.ts
        useNotificationObserver.ts  useNow.ts  usePhotoPicker.ts  usePost.ts  usePosts.ts  useTheme.ts
  lib/exportLogs.ts  notifications.ts  photoStorage.ts
  schemas/auth.ts  post.ts
  state/logsReducer.ts
  storage/draft.ts  logs.ts  token.ts
  types/log.ts  post.ts
  utils/formatRelative.ts
__tests__/                    app/ 밖, 루트
test-utils/queryWrapper.tsx   __tests__/ 밖 (Jest가 테스트로 읽지 않게)
app.json  app.config.ts  eas.json  .env  .prettierrc  eslint.config.js  tsconfig.json  package.json
```

`src/utils/`는 순수 함수, `src/lib/`는 Expo 네이티브 모듈을 감싼 함수, `src/storage/`는 AsyncStorage·SecureStore를 감싼 함수다.

`app/_layout.tsx`의 `RootLayout` Provider 순서(바깥부터): `GestureHandlerRootView`(50) → `ThemeProvider`(`@react-navigation/native`, 53) → `QueryClientProvider`(28) → `AuthProvider`(23) → `ProfileProvider`(21) → `LogsProvider`(22) → `RootNavigator`(23). 같은 파일 모듈 최상단에는 `queryClient`(28, 33에서 `staleTime`), `Notifications.setNotificationHandler`(47), `onlineManager.setEventListener`(58)가 있다. `RootNavigator`의 `Stack.Protected guard={!!token}` 안에 `(tabs)`, `post/[id]`, `about`, `log/[id]`(46)를, `guard={!token}` 안에 `sign-in`을 둔다.

### 표준 이름 표

모델·타입:

| 이름 | 정의 파일 | 처음 만드는 Day | 바뀌는 Day | 쓰는 Day |
|---|---|---|---|---|
| `Post` (`userId`, `id: number`, `title`, `body`) | `data/mock-posts.ts` → `src/types/post.ts` | 7 | 12 이동(파일째), 25 `src/types/post.ts`로 옮김 | 8, 11, 15, 16, 25~33, 41, 55, 57, 60~63 |
| `MOCK_POSTS` | `src/data/mock-posts.ts` | 7 | 12 이동 | 7, 8, 15, 16, 25~26(상세만) |
| `LogEntry` | `types/log.ts` → `src/types/log.ts` | 10 (`id: string`, `title`, `body`, `createdAt: number`) | 22 `pinned: boolean`, 40 `photoUri?: string`, 42 `photoUri` → `photoName?: string`, 45 `place?: { latitude; longitude; label }` | 10~13, 15, 22, 40~46, 52, 60 |
| `LogsAction` | `src/state/logsReducer.ts` | 22 (`added` + `log: LogEntry`, `removed` + `id`, `pinToggled` + `id`) | 42 `loaded` + `logs: LogEntry[]` | 22, 42, 52, 60 |
| `PostForm`, `postSchema` | `src/schemas/post.ts` | 37 | | 37 |
| `LoginForm`, `loginSchema` | `src/schemas/auth.ts` | 38 | | 38 |
| `ApiError` (`kind: 'network' \| 'http'`, `status?`) | `src/api/client.ts` | 27 | | 27, 28, 30, 61 |

Day 5의 화면 안 `type Entry`와 Day 2의 `ENTRIES` 배열은 Day 10에서 `LogEntry`와 빈 배열 초기값으로 대체되고 사라진다.

컴포넌트:

| 이름 | 파일 | 처음 만드는 Day | 쓰는 Day |
|---|---|---|---|
| `LogItem` (props `entry`, `now`, `onPress(id: string)`, Day 22부터 고정·삭제 콜백) | `src/components/LogItem.tsx` | 10 | 11, 13, 15, 22, 42, 43, 46, 52 |
| `Card`, `AppButton`, `EmptyState` | `src/components/` | 11 | 15~18 |
| `PostCard` (`memo`, props `post`, `onPress(id: number)`, Day 31부터 `onDelete(id: number)`) | `src/components/PostCard.tsx` | 8(화면 안), 11(파일) | 15, 16, 31, 41, 55, 57, 60, 62 |
| `LikeHeart` | `src/components/LikeHeart.tsx` | 51 | 55 |
| `SwipeableRow` | `src/components/SwipeableRow.tsx` | 52 | 53, 55 |
| `AppErrorBoundary` | `src/components/AppErrorBoundary.tsx` | 57 | 57 |
| `OfflineBanner` | `src/components/OfflineBanner.tsx` | 58 | 58 |
| `FeedScreen`, `WriteScreen` | `app/(tabs)/index.tsx`, `app/(tabs)/write.tsx` | 15 | 61(`FeedScreen`) |
| `AboutScreen` | `app/about.tsx` | 18 | |
| `RootLayout`, `RootNavigator` | `app/_layout.tsx` | 15, 23 | 21~23, 28, 33, 36, 47, 48, 50, 53, 58 |

훅:

| 이름 | 파일 | 처음 만드는 Day | 바뀌는 Day | 쓰는 Day |
|---|---|---|---|---|
| `useNow(intervalMs)` | `src/hooks/useNow.ts` | 13 | | 13, 15 |
| `useKeyboardVisible()` | `src/hooks/useKeyboardVisible.ts` | 13 | | 13 |
| `usePosts(userId: number \| null)` | `src/hooks/usePosts.ts` | 28 (`useQuery`) | 32 `useInfiniteQuery`, 33 `postKeys` | 28~33, 61 |
| `usePost(id: number)` | `src/hooks/usePost.ts` | 28 | 33 `postKeys.detail` | 28, 33 |
| `useCreatePost()` | `src/hooks/useCreatePost.ts` | 30 | | 30, 35, 37 |
| `useDeletePost()` | `src/hooks/useDeletePost.ts` | 31 | 32 페이지 구조, 33 `postKeys.lists` | 31~33 |
| `usePhotoPicker()` | `src/hooks/usePhotoPicker.ts` | 40 | | 40~42 |
| `useAttachLocation()` | `src/hooks/useAttachLocation.ts` | 45 | | 45 |
| `useNotificationObserver()` | `src/hooks/useNotificationObserver.ts` | 48 | | 48 |
| `useTheme()` (색 객체 반환) | `src/hooks/useTheme.ts` | 53 | | 53, 57, 58 |
| `useIsOnline()` | `src/hooks/useIsOnline.ts` | 58 | | 58 |

`useTheme`는 `@react-navigation/native`에도 같은 이름이 있으므로 항상 `@/hooks/useTheme`에서 import한다.

컨텍스트·상태:

| 이름 | 파일 | 처음 만드는 Day | 값 | 쓰는 Day |
|---|---|---|---|---|
| `ProfileProvider`, `useProfile()` | `src/contexts/ProfileContext.tsx` | 21 | `{ nickname, setNickname }` | 21, 22, 28 |
| `logsReducer` | `src/state/logsReducer.ts` | 22 | `(state: LogEntry[], action: LogsAction) => LogEntry[]` | 22, 42, 60 |
| `LogsProvider`, `useLogs()`, `useLogsDispatch()` | `src/contexts/LogsContext.tsx` | 22 | 42부터 `loadLogs`·`saveLogs` 연결 | 22, 40~46, 52, 61 |
| `AuthProvider`, `useAuth()` | `src/contexts/AuthContext.tsx` | 23 | `{ token, signIn, signOut }`, 36부터 `isRestoring` | 23, 36, 38 |

api 함수·쿼리 키:

| 이름 | 파일 | 처음 만드는 Day | 쓰는 Day |
|---|---|---|---|
| `BASE_URL`, `request<T>(path, options?)` | `src/api/client.ts` | 27 (30에서 `method`·`body` 옵션 추가, 67에서 `process.env.EXPO_PUBLIC_API_BASE_URL`) | 27~32, 61, 65, 67 |
| `getPosts({ userId, signal })`, `getPost(id, { signal })` | `src/api/posts.ts` | 27 | 27, 28, 61 |
| `createPost({ title, body })` | `src/api/posts.ts` | 30 | 30, 37 |
| `deletePost(id)` | `src/api/posts.ts` | 31 | 31 |
| `getPostsPage({ userId, page, signal })` | `src/api/posts.ts` | 32 | 32 |
| `getErrorMessage(error: unknown): string` | `src/api/messages.ts` | 27 | 27, 28, 30, 58 |
| `['posts', { userId }]`, `['post', id]` | 훅 안 리터럴 | 28 | 28~31 |
| `['posts', 'infinite', { userId }]` | 훅 안 리터럴 | 32 | 32 |
| `postKeys.all` `['posts']`, `.lists` `['posts', 'infinite']`, `.list(userId)`, `.detail(id)` `['posts', 'detail', id]` | `src/api/queryKeys.ts` | 33 (이후 리터럴 금지) | 33 이후 전부 |

저장소·lib·유틸:

| 이름 | 파일 | 처음 만드는 Day | 쓰는 Day |
|---|---|---|---|
| `formatRelative(createdAt, now)` | `src/utils/formatRelative.ts` | 13 | 13, 15 |
| `loadDraft`, `saveDraft`, `clearDraft` (키 `'daily-log:draft'`) | `src/storage/draft.ts` | 35 | 35, 37 |
| `saveToken`, `loadToken`, `clearToken` (키 `'auth.token'`) | `src/storage/token.ts` | 36 | 36 |
| `loadLogs`, `saveLogs` (키 `'daily-log:logs'`) | `src/storage/logs.ts` | 42 | 42, 45, 52 |
| `savePhoto`, `getPhotoUri`, `deletePhoto` | `src/lib/photoStorage.ts` | 42 | 42, 43, 46 |
| `exportLogsAsJson(entries)` | `src/lib/exportLogs.ts` | 43 | 43 |
| `ensureNotificationPermission`, `enableDailyReminder`, `disableDailyReminder`, `isDailyReminderScheduled` | `src/lib/notifications.ts` | 47 | 47, 48 |
| `registerForPushToken()` | `src/lib/notifications.ts` | 48 | 48 |
| `Colors` (`light`, `dark`) | `src/constants/theme.ts` | 53 | 53 이후 |
| `queryClient` | `app/_layout.tsx` 모듈 최상단 | 28 | 28, 33, 58 |

### 카드 서식 표준

학습 Day 카드:

```
# Day N · M/D (요일) — 주제
> 전제: …            (필요할 때만. H1 바로 아래, 오늘의 목표 위)
> 건너뛰기 가능: …    (건너뛰기 가능 Day만. 같은 위치)
## 오늘의 목표
## 읽기(15분)
## 예측(10분)
## 만들기(40분)
## 검증(10분)
## 이해 점검 질문
## 기록(5분)
## 커밋 단위 제안
## 웹과 다른 점        (웹과 차이가 있는 Day만. 없으면 절을 두지 않는다)
```

버퍼 Day 카드: `## 오늘의 목표`, `## 주간 점검 퀴즈(30분)`, `## 구술 1주제(15분)`, `## 질문 목록 처리(15분)`, `## 밀린 Day 흡수`, `## 기록(5분)`. Day 69는 시간 배분이 다르므로 괄호 안 분 수만 카드 값을 쓴다.

- 절 제목에 번호(`## 1. 오늘의 목표`)를 붙이지 않는다. 번호 없는 카드가 59개, 번호 있는 카드가 10개(Day 20~29)다.
- 괄호 앞에 공백을 두지 않는다(`## 읽기(15분)`). 공백 없는 카드가 49개, 있는 카드가 20개다.
- H1에는 `*(건너뛰기 가능)*`를 쓰지 않고 카드 상단 인용 줄에만 둔다. 커리큘럼 일정 표의 표기는 그대로 둔다.
- "확인할 버전" 인용은 `## 읽기(15분)` 바로 아래에 둔다(Day 40~48 방식).

### 카드별 수정 지시

내용 수정(40개 카드):

- Day 1: 만들기 6번에서 `expo.scheme`만 `dailylog`로 바꾸게 고친다. `package.json`의 `name`, `expo.name`·`expo.slug`는 `daily-log`로 둔다.
- Day 10: 상단 전제 인용을 `## 오늘의 목표` 위로 옮기고 "글 목록(Day 7~8의 `FlatList`)"을 "기록 목록(Day 5의 `entries.map`)과 피드(Day 7~8)"로 고친다. `LogEntry`의 `id`를 `string`으로, `LogItemProps.onPress`를 `(id: string) => void`로 바꾼다. `LogItem`은 "Day 7 피드 `renderItem`"이 아니라 Day 2·5의 기록 카드(`Pressable`) JSX를 옮긴 것으로 고친다. `app/index.tsx`의 기록 목록을 `FlatList`(`renderItem`에 `LogItem`)로 바꾸고, 바깥 `ScrollView`를 `View`(`flex: 1`)로 바꿔 폼 아래 `FlatList`가 중첩되지 않게 하며 `keyboardShouldPersistTaps="handled"`를 `FlatList`로 옮긴다는 단계를 추가한다. Day 2의 `ENTRIES`는 지우고 초기값을 빈 배열로 둔다고 적는다.
- Day 11: 새로 만들 파일에 `components/PostCard.tsx`를 추가한다: Day 8에서 `app/index.tsx` 안에 만든 `memo` `PostCard`를 옮기고 바깥을 `Card`로 감싼다. props는 `post: Post`, `onPress: (id: number) => void`. 완료 기준 첫 줄의 컴포넌트 목록에도 넣는다.
- Day 12: 옮길 대상에 루트 `data/`를 추가한다(`data/mock-posts.ts` → `src/data/mock-posts.ts`). 폴더 구조 목표의 `src/data/ (Day 15부터 사용)`을 `src/data/ mock-posts.ts`로, `src/components/` 목록에 `PostCard`를 추가한다.
- Day 15: `src/data/entries.ts`와 `ENTRIES`를 모두 지운다. `app/index.tsx`(`FeedScreen`)는 `@/data/mock-posts`의 `MOCK_POSTS`를 `FlatList` + `PostCard`로 보여 준다(Day 8의 `SectionList`는 `FlatList`로 되돌리고 `refreshing`·`onRefresh`는 유지). `now`·`useNow`는 피드에서 빼고 `app/write.tsx`의 `LogItem`에 남긴다. Day 7의 기록|피드 전환 버튼을 지운다는 단계를 추가한다. "중요한 변화" 문단의 해결 시점을 "피드는 `Post`만 보여 주고 기록(`LogEntry`)과 섞지 않는다. 기록 개수 공유는 Day 22"로 고친다. 완료 기준의 `ENTRIES` 항목을 "피드가 `MOCK_POSTS`를 `PostCard`로 보여 준다"로 바꾼다.
- Day 16: 예측 1, 만들기, 핵심 형태의 `ENTRIES`를 `MOCK_POSTS`로, `e`를 `p`로 바꾼다(`MOCK_POSTS.find((p) => p.id === Number(id))`). 상세 표시 항목에서 "상대 시간"을 뺀다(`Post`에 `createdAt`이 없다). `app/index.tsx`의 이동은 `PostCard`의 `onPress`에서 한다. "기록 화면에서 쓴 글은 상세에서 찾을 수 없다(Day 21에서 해결)"를 "기록 상세는 Day 46의 `app/log/[id].tsx`가 맡는다"로 고친다.
- Day 19: 퀴즈 2번 문제·정답의 `ENTRIES.find((e) => e.id === id)`를 `MOCK_POSTS.find((p) => p.id === id)`로 바꾼다.
- Day 20: B의 `app/(tabs)/settings/about.tsx`("앱 정보")를 `app/(tabs)/settings/licenses.tsx`("오픈소스 라이선스", 쓰는 패키지 이름 몇 개를 `Text`로)로, `Link href="/settings/about"`을 `/settings/licenses`로, 완료 기준의 "앱 정보"를 "라이선스"로 바꾼다. Day 18의 모달 `app/about.tsx`는 그대로 둔다. 상단 전제의 "`src/` 사용 여부가 다르면" 문구를 지운다.
- Day 21: `contexts/ProfileContext.tsx`를 `src/contexts/ProfileContext.tsx`로 바꾸고 "(Day 12에서 정한 폴더 구조에 맞춰 위치를 정한다)"를 지운다. 설정 탭 경로를 `app/(tabs)/settings/index.tsx` 하나로 확정한다.
- Day 22: 새 파일 `types/log.ts`의 `Log` 타입을 지우고 "Day 10의 `src/types/log.ts`의 `LogEntry`에 `pinned: boolean`을 추가한다"로 바꾼다. `text` 필드 대신 `title`·`body`를 쓴다. `state/logsReducer.ts` → `src/state/logsReducer.ts`, `contexts/LogsContext.tsx` → `src/contexts/LogsContext.tsx`. reducer 시그니처와 `LogsAction`의 `Log`를 `LogEntry`로 바꾼다. "Day 7의 `FlatList`로 내 기록 목록"을 "Day 10의 기록 `FlatList`와 `LogItem`"으로 고치고, 고정·삭제 버튼은 `LogItem`의 콜백 props로 받는다고 적는다.
- Day 23: `contexts/AuthContext.tsx` → `src/contexts/AuthContext.tsx`. `Stack.Protected guard={!!token}` 예시에 `about`(Day 18의 `presentation: 'modal'` 옵션)을 추가하고, Day 16·18의 `Stack.Screen` 옵션을 `RootNavigator` 안으로 옮긴다고 적는다. 설정 탭 경로를 `app/(tabs)/settings/index.tsx`로 확정한다.
- Day 25: 새 파일 `types/post.ts`를 "`src/types/post.ts`를 만들고 Day 7의 `Post` 타입을 `src/data/mock-posts.ts`에서 옮긴다. `mock-posts.ts`와 `PostCard`는 여기서 import한다"로 바꾼다.
- Day 27: `api/client.ts`·`api/posts.ts`·`api/messages.ts`에 `src/`를 붙이고 `types/post.ts`를 "Day 25의 `src/types/post.ts`"로 바꾼다. "`api/messages.ts` 같은 파일"을 "`src/api/messages.ts`의 `getErrorMessage(error: unknown): string`"으로 확정한다.
- Day 28: `hooks/usePosts.ts`·`hooks/usePost.ts`·`api/client.ts`에 `src/`를 붙인다. "Day 27의 에러 문구 함수"를 `getErrorMessage`로 적는다.
- Day 30·31·32·33: 상단 전제와 만들기의 `api/`·`hooks/`·`types/` 경로에 `src/`를 붙이고 "폴더가 `src/` 아래라면 앞에 `src/`를 붙여 읽는다"를 지운다. Day 30은 "Day 27의 에러 문구 함수"를 `getErrorMessage`로 적는다. Day 31은 "Day 11에서 분리한 피드 항목 컴포넌트"에 `src/components/PostCard.tsx`를 덧붙인다. Day 33은 설정 탭을 `app/(tabs)/settings/index.tsx` 하나로 확정하고, 키 팩토리 파일을 `src/api/queryKeys.ts`로 적는다.
- Day 35: `storage/draft.ts` → `src/storage/draft.ts`, `hooks/useCreatePost.ts` → `src/hooks/useCreatePost.ts`. 전제의 `src/` 안내 문구를 지운다.
- Day 36: `storage/token.ts` → `src/storage/token.ts`, `contexts/AuthContext.tsx` → `src/contexts/AuthContext.tsx`. 완료 기준의 `grep -rn "AsyncStorage" app contexts storage`를 `grep -rn "AsyncStorage" app src`로, 예외를 `src/storage/draft.ts`로 바꾼다. 전제의 `src/` 안내 문구를 지운다.
- Day 37: `schemas/post.ts` → `src/schemas/post.ts`, `storage/draft.ts` → `src/storage/draft.ts`, `hooks/useCreatePost.ts` → `src/hooks/useCreatePost.ts`. 전제의 `src/` 안내 문구를 지운다.
- Day 38: `schemas/auth.ts` → `src/schemas/auth.ts`, `contexts/AuthContext.tsx` → `src/contexts/AuthContext.tsx`. 전제의 `src/` 안내 문구를 지운다.
- Day 40·41·42·43·45·46: 공통 전제 인용에서 "Day 22의 reducer 카드는 같은 타입을 `Log`라 부르기도 한다", "Day 35·37 카드는 기록 탭 파일을 `log.tsx`로 부르기도 한다", "이름이 다르면 본인 프로젝트의 실제 경로·이름으로 읽는다"를 지운다.
- Day 41: "Day 11에서 분리한 피드 카드 컴포넌트"에 `src/components/PostCard.tsx`를 덧붙인다. 설정 탭 `app/(tabs)/settings.tsx` → `app/(tabs)/settings/index.tsx`.
- Day 42: `contexts/LogsContext.tsx` → `src/contexts/LogsContext.tsx`, `loaded` 액션을 추가할 reducer를 `src/state/logsReducer.ts`로 적는다. `src/storage/logs.ts`의 키를 `'daily-log:logs'`로 명시한다. "기록 목록을 그리는 컴포넌트"를 `src/components/LogItem.tsx`로 적는다. 설정 탭 경로를 `app/(tabs)/settings/index.tsx`로 바꾼다.
- Day 43: "기록 목록 항목(Day 42에서 사진을 그리는 컴포넌트)"을 `src/components/LogItem.tsx`로 적고, 설정 탭 경로를 `app/(tabs)/settings/index.tsx`로 바꾼다.
- Day 45: "Day 22에서 만든 기록 항목 타입 `LogEntry`"를 "Day 10의 `src/types/log.ts`의 `LogEntry`"로 고친다. 설정 탭 경로를 `app/(tabs)/settings/index.tsx`로 바꾼다.
- Day 46: H1 끝의 `*(건너뛰기 가능)*`를 지운다. `app/log/[id].tsx`의 "Day 16의 `app/post/[id].tsx` 같은 파일", "이미 상세 화면이 있다면 그 파일을 쓴다"를 지우고 새 파일로 확정한다. `app/_layout.tsx`의 `RootNavigator`에서 `Stack.Protected guard={!!token}` 안에 `<Stack.Screen name="log/[id]" />`를 추가하는 단계를 넣는다. "기록 탭의 목록 항목"을 "`LogItem`의 `onPress`(Day 10)"로 적는다. 읽기 1번의 "커리큘럼 표의 dev build 필요 비고와 표현이 다르다"와 이해 점검 질문 3번·정답 3번을 고친 의존성 표(개발은 Expo Go, 스토어 바이너리는 키·재빌드)에 맞춰 다시 쓴다.
- Day 47·48: 설정 탭 `app/(tabs)/settings.tsx` → `app/(tabs)/settings/index.tsx`. Day 48은 H1 끝의 `*(건너뛰기 가능)*`도 지운다.
- Day 50: "동적 라우트 파일(예: `app/post/[id].tsx`)"을 `app/post/[id].tsx`로 확정한다. "템플릿의 `ThemeProvider`가 있어도 그 바깥에 둔다"를 "`QueryClientProvider`를 포함한 모든 Provider보다 바깥에 둔다"로 바꾼다(reset-project 뒤에는 템플릿 `ThemeProvider`가 없다).
- Day 51: `components/like-heart.tsx` → `src/components/LikeHeart.tsx`. "Day 12에서 정한 폴더 구조가 다르면 같은 역할의 폴더를 쓴다"를 지운다.
- Day 52: `app/(tabs)/record.tsx` → `app/(tabs)/write.tsx`, `components/swipeable-row.tsx` → `src/components/SwipeableRow.tsx`. "삭제 action이 없으면 이 Day에 reducer에 추가한다"를 "Day 22의 `removed` 액션과 Day 42의 `deletePhoto`를 부르는 기존 삭제 핸들러를 `onDelete`로 넘긴다"로 바꾼다. 4번 "행 안쪽 내용에는 `Pressable`을 넣지 않는다"를 "`children`으로 Day 10의 `LogItem`(`Pressable`)을 그대로 넣고, 탭과 가로 스와이프가 둘 다 동작하는지 검증에서 확인한다"로 바꾼다. 완료 기준의 "Day 35 이후 저장"을 "Day 42의 `saveLogs`"로 바꾼다. 폴더 구조 안내 문구를 지운다.
- Day 53: `constants/theme.ts` → `src/constants/theme.ts`, `hooks/use-theme.ts` → `src/hooks/useTheme.ts`. 색 리터럴 검색 범위 "`app`과 `components`"를 "`app`과 `src`"로 바꾼다. 4번의 "템플릿에 이미 있으면 남아 있는지만 확인한다"를 "reset-project로 지워졌으므로 `GestureHandlerRootView` 바로 안에 새로 추가한다"로 바꾼다. 폴더 구조 안내 문구를 지운다.
- Day 56: "예: `app/(tabs)/index.tsx`"를 `app/(tabs)/index.tsx`로, "예: `app/(tabs)/record.tsx`"를 `app/(tabs)/write.tsx`로 확정한다. 폴더 구조 안내 문구를 지운다.
- Day 57: `components/error-boundary.tsx` → `src/components/AppErrorBoundary.tsx`. "예: `app/(tabs)/index.tsx`"를 확정 경로로 바꾸고 폴더 구조 안내 문구를 지운다.
- Day 58: `hooks/use-is-online.ts` → `src/hooks/useIsOnline.ts`, `components/offline-banner.tsx` → `src/components/OfflineBanner.tsx`. "QueryClient 설정(Day 28에서 만든 파일)"을 "`app/_layout.tsx` 모듈 최상단(Day 28의 `queryClient` 옆)"으로 확정한다. "예: `app/(tabs)/index.tsx`"를 확정 경로로 바꾸고 폴더 구조 안내 문구를 지운다.
- Day 60: `__tests__/entries-reducer.test.ts` → `__tests__/logsReducer.test.ts`, 대상을 "`src/state/logsReducer.ts`의 `logsReducer`"로 적는다. `__tests__/post-card.test.tsx` → `__tests__/PostCard.test.tsx`, 대상을 "Day 11의 `src/components/PostCard.tsx`"로 적는다. `PostCard`는 라우터에 의존하지 않으므로 "다른 컴포넌트를 대신 고른다" 문장을 지운다.
- Day 61: `test-utils/query-wrapper.tsx` → `test-utils/queryWrapper.tsx`(함수 이름 `createQueryWrapper`), `__tests__/api-client.test.ts` → `__tests__/posts.test.ts`(대상 `src/api/posts.ts`의 `getPosts`, 실패는 `ApiError`), `__tests__/use-feed.test.tsx` → `__tests__/usePosts.test.tsx`(대상 "Day 28의 `useQuery` 기반 피드 훅"을 "Day 32에서 `useInfiniteQuery`로 바꾼 `usePosts`, 성공 시 `data.pages` 확인"으로), `__tests__/feed-screen.test.tsx` → `__tests__/FeedScreen.test.tsx`. 테스트 3에 세 가지를 추가한다: 피드 헤더가 `useProfile()`·`useLogs()`를 쓰므로 wrapper에 `ProfileProvider`·`LogsProvider`도 감싼다. `LogsProvider`가 AsyncStorage를 읽으므로 `jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))`를 둔다. `expo-router` mock 공장에는 피드가 import하는 `Link`와(남아 있다면) Day 20의 `useFocusEffect`도 넣는다.
- Day 69: 퀴즈 2번 정답의 "`react-native-maps`(Day 46)에서 development build가 필요하다"를 "푸시 토큰(Day 48)처럼 실기기와 development build가 필요한 기능"으로 바꾼다(SDK 54 문서상 지도는 개발 중 Expo Go에서 된다).

서식 수정(위 내용 수정과 겹치는 카드 포함):

- Day 20~29: 절 제목의 번호(`1. `~`9. `)를 지운다. Day 24·29는 `## 기록`을 `## 기록(5분)`으로 바꾼다.
- Day 10~19, 60~69: 절 제목 괄호 앞 공백을 지운다(`## 읽기 (15분)` → `## 읽기(15분)`, `## 주간 점검 퀴즈 (30분)` → `## 주간 점검 퀴즈(30분)` 등).
- Day 30~33, 35~38: `## 이해 점검 질문 3개` → `## 이해 점검 질문`.
- Day 4·9: `## 구술(15분)` → `## 구술 1주제(15분)`.
- Day 34·39·44·49: `## 주간 점검 퀴즈 5문항(30분)` → `## 주간 점검 퀴즈(30분)`. Day 34·39는 `## 밀린 Day 흡수(남는 시간)` → `## 밀린 Day 흡수`. Day 44·49·64는 `## 기록` → `## 기록(5분)`.
- Day 46·48: H1 끝 `*(건너뛰기 가능)*` 삭제(위 내용 수정에 포함).

수정이 필요 없는 카드: Day 2, 3, 5, 6, 7, 8, 54, 55, 59.
