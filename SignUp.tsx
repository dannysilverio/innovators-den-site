import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import { TOPICS } from "@/lib/api";
import { trackEvent } from "@/lib/track";

const CONNECTION_INTENTS = [
  { key: "co-founder",  label: "Co-founder" },
  { key: "mentor",      label: "Mentor / Be Mentored" },
  { key: "investor",    label: "Investor" },
  { key: "advisor",     label: "Advisor" },
  { key: "contractor",  label: "Contractor" },
  { key: "beta-tester", label: "Beta Tester" },
  { key: "community",   label: "Community" },
];

const F: React.CSSProperties = {
  display: "block", width: "100%", boxSizing: "border-box",
  padding: "13px 16px", background: "#0d0d0d", border: "1px solid #2a2a2a",
  borderRadius: 10, color: "#f0f0f0", fontSize: 14, outline: "none",
  fontFamily: "system-ui, sans-serif",
};

function OnboardingModal({
  onDone,
  authHeader,
}: {
  onDone: () => void;
  authHeader: () => Record<string, string>;
}) {
  const [step, setStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [openToConnect, setOpenToConnect] = useState(true);
  const [intents, setIntents] = useState<string[]>([]);
  const [riseStatus, setRiseStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleTopic = (slug: string) =>
    setSelectedTopics(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug],
    );

  const toggleIntent = (key: string) =>
    setIntents(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );

  const save = async (finalRiseStatus?: string) => {
    setSaving(true);
    try {
      await fetch("/api/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          topicPreferences: selectedTopics,
          openToConnect,
          connectionIntents: intents,
          riseStatus: (finalRiseStatus ?? riseStatus).trim() || null,
        }),
      });
    } catch { /* non-critical */ }
    setSaving(false);
  };

  const next = async () => {
    if (step === 3) {
      await save(riseStatus);
      onDone();
    } else {
      setStep(s => s + 1);
    }
  };

  const skip = async () => {
    if (step === 3) await save("");
    onDone();
  };

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
    backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 999, padding: 20,
  };
  const modal: React.CSSProperties = {
    background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20,
    padding: "32px 28px", width: "100%", maxWidth: 520, maxHeight: "90vh",
    overflowY: "auto", fontFamily: "system-ui, sans-serif",
  };

  const stepLabel = ["Pick Your Topics", "Connection Goals", "Your Rise Status"][step - 1];
  const stepSub = [
    "What content should we curate for your feed?",
    "What kind of connections are you open to?",
    "Tell the Den where you are right now — one line that captures your current move.",
  ][step - 1];

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= step ? "#FFE600" : "#1e1e1e", transition: "background 0.3s" }} />
          ))}
        </div>

        <p style={{ color: "#FFE600", fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px", textTransform: "uppercase" }}>
          Step {step} of 3
        </p>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#fff" }}>{stepLabel}</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#666" }}>{stepSub}</p>

        {/* Step 1 — Topics */}
        {step === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOPICS.map(t => {
              const active = selectedTopics.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  onClick={() => toggleTopic(t.slug)}
                  style={{
                    padding: "8px 14px", borderRadius: 100, cursor: "pointer",
                    border: active ? `1.5px solid ${t.color}` : "1px solid #2a2a2a",
                    background: active ? t.color + "18" : "transparent",
                    color: active ? t.color : "#888",
                    fontWeight: active ? 700 : 500, fontSize: 13,
                    transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span>{t.emoji}</span> {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2 — Connection goals */}
        {step === 2 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Open to Connect</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#555" }}>Let other members know you're available</p>
              </div>
              <button
                onClick={() => setOpenToConnect(o => !o)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: openToConnect ? "#FFE600" : "#2a2a2a", position: "relative", flexShrink: 0, transition: "background 0.2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: openToConnect ? 23 : 3, width: 18, height: 18,
                  borderRadius: "50%", background: openToConnect ? "#000" : "#555", transition: "left 0.2s",
                }} />
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CONNECTION_INTENTS.map(ci => {
                const active = intents.includes(ci.key);
                return (
                  <button
                    key={ci.key}
                    onClick={() => toggleIntent(ci.key)}
                    style={{
                      padding: "8px 16px", borderRadius: 100, cursor: "pointer",
                      border: active ? "1.5px solid #FFE600" : "1px solid #2a2a2a",
                      background: active ? "#FFE60015" : "transparent",
                      color: active ? "#FFE600" : "#888",
                      fontWeight: active ? 700 : 500, fontSize: 13, transition: "all 0.15s",
                    }}
                  >
                    {ci.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Step 3 — Rise Status */}
        {step === 3 && (
          <>
            <input
              value={riseStatus}
              onChange={e => setRiseStatus(e.target.value.slice(0, 100))}
              placeholder="e.g. Building in Atlanta · Hiring engineers · Open to advising"
              maxLength={100}
              style={F}
            />
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#444" }}>{100 - riseStatus.length} characters remaining</p>
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#0a0900", border: "1px solid #2a2000", borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                ⚡ Your Rise Status appears on your profile and in the Innovator Directory — it's your real-time signal to the Den.
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <button
            onClick={next}
            disabled={saving}
            style={{
              flex: 1, padding: "13px", background: "#FFE600", color: "#000",
              border: "none", borderRadius: 12, fontWeight: 800, fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : step === 3 ? "Let's Go →" : "Next →"}
          </button>
          <button
            onClick={skip}
            style={{ padding: "13px 18px", background: "none", color: "#555", border: "1px solid #2a2a2a", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            {step === 3 ? "Skip" : "Skip for now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  const { register, user, authHeader } = useAuth();
  const [, setLocation] = useLocation();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  const next = new URLSearchParams(window.location.search).get("next") ?? "/";

  useEffect(() => {
    if (user && !justRegistered) setLocation(next);
  }, [user, justRegistered, next, setLocation]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    setError(null);
    try {
      await register(displayName.trim(), email.trim(), password);
      trackEvent("account_registered");
      setJustRegistered(true);
      setShowOnboarding(true);
    } catch (err: any) {
      setError(err.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    setLocation(next);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingModal onDone={handleOnboardingDone} authHeader={authHeader} />
      )}

      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Seo title="Create Account | The Innovators Den" description="Join The Innovators Den — the cultural operating system for Black and Brown innovators." type="website" />

        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 12px" }}>✦ THE INNOVATORS DEN</p>
            <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800 }}>Create your account</h1>
            <p style={{ color: "#666", fontSize: 14, margin: 0 }}>Free to join. Upgrade anytime.</p>
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>YOUR NAME</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="First and Last" autoComplete="name" style={F} />
            </div>
            <div>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" style={F} />
            </div>
            <div>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" style={F} />
            </div>
            <div>
              <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>CONFIRM PASSWORD</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password" style={F} />
            </div>

            {error && <p style={{ color: "#FF6B6B", fontSize: 13, margin: 0, background: "#FF6B6B10", border: "1px solid #FF6B6B30", borderRadius: 8, padding: "10px 14px" }}>{error}</p>}

            <button type="submit" disabled={loading}
              style={{ padding: "14px", background: "#FFE600", color: "#000", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? "Creating account…" : "Join the Den →"}
            </button>

            <p style={{ color: "#444", fontSize: 11, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
              By joining you agree to our{" "}
              <button type="button" onClick={() => setLocation("/privacy")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: 11 }}>
                Privacy Policy
              </button>
            </p>
          </form>

          <div style={{ textAlign: "center", marginTop: 28, color: "#555", fontSize: 13 }}>
            Already a member?{" "}
            <button onClick={() => setLocation(`/sign-in${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`)}
              style={{ background: "none", border: "none", color: "#FFE600", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
