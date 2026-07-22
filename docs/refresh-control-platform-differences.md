# RefreshControl — iOS vs Android 동작 차이

> 출처: [RefreshControl 공식 문서](https://reactnative.dev/docs/refreshcontrol) (RN 0.81 / Expo SDK 54 기준)
> 검증: rn-sandbox-app `FeedListScreen` — Android 에뮬레이터 정상, iOS 26.5 시뮬레이터에서 네이티브 버그 확인 (아래 참고)

## 왜 다른가

RefreshControl은 크로스 플랫폼 API지만 내부는 각 OS의 네이티브 컴포넌트를 감싼 것:

- **iOS**: `UIRefreshControl` — 시스템 기본 스피너(작은 원형 인디케이터)가 리스트 위 여백에 나타남
- **Android**: `SwipeRefreshLayout` — 머티리얼 디자인 원형 스피너가 리스트 **위에 겹쳐서** 내려옴

그래서 스타일 관련 prop이 플랫폼별로 갈림. 한쪽 전용 prop을 다른 플랫폼에 넘겨도 에러 없이 **조용히 무시**됨.

## Props 정리

### 공통

| Prop | 타입 | 설명 |
|------|------|------|
| `refreshing` (필수) | boolean | 새로고침 중 여부. **controlled prop** — `onRefresh` 안에서 `true`로 안 바꾸면 스피너 즉시 멈춤 |
| `onRefresh` | function | 당겨서 새로고침 시작 시 호출 |
| `progressViewOffset` | number | 스피너 상단 오프셋 (기본 0) |

### iOS 전용

| Prop | 타입 | 설명 |
|------|------|------|
| `tintColor` | color | 스피너 색 |
| `title` | string | 스피너 아래 표시되는 텍스트 |
| `titleColor` | color | title 색 |

### Android 전용

| Prop | 타입 | 설명 |
|------|------|------|
| `colors` | color 배열 | 스피너 색 (여러 개면 순환) |
| `progressBackgroundColor` | color | 스피너 원판 배경색 |
| `size` | `'default'` \| `'large'` | 스피너 크기 |
| `enabled` | boolean | 당겨서 새로고침 활성화 여부 (기본 true) |

## 실전 패턴

두 플랫폼 모두 스피너 색을 지정하려면 **양쪽 prop을 함께** 넘긴다:

```tsx
<RefreshControl
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
  tintColor="#93c5fd"      // iOS
  colors={["#93c5fd"]}     // Android
/>
```

어두운 배경에서는 이 지정이 사실상 필수 — 기본 스피너 색이 배경에 묻혀 안 보임.

## 동작 차이 요약

| 항목 | iOS | Android |
|------|-----|---------|
| 네이티브 구현 | `UIRefreshControl` | `SwipeRefreshLayout` |
| 스피너 위치 | 리스트가 밀려 내려간 여백 안 | 리스트 위에 오버레이로 내려옴 |
| 색 지정 | `tintColor` | `colors` (배열) |
| 텍스트 표시 | `title` 지원 | 미지원 |
| 크기 조절 | 미지원 | `size` |
| 비활성화 | prop 없음 (조건부 렌더로 처리) | `enabled` |

## 알려진 iOS 버그 (Fabric / New Architecture)

이 프로젝트에서 실측한 문제: iOS 26.5 시뮬레이터 + RN 0.81 + Expo Go에서 `onRefresh`는 정상 호출되지만 스피너가 아예 렌더되지 않음 (콜드 부팅 + 당김 유지 상태에서도 미표시). Android는 정상.

관련 오픈 이슈:

- [#56343](https://github.com/facebook/react-native/issues/56343) — Fabric iOS에서 `tintColor`/`title`이 초기 마운트에 미적용 (0.81.5 보고, 미해결)
- [#37308](https://github.com/facebook/react-native/issues/37308) — 번들 리로드 후 스피너가 세션 내내 사라짐
- [#53987](https://github.com/facebook/react-native/issues/53987) — `tintColor` 무시, 네비게이션 시 스피너 멈춤

대응: JS 로직(`refreshing` 상태, `onRefresh` 핸들러)이 정상이면 코드 문제 아님. 실기기에서 재확인하고, 시뮬레이터 미표시는 무시하고 진행.

## 복습 체크리스트

> 답이 막히면 위 해당 섹션으로. 코드를 안 보고 **말로 설명**할 수 있어야 통과.

- [ ] iOS와 Android의 네이티브 구현이 각각 무엇이고(`UIRefreshControl` / `SwipeRefreshLayout`) 스피너 위치가 어떻게 다른가? — [`RefreshControl`](https://reactnative.dev/docs/refreshcontrol)
- [ ] `refreshing`이 **controlled prop**이라는 게 무슨 뜻인가? `onRefresh` 안에서 `true`로 안 바꾸면? — [`RefreshControl`](https://reactnative.dev/docs/refreshcontrol)
- [ ] 두 플랫폼 모두 스피너 색을 지정하려면 어떤 prop을 함께 넘겨야 하나?(`tintColor` / `colors`) — [`RefreshControl`](https://reactnative.dev/docs/refreshcontrol)
- [ ] 한쪽 전용 prop을 반대 플랫폼에 넘기면 어떻게 되나?
- [ ] 어두운 배경에서 색 지정이 사실상 필수인 이유는?
- [ ] iOS 시뮬레이터에서 스피너가 안 뜰 때, 내 코드 버그인지 네이티브 버그인지 어떻게 판단하나? — [RN #56343](https://github.com/facebook/react-native/issues/56343)
