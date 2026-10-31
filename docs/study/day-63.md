# Day 63 · 1/21 (목) — FlatList 튜닝과 시작 성능

> 건너뛰기 가능: 측정과 튜닝만 하는 Day라 이후 Day의 앱 기능이 이 결과에 의존하지 않는다. 건너뛰면 "읽기"만 하고 만들기는 하지 않는다.

## 오늘의 목표

피드 `FlatList`에 1000개 항목을 넣고 `windowSize` 등 옵션을 바꿔 가며 빈 영역과 JS 프레임률을 비교하고, 번들 분석으로 시작 시 무거운 모듈 후보를 찾는다.

## 읽기(15분)

1. [React Native — Optimizing FlatList Configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration)
   - 용어(Viewport, Window, Blank areas)의 정의를 찾는다. Window는 항목이 마운트되어 있어야 하는 영역이고 보통 뷰포트보다 훨씬 크다.
   - `windowSize`(기본 21, 단위는 뷰포트 높이), `initialNumToRender`(기본 10), `maxToRenderPerBatch`(기본 10), `updateCellsBatchingPeriod`(기본 50ms), `removeClippedSubviews`의 값을 키울 때와 줄일 때의 득실을 표로 정리한다.
   - `getItemLayout`을 쓸 수 있는 조건(모든 항목의 높이가 같을 때)과 그 이유를 찾는다.
2. [React Native — Performance Overview](https://reactnative.dev/docs/performance)
   - JS 스레드와 UI 스레드가 각각 맡는 일을 구분한다. Dev Menu의 "Show Perf Monitor"가 두 FPS를 보여 준다.
   - 개발 모드(`dev=true`)에서는 JS 성능이 크게 떨어지므로 성능은 릴리스 빌드에서 측정하라는 문장과, 번들된 앱에서 `console.*` 호출이 JS 스레드 병목이 된다는 문장을 찾는다.
3. [Expo — Analyzing bundles (Atlas)](https://docs.expo.dev/guides/analyzing-bundles/)
   - `EXPO_ATLAS=true npx expo start`로 Atlas를 켜고 Shift+M의 개발 도구 플러그인 메뉴에서 연다는 절차를 확인한다.
   - 개발 모드는 일부 최적화를 끄므로 실제 번들 크기에는 `--no-dev` 모드가 더 가깝다는 문장을 찾는다.

## 예측(10분)

1. 항목 1000개를 `FlatList`에 넣고 스크롤하기 전에 화면에 마운트된 글 카드 인스턴스는 대략 몇 개일까? (React Components 패널에서 확인할 값)

   > 내 예측:

2. `windowSize={5}`로 줄이고 빠르게 스크롤하면 기본값일 때와 무엇이 달라질까?

   > 내 예측:

3. 같은 스크롤을 `--no-dev` 모드(릴리스에 가까운 모드)에서 하면 개발 모드보다 JS FPS가 어떻게 달라질까?

   > 내 예측:

## 만들기(40분)

앱 기능은 추가하지 않고, 피드 탭 화면(`FlatList`를 그리는 화면 파일)을 임시로 바꿔 측정한다. 끝나면 임시 코드를 되돌린다.

**1. 부하 데이터 (임시)**
- JSONPlaceholder에서 받은 글 100개를 10번 복제해 1000개로 만들되 `id`가 겹치지 않게 한다(`keyExtractor`가 쓰는 값이다).

  ```ts
  const heavy = Array.from({ length: 1000 }, (_, i) => ({ ...posts[i % posts.length], id: i }));
  ```

**2. 옵션 비교 (개발 모드에서 먼저)**
- Dev Menu(터미널에서 `m`)의 "Perf Monitor"를 켜고 목록을 빠르게 끝까지 스크롤한다.
- 조건 3가지를 같은 방식으로 시험하고 표에 적는다.
  - A: 기본값
  - B: `windowSize={5}`
  - C: `windowSize={5}` + `maxToRenderPerBatch={4}`
- 글 카드 높이가 모두 같다면 `getItemLayout`을 추가한 D 조건도 시험한다. 높이가 제각각이면 D는 하지 않고 이유를 적는다.

| 조건 | 빈 영역이 보였는가 | JS FPS 최저치 (Perf Monitor) |
|---|---|---|
| A 기본값 | | |
| B windowSize 5 | | |
| C windowSize 5 + maxToRenderPerBatch 4 | | |
| D getItemLayout (해당할 때) | | |

**3. 릴리스에 가까운 모드로 재측정**
- `npx expo start --no-dev --minify`로 서버를 다시 띄우고 A와 가장 좋았던 조건 하나를 다시 측정한다.

**4. 번들 분석**
- `EXPO_ATLAS=true npx expo start --no-dev`로 실행하고 Shift+M으로 Atlas를 열어, 가장 큰 모듈 3개를 적는다. 그중 시작 화면에 꼭 필요하지 않아 보이는 것 1개를 후보로 적는다(코드는 바꾸지 않는다).
- 선택 과제: `app/_layout.tsx` 모듈 최상단에서 `const t0 = Date.now()`를 저장하고, 피드 화면 첫 `useEffect`에서 `Date.now() - t0`를 로그로 남긴다. 이 값은 네이티브 앱 시작 시간이 아니라 "JS 모듈 로드부터 첫 피드 화면 마운트까지"임을 기록에 함께 적는다.

완료 기준
- [ ] 표의 A~C(와 가능하면 D)가 채워져 있다.
- [ ] `--no-dev` 측정 결과가 개발 모드 결과와 비교되어 한 문장으로 적혀 있다.
- [ ] Atlas에서 확인한 큰 모듈 3개와 후보 1개가 기록에 있다.
- [ ] 1000개 부하 데이터와 임시 로그가 커밋에 남아 있지 않다.

## 검증(10분)

- 예측 1~3과 표를 비교해 다른 지점을 적는다. 가장 많이 다른 항목 하나에 대해 이유를 한 문장으로 추정한다.
- 확인한 옵션 중 "메모리를 아끼는 대신 빈 영역이 늘어나는" 조합이 어느 것이었는지 적는다.

> 실제 결과 / 예측과 다른 지점:

**깨뜨려 보는 실험**: 글 카드 안에서 렌더마다 `console.log`를 100번 반복하는 반복문을 임시로 넣고, `--no-dev` 모드에서 같은 스크롤을 한다. FPS가 어떻게 변하는지 적은 뒤 제거한다.

## 이해 점검 질문

1. `windowSize`를 기본값 21에서 5로 줄이면 무엇을 얻고 무엇을 잃는가?
2. `getItemLayout`이 스크롤 성능에 도움이 되는 이유와 쓸 수 있는 조건은?
3. 성능 비교를 개발 모드가 아니라 릴리스에 가까운 모드에서 해야 하는 이유는?

<details>
<summary>정답</summary>

1. 얻는 것은 동시에 마운트되는 항목이 줄어 메모리와 렌더 부담이 감소하는 점이다. 잃는 것은 빠르게 스크롤할 때 아직 렌더되지 않은 구간이 보이는 빈 영역이 늘어날 가능성이다. 기본값 21은 화면 높이의 위 10배, 아래 10배, 현재 1배를 뜻하므로 5는 훨씬 좁은 범위만 미리 준비한다.
2. 항목 높이를 알려 주면 `FlatList`가 각 항목을 렌더해서 비동기로 측정하지 않고도 위치를 계산할 수 있어 스크롤 오프셋 계산과 점프가 빨라진다. 모든 항목의 높이(가로 리스트는 너비)가 같을 때 쓸 수 있다. 높이가 제각각인데 억지로 쓰면 위치가 어긋난다.
3. 개발 모드는 경고·에러 메시지 처리 같은 추가 작업 때문에 JS 성능이 크게 낮아지고 `console.*`도 병목이 되므로 사용자가 겪는 성능과 다르다. 같은 옵션이라도 개발 모드에서는 느린 것이 옵션 때문인지 개발 모드 때문인지 구분할 수 없다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `docs: FlatList 옵션별 스크롤 측정과 번들 분석 결과 기록`

## 웹과 다른 점

웹의 긴 목록은 브라우저가 스크롤을 처리하지만, React Native의 `FlatList`는 화면 밖 항목을 언마운트하는 윈도잉을 JS에서 계산하므로 빠르게 스크롤하면 빈 영역이 보일 수 있다.
