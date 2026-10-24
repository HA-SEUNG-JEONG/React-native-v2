# Day 20 · 11/12 (목) — 미션 2-8 접근성

> **오늘의 핵심**: 의미 없는 컨테이너(`Pressable`, `View`)에는 role·label·state를 직접 알려야 하므로 공통 컴포넌트 `Btn`부터 고친다.

**시작 상태**: 2-8은 스텁이 손대지 않은 미션(원본 그대로)이다. Xcode의 **Accessibility Inspector**를 처음 쓰면 그 절차 자체가 오늘의 학습이다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~15 읽기: `src/components/Btn.tsx` 전체, RN 0.81 Accessibility 문서(`role` / `accessibilityRole` 우선순위), `Pressable` 문서의 `hitSlop` → 적을 것: `Btn`이 가질 수 있는 상태(비활성, 진행 중)와 props 비교
- [ ] 15~35 현황 점검: 아래 `grep`으로 `Btn`, `TextInput` 5곳, 직접 쓴 `Pressable`(`ComposeScreen`, `FeedListScreen` 시트 옵션, `FeedSectionsScreen`)을 표로 만들고 "이게 지금 스크린 리더에 어떻게 읽히나"를 적는다. Accessibility Inspector로 시뮬레이터 요소의 role·label·state를 직접 본다
- [ ] 35~70 수정: `Btn` 하나만 먼저 고친다 (role, 비활성/진행 중 상태). 이어서 로그인 입력란 label, 필요한 곳의 `hitSlop`. 확인할 것 4가지는 아래 참고
- [ ] 70~80 검증: Accessibility Inspector에서 `Btn`의 role=button, 비활성/진행 중 상태, 로그인 입력란의 label을 확인하고, 화면 모양과 레이아웃이 그대로인지 · `npm run typecheck` · `npx eslint .` · `npm test`
- [ ] 80~90 기록: `docs/improve/reviews/2-8.md`, `hitSlop`을 둘 곳과 이유(3-2 연결), 내일 할 일 한 줄

```bash
grep -rn "accessib\|aria-\|role=\|hitSlop" src
```

## 끝 조건
1. Accessibility Inspector에서 `Btn`의 role=button, 비활성/진행 중 상태, 로그인 입력란의 label이 보이고 화면 모양과 레이아웃은 그대로다
2. 검증 4종 통과, `hitSlop`을 둘 곳과 이유가 기록에 있다
3. 말로 설명: 웹 `<button>`과 RN `Pressable`이 접근성 정보에서 다른 점. `placeholder`가 `label`을 대신할 수 없는 이유.

## 막히면
- 15분 막힘 → 2-8 힌트 1 요청: `Btn` 하나만 먼저 고친다. 버튼이 가질 수 있는 상태가 무엇인지 props와 비교해 본다
- 다시 15분 → 힌트 2 (`role="button"` 또는 `accessibilityRole`, `accessibilityState`의 `disabled`/`busy`, 입력란의 `accessibilityLabel`, `hitSlop`의 `Rect | number`), 다시 15분 → 힌트 3 (`role` 우선순위, `Pressable`의 `disabled` 자동 합산, 자동 라벨 덮어쓰기, `hitSlop` 오터치)
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: [p2-study-guide.md](../p2-study-guide.md) §8 + [p1-study-guide.md](../p1-study-guide.md) §3-1(스타일 배열).
- **확인할 것 (힌트 3, 수정 중 확인)**
  - `role`이 `accessibilityRole`보다 우선한다. 둘을 섞지 않는다.
  - `Pressable`이 `disabled`를 `accessibilityState`에 자동으로 합쳐 주는지 RN 소스(`node_modules/react-native/Libraries/Components/Pressable/Pressable.js`)에서 직접 본다. 이미 있는 것을 중복으로 넣지 않는다.
  - `Btn`은 텍스트 자식이 있어 자동 라벨이 있다. 라벨을 덮어쓰면 화면 글자와 달라질 수 있다.
  - `hitSlop`: `Btn`은 높이가 이미 충분할 수 있다. 필요한 대상을 먼저 정한다. 이웃 버튼 쪽으로 넓히면 오터치가 난다.
- **연결**: 3-2에서 `ComposeScreen`의 수제 `Pressable`이 `Btn`으로 바뀐다. 그때 `Btn`이 같은 `hitSlop` 효과를 내야 한다. 오늘 `hitSlop`을 둘 곳과 이유를 기록에 남긴다.
- **임시 코드 되돌릴 곳**: 없음.
- **기록 포인트**: 현황 표(스크린 리더에 읽히는 방식), `hitSlop`을 둘 곳과 이유.
