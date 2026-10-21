import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_BASE = "/api";

const TIER_META: Record<string, { label: string; color: string; bg: string }> = {
  free:        { label: "Free",          color: "#888",    bg: "#1a1a1a" },
  member:      { label: "Den Member",    color: "#10B981", bg: "#10B98120" },
  pro:         { label: "Den Pro",       color: "#8B5CF6", bg: "#8B5CF620" },
  inner_circle:{ label: "Inner Circle",  color: "#FF4D7E", bg: "#FF4D7E20" },
  founding:    { label: "Founding",      color: "#FFE600", bg: "#FFE60020" },
};

function ProfileContent() {
  const { user, logout, authHeader, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [riseStatus, setRiseStatus] = useState(user?.riseStatus ?? "");
  const [twitterHandle, setTwitterHandle] = useState(user?.twitterHandle ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  type MemberStats = {
    signalsSubmitted: number;
    introsSent: number;
    introsReceived: number;
    reputationScore: number;
    reputationTier: string;
    referrals: number;
  };
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);

  useEffect(() => {
    const h = authHeader();
    if (!h.Authorization) return;
    fetch(`${API_BASE}/me/stats`, { headers: h })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMemberStats(d); })
      .catch(() => {});
  }, []);

  if (!user) return null;

  const referralLink = `https://theinnovatorsden.net/web/sign-up?ref=${encodeURIComponent(user.id)}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const tier = TIER_META[user.subscriptionTier] ?? TIER_META.free;
  const initials = user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const bgColors = ["#FFE600", "#FF4D7E", "#3B82F6", "#10B981", "#8B5CF6"];
  const colorIdx = user.displayName.charCodeAt(0) % bgColors.length;

  const saveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const r = await fetch(`${API_BASE}/users/me/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
          riseStatus: riseStatus.trim() || null,
          twitterHandle: twitterHandle.replace(/^@/, "").trim(),
          linkedinUrl: linkedinUrl.trim(),
          websiteUrl: websiteUrl.trim(),
        }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? "Save failed"); }
      await refresh();
      setEditing(false);
      setSaveMsg("Profile updated!");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSaveMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); setLocation("/"); };

  const F: React.CSSProperties = {
    display: "block", width: "100%", boxSizing: "border-box",
    padding: "11px 14px", background: "#0d0d0d", border: "1px solid #2a2a2a",
    borderRadius: 10, color: "#f0f0f0", fontSize: 13, outline: "none",
    fontFamily: "system-ui, sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <Seo title="My Profile | The Innovators Den" description="Manage your Innovators Den membership and profile." type="website" />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px 80px" }}>
        <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 32px" }}>MY PROFILE</p>

        {/* Avatar + tier */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 36, flexWrap: "wrap" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: bgColors[colorIdx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#000", flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800 }}>{user.displayName}</h1>
            <p style={{ margin: "0 0 8px", color: "#666", fontSize: 13 }}>{user.email}</p>
            <span style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.color}40`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Profile fields */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: 0 }}>PROFILE INFO</p>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{ padding: "7px 16px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer" }}>Edit</button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditing(false)} style={{ padding: "7px 14px", background: "none", border: "1px solid #333", borderRadius: 8, color: "#888", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                <button onClick={saveProfile} disabled={saving} style={{ padding: "7px 16px", background: "#FFE600", border: "none", borderRadius: 8, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>

          {saveMsg && <p style={{ color: saveMsg.includes("updated") ? "#10B981" : "#FF6B6B", fontSize: 13, margin: "0 0 16px", background: saveMsg.includes("updated") ? "#10B98115" : "#FF6B6B15", padding: "8px 12px", borderRadius: 8 }}>{saveMsg}</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>DISPLAY NAME</label>
              {editing ? (
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={F} />
              ) : (
                <p style={{ margin: 0, fontSize: 14, color: "#f0f0f0" }}>{user.displayName}</p>
              )}
            </div>
            <div>
              <label style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>EMAIL</label>
              <p style={{ margin: 0, fontSize: 14, color: "#888" }}>{user.email}</p>
            </div>
            {(editing || user.bio) && (
              <div>
                <label style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>BIO</label>
                {editing ? (
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell the Den who you are…" style={{ ...F, resize: "vertical" }} />
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.6 }}>{user.bio}</p>
                )}
              </div>
            )}
            {(editing || user.riseStatus) && (
              <div>
                <label style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>RISE STATUS</label>
                {editing ? (
                  <>
                    <input
                      value={riseStatus}
                      onChange={e => setRiseStatus(e.target.value.slice(0, 100))}
                      placeholder="e.g. Building in Atlanta · Hiring engineers · Open to advising"
                      maxLength={100}
                      style={F}
                    />
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#555" }}>{100 - riseStatus.length} characters remaining</p>
                  </>
                ) : (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1a1500", border: "1px solid #2a2000", borderRadius: 8, padding: "5px 12px" }}>
                    <span style={{ fontSize: 12, color: "#FFE600" }}>⚡</span>
                    <span style={{ fontSize: 13, color: "#FFE600", fontWeight: 600 }}>{user.riseStatus}</span>
                  </div>
                )}
              </div>
            )}
            {editing && (
              <>
                <div>
                  <label style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>TWITTER / X HANDLE</label>
                  <input value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} placeholder="@handle" style={F} />
                </div>
                <div>
                  <label style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>LINKEDIN URL</label>
                  <input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourname" style={F} />
                </div>
                <div>
                  <label style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>WEBSITE</label>
                  <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com" style={F} />
                </div>
              </>
            )}
            {!editing && (user.twitterHandle || user.linkedinUrl || user.websiteUrl) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 8 }}>
                {user.twitterHandle && (
                  <a href={`https://twitter.com/${user.twitterHandle.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "6px 14px", background: "#111", border: "1px solid #222", borderRadius: 20, color: "#1DA1F2", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                    𝕏 @{user.twitterHandle.replace(/^@/, "")}
                  </a>
                )}
                {user.linkedinUrl && (
                  <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "6px 14px", background: "#111", border: "1px solid #222", borderRadius: 20, color: "#0A66C2", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                    in LinkedIn
                  </a>
                )}
                {user.websiteUrl && (
                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "6px 14px", background: "#111", border: "1px solid #222", borderRadius: 20, color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                    🌐 Website
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Connection intent pills — read-only view */}
          {!editing && user.openToConnect && user.connectionIntents && user.connectionIntents.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
              <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 10px" }}>OPEN TO CONNECT</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {user.connectionIntents.map((intent: string) => (
                  <span
                    key={intent}
                    style={{ padding: "4px 12px", background: "#111", border: "1px solid #2a2a2a", borderRadius: 20, fontSize: 12, color: "#ccc", fontWeight: 500 }}
                  >
                    {intent.charAt(0).toUpperCase() + intent.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MY MOMENTUM — platform stats bar */}
        {memberStats && (
          <div style={{ background: "#0a0a00", border: "1px solid #1e1e00", borderRadius: 16, marginBottom: 20, overflow: "hidden" }}>
            <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, margin: 0, padding: "14px 20px 10px" }}>MY MOMENTUM</p>
            <div style={{ display: "flex", borderTop: "1px solid #1a1a00" }}>
              {[
                { label: "Signals", value: memberStats.signalsSubmitted, highlight: false },
                { label: "Intros", value: memberStats.introsSent + memberStats.introsReceived, highlight: false },
                { label: "Rep Score", value: memberStats.reputationScore, highlight: true },
                { label: "Referrals", value: memberStats.referrals, highlight: memberStats.referrals > 0 },
              ].map((stat, i, arr) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1, textAlign: "center", padding: "16px 8px",
                    borderRight: i < arr.length - 1 ? "1px solid #1a1a00" : "none",
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 700, color: stat.highlight ? "#FFE600" : "#fff", lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, marginTop: 5 }}>
                    {stat.label.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral link */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 8px" }}>REFER A FRIEND</p>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>
            Share your unique link to invite others to join the Den community.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#666", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
              {referralLink}
            </div>
            <button onClick={copyReferral} style={{ padding: "10px 18px", background: copied ? "#10B981" : "#FFE600", color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Membership */}
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 16px" }}>MEMBERSHIP</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{tier.label}</p>
              <p style={{ margin: 0, color: "#555", fontSize: 12 }}>{user.subscriptionTier === "free" ? "Free plan — upgrade to unlock all features" : "Active membership"}</p>
            </div>
            {user.subscriptionTier === "free" && (
              <button onClick={() => setLocation("/membership")} style={{ padding: "10px 20px", background: "#FFE600", color: "#000", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Upgrade →
              </button>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button onClick={handleLogout} style={{ padding: "11px 24px", background: "none", border: "1px solid #2a2a2a", borderRadius: 10, color: "#666", fontSize: 13, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
