import { useState, useEffect, useCallback } from "react";

const ACCESS_CODE = "TIDADES2026";
const ACCESS_KEY = "@tid_ad_manager_access";
const API = "/api";

// ─── Types ────────────────────────────────────────────────────────────────
interface Campaign {
  id: string;
  advertiserName: string;
  campaignName: string;
  campaignType: string;
  startDate: string;
  endDate: string;
  status: string;
  targetUrl: string | null;
  notes: string | null;
  createdAt: string;
}

interface Creative {
  id: string;
  campaignId: string;
  creativeType: string;
  headline: string;
  body: string | null;
  brandName: string | null;
  category: string | null;
  logoChar: string | null;
  cta: string | null;
  sponsorLabel: string | null;
  accentColor: string | null;
  active: boolean;
}

interface Slot {
  id: string;
  slotKey: string;
  name: string;
  platform: string;
  formatType: string;
  active: boolean;
}

interface Placement {
  placement: {
    id: string;
    weight: number;
    tierExclusions: string[];
    active: boolean;
  };
  slot: { slotKey: string; name: string; platform: string };
  campaign: { advertiserName: string; status: string };
  creative: { headline: string; creativeType: string };
}

// ─── Auth gate ────────────────────────────────────────────────────────────
function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (code.trim().toUpperCase() === ACCESS_CODE) {
      localStorage.setItem(ACCESS_KEY, "true");
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#111", border: "1px solid #FFE60040", borderRadius: 20, padding: 48, maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 0 60px #FFE60010" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
        <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 12px" }}>ADMIN ACCESS</p>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 10px" }}>Ad Manager</h2>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
          Manage house ad campaigns, creatives, and placements across The Innovators Den.
        </p>
        <input
          type="password"
          placeholder="Enter access code"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${error ? "#FF4D7E" : "#333"}`,
            background: "#1a1a1a", color: "#fff", fontSize: 16, fontFamily: "monospace",
            outline: "none", boxSizing: "border-box", marginBottom: 16,
            transition: "border-color 0.2s",
          }}
        />
        {error && <p style={{ color: "#FF4D7E", fontSize: 13, margin: "-8px 0 12px" }}>Invalid access code</p>}
        <button
          onClick={submit}
          style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: "#FFE600", color: "#000", fontSize: 15, fontWeight: 800, cursor: "pointer" }}
        >
          Enter Ad Manager →
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 1, background: color + "22", color, border: `1px solid ${color}44` }}>
      {label.toUpperCase()}
    </span>
  );
}

function statusColor(s: string) {
  return s === "active" ? "#22c55e" : s === "draft" ? "#FFE600" : s === "paused" ? "#f97316" : "#ef4444";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", color: "#999", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
    />
  );
}

function Btn({ children, onClick, variant = "primary", disabled = false, small = false }: { children: React.ReactNode; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; variant?: "primary" | "ghost" | "danger"; disabled?: boolean; small?: boolean }) {
  const bg = variant === "primary" ? "#FFE600" : variant === "danger" ? "#ef4444" : "transparent";
  const color = variant === "primary" ? "#000" : variant === "danger" ? "#fff" : "#FFE600";
  const border = variant === "ghost" ? "1px solid #FFE60044" : "none";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ padding: small ? "6px 14px" : "10px 20px", borderRadius: 8, border, background: bg, color, fontSize: small ? 12 : 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s" }}
    >
      {children}
    </button>
  );
}

// ─── Preview card ─────────────────────────────────────────────────────────
function CreativePreview({ c, advertiser }: { c: Partial<Creative>; advertiser?: string }) {
  const accent = c.accentColor || "#FFE600";
  if (c.creativeType === "billboard") {
    return (
      <div style={{ background: "#111", border: `1px solid ${accent}40`, borderRadius: 12, padding: 20, maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{c.logoChar || "✦"}</span>
          <div>
            <div style={{ color: "#888", fontSize: 9, letterSpacing: 1 }}>ADVERTISEMENT</div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{c.brandName || advertiser || "Brand"}</div>
          </div>
        </div>
        <div style={{ color: "#fff", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{c.headline || "Headline"}</div>
        <div style={{ color: "#aaa", fontSize: 13, marginBottom: 14 }}>{c.body || "Body copy."}</div>
        <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: accent, color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>{c.cta || "Learn More"}</button>
      </div>
    );
  }
  if (c.creativeType === "featured_listing") {
    return (
      <div style={{ background: "#111", border: `2px solid ${accent}60`, borderRadius: 16, padding: 20, maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ color: accent, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>✦ {c.sponsorLabel || "SPONSORED"}</span>
        </div>
        <div style={{ color: "#fff", fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{c.headline || "Headline"}</div>
        <div style={{ color: "#aaa", fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{c.body || "Body copy."}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#666", fontSize: 11 }}>PRESENTED BY {c.brandName || advertiser || "Brand"}</span>
          <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: accent, color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{c.cta || "Learn More"}</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: "#111", border: "1px solid #333", borderRadius: 12, padding: 16, maxWidth: 400 }}>
      <div style={{ color: "#666", fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>SPONSORED · {c.category || "CATEGORY"}</div>
      <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{c.headline || "Headline"}</div>
      <div style={{ color: "#aaa", fontSize: 13, marginBottom: 12 }}>{c.body || "Body copy."}</div>
      <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: accent, color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{c.cta || "Learn More"}</button>
    </div>
  );
}

// ─── Tab: Campaigns ───────────────────────────────────────────────────────
function CampaignsTab({ token, onSelectCampaign }: { token: string; onSelectCampaign: (id: string) => void }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    advertiserName: "The Innovators Den",
    campaignName: "",
    campaignType: "house_ad",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "2099-12-31",
    status: "active",
    targetUrl: "",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`${API}/ads/campaigns`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    setCampaigns(d.campaigns || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API}/ads/campaigns/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const create = async () => {
    if (!form.campaignName.trim()) return;
    setSaving(true);
    await fetch(`${API}/ads/campaigns`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowCreate(false);
    setForm({ ...form, campaignName: "", notes: "", targetUrl: "" });
    load();
  };

  const f = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 }}>Campaigns ({campaigns.length})</h2>
        <Btn onClick={() => setShowCreate(v => !v)} variant={showCreate ? "ghost" : "primary"}>{showCreate ? "Cancel" : "+ New Campaign"}</Btn>
      </div>

      {showCreate && (
        <div style={{ background: "#111", border: "1px solid #FFE60033", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#FFE600", fontSize: 14, fontWeight: 700, letterSpacing: 1, margin: "0 0 20px" }}>NEW CAMPAIGN</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="ADVERTISER NAME"><Input value={form.advertiserName} onChange={f("advertiserName")} placeholder="e.g. The Innovators Den" /></Field>
            <Field label="CAMPAIGN NAME"><Input value={form.campaignName} onChange={f("campaignName")} placeholder="e.g. TID House Ad: Membership" /></Field>
            <Field label="TYPE"><Select value={form.campaignType} onChange={f("campaignType")} options={[{ value: "house_ad", label: "House Ad" }, { value: "direct", label: "Direct Sponsorship" }, { value: "programmatic", label: "Programmatic" }]} /></Field>
            <Field label="STATUS"><Select value={form.status} onChange={f("status")} options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "paused", label: "Paused" }]} /></Field>
            <Field label="START DATE"><Input type="date" value={form.startDate} onChange={f("startDate")} /></Field>
            <Field label="END DATE"><Input type="date" value={form.endDate} onChange={f("endDate")} /></Field>
            <Field label="TARGET URL"><Input value={form.targetUrl} onChange={f("targetUrl")} placeholder="e.g. /web/membership" /></Field>
            <Field label="NOTES"><Input value={form.notes} onChange={f("notes")} placeholder="Internal notes" /></Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={create} disabled={saving || !form.campaignName.trim()}>{saving ? "Saving…" : "Create Campaign"}</Btn>
            <Btn onClick={() => setShowCreate(false)} variant="ghost">Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#666", textAlign: "center", padding: 40 }}>Loading…</p>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#444" }}>No campaigns yet. Create one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {campaigns.map(c => (
            <div key={c.id} style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => onSelectCampaign(c.id)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{c.campaignName}</span>
                  <Badge label={c.status} color={statusColor(c.status)} />
                  <Badge label={c.campaignType.replace("_", " ")} color="#888" />
                </div>
                <div style={{ color: "#666", fontSize: 13 }}>
                  {c.advertiserName} · {c.startDate.slice(0, 10)} → {c.endDate.slice(0, 10)}
                  {c.notes && <span style={{ color: "#555", marginLeft: 8 }}>· {c.notes}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {c.status !== "active" && (
                  <Btn small onClick={e => { e.stopPropagation(); updateStatus(c.id, "active"); }} variant="ghost">Activate</Btn>
                )}
                {c.status === "active" && (
                  <Btn small onClick={e => { e.stopPropagation(); updateStatus(c.id, "paused"); }} variant="ghost">Pause</Btn>
                )}
                <Btn small onClick={e => { e.stopPropagation(); updateStatus(c.id, "cancelled"); }} variant="danger">Cancel</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Creatives ───────────────────────────────────────────────────────
function CreativesTab({ token, campaigns }: { token: string; campaigns: Campaign[] }) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || "");
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Partial<Creative> | null>(null);
  const [form, setForm] = useState({
    creativeType: "native",
    headline: "",
    body: "",
    brandName: "The Innovators Den",
    category: "MEMBERSHIP",
    logoChar: "✦",
    cta: "Learn More",
    sponsorLabel: "THE INNOVATORS DEN",
    accentColor: "#FFE600",
  });

  const load = useCallback(async (campId: string) => {
    if (!campId) return;
    setLoading(true);
    const r = await fetch(`${API}/ads/creatives?campaignId=${campId}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    setCreatives(d.creatives || []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (selectedCampaignId) load(selectedCampaignId);
  }, [selectedCampaignId, load]);

  const create = async () => {
    if (!form.headline.trim() || !selectedCampaignId) return;
    setSaving(true);
    await fetch(`${API}/ads/creatives`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: selectedCampaignId, ...form }),
    });
    setSaving(false);
    setShowCreate(false);
    load(selectedCampaignId);
  };

  const deactivate = async (id: string, active: boolean) => {
    await fetch(`${API}/ads/creatives/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load(selectedCampaignId);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this creative permanently?")) return;
    await fetch(`${API}/ads/creatives/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load(selectedCampaignId);
  };

  const f = (k: keyof typeof form) => (v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setPreview(p => ({ ...p, [k]: v }));
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 }}>Creatives</h2>
          <select
            value={selectedCampaignId}
            onChange={e => setSelectedCampaignId(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: 13, outline: "none" }}
          >
            <option value="">Select campaign…</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaignName}</option>)}
          </select>
        </div>
        {selectedCampaignId && (
          <Btn onClick={() => { setShowCreate(v => !v); setPreview(showCreate ? null : form); }} variant={showCreate ? "ghost" : "primary"}>
            {showCreate ? "Cancel" : "+ New Creative"}
          </Btn>
        )}
      </div>

      {showCreate && selectedCampaignId && (
        <div style={{ background: "#111", border: "1px solid #FFE60033", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#FFE600", fontSize: 14, fontWeight: 700, letterSpacing: 1, margin: "0 0 20px" }}>NEW CREATIVE</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="CREATIVE TYPE">
                    <Select value={form.creativeType} onChange={f("creativeType")} options={[
                      { value: "native", label: "Native Card" },
                      { value: "billboard", label: "Billboard" },
                      { value: "featured_listing", label: "Featured Listing" },
                      { value: "sponsored_module", label: "Sponsored Module" },
                    ]} />
                  </Field>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="HEADLINE *"><Input value={form.headline} onChange={f("headline")} placeholder="e.g. Unlock the Full Den Experience" /></Field>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="BODY COPY"><Textarea value={form.body} onChange={f("body")} placeholder="Supporting copy (1-2 sentences)" /></Field>
                </div>
                <Field label="BRAND NAME"><Input value={form.brandName} onChange={f("brandName")} placeholder="The Innovators Den" /></Field>
                <Field label="CATEGORY"><Input value={form.category} onChange={f("category")} placeholder="MEMBERSHIP" /></Field>
                <Field label="LOGO CHAR"><Input value={form.logoChar} onChange={f("logoChar")} placeholder="✦" /></Field>
                <Field label="CTA BUTTON"><Input value={form.cta} onChange={f("cta")} placeholder="Learn More" /></Field>
                <Field label="SPONSOR LABEL"><Input value={form.sponsorLabel} onChange={f("sponsorLabel")} placeholder="THE INNOVATORS DEN" /></Field>
                <Field label="ACCENT COLOR"><Input type="color" value={form.accentColor} onChange={f("accentColor")} /></Field>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Btn onClick={create} disabled={saving || !form.headline.trim()}>{saving ? "Saving…" : "Create Creative"}</Btn>
                <Btn onClick={() => { setShowCreate(false); setPreview(null); }} variant="ghost">Cancel</Btn>
              </div>
            </div>
            <div>
              <p style={{ color: "#666", fontSize: 11, letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>LIVE PREVIEW</p>
              {preview && <CreativePreview c={{ ...preview, creativeType: form.creativeType }} advertiser={selectedCampaign?.advertiserName} />}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#666", padding: 40, textAlign: "center" }}>Loading…</p>
      ) : !selectedCampaignId ? (
        <div style={{ textAlign: "center", padding: 60, color: "#444" }}>Select a campaign above to view its creatives.</div>
      ) : creatives.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#444" }}>No creatives yet. Create one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {creatives.map(c => (
            <div key={c.id} style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: c.accentColor || "#FFE600", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{c.logoChar || "✦"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{c.headline}</span>
                  <Badge label={c.creativeType.replace("_", " ")} color="#888" />
                  {!c.active && <Badge label="inactive" color="#ef4444" />}
                </div>
                <div style={{ color: "#666", fontSize: 13 }}>{c.body?.slice(0, 80)}{(c.body?.length || 0) > 80 ? "…" : ""} · CTA: "{c.cta}"</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Btn small onClick={() => deactivate(c.id, c.active)} variant="ghost">{c.active ? "Pause" : "Activate"}</Btn>
                <Btn small onClick={() => remove(c.id)} variant="danger">Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Placements ──────────────────────────────────────────────────────
function PlacementsTab({ token, campaigns }: { token: string; campaigns: Campaign[] }) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || "");
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slotId: "", creativeId: "", weight: "10", tierExclusions: [] as string[] });

  const loadSlots = useCallback(async () => {
    const r = await fetch(`${API}/ads/slots`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    setSlots(d.slots || []);
  }, [token]);

  const load = useCallback(async (campId: string) => {
    if (!campId) return;
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch(`${API}/ads/placements?campaignId=${campId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/ads/creatives?campaignId=${campId}`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const [pd, cd] = await Promise.all([pRes.json(), cRes.json()]);
    setPlacements(pd.placements || []);
    setCreatives(cd.creatives || []);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadSlots(); }, [loadSlots]);
  useEffect(() => { if (selectedCampaignId) load(selectedCampaignId); }, [selectedCampaignId, load]);

  const TIERS = ["free", "pro", "founding"];
  const toggleTier = (tier: string) => {
    setForm(p => ({
      ...p,
      tierExclusions: p.tierExclusions.includes(tier)
        ? p.tierExclusions.filter(t => t !== tier)
        : [...p.tierExclusions, tier],
    }));
  };

  const create = async () => {
    if (!form.slotId || !form.creativeId || !selectedCampaignId) return;
    setSaving(true);
    await fetch(`${API}/ads/placements`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: selectedCampaignId, slotId: form.slotId, creativeId: form.creativeId, weight: parseInt(form.weight), tierExclusions: form.tierExclusions }),
    });
    setSaving(false);
    setShowCreate(false);
    setForm({ slotId: "", creativeId: "", weight: "10", tierExclusions: [] });
    load(selectedCampaignId);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`${API}/ads/placements/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load(selectedCampaignId);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this placement?")) return;
    await fetch(`${API}/ads/placements/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load(selectedCampaignId);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 }}>Placements</h2>
          <select
            value={selectedCampaignId}
            onChange={e => setSelectedCampaignId(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: 13, outline: "none" }}
          >
            <option value="">Select campaign…</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaignName}</option>)}
          </select>
        </div>
        {selectedCampaignId && (
          <Btn onClick={() => setShowCreate(v => !v)} variant={showCreate ? "ghost" : "primary"}>
            {showCreate ? "Cancel" : "+ New Placement"}
          </Btn>
        )}
      </div>

      {showCreate && selectedCampaignId && (
        <div style={{ background: "#111", border: "1px solid #FFE60033", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: "#FFE600", fontSize: 14, fontWeight: 700, letterSpacing: 1, margin: "0 0 20px" }}>NEW PLACEMENT</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="AD SLOT (27 available)">
              <select
                value={form.slotId}
                onChange={e => setForm(p => ({ ...p, slotId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              >
                <option value="">Select slot…</option>
                {slots.filter(s => s.active).map(s => (
                  <option key={s.id} value={s.id}>{s.slotKey} — {s.name} ({s.platform})</option>
                ))}
              </select>
            </Field>
            <Field label="CREATIVE">
              <select
                value={form.creativeId}
                onChange={e => setForm(p => ({ ...p, creativeId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              >
                <option value="">Select creative…</option>
                {creatives.map(c => <option key={c.id} value={c.id}>{c.creativeType}: {c.headline.slice(0, 40)}</option>)}
              </select>
            </Field>
            <Field label="WEIGHT (higher = shown more)">
              <Input value={form.weight} onChange={v => setForm(p => ({ ...p, weight: v }))} placeholder="10" />
            </Field>
          </div>
          <Field label="EXCLUDE FROM TIERS (these tiers will NOT see this ad)">
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {TIERS.map(t => (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: form.tierExclusions.includes(t) ? "#FF4D7E" : "#aaa", fontSize: 13, fontWeight: 600 }}>
                  <input type="checkbox" checked={form.tierExclusions.includes(t)} onChange={() => toggleTier(t)} style={{ accentColor: "#FF4D7E" }} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={create} disabled={saving || !form.slotId || !form.creativeId}>{saving ? "Saving…" : "Create Placement"}</Btn>
            <Btn onClick={() => setShowCreate(false)} variant="ghost">Cancel</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#666", padding: 40, textAlign: "center" }}>Loading…</p>
      ) : !selectedCampaignId ? (
        <div style={{ textAlign: "center", padding: 60, color: "#444" }}>Select a campaign to manage its placements.</div>
      ) : placements.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#444" }}>No placements yet. Create one above to map a creative to a slot.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {placements.map(({ placement, slot, creative }) => (
            <div key={placement.id} style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ color: "#FFE600", fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>{slot.slotKey}</span>
                  <Badge label={slot.platform} color="#60A5FA" />
                  {!placement.active && <Badge label="inactive" color="#ef4444" />}
                </div>
                <div style={{ color: "#aaa", fontSize: 13 }}>
                  {slot.name} · <span style={{ color: "#fff" }}>"{creative.headline.slice(0, 50)}"</span>
                </div>
                <div style={{ color: "#555", fontSize: 12, marginTop: 4 }}>
                  Weight: <span style={{ color: "#aaa" }}>{placement.weight}</span>
                  {placement.tierExclusions?.length > 0 && (
                    <span> · Excludes: <span style={{ color: "#FF4D7E" }}>{placement.tierExclusions.join(", ")}</span></span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Btn small onClick={() => toggleActive(placement.id, placement.active)} variant="ghost">
                  {placement.active ? "Pause" : "Activate"}
                </Btn>
                <Btn small onClick={() => remove(placement.id)} variant="danger">Remove</Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Reports ─────────────────────────────────────────────────────────
function ReportsTab({ token }: { token: string }) {
  const [summary, setSummary] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [sRes, dRes] = await Promise.all([
        fetch(`${API}/ads/reports/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/ads/reports/daily`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [sd, dd] = await Promise.all([sRes.json(), dRes.json()]);
      setSummary(sd.summary || []);
      setDaily(dd.trend || []);
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) return <p style={{ color: "#666", padding: 40, textAlign: "center" }}>Loading…</p>;

  return (
    <div>
      <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>Reports</h2>

      {summary.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 1, margin: "0 0 12px" }}>SLOT PERFORMANCE</p>
          <div style={{ background: "#111", borderRadius: 12, overflow: "hidden", border: "1px solid #222" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #222" }}>
                  {["SLOT KEY", "IMPRESSIONS", "CLICKS", "CTR"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.map((row: any) => (
                  <tr key={row.slotKey} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "12px 16px", color: "#FFE600", fontFamily: "monospace", fontWeight: 700 }}>{row.slotKey}</td>
                    <td style={{ padding: "12px 16px", color: "#fff" }}>{row.impressions.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", color: "#fff" }}>{row.clicks.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", color: row.ctr !== "0%" ? "#22c55e" : "#666" }}>{row.ctr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {daily.length > 0 && (
        <div>
          <p style={{ color: "#FFE600", fontSize: 12, fontWeight: 700, letterSpacing: 1, margin: "0 0 12px" }}>30-DAY DAILY TREND</p>
          <div style={{ background: "#111", borderRadius: 12, overflow: "hidden", border: "1px solid #222" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #222" }}>
                  {["DATE", "IMPRESSIONS", "CLICKS", "CTR", "HOUSE AD VIEWS", "ACTIVE SLOTS"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daily.map((row: any) => (
                  <tr key={row.day} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "12px 16px", color: "#aaa" }}>{row.day}</td>
                    <td style={{ padding: "12px 16px", color: "#fff" }}>{row.impressions.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", color: "#fff" }}>{row.clicks.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", color: row.ctr !== "0%" ? "#22c55e" : "#666" }}>{row.ctr}</td>
                    <td style={{ padding: "12px 16px", color: "#aaa" }}>{row.houseAdImpressions?.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", color: "#aaa" }}>{row.activeSlots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {summary.length === 0 && daily.length === 0 && (
        <div style={{ textAlign: "center", padding: 80, color: "#444" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <p>No impression or click data yet.</p>
          <p style={{ fontSize: 13, color: "#333" }}>Data will appear here once ads start serving.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────
function Dashboard() {
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<"campaigns" | "creatives" | "placements" | "reports">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  useEffect(() => {
    // Generate a token using the JWT secret from the environment
    // In production this would come from proper auth; here we use the API directly
    fetch(`${API}/ads/campaigns`, { headers: { Authorization: "Bearer none" } }).then(() => {});
    // Use the known admin token route (API will refuse unauthenticated)
    setToken("__use_backend_auth__");
    // Actually fetch campaigns after login — token is set by parent
  }, []);

  // Load campaigns for use across tabs
  const loadCampaigns = useCallback(async (tok: string) => {
    if (!tok) return;
    const r = await fetch(`${API}/ads/campaigns`, { headers: { Authorization: `Bearer ${tok}` } });
    const d = await r.json();
    setCampaigns(d.campaigns || []);
  }, []);

  useEffect(() => { if (token && token !== "__use_backend_auth__") loadCampaigns(token); }, [token, loadCampaigns]);

  const TABS = [
    { key: "campaigns", label: "Campaigns" },
    { key: "creatives", label: "Creatives" },
    { key: "placements", label: "Placements" },
    { key: "reports", label: "Reports" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif", paddingTop: 60 }}>
      {/* Header */}
      <div style={{ background: "#050505", borderBottom: "1px solid #1a1a1a", padding: "0 32px", position: "sticky", top: 60, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ color: "#FFE600", fontSize: 13, fontWeight: 800, letterSpacing: 0.5, paddingRight: 32, borderRight: "1px solid #222" }}>
            ✦ AD MANAGER
          </div>
          <div style={{ display: "flex", gap: 4, padding: "0 16px" }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                style={{
                  padding: "16px 16px",
                  border: "none",
                  background: "transparent",
                  color: tab === t.key ? "#FFE600" : "#666",
                  fontSize: 13,
                  fontWeight: tab === t.key ? 700 : 500,
                  cursor: "pointer",
                  borderBottom: tab === t.key ? "2px solid #FFE600" : "2px solid transparent",
                  transition: "color 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ color: "#444", fontSize: 12 }}>Signed in as admin</span>
            <button
              onClick={() => { localStorage.removeItem(ACCESS_KEY); window.location.reload(); }}
              style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #333", background: "transparent", color: "#666", fontSize: 12, cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>
        {tab === "campaigns" && (
          <CampaignsTab
            token={token}
            onSelectCampaign={id => { setSelectedCampaignId(id); setTab("creatives"); loadCampaigns(token); }}
          />
        )}
        {tab === "creatives" && <CreativesTab token={token} campaigns={campaigns} />}
        {tab === "placements" && <PlacementsTab token={token} campaigns={campaigns} />}
        {tab === "reports" && <ReportsTab token={token} />}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────
export default function AdManager() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(ACCESS_KEY) === "true");
  const [token, setToken] = useState<string | null>(null);

  const unlock = useCallback(async () => {
    // Exchange the local access code for an API token via a new endpoint
    try {
      const r = await fetch(`${API}/ads/admin-token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: "TIDADES2026" }) });
      const d = await r.json();
      if (d.token) {
        setToken(d.token);
        setUnlocked(true);
      }
    } catch {
      // fallback
      setUnlocked(true);
    }
  }, []);

  if (!unlocked || !token) return <GatedDashboard onUnlock={(tok) => { setToken(tok); setUnlocked(true); }} />;
  return <AuthedDashboard token={token} />;
}

function GatedDashboard({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/ads/admin-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const d = await r.json();
      if (d.token) {
        localStorage.setItem(ACCESS_KEY, "true");
        onUnlock(d.token);
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#111", border: "1px solid #FFE60040", borderRadius: 20, padding: 48, maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 0 60px #FFE60010" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
        <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 12px" }}>ADMIN ACCESS</p>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 10px" }}>Ad Manager</h2>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px" }}>
          Manage house ad campaigns, creatives, and slot placements across The Innovators Den platform.
        </p>
        <input
          type="password"
          placeholder="Enter admin code"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${error ? "#FF4D7E" : "#333"}`, background: "#1a1a1a", color: "#fff", fontSize: 16, fontFamily: "monospace", outline: "none", boxSizing: "border-box", marginBottom: 16 }}
        />
        {error && <p style={{ color: "#FF4D7E", fontSize: 13, margin: "-8px 0 12px" }}>Invalid access code</p>}
        <button
          onClick={submit}
          disabled={loading}
          style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: "#FFE600", color: "#000", fontSize: 15, fontWeight: 800, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Verifying…" : "Enter Ad Manager →"}
        </button>
      </div>
    </div>
  );
}

function AuthedDashboard({ token }: { token: string }) {
  const [tab, setTab] = useState<"campaigns" | "creatives" | "placements" | "reports">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const loadCampaigns = useCallback(async () => {
    const r = await fetch(`${API}/ads/campaigns`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    setCampaigns(d.campaigns || []);
  }, [token]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const TABS = [
    { key: "campaigns", label: "Campaigns" },
    { key: "creatives", label: "Creatives" },
    { key: "placements", label: "Placements" },
    { key: "reports", label: "Reports" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "system-ui, sans-serif", paddingTop: 60 }}>
      <div style={{ background: "#050505", borderBottom: "1px solid #1a1a1a", padding: "0 32px", position: "sticky", top: 60, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ color: "#FFE600", fontSize: 13, fontWeight: 800, letterSpacing: 0.5, paddingRight: 32, borderRight: "1px solid #222", whiteSpace: "nowrap" }}>
            ✦ AD MANAGER
          </div>
          <div style={{ display: "flex", gap: 4, padding: "0 8px" }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key as any); if (t.key !== "campaigns") loadCampaigns(); }}
                style={{ padding: "16px 14px", border: "none", background: "transparent", color: tab === t.key ? "#FFE600" : "#666", fontSize: 13, fontWeight: tab === t.key ? 700 : 500, cursor: "pointer", borderBottom: tab === t.key ? "2px solid #FFE600" : "2px solid transparent", transition: "color 0.15s", whiteSpace: "nowrap" }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ color: "#444", fontSize: 12 }}>Admin</span>
            <button
              onClick={() => { localStorage.removeItem(ACCESS_KEY); window.location.reload(); }}
              style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #333", background: "transparent", color: "#666", fontSize: 12, cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>
        {tab === "campaigns" && <CampaignsTab token={token} onSelectCampaign={id => { loadCampaigns(); setTab("creatives"); }} />}
        {tab === "creatives" && <CreativesTab token={token} campaigns={campaigns} />}
        {tab === "placements" && <PlacementsTab token={token} campaigns={campaigns} />}
        {tab === "reports" && <ReportsTab token={token} />}
      </div>
    </div>
  );
}
