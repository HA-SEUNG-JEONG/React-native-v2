# Day 12 · 11/11 (수) — 폴더 구조, path alias, expo lint·prettier

## 오늘의 목표

흩어진 코드를 `src/` 아래 폴더로 정리하고 `@/` 별칭으로 import하며, `expo lint`와 Prettier가 돌아가는 상태를 만든다.

## 읽기(15분)

1. Expo Router 핵심 개념: https://docs.expo.dev/router/basics/core-concepts/
   - 확인할 사실: `app` 폴더 안의 파일은 기본 export가 곧 하나의 화면(라우트)이 된다. 컴포넌트와 훅 같은 라우트가 아닌 코드는 `src/components` 같은 다른 폴더에 둔다. 이 문서의 예시는 `src/app`으로 쓰여 있지만, 이 프로젝트 템플릿(SDK 54)은 루트의 `app/`을 쓴다. 역할이 같다.
2. Expo TypeScript 가이드, 경로 별칭 절: https://docs.expo.dev/guides/typescript/
   - 확인할 사실: `tsconfig.json`의 `paths`에 `"@/*": ["src/*"]`를 쓰면 `src/components/Button.tsx`를 `@/components/Button`으로 import할 수 있다. Expo CLI가 `tsconfig.json`의 별칭을 자동 지원하므로 Metro 설정을 따로 만지지 않는다. `paths`는 `baseUrl`이 있으면 `baseUrl` 기준으로 해석된다.
3. Expo ESLint 가이드: https://docs.expo.dev/guides/using-eslint/
   - 확인할 사실: `npx expo lint`를 처음 실행하면 필요한 의존성을 설치하고 `eslint.config.js`를 만든다. 이 파일은 `eslint-config-expo`를 확장한다. 가이드의 Prettier 절은 `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier` 세 개를 개발 의존성으로 설치하고 `eslint.config.js` 배열에 `eslint-plugin-prettier/recommended`를 추가하라고 한다.

## 예측(10분)

1. `tsconfig.json`의 `paths`만 고치고 `babel.config.js`나 `metro.config.js`는 건드리지 않았을 때, `@/components/Card` import는 Metro 번들링에서 해석되는가?

> 내 예측:

2. 일부러 `app/index.tsx`에 쓰지 않는 import 한 줄을 남기고 `npx expo lint`를 돌리면 오류(error)로 나오는가, 경고(warning)로 나오는가, 아무 말도 없는가?

> 내 예측:

3. Prettier를 ESLint에 연결한 뒤 들여쓰기가 틀린 파일에 `npx expo lint`를 돌리면 그 지적이 어떤 모양으로 나오는가?

> 내 예측:

## 만들기(40분)

Day 7·10~11에서 루트에 만든 `components/`, `types/`, `data/`를 `src/`로 옮기고, 린트와 포맷 도구를 붙인다.

폴더 구조 목표:

```
app/                  라우트 파일만 (지금은 index.tsx)
src/components/       Card, AppButton, EmptyState, LogItem, PostCard
src/types/            log.ts
src/data/             mock-posts.ts
```

해야 할 일:
1. 루트의 `components/`, `types/`, `data/`를 `src/components/`, `src/types/`, `src/data/`로 옮긴다(`data/mock-posts.ts` → `src/data/mock-posts.ts`). 편집기에서 옮기면 import 경로를 자동 갱신하는지 확인한다.
2. `tsconfig.json`의 `compilerOptions.paths`를 `@/*`가 `src/*`를 가리키게 고친다. 템플릿이 이미 `@/*`를 다른 경로로 잡고 있으면 그 값을 바꾼다.
3. `app/index.tsx`와 `src/components/*`의 상대 경로 import(`../components/...`)를 `@/components/...`, `@/types/log`, `@/data/mock-posts`로 바꾼다.
4. `npx expo lint`를 실행한다. 처음 실행 때 안내가 나오면 따른다. 나온 경고를 읽고 고친다.
5. Prettier를 설치한다.

```sh
npx expo install prettier eslint-config-prettier eslint-plugin-prettier --dev
```

6. `eslint.config.js`에 `eslint-plugin-prettier/recommended`를 가이드대로 추가한다. 템플릿의 `eslint.config.js`가 `require` 방식인지 `import` 방식인지에 맞춰 쓴다.
7. 루트에 `.prettierrc`를 만들어 최소 설정(예: `singleQuote`, `printWidth`)을 정한다.
8. `package.json`의 `scripts`에 `"typecheck": "tsc --noEmit"`을 추가한다.
9. `npx prettier --write app src`로 두 폴더만 포맷한다. `docs/`까지 건드리지 않도록 `.`로 실행하지 않는다.

완료 기준:
- [ ] `app/`에는 라우트 파일만 있다
- [ ] 모든 import가 `@/`로 시작하거나 같은 폴더 안의 `./`뿐이다. `../../`가 없다
- [ ] `npm run typecheck`가 오류 0개다
- [ ] `npx expo lint`가 오류 0개다
- [ ] 들여쓰기를 일부러 틀리게 한 뒤 `npx expo lint`가 이를 지적하고, `npx prettier --write app src`가 고친다
- [ ] 시뮬레이터에서 앱이 Day 11과 똑같이 동작한다

## 검증(10분)

- Metro를 재시작(`npx expo start`)한 뒤 앱이 정상 동작하는지 본다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- 일부러 깨뜨려 보기: `@/components/Card`를 `@/component/Card`(오타)로 바꿔 `npm run typecheck`와 시뮬레이터에서 각각 어떤 메시지가 나오는지 적고 되돌린다.

## 이해 점검 질문

1. 라우트가 아닌 컴포넌트 파일을 `app/` 안에 두면 안 되는 이유는 무엇인가?
2. 이 프로젝트에서 `@/` 별칭이 `tsconfig.json`만 고쳤는데 Metro에서도 동작하는 이유는 무엇인가?
3. ESLint와 Prettier는 각각 무엇을 담당하며, `eslint-plugin-prettier`를 붙이면 무엇이 달라지는가?

<details>
<summary>정답</summary>

1. `app/` 안의 파일은 기본 export가 곧 화면(라우트)이 되고 파일 경로가 URL이 된다. 컴포넌트를 거기 두면 화면이 아닌 파일이 라우트로 취급되어 경고가 나거나 의도하지 않은 URL이 생긴다. 그래서 라우트가 아닌 코드는 `src/` 아래에 둔다.
2. Expo CLI가 `tsconfig.json`의 `paths`를 읽어 별칭을 자동으로 지원하기 때문이다(`tsconfigPaths` 기능이 기본으로 켜져 있다). TypeScript 검사와 번들러가 같은 설정을 보게 되어 한 곳만 고치면 된다. 반대로 순수 React Native 프로젝트는 Metro 설정을 따로 해야 한다.
3. ESLint는 쓰지 않는 변수나 훅 규칙 위반 같은 코드 문제를 찾고, Prettier는 들여쓰기와 따옴표 같은 모양만 통일한다. `eslint-plugin-prettier`는 Prettier 포맷 위반을 ESLint 지적으로 보여 줘서 `expo lint` 한 번에 둘 다 확인하게 한다. `eslint-config-prettier`는 Prettier와 겹치는 ESLint 서식 규칙을 꺼서 둘이 서로 충돌하지 않게 한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `refactor: components와 types를 src 아래로 이동하고 @ 별칭 적용`
- `chore: expo lint와 prettier 설정 추가`
