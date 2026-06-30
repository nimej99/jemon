"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export type Role = "admin" | "operator" | "viewer";

export interface AuthUser {
  username: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount: hydrate from stored token via GET /auth/me.
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jemon_token")
        : null;
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) =>
        r.ok ? (r.json() as Promise<{ user: AuthUser }>) : Promise.reject(),
      )
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("jemon_token");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  /** POST /auth/login, store token, update user state. Throws on 401. */
  const login = useCallback(async (username: string, password: string) => {
    const r = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) throw new Error("Invalid credentials");
    const data = (await r.json()) as { token: string; user: AuthUser };
    localStorage.setItem("jemon_token", data.token);
    setUser(data.user);
  }, []);

  /** Clear token, POST /auth/logout, redirect to /login. */
  const logout = useCallback(async () => {
    const token = localStorage.getItem("jemon_token");
    localStorage.removeItem("jemon_token");
    setUser(null);
    if (token) {
      // Fire-and-forget; server-side logout is stateless.
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {
        // ignore errors on logout
      });
    }
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * Renders children only when authenticated.
 * Returns null while the auth state is loading or when unauthenticated
 * (and triggers a redirect to /login).
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;
  return <>{children}</>;
}
