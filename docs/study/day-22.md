# Day 22 · 11/14 (토) — 미션 2-9 의존성·설정 정리

> **오늘의 핵심**: 문서의 판정표를 그대로 믿지 않고 명령으로 직접 검증하며, 해당 없는 항목(`eslint-config-prettier`)은 근거를 한 줄로 남긴다.

**시작 상태**: 2-9는 스텁이 손대지 않은 미션(원본 그대로)이다. `userInterfaceStyle`은 3-4의 Splash 항목도 같은 줄을 건드리므로 오늘 한쪽에서만 정하고 기록한다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~15 읽기: `package.json`, `app.json`, `eslint.config.js`. app config 속성은 SDK 54 기준으로 직접 확인 → 적을 것: 속성 이름 확인 결과 (문서도 "최신판 본문"이라 속성 이름을 확인하라고 했다)
- [ ] 15~35 판정표 검증: 6개 행을 각각 아래 명령으로 확인해 O/X를 쓴다. 문서와 다르면 그 사실을 기록한다
- [ ] 35~70 수정: 결정할 것(아래 참고, 각각 한 줄)을 정하고 `npx expo install <pkg>`로 반영한다. 설정 해석 결과는 `npx expo config`로 본다
- [ ] 70~80 검증: `npm run typecheck` · `npx eslint .` · `npm test` · `npx expo install --check`(동작은 확인 필요) · 앱 정상 기동
- [ ] 80~90 기록: `docs/improve/reviews/2-9.md`, `eslint-config-prettier` 근거 한 줄, `userInterfaceStyle` 결정(3-4와 겹침), 내일 할 일 한 줄

```bash
grep -rn "@react-navigation/elements" src App.tsx package.json
grep -rn "expo-status-bar" src App.tsx index.ts package.json
grep -n "eslint-config-prettier" package.json
```

## 끝 조건
1. 판정표 6개 행이 O/X로 채워져 있고 문서와 다른 곳이 기록돼 있다. 앱이 정상 기동한다
2. 검증 4종 통과. 해당 없는 항목은 근거 한 줄이 있다
3. 말로 설명: 직접 import하는 패키지를 선언해야 하는 이유(phantom dependency). 권한 문구가 JS가 아니라 네이티브 빌드에 들어가는 이유.

## 막히면
- 15분 막힘 → 2-9 힌트 1 요청: 먼저 각 항목을 `grep`/설정 파일로 직접 확인해 위 표가 맞는지 검증한다. 틀리면 그 사실을 기록한다
- 다시 15분 → 힌트 2 (`npx expo install <pkg>`, `npm uninstall`, `package.json`의 `engines`, `app.json` 플러그인 배열 `[이름, 옵션객체]`), 다시 15분 → 힌트 3 (Expo Go에서는 권한 문구가 적용되지 않음, 문구 언어, `userInterfaceStyle` 영향 범위)
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: Expo SDK 54 app config 문서(속성 이름 직접 확인). 미션 문서 [tier2-quality.md](../improve/tier2-quality.md)의 2-9 절.
- **판정표 검증 (힌트 1)**: 6개 행을 각각 명령으로 확인해 O/X를 쓴다. 문서와 다르면 그 사실을 기록한다.
- **코딩 전에 정할 것 (각각 한 줄)**
  - `expo-status-bar`: 제거/사용. **시뮬레이터에서 상태바 글자가 어두운 배경 위에서 읽히는지 먼저 본다.** `userInterfaceStyle`이 `"light"`인 점이 변수다.
  - `engines`: React Native 요구치(`>= 20.19.4`)만 보면 `npm test`(Node가 `.ts`를 직접 실행)의 요구 버전을 놓친다. Node 문서에서 type stripping 기본 활성 버전을 찾아 하한을 정한다.
  - 권한 문구: 앱 언어(한국어)와 맞출지. `photosPermission`뿐 아니라 `cameraPermission`, 위치·알림 플러그인 항목을 어떻게 할지.
  - `userInterfaceStyle`: **3-4의 Splash 항목도 같은 줄을 건드린다.** 오늘 한쪽에서만 정하고 기록한다.
- **수정 중 확인 (주의)**
  - `npx expo install <pkg>`를 쓴다 (`npm install`은 SDK 호환 버전을 보장하지 않는다).
  - Expo Go에서는 `app.json`의 권한 문구가 적용되지 않는다. 시뮬레이터로는 눈으로 확인할 수 없으니, 설정 해석 결과를 본다(`npx expo config` 계열, 옵션은 `--help`로 확인).
  - 설정 변경은 Metro 재시작이 필요할 수 있다.
- **임시 코드 되돌릴 곳**: 없음.
- **기록 포인트**: 판정표의 O/X와 문서와 다른 점, 항목별 결정 한 줄, `userInterfaceStyle`을 어느 미션에서 정했는지.
