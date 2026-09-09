import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState, type ReactNode } from "react";

interface UserToken {
  sub: string;
  email: string;
  name: string;
  role: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextData {
  token: string | null;
  user: User | null;
  login: (token: string, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token")
    );
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedToken =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (!storedToken) {
      return null;
    }

    try {
      const payload = jwtDecode<UserToken>(storedToken);
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
    } catch {
      return null;
    }
  });

  function login(newToken: string, remember = true) {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("access_token", newToken);

    const payload = jwtDecode<UserToken>(newToken);
    setToken(newToken);
    setUser({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    });
  }

  function logout() {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}