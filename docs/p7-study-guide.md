# P7 학습 가이드 — 인터랙션 완성도

> 출처: [Reanimated 3 기본기](https://docs.swmansion.com/react-native-reanimated/) · [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) · [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet/) · [Expo SDK 54 reanimated/gesture-handler 문서](https://docs.expo.dev/versions/v54.0.0/)
> 검증: rn-sandbox-app `src/screens/FeedListScreen.tsx`, `src/screens/FeedDetailScreen.tsx`, `src/components/SwipeableRow.tsx`, `src/components/FeedSkeleton.tsx` — `tsc --noEmit` 통과, 시뮬레이터(Expo Go, iPhone 17 / SDK 54) 실측 (RN 0.81 / Expo SDK 54)

P6까지 앱 뼈대·데이터·오프라인을 갖췄다. P7은 그 위에 "그럴듯함"을 입힌다 — 스와이프 삭제, 바텀시트, 스켈레톤, 화면 전환. 60fps 유지가 졸업 기준이라 워클릿(UI 스레드에서 도는 JS) 기반 라이브러리를 쓴다.

## 설치 — Reanimated 4 / Worklets 분리

SDK 54 기준 `react-native-reanimated`는 워클릿 런타임이 별도 패키지(`react-native-worklets`)로 빠졌다.

```sh
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler @gorhom/bottom-sheet
```

`babel-preset-expo`가 `node_modules`에 `react-native-worklets`가 있으면 자동으로 워클릿 babel 플러그인을 붙인다 — `babel.config.js`를 직접 만들 필요 없음. 대신 **Metro를 새 네이티브 모듈 설치 후 반드시 캐시 초기화하며 재시작**해야 한다(`expo start -c`). 설치 전에 이미 떠 있던 Metro는 워클릿 플러그인이 안 붙은 채로 번들을 캐싱하고 있어서, 그 상태로 이어서 실행하면 `WorkletsError: Failed to create a worklet`가 뜬다 — 새 네이티브 의존성을 추가할 때마다 겪을 수 있는 함정.

`App.tsx` 루트를 `GestureHandlerRootView`로 감싸야 한다 — 안 감싸면 제스처가 조용히 씹힌다.

## 스와이프 삭제 — `SwipeableRow`

Gesture Handler의 `Gesture.Pan()`으로 좌측 스와이프를, `Gesture.LongPress()`로 롱프레스를 **같은 행 위에서 동시에** 받는다. 그냥 두면 두 제스처가 충돌하므로 `Gesture.Race(pan, longPress)`로 묶는다 — 먼저 조건을 만족한 쪽이 이기고 나머지는 자동 무효화된다.

```tsx
const pan = Gesture.Pan()
  .activeOffsetX([-10, 10]) // 세로 스크롤과 구분 — 가로로 충분히 움직여야 활성화
  .onUpdate((e) => {
    translateX.value = Math.min(0, e.translationX);
  })
  .onEnd(() => {
    if (translateX.value < DELETE_THRESHOLD) {
      translateX.value = withTiming(
        OFFSCREEN,
        { duration: 200 },
        (finished) => {
          if (finished) runOnJS(onDelete)();
        },
      );
    } else {
      translateX.value = withSpring(0);
    }
  });
```

`translateX`는 `useSharedValue` — UI 스레드에서 직접 갱신되어 JS 스레드 왕복 없이 60fps로 따라옴. 임계값을 넘기면 `withTiming`으로 화면 밖까지 밀어낸 뒤 콜백에서 `runOnJS(onDelete)()` — 애니메이션(UI 스레드)이 끝난 다음에야 JS 함수(삭제 뮤테이션)를 부른다.

## 삭제 뮤테이션 — 낙관적 제거 + 롤백

`src/api/posts.ts`의 `useDeletePost`: `onMutate`에서 무한스크롤 캐시(`["posts"]`, 2차원 `pages` 배열)에서 해당 id만 즉시 필터링해 제거하고 스냅샷을 남긴다. 가짜 20% 실패율로 실패하면 `onError`가 스냅샷으로 되돌린다 — W15/W16에서 쓴 낙관적 업데이트 패턴 재사용.

## 바텀시트 — 롱프레스 옵션

`@gorhom/bottom-sheet`의 `BottomSheet` + `BottomSheetView`를 화면당 1개만 두고, 어떤 행을 롱프레스했는지는 `selectedPost` state로 추적한다(행마다 시트를 만들지 않음). `index={-1}`이 닫힌 상태, `ref.current?.expand()`로 연다.

## 스켈레톤 — 스피너 대신 행 모양 shimmer

`isPending` 초기 로딩에서 `ActivityIndicator` 대신 실제 행과 같은 모양(썸네일 박스 + 텍스트 바)에 `withRepeat(withTiming(...), -1, true)`로 밝기를 왕복시키는 shimmer를 보여준다. "곧 이렇게 채워진다"는 형태 예고라 스피너보다 체감 대기시간이 짧다.

## 화면 전환 — 가벼운 진입 애니메이션

`FeedDetailScreen`을 `Animated.View`로 감싸 `entering={SlideInRight}`(전체) + `entering={FadeIn.delay(100)}`(제목)을 얹었다. 진짜 shared-element 전환(`react-native-shared-element` 등)은 라이브러리 하나를 더 얹는 무게 대비 이 앱 스코프에서 체감 이득이 작아 제외 — Reanimated 내장 진입 프리셋만으로 "부드럽다"는 인상은 충분히 만들어짐.

## 실기기/시뮬레이터 검증 메모

시뮬레이터(Expo Go)에서 `touch_path` 자동화로 확인:

- 롱프레스 → 바텀시트 오픈 → "삭제" 탭 → 목록에서 즉시 사라짐: **확인**
- 상세 화면 진입 애니메이션(크래시 없음, 레이아웃 정상): **확인**
- 스켈레톤 렌더(코드 경로상 정상, 데이터가 빨리 와서 육안 캡처는 실패): **코드 리뷰로만 확인**
- **스와이프 삭제 제스처**: 이후 재검증 완료 — `mcp__Claude_Code_iOS_Simulator__control`의 `touch_path`(여러 중간 좌표 + `dt_ms`로 연속 이동 이벤트 생성)로 시뮬레이터에서 재현 성공(행이 목록에서 실제로 삭제됨, 뒤 항목들 자연스럽게 당겨짐). 이전 실패는 Pan 제스처 자체의 한계가 아니라 **단발 tap/swipe 액션이 연속 `onUpdate` 이벤트를 만들지 못한 것**이 원인이었음. 부수 교훈: 시뮬레이터 좌표는 반드시 `xcrun simctl io booted screenshot`로 뜬 원본(3배 픽셀) 스크린샷을 분석해 나눈 값을 써야 함 — MCP `screenshot` 결과를 눈대중으로 읽은 좌표는 계속 빗나갔다(대화형 렌더 이미지가 실제 포인트 좌표계와 다른 비율로 보임).

## 남은 작업

P7 완전 졸업(스와이프 삭제 실측 검증 포함) — 다음은 P8 (W21–24) 출시: EAS 빌드, iOS/Android 스토어 제출, Sentry, OTA.
