import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearToken, readToken, storeToken } from "../../services/token-storage";

export type Role = "USER" | "ADMIN";

interface UserToken {
  sub: string;
  email: string;
  name: string;
  role: Role;
  exp?: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface Session {
  token: string;
  user: User;
  expiresAt: number | null;
}

interface AuthContextData {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
  login: (token: string, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

function toSession(token: string): Session | null {
  try {
    const payload = jwtDecode<UserToken>(token);
    const expiresAt = payload.exp ? payload.exp * 1000 : null;
    if (expiresAt !== null && expiresAt <= Date.now()) return null;

    return {
      token,
      expiresAt,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    };
  } catch {
    return null;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(() => {
    const stored = readToken();
    const restored = stored ? toSession(stored) : null;
    if (!restored) clearToken();
    return restored;
  });

  function login(newToken: string, remember = true) {
    const newSession = toSession(newToken);
    if (!newSession) {
      throw new Error("Token de acesso inválido ou expirado.");
    }
    storeToken(newToken, remember);
    setSession(newSession);
  }

  function logout() {
    clearToken();
    setSession(null);
  }

  useEffect(() => {
    if (!session?.expiresAt) return;
    const timeout = setTimeout(() => {
      clearToken();
      setSession(null);
    }, session.expiresAt - Date.now());
    return () => clearTimeout(timeout);
  }, [session]);

  function hasRole(...roles: Role[]) {
    return session !== null && roles.includes(session.user.role);
  }

  return (
    <AuthContext.Provider
      value={{
        token: session?.token ?? null,
        user: session?.user ?? null,
        isAuthenticated: session !== null,
        hasRole,
        login,
        logout,
      }}
    >
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
