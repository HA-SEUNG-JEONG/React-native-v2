# Day 18 · 11/19 (목) — Modal, 헤더 설정, 딥링크 scheme 기본

## 오늘의 목표

설정 탭에서 여는 "앱 정보" 모달 라우트를 만들고 헤더 오른쪽 닫기 버튼을 달며, `scheme`과 `exp://` 주소로 상세 화면을 딥링크로 열어 본다.

## 읽기(15분)

1. 모달 만들기: https://docs.expo.dev/router/advanced/modals/
   - 확인할 사실: 모달은 `app/` 아래 일반 라우트 파일이고, 루트 `_layout.tsx`의 `Stack.Screen`에서 `presentation: 'modal'`을 주면 모달로 열린다. 열 때는 `Link href`를 쓴다. Android는 뒤로가기 버튼, iOS는 아래로 쓸어내려 닫고, 웹은 닫는 동작을 직접 만들어야 한다. 모달을 코드로 닫는 방법은 이 문서에 없으므로, Day 15에서 읽은 페이지 이동 문서(https://docs.expo.dev/router/basics/navigation/)의 `router.back`을 쓴다.
2. Stack 헤더 옵션: https://docs.expo.dev/router/advanced/stack/
   - 확인할 사실: `headerRight`는 헤더 오른쪽에 그릴 React 요소를 돌려주는 함수이고, `screenOptions`는 Stack 전체 화면에 공통 옵션을 준다. `presentation` 값은 `card`, `modal`, `formSheet` 등이다. 플랫폼별 지원 범위는 문서에서 모호하므로 `presentation` 옵션 설명을 읽고 시뮬레이터에서 확인한다.
3. 딥링크 연결: https://docs.expo.dev/linking/into-your-app/
   - 확인할 사실: `app.json`의 `scheme`은 개발 빌드나 스토어 빌드에서 `myapp://` 링크로 앱을 열게 한다. Expo Go에서는 `exp://` 스킴을 쓰고, 경로가 있을 때 `/--/`가 붙는다. `npx uri-scheme open <주소> --ios`로 시뮬레이터에서 링크를 연다. `scheme`은 Expo Go에서는 효과가 없는 빌드 시점 설정이다(공식 앱 설정 문서: https://docs.expo.dev/versions/latest/config/app/ 의 `scheme` 항목).

## 예측(10분)

1. 모달 화면을 닫는 방법은 iOS와 Android에서 각각 무엇인가? 그리고 헤더의 `닫기` 버튼은 어떤 함수를 호출해야 하는가?

> 내 예측:

2. `app.json`에 `"scheme": "dailylog"`를 넣고 Expo Go를 쓰는 중에 `dailylog://post/3`을 열면 상세 화면이 열리는가? 열리지 않는다면 Expo Go에서는 어떤 주소를 써야 하는가?

> 내 예측:

3. 앱이 완전히 꺼진 상태에서 딥링크로 `/post/3`을 바로 열면, 상세 화면의 헤더에 뒤로가기 버튼이 보이는가?

> 내 예측:

## 만들기(40분)

새로 만들 파일:
- `app/about.tsx` — 모달 화면 `AboutScreen`. `Card` 안에 앱 이름, 버전 문구(코드에 직접 쓴 문자열), 한 줄 설명을 둔다. 하단에 `AppButton title="닫기"`가 `router.back()`을 호출한다.

고칠 파일:
- `app/_layout.tsx` — `Stack` 안에 `about`을 추가해 `presentation: 'modal'`, `title: '앱 정보'`를 주고 `headerRight`에 `닫기` 글자 버튼(`Pressable`)을 만든다. `screenOptions`에 공통 헤더 옵션 하나(예: 제목 굵기)를 줘서 정적 옵션과 공통 옵션을 구분해 본다.
- `app/(tabs)/settings.tsx` — `Card` 안에 `<Link href="/about">앱 정보</Link>` 줄을 추가한다.
- `app.json` — `expo.scheme`이 이미 있으면 값을 확인만 하고, 없으면 `"scheme": "dailylog"`를 추가한다.

딥링크 실습:
1. Expo Go 사용 중이면 Metro 터미널에 표시된 `exp://` 주소(호스트와 포트)를 확인하고, 아래 형태로 연다. Android는 `--ios` 대신 `--android`.

```sh
npx uri-scheme open "exp://<Metro 주소>/--/post/3" --ios
```

2. 개발 빌드를 쓰는 경우에는 `npx uri-scheme open dailylog://post/3 --ios`를 쓴다(빌드에 `scheme`이 들어간 뒤에만 동작).
3. 앱 안에서 `import * as Linking from 'expo-linking'` 후 `Linking.createURL('/post/3')`의 결과를 콘솔에 찍어 실행 환경별 주소 모양을 확인한다. 템플릿에 `expo-linking`이 없으면 `npx expo install expo-linking`으로 설치한다.

완료 기준:
- [ ] 설정 탭의 `앱 정보`를 누르면 `app/about.tsx`가 모달로 올라온다
- [ ] 헤더 오른쪽 `닫기`와 하단 `닫기` 버튼이 모달을 닫는다
- [ ] 딥링크 명령으로 상세 화면 `/post/3`이 열린다(Expo Go는 `exp://` 주소, 개발 빌드는 `scheme` 주소)
- [ ] `Linking.createURL('/post/3')` 결과를 아래 기록 절에 적었다
- [ ] `npm run typecheck`와 `npx expo lint`가 오류 0개다

## 검증(10분)

- 시뮬레이터에서 모달을 열고 iOS는 아래로 쓸어내려, Android는 뒤로가기로 닫아 본다. 딥링크는 앱이 켜져 있을 때와 꺼져 있을 때 각각 열어 상세 화면이 맞게 열리는지, 뒤로가기 버튼이 보이는지 적는다.
- 예측 1~3과 실제를 비교해 다른 지점을 적는다.
- 일부러 깨뜨려 보기: Expo Go 상태에서 `npx uri-scheme open dailylog://post/3 --ios`를 실행해 아무 일도 일어나지 않는 것을 확인하고, 이유를 `scheme` 문서 문장으로 적는다.
- 선택 과제: 앱이 꺼진 상태의 딥링크에서 뒤로가기가 없는 문제는 `unstable_settings`의 `anchor`와 관련이 있다. 공유 라우트 문서(https://docs.expo.dev/router/advanced/shared-routes/)에서 `anchor`가 무엇을 정하는지 읽고 적는다. 문서에서 확인 필요한 부분이므로 적용은 하지 않아도 된다.

## 이해 점검 질문

1. 모달 라우트를 일반 화면과 구분해 주는 설정은 무엇이고 어디에 쓰는가?
2. 같은 상세 화면을 여는 딥링크 주소가 Expo Go와 개발 빌드에서 다른 이유는 무엇인가?
3. 파일 기반 라우팅을 쓰면 딥링크 경로를 따로 등록하지 않아도 되는 이유는 무엇인가?

<details>
<summary>정답</summary>

1. 루트 `_layout.tsx`의 `Stack.Screen`에서 해당 화면의 `options`에 `presentation: 'modal'`을 준다. 파일 자체는 일반 라우트와 같은 `app/about.tsx`이고, 열고 닫는 방식만 모달로 바뀐다.
2. 개발 빌드나 스토어 빌드는 `app.json`의 `scheme`을 자기 앱의 스킴으로 등록하므로 `dailylog://post/3`으로 열린다. Expo Go는 여러 앱을 실행하는 하나의 앱이라 자체 스킴 `exp://`를 쓰고, `scheme`은 빌드 시점 설정이라 Expo Go에서는 효과가 없다. Expo Go에서 경로를 지정하면 `/--/`가 붙는다.
3. 파일 경로가 곧 URL이고, 그 URL이 딥링크 경로로도 그대로 쓰이기 때문이다. `app/post/[id].tsx`가 있으면 `/post/3`이 딥링크 경로가 된다. 따로 매핑 표를 만들 필요가 없다.

</details>

## 기록(5분)

`Linking.createURL('/post/3')` 결과:

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 앱 정보 모달 라우트 추가`
- `chore: 딥링크 scheme 설정`

## 웹과 다른 점

웹의 모달은 보통 DOM에 올려놓는 UI이지만, Expo Router의 모달은 화면 스택의 한 화면으로 올라오는 라우트라 URL로도 열린다.
