# React-native-v2

Expo SDK 54 / React Native 0.81 학습 프로젝트. 서버는 jsonplaceholder + 메모리 세션 **모의 구현**이고, 실서비스 앱이 아니다. 프로덕션 패턴(race, 오프라인, 롤백)을 모의 서버 위에서 개념 검증하는 것이 목적.

## 실행

```bash
npm ci
npx expo start     # Expo Go로 실행
npm run typecheck
npm test           # 토큰 갱신 dedup (약 5초)
```

## 핵심 소재

| 소재 | 코드 |
| --- | --- |
| 동시 401 토큰 갱신 dedup (`refreshInFlight` Promise 공유) | `src/api/auth.ts`, `tests/auth.test.ts` |
| 오프라인 뮤테이션 큐 + 재시작 후 재생 (`setMutationDefaults`) | `src/api/posts.ts`, `App.tsx` |
| 낙관적 업데이트 + 롤백 (무한스크롤 2차원 캐시 포함) | `src/screens/FeedDetailScreen.tsx`, `src/api/posts.ts` |
| 알림 탭 딥링크 (cold start는 `useLastNotificationResponse`) | `App.tsx` |
| 제스처 충돌 (`Gesture.Race` + `activeOffsetX`) | `src/components/SwipeableRow.tsx` |
| 재시도 backoff + jitter, WebSocket 재연결 | `src/api/network.ts` |

## 한계

- 알림은 로컬 알림만 (원격 푸시 없음), 인증은 모의 세션.
- 성능 최적화(`React.memo`, `getItemLayout`)와 접근성은 다루지 않음.

학습 기록과 리뷰 수정 내역은 `docs/` 참고.
