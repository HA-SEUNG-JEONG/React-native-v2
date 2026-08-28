# P1 학습 가이드 복습 퀴즈 결과

**날짜**: 2026-08-28
**유형**: 학습 기록
**관련 문서**: [docs/p1-study-guide.md](./p1-study-guide.md)

## 결과 요약

총 11문항 — 완전정답 3(3, 6, 11), 부분정답 2(1, 7), 오답/모름 6(2, 4, 5, 8, 9, 10).

---

## 문항별 상세

### 1. View에 문자열 직접 렌더 시 에러 이유 — 부분정답

- **내 답**: "RN의 규칙이기 때문"
- **문제점**: 현상 재진술일 뿐 이유 아님. "규칙이라서 규칙"은 암기 안 됨.
- **정답**: RN에는 DOM이 없다. `View`는 레이아웃 컨테이너 전용, 텍스트 렌더링 능력 자체가 없음. 텍스트는 반드시 `Text` 컴포넌트가 담당.
  ```tsx
  <View>하승</View>              // ✕ "Text strings must be rendered within a <Text>"
  <View><Text>하승</Text></View>  // ✓
  ```
- **암기 고리**: 웹은 `<div>`가 텍스트 노드도 자식으로 받지만, RN `View`는 "레이아웃 박스"일 뿐 — 텍스트는 오직 `Text`의 일.
- 근거: 가이드 §2(1), 38~45줄.

### 2. 원격 Image 안 보일 때 첫 의심 지점 — 오답

- **내 답**: "uri가 올바른지 확인"
- **문제점**: uri 문제는 두 번째 용의자. 첫 번째는 크기.
- **정답**: `width`/`height` 미지정. RN Image는 원격 이미지를 **비동기 로드**하기 때문에 크기를 미리 알 수 없음 → 명시 안 하면 렌더 자체가 안 됨 (웹 `<img>`는 원본 크기로 알아서 뜨는 것과 정반대).
  ```tsx
  <Image style={styles.avatar} source={{ uri: USER.avatar }} />
  // avatar: { width: 120, height: 120, borderRadius: 60 }  ← 이거 없으면 안 보임
  ```
- **암기 고리**: "안 보이는 Image = 크기부터 의심" → uri는 그다음. 순서를 뒤집으면 안 됨.
- 근거: 가이드 §2(2), 47~56줄.

### 3. ScrollView style vs contentContainerStyle — 정답

- **내 답**: "style은 스크롤뷰 자체, contentContainerStyle은 내부 콘텐츠"
- 확인: 정확. `style`은 스크롤 뷰 컨테이너(뷰포트) 자체에, `contentContainerStyle`은 스크롤되는 내부 콘텐츠에 적용. `contentContainerStyle`에 `padding`/`alignItems` 주고, `style`에 `flex: 1`/배경색 주는 식으로 역할 분리.
- 근거: 가이드 §2(3), 58~64줄.

### 4. StyleSheet vs CSS 차이 4가지 — 모름

- **내 답**: "잘 모르겠음"
- **정답 4가지**:
  1. **케이스**: kebab-case → camelCase (`background-color` → `backgroundColor`)
  2. **단위**: `24px`(단위 있음) → `24`(단위 없는 숫자 = dp, 밀도 독립 픽셀)
  3. **상속**: CSS는 cascade로 부모→자식 상속됨 → RN은 **없음**. 부모 `color`가 자식 `Text`로 안 내려감, Text마다 직접 지정해야 함.
  4. **미디어쿼리**: `@media` → **없음**. RN은 P2에서 다룰 `useWindowDimensions` 훅으로 반응형 처리.
- **암기 고리**: "CSS가 가진 편의 기능(상속, 미디어쿼리) RN엔 없다" — StyleSheet는 CSS 아니라 "컴포넌트별 인라인 스타일 객체 모음"에 가까움.
- 근거: 가이드 §4, 146~172줄.

### 5. 조건부 스타일을 배열로 쓰는 이유 — 모름

- **내 답**: "잘 모르겠음"
- **정답**: RN 스타일엔 CSS의 cascade(우선순위 규칙)가 없어서, 조건에 따라 스타일 합성할 문법 자체가 없음. 대신 배열에 여러 스타일을 순서대로 나열하면 **뒤 요소가 앞 요소를 덮어씀** — 이게 cascade 대용 메커니즘.
  ```tsx
  style={[styles.button, following && styles.buttonActive]}
  // following=false → false는 배열에서 무시(falsy 스킵)됨 → styles.button만 적용
  // following=true  → buttonActive가 button을 덮어씀
  ```
- **암기 고리**: "배열 = RN판 cascade". CSS의 `!important`/우선순위 계산 대신 "나중에 오는 게 이긴다"는 단순 규칙.
- 근거: 가이드 §4, 166줄.

### 6. onClick 대응 prop — 정답

- **내 답**: "onPress" — 정답.
- 참고: RN엔 마우스가 아니라 터치라서 이벤트명 자체가 다름. `onLongPress`(길게 누르기)는 웹에 없는 제스처.
- 근거: 가이드 §3, 87~98줄.

### 7. ScrollView 대신 FlatList 필요한 시점 — 부분정답

- **내 답**: "요소가 엄청 많을 때"
- **문제점**: 결과(언제)는 맞았지만 원인(왜) 누락 — 왜 많으면 문제인지 설명 못 하면 실전에서 "얼마나 많아야 FlatList로 바꿔야 하나" 판단 못 함.
- **정답**: ScrollView는 자식을 **전부 한 번에 렌더**(가상화 없음). 아이템 100개면 100개 다 즉시 렌더 → 메모리·초기 렌더 성능 저하. FlatList는 화면에 **보이는 것만** 렌더(가상화)해서 리스트 길이와 무관하게 성능 유지.
- **암기 고리**: "ScrollView = 다 그린다, FlatList = 보이는 것만 그린다". 개수 적고 고정 콘텐츠(프로필 카드 하나) → ScrollView. 개수 많고 동적(피드, 채팅) → FlatList.
- 근거: 가이드 §2(3) 경고 박스, 66줄.

### 8. TextInput onChangeText vs 웹 onChange — 모름

- **내 답**: "잘 모르겠음"
- **정답**: 웹 `<input onChange>`는 **이벤트 객체**를 콜백에 전달 → `e.target.value`로 값 꺼내야 함. RN `onChangeText`는 **문자열 자체**를 바로 콜백 인자로 줌 — 이벤트 객체 감쌀 필요 없음.
  ```tsx
  <TextInput value={email} onChangeText={setEmail} />
  // onChangeText: (text: string) => void  ← text가 바로 문자열
  ```
- **암기 고리**: prop 이름 자체가 힌트 — "Change**Text**" = 텍스트를 준다는 뜻. 웹의 `onChange`처럼 이벤트 객체 기대하면 안 됨.
- 근거: 가이드 §2-1, 68~85줄.

### 9. Pressable style 함수형 인자 / hitSlop — 모름

- **내 답**: "잘 모르겠음"
- **정답 (2부분)**:
  - `style`에 함수를 주면 `{ pressed }` (boolean)를 인자로 받음 — 별도 `useState` 없이 눌림 스타일을 즉시 처리 가능 (웹의 `:active` 의사 클래스 대응).
    ```tsx
    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    ```
  - `hitSlop`: 터치 가능 영역을 실제 뷰 크기보다 확장(작은 아이콘 버튼의 터치 난이도 보완). `number`(사방 동일) 또는 `{top, bottom, left, right}` 객체.
  - **제한 2가지**:
    1. 부모 View 경계를 절대 못 넘음 — 부모가 작으면 hitSlop 값 키워도 소용없음.
    2. 형제 뷰와 겹치면 **Z-index 높은(위에 그려진) 뷰가 터치를 가져감** — hitSlop이 이 규칙을 못 뚫음.
- **암기 고리**: "hitSlop은 터치 영역만 넓히는 것 — 시각적 배치나 레이어 순서는 못 바꾼다."
- 근거: 가이드 §3-1, 101~128줄.

### 10. 확인창을 함수 호출로 쓰는 API — 모름

- **내 답**: "잘 모르겠음"
- **정답**: `Alert` — `Alert.alert(title, message, buttons)`. JSX 컴포넌트 아니라 **명령형 함수 호출**. 웹의 `window.confirm()`/`alert()`에 대응.
- **암기 고리**: `Modal`은 JSX 컴포넌트(화면에 계속 떠 있는 오버레이)지만, `Alert`는 "한 번 부르고 끝나는" 명령형 API라는 점이 결정적 차이.
- 근거: 가이드 §6, 207줄.

### 11. 접근성 프롭 2가지 — 정답

- **내 답**: "accessibilityLabel, accessibilityRole" — 정답.
- 참고: 웹의 `aria-label`/`role` 대응. 모든 Core Component에 붙일 수 있음.
- 근거: 가이드 §6, 210줄.

---

## 종합 약점 패턴

정답/오답 분포를 보면 공통점 하나: **"무엇"은 맞히는데 "왜"를 못 댐** (1번, 7번). 그리고 **"직관적으로 그럴듯한 오답"에 낚임** (2번 — uri가 먼저 떠오르는 게 자연스럽지만 실제 1순위는 크기). 완전히 모른 문항(4, 5, 8, 9, 10)은 전부 **P1에서 상대적으로 늦게 나온 세부 절**(§2-1, §3-1, §4, §6) — 앞부분(§1~3 핵심 3규칙)은 잘 앎, 뒷부분 심화가 약함.

## 재복습 일정 제안

- **1차 재복습 (3일 내)**: 4, 5, 8, 9, 10번 — 완전히 모른 항목 우선.
- **2차 재복습 (1주 내)**: 1, 2, 7번 — 부분정답/오답, 이유까지 설명 가능한지 확인.
- **가이드 섹션**: §2-1(TextInput), §3-1(Pressable 상태), §4(StyleSheet), §6(Alert/Modal/ActivityIndicator/접근성).
