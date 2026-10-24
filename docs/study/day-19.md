# Day 19 · 11/11 (수) — 미션 2-6 권한·미디어 호출 에러 처리 📱

> **오늘의 핵심**: reject될 수 있는 네이티브 호출을 모두 찾아 사용자가 볼 수 있게 처리하고, 에러를 잡았다면 반드시 보여준다.

**시작 상태**: 2-6은 스텁이 손대지 않은 미션(원본 그대로)이다. 📱 카메라는 실기기가 필요하다. Day 3에서 2-1 경고(`permissionError` 미사용)를 이 미션으로 넘겼다면 오늘 해소된다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~15 읽기: `src/screens/NotificationScreen.tsx`, `src/screens/PhotoScreen.tsx`, `src/screens/NetworkScreen.tsx`의 이미지 선택 → 적을 것: 사용자가 누른 뒤 `await`하는 호출이 어디인가
- [ ] 15~35 호출 표 작성(코딩 전): 아래 `grep`으로 세 화면의 `await` 네이티브 호출을 전부 찾아 표를 만든다. 미션 문서의 표와 대조하고 빠진 호출이 있으면 기록한다
- [ ] 35~70 수정: 세 화면의 호출을 `try/catch`로 감싸고 메시지를 렌더한다. `NetworkScreen`의 `assets` 방어도 추가한다. `canceled` 처리, `blocked`와 `permissionError` 구분, 성공 시 이전 에러 지우는 위치, `try` 범위는 아래 참고
- [ ] 70~80 검증: `npm run typecheck` · `npx eslint .` · `npm test` · 시뮬레이터에서 알림 권한 요청 → 허용/거부/설정 열기가 이전과 같은지 · Photo 화면 카메라 촬영이 시뮬레이터에서 에러를 화면에 보이는지 · 📱 실기기: 카메라 촬영 성공/취소/권한 영구 거부 3경로
- [ ] 80~90 기록: `docs/improve/reviews/2-6.md`, 실기기가 없으면 "미검증"이라고 기록, 내일 할 일 한 줄

```bash
grep -n "await" src/screens/NotificationScreen.tsx src/screens/PhotoScreen.tsx src/screens/NetworkScreen.tsx
```

## 끝 조건
1. 시뮬레이터에서 알림 권한 허용/거부/설정 열기가 이전과 같고, Photo 화면 카메라 에러가 화면에 보인다. 📱 실기기 3경로를 확인했거나 "미검증"이라고 적었다
2. 세 화면의 호출을 감싸고 메시지를 렌더, `NetworkScreen`의 `assets` 방어 추가. 검증 4종 통과
3. 말로 설명: 어떤 호출이 왜 reject될 수 있나(권한, 기기 기능, OS 정책). `canceled`와 에러의 차이.

## 막히면
- 15분 막힘 → 2-6 힌트 1 요청: 세 화면에서 "사용자가 누른 뒤 `await`하는 호출"을 모두 표로 만들고, 거부되면 화면에 무엇이 보여야 하는지 한 줄씩 적는다
- 다시 15분 → 힌트 2 (`try/catch`와 에러 메시지 상태, `NotificationScreen`의 `permissionError`, `getPermissionsAsync().catch` 안의 패턴, `blocked &&` 블록 근처의 조건부 `Text`), 다시 15분 → 힌트 3 (공유 에러 상태 지우는 위치, `canceled`는 에러가 아님, `pickAndUpload`의 `finally`와 `try` 범위)
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: [p5-study-guide.md](../p5-study-guide.md) W11(사진)·W14(알림)의 권한 플로우 절 (`canAskAgain`, `Linking.openSettings`). P5는 체크리스트로 막힌 항목만.
- **호출 표를 먼저 만든다 (힌트 1 그대로)**

| 화면  | 호출  | 거부되면 | 화면에 보여야 할 것 (한 줄) |
| --- | --- | ---- | ----------------- |

  `await`하는 네이티브 호출을 세 화면에서 전부 찾는다. 미션 문서의 표와 내 표가 일치하는지 대조하고, 빠진 호출이 있으면 기록한다 (문서도 `LocationScreen`의 `requestPermission`을 범위 밖 관찰로 적었다).
- **코딩 전에 정할 것**
  - 여러 호출이 같은 에러 상태 하나를 공유할 때, 성공 시 이전 에러를 지우는 위치.
  - `canceled`는 에러가 아니다. 사용자가 취소한 것을 오류로 표시하지 않는다.
  - `blocked`(영구 거부 안내)와 `permissionError`(호출 실패)는 사용자가 할 수 있는 행동이 다르다. 같은 메시지로 뭉개지 않는다.
  - `NetworkScreen`의 `finally`가 `setUploadRatio(null)`을 하므로 `try` 범위를 어디까지 넓힐지.
  - Day 3에서 2-1 경고(`permissionError` 미사용)를 이 미션으로 넘겼다면 오늘 해소된다. `npx eslint .`에서 확인한다.
- **임시 코드 되돌릴 곳**: 없음.
- **기록 포인트**: 호출 표와 미션 문서 표의 차이, 실기기 검증 여부(없으면 "미검증"으로 기록하고 "됐다"고 쓰지 않는다).
