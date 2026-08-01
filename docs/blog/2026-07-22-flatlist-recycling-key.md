# FlatList에서 썸네일이 깜빡이는 이유: expo-image `recyclingKey` 한 줄의 정체

> RN 0.81 / Expo SDK 54 / iOS 26.5 시뮬레이터 실측 기준

## 문제 상황

피드 리스트를 만들었다. 각 행에 100×100 썸네일. 코드는 평범하다.

```tsx
<FlatList
  data={posts}
  renderItem={({ item }) => (
    <Pressable style={styles.row}>
      <Image
        source={{ uri: `https://picsum.photos/seed/${item.id}/100/100` }}
        style={styles.thumb}
      />
      <Text>{item.title}</Text>
    </Pressable>
  )}
/>
```

느리게 스크롤하면 멀쩡하다. 그런데 **빠르게 플링(fling)** 하면 순간적으로 엉뚱한 썸네일이 섞여 보인다. #42 행에 방금 지나간 #17 이미지가 잠깐 남았다가 제 이미지로 바뀐다. 200ms 미만이라 스크린샷으로 잡기도 어렵다. 버그처럼 보이는데 콘솔엔 에러 하나 없다.

## 왜 이런 일이 일어나는가

핵심은 **FlatList가 행 View를 버리지 않는다**는 사실이다.

`.map()`으로 100개를 그리면 DOM/네이티브 View도 100개가 생긴다. FlatList는 다르다. 가상화(virtualization) 리스트라서 화면에 보이는 ~12개 + 여유분만 실제 View로 만들고, 스크롤하면 **화면 밖으로 나간 View를 재활용(recycle)** 한다. 그 View의 내용(props)만 갈아끼운다. 100개 아이템이 있어도 살아있는 View는 십수 개뿐 — 메모리·성능상 큰 이득이다.

문제는 그 "내용 갈아끼우기"의 속도가 요소마다 다르다는 것이다. 행 View가 item #17 → #42로 재활용될 때:

- **텍스트**는 새 `props`로 **즉시** 다시 그려진다. 동기 작업이라 갈아끼우는 순간 완료.
- **이미지**는 `uri`가 바뀌어도 새 이미지의 **네트워크 로드가 비동기**다. 도착하기 전까지, 재활용된 View에 **남아있던 #17 이미지가 그대로 표시**된다.

즉 잔상은 버그가 아니라 재활용의 정상 부작용이다. View는 재사용되는데 그 안의 이미지 상태를 아무도 "리셋"해주지 않았을 뿐이다.

> 웹 `<img>`에선 이 문제가 없다. 브라우저는 리스트 DOM을 재활용하지 않으니까(각 행이 독립 DOM). RN 리스트의 가상화가 만들어내는, 웹엔 없던 함정이다.

## 해결 과정

### 처음 든 생각: `key`를 주면 되지 않나?

React에서 항목이 바뀌면 `key`를 다르게 줘서 리마운트시키는 게 상식이다. 하지만 여기서 리마운트는 재활용의 이점(View 재사용)을 통째로 버리는 것과 같다. 가상화를 켜놓고 매 스크롤마다 remount하면 성능이 무너진다. 방향이 틀렸다.

필요한 건 "View는 재활용하되, **이미지 상태만** 리셋"이다. 그걸 expo-image가 `recyclingKey`로 제공한다.

### 해결책

```tsx
import { Image } from "expo-image";

<Image
  source={{ uri: `https://picsum.photos/seed/${item.id}/100/100` }}
  style={styles.thumb}
  recyclingKey={String(item.id)} // ★ 핵심 한 줄
  cachePolicy="memory-disk"
  transition={200}
  contentFit="cover"
/>;
```

`recyclingKey` 값이 **바뀌면** expo-image가 그 View의 현재 이미지를 **즉시 비운다**. 행이 #17 → #42로 재활용되면 키도 `"17" → "42"`로 바뀌고, #42가 도착하기 전까지 #17 잔상 대신 **빈 placeholder**가 보인다. 엉뚱한 이미지보다 빈 칸이 낫다.

React의 `key`와 개념은 같다 — "이건 다른 거야, 리셋해"라는 신호. 단 여기선 컴포넌트를 remount하는 게 아니라 expo-image **내부의 이미지 상태만** 리셋한다. 가상화 이점은 그대로 유지된다.

### 어떻게 증상을 눈으로 확인했나

순수 잔상은 200ms 미만이라 캡처가 어렵다. 그래서 **부정 테스트(negative test)** 로 증폭시켰다: `recyclingKey`를 빼고 `cachePolicy="none"`을 주면, 재스크롤마다 썸네일이 blank로 리로드되며 잔상이 육안으로 보이는 시간이 길어진다. 반대로 `recyclingKey` + `memory-disk`를 주면 잔상이 사라지고, 되돌아와도 재요청이 0이다.

### 짝으로 챙긴 두 prop

- **`cachePolicy="memory-disk"`** — 메모리+디스크 둘 다 캐시. 스크롤로 되돌아가도 재요청 0. 리스트 프로덕션 권장값. (`none`은 진입마다 재요청, `disk`가 expo-image 기본값)
- **`transition={200}`** — 이미지가 툭 튀지 않고 200ms 페이드인. 잔상을 없앤 뒤 빈 placeholder → 이미지 전환을 부드럽게.

그리고 썸네일에 **고정 크기 + 배경색**을 주면 그 자체가 placeholder가 된다.

```tsx
thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#2b3446" },
```

크기가 고정이라 로드 전에도 회색 박스가 자리를 차지 → 이미지 도착 시 레이아웃이 안 튄다(웹으로 치면 CLS 방지). 별도 placeholder 컴포넌트가 필요 없다.

## 핵심 요약

**한 줄 원칙:** 가상화 리스트의 이미지는 "View 재활용 + 비동기 로드" 조합 때문에 잔상이 생긴다. `recyclingKey`로 이미지 상태만 리셋하라 — remount가 아니라.

**재발 방지 체크리스트**

- [ ] 리스트(FlatList/SectionList/FlashList) 안 이미지에 `recyclingKey`를 아이템 고유값으로 줬는가?
- [ ] 빠른 플링에서 잔상이 없는지 실기기/시뮬레이터로 확인했는가?
- [ ] `cachePolicy`를 명시했는가? (되돌아올 때 재요청이 싫으면 `memory-disk`)
- [ ] 썸네일에 고정 크기 + 배경색을 줘서 로드 전 레이아웃 점프를 막았는가?
- [ ] `key`로 리마운트해서 문제를 "풀려다" 가상화 이점을 버리고 있진 않은가?

> 참고: [expo-image `recyclingKey`](https://docs.expo.dev/versions/v54.0.0/sdk/image/#recyclingkey) · [expo-image `cachePolicy`](https://docs.expo.dev/versions/v54.0.0/sdk/image/#cachepolicy) · [FlatList](https://reactnative.dev/docs/flatlist)
