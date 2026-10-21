import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const API_BASE = "/api";
const TOKEN_KEY = "tid_jwt";

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  role: string;
  subscriptionTier: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  industry?: string;
  city?: string;
  skills?: string[];
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  openToConnect?: boolean;
  connectionIntents?: string[];
  primaryIntent?: string;
  riseStatus?: string | null;
  isPro: boolean;
  isCreator: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  authHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const authHeader = useCallback((): Record<string, string> => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, []);

  const handleAuthResponse = (data: { token: string; user: AuthUser }) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const refresh = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) { setLoading(false); return; }
    try {
      const r = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (!r.ok) { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); return; }
      const data = await r.json();
      setUser(data.user ?? data);
    } catch {
      // network error — keep cached state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? data.message ?? "Login failed");
    handleAuthResponse(data);
  };

  const register = async (displayName: string, email: string, password: string) => {
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? data.message ?? "Registration failed");
    handleAuthResponse(data);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refresh, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
