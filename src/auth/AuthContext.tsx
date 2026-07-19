import { createContext, useContext } from "react";

// ---- 인증 상태: 라이브러리 없이 Context + useState (ponytail: 로그인 게이트 개념 학습이 목적) ----
// 실제 user state + provider 값 생성은 App.tsx가 담당(트리 최상단 배선을 눈에 보이게).
export type Auth = {
  user: string | null;
  signIn: (name: string) => void;
  signOut: () => void;
};

export const AuthContext = createContext<Auth>({
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);
