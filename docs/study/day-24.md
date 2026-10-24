# Day 24 · 11/16 (월) — 미션 2-11 테스트 확장 (1/2): 순수 로직 분리

> **오늘의 핵심**: "Node에서 import되는가"를 기준으로 코드를 분류하고, 동작을 바꾸지 않고 순수 부분만 분리해 단위 테스트를 단다.

**시작 상태**: 2-11은 스텁이 손대지 않은 미션이지만 테스트 대상(2-3·2-5 결과)이 스텁 영향을 받는다. 선행 2-3([Day 13·15](./day-13.md)), 2-5([Day 17~18](./day-17.md)) 완료가 전제다. 오늘은 순수 함수 중심이다.

## 오늘 할 일 (총 90분)
- [ ] 00~05 시작 의식: `git status --short --branch` → `nvm use 22.21.1` → 어제 기록의 "내일 할 일" 확인
- [ ] 05~15 읽기: `tests/auth.test.ts`, `package.json`의 `test` 스크립트, `tsconfig.json`의 `allowImportingTsExtensions`, Node 22 test runner 문서
- [ ] 15~30 인벤토리(코딩 전): 아래 참고의 표를 채운다. 각 항목에 "예/아니오"를 쓰기 전에 **실제로 `node`로 import해서 확인**한다
- [ ] 30~65 분리: 동작을 바꾸지 않고 순수 부분만 새 파일로 분리한다 (규칙은 아래 참고)
- [ ] 65~85 테스트 작성: `groupByTens`와 `getNextPageParam`. 입력/출력 표를 먼저 쓰고 그대로 단언한다. Day 13·15에서 메모해 둔 후보(삭제 후 `allPages.length`가 줄어 `getNextPageParam`이 이미 받은 페이지를 가리키는 경우)를 테스트로 만들 수 있는지 본다
- [ ] 85~90 검증: `npm test` 통과 · **일부러 대상 로직을 깨뜨리면 빨개지는지** 확인한 뒤 되돌린다 · `npm run typecheck` · `npx eslint .` · 내일 할 일 한 줄

## 끝 조건
1. `npm test`가 통과하고, 대상 로직을 일부러 깨뜨리면 빨개진다 (확인 후 되돌림)
2. 분리한 파일이 `react-native` 등을 import하지 않고, 동작이 바뀌지 않았다. 검증 4종 통과
3. 말로 설명: 왜 `posts.ts`를 그대로 테스트에서 import할 수 없는가.

## 막히면
- 15분 막힘 → 2-11 힌트 1 요청: 테스트 대상마다 "이 함수가 Node에서 import되는가"부터 확인한다. 안 된다면 순수 부분만 새 파일로 분리한다
- 다시 15분 → 힌트 2 (`node:test`, `assert.deepEqual`, `groupByTens`·`getNextPageParam`은 입력/출력 표만 있으면 되는 순수 함수), 다시 15분 → 힌트 3 (값 import 대신 `import type`, `.ts` 확장자, 순수 부분 분리)
- 막힘 규칙 전체는 [rules.md](./rules.md)

## 참고
- **읽을 학습 가이드 절**: [p6-study-guide.md](../p6-study-guide.md)의 테스트 절.
- **인벤토리 (코딩 전)**

| 테스트 대상             | 지금 Node에서 import되나? | 안 되면 이유 | 분리할 부분 |
| ------------------ | ------------------- | ------- | ------ |
| `groupByTens`      |                     |         |        |
| `getNextPageParam` |                     |         |        |
| `withRetryBackoff` |                     |         |        |
| 낙관적 롤백             |                     |         |        |

- **규칙 (이 환경에서 확인된 제약)**
  - 분리한 파일은 `react-native`, `@react-native-community/netinfo` 등을 import하지 않는다.
  - 타입은 `import type`. 값 import하면 Node 로드가 실패한다.
  - import 경로에 `.ts` 확장자를 붙인다.
  - 분리하면서 **동작을 바꾸지 않는다.** 2-3·2-5에서 정한 정책과 다른 함수를 만들면 안 된다.
- **오늘 쓸 테스트**: `groupByTens`와 `getNextPageParam`. 입력/출력 표를 먼저 쓰고 그대로 단언한다. 테스트가 구현을 그대로 복사한 기대값이 되지 않게 한다.
- **Day 13·15에서 메모해 둔 후보**: 삭제 후 `allPages.length`가 줄어 `getNextPageParam`이 이미 받은 페이지를 가리키는 경우. 테스트로 만들 수 있는지 본다.
- **임시 코드 되돌릴 곳**: 검증용으로 일부러 깨뜨린 대상 로직. 확인 후 되돌린다.
- **기록 포인트**: 인벤토리 표(예/아니오와 이유), 분리한 파일 목록, 깨뜨렸을 때 빨개졌는지.
