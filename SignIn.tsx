import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = new URLSearchParams(window.location.search).get("next") ?? "/";

  useEffect(() => {
    if (user) setLocation(next);
  }, [user, next, setLocation]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const F: React.CSSProperties = {
    display: "block", width: "100%", boxSizing: "border-box",
    padding: "13px 16px", background: "#0d0d0d", border: "1px solid #2a2a2a",
    borderRadius: 10, color: "#f0f0f0", fontSize: 14, outline: "none",
    fontFamily: "system-ui, sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Seo title="Sign In | The Innovators Den" description="Sign in to your Innovators Den account." type="website" />

      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>✦ THE INNOVATORS DEN</p>
          <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800 }}>Welcome back</h1>
          <p style={{ color: "#666", fontSize: 14, margin: 0 }}>Sign in to access your member experience</p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" style={F} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>PASSWORD</label>
              <button type="button" onClick={() => setLocation("/forgot-password")} style={{ background: "none", border: "none", color: "#666", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                Forgot password?
              </button>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" style={F} />
          </div>

          {error && <p style={{ color: "#FF6B6B", fontSize: 13, margin: 0, background: "#FF6B6B10", border: "1px solid #FF6B6B30", borderRadius: 8, padding: "10px 14px" }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ padding: "14px", background: "#FFE600", color: "#000", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 28, color: "#555", fontSize: 13 }}>
          Don't have an account?{" "}
          <button onClick={() => setLocation(`/sign-up${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`)}
            style={{ background: "none", border: "none", color: "#FFE600", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            Create one free
          </button>
        </div>
      </div>
    </div>
  );
}
