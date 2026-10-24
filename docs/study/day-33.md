# Day 33 · 11/25 (수) — Tier 3 종료 절 + P8 준비 읽기

> **오늘의 핵심**: 21개 미션에서 반복된 실수를 Tier 3 종료 절의 약점 패턴과 재복습 일정으로 남기고, P8(출시)의 토대(`app.json` 정리, 테스트 기반, 에러 모델)가 맞는지 전체 점검한다.

**시작 상태**: 새 코드를 쓰는 날이 아니다. [Day 32](./day-32.md)까지 3-1~3-4가 끝나 있고, 각 미션의 `docs/improve/reviews/N-N.md`가 쌓여 있다. 이 기록과 Tier 1·2 종료 절(Day 14, Day 28)이 오늘의 재료다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch`, `nvm use 22.21.1`, 어제 "내일 할 일" 확인
- [ ] 05~25 작성: Tier 3 종료 절의 "종합 약점 패턴" — 아래 참고의 질문 3개에 답한다 → 적을 것: 개별 오답 나열이 아니라 공통점
- [ ] 25~40 작성: "재복습 일정" — 완전히 모른 항목은 1차(3일 내), 부분정답·오답은 2차(1주 내)
- [ ] 40~50 점검: 전체 점검 명령 실행 (`npm run typecheck && npm test && npx eslint .`, `git diff main...HEAD --stat`, `grep -rn "console\." src App.tsx`) → 확인: 0 errors, 미션 범위 밖 파일이 diff에 없음, 의도된 console만 남음
- [ ] 50~65 정리: `docs/improve/README.md`의 `- [ ]`에 21개 미션 체크리스트 상태 반영 (사용자 직접 체크), 열린 항목 목록(미검증 📱 항목) 정리, `/doc`으로 전체 기록
- [ ] 65~90 읽기: `docs/react-native-curriculum.md`의 W21~W24 절 → 확인: `src/api/persist.ts` 주석의 Expo Go → dev build 전환과 MMKV 교체가 W21과 함께 들어간다는 점, `app.json`이 정리되어 있어야 빌드 설정이 덜 흔들린다는 점(2-9)

## 끝 조건
1. Tier 3 종료 절(종합 약점 패턴 + 재복습 일정)이 `docs/improve/reviews/`에 쓰여 있고, 열린 항목 목록(미검증 📱 포함)이 정리돼 있다.
2. `npm run typecheck && npm test && npx eslint .`가 통과하고 `git diff main...HEAD --stat`에 미션 범위 밖 파일이 없다.
3. 말로 설명: P8이 Tier 1~3의 어떤 결과물(`app.json` 정리, 테스트 기반, 에러 모델) 위에 서는가.

## 막히면
- 약점 패턴이 개별 사례 나열로 흐르면: 아래 질문 3개를 하나씩 답하고, 21개 전체에서 같은 유형(임시 코드 미제거, 정책을 안 적음, 한쪽 경로만 수정 등)이 몇 번 나왔는지 센다.
- `git diff main...HEAD --stat`에 낯선 파일이 보이면: 어느 미션에서 들어왔는지 확인하고 열린 항목에 적는다.
- 시간이 모자라면: P8 읽기를 11/26 예비일([Day 34~35](./day-34.md))로 넘긴다.

## 참고 (아래로 밀어 둠)

**읽을 학습 가이드 절**: `docs/react-native-curriculum.md`의 W21~W24 절.

**종료 절 질문 후보 (종합 약점 패턴 + 재복습 일정)**
- 3-3에서 "측정 전 직감"과 "측정 결과"가 달랐던 곳은?
- 3-2에서 추출하지 않고 남긴 것의 판단 기준은?
- 21개 전체에서 가장 자주 나온 실수 유형은? (임시 코드 미제거, 정책을 안 적음, 한쪽 경로만 수정 등)

**전체 점검**

```bash
npm run typecheck && npm test && npx eslint .
git diff main...HEAD --stat
grep -rn "console\." src App.tsx
```

- 21개 미션 체크리스트 상태를 `docs/improve/README.md`의 `- [ ]`에 반영한다 (사용자 직접 체크).
- 열린 항목 목록(미검증 📱 항목)을 정리한다.
- `/doc`으로 전체 기록을 남긴다.

**P8 준비 읽기**: `docs/react-native-curriculum.md`의 W21~W24 절. `src/api/persist.ts` 주석의 Expo Go → dev build 전환과 MMKV 교체가 W21과 함께 들어간다는 점, `app.json`이 정리되어 있어야 빌드 설정이 덜 흔들린다는 점(2-9)을 확인한다. P8(출시)은 11/28 (토)부터이고 커리큘럼 기준 W21 빌드 → W22 iOS 출시 → W23 Android + Sentry → W24 OTA다. 일자별 상세는 W21을 시작하는 날 별도로 만든다.

**수정 중 확인**: 없음 (코드를 쓰는 날이 아니다).

**임시 코드 되돌릴 곳**: 없음 (`grep -rn "console\." src App.tsx` 결과가 Day 27 분류표의 "의도된 것"과 같은지만 대조).

**기록 포인트**: Tier 3 종료 절(종합 약점 패턴 + 재복습 일정), 열린 항목 목록, 21개 미션 체크 상태.
