# React Native 커리큘럼 (사이드 프로젝트 출시 목표 · 실전 심화)

## 목적

**사이드 프로젝트를 만들어 출시하는 것**이 목표. 그래서 순서는 **앱 뼈대 → 기능 → 출시**. 아키텍처/엔진 내부는 **후순위**(필요할 때만 부록에서 just-in-time).

**깊이의 정의 (재정의)**: "엔진이 어떻게 도는가"가 아니라 **"실전 기능을 프로덕션 품질로 만드는가"**. 즉 각 주제에서 happy-path 너머 — **로딩/에러/빈 상태, 권한 실패, 오프라인, 성능, UX 완성도**까지. 얕은 튜토리얼은 여기서 벗어남.

**학습자**: 강한 React + TS 웹 개발자. React/hooks 앎 → RN에서 다른 지점만. JS 기초 스킵.

**제약**: 주 5~10h, 6개월(~180h). Expo로 실습·출시.

**원칙**:
1. **출시 지향** — 매 Phase가 실제 출시 가능한 앱에 기여. 버릴 실습 안 만듦.
2. **공식문서 + 프로덕션 관례** — Expo/RN 공식 + 실무가 실제 쓰는 라이브러리.
3. **완성도로 깊이** — 기능마다 엣지케이스·실패·성능까지 처리해야 졸업.
4. **엔진은 나중** — 성능 벽에 부딪히면 그때 부록의 내부 지식으로 내려감.

---

## 개요 (24주)

| Phase | 주 | 주제 | 왜 이 순서 |
|-------|-----|------|-----------|
| P1 | 1–2 | 셋업 + RN 멘탈모델 | 웹→RN 전환, 빠르게 |
| P2 | 3–4 | 레이아웃/스타일 실전 | 화면 만드는 기본기 |
| P3 | 5–7 | 네비게이션 실전 | **앱 뼈대** (라우팅·인증) |
| P4 | 8–10 | 리스트·데이터·상태 | 실데이터 화면 |
| P5 | 11–14 | 네이티브 기능 | **사이드 프로젝트 핵심** (카메라·위치·저장·알림) |
| P6 | 15–17 | 폼·네트워킹·오프라인 | 견고한 데이터 계층 |
| P7 | 18–20 | 인터랙션 완성도 | UX 품질 (제스처·애니메이션) |
| P8 | 21–24 | **출시** | 빌드·스토어·크래시·OTA |
| 부록 | 필요시 | 아키텍처/엔진 내부 | 성능 벽·네이티브 모듈 필요할 때 |

---

## P1 (W1–2) — 셋업 + RN 멘탈모델
빠르게 통과. 웹과 **다른 지점만**.
- Expo/Expo Go/개발빌드, Fast Refresh. Core Components(`View`/`Text`/`Image`/`ScrollView`/`TextInput`), "DOM 없음", `onPress`.
- 문서: reactnative.dev The Basics.
- 실습: 프로필 카드(완료).

## P2 (W3–4) — 레이아웃/스타일 실전
- Flexbox(기본 column 함정), `StyleSheet`, SafeArea(`react-native-safe-area-context`), 반응형(`useWindowDimensions`), 플랫폼별 스타일, 다크모드(`useColorScheme`), 절대배치/`zIndex`/`elevation`.
- **깊이**: 복잡 레이아웃(스티키 헤더, 겹친 아바타), 노치/키보드 대응.
- 실습: Flexbox 플레이그라운드 + 가로 카드(완료). 추가로 실제 앱 화면 1개 픽셀 맞춤.

## P3 (W5–7) — 네비게이션 실전 (앱 뼈대)
문서: React Navigation. 여기서 앱 구조가 잡힘.
- `native-stack`, 탭, 모달, 중첩 네비게이터, 헤더 커스텀, 타입 안전 파라미터.
- **인증 플로우**(로그인 전/후 스택 분기), 딥링크, `expo-router`(파일 기반) 병행.
- **깊이**: 화면 생명주기(focus/blur), 뒤로가기, 상태 지속.
- 실습: 탭 3개 + 스택 + 모달 + 로그인 게이트 + 딥링크 1개(완료).

## P4 (W8–10) — 리스트·데이터·상태
- `FlatList`(성능 파라미터, 무한스크롤, pull-to-refresh, 빈 셀 대응), `SectionList`.
- **TanStack Query**(이미 앎 → RN 적응: 포커스 refetch, `netinfo`, `useInfiniteQuery`), 상태관리(Zustand 등) RN 관점.
- **깊이**: 로딩/에러/빈/오프라인 4상태 전부, 낙관적 업데이트 기초, 이미지 리스트 최적화(`expo-image`).
- 실습: 실 API 무한스크롤 목록 + 4상태 처리(완료).

## P5 (W11–14) — 네이티브 기능 (사이드 프로젝트 핵심)
프로젝트가 뭐든 대부분 여기서 갈림. 자주 쓰는 것 **깊게**.
- **W11 카메라/이미지**: `expo-image-picker`, `expo-camera`, `expo-media-library`, 업로드(FormData/프리사인).
- **W12 위치/지도**: `expo-location`(권한 플로우 iOS/Android 차이, 정확도, 백그라운드 개념), `react-native-maps`(마커·클러스터).
- **W13 저장/보안**: `AsyncStorage` vs `react-native-mmkv`(빠름), `expo-secure-store`(토큰), `expo-file-system`, SQLite 개념.
- **W14 알림/공유/링크**: `expo-notifications`(APNs/FCM, 포그라운드/백그라운드/killed 상태 처리), `expo-sharing`, `Linking`.
- **깊이**: 권한 거부/재요청 UX, 실패·타임아웃 처리, 플랫폼 차이.
- 실습: 사진 촬영→저장→목록 + 지도에 위치 표시 + 로컬 알림(완료).

## P6 (W15–17) — 폼·네트워킹·오프라인
- `TextInput` 심화, `KeyboardAvoidingView`, **react-hook-form** + zod(웹 지식 재활용), 유효성/에러.
- 네트워킹: 인터셉터, **토큰 갱신 레이스**, 재시도/백오프, 업로드 진행률, `WebSocket` 개념.
- **오프라인 우선**: React Query 영속화(MMKV), 낙관적 업데이트 + 롤백, 동기화/충돌.
- 실습: 로그인 폼 → 토큰 저장/갱신 → 오프라인에서 쓰고 복귀 시 동기화(완료). W16 재시도/백오프+업로드 진행률+WebSocket도 완료.

## P7 (W18–20) — 인터랙션 완성도 (UX 품질)
문서: Reanimated + Gesture Handler. 앱을 "그럴듯하게".
- Reanimated 3(`useSharedValue`/`useAnimatedStyle`/`withTiming`), 네이티브 드라이버 개념(왜 부드러운지 정도만).
- Gesture Handler(스와이프/드래그), 바텀시트(`@gorhom/bottom-sheet`), 화면 전환/공유요소, 스켈레톤/로딩 애니메이션.
- **깊이**: 60fps 유지, 제스처+애니메이션 결합. (워클릿 스레드 이론은 부록으로.)
- 실습: 스와이프 삭제 리스트 + 바텀시트 + 부드러운 전환.

## P8 (W21–24) — 출시
문서: EAS. 목표 달성 구간.
- **W21 빌드**: `eas build`, `app.config`, 앱아이콘/스플래시, 버전/빌드넘버, 환경/시크릿.
- **W22 iOS 출시**: Apple Developer, EAS 자동 서명, `eas submit`, TestFlight, App Store Connect 메타/스크린샷/개인정보 라벨.
- **W23 Android + 관측**: Google Play(내부 테스트→프로덕션), Sentry(소스맵/심볼리케이션), 크래시 대응.
- **W24 운영**: **OTA(expo-updates)** 핫픽스, 릴리스 체크리스트, 단계적 롤아웃, 롤백.
- 실습: 실제 스토어 심사 제출 + OTA 업데이트 1회.

---

## 부록 — 아키텍처/엔진 내부 (후순위, just-in-time)
성능 벽·복잡한 네이티브 요구·깊은 디버깅이 필요할 때 내려감. 출시 전 필수 아님.
- **아키텍처**: New Architecture(JSI·Fabric·TurboModules·Codegen), 구 브리지와 차이.
- **스레드/엔진**: JS/UI/Shadow 3스레드, Hermes 바이트코드, 프레임 예산.
- **렌더 파이프라인**: Fiber→Shadow(Yoga)→Host View 3-트리.
- **Yoga 내부**: measure/layout 패스.
- **리스트 내부**: virtualization 윈도잉, 셀 재활용 부재, FlashList.
- **워클릿**: UI 스레드 JS 실행, `runOnJS`/`runOnUI`.
- **네이티브 모듈 작성**: Expo Modules API(Swift/Kotlin), config plugin.

트리거: "리스트가 느린데 파라미터로 안 잡힘"→virtualization 내부. "JS만으로 안 되는 기능"→네이티브 모듈. "애니메이션 끊김"→워클릿 스레드.

---

## 학습 방식
- 각 기능: **동작시킴 → 엣지/실패/성능까지 처리 → 졸업**. happy-path만이면 미졸업.
- 하나의 **샌드박스 앱**에 화면 누적 → P8에서 실제 출시하는 앱으로 성장.
- 막히면: 공식문서 → 라이브러리 문서/이슈 → (성능/네이티브면) 부록.

## 검증
- Phase 졸업 = 실습이 **4상태(정상/로딩/에러/빈·오프라인) + 성능 확인**까지 되면 통과.
- **P3 종료**: 네비게이션+인증 뼈대 = 앱 형태 완성.
- **P5 종료**: 네이티브 기능 = 사이드 프로젝트 차별화 기능 구현 가능.
- **P8 종료**: 스토어 심사 제출 = 목표 달성.
