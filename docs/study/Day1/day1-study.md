왜 권한 범위를 보여주는 Text는 보이지 않을까?

scope는 null로 찍히기 때문에 항상 보이지 않는다.

그렇다면 scope 값이 보이도록 하려면 어떻게 해야 할까?

---

틀렸다. 코드가 잘못 작성되어 있었다.

혹시나 res 값을 찍어보니 ios에서는 `{"canAskAgain": true, "expires": "never", "granted": true, "scope": "whenInUse", "status": "granted"}` 로 되어 있었고, android에서는 `{"android": {"accuracy": "fine"}, "canAskAgain": true, "expires": "never", "granted": true, "status": "granted"}`  

 iOS의 scope는 최상위에 있고, Android는 scope 없이 android.accuracy만 있다.

원인: 코드가 res.ios?.scope를 읽었는데, 이 값은 타입 선언에만 있고 런타임에는 양쪽 모두 undefined라서 null이 됐다.