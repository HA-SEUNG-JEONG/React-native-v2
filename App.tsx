import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { queryClient } from "./src/api/posts";
import { asyncStoragePersister } from "./src/api/persist";
import { AuthContext, type Auth } from "./src/auth/AuthContext";
import { RootNavigator, linking, LinkingFallback } from "./src/navigation";
import { styles } from "./src/theme/styles";

const AUTH_KEY = "auth_user";

// 앱이 포그라운드일 때 알림을 어떻게 보여줄지 — 모듈 스코프에서 1회 설정.
// 없으면 포그라운드 중 온 알림은 기본적으로 무시됨(배너/리스트 표시 안 함).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// 트리 최상단 배선만 담당:
//  - QueryClientProvider: 하위 어디서든 useQuery/useInfiniteQuery 사용 가능. 1개.
//  - AuthContext.Provider: 인증 상태(user) + signIn/signOut 주입.
//  - NavigationContainer: 딥링크 매핑 + 다크 테마. 1개.
export default function App() {
  // 부팅 중엔 SecureStore 조회가 끝나기 전이라 user가 미정 — 그 사이 로그인 화면이
  // 잠깐 비쳤다 사라지는 걸(flash) 막기 위해 별도 로딩 상태로 렌더 자체를 미룸.
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [persistError, setPersistError] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(AUTH_KEY)
      .then(setUser)
      .catch(() => {
        // 조회 실패는 "로그아웃 상태"로 취급 — 앱을 못 띄우게 하지 않음
        setUser(null);
      })
      .finally(() => setIsReady(true));
  }, []);

  const auth = useMemo<Auth>(
    () => ({
      user,
      persistError,
      signIn: (name) => {
        // 낙관적: 저장 성패와 무관하게 이번 세션은 즉시 로그인.
        // 저장만 실패하면 재시작 시 로그인이 안 풀린다 — 그 사실을 배너로 알림.
        setUser(name);
        SecureStore.setItemAsync(AUTH_KEY, name)
          .then(() => setPersistError(null))
          .catch(() =>
            setPersistError(
              "로그인 정보 저장 실패 — 앱을 재시작하면 다시 로그인해야 함",
            ),
          );
      },
      signOut: () => {
        setUser(null);
        SecureStore.deleteItemAsync(AUTH_KEY)
          .then(() => setPersistError(null))
          .catch(() =>
            setPersistError("로그아웃 정보 삭제 실패 — 기기에 값이 남아있을 수 있음"),
          );
      },
    }),
    [user, persistError],
  );

  if (!isReady) {
    return <View style={[styles.screen, styles.center]} />;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24시간 지난 캐시는 복원 안 함
      }}
      // 캐시 복원이 끝난 뒤에 호출해야 함 — 그 전에 부르면 재생할 뮤테이션이 아직 없음.
      onSuccess={() => {
        queryClient.resumePausedMutations();
      }}
    >
      <AuthContext.Provider value={auth}>
        <NavigationContainer
          theme={DarkTheme}
          linking={linking}
          fallback={<LinkingFallback />}
        >
          <RootNavigator />
        </NavigationContainer>
      </AuthContext.Provider>
    </PersistQueryClientProvider>
  );
}
