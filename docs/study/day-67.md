# Day 67 · 1/27 (수) — app config, 환경 변수, 아이콘·스플래시

## 오늘의 목표

API 기본 주소를 `EXPO_PUBLIC_` 환경 변수로 옮기고, `app.config.ts`로 개발용·운영용 앱 이름과 식별자를 분기하고, 앱 아이콘과 스플래시를 Daily Log 것으로 바꾼다.

## 읽기(15분)

1. [Expo — Configuration with app.json / app.config.js](https://docs.expo.dev/workflow/configuration/)
   - `app.json`은 정적, `app.config.js`/`app.config.ts`는 동적 설정이고 `.ts`와 `.js`가 모두 있으면 `.ts`가 쓰인다는 점을 찾는다.
   - `app.config.ts`가 `({ config }: ConfigContext): ExpoConfig`를 받아 `...config`를 펼친 뒤 일부만 덮어쓰는 예를 찾는다.
   - 앱 코드에서는 `app.json`을 직접 import하지 말고 `expo-constants`의 `Constants.expoConfig`를 써야 하는 이유와, 최종 해석된 설정을 `npx expo config`로 볼 수 있다는 점을 찾는다.
2. [Expo — Environment variables](https://docs.expo.dev/guides/environment-variables/)
   - `EXPO_PUBLIC_` 접두사가 붙은 변수만 JS 코드에서 `process.env.EXPO_PUBLIC_NAME`으로 읽을 수 있다는 규칙을 확인한다.
   - 값이 점 표기법(dot notation)으로 **정적으로** 참조될 때만 빌드 시 치환되고 `process.env['KEY']`나 구조분해는 치환되지 않는다는 문장을 찾는다.
   - 이 값이 컴파일된 앱에 평문으로 들어가므로 비밀 정보를 넣으면 안 된다는 경고와 `.env` 파일 우선순위(개발 모드는 `.env.development.local` → `.env.local` → `.env.development` → `.env`)를 찾는다.
3. [Expo SDK 54 — SplashScreen](https://docs.expo.dev/versions/latest/sdk/splash-screen/)
   - `app.json`의 `expo-splash-screen` config plugin 옵션(`image`, `imageWidth`, `backgroundColor`, `dark`)을 확인한다.
   - config plugin 속성은 런타임에 바꿀 수 없어 새 바이너리가 필요하고, development build에서는 모두 반영되지 않으므로 release build 확인이 권장된다는 문장을 찾는다.

## 예측(10분)

1. 코드에서 `process.env['EXPO_PUBLIC_API_BASE_URL']`로 읽으면 값이 들어올까, `undefined`일까?

   > 내 예측:

2. `.env`의 값을 바꾸면 Metro를 껐다 켜야 할까? 앱에서는 무엇이 필요할까?

   > 내 예측:

3. 아이콘 PNG가 1024x1024이지만 모서리가 둥글게 투명 처리되어 있으면 iOS에서 어떻게 될까?

   > 내 예측:

## 만들기(40분)

**1. 환경 변수로 API 기본 주소 분리 (10분)**
- 프로젝트 루트에 새 파일 `.env`를 만든다.

  ```
  EXPO_PUBLIC_API_BASE_URL=https://jsonplaceholder.typicode.com
  ```

- Day 27에서 만든 API 클라이언트 모듈의 기본 주소 상수를 `process.env.EXPO_PUBLIC_API_BASE_URL`로 바꾼다. 점 표기법으로 직접 쓴다.
- 이 파일에는 비밀이 아닌 공개 값만 둔다. 기기마다 다르거나 민감한 값은 `.env.local`에 두면 템플릿 `.gitignore`의 `.env*.local` 규칙으로 제외된다. 앱에서 값을 바꿔 보려면 전체 리로드가 필요하다.

**2. app.config.ts로 앱 변형 분기 (15분)**
- `app.json`은 그대로 두고 루트에 새 파일 `app.config.ts`를 만든다. `config`(app.json 내용)를 펼치고 `APP_VARIANT`가 `development`일 때만 이름과 식별자를 바꾼다.

  ```ts
  import { ExpoConfig, ConfigContext } from 'expo/config';

  const IS_DEV = process.env.APP_VARIANT === 'development';

  export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: IS_DEV ? 'Daily Log (Dev)' : 'Daily Log',
    slug: config.slug ?? 'daily-log',
    ios: { ...config.ios, bundleIdentifier: `com.본인아이디.dailylog${IS_DEV ? '.dev' : ''}` },
  });
  ```

  Android의 `package`도 같은 방식으로 분기한다. 식별자가 달라야 개발용과 운영용을 한 기기에 함께 설치할 수 있다(참고: [App variants](https://docs.expo.dev/build-reference/variants/)).
- `eas.json`의 `development` 프로필에 `"env": { "APP_VARIANT": "development" }`를 추가해 EAS 빌드에서도 같은 분기가 적용되게 한다.
- 선택: 클라우드 빌드에도 API 주소를 주입하려면 `eas env:set --name EXPO_PUBLIC_API_BASE_URL --value https://jsonplaceholder.typicode.com --environment preview --visibility plaintext`를 쓴다([EAS 환경 변수](https://docs.expo.dev/eas/environment-variables/manage/)). 이 값도 앱 번들에 포함되는 공개 값이다.

**3. 아이콘과 스플래시 교체 (15분)**
- 1024x1024 정사각 PNG 아이콘을 만들어 `assets/images/icon.png`를 교체한다. 단색 배경에 글자 "DL"처럼 단순해도 된다. 둥근 모서리와 투명 픽셀 없이 정사각형 전체를 채운다([App icons](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)).
- Android 어댑티브 아이콘은 `android.adaptiveIcon`의 `foregroundImage`(전경 PNG)와 `backgroundColor`를 Daily Log 색으로 바꾼다.
- 스플래시는 `app.json`의 `expo-splash-screen` 플러그인 항목에서 `image`, `backgroundColor`, `dark.backgroundColor`를 바꾼다.
- 아이콘과 스플래시는 새 바이너리가 필요하므로 `npx eas-cli@latest build --platform ios --profile development`를 걸어 두고, 기다리는 동안 아래 검증을 한다. 빌드 결과는 오늘 끝나지 않아도 되고 다음 시작 때 확인해도 된다.

완료 기준
- [ ] `.env`에 `EXPO_PUBLIC_API_BASE_URL`이 있고 API 클라이언트가 `process.env.EXPO_PUBLIC_API_BASE_URL`을 점 표기법으로 쓴다. 피드가 여전히 로드된다.
- [ ] `app.config.ts`가 있고 `APP_VARIANT=development`일 때만 이름과 식별자가 달라진다.
- [ ] `eas.json`의 `development` 프로필에 `env.APP_VARIANT`가 있다.
- [ ] `icon.png`가 1024x1024 정사각이고 스플래시 색·이미지가 바뀌었다.
- [ ] `.env.local`이나 비밀 값이 커밋 대상에 없다(`git status`로 확인).

## 검증(10분)

- `npx expo config --type public`을 실행해 `name`과 `ios.bundleIdentifier` 값을 적는다. 이어서 `APP_VARIANT=development npx expo config --type public`을 실행해 달라지는 필드를 비교한다.
- 개발 서버를 켠 앱에서 피드가 정상 로드되는지 확인한다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.

> 실제 결과 / 예측과 다른 지점:

**깨뜨려 보는 실험**: API 클라이언트의 `process.env.EXPO_PUBLIC_API_BASE_URL`을 `process.env['EXPO_PUBLIC_API_BASE_URL']`로 바꿔 앱을 전체 리로드하고 요청 주소가 어떻게 되는지 DevTools Network 탭에서 확인한다. 끝나면 되돌린다.

## 이해 점검 질문

1. `EXPO_PUBLIC_` 변수는 왜 `process.env.EXPO_PUBLIC_NAME`처럼 정적으로 써야 하는가?
2. 비밀 값(API 비밀 키)을 `EXPO_PUBLIC_` 변수나 EAS의 Secret 가시성 변수에 넣어도 앱에서 안전하지 않은 이유는?
3. `app.json`과 `app.config.ts`의 차이는 무엇이고, 앱 코드에서 설정 값을 읽을 때 `app.json`을 직접 import하면 안 되는 이유는?

<details>
<summary>정답</summary>

1. Expo는 빌드(번들링) 시점에 `process.env.EXPO_PUBLIC_NAME` 참조를 실제 값으로 치환한다. 이 치환은 점 표기법으로 정적으로 쓴 참조만 찾아내므로 `process.env['KEY']`나 구조분해는 치환되지 않아 런타임에 `undefined`가 된다.
2. `EXPO_PUBLIC_` 값은 컴파일된 앱 번들에 평문으로 들어가 누구나 꺼내 볼 수 있다. EAS의 Secret 가시성은 EAS 서버 밖에서 읽을 수 없게 할 뿐이고, 문서도 앱 자체에 포함시키는 값에는 추가 보안을 제공하지 않는다고 밝힌다. 앱에 포함되는 순간 공개 값이므로 비밀 키는 앱이 아니라 서버에 두어야 한다.
3. `app.json`은 고정된 JSON이고 `app.config.ts`는 코드로 `process.env` 등에 따라 설정을 계산하는 동적 설정이다. 앱 코드에서 `app.json`을 직접 import하면 처리되기 전의 원본 파일 전체가 번들에 들어온다. 해석이 끝난 설정은 `expo-constants`의 `Constants.expoConfig`로 읽고, 최종 값은 `npx expo config`로 확인한다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `refactor: API 기본 주소를 EXPO_PUBLIC 환경 변수로 분리`
- `chore: app.config.ts로 개발용 앱 변형 분기`
- `style: 앱 아이콘과 스플래시 교체`

## 웹과 다른 점

웹은 배포된 서버가 환경 변수를 숨길 수 있지만 모바일 앱은 번들이 사용자 기기에 들어가므로 `EXPO_PUBLIC_` 값은 모두 공개이고, 아이콘·스플래시·앱 이름 같은 값은 JS가 아니라 네이티브 빌드에 구워져 바꾸려면 새 빌드가 필요하다.
