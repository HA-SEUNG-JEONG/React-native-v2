# Day 23 · 11/15 (일) — 미션 2-10 타입 보강

> **오늘의 핵심**: 문서 버전(7.x와 6.x)을 섞지 않고 루트 타입 등록 방식을 실험으로 확인하며, 효과가 없으면 "이 코드에선 불필요"도 근거가 있으면 정답이다.

**시작 상태**: 2-10은 스텁이 손대지 않은 미션(원본 그대로)이다. 현재 코드는 `useNavigation`을 안 쓰므로(grep 0건) 이득이 "미래 확장"에 가깝다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~20 읽기: `src/navigation/types.ts`, `src/navigation/index.tsx`의 네비게이터 정의, React Navigation 7.x TypeScript 문서와 6.x 문서, 설치된 `@react-navigation/core`의 타입 정의(`lib/typescript/src/types.d.ts`의 `RootNavigator` 인터페이스 선언부 주변) → 적을 것: 7.x와 6.x의 루트 타입 등록 방식 차이
- [ ] 20~35 문서 대조 + 먼저 실험: 전역 선언을 넣기 **전에** `useNavigation()` 호출 하나를 임시로 써서 잘못된 화면 이름에 `npm run typecheck`가 에러를 내는지 본다
- [ ] 35~70 수정: 루트 네비게이터 등록, `tabsScreenOptions` 타입, `ProfileScreen`의 `await signOut()` 필요 여부, 죽은 `try/catch` 정리, `import type` 누락 수정. 선언 후 같은 실험으로 차이를 확인하고 임시 `useNavigation()` 호출을 지운다
- [ ] 70~80 검증: `npm run typecheck`(전역 선언 후 기존 코드에서 새 에러가 생기는지) · `npx eslint .`(`ProfileScreen` 경고 해소) · `npm test` · 시뮬레이터: 틀린 비밀번호 → 오류 메시지, 맞는 비밀번호 → 진입, 로그아웃이 기존과 같다
- [ ] 80~90 기록: `docs/improve/reviews/2-10.md`, 실험 전/후 결과와 결론, 내일 할 일 한 줄

## 끝 조건
1. 틀린 비밀번호 → 오류 메시지, 맞는 비밀번호 → 진입, 로그아웃이 기존과 같다. 선언 전/후 실험 결과가 기록돼 있다 (결론이 "이 코드에선 불필요"여도 근거가 있으면 정답)
2. 검증 4종 통과(`ProfileScreen` 경고 해소), 임시 `useNavigation()` 호출 제거
3. 말로 설명: 7.x와 6.x의 루트 타입 등록 방식 차이와 이 프로젝트가 따르는 쪽. `import type`이 런타임에 주는 차이.

## 막히면
- 15분 막힘 → 2-10 힌트 1 요청: 먼저 두 문서(7.x와 6.x)에서 "루트 타입을 어떻게 등록하는가"를 비교한다. 방식이 다르다
- 다시 15분 → 힌트 2 (`BottomTabNavigationOptions`, `satisfies` 연산자의 장단 비교, `import type { … }`), 다시 15분 → 힌트 3
- `tsc`가 조용하다고 효과가 있다고 믿지 않는다. 실험으로 확인한다. 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: [p3-study-guide.md](../p3-study-guide.md) 타입 절, [p1-study-guide.md](../p1-study-guide.md)의 TypeScript 절.
- **먼저 실험 (효과가 있는지)**: 전역 선언을 넣기 **전에** `useNavigation()` 호출 하나를 임시로 써서 잘못된 화면 이름에 `tsc`가 에러를 내는지 본다. 현재 코드는 `useNavigation`을 안 쓰므로(grep 0건) 이득이 "미래 확장"에 가깝다. 선언 후 같은 실험으로 차이를 확인한다. `tsc`가 조용하다고 효과가 있다고 믿지 않는다. 결론이 "이 코드에선 불필요"여도 근거가 있으면 정답이다.
- **코딩 전에 정할 것**
  - 어느 네비게이터를 "루트"로 등록하나. 이 프로젝트는 루트가 로그인 여부로 두 갈래다.
  - `tabsScreenOptions` 타입: 주석(타입 표기)과 `satisfies`의 장단 비교.
  - `ProfileScreen`의 `await signOut()`이 정말 필요한가.
- **수정 중 확인 (주의)**
  - 죽은 `try/catch`는 **안쪽만** 지운다. `LoginScreen`의 바깥 `catch`(`login` 실패 처리)는 살아 있는 경로다.
  - `import type` 누락 대상: `LocationScreen`의 `HomeStackParamList`, `NativeStackScreenProps`.
  - 2-1에서 `LoginScreen`의 prettier 에러가 죽은 try/catch 안에 있었다는 점을 기억한다.
- **임시 코드 되돌릴 곳**: 실험용 `useNavigation()` 호출 (원본 부록 C 표에는 없으나 본문에 "임시로 쓴다"고 적혀 있다). 끝낼 때 `git diff`로 확인한다.
- **기록 포인트**: 선언 전/후 `tsc` 실험 결과, 루트 네비게이터 선택 이유, `satisfies` 비교.
