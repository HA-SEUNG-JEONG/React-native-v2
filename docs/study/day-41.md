# Day 41 · 12/22 (화) — expo-image: 캐시·placeholder·contentFit

> 전제: 기록 탭 글쓰기 화면은 `app/(tabs)/write.tsx`(Day 17), 기록 항목 타입은 `src/types/log.ts`의 `LogEntry`(Day 10, Day 12에서 `src/`로 이동), 기록 상태는 Day 22의 `useLogs()`/`useLogsDispatch()`다.

## 오늘의 목표

피드 카드와 기록 탭 썸네일을 `expo-image`로 바꾸고, `placeholder`·`contentFit`·`cachePolicy`가 화면에서 어떻게 다르게 동작하는지 직접 확인한다.

## 읽기(15분)

> 확인할 버전: `docs.expo.dev/versions/latest/...` 링크는 최신 문서(SDK 58)를 보여 준다. SDK 54의 `expo-image`는 `~3.0`이고 이 템플릿에 이미 들어 있다. 설치는 필요 없고, 오늘이 처음 쓰는 날이다. prop 이름은 설치된 패키지의 타입 정의로 한 번 더 확인한다.

1. [Image (expo-image)](https://docs.expo.dev/versions/latest/sdk/image/)
   - 기능 소개에서 BlurHash·ThumbHash 지원과 "소스가 바뀔 때 전환(transition)" 설명을 찾는다.
   - Usage 예제에서 `placeholder={{ blurhash }}`, `contentFit="cover"`, `transition={1000}`을 쓰는 형태를 확인한다. 이 예제의 `blurhash` 문자열을 오늘 그대로 복사해 쓴다.
   - `contentFit`이 CSS `object-fit`을 따르는 prop이고 기본값이 `'cover'`라는 점, `cachePolicy`의 선택지(`'none' | 'disk' | 'memory' | 'memory-disk'`)와 기본값이 `'disk'`라는 점을 API 절에서 확인한다.
   - `recyclingKey` prop이 "재활용되는 뷰(FlashList 같은 리스트)에서 이전 이미지가 잠깐 보이는 것을 막는다"는 설명을 찾는다.
   - 정적 메서드 `Image.prefetch`, `Image.clearDiskCache`, `Image.clearMemoryCache`가 있는지 확인한다.
2. [Images (React Native)](https://reactnative.dev/docs/images)
   - "Network Images" 절에서 정적 리소스와 달리 네트워크 이미지는 크기를 직접 지정해야 한다는 문장을 찾는다.
   - [Image 컴포넌트 문서](https://reactnative.dev/docs/image)의 `resizeMode` prop도 확인한다. Day 2에서 쓴 RN `Image`와 오늘 쓰는 `expo-image`는 import 경로만 다른 것이 아니라 prop 이름도 다르다(`resizeMode` 대 `contentFit`).

## 예측(10분)

1. 같은 네트워크 이미지를 RN `Image`로 한 번 보고, 앱을 완전히 종료했다가 다시 열어 같은 이미지를 보면 두 번째에 더 빨리 뜰까? `expo-image`(기본 `cachePolicy`)는 어떨까?

> 내 예측:

2. 600x400 비율 이미지를 정사각형 카드 안에 `contentFit="cover"`로 넣을 때와 `"contain"`으로 넣을 때, 각각 이미지의 위아래·좌우가 어떻게 되는가?

> 내 예측:

3. Mac의 Wi-Fi를 끈 상태에서 (a) 이미 본 이미지와 (b) 처음 보는 이미지는 각각 무엇이 보일까? `placeholder`가 있을 때와 없을 때는?

> 내 예측:

## 만들기(40분)

이미지 소스는 JSONPlaceholder의 `/photos` 응답이 쓰는 `https://picsum.photos` 주소 형식을 쓴다(`/photos/1` 응답의 `url` 필드가 `https://picsum.photos/seed/1/600` 형태인 것을 확인했다). 피드 글의 `id`로 시드를 만든다: `https://picsum.photos/seed/${post.id}/600/400`. 서비스가 응답하지 않으면 `JSONPlaceholder`의 `/photos` 응답에서 받은 `url`을 그대로 쓴다.

새로 만들/고칠 파일:

- Day 11에서 분리한 피드 카드 컴포넌트(글 한 건을 그리는 컴포넌트, `src/components/PostCard.tsx`)에 이미지 영역을 추가한다. `import { Image } from 'expo-image'`를 쓰고, RN의 `Image`와 이름이 겹치지 않게 한 파일에서는 하나만 쓴다.
- 이미지에는 `style`로 폭과 높이(또는 `aspectRatio`)를 반드시 준다. `placeholder`는 문서 예제의 blurhash, `contentFit`, `transition`(약 200ms)을 지정한다.
- Day 7에서 만든 피드 `FlatList`가 보여 주는 카드이므로 `recyclingKey={String(post.id)}`를 준다.
- 기록 탭 `app/(tabs)/write.tsx`의 Day 40 썸네일을 `expo-image`로 교체한다. 로컬 파일 `uri`도 같은 컴포넌트로 보인다.
- 설정 탭 `app/(tabs)/settings/index.tsx`에 "이미지 캐시 지우기" 버튼을 추가한다. `Image.clearDiskCache()`와 `Image.clearMemoryCache()`를 호출하고 결과(`boolean`)를 `Alert`로 알려 준다.

핵심 호출 형태:

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri }}
  placeholder={{ blurhash }}
  contentFit="cover"
  transition={200}
  recyclingKey={String(post.id)}
  style={{ width: '100%', aspectRatio: 3 / 2 }}
/>
```

완료 기준:

- [ ] 피드 카드에 이미지가 보이고, 로딩 중에는 blurhash 배경이 먼저 보인다.
- [ ] 기록 탭 썸네일이 `expo-image`로 그려진다.
- [ ] 피드를 빠르게 스크롤해도 이전 카드의 이미지가 잠깐 보였다 바뀌는 현상이 없다(`recyclingKey`).
- [ ] 설정 탭 버튼으로 이미지 캐시를 지우면, 피드로 돌아가 이미지를 다시 받아 오는 것이 보인다.
- [ ] 코드에서 RN `Image`와 `expo-image`의 `Image`를 한 파일에 섞어 쓰지 않았다.

## 검증(10분)

- 앱을 완전 종료한 뒤 다시 열어 이미지가 바로 뜨는지 본다. 예측 1과 비교한다.
- Mac의 Wi-Fi를 끄고 (a) 이미 본 피드 이미지, (b) 처음 보는 이미지를 열어 예측 3과 비교한다.
- `cachePolicy="none"`으로 바꿔 같은 실험을 반복하고 차이를 적는다.
- 일부러 깨뜨리기: 이미지 `style`에서 높이(또는 `aspectRatio`)를 지운다. 네트워크 이미지가 어떻게 보이는지 적고 되돌린다.
- `contentFit`을 `cover`, `contain`, `fill`로 바꿔 보며 예측 2와 비교한다.

## 이해 점검 질문

1. `expo-image`를 쓰면 같은 URL 이미지를 두 번째부터 빠르게 보여줄 수 있는 이유는 무엇인가? 이 동작은 어떤 prop으로 바뀌는가?
2. RN `Image`의 `resizeMode="cover"`에 해당하는 `expo-image` prop은 무엇이고, 기본값은 무엇인가?
3. 피드 `FlatList` 안의 `expo-image`에 `recyclingKey`를 주지 않으면 어떤 문제가 생길 수 있는가?

<details>
<summary>정답</summary>

1. `expo-image`는 받은 이미지를 디스크(기본 `cachePolicy`가 `'disk'`)에 저장해 두고 같은 URL이면 네트워크 대신 저장본을 읽는다. `cachePolicy`를 `'none'`, `'memory'`, `'memory-disk'`로 바꾸면 저장 위치와 여부가 달라진다.
2. `contentFit`이고 기본값은 `'cover'`다. 웹 CSS의 `object-fit`과 같은 이름·같은 값을 쓰기 때문에 웹에서 쓰던 감각이 그대로 통한다.
3. `FlatList`는 화면 밖으로 나간 행의 뷰를 재활용한다. 새 이미지가 로드되기 전까지 이전 글의 이미지가 보이다가 바뀌는 깜빡임이 생길 수 있다. `recyclingKey`가 바뀌면 이미지 뷰를 비우거나 `placeholder`로 되돌려 이 현상을 막는다.

</details>

## 기록(5분)

배운 것 3줄:

막힌 점:

## 커밋 단위 제안

- `feat: 피드 카드 이미지를 expo-image로 표시`
- `refactor: 기록 탭 썸네일을 expo-image로 교체`
- `feat: 설정 탭에 이미지 캐시 지우기 추가`

## 웹과 다른 점

웹 `<img>`는 브라우저가 HTTP 캐시를 알아서 관리하지만, 네이티브는 이미지 라이브러리가 디스크·메모리 캐시 정책을 정하고(`cachePolicy`), 크기 없는 네트워크 이미지는 높이가 0으로 보일 수 있어 `style`에 크기를 명시한다.
