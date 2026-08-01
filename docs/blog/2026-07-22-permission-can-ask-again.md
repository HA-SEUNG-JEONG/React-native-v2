# 권한 다이얼로그가 다시는 안 뜬다: `canAskAgain`과 iOS·Android의 다른 도달 조건

> RN 0.81 / Expo SDK 54 / iOS 26.5 시뮬레이터 실측 기준

## 문제 상황

카메라 촬영 버튼을 만들었다. 첫 탭에서 권한 다이얼로그가 뜨고, 유저가 거부하면 조용히 물러난다. 여기까진 자연스럽다.

```tsx
const takePhoto = async () => {
  if (!cameraStatus?.granted) {
    const res = await cameraRequestPermission();
    if (!res.granted) return; // 거부 → 물러남
  }
  const result = await launchCameraAsync({ mediaTypes: "images" });
  // ...
};
```

그런데 유저가 거부한 뒤 마음을 바꿔 버튼을 다시 누르면? **아무 일도 안 일어난다.** `cameraRequestPermission()`을 호출했는데 OS 다이얼로그가 뜨지 않는다. 버튼이 먹통이 된 것처럼 보인다. 콘솔엔 에러도 없다. 유저 입장에선 "이 앱 사진 버튼 고장났네" 하고 떠난다.

웹에서 이런 경험을 한 적이 없다. `getUserMedia()`는 거부돼도 Promise가 reject될 뿐 페이지는 계속 돌고, 유저가 마음을 바꾸면 주소창 자물쇠를 눌러 바로 되돌린다. 모바일은 왜 이렇게 다른가?

## 왜 이런 일이 일어나는가

**모바일 OS는 같은 권한을 반복해서 물어보는 걸 금지한다.** Expo 문서가 양 플랫폼을 묶어 못박는다.

> "An operating-system level restriction on both Android and iOS prohibits an app from asking for the same permission more than once."

즉 유저가 한번 "권한 주기 싫다"는 의사를 충분히 표하면, 앱은 **재요청 능력 자체를 OS에게 박탈당한다**. 이때 권한 응답 객체의 `canAskAgain` 필드가 `false`가 된다.

```tsx
// 영구 거부: 요청해봐야 OS 다이얼로그가 안 뜸
const blocked = cameraStatus?.granted === false && !cameraStatus.canAskAgain;
```

### 진짜 함정: 그 상태에 **도달하는 조건**이 플랫폼마다 다르다

`canAskAgain === false`라는 결과값은 두 OS에서 같다. 하지만 거기 **어떻게 도달하느냐**가 다르다.

| 상태     | iOS                         | Android        |
| -------- | --------------------------- | -------------- |
| 미결정   | 다이얼로그 뜸               | 다이얼로그 뜸  |
| 거부 1회 | **다시는 다이얼로그 안 뜸** | 다시 요청 가능 |
| 거부 2회 | —                           | **영구 거부**  |

**iOS는 단 한 번 거부하면 끝이다.** 그다음부터 `requestPermission()`을 불러도 다이얼로그가 안 뜬다.

**Android는 두 번 거부해야** 영구 거부가 된다. Android 공식 문서 원문:

> "if the user taps Deny for a specific permission more than once during your app's lifetime of installation on a device, the user will no longer see the system permissions dialog if your app requests that permission again."

여기 흔한 오해가 하나 있다. 옛 Android UI엔 "다시 묻지 않기" 체크박스가 있었고, 인터넷 예제·블로그 상당수가 아직 "유저가 그 체크박스를 눌러야 영구 거부"라고 설명한다. **틀렸다.** 지금은 유저가 **거부를 2회째 누르는 행위 자체**가 "다시 묻지 마"로 해석된다. 별도 체크박스가 없다.

이 차이는 테스트에 직접 영향을 준다. 에뮬레이터에서 영구 거부 UX를 재현하려면 **Android는 거부를 두 번** 눌러야 하고, iOS는 한 번이면 된다. 이걸 모르면 "Android에선 배너가 왜 안 뜨지?" 하고 멀쩡한 코드를 의심하게 된다.

## 해결 과정

### 처음 짠 방식: 즉시 설정 앱으로 튕기기

`canAskAgain === false`면 앱이 할 수 있는 건 하나뿐이다 — 유저를 OS 설정 앱으로 보내 직접 켜게 하는 것. 처음엔 이렇게 했다.

```tsx
if (!res.granted) {
  if (!res.canAskAgain) Linking.openSettings(); // ✗ 갑자기 튕김
  return;
}
```

동작은 한다. 그런데 유저 체감은 이렇다 — **사진 버튼을 눌렀더니 앱이 갑자기 설정 앱으로 튕겼다.** 왜 튕겼는지, 거기서 뭘 눌러야 하는지 아무 설명이 없다. `Alert`로 바꿔도 반쪽이다. Alert은 한 번 닫으면 사라지고, 다시 보려면 버튼을 또 눌러야 한다.

### 해결책: 상태를 화면에 상시로 남긴다

핸들러는 `return`만 하고, "왜 안 되는지 + 무엇을 하면 되는지"를 **화면에 상시 노출**한다.

```tsx
const blocked = cameraStatus?.granted === false && !cameraStatus.canAskAgain;

// ...JSX
{
  blocked && (
    <>
      <Text style={styles.hint}>
        카메라 권한이 꺼져 있음. 앱에서 다시 물어볼 수 없어 설정에서 직접 켜야
        함.
      </Text>
      <Btn
        label="설정 열기"
        onPress={() => Linking.openSettings()}
        kind="ghost"
      />
    </>
  );
}
```

핵심은 **앱을 벗어나는 결정을 유저가 버튼으로 내린다**는 점이다. 앱은 이유와 경로만 제시하고, 튕기는 타이밍은 유저가 고른다. `Linking.openSettings()`는 RN 코어 API로 설정 앱 최상단이 아니라 **이 앱의 설정 페이지**로 바로 간다.

> 원칙: 앱이 유저를 밖으로 데려가는 건 유저가 선택할 일. 앱은 이유와 경로만 제시한다.

### 테스트에서 배운 것: 이 상태는 코드로 못 만든다

`canAskAgain === false`는 프로그램으로 세팅할 수 없다. **설정 앱에서 수동으로 권한을 꺼야** 재현된다. iOS 시뮬레이터라면 권한 리셋은:

```bash
xcrun simctl privacy booted reset camera <bundle-id>
```

이 경로를 손으로 밟지 않으면 거부 UX는 "작성만 하고 한 번도 실행 안 된 코드"로 남는다. 기능이 되는 건 절반이고, 안 될 때 유저가 빠져나갈 길을 보여주는 게 나머지 절반이다.

## 핵심 요약

**한 줄 원칙:** 모바일 권한은 "거부되면 재요청 불가"라는 막다른 상태(`canAskAgain === false`)가 존재한다. 이때 앱이 할 일은 재요청이 아니라 **설정으로 가는 길 안내**다.

**재발 방지 체크리스트**

- [ ] `granted === false && !canAskAgain`으로 영구 차단 상태를 감지하는가?
- [ ] 차단 시 즉시 설정앱 튕김/Alert이 아니라 **상시 배너 + 설정 열기 버튼**인가?
- [ ] iOS는 1회, Android는 2회 거부로 이 상태에 도달함을 알고 테스트했는가?
- [ ] "유저가 체크박스를 눌러야 영구 거부"라는 옛 정보에 속지 않았는가?
- [ ] `requestPermission()` 반환값(`res`)을 쓰는가, 아니면 stale한 `status`를 읽는가? (state 스냅샷 함정)
- [ ] 설정앱에서 권한을 수동으로 꺼서 거부 UX를 실제로 밟아봤는가?

> 참고: [Expo Permissions](https://docs.expo.dev/guides/permissions/) · [`useCameraPermissions`](https://docs.expo.dev/versions/v54.0.0/sdk/imagepicker/#imagepickerusecamerapermissions) · [Android 런타임 권한](https://developer.android.com/training/permissions/requesting) · [`Linking.openSettings()`](https://reactnative.dev/docs/linking#opensettings) · [MDN `getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
