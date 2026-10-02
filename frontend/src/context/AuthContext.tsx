// src/AuthContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AuthState = { token: string | null; role: string | null };

const AuthContext = createContext<{
  auth: AuthState;
  login: (token: string, role: string) => void;
  logout: () => void;
}>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
  });

  const login = (token: string, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setAuth({ token, role });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null });
  };

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);