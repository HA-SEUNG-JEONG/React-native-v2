import { useMemo, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { queryClient } from "./src/api/posts";
import { AuthContext, type Auth } from "./src/auth/AuthContext";
import { RootNavigator, linking, LinkingFallback } from "./src/navigation";

// 트리 최상단 배선만 담당:
//  - QueryClientProvider: 하위 어디서든 useQuery/useInfiniteQuery 사용 가능. 1개.
//  - AuthContext.Provider: 인증 상태(user) + signIn/signOut 주입.
//  - NavigationContainer: 딥링크 매핑 + 다크 테마. 1개.
export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const auth = useMemo<Auth>(
    () => ({
      user,
      signIn: (name) => setUser(name),
      signOut: () => setUser(null),
    }),
    [user],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <NavigationContainer
          theme={DarkTheme}
          linking={linking}
          fallback={<LinkingFallback />}
        >
          <RootNavigator />
        </NavigationContainer>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
