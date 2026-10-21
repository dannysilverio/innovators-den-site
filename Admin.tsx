import { useState, useEffect, useCallback } from "react";
import StoryVideoFields from "@/components/StoryVideoFields";
import CategorySubBrandField from "@/components/CategorySubBrandField";
import { validateStoryVideoFields } from "@workspace/api-zod/story-video";
import { validateDenOriginalText } from "@workspace/api-zod/den-editorial";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const TOKEN_KEY = "@tid_admin_token";
const API_BASE = "/api";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getAdminHeaders(): Record<string, string> {
  const jwt = sessionStorage.getItem(TOKEN_KEY);
  return jwt ? { "Authorization": `Bearer ${jwt}` } : {};
}

const BRAND = {
  yellow: "#FFE600",
  pink: "#FF4D7E",
  green: "#10B981",
  orange: "#F97316",
  purple: "#818CF8",
  surface: "#111",
  border: "#222",
  text: "#fff",
  muted: "#888",
  faint: "#444",
};

// ───────────────────────────── Gate ─────────────────────────────
function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok) {
        const { token } = await res.json();
        sessionStorage.setItem(TOKEN_KEY, token);
        onUnlock();
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid code.");
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError("Connection error — please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.yellow}30`, borderRadius: 20, padding: 40, maxWidth: 420, width: "100%", textAlign: "center", boxShadow: `0 0 60px ${BRAND.yellow}10` }}>
        <p style={{ color: BRAND.yellow, fontSize: 10, fontWeight: 700, letterSpacing: 3, marginBottom: 12 }}>INNOVATORS DEN</p>
        <h2 style={{ color: BRAND.text, fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>Command Center</h2>
        <p style={{ color: BRAND.muted, fontSize: 14, margin: "0 0 28px" }}>Internal platform operations. Authorized access only.</p>
        <input
          type="password"
          placeholder="Admin access code"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ width: "100%", padding: "14px 16px", background: "#1a1a1a", border: `1px solid ${error ? BRAND.pink : "#333"}`, borderRadius: 10, color: BRAND.text, fontSize: 15, outline: "none", marginBottom: 12, boxSizing: "border-box", letterSpacing: 2, transition: "border-color 0.2s" }}
          autoFocus
        />
        {error && <p style={{ color: BRAND.pink, fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={submit} disabled={loading} style={{ width: "100%", background: BRAND.yellow, color: "#000", border: "none", borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Verifying…" : "Enter →"}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────── Helpers ─────────────────────────────
function StatCard({ label, value, sub, color, delta }: { label: string; value: string | number; sub?: string; color?: string; delta?: number }) {
  const c = color ?? BRAND.yellow;
  return (
    <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: "20px 22px", minWidth: 0 }}>
      <p style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, margin: "0 0 8px", textTransform: "uppercase" }}>{label}</p>
      <p style={{ color: c, fontSize: 28, fontWeight: 800, margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: BRAND.faint, fontSize: 12, margin: 0 }}>{sub}</p>}
      {delta !== undefined && (
        <p style={{ color: delta >= 0 ? BRAND.green : BRAND.pink, fontSize: 12, margin: "6px 0 0", fontWeight: 700 }}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs prev period
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ color: BRAND.yellow, fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>COMMAND CENTER</p>
      <h2 style={{ color: BRAND.text, fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{title}</h2>
      {sub && <p style={{ color: BRAND.muted, fontSize: 13, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: "20px 22px" }}>
      <p style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 16px", textTransform: "uppercase" }}>{title}</p>
      {children}
    </div>
  );
}

function pct(a: number, b: number) {
  if (!b) return "—";
  return `${((a / b) * 100).toFixed(1)}%`;
}

function fmt(n: any) {
  const v = Number(n ?? 0);
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

const TIER_COLORS: Record<string, string> = {
  free: BRAND.faint,
  member: BRAND.green,
  pro: BRAND.yellow,
  inner_circle: BRAND.pink,
};

// ───────────────────────────── Dashboard ─────────────────────────────
type Range = "today" | "7d" | "30d" | "90d" | "all";


const TIER_BADGE: Record<string, string> = {
  founding: "#FFE600", pro: "#818CF8", inner_circle: "#FF4D7E", member: "#10B981", free: "#444",
};

const STATUS_DOT: Record<string, string> = {
  pending: "#F97316", assigned: "#818CF8", in_progress: "#60A5FA",
  resolved: "#10B981", approved: "#10B981", rejected: "#ff5b5b",
  suspended: "#F97316", active: "#10B981", paused: "#888", open: "#10B981",
  passed: "#FFE600", declined: "#ff5b5b", implemented: "#7B61FF",
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 20, background: `${color}20`, color, textTransform: "uppercase" }}>
      {label}
    </span>
  );
}

function ActionBtn({ label, color = BRAND.yellow, onClick }: { label: string; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", background: `${color}20`, color, border: `1px solid ${color}40`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
      {label}
    </button>
  );
}

function TableRow({ cells, actions }: { cells: (string | React.ReactNode)[]; actions?: React.ReactNode }) {
  return (
    <tr style={{ borderBottom: `1px solid ${BRAND.border}` }}>
      {cells.map((c, i) => (
        <td key={i} style={{ padding: "10px 12px", color: BRAND.text, fontSize: 12, verticalAlign: "middle" }}>{c}</td>
      ))}
      {actions && <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>{actions}</td>}
    </tr>
  );
}

function AdminTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BRAND.border}` }}>
            {headers.map(h => <th key={h} style={{ padding: "8px 12px", color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

type AdminEvent = {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  status: string;
  attendeeCount: number;
};

type EventAttendee = {
  id: string;
  name: string | null;
  email: string | null;
  rsvpAt: string;
};

function exportAttendeesCsv(title: string, attendees: EventAttendee[]) {
  // Quote CSV fields and prevent spreadsheet formulas from executing in names/emails.
  const cell = (value: string) => {
    const safe = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Name", "Email", "RSVP timestamp"],
    ...attendees.map(a => [a.name ?? "Guest", a.email ?? "", a.rsvpAt]),
  ];
  const csv = "\uFEFF" + rows.map(row => row.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "event"}-attendees.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EventAttendeesTab() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [attendeeError, setAttendeeError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/events`, { headers: getAdminHeaders() });
      if (!res.ok) throw new Error(`Could not load events (HTTP ${res.status})`);
      const result = await res.json();
      setEvents(result.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadEvents(); }, [loadEvents]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setAttendees([]);
    setAttendeeError(null);
    setAttendeeLoading(true);
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/events/${encodeURIComponent(selectedId)}/attendees`, { headers: getAdminHeaders() });
        if (!res.ok) throw new Error(`Could not load attendees (HTTP ${res.status})`);
        const result = await res.json();
        if (!cancelled) setAttendees(result.attendees);
      } catch (err) {
        if (!cancelled) setAttendeeError(err instanceof Error ? err.message : "Could not load attendees");
      } finally {
        if (!cancelled) setAttendeeLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [selectedId, retry]);

  return (
    <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Event attendees</h3>
        <button onClick={loadEvents} disabled={loading} style={{ background: "none", border: `1px solid ${BRAND.border}`, color: BRAND.muted, borderRadius: 8, padding: "7px 12px", cursor: "pointer" }}>↻ Refresh</button>
      </div>
      {loading ? <p style={{ color: BRAND.muted }}>Loading events…</p> : error ? (
        <p role="alert" style={{ color: BRAND.pink }}>{error}</p>
      ) : events.length === 0 ? <p style={{ color: BRAND.muted }}>No events yet.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {events.map(event => (
            <div key={event.id} style={{ border: `1px solid ${BRAND.border}`, borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setSelectedId(current => current === event.id ? null : event.id)}
                aria-expanded={selectedId === event.id}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", padding: "14px 16px", background: "#191919", color: BRAND.text, border: 0, textAlign: "left", cursor: "pointer" }}
              >
                <span>
                  <strong>{event.title}</strong>
                  <span style={{ display: "block", color: BRAND.muted, fontSize: 12, marginTop: 4 }}>
                    {new Date(event.eventDate).toLocaleString()} · {event.location} · {event.status}
                  </span>
                </span>
                <span style={{ whiteSpace: "nowrap", color: BRAND.yellow, fontSize: 12, fontWeight: 700 }}>
                  {event.attendeeCount} {event.attendeeCount === 1 ? "attendee" : "attendees"} {selectedId === event.id ? "▲" : "▼"}
                </span>
              </button>
              {selectedId === event.id && (
                <div style={{ padding: 16 }}>
                  {attendeeLoading ? <p style={{ color: BRAND.muted }}>Loading attendees…</p> : attendeeError ? (
                    <p role="alert" style={{ color: BRAND.pink }}>{attendeeError} <button onClick={() => setRetry(n => n + 1)}>Retry</button></p>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                        <button onClick={() => exportAttendeesCsv(event.title, attendees)} disabled={attendees.length === 0} style={{ background: BRAND.yellow, color: "#000", border: 0, borderRadius: 8, padding: "7px 12px", fontWeight: 700, cursor: attendees.length ? "pointer" : "not-allowed", opacity: attendees.length ? 1 : 0.5 }}>Export CSV</button>
                      </div>
                      {attendees.length === 0 ? <p style={{ color: BRAND.muted }}>No RSVPs for this event yet.</p> : (
                        <AdminTable headers={["Name", "Email", "RSVP time"]}>
                          {attendees.map(a => <TableRow key={a.id} cells={[a.name || "Guest", a.email || "—", new Date(a.rsvpAt).toLocaleString()]} />)}
                        </AdminTable>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────── Publish Story Tab ───────────────────

const STORY_TOPICS = [
  "Innovation","Art","Culture","Music","Business Growth","Sports",
  "Food","Food & Wine","Health","Travel","Astrology","Law","Opportunities","Spotlight","Finance",
];

function RoomSponsorRow({ room, onSave }: {
  room: any;
  onSave: (data: { sponsorName: string | null; sponsorLogoUrl: string | null; sponsorCtaText: string | null; sponsorCtaUrl: string | null }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    sponsorName: room.sponsor_name ?? "",
    sponsorLogoUrl: room.sponsor_logo_url ?? "",
    sponsorCtaText: room.sponsor_cta_text ?? "",
    sponsorCtaUrl: room.sponsor_cta_url ?? "",
  });

  const hassponsor = !!(room.sponsor_name);

  return (
    <div style={{ background: "#1a1a1a", border: `1px solid ${hassponsor ? BRAND.yellow + "44" : BRAND.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ color: BRAND.text, fontWeight: 700, fontSize: 14 }}>{room.title}</div>
          <div style={{ color: BRAND.muted, fontSize: 11, marginTop: 2 }}>
            {room.circle_type} · {room.member_count} members
          </div>
        </div>
        {hassponsor ? (
          <span style={{ background: BRAND.yellow, color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>SPONSORED</span>
        ) : (
          <span style={{ color: BRAND.muted, fontSize: 11 }}>No sponsor</span>
        )}
        <span style={{ color: BRAND.muted, fontSize: 16 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${BRAND.border}`, padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {(["sponsorName", "sponsorLogoUrl", "sponsorCtaText", "sponsorCtaUrl"] as const).map(key => (
            <div key={key}>
              <label style={{ color: BRAND.muted, fontSize: 11, display: "block", marginBottom: 4 }}>
                {key === "sponsorName" ? "Sponsor Name" : key === "sponsorLogoUrl" ? "Logo URL" : key === "sponsorCtaText" ? "CTA Button Text" : "CTA URL"}
              </label>
              <input
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={key === "sponsorName" ? "e.g. JP Morgan Chase" : key === "sponsorLogoUrl" ? "https://..." : key === "sponsorCtaText" ? "e.g. Learn More" : "https://..."}
                style={{ width: "100%", background: "#111", border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "8px 12px", color: BRAND.text, fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              onClick={() => onSave({ sponsorName: form.sponsorName || null, sponsorLogoUrl: form.sponsorLogoUrl || null, sponsorCtaText: form.sponsorCtaText || null, sponsorCtaUrl: form.sponsorCtaUrl || null })}
              style={{ background: BRAND.yellow, color: "#000", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              Save Sponsor
            </button>
            {hassponsor && (
              <button
                onClick={() => { setForm({ sponsorName: "", sponsorLogoUrl: "", sponsorCtaText: "", sponsorCtaUrl: "" }); onSave({ sponsorName: null, sponsorLogoUrl: null, sponsorCtaText: null, sponsorCtaUrl: null }); }}
                style={{ background: "transparent", color: BRAND.pink, border: `1px solid ${BRAND.pink}44`, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}
              >
                Clear Sponsor
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PublishStoryTab() {
  const EMPTY = { title: "", summary: "", content: "", topic: "Innovation", imageUrl: "", sourceUrl: "https://theinnovatorsden.net", videoUrl: "", videoPosterUrl: "", videoCaption: "" };
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editMsg, setEditMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const loadStories = async () => {
    setLoadingList(true);
    try {
      const r = await fetch(`${API_BASE}/articles?sourceName=The%20Innovators%20Den&includeContent=1&limit=100`, { headers: getAdminHeaders() });
      if (r.ok) {
        const d = await r.json();
        const tid = (Array.isArray(d) ? d : d.articles ?? [])
          .filter((a: any) => a.sourceName === "The Innovators Den")
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setStories(tid);
      }
    } catch { setStories([]); }
    setLoadingList(false);
  };

  useEffect(() => { loadStories(); }, []);

  const field = (key: keyof typeof EMPTY, label: string, type: "input" | "textarea" | "select", rows?: number) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{label}</label>
      {type === "select" ? (
        <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={SELECT_STYLE}>
          {STORY_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={rows ?? 4} style={{ ...TEXTAREA_STYLE, fontFamily: "monospace", fontSize: 13 }} />
      ) : (
        <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={INPUT_STYLE} />
      )}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      setMsg("✗ Title, summary, and content are required."); return;
    }
    try {
      validateDenOriginalText("The Innovators Den", form);
      validateStoryVideoFields(form);
    } catch (error) { setMsg(`✗ ${(error as Error).message}`); return; }
    setSubmitting(true); setMsg(null);
    try {
      const r = await fetch(`${API_BASE}/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ ...form, sourceName: "The Innovators Den", content: form.content }),
      });
      if (r.ok) {
        setMsg("✓ Story published and featured in Our Picks.");
        setForm(EMPTY);
        loadStories();
      } else {
        const d = await r.json();
        setMsg(`✗ ${d.error ?? "Failed to publish."}`);
      }
    } catch { setMsg("✗ Network error."); }
    setSubmitting(false);
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm("Unpublish this story?")) return;
    await fetch(`${API_BASE}/articles/${id}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify({ status: "rejected" }),
    });
    loadStories();
  };

  const handleRepublish = async (id: string) => {
    await fetch(`${API_BASE}/articles/${id}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify({ status: "approved" }),
    });
    loadStories();
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditForm({ title: s.title, summary: s.summary, content: s.content ?? "", topic: s.topic, imageUrl: s.imageUrl ?? "", sourceUrl: s.sourceUrl ?? "https://theinnovatorsden.net", videoUrl: s.videoUrl ?? "", videoPosterUrl: s.videoPosterUrl ?? "", videoCaption: s.videoCaption ?? "" });
    setEditMsg(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    try {
      validateDenOriginalText("The Innovators Den", editForm);
      validateStoryVideoFields(editForm);
    } catch (error) { setEditMsg(`✗ ${(error as Error).message}`); return; }
    const r = await fetch(`${API_BASE}/articles/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAdminHeaders() },
      body: JSON.stringify({ ...editForm, sourceName: "The Innovators Den" }),
    });
    if (r.ok) { setEditMsg("✓ Saved."); loadStories(); setTimeout(() => { setEditingId(null); setEditMsg(null); }, 1200); }
    else { const d = await r.json(); setEditMsg(`✗ ${d.error ?? "Save failed."}`); }
  };

  const efld = (key: string, label: string, type: "input" | "textarea" | "select", rows?: number) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{label}</label>
      {type === "select" ? (
        <select value={editForm[key]} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))} style={SELECT_STYLE}>
          {STORY_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={editForm[key]} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))} rows={rows ?? 5} style={{ ...TEXTAREA_STYLE, fontFamily: "monospace", fontSize: 13 }} />
      ) : (
        <input value={editForm[key]} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))} style={INPUT_STYLE} />
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* New story form */}
      <div style={{ background: BRAND.surface, border: `1px solid ${BRAND.yellow}30`, borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ color: BRAND.yellow, fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px", textTransform: "uppercase" }}>✦ The Innovators Den</p>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Publish a New Story</h2>
            <p style={{ color: BRAND.muted, fontSize: 13, margin: "4px 0 0" }}>Goes live instantly · Featured in Our Picks</p>
          </div>
          <button
            onClick={() => setPreview(p => !p)}
            style={{ background: preview ? BRAND.yellow : "#1a1a1a", color: preview ? "#000" : BRAND.muted, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            {preview ? "← Edit" : "Preview →"}
          </button>
        </div>

        <MsgBar msg={msg} />

        {preview ? (
          <div style={{ background: "#000", borderRadius: 12, padding: 28, border: `1px solid ${BRAND.border}` }}>
            {form.imageUrl && <img src={form.imageUrl} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 10, marginBottom: 20 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
            <div style={{ color: BRAND.yellow, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>{form.topic} · The Innovators Den</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 }}>{form.title || <span style={{ color: BRAND.faint }}>No title yet</span>}</h1>
            <p style={{ color: BRAND.muted, fontSize: 15, margin: "0 0 24px", lineHeight: 1.6 }}>{form.summary || <span style={{ color: BRAND.faint }}>No summary yet</span>}</p>
            <div style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{form.content || <span style={{ color: BRAND.faint }}>No content yet</span>}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>{field("title", "Title", "input")}</div>
              {field("topic", "Topic", "select")}
              <CategorySubBrandField topic={form.topic} headers={getAdminHeaders()} />
              {field("imageUrl", "Cover Image URL", "input")}
              <div style={{ gridColumn: "1 / -1" }}>{field("summary", "Summary (shown in feed previews)", "textarea", 3)}</div>
              <div style={{ gridColumn: "1 / -1" }}>{field("content", "Full Story Content", "textarea", 16)}</div>
              <div style={{ gridColumn: "1 / -1" }}><StoryVideoFields value={form} onChange={patch => setForm(f => ({ ...f, ...patch }) as typeof EMPTY)} /></div>
              <div style={{ gridColumn: "1 / -1" }}>{field("sourceUrl", "Story URL (optional deep link)", "input")}</div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" onClick={() => setForm(EMPTY)} style={{ background: "none", border: `1px solid ${BRAND.border}`, color: BRAND.muted, borderRadius: 8, padding: "9px 18px", fontSize: 13, cursor: "pointer" }}>Clear</button>
              <button type="submit" disabled={submitting} style={{ background: BRAND.yellow, color: "#000", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Publishing…" : "✦ Publish Now"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Existing TID stories */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <SectionHeader title="Den Stories" sub="All Innovators Den published content" />
          <button onClick={loadStories} style={{ background: "none", border: `1px solid ${BRAND.border}`, color: BRAND.muted, borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>↻ Refresh</button>
        </div>
        {loadingList ? (
          <div style={{ color: BRAND.muted, padding: 24, textAlign: "center" }}>Loading stories…</div>
        ) : stories.length === 0 ? (
          <div style={{ color: BRAND.muted, padding: 24, textAlign: "center", background: BRAND.surface, borderRadius: 12, border: `1px solid ${BRAND.border}` }}>No Den stories yet. Publish your first one above.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stories.map(s => (
              <div key={s.id}>
                <div style={{ background: BRAND.surface, border: `1px solid ${editingId === s.id ? BRAND.yellow + "60" : BRAND.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {s.imageUrl && (
                    <img src={s.imageUrl} alt="" style={{ width: 72, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: BRAND.yellow, letterSpacing: 1, textTransform: "uppercase" }}>{s.topic}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5,
                        background: s.status === "approved" ? "#10B98120" : s.status === "rejected" ? "#ff5b5b20" : "#f9731620",
                        color: s.status === "approved" ? "#10B981" : s.status === "rejected" ? "#ff5b5b" : "#f97316",
                      }}>{s.status}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, lineHeight: 1.3 }}>{s.title}</div>
                    {s.summary && <div style={{ color: BRAND.muted, fontSize: 12, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{s.summary}</div>}
                    <div style={{ color: BRAND.faint, fontSize: 11, marginTop: 6 }}>{new Date(s.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => editingId === s.id ? setEditingId(null) : startEdit(s)} style={{ background: editingId === s.id ? BRAND.yellow : "#1a1a1a", color: editingId === s.id ? "#000" : BRAND.muted, border: `1px solid ${BRAND.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      {editingId === s.id ? "Cancel" : "Edit"}
                    </button>
                    {s.status === "approved" ? (
                      <button onClick={() => handleUnpublish(s.id)} style={{ background: "#1a1a1a", color: "#ff5b5b", border: `1px solid #ff5b5b30`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Unpublish</button>
                    ) : (
                      <button onClick={() => handleRepublish(s.id)} style={{ background: "#1a1a1a", color: BRAND.green, border: `1px solid ${BRAND.green}30`, borderRadius: 7, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Republish</button>
                    )}
                  </div>
                </div>
                {/* Inline edit panel */}
                {editingId === s.id && editForm && (
                  <div style={{ background: "#0a0a0a", border: `1px solid ${BRAND.yellow}30`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "20px 18px" }}>
                    <MsgBar msg={editMsg} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div style={{ gridColumn: "1 / -1" }}>{efld("title", "Title", "input")}</div>
                      {efld("topic", "Topic", "select")}
                      <CategorySubBrandField topic={editForm.topic} headers={getAdminHeaders()} />
                      {efld("imageUrl", "Cover Image URL", "input")}
                      <div style={{ gridColumn: "1 / -1" }}>{efld("summary", "Summary", "textarea", 3)}</div>
                      <div style={{ gridColumn: "1 / -1" }}>{efld("content", "Full Story Content", "textarea", 12)}</div>
                      <div style={{ gridColumn: "1 / -1" }}><StoryVideoFields value={editForm} onChange={patch => setEditForm((f: any) => ({ ...f, ...patch }))} /></div>
                      <div style={{ gridColumn: "1 / -1" }}>{efld("sourceUrl", "Story URL", "input")}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                      <button onClick={() => setEditingId(null)} style={{ background: "none", border: `1px solid ${BRAND.border}`, color: BRAND.muted, borderRadius: 8, padding: "7px 16px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                      <button onClick={saveEdit} style={{ background: BRAND.yellow, color: "#000", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Save Changes</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────── Management Tab Components ───────────────────

type TabProps = { data: any; msg: string | null; onAction: (endpoint: string, method: string, body: any, tabId: string) => void };

function MsgBar({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <div style={{ padding: "10px 16px", borderRadius: 10, background: msg.startsWith("✓") ? "#10B98120" : "#ff5b5b20", color: msg.startsWith("✓") ? "#10B981" : "#ff5b5b", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{msg}</div>;
}

const INPUT_STYLE: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", marginTop: 4, padding: "8px 10px", background: "#111", border: `1px solid ${BRAND.border}`, color: BRAND.text, borderRadius: 8, fontSize: 12 };
const SELECT_STYLE: React.CSSProperties = { display: "block", width: "100%", marginTop: 4, padding: "8px 10px", background: "#111", border: `1px solid ${BRAND.border}`, color: BRAND.text, borderRadius: 8, fontSize: 12 };
const TEXTAREA_STYLE: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", marginTop: 4, padding: "8px 10px", background: "#111", border: `1px solid ${BRAND.border}`, color: BRAND.text, borderRadius: 8, fontSize: 12, resize: "vertical" };

function ConciergeTab({ data, msg, onAction }: TabProps) {
  const s = data.stats ?? {};
  const reqs: any[] = data.requests ?? [];
  const [selId, setSelId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const sel = reqs.find(r => r.id === selId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionHeader title="Concierge — White-Glove Requests" sub="Pro & Founding member service requests" />
      <MsgBar msg={msg} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard label="Total" value={s.total ?? 0} color={BRAND.yellow} />
        <StatCard label="Pending" value={s.pending ?? 0} color={Number(s.pending) > 0 ? BRAND.orange : BRAND.faint} />
        <StatCard label="In Progress" value={s.in_progress ?? 0} color={BRAND.purple} />
        <StatCard label="Resolved" value={s.resolved ?? 0} color={BRAND.green} />
        <StatCard label="Urgent Open" value={s.urgent ?? 0} color={Number(s.urgent) > 0 ? BRAND.pink : BRAND.faint} />
      </div>
      <ChartCard title="Request Queue">
        <AdminTable headers={["MEMBER", "TIER", "TYPE", "SUBJECT", "STATUS", "URGENT", "CREATED", "ACTIONS"]}>
          {reqs.map(r => (
            <TableRow key={r.id}
              cells={[
                <span>{r.user_name ?? "Unknown"}<br/><span style={{ color: BRAND.muted, fontSize: 10 }}>{r.user_email}</span></span>,
                <Badge label={r.member_tier ?? "?"} color={TIER_BADGE[r.member_tier] ?? BRAND.faint} />,
                r.request_type ?? "—",
                <span style={{ maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subject}</span>,
                <Badge label={r.status} color={STATUS_DOT[r.status] ?? BRAND.muted} />,
                r.is_urgent ? <span style={{ color: BRAND.pink, fontWeight: 700 }}>🔴 YES</span> : "—",
                r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
              ]}
              actions={<ActionBtn label={selId === r.id ? "▲ Close" : "▼ Manage"} onClick={() => { setSelId(selId === r.id ? null : r.id); setForm({ status: r.status, teamNotes: r.team_notes ?? "", memberUpdate: r.member_update ?? "", priority: r.priority ?? "normal" }); }} />}
            />
          ))}
        </AdminTable>
        {sel && (
          <div style={{ marginTop: 16, padding: 20, background: "#1a1a1a", borderRadius: 12, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ color: BRAND.yellow, fontWeight: 700, margin: 0 }}>{sel.subject}</p>
            <p style={{ color: BRAND.muted, fontSize: 12, margin: 0 }}>{sel.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>STATUS</label>
                <select value={form.status ?? sel.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))} style={SELECT_STYLE}>
                  {["pending","assigned","in_progress","resolved"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>PRIORITY</label>
                <select value={form.priority ?? "normal"} onChange={e => setForm((p: any) => ({ ...p, priority: e.target.value }))} style={SELECT_STYLE}>
                  {["low","normal","high","urgent"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TEAM NOTES (internal)</label>
              <textarea value={form.teamNotes ?? ""} onChange={e => setForm((p: any) => ({ ...p, teamNotes: e.target.value }))} rows={3} style={TEXTAREA_STYLE} />
            </div>
            <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>UPDATE TO MEMBER (visible to them)</label>
              <textarea value={form.memberUpdate ?? ""} onChange={e => setForm((p: any) => ({ ...p, memberUpdate: e.target.value }))} rows={2} style={TEXTAREA_STYLE} />
            </div>
            <ActionBtn label="Save Changes" onClick={() => onAction(`concierge/${sel.id}`, "PATCH", form, "concierge")} />
          </div>
        )}
      </ChartCard>
    </div>
  );
}

function MarketplaceTab({ data, msg, onAction }: TabProps) {
  const s = data.stats ?? {};
  const listings: any[] = data.listings ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionHeader title="Marketplace — Service Listings" sub="Community member service offerings" />
      <MsgBar msg={msg} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard label="Total Listings" value={s.total ?? 0} color={BRAND.yellow} />
        <StatCard label="Active" value={s.active ?? 0} color={BRAND.green} />
        <StatCard label="Paused" value={s.paused ?? 0} color={BRAND.faint} />
        <StatCard label="Featured" value={s.featured ?? 0} color={BRAND.purple} />
        <StatCard label="Categories" value={s.categories ?? 0} color={BRAND.orange} />
      </div>
      <ChartCard title="All Listings">
        <AdminTable headers={["TITLE", "CATEGORY", "OWNER", "RATE", "STATUS", "FEATURED", "CREATED", "ACTIONS"]}>
          {listings.map(l => (
            <TableRow key={l.id}
              cells={[
                <span style={{ maxWidth: 180, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{l.title}</span>,
                l.category ?? "—",
                <span>{l.owner_name ?? "Unknown"}<br/><span style={{ color: BRAND.muted, fontSize: 10 }}>{l.owner_email}</span></span>,
                l.rate ? `$${l.rate}/${l.rate_unit?.replace("per_", "") ?? ""}` : "Custom",
                <Badge label={l.status} color={STATUS_DOT[l.status] ?? BRAND.muted} />,
                l.is_featured ? <span style={{ color: BRAND.yellow, fontWeight: 700 }}>★ YES</span> : "—",
                l.created_at ? new Date(l.created_at).toLocaleDateString() : "—",
              ]}
              actions={
                <div style={{ display: "flex", gap: 6 }}>
                  <ActionBtn label={l.is_featured ? "Unfeature" : "Feature"} color={BRAND.yellow} onClick={() => onAction(`marketplace/${l.id}`, "PATCH", { isFeatured: !l.is_featured }, "marketplace")} />
                  <ActionBtn label={l.status === "active" ? "Pause" : "Activate"} color={l.status === "active" ? BRAND.orange : BRAND.green} onClick={() => onAction(`marketplace/${l.id}`, "PATCH", { status: l.status === "active" ? "paused" : "active" }, "marketplace")} />
                </div>
              }
            />
          ))}
        </AdminTable>
      </ChartCard>
    </div>
  );
}

function PartnersTab({ data, msg, onAction }: TabProps) {
  const s = data.stats ?? {};
  const accounts: any[] = data.accounts ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionHeader title="Partner Portal" sub="Employer, brand, and org applications" />
      <MsgBar msg={msg} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard label="Total" value={s.total ?? 0} color={BRAND.yellow} />
        <StatCard label="Pending" value={s.pending ?? 0} color={Number(s.pending) > 0 ? BRAND.orange : BRAND.faint} />
        <StatCard label="Approved" value={s.approved ?? 0} color={BRAND.green} />
        <StatCard label="Rejected" value={s.rejected ?? 0} color={BRAND.pink} />
        <StatCard label="Suspended" value={s.suspended ?? 0} color={BRAND.orange} />
      </div>
      <ChartCard title="Partner Applications">
        <AdminTable headers={["ORG NAME", "TYPE", "OWNER", "CONTACT", "STATUS", "APPLIED", "ACTIONS"]}>
          {accounts.map(a => (
            <TableRow key={a.id}
              cells={[
                <span style={{ fontWeight: 600 }}>{a.org_name}</span>,
                a.org_type ?? "—",
                <span>{a.owner_name ?? "Unknown"}<br/><span style={{ color: BRAND.muted, fontSize: 10 }}>{a.owner_email}</span></span>,
                a.contact_email ?? "—",
                <Badge label={a.status} color={STATUS_DOT[a.status] ?? BRAND.muted} />,
                a.created_at ? new Date(a.created_at).toLocaleDateString() : "—",
              ]}
              actions={
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {a.status !== "approved" && <ActionBtn label="Approve" color={BRAND.green} onClick={() => onAction(`partners/${a.id}`, "PATCH", { action: "approve" }, "partners")} />}
                  {a.status === "approved" && <ActionBtn label="Suspend" color={BRAND.orange} onClick={() => onAction(`partners/${a.id}`, "PATCH", { action: "suspend" }, "partners")} />}
                  {a.status === "pending" && <ActionBtn label="Reject" color={BRAND.pink} onClick={() => onAction(`partners/${a.id}`, "PATCH", { action: "reject" }, "partners")} />}
                  <ActionBtn label={a.can_post_immediately ? "Revoke Auto-Post" : "Grant Auto-Post"} color={BRAND.purple} onClick={() => onAction(`partners/${a.id}`, "PATCH", { canPostImmediately: !a.can_post_immediately }, "partners")} />
                </div>
              }
            />
          ))}
        </AdminTable>
      </ChartCard>
    </div>
  );
}

const BADGE_TYPE_LIST = ["founding_member","connector","host","contributor","builder","operator","investor","advisor","early_adopter","top_voice","change_maker","verified_founder","pro_member","founding_circle"];

function ReputationTab({ data, msg, onAction }: TabProps) {
  const s = data.stats ?? {};
  const leaderboard: any[] = data.leaderboard ?? [];
  const badgeStats: any[] = data.badgeStats ?? [];
  const [badgeForm, setBadgeForm] = useState({ userId: "", badgeType: "early_adopter", awardNote: "" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionHeader title="Reputation & Badges" sub="Leaderboard, badge awards, and spotlight management" />
      <MsgBar msg={msg} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard label="Scored Users" value={s.total_scores ?? 0} color={BRAND.yellow} />
        <StatCard label="Spotlighted" value={s.spotlighted ?? 0} color={BRAND.purple} />
        <StatCard label="Avg Score" value={s.avg_score ?? 0} color={BRAND.green} />
        <StatCard label="Badges Awarded" value={s.total_badges ?? 0} color={BRAND.orange} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title="Reputation Leaderboard (Top 50)">
          <AdminTable headers={["RANK", "MEMBER", "SCORE", "TIER", "SPOTLIGHT", "ACTIONS"]}>
            {leaderboard.map((r, i) => (
              <TableRow key={r.user_id}
                cells={[
                  <span style={{ color: i < 3 ? BRAND.yellow : BRAND.muted, fontWeight: 700 }}>#{i + 1}</span>,
                  <span>{r.display_name ?? "Unknown"}<br/><span style={{ color: BRAND.muted, fontSize: 10 }}>{r.email}</span></span>,
                  <span style={{ color: BRAND.yellow, fontWeight: 700 }}>{r.score}</span>,
                  r.tier ?? "—",
                  r.is_spotlighted ? <span style={{ color: BRAND.purple }}>★</span> : "—",
                ]}
                actions={<ActionBtn label={r.is_spotlighted ? "Unspotlight" : "Spotlight"} color={BRAND.purple} onClick={() => onAction(`spotlight/${r.user_id}`, "POST", { spotlight: !r.is_spotlighted }, "reputation")} />}
              />
            ))}
          </AdminTable>
        </ChartCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ChartCard title="Award a Badge">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>USER ID</label>
                <input value={badgeForm.userId} onChange={e => setBadgeForm(p => ({ ...p, userId: e.target.value }))} placeholder="Paste user UUID…" style={INPUT_STYLE} />
              </div>
              <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>BADGE TYPE</label>
                <select value={badgeForm.badgeType} onChange={e => setBadgeForm(p => ({ ...p, badgeType: e.target.value }))} style={SELECT_STYLE}>
                  {BADGE_TYPE_LIST.map(b => <option key={b} value={b}>{b.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>AWARD NOTE (optional)</label>
                <input value={badgeForm.awardNote} onChange={e => setBadgeForm(p => ({ ...p, awardNote: e.target.value }))} style={INPUT_STYLE} />
              </div>
              <ActionBtn label="Award Badge →" onClick={() => onAction("badges", "POST", badgeForm, "reputation")} />
            </div>
          </ChartCard>
          <ChartCard title="Badge Distribution">
            {badgeStats.map(b => (
              <div key={b.badge_type} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BRAND.border}` }}>
                <span style={{ color: BRAND.text, fontSize: 12 }}>{b.badge_type?.replace(/_/g, " ")}</span>
                <span style={{ color: BRAND.yellow, fontWeight: 700, fontSize: 12 }}>{b.count}</span>
              </div>
            ))}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function GovernanceTab({ data, msg, onAction }: TabProps) {
  const s = data.stats ?? {};
  const proposals: any[] = data.proposals ?? [];
  const [selId, setSelId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const sel = proposals.find(p => p.id === selId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionHeader title="Community Governance" sub="Proposals, votes, and platform decisions" />
      <MsgBar msg={msg} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard label="Total Proposals" value={s.total ?? 0} color={BRAND.yellow} />
        <StatCard label="Open" value={s.open ?? 0} color={BRAND.green} />
        <StatCard label="Passed" value={s.passed ?? 0} color={BRAND.purple} />
        <StatCard label="Declined" value={s.declined ?? 0} color={BRAND.pink} />
        <StatCard label="Implemented" value={s.implemented ?? 0} color={BRAND.orange} />
        <StatCard label="Total Votes" value={s.total_votes ?? 0} color={BRAND.faint} />
      </div>
      <ChartCard title="All Proposals">
        <AdminTable headers={["TITLE", "CATEGORY", "AUTHOR", "VOTES YES", "STATUS", "ENDS", "ACTIONS"]}>
          {proposals.map(p => (
            <TableRow key={p.id}
              cells={[
                <span style={{ maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{p.title}</span>,
                p.category ?? "—",
                p.author_name ?? "—",
                <span style={{ color: BRAND.green }}>{p.yes_count ?? 0}↑</span>,
                <Badge label={p.status} color={STATUS_DOT[p.status] ?? BRAND.muted} />,
                p.voting_ends_at ? new Date(p.voting_ends_at).toLocaleDateString() : "—",
              ]}
              actions={<ActionBtn label={selId === p.id ? "▲ Close" : "▼ Respond"} onClick={() => { setSelId(selId === p.id ? null : p.id); setForm({ status: p.status, teamResponse: p.team_response ?? "" }); }} />}
            />
          ))}
        </AdminTable>
        {sel && (
          <div style={{ marginTop: 16, padding: 20, background: "#1a1a1a", borderRadius: 12, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ color: BRAND.yellow, fontWeight: 700, margin: 0 }}>{sel.title}</p>
            <p style={{ color: BRAND.muted, fontSize: 12, margin: 0 }}>{sel.description}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ color: BRAND.green, fontWeight: 700 }}>✓ {sel.yes_count} YES</span>
              <span style={{ color: BRAND.pink, fontWeight: 700 }}>✗ {sel.no_count} NO</span>
            </div>
            <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>OUTCOME STATUS</label>
              <select value={form.status ?? sel.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))} style={SELECT_STYLE}>
                {["open","passed","declined","implemented","archived"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TEAM RESPONSE (public)</label>
              <textarea value={form.teamResponse ?? ""} onChange={e => setForm((p: any) => ({ ...p, teamResponse: e.target.value }))} rows={3} style={TEXTAREA_STYLE} />
            </div>
            <ActionBtn label="Save Response →" onClick={() => onAction(`governance/${sel.id}`, "PATCH", form, "governance")} />
          </div>
        )}
      </ChartCard>
    </div>
  );
}

const BLANK_REPORT = { type: "trend", title: "", summary: "", content: "", requiredTier: "founding", period: "", isPublic: true };

function IntelligenceTab({ data, msg, onAction }: TabProps) {
  const s = data.stats ?? {};
  const reports: any[] = data.reports ?? [];
  const [showForm, setShowForm] = useState(false);
  const [rform, setRform] = useState({ ...BLANK_REPORT });

  // Broadcast state
  const [bcast, setBcast] = useState({ title: "", body: "", targetTier: "all" });
  const [bcastMsg, setBcastMsg] = useState<string | null>(null);
  const [bcastSending, setBcastSending] = useState(false);

  const sendBroadcast = async () => {
    if (!bcast.title.trim()) { setBcastMsg("Title is required"); return; }
    setBcastSending(true);
    setBcastMsg(null);
    try {
      const r = await fetch(`${API_BASE}/admin/notifications/broadcast`, {
        method: "POST",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(bcast),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`);
      setBcastMsg(`✓ Sent to ${d.sent} device${d.sent !== 1 ? "s" : ""}`);
      setBcast({ title: "", body: "", targetTier: "all" });
    } catch (e: any) { setBcastMsg(`Error: ${e.message}`); }
    finally { setBcastSending(false); }
  };

  // RSS status state
  const [rssData, setRssData] = useState<any[]>([]);
  const [rssLoading, setRssLoading] = useState(false);
  const [showRss, setShowRss] = useState(false);

  const loadRss = async () => {
    setRssLoading(true);
    try {
      const r = await fetch(`${API_BASE}/admin/rss/status`, { headers: getAdminHeaders() });
      const d = await r.json();
      setRssData(d.sources ?? []);
      setShowRss(true);
    } catch { setRssData([]); setShowRss(true); }
    finally { setRssLoading(false); }
  };

  // AI Briefing state
  const [briefingMsg, setBriefingMsg] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const generateBriefing = async () => {
    setBriefingLoading(true);
    setBriefingMsg(null);
    try {
      const r = await fetch(`${API_BASE}/admin/briefing/generate`, {
        method: "POST",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`);
      setBriefingMsg(`✓ Briefing "${d.report?.title}" created from ${d.articleCount} articles`);
      onAction("intelligence", "GET", {}, "intelligence");
    } catch (e: any) { setBriefingMsg(`Error: ${e.message}`); }
    finally { setBriefingLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionHeader title="Intelligence Reports" sub="Founding member insights and platform trend reports" />
      <MsgBar msg={msg} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
        <StatCard label="Total Reports" value={s.total ?? 0} color={BRAND.yellow} />
        <StatCard label="Published" value={s.published ?? 0} color={BRAND.green} />
        <StatCard label="Founding Only" value={s.founding_only ?? 0} color={BRAND.purple} />
        <StatCard label="Pro & Above" value={s.pro_above ?? 0} color={BRAND.orange} />
      </div>

      {/* ── AI Daily Briefing ── */}
      <ChartCard title="AI Daily Briefing">
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: BRAND.text, fontSize: 13, margin: "0 0 6px", lineHeight: 1.5 }}>
              Generate a curated Daily Briefing from the last 48 hours of approved articles using AI. Saves directly to Intelligence Reports as a free-tier public report.
            </p>
            {briefingMsg && <p style={{ color: briefingMsg.startsWith("✓") ? BRAND.green : BRAND.pink, fontSize: 12, margin: "6px 0 0", fontWeight: 600 }}>{briefingMsg}</p>}
          </div>
          <button
            onClick={generateBriefing}
            disabled={briefingLoading}
            style={{ padding: "10px 20px", background: BRAND.yellow, color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: briefingLoading ? "wait" : "pointer", opacity: briefingLoading ? 0.7 : 1, whiteSpace: "nowrap" }}>
            {briefingLoading ? "Generating…" : "Generate Briefing"}
          </button>
        </div>
      </ChartCard>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <ActionBtn label={showForm ? "▲ Cancel" : "+ New Report"} color={BRAND.yellow} onClick={() => setShowForm(p => !p)} />
      </div>
      {showForm && (
        <ChartCard title="Create Intelligence Report">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TYPE</label>
                <select value={rform.type} onChange={e => setRform(p => ({ ...p, type: e.target.value }))} style={SELECT_STYLE}>
                  {["trend","talent","opportunity","brand","ecosystem","custom"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>REQUIRED TIER</label>
                <select value={rform.requiredTier} onChange={e => setRform(p => ({ ...p, requiredTier: e.target.value }))} style={SELECT_STYLE}>
                  <option value="pro">Pro & Above</option>
                  <option value="founding">Founding Only</option>
                </select>
              </div>
              <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>PERIOD (e.g. Q1 2026)</label>
                <input value={rform.period} onChange={e => setRform(p => ({ ...p, period: e.target.value }))} style={INPUT_STYLE} />
              </div>
            </div>
            <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TITLE *</label>
              <input value={rform.title} onChange={e => setRform(p => ({ ...p, title: e.target.value }))} style={INPUT_STYLE} />
            </div>
            <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>SUMMARY / ABSTRACT *</label>
              <textarea value={rform.summary} onChange={e => setRform(p => ({ ...p, summary: e.target.value }))} rows={3} style={TEXTAREA_STYLE} />
            </div>
            <div><label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>FULL CONTENT (markdown supported)</label>
              <textarea value={rform.content} onChange={e => setRform(p => ({ ...p, content: e.target.value }))} rows={8} style={{ ...TEXTAREA_STYLE, fontFamily: "monospace" }} />
            </div>
            <ActionBtn label="Publish Report →" onClick={() => { onAction("intelligence", "POST", rform, "intelligence"); setShowForm(false); setRform({ ...BLANK_REPORT }); }} />
          </div>
        </ChartCard>
      )}
      <ChartCard title="Published Reports">
        <AdminTable headers={["TITLE", "TYPE", "TIER", "PERIOD", "AUTHOR", "PUBLISHED", "ACTIONS"]}>
          {reports.map(r => (
            <TableRow key={r.id}
              cells={[
                <span style={{ maxWidth: 240, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{r.title}</span>,
                r.type ?? "—",
                <Badge label={r.required_tier ?? "founding"} color={TIER_BADGE[r.required_tier] ?? BRAND.purple} />,
                r.period ?? "—",
                r.author_name ?? "—",
                r.published_at ? new Date(r.published_at).toLocaleDateString() : "Draft",
              ]}
              actions={<ActionBtn label={r.is_public ? "Unpublish" : "Publish"} color={r.is_public ? BRAND.orange : BRAND.green} onClick={() => onAction(`intelligence/${r.id}`, "PATCH", { isPublic: !r.is_public }, "intelligence")} />}
            />
          ))}
        </AdminTable>
      </ChartCard>

      {/* ── Broadcast Push Notifications ── */}
      <ChartCard title="Broadcast Push Notification">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TITLE *</label>
              <input value={bcast.title} onChange={e => setBcast(p => ({ ...p, title: e.target.value }))} placeholder="e.g. New opportunity just dropped 🔥" style={INPUT_STYLE} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>BODY</label>
              <textarea value={bcast.body} onChange={e => setBcast(p => ({ ...p, body: e.target.value }))} rows={2} placeholder="Optional notification body text…" style={TEXTAREA_STYLE} />
            </div>
            <div>
              <label style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TARGET TIER</label>
              <select value={bcast.targetTier} onChange={e => setBcast(p => ({ ...p, targetTier: e.target.value }))} style={SELECT_STYLE}>
                <option value="all">All Users</option>
                <option value="member">Den Member & above</option>
                <option value="pro">Den Pro & above</option>
                <option value="inner_circle">Inner Circle only</option>
                <option value="founding">Founding Members only</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={sendBroadcast}
                disabled={bcastSending}
                style={{ width: "100%", padding: "10px 18px", background: BRAND.yellow, color: "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: bcastSending ? "wait" : "pointer", opacity: bcastSending ? 0.7 : 1 }}>
                {bcastSending ? "Sending…" : "Send Broadcast"}
              </button>
            </div>
          </div>
          {bcastMsg && <p style={{ color: bcastMsg.startsWith("✓") ? BRAND.green : BRAND.pink, fontSize: 12, margin: 0, fontWeight: 600 }}>{bcastMsg}</p>}
        </div>
      </ChartCard>

      {/* ── RSS Source Health ── */}
      <ChartCard title="RSS Source Health">
        {!showRss ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <ActionBtn label={rssLoading ? "Loading…" : "Load RSS Status"} color={BRAND.purple} onClick={loadRss} />
          </div>
        ) : rssData.length === 0 ? (
          <p style={{ color: BRAND.muted, fontSize: 13, textAlign: "center", padding: 20 }}>No RSS source data found.</p>
        ) : (
          <AdminTable headers={["SOURCE", "TOTAL ARTICLES", "LAST 24H", "LAST PUBLISHED"]}>
            {rssData.map((src: any) => (
              <TableRow key={src.source} cells={[
                <span style={{ fontWeight: 600 }}>{src.source}</span>,
                <span style={{ color: BRAND.yellow, fontWeight: 700 }}>{src.total_articles}</span>,
                <Badge label={`+${src.last_24h}`} color={Number(src.last_24h) > 0 ? BRAND.green : BRAND.faint} />,
                src.last_published ? new Date(src.last_published).toLocaleDateString() : "—",
              ]} />
            ))}
          </AdminTable>
        )}
      </ChartCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

function PendingModerationQueue() {
  const [oppData, setOppData] = useState<any[]>([]);
  const [mktData, setMktData] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [o, m] = await Promise.all([
        fetch(`${API_BASE}/admin/opportunities`, { headers: getAdminHeaders() }).then(r => r.json()),
        fetch(`${API_BASE}/admin/marketplace`, { headers: getAdminHeaders() }).then(r => r.json()),
      ]);
      setOppData(o.pending ?? []);
      setMktData((m.listings ?? []).filter((l: any) => l.status === "pending"));
      setLoaded(true);
    } catch { setLoaded(true); }
    finally { setLoading(false); }
  };

  const handleAction = async (type: "opportunities" | "marketplace", id: string, status: string) => {
    try {
      const r = await fetch(`${API_BASE}/admin/${type}/${id}`, {
        method: "PATCH",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setActionMsg(`✓ ${status === "approved" ? "Approved" : "Rejected"}`);
      setTimeout(() => setActionMsg(null), 2500);
      load();
    } catch (e: any) { setActionMsg(`Error: ${e.message}`); }
  };

  if (!loaded) return (
    <div style={{ textAlign: "center", padding: 24 }}>
      <ActionBtn label={loading ? "Loading…" : "Load Pending Queue"} color={BRAND.orange} onClick={load} />
    </div>
  );

  const totalPending = oppData.length + mktData.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {actionMsg && <p style={{ color: actionMsg.startsWith("✓") ? BRAND.green : BRAND.pink, fontSize: 12, fontWeight: 600, margin: 0 }}>{actionMsg}</p>}
      {totalPending === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 12 }}>
          <p style={{ color: BRAND.green, fontSize: 14, fontWeight: 700, margin: 0 }}>All clear — no items pending review</p>
        </div>
      ) : (
        <>
          {oppData.length > 0 && (
            <ChartCard title={`Pending Opportunities (${oppData.length})`}>
              <AdminTable headers={["TITLE", "TYPE", "ORG", "SUBMITTED BY", "DATE", "ACTIONS"]}>
                {oppData.map((o: any) => (
                  <TableRow key={o.id}
                    cells={[
                      <span style={{ maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{o.title}</span>,
                      <Badge label={o.type} color={BRAND.yellow} />,
                      o.organization ?? "—",
                      o.submitter_name ?? o.submitter_email ?? "Anonymous",
                      o.created_at ? new Date(o.created_at).toLocaleDateString() : "—",
                    ]}
                    actions={
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn label="Approve" color={BRAND.green} onClick={() => handleAction("opportunities", o.id, "approved")} />
                        <ActionBtn label="Reject" color={BRAND.pink} onClick={() => handleAction("opportunities", o.id, "rejected")} />
                      </div>
                    }
                  />
                ))}
              </AdminTable>
            </ChartCard>
          )}
          {mktData.length > 0 && (
            <ChartCard title={`Pending Marketplace Listings (${mktData.length})`}>
              <AdminTable headers={["TITLE", "CATEGORY", "OWNER", "DATE", "ACTIONS"]}>
                {mktData.map((l: any) => (
                  <TableRow key={l.id}
                    cells={[
                      <span style={{ maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{l.title}</span>,
                      l.category ?? "—",
                      l.owner_name ?? l.owner_email ?? "—",
                      l.created_at ? new Date(l.created_at).toLocaleDateString() : "—",
                    ]}
                    actions={
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn label="Approve" color={BRAND.green} onClick={() => handleAction("marketplace", l.id, "active")} />
                        <ActionBtn label="Reject" color={BRAND.pink} onClick={() => handleAction("marketplace", l.id, "rejected")} />
                      </div>
                    }
                  />
                ))}
              </AdminTable>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

function WhatsMovingAdminTab({ token }: { token: string }) {
  const [feed, setFeed] = useState<any>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const load = async () => {
    setLoading(true);
    try {
      const [feedRes, pinRes] = await Promise.all([
        fetch(`${API_BASE}/feed/whats-moving`).then(r => r.json()),
        fetch(`${API_BASE}/admin/whats-moving/pin`, { headers }).then(r => r.json()),
      ]);
      setFeed(feedRes);
      setPinned(pinRes.pinnedSignalId ?? null);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pin = async (signalId: string) => {
    try {
      await fetch(`${API_BASE}/admin/whats-moving/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ signalId }),
      });
      setPinned(signalId);
      setActionMsg("Signal pinned to top of What's Moving.");
      setTimeout(() => setActionMsg(null), 3000);
    } catch { setActionMsg("Error pinning signal."); }
  };

  const unpin = async () => {
    try {
      await fetch(`${API_BASE}/admin/whats-moving/pin`, { method: "DELETE", headers });
      setPinned(null);
      setActionMsg("Signal unpinned.");
      setTimeout(() => setActionMsg(null), 3000);
    } catch { setActionMsg("Error unpinning signal."); }
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: BRAND.muted }}>Loading What's Moving feed…</div>;

  const signals: any[] = feed?.trendingSignals ?? [];
  const hotDoors: any[] = feed?.hotDoors ?? [];
  const risingInnovators: any[] = feed?.risingInnovators ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionHeader title="What's Moving — Admin Controls" sub="Preview the live feed and pin a signal to the top of every home page." />

      {actionMsg && (
        <div style={{ background: BRAND.green + "15", border: `1px solid ${BRAND.green}40`, borderRadius: 10, padding: "12px 16px", color: BRAND.green, fontWeight: 600, fontSize: 13 }}>
          ✓ {actionMsg}
        </div>
      )}

      {pinned && (
        <div style={{ background: BRAND.yellow + "10", border: `1px solid ${BRAND.yellow}30`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: BRAND.yellow, fontSize: 20 }}>📌</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: BRAND.yellow, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>CURRENTLY PINNED</p>
            <p style={{ margin: "3px 0 0", color: BRAND.text, fontSize: 13 }}>
              {signals.find(s => s.id === pinned)?.title ?? `Signal ID: ${pinned}`}
            </p>
          </div>
          <button onClick={unpin} style={{ background: "none", border: `1px solid ${BRAND.faint}`, color: BRAND.muted, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Unpin
          </button>
        </div>
      )}

      {/* Trending signals */}
      <ChartCard title={`Trending Signals (${signals.length})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {signals.length === 0 && (
            <p style={{ color: BRAND.muted, fontSize: 13 }}>No trending signals in the last 48 hours.</p>
          )}
          {signals.map((s: any) => {
            const isPinned = s.id === pinned;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", background: isPinned ? BRAND.yellow + "08" : "#1a1a1a", borderRadius: 10, border: isPinned ? `1px solid ${BRAND.yellow}30` : "1px solid transparent" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: BRAND.muted }}>{s.label}</span>
                    <span style={{ fontSize: 10, color: BRAND.faint }}>·</span>
                    <span style={{ fontSize: 10, color: BRAND.faint }}>{s.topic}</span>
                    {isPinned && <span style={{ fontSize: 10, color: BRAND.yellow, fontWeight: 700 }}>📌 PINNED</span>}
                  </div>
                  <p style={{ margin: 0, color: BRAND.text, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{s.title}</p>
                  <p style={{ margin: "2px 0 0", color: BRAND.muted, fontSize: 11 }}>{s.sourceName} · score {s.trendScore}</p>
                </div>
                {isPinned ? (
                  <button onClick={unpin} style={{ flexShrink: 0, background: "none", border: `1px solid ${BRAND.faint}`, color: BRAND.muted, padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Unpin</button>
                ) : (
                  <button onClick={() => pin(s.id)} style={{ flexShrink: 0, background: BRAND.yellow, color: "#000", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>📌 Pin</button>
                )}
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* Hot doors preview */}
      <ChartCard title={`Hot Doors Preview (${hotDoors.length})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {hotDoors.length === 0 && <p style={{ color: BRAND.muted, fontSize: 13 }}>No hot doors in the last 7 days.</p>}
          {hotDoors.map((d: any) => (
            <div key={d.id} style={{ padding: "10px 12px", background: "#1a1a1a", borderRadius: 8 }}>
              <p style={{ margin: 0, color: BRAND.text, fontSize: 13, fontWeight: 600 }}>{d.title}</p>
              <p style={{ margin: "2px 0 0", color: BRAND.muted, fontSize: 11 }}>{d.organization} · {d.type} · {d.label}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Rising innovators preview */}
      <ChartCard title={`Rising Innovators Preview (${risingInnovators.length})`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {risingInnovators.length === 0 && <p style={{ color: BRAND.muted, fontSize: 13 }}>No new innovators in the last 30 days.</p>}
          {risingInnovators.map((inv: any) => (
            <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#1a1a1a", borderRadius: 10, minWidth: 200 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: BRAND.text, fontSize: 13, fontWeight: 700 }}>{(inv.name ?? "?")[0].toUpperCase()}</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: BRAND.text }}>{inv.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: BRAND.muted }}>{inv.label}</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      <div style={{ textAlign: "right" }}>
        <button onClick={load} style={{ background: "none", border: `1px solid ${BRAND.border}`, color: BRAND.muted, padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
          ↻ Refresh Feed Preview
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Lazy-loaded management tab data
  const [tabData, setTabData] = useState<Record<string, any>>({});
  const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({});
  const [tabMsg, setTabMsg] = useState<Record<string, string | null>>({});

  const MANAGEMENT_TABS = ["concierge", "marketplace", "partners", "reputation", "governance", "intelligence", "circles"];

  const loadTab = useCallback(async (tabId: string, force = false) => {
    if (tabData[tabId] && !force) return;
    setTabLoading(p => ({ ...p, [tabId]: true }));
    try {
      const res = await fetch(`${API_BASE}/admin/${tabId}`, { headers: getAdminHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTabData(p => ({ ...p, [tabId]: json }));
    } catch (e: any) {
      setTabMsg(p => ({ ...p, [tabId]: e.message }));
    } finally {
      setTabLoading(p => ({ ...p, [tabId]: false }));
    }
  }, [tabData]);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    if (MANAGEMENT_TABS.includes(id)) loadTab(id);
    if (id === "sponsors") loadTab("circles");
  }, [loadTab]);

  const adminAction = useCallback(async (endpoint: string, method: string, body: any, tabId: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${endpoint}`, {
        method, headers: { ...getAdminHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? `HTTP ${res.status}`); }
      setTabMsg(p => ({ ...p, [tabId]: "✓ Saved" }));
      setTimeout(() => setTabMsg(p => ({ ...p, [tabId]: null })), 2500);
      loadTab(tabId, true);
    } catch (e: any) {
      setTabMsg(p => ({ ...p, [tabId]: `Error: ${e.message}` }));
    }
  }, [loadTab]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/stats?range=${range}`, {
        headers: getAdminHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const tabs = [
    { id: "overview",      label: "Overview" },
    { id: "publish",       label: "✦ Publish Story" },
    { id: "users",         label: "Users & Growth" },
    { id: "retention",     label: "Retention" },
    { id: "content",       label: "Signals" },
    { id: "engagement",    label: "Engagement" },
    { id: "membership",    label: "Membership" },
    { id: "circles",       label: "Circles" },
    { id: "doors",         label: "Doors" },
    { id: "network",       label: "Network" },
    { id: "events",        label: "Events" },
    { id: "feeds",         label: "Feed Health" },
    { id: "referrals",     label: "Referrals" },
    { id: "sponsors",      label: "Sponsors" },
    { id: "notif_health",  label: "Notif Health" },
    { id: "cities",        label: "City Breakdown" },
    { id: "whats_moving",  label: "What's Moving" },
    { id: "inbox",         label: "Inbox" },
    { id: "directory",     label: "Directory" },
    { id: "moderation",    label: "Moderation" },
    { id: "sep", label: "│", disabled: true },
    { id: "concierge",     label: "Concierge" },
    { id: "marketplace",   label: "Marketplace" },
    { id: "partners",      label: "Partners" },
    { id: "reputation",    label: "Reputation" },
    { id: "governance",    label: "Governance" },
    { id: "intelligence",  label: "Intelligence" },
  ];

  const u = data?.users ?? {};
  const a = data?.articles ?? {};
  const e = data?.engagement ?? {};
  const au = data?.activeUsers ?? {};
  const ret = data?.retention ?? {};
  const f = data?.follows ?? {};
  const td = data?.trackedDoors ?? {};
  const bk = data?.bookmarks ?? {};
  const rp = data?.reports ?? {};
  const op = data?.opportunities ?? {};
  const rm = data?.rooms ?? {};
  const nf = data?.notifications ?? {};
  const ref = data?.referrals ?? {};
  const ev = data?.eventsDetail ?? {};
  const circ = data?.circles ?? {};
  const feeds: any[] = data?.feedHealth ?? [];
  const topRef: any[] = data?.topReferrers ?? [];
  const dir = data?.peopleDirectory ?? {};
  const topInnovators: any[] = data?.topInnovators ?? [];
  const notifTypes: any[] = data?.notifTypeBreakdown ?? [];
  const topCircles: any[] = data?.topCircles ?? [];
  const cityDist: any[] = data?.cityDistribution ?? [];
  const sponsoredArticles: any[] = (data?.articles as any)?.sponsoredList ?? [];
  const sponsorStats = (data as any)?.sponsorStats ?? {};
  const membershipFunnel: any[] = data?.membershipFunnel ?? [];
  const followGrowth: any[] = data?.followGrowth ?? [];

  const growthData = (data?.userGrowth ?? []).map((d: any) => ({
    date: d.date?.slice(5) ?? d.date,
    Users: Number(d.new_users ?? 0),
    Paid: Number(d.paid ?? 0),
  }));

  const engData = (data?.engagementGrowth ?? []).map((d: any) => ({
    date: d.date?.slice(5) ?? d.date,
    Events: Number(d.events ?? 0),
    Clicks: Number(d.clicks ?? 0),
    Saves: Number(d.saves ?? 0),
    Reads: Number(d.reads ?? 0),
  }));

  const tierData = [
    { name: "Free", value: Number(u.total ?? 0) - Number(u.paid ?? 0) },
    { name: "Member", value: Number(u.member_count ?? 0) },
    { name: "Pro", value: Number(u.pro_count ?? 0) },
    { name: "Inner Circle", value: Number(u.ic_count ?? 0) },
  ].filter(d => d.value > 0);

  const topTopicsData = (data?.topTopics ?? []).slice(0, 8).map((t: any) => ({
    name: t.topic ?? "",
    Events: Number(t.event_count ?? 0),
  }));

  const doorStatusData = [
    { name: "Saved", value: Number(td.saved ?? 0), color: BRAND.yellow },
    { name: "Applied", value: Number(td.applied ?? 0), color: BRAND.green },
    { name: "Interviewing", value: Number(td.interviewing ?? 0), color: BRAND.purple },
    { name: "Closed", value: Number(td.closed ?? 0), color: BRAND.faint },
  ].filter(d => d.value > 0);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: BRAND.text, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BRAND.border}`, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#000", zIndex: 100 }}>
        <div>
          <p style={{ color: BRAND.yellow, fontSize: 10, fontWeight: 700, letterSpacing: 3, margin: "0 0 4px" }}>INNOVATORS DEN</p>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>Executive Command Center</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(["today", "7d", "30d", "90d", "all"] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                background: range === r ? BRAND.yellow : "#1a1a1a",
                color: range === r ? "#000" : BRAND.muted,
                border: `1px solid ${range === r ? BRAND.yellow : BRAND.border}`,
                borderRadius: 8, padding: "6px 14px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {r === "all" ? "All Time" : r === "today" ? "Today" : r}
            </button>
          ))}
          <button onClick={load} style={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, color: BRAND.muted, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>↻</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${BRAND.border}`, padding: "0 32px", display: "flex", gap: 2, overflowX: "auto" }}>
        {tabs.map(t => t.id === "sep" ? (
          <span key="sep" style={{ color: BRAND.faint, padding: "13px 4px", fontSize: 13, userSelect: "none" }}>│</span>
        ) : (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            style={{
              background: "none", border: "none", padding: "13px 16px",
              color: activeTab === t.id ? BRAND.text : BRAND.muted,
              fontWeight: activeTab === t.id ? 700 : 400,
              fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
              borderBottom: activeTab === t.id ? `2px solid ${BRAND.yellow}` : "2px solid transparent",
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 80px" }}>
        {loading && <div style={{ textAlign: "center", padding: 80, color: BRAND.muted }}>Loading platform data…</div>}
        {error && <div style={{ textAlign: "center", padding: 40, color: BRAND.pink }}>Error: {error}</div>}

        {!loading && !error && data && (
          <>
            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Platform Overview" sub={`Data for the last ${range === "all" ? "all time" : range === "today" ? "24 hours" : range}`} />

                {/* Live activity strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  <div style={{ background: "#0a1a0a", border: `1px solid ${BRAND.green}44`, borderRadius: 14, padding: "18px 22px", textAlign: "center" }}>
                    <p style={{ color: BRAND.green, fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>DAU</p>
                    <p style={{ color: BRAND.green, fontSize: 36, fontWeight: 800, margin: "0 0 2px" }}>{fmt(au.dau)}</p>
                    <p style={{ color: "#555", fontSize: 11, margin: 0 }}>active today</p>
                  </div>
                  <div style={{ background: "#1a1500", border: `1px solid ${BRAND.yellow}44`, borderRadius: 14, padding: "18px 22px", textAlign: "center" }}>
                    <p style={{ color: BRAND.yellow, fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>WAU</p>
                    <p style={{ color: BRAND.yellow, fontSize: 36, fontWeight: 800, margin: "0 0 2px" }}>{fmt(au.wau)}</p>
                    <p style={{ color: "#555", fontSize: 11, margin: 0 }}>active this week</p>
                  </div>
                  <div style={{ background: "#1a0a1a", border: `1px solid ${BRAND.purple}44`, borderRadius: 14, padding: "18px 22px", textAlign: "center" }}>
                    <p style={{ color: BRAND.purple, fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 6px" }}>MAU</p>
                    <p style={{ color: BRAND.purple, fontSize: 36, fontWeight: 800, margin: "0 0 2px" }}>{fmt(au.mau)}</p>
                    <p style={{ color: "#555", fontSize: 11, margin: 0 }}>active this month</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Users" value={fmt(u.total)} color={BRAND.yellow} />
                  <StatCard label="Paid Members" value={fmt(u.paid)} sub={pct(u.paid, u.total) + " of total"} color={BRAND.green} />
                  <StatCard label="New Today" value={fmt(u.new_today)} color={BRAND.yellow} />
                  <StatCard label="New This Week" value={fmt(u.new_week)} color={BRAND.yellow} />
                  <StatCard label="New This Month" value={fmt(u.new_month)} color={BRAND.yellow} />
                  <StatCard label="DAU/MAU Ratio" value={au.mau ? `${((Number(au.dau) / Number(au.mau)) * 100).toFixed(1)}%` : "—"} sub="stickiness" color={BRAND.green} />
                  <StatCard label="Approved Signals" value={fmt(a.approved)} color={BRAND.purple} />
                  <StatCard label="Pending Review" value={fmt(a.pending)} color={Number(a.pending) > 0 ? BRAND.orange : BRAND.faint} />
                  <StatCard label="Total Engagement" value={fmt(e.total_in_range)} sub="events in period" color={BRAND.yellow} />
                  <StatCard label="Total Follows" value={fmt(f.total)} color={BRAND.green} />
                  <StatCard label="Tracked Doors" value={fmt(td.total)} color={BRAND.purple} />
                  <StatCard label="Circle Messages" value={fmt(circ.total_messages)} color={BRAND.pink} />
                  <StatCard label="Bookmarks" value={fmt(bk.total)} color={BRAND.yellow} />
                  <StatCard label="Open Reports" value={fmt(rp.open)} color={Number(rp.open) > 0 ? BRAND.pink : BRAND.faint} />
                  <StatCard label="Notifications Sent" value={fmt(nf.total)} color={BRAND.purple} />
                  <StatCard label="Est. MRR" value={`$${(Number(u.member_count ?? 0) * 9 + Number(u.pro_count ?? 0) * 19 + Number(u.ic_count ?? 0) * 49 + Math.round(Number(u.founding_count ?? 0) * 999 / 12)).toLocaleString()}`} color={BRAND.green} />
                </div>

                {/* Tier breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <ChartCard title="Membership Tier Distribution">
                    {tierData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={tierData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                            {tierData.map((_, i) => (
                              <Cell key={i} fill={[BRAND.faint, BRAND.green, BRAND.yellow, BRAND.pink][i % 4]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <p style={{ color: BRAND.faint, textAlign: "center", paddingTop: 60 }}>No paid members yet</p>}
                  </ChartCard>

                  <ChartCard title="Content Breakdown">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 8 }}>
                      {[
                        { label: "Approved", value: a.approved, color: BRAND.green },
                        { label: "Pending", value: a.pending, color: BRAND.orange },
                        { label: "Rejected", value: a.rejected, color: BRAND.pink },
                        { label: "Needs Edits", value: a.needs_edits, color: BRAND.orange },
                        { label: "Scheduled", value: a.scheduled, color: BRAND.purple },
                        { label: "Total Articles", value: a.total, color: BRAND.yellow },
                        { label: "Opportunities", value: op.total, color: BRAND.yellow },
                        { label: "Events/Rooms", value: rm.total, color: BRAND.purple },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{fmt(s.value)}</div>
                          <div style={{ color: BRAND.faint, fontSize: 11 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>

                {/* Top topics */}
                {topTopicsData.length > 0 && (
                  <ChartCard title="Top Topics by Engagement">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={topTopicsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <YAxis tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                        <Bar dataKey="Events" fill={BRAND.yellow} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
              </div>
            )}

            {/* ── PUBLISH STORY ── */}
            {activeTab === "publish" && <PublishStoryTab />}

            {/* ── USERS & GROWTH ── */}
            {activeTab === "users" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="User Growth & Acquisition" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Users" value={fmt(u.total)} color={BRAND.yellow} />
                  <StatCard label="Paid Users" value={fmt(u.paid)} sub={pct(u.paid, u.total)} color={BRAND.green} />
                  <StatCard label="Free Users" value={fmt(Number(u.total ?? 0) - Number(u.paid ?? 0))} color={BRAND.faint} />
                  <StatCard label="Den Member" value={fmt(u.member_count)} color={BRAND.green} />
                  <StatCard label="Den Pro" value={fmt(u.pro_count)} color={BRAND.yellow} />
                  <StatCard label="Inner Circle" value={fmt(u.ic_count)} color={BRAND.pink} />
                  <StatCard label="Referred Users" value={fmt(u.referred_users)} sub={pct(u.referred_users, u.total) + " of total"} color={BRAND.purple} />
                  <StatCard label="New Today" value={fmt(u.new_today)} color={BRAND.yellow} />
                  <StatCard label="New This Week" value={fmt(u.new_week)} color={BRAND.yellow} />
                  <StatCard label="New This Month" value={fmt(u.new_month)} color={BRAND.yellow} />
                </div>

                {growthData.length > 0 && (
                  <ChartCard title={`Daily New Users (${range})`}>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={growthData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={BRAND.yellow} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={BRAND.yellow} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <YAxis tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                        <Legend />
                        <Area type="monotone" dataKey="Users" stroke={BRAND.yellow} fill="url(#colorUsers)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Paid" stroke={BRAND.green} fill="none" strokeWidth={2} strokeDasharray="4 2" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {/* City distribution */}
                {(data?.cityDistribution ?? []).length > 0 && (
                  <ChartCard title="Users by City">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(data.cityDistribution as any[]).map((c: any) => (
                        <div key={c.city} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 120, color: BRAND.text, fontSize: 13, flexShrink: 0 }}>{c.city}</div>
                          <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 4, height: 8, overflow: "hidden" }}>
                            <div style={{ background: BRAND.yellow, height: "100%", width: `${Math.min(100, (c.users / (data.cityDistribution[0]?.users || 1)) * 100)}%`, borderRadius: 4 }} />
                          </div>
                          <div style={{ color: BRAND.yellow, fontSize: 13, fontWeight: 700, width: 32, textAlign: "right" }}>{c.users}</div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )}

                {/* Topic preferences at signup */}
                {(data?.topicPreferences ?? []).length > 0 && (
                  <ChartCard title="Topic Interests at Onboarding">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 4 }}>
                      {(data.topicPreferences as any[]).map((t: any) => (
                        <div key={t.topic} style={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: BRAND.text, fontSize: 13 }}>{t.topic}</span>
                          <span style={{ color: BRAND.yellow, fontSize: 13, fontWeight: 700 }}>{t.users}</span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )}
              </div>
            )}

            {/* ── RETENTION ── */}
            {activeTab === "retention" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Retention & Habit Loops" sub="How many users come back — and what brings them back" />

                {/* DAU/WAU/MAU strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                  {[
                    { label: "DAU", value: fmt(au.dau), sub: "active today", color: BRAND.green },
                    { label: "WAU", value: fmt(au.wau), sub: "active this week", color: BRAND.yellow },
                    { label: "MAU", value: fmt(au.mau), sub: "active this month", color: BRAND.purple },
                    { label: "DAU/MAU", value: au.mau ? `${((Number(au.dau) / Number(au.mau)) * 100).toFixed(1)}%` : "—", sub: "stickiness ratio", color: BRAND.pink },
                  ].map(s => (
                    <div key={s.label} style={{ background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 14, padding: "20px 22px", textAlign: "center" }}>
                      <p style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 2, margin: "0 0 8px", textTransform: "uppercase" }}>{s.label}</p>
                      <p style={{ color: s.color, fontSize: 30, fontWeight: 800, margin: "0 0 4px" }}>{s.value}</p>
                      <p style={{ color: BRAND.faint, fontSize: 11, margin: 0 }}>{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Cohort retention */}
                <ChartCard title="Cohort Retention (Based on Behavioral Events)">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { label: "D1 Retention", retained: ret.d1_retained, cohort: ret.d1_cohort, sub: "users who returned within 24h of signup" },
                      { label: "D7 Retention", retained: ret.d7_retained, cohort: ret.d7_cohort, sub: "users active in days 2–7 after signup" },
                      { label: "D30 Retention", retained: ret.d30_retained, cohort: ret.d30_cohort, sub: "users active in days 8–30 after signup" },
                    ].map(row => {
                      const rate = Number(row.cohort) > 0 ? (Number(row.retained) / Number(row.cohort)) * 100 : 0;
                      const color = rate >= 40 ? BRAND.green : rate >= 20 ? BRAND.yellow : BRAND.pink;
                      return (
                        <div key={row.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div>
                              <span style={{ color: BRAND.text, fontSize: 14, fontWeight: 700 }}>{row.label}</span>
                              <span style={{ color: BRAND.muted, fontSize: 11, marginLeft: 10 }}>{row.sub}</span>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ color, fontSize: 18, fontWeight: 800 }}>{rate.toFixed(1)}%</span>
                              <span style={{ color: BRAND.faint, fontSize: 11, marginLeft: 8 }}>{fmt(row.retained)} / {fmt(row.cohort)}</span>
                            </div>
                          </div>
                          <div style={{ background: "#1a1a1a", borderRadius: 6, height: 10, overflow: "hidden" }}>
                            <div style={{ background: color, height: "100%", width: `${Math.min(100, rate)}%`, borderRadius: 6, transition: "width 0.5s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 16, padding: "10px 14px", background: "#1a1a1a", borderRadius: 8 }}>
                    <p style={{ color: BRAND.muted, fontSize: 11, margin: 0 }}>
                      Industry benchmarks: D1 &gt; 40% = good, D7 &gt; 20% = good, D30 &gt; 10% = good. As user events accumulate, these numbers will sharpen.
                    </p>
                  </div>
                </ChartCard>

                {/* Habit loop analysis */}
                <ChartCard title="Habit Loop Behaviors (30-day Active Users)">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, paddingTop: 4 }}>
                    {[
                      { label: "Active + Has Tracked Door", value: ret.tracked_door_active, sub: "strongest retention signal", color: BRAND.yellow },
                      { label: "Active + Following Someone", value: ret.follower_active, sub: "network-anchored users", color: BRAND.green },
                      { label: "Bookmarks", value: bk.total, sub: "total saved content", color: BRAND.purple },
                      { label: "Room RSVPs", value: e.rsvps, sub: "events driving return", color: BRAND.pink },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#1a1a1a", borderRadius: 12, padding: 18 }}>
                        <p style={{ color: s.color, fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>{fmt(s.value)}</p>
                        <p style={{ color: BRAND.text, fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>{s.label}</p>
                        <p style={{ color: BRAND.faint, fontSize: 11, margin: 0 }}>{s.sub}</p>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                <ChartCard title="Why Users Come Back — Retention Drivers">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { driver: "Tracked Doors (job tracking habit)", strength: "Very High", color: BRAND.yellow, note: "Daily check-in behavior" },
                      { driver: "Following Innovators / Topics", strength: "High", color: BRAND.green, note: "Network effect" },
                      { driver: "Circle Chat Rooms", strength: "High", color: BRAND.pink, note: "Live video + chat = stickiness" },
                      { driver: "Saved Content / Bookmarks", strength: "Medium", color: BRAND.purple, note: "Return for saved reads" },
                      { driver: "Event RSVPs", strength: "Medium", color: BRAND.yellow, note: "Upcoming event drives return" },
                      { driver: "AI Daily Briefing (Pro)", strength: "High", color: BRAND.green, note: "Daily notification-driven" },
                      { driver: "Referral rewards / invites", strength: "Medium", color: BRAND.orange, note: "Social loop" },
                    ].map(row => (
                      <div key={row.driver} style={{ display: "flex", gap: 14, padding: "10px 14px", background: "#1a1a1a", borderRadius: 8, alignItems: "center" }}>
                        <div style={{ flex: 1, color: BRAND.text, fontSize: 13 }}>{row.driver}</div>
                        <div style={{ color: BRAND.muted, fontSize: 11, width: 160 }}>{row.note}</div>
                        <div style={{ color: row.color, fontSize: 12, fontWeight: 700, width: 70, textAlign: "right" }}>{row.strength}</div>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color }} />
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            )}

            {/* ── SIGNALS / CONTENT ── */}
            {activeTab === "content" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Signals & Content Performance" sub="Signal = story/article in the Den" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Signals" value={fmt(a.total)} color={BRAND.yellow} />
                  <StatCard label="Approved" value={fmt(a.approved)} color={BRAND.green} />
                  <StatCard label="Pending Moderation" value={fmt(a.pending)} color={Number(a.pending) > 0 ? BRAND.orange : BRAND.faint} />
                  <StatCard label="Auto-Rejected" value={fmt(a.rejected)} color={BRAND.pink} />
                  <StatCard label="Needs Edits" value={fmt(a.needs_edits)} color={BRAND.orange} />
                  <StatCard label="Scheduled" value={fmt(a.scheduled)} color={BRAND.purple} />
                  <StatCard label="Total Clicks" value={fmt(e.clicks)} color={BRAND.yellow} />
                  <StatCard label="Complete Reads" value={fmt(e.reads)} color={BRAND.green} />
                  <StatCard label="Saves" value={fmt(e.saves)} color={BRAND.purple} />
                  <StatCard label="Shares" value={fmt(e.shares)} color={BRAND.pink} />
                  <StatCard label="Avg Dwell (sec)" value={e.avg_dwell ? Number(e.avg_dwell).toFixed(0) : "—"} color={BRAND.yellow} />
                  <StatCard label="Read Completion" value={pct(e.reads, e.clicks)} color={BRAND.green} />
                </div>

                {topTopicsData.length > 0 && (
                  <ChartCard title="Topic Engagement (Events per Topic)">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={topTopicsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <XAxis type="number" tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: BRAND.text, fontSize: 12 }} width={100} />
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                        <Bar dataKey="Events" fill={BRAND.yellow} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {(data?.topArticles ?? []).length > 0 && (
                  <ChartCard title="Top Performing Signals">
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(data.topArticles as any[]).map((art: any, i: number) => (
                        <div key={art.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 14px", background: "#1a1a1a", borderRadius: 10 }}>
                          <span style={{ color: BRAND.faint, fontSize: 13, width: 20, flexShrink: 0 }}>#{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: BRAND.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{art.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: BRAND.muted }}>{art.topic} · {art.source_name}</p>
                          </div>
                          <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                            {[["Clicks", art.clicks, BRAND.yellow], ["Saves", art.saves, BRAND.purple], ["Reads", art.reads, BRAND.green], ["Shares", art.shares, BRAND.pink]].map(([l, v, c]) => (
                              <div key={String(l)} style={{ textAlign: "center" }}>
                                <div style={{ color: c as string, fontSize: 15, fontWeight: 800 }}>{v}</div>
                                <div style={{ color: BRAND.faint, fontSize: 10 }}>{l}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )}
              </div>
            )}

            {/* ── ENGAGEMENT ── */}
            {activeTab === "engagement" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Engagement & Behavior" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Events" value={fmt(e.total_in_range)} sub="in period" color={BRAND.yellow} />
                  <StatCard label="Clicks" value={fmt(e.clicks)} color={BRAND.yellow} />
                  <StatCard label="Complete Reads" value={fmt(e.reads)} color={BRAND.green} />
                  <StatCard label="Saves" value={fmt(e.saves)} color={BRAND.purple} />
                  <StatCard label="Shares" value={fmt(e.shares)} color={BRAND.pink} />
                  <StatCard label="Room RSVPs" value={fmt(e.rsvps)} color={BRAND.yellow} />
                  <StatCard label="Apply Clicks" value={fmt(e.apply_clicks)} color={BRAND.orange} />
                  <StatCard label="Doors Tracked" value={fmt(e.doors_tracked)} color={BRAND.green} />
                  <StatCard label="Paywall Shown" value={fmt(e.paywall_shown)} color={BRAND.orange} />
                  <StatCard label="Upgrade Clicks" value={fmt(e.upgrade_clicks)} color={BRAND.green} />
                  <StatCard label="Referrals Sent" value={fmt(e.referrals_sent)} color={BRAND.pink} />
                  <StatCard label="Paywall → Upgrade" value={pct(e.upgrade_clicks, e.paywall_shown)} color={BRAND.yellow} />
                </div>

                {engData.length > 0 && (
                  <ChartCard title={`Daily Engagement (${range})`}>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={engData}>
                        <defs>
                          {[["click", BRAND.yellow], ["save", BRAND.purple], ["read", BRAND.green]].map(([k, c]) => (
                            <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={c} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <YAxis tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                        <Legend />
                        <Area type="monotone" dataKey="Clicks" stroke={BRAND.yellow} fill="url(#grad-click)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Saves" stroke={BRAND.purple} fill="url(#grad-save)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Reads" stroke={BRAND.green} fill="url(#grad-read)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <ChartCard title="Inbox Health">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 4 }}>
                      {[
                        { label: "Total Sent", value: nf.total, color: BRAND.yellow },
                        { label: "Unread", value: nf.unread, color: BRAND.orange },
                        { label: "Follow Notifs", value: nf.follow_notifs, color: BRAND.green },
                        { label: "Room Notifs", value: nf.room_notifs, color: BRAND.purple },
                        { label: "Opportunity", value: nf.opp_notifs, color: BRAND.yellow },
                        { label: "Access Notifs", value: nf.access_notifs, color: BRAND.pink },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{fmt(s.value)}</div>
                          <div style={{ color: BRAND.faint, fontSize: 11 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>

                  <ChartCard title="Bookmarks">
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", height: "100%", paddingTop: 8 }}>
                      <StatCard label="Total Bookmarks" value={fmt(bk.total)} color={BRAND.yellow} />
                      <StatCard label="Unique Users" value={fmt(bk.unique_users)} sub={pct(bk.unique_users, u.total) + " of users"} color={BRAND.green} />
                    </div>
                  </ChartCard>
                </div>
              </div>
            )}

            {/* ── MEMBERSHIP ── */}
            {activeTab === "membership" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Membership & Revenue" sub="Tier performance and conversion" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Paid" value={fmt(u.paid)} color={BRAND.green} />
                  <StatCard label="Conversion Rate" value={pct(u.paid, u.total)} color={BRAND.yellow} />
                  <StatCard label="Den Member" value={fmt(u.member_count)} color={BRAND.green} />
                  <StatCard label="Den Pro" value={fmt(u.pro_count)} color={BRAND.yellow} />
                  <StatCard label="Inner Circle" value={fmt(u.ic_count)} color={BRAND.pink} />
                  <StatCard label="Referred Users" value={fmt(u.referred_users)} color={BRAND.purple} />
                  <StatCard label="Referral Sends" value={fmt(ref.total_referral_sends)} color={BRAND.pink} />
                  <StatCard label="Unique Referrers" value={fmt(ref.unique_referrers)} color={BRAND.yellow} />
                  <StatCard label="Sub Success Events" value={fmt(e.subscription_success)} color={BRAND.green} />
                  <StatCard label="Upgrade Clicks" value={fmt(e.upgrade_clicks)} color={BRAND.yellow} />
                  <StatCard label="Paywall Shown" value={fmt(e.paywall_shown)} color={BRAND.orange} />
                  <StatCard label="Paywall CVR" value={pct(e.upgrade_clicks, e.paywall_shown)} color={BRAND.green} />
                </div>

                <ChartCard title="Revenue Estimate">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 20, paddingTop: 8 }}>
                    {[
                      { tier: "Den Member", count: u.member_count, monthly: 9, color: BRAND.green },
                      { tier: "Den Pro", count: u.pro_count, monthly: 19, color: BRAND.yellow },
                      { tier: "Inner Circle", count: u.ic_count, monthly: 49, color: BRAND.pink },
                      { tier: "Founding / Patron", count: u.founding_count, monthly: Math.round(999 / 12), color: "#C084FC" },
                    ].map(({ tier, count, monthly, color }) => {
                      const mrr = Number(count ?? 0) * monthly;
                      return (
                        <div key={tier} style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                          <p style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 8px" }}>{tier.toUpperCase()}</p>
                          <p style={{ color, fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>${mrr.toLocaleString()}</p>
                          <p style={{ color: BRAND.faint, fontSize: 12, margin: "0 0 4px" }}>est. MRR</p>
                          <p style={{ color, fontSize: 14, fontWeight: 700, margin: 0 }}>{fmt(count)} members × ${monthly}/mo</p>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 20, padding: 16, background: "#1a1a1a", borderRadius: 10, textAlign: "center" }}>
                    <p style={{ color: BRAND.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: "0 0 6px" }}>ESTIMATED TOTAL MRR</p>
                    <p style={{ color: BRAND.yellow, fontSize: 36, fontWeight: 800, margin: "0 0 4px" }}>
                      ${(Number(u.member_count ?? 0) * 9 + Number(u.pro_count ?? 0) * 19 + Number(u.ic_count ?? 0) * 49 + Math.round(Number(u.founding_count ?? 0) * 999 / 12)).toLocaleString()}
                    </p>
                    <p style={{ color: BRAND.faint, fontSize: 12, margin: 0 }}>ARR est. ×12: ${((Number(u.member_count ?? 0) * 9 + Number(u.pro_count ?? 0) * 19 + Number(u.ic_count ?? 0) * 49 + Math.round(Number(u.founding_count ?? 0) * 999 / 12)) * 12).toLocaleString()}</p>
                  </div>
                </ChartCard>

                {/* Membership Conversion Funnel */}
                <ChartCard title="Membership Conversion Funnel">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(() => {
                      const total = Number(u.total ?? 0);
                      const steps = [
                        { label: "Free Users", value: total - Number(u.paid ?? 0), color: BRAND.faint },
                        { label: "Den Member", value: Number(u.member_count ?? 0), color: BRAND.green },
                        { label: "Den Pro", value: Number(u.pro_count ?? 0), color: BRAND.yellow },
                        { label: "Inner Circle", value: Number(u.ic_count ?? 0), color: BRAND.pink },
                      ];
                      return steps.map(step => (
                        <div key={step.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ color: BRAND.text, fontSize: 13, fontWeight: 600 }}>{step.label}</span>
                            <div>
                              <span style={{ color: step.color, fontSize: 15, fontWeight: 800 }}>{fmt(step.value)}</span>
                              <span style={{ color: BRAND.faint, fontSize: 11, marginLeft: 8 }}>{pct(step.value, total)}</span>
                            </div>
                          </div>
                          <div style={{ background: "#1a1a1a", borderRadius: 5, height: 10, overflow: "hidden" }}>
                            <div style={{ background: step.color, height: "100%", width: `${Math.min(100, total ? (step.value / total) * 100 : 0)}%`, borderRadius: 5, transition: "width 0.5s" }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </ChartCard>

                <ChartCard title="Paywall Performance">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, paddingTop: 4 }}>
                    {[
                      { label: "Paywall Shown", value: e.paywall_shown, color: BRAND.orange },
                      { label: "Upgrade Clicks", value: e.upgrade_clicks, color: BRAND.yellow },
                      { label: "Subscriptions", value: e.subscription_success, color: BRAND.green },
                      { label: "Paywall CVR", value: pct(e.upgrade_clicks, e.paywall_shown), color: BRAND.green },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#1a1a1a", borderRadius: 10, padding: 16, textAlign: "center" }}>
                        <div style={{ color: s.color, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{fmt(s.value)}</div>
                        <div style={{ color: BRAND.faint, fontSize: 11 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            )}

            {/* ── CIRCLES ── */}
            {activeTab === "circles" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Circles — Persistent Chat & Video Rooms" sub="Community spaces with live text + video" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Circles" value={fmt(circ.total_circles)} color={BRAND.yellow} />
                  <StatCard label="Active Circles" value={fmt(circ.active_circles)} color={BRAND.green} />
                  <StatCard label="Total Members" value={fmt(circ.total_circle_members)} color={BRAND.purple} />
                  <StatCard label="Total Messages" value={fmt(circ.total_messages)} color={BRAND.yellow} />
                  <StatCard label="Questions Posted" value={fmt(circ.total_questions)} color={BRAND.pink} />
                  <StatCard label="Answers Posted" value={fmt(circ.total_answers)} color={BRAND.green} />
                  <StatCard label="Messages (7d)" value={fmt(circ.messages_last_7d)} color={BRAND.yellow} />
                  <StatCard label="Messages (24h)" value={fmt(circ.messages_last_24h)} color={circ.messages_last_24h > 0 ? BRAND.green : BRAND.faint} />
                  <StatCard label="Video Sessions" value={fmt(circ.total_video_sessions)} color={BRAND.pink} />
                  <StatCard label="Live Sessions Now" value={fmt(circ.active_video_sessions)} color={circ.active_video_sessions > 0 ? BRAND.green : BRAND.faint} />
                </div>

                {topCircles.length > 0 && (
                  <ChartCard title="Most Active Circles">
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {topCircles.map((c: any, i: number) => (
                        <div key={c.slug} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 14px", background: "#1a1a1a", borderRadius: 10 }}>
                          <span style={{ color: i < 3 ? BRAND.yellow : BRAND.faint, fontSize: 13, fontWeight: 800, width: 24, flexShrink: 0 }}>#{i + 1}</span>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.accent_color ?? BRAND.yellow, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: BRAND.text }}>{c.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: BRAND.muted }}>/{c.slug}</p>
                          </div>
                          <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                            {[["Members", c.members, BRAND.green], ["Messages", c.messages, BRAND.yellow], ["7d", c.messages_7d, BRAND.purple], ["Videos", c.video_sessions, BRAND.pink]].map(([l, v, col]) => (
                              <div key={String(l)} style={{ textAlign: "center" }}>
                                <div style={{ color: col as string, fontSize: 15, fontWeight: 800 }}>{fmt(v)}</div>
                                <div style={{ color: BRAND.faint, fontSize: 10 }}>{l}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )}

                <ChartCard title="Circle Room Health">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, paddingTop: 4 }}>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.yellow, fontSize: 30, fontWeight: 800, marginBottom: 4 }}>
                        {circ.total_circle_members > 0 ? (Number(circ.total_messages) / Number(circ.total_circle_members)).toFixed(1) : "—"}
                      </div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Messages / Member</div>
                    </div>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.pink, fontSize: 30, fontWeight: 800, marginBottom: 4 }}>{fmt(circ.total_video_sessions)}</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Video Sessions Total</div>
                    </div>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.green, fontSize: 30, fontWeight: 800, marginBottom: 4 }}>
                        {circ.total_messages > 0 ? pct(circ.total_questions, circ.total_messages) : "—"}
                      </div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>% Are Questions</div>
                    </div>
                  </div>
                </ChartCard>
              </div>
            )}

            {/* ── DOORS ── */}
            {activeTab === "doors" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Doors & Opportunity Engine" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Opportunities" value={fmt(op.total)} color={BRAND.yellow} />
                  <StatCard label="Jobs" value={fmt(op.jobs)} color={BRAND.green} />
                  <StatCard label="Grants" value={fmt(op.grants)} color={BRAND.purple} />
                  <StatCard label="Collabs" value={fmt(op.collabs)} color={BRAND.yellow} />
                  <StatCard label="Brand Deals" value={fmt(op.brand_deals)} color={BRAND.pink} />
                  <StatCard label="Apply Clicks" value={fmt(e.apply_clicks)} color={BRAND.orange} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <ChartCard title="Tracked Doors">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 4 }}>
                      <StatCard label="Total Tracked" value={fmt(td.total)} color={BRAND.yellow} />
                      <StatCard label="Unique Users" value={fmt(td.unique_users)} color={BRAND.green} />
                    </div>
                  </ChartCard>

                  <ChartCard title="Tracked Door Status">
                    {doorStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={doorStatusData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {doorStatusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 8 }}>
                        {[
                          { label: "Saved", value: td.saved, color: BRAND.yellow },
                          { label: "Applied", value: td.applied, color: BRAND.green },
                          { label: "Interviewing", value: td.interviewing, color: BRAND.purple },
                          { label: "Closed", value: td.closed, color: BRAND.faint },
                        ].map(s => (
                          <div key={s.label} style={{ textAlign: "center" }}>
                            <div style={{ color: s.color, fontSize: 20, fontWeight: 800 }}>{fmt(s.value)}</div>
                            <div style={{ color: BRAND.faint, fontSize: 11 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ChartCard>
                </div>

                <ChartCard title="Tracked Doors Funnel">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Saved → Doors Tracked", value: td.total, pct: "100%" },
                      { label: "Applied", value: Number(td.applied ?? 0) + Number(td.interviewing ?? 0) + Number(td.closed ?? 0), pct: pct(Number(td.applied ?? 0) + Number(td.interviewing ?? 0) + Number(td.closed ?? 0), td.total) },
                      { label: "Interviewing", value: Number(td.interviewing ?? 0) + Number(td.closed ?? 0), pct: pct(Number(td.interviewing ?? 0) + Number(td.closed ?? 0), td.total) },
                      { label: "Closed / Won", value: td.closed, pct: pct(td.closed, td.total) },
                    ].map(step => (
                      <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 220, color: BRAND.text, fontSize: 13 }}>{step.label}</div>
                        <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 4, height: 10, overflow: "hidden" }}>
                          <div style={{ background: BRAND.yellow, height: "100%", width: step.pct, borderRadius: 4 }} />
                        </div>
                        <div style={{ color: BRAND.yellow, fontSize: 13, fontWeight: 700, width: 60, textAlign: "right" }}>{fmt(step.value)}</div>
                        <div style={{ color: BRAND.faint, fontSize: 12, width: 50 }}>{step.pct}</div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            )}

            {/* ── NETWORK ── */}
            {activeTab === "network" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Follows & Network Graph" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Follows" value={fmt(f.total)} color={BRAND.yellow} />
                  <StatCard label="People Follows" value={fmt(f.people_follows)} color={BRAND.green} />
                  <StatCard label="Topic Follows" value={fmt(f.topic_follows)} color={BRAND.purple} />
                  <StatCard label="City Follows" value={fmt(f.city_follows)} color={BRAND.yellow} />
                  <StatCard label="New in Period" value={fmt(f.new_in_range)} color={BRAND.pink} />
                  <StatCard label="Follows/User" value={Number(u.total) ? (Number(f.total) / Number(u.total)).toFixed(1) : "—"} color={BRAND.yellow} />
                  <StatCard label="Referrals Sent" value={fmt(e.referrals_sent)} color={BRAND.pink} />
                  <StatCard label="Unique Referrers" value={fmt(ref.unique_referrers)} color={BRAND.yellow} />
                  <StatCard label="Total Referred" value={fmt(u.referred_users)} color={BRAND.green} />
                  <StatCard label="Referral CVR" value={pct(u.referred_users, e.referrals_sent)} sub="sent → joined" color={BRAND.green} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <ChartCard title="Follow Breakdown">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { name: "People", value: Number(f.people_follows ?? 0) },
                        { name: "Topics", value: Number(f.topic_follows ?? 0) },
                        { name: "Cities", value: Number(f.city_follows ?? 0) },
                        { name: "Orgs", value: Number(f.org_follows ?? 0) },
                      ]}>
                        <XAxis dataKey="name" tick={{ fill: BRAND.muted, fontSize: 13 }} />
                        <YAxis tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                        <Bar dataKey="value" fill={BRAND.yellow} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {followGrowth.length > 0 && (
                    <ChartCard title="Weekly Follow Growth (12 Weeks)">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={followGrowth.map((d: any) => ({ week: d.week?.slice(5, 10) ?? d.week, Follows: Number(d.new_follows ?? 0) }))}>
                          <defs>
                            <linearGradient id="followGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={BRAND.green} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={BRAND.green} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="week" tick={{ fill: BRAND.muted, fontSize: 11 }} />
                          <YAxis tick={{ fill: BRAND.muted, fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                          <Area type="monotone" dataKey="Follows" stroke={BRAND.green} fill="url(#followGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  )}
                </div>
              </div>
            )}

            {/* ── EVENTS / ROOMS ── */}
            {activeTab === "events" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Events & Rooms" sub="Published rooms and in-person/virtual gatherings" />
                <EventAttendeesTab />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Published" value={fmt(ev.total)} color={BRAND.yellow} />
                  <StatCard label="Upcoming" value={fmt(ev.upcoming)} color={BRAND.green} />
                  <StatCard label="Past" value={fmt(ev.past)} color={BRAND.faint} />
                  <StatCard label="In-Person" value={fmt(ev.in_person)} color={BRAND.pink} />
                  <StatCard label="Virtual" value={fmt(ev.virtual)} color={BRAND.yellow} />
                  <StatCard label="Hybrid" value={fmt(ev.hybrid)} color={BRAND.purple} />
                  <StatCard label="Premium Events" value={fmt(ev.premium)} color={BRAND.pink} />
                  <StatCard label="Featured" value={fmt(ev.featured)} color={BRAND.yellow} />
                  <StatCard label="RSVPs Recorded" value={fmt(e.rsvps)} color={BRAND.green} />
                </div>
                <ChartCard title="Event Format Breakdown">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { name: "In-Person", value: Number(ev.in_person ?? 0), fill: BRAND.pink },
                      { name: "Virtual", value: Number(ev.virtual ?? 0), fill: BRAND.yellow },
                      { name: "Hybrid", value: Number(ev.hybrid ?? 0), fill: BRAND.purple },
                    ]}>
                      <XAxis dataKey="name" tick={{ fill: BRAND.muted, fontSize: 13 }} />
                      <YAxis tick={{ fill: BRAND.muted, fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {[BRAND.pink, BRAND.yellow, BRAND.purple].map((c, i) => <Cell key={i} fill={c} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}

            {/* ── RSS FEED HEALTH ── */}
            {activeTab === "feeds" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="RSS Feed Health" sub={`${feeds.length} active sources — articles approved through content filter`} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Sources" value={fmt(feeds.length)} color={BRAND.yellow} />
                  <StatCard label="Active Today" value={fmt(feeds.filter((f: any) => Number(f.last_24h) > 0).length)} color={BRAND.green} />
                  <StatCard label="Total Approved" value={fmt(a.approved)} color={BRAND.yellow} />
                  <StatCard label="Auto-Rejected" value={fmt(a.rejected)} color={BRAND.faint} />
                </div>
                <ChartCard title="Feed Sources — Articles & Recency">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 500, overflowY: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 80px", gap: 8, padding: "6px 10px", borderBottom: `1px solid ${BRAND.border}` }}>
                      {["Source", "Total", "Today", "7d", "Last Seen"].map(h => (
                        <div key={h} style={{ color: BRAND.muted, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{h}</div>
                      ))}
                    </div>
                    {feeds.map((f: any) => {
                      const active = Number(f.last_24h) > 0;
                      return (
                        <div key={f.source_name} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 80px", gap: 8, padding: "8px 10px", background: "#1a1a1a", borderRadius: 8, alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: active ? BRAND.green : BRAND.faint, flexShrink: 0 }} />
                            <span style={{ color: BRAND.text, fontSize: 13 }}>{f.source_name}</span>
                          </div>
                          <span style={{ color: BRAND.yellow, fontSize: 13, fontWeight: 700 }}>{fmt(f.articles)}</span>
                          <span style={{ color: active ? BRAND.green : BRAND.faint, fontSize: 13 }}>{f.last_24h}</span>
                          <span style={{ color: BRAND.muted, fontSize: 13 }}>{f.last_7d}</span>
                          <span style={{ color: BRAND.faint, fontSize: 11 }}>{f.last_seen}</span>
                        </div>
                      );
                    })}
                  </div>
                </ChartCard>
              </div>
            )}

            {/* ── REFERRAL ENGINE ── */}
            {activeTab === "referrals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Referral Engine" sub="Code performance, top referrers, and conversion" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Referred Users" value={fmt(u.referred_users)} color={BRAND.yellow} />
                  <StatCard label="% via Referral" value={pct(u.referred_users, u.total)} color={BRAND.green} />
                  <StatCard label="Unique Referrers" value={fmt(ref.unique_referrers)} color={BRAND.yellow} />
                  <StatCard label="Total Sends" value={fmt(ref.total_referral_sends)} color={BRAND.purple} />
                  <StatCard label="Send → Join CVR" value={pct(u.referred_users, e.referrals_sent)} color={BRAND.green} />
                  <StatCard label="Referral Events" value={fmt(e.referrals_sent)} color={BRAND.pink} />
                </div>
                {topRef.length > 0 && (
                  <ChartCard title="Top Referrers by Joins Generated">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {topRef.map((r: any, i: number) => (
                        <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#1a1a1a", borderRadius: 10 }}>
                          <span style={{ color: i < 3 ? BRAND.yellow : BRAND.faint, fontSize: 13, fontWeight: 800, width: 24, flexShrink: 0 }}>#{i + 1}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: BRAND.text, fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{r.code}</div>
                            <div style={{ color: BRAND.muted, fontSize: 11 }}>referral code</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ color: BRAND.green, fontSize: 18, fontWeight: 800 }}>{r.referred_count}</div>
                            <div style={{ color: BRAND.faint, fontSize: 10 }}>joins</div>
                          </div>
                          <div style={{ width: 120, background: "#333", borderRadius: 4, height: 6, overflow: "hidden" }}>
                            <div style={{ background: BRAND.yellow, height: "100%", width: `${Math.min(100, (r.referred_count / (topRef[0]?.referred_count || 1)) * 100)}%`, borderRadius: 4 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )}
                {topRef.length === 0 && (
                  <ChartCard title="Top Referrers">
                    <p style={{ color: BRAND.faint, textAlign: "center", padding: "40px 0" }}>No referral data yet. Share those codes.</p>
                  </ChartCard>
                )}
              </div>
            )}

            {/* ── INBOX / NOTIFICATIONS ── */}
            {activeTab === "inbox" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Inbox & Notification Performance" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Delivered" value={fmt(nf.total)} color={BRAND.yellow} />
                  <StatCard label="Unread" value={fmt(nf.unread)} color={Number(nf.unread) > 0 ? BRAND.orange : BRAND.faint} />
                  <StatCard label="Read Rate" value={pct(Number(nf.total) - Number(nf.unread), nf.total)} color={BRAND.green} />
                  <StatCard label="Follow Notifs" value={fmt(nf.follow_notifs)} color={BRAND.yellow} />
                  <StatCard label="Opportunity" value={fmt(nf.opp_notifs)} color={BRAND.green} />
                  <StatCard label="Room Notifs" value={fmt(nf.room_notifs)} color={BRAND.purple} />
                  <StatCard label="Access Notifs" value={fmt(nf.access_notifs)} color={BRAND.pink} />
                </div>
                {notifTypes.length > 0 && (
                  <ChartCard title="Notification Breakdown by Type">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={notifTypes.map((n: any) => ({ name: n.type, Total: Number(n.total), Unread: Number(n.unread) }))}>
                        <XAxis dataKey="name" tick={{ fill: BRAND.muted, fontSize: 12 }} />
                        <YAxis tick={{ fill: BRAND.muted, fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#1a1a1a", border: `1px solid ${BRAND.border}`, borderRadius: 8 }} />
                        <Legend />
                        <Bar dataKey="Total" fill={BRAND.yellow} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Unread" fill={BRAND.orange} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
                <ChartCard title="Notification Trigger Map">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { trigger: "Follow (innovator)", fires: "Confirmation to follower" },
                      { trigger: "Follow (topic)", fires: "Topic confirmed to follower" },
                      { trigger: "Follow (city)", fires: "City confirmed to follower" },
                      { trigger: "Track a door", fires: "Door added to tracker" },
                      { trigger: "Door → Applied", fires: "Application logged milestone" },
                      { trigger: "Door → Interviewing", fires: "Interview stage milestone" },
                      { trigger: "Door → Closed", fires: "Door closed message" },
                      { trigger: "Event RSVP", fires: "RSVP confirmed + date/location" },
                      { trigger: "Subscription created", fires: "Welcome to [Tier]" },
                    ].map(row => (
                      <div key={row.trigger} style={{ display: "flex", gap: 14, padding: "10px 14px", background: "#1a1a1a", borderRadius: 8, alignItems: "center" }}>
                        <div style={{ flex: 1, color: BRAND.text, fontSize: 13 }}>{row.trigger}</div>
                        <div style={{ color: BRAND.muted, fontSize: 11 }}>→</div>
                        <div style={{ flex: 1, color: BRAND.green, fontSize: 12 }}>{row.fires}</div>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.green }} />
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            )}

            {/* ── DIRECTORY ── */}
            {activeTab === "directory" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Innovators Directory" sub="The Den's curated directory of Black, Brown, and Latino builders" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total in Directory" value={fmt(dir.total)} color={BRAND.yellow} />
                  <StatCard label="Verified" value={fmt(dir.verified)} sub={pct(dir.verified, dir.total)} color={BRAND.green} />
                  <StatCard label="Featured" value={fmt(dir.featured)} sub={pct(dir.featured, dir.total)} color={BRAND.pink} />
                  <StatCard label="Open to Connect" value={fmt(dir.open_to_connect)} sub={pct(dir.open_to_connect, dir.total)} color={BRAND.purple} />
                  <StatCard label="People Follows" value={fmt(f.people_follows)} color={BRAND.purple} />
                  <StatCard label="Follows/Person" value={Number(dir.total) > 0 ? (Number(f.people_follows) / Number(dir.total)).toFixed(1) : "—"} color={BRAND.yellow} />
                  <StatCard label="New Follows (period)" value={fmt(f.new_in_range)} color={BRAND.green} />
                </div>

                {topInnovators.length > 0 && (
                  <ChartCard title="Top Followed Innovators">
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {topInnovators.map((inn: any, i: number) => (
                        <div key={inn.name} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 14px", background: "#1a1a1a", borderRadius: 10 }}>
                          <span style={{ color: i < 3 ? BRAND.yellow : BRAND.faint, fontSize: 13, fontWeight: 800, width: 24, flexShrink: 0 }}>#{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: BRAND.text }}>
                              {inn.name}
                              {inn.is_verified && <span style={{ color: BRAND.green, fontSize: 10, marginLeft: 6, fontWeight: 700 }}>✓ Verified</span>}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: BRAND.muted }}>
                              {[inn.job_title, inn.company].filter(Boolean).join(" · ")}{inn.city ? ` · ${inn.city}` : ""}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ color: BRAND.green, fontSize: 18, fontWeight: 800 }}>{fmt(inn.follow_count)}</div>
                            <div style={{ color: BRAND.faint, fontSize: 10 }}>followers</div>
                          </div>
                          <div style={{ width: 100, background: "#333", borderRadius: 4, height: 5, overflow: "hidden" }}>
                            <div style={{ background: BRAND.green, height: "100%", width: `${Math.min(100, (inn.follow_count / (topInnovators[0]?.follow_count || 1)) * 100)}%`, borderRadius: 4 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )}

                <ChartCard title="Directory Health">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, paddingTop: 8 }}>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.green, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{pct(dir.verified, dir.total)}</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Verification Rate</div>
                    </div>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.yellow, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{pct(dir.featured, dir.total)}</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Featured Rate</div>
                    </div>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.purple, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{Number(dir.total) > 0 ? (Number(f.people_follows) / Number(dir.total)).toFixed(1) : "0"}</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Avg Follows / Person</div>
                    </div>
                  </div>
                </ChartCard>
              </div>
            )}

            {/* ── MODERATION ── */}
            {activeTab === "moderation" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Moderation & Trust Health" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Articles" value={fmt(a.total)} color={BRAND.yellow} />
                  <StatCard label="Auto-Approved" value={fmt(a.approved)} sub="by content filter" color={BRAND.green} />
                  <StatCard label="Auto-Rejected" value={fmt(a.rejected)} sub="by content filter" color={BRAND.faint} />
                  <StatCard label="Pending Review" value={fmt(a.pending)} sub="manual submissions" color={Number(a.pending) > 0 ? BRAND.orange : BRAND.faint} />
                  <StatCard label="Needs Edits" value={fmt(a.needs_edits)} color={Number(a.needs_edits) > 0 ? BRAND.orange : BRAND.faint} />
                  <StatCard label="Open Reports" value={fmt(rp.open)} color={Number(rp.open) > 0 ? BRAND.pink : BRAND.faint} />
                  <StatCard label="Reviewed Reports" value={fmt(rp.reviewed)} color={BRAND.green} />
                  <StatCard label="Total Reports" value={fmt(rp.total)} color={BRAND.yellow} />
                </div>

                <ChartCard title="Content Filter Performance">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, paddingTop: 8 }}>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.green, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{pct(a.approved, Number(a.approved) + Number(a.rejected))}</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Auto-Approval Rate</div>
                    </div>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.pink, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{pct(a.rejected, Number(a.approved) + Number(a.rejected))}</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Auto-Rejection Rate</div>
                    </div>
                    <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: Number(rp.open) > 0 ? BRAND.orange : BRAND.green, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{fmt(rp.open)}</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Unresolved Reports</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, padding: "12px 16px", background: "#1a1a1a", borderRadius: 10 }}>
                    <p style={{ color: BRAND.muted, fontSize: 12, margin: "0 0 4px" }}>Moderation Queue Note</p>
                    <p style={{ color: BRAND.text, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                      RSS-ingested content is auto-reviewed by the platform's content filter. Only manually submitted content (user posts, opportunity submissions) enters the human moderation queue below.
                    </p>
                  </div>
                </ChartCard>

                <SectionHeader title="Pending Submissions Queue" sub="Review and approve or reject user-submitted opportunities and marketplace listings" />
                <PendingModerationQueue />
              </div>
            )}

            {/* ── SPONSOR PERFORMANCE ── */}
            {activeTab === "sponsors" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Sponsor Performance" sub="Sponsored content reach, CTR, and campaign health" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Active Campaigns" value={fmt(sponsorStats.active_campaigns ?? a.sponsored ?? 0)} color={BRAND.yellow} />
                  <StatCard label="Sponsored Articles" value={fmt(a.sponsored ?? 0)} color={BRAND.purple} />
                  <StatCard label="Est. Impressions" value={fmt(sponsorStats.total_impressions ?? 0)} color={BRAND.green} />
                  <StatCard label="Est. Clicks" value={fmt(sponsorStats.total_clicks ?? 0)} color={BRAND.pink} />
                  <StatCard label="Avg CTR" value={pct(sponsorStats.total_clicks ?? 0, sponsorStats.total_impressions ?? 1)} color={BRAND.orange} />
                  <StatCard label="Sponsor Revenue" value={`$${fmt(sponsorStats.revenue_usd ?? 0)}`} color={BRAND.green} />
                </div>
                {sponsoredArticles.length > 0 ? (
                  <ChartCard title="Active Sponsored Content">
                    <AdminTable headers={["TITLE", "SPONSOR", "TOPIC", "PUBLISHED", "STATUS"]}>
                      {sponsoredArticles.map((s: any) => (
                        <TableRow key={s.id} cells={[s.title, s.sourceName, s.topic, timeAgo(s.createdAt), s.status]} />
                      ))}
                    </AdminTable>
                  </ChartCard>
                ) : (
                  <ChartCard title="Active Sponsored Content">
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>📢</div>
                      <p style={{ color: BRAND.muted, fontSize: 13 }}>No active sponsored content found.</p>
                      <p style={{ color: BRAND.faint, fontSize: 11, marginTop: 6 }}>Sponsored articles appear when articles have <code>is_sponsored = true</code>.</p>
                    </div>
                  </ChartCard>
                )}
                <ChartCard title="Revenue Breakdown">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, paddingTop: 8 }}>
                    <div style={{ background: "#1a1500", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.yellow, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Billboard</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Hero placement</div>
                    </div>
                    <div style={{ background: "#0a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.green, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Display</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>Mid-feed rectangle</div>
                    </div>
                    <div style={{ background: "#1a0a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ color: BRAND.purple, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Native</div>
                      <div style={{ color: BRAND.muted, fontSize: 12 }}>In-feed card</div>
                    </div>
                  </div>
                  <p style={{ color: BRAND.faint, fontSize: 11, marginTop: 14 }}>
                    Full campaign CPM tracking requires sponsor impression webhook integration. Contact partnerships@theinnovatorsden.net to onboard campaigns.
                  </p>
                </ChartCard>

                {/* ── LIVE ROOM SPONSORS ── */}
                <ChartCard title="Live Room Sponsor Management">
                  {tabLoading["circles"] ? (
                    <div style={{ padding: 32, textAlign: "center", color: BRAND.muted }}>Loading rooms…</div>
                  ) : (tabData["circles"]?.circles ?? []).length === 0 ? (
                    <div style={{ padding: 32, textAlign: "center", color: BRAND.muted }}>No rooms found.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {(tabData["circles"]?.circles ?? []).map((room: any) => (
                        <RoomSponsorRow
                          key={room.id}
                          room={room}
                          onSave={(sponsorData) => adminAction(`circles/${room.id}/sponsor`, "PATCH", sponsorData, "circles")}
                        />
                      ))}
                    </div>
                  )}
                  {tabMsg["circles"] && (
                    <p style={{ color: tabMsg["circles"]?.startsWith("✓") ? BRAND.green : BRAND.pink, fontSize: 12, marginTop: 8 }}>
                      {tabMsg["circles"]}
                    </p>
                  )}
                </ChartCard>
              </div>
            )}

            {/* ── NOTIFICATIONS HEALTH ── */}
            {activeTab === "notif_health" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="Notifications Health" sub="Delivery rates, read rates, and channel breakdown" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Total Delivered" value={fmt(nf.total)} color={BRAND.yellow} />
                  <StatCard label="Unread" value={fmt(nf.unread)} color={Number(nf.unread) > 0 ? BRAND.orange : BRAND.faint} />
                  <StatCard label="Read Rate" value={pct(Number(nf.total) - Number(nf.unread), nf.total)} color={BRAND.green} />
                  <StatCard label="Follow Notifs" value={fmt(nf.follow_notifs)} color={BRAND.purple} />
                  <StatCard label="Intro Notifs" value={fmt(nf.intro_notifs)} color={BRAND.pink} />
                  <StatCard label="Push Broadcasts" value={fmt(nf.broadcast_notifs ?? 0)} color={BRAND.yellow} />
                </div>
                {notifTypes.length > 0 ? (
                  <ChartCard title="Notification Type Breakdown">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {notifTypes.map((n: any) => {
                        const total = notifTypes.reduce((s: number, x: any) => s + Number(x.count), 0);
                        const pctVal = total > 0 ? Math.round((Number(n.count) / total) * 100) : 0;
                        return (
                          <div key={n.type} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#1a1a1a", borderRadius: 10 }}>
                            <div style={{ flex: 1, color: BRAND.text, fontSize: 13, fontWeight: 600 }}>{n.type}</div>
                            <div style={{ width: 160, background: "#333", borderRadius: 4, height: 6, overflow: "hidden" }}>
                              <div style={{ background: BRAND.yellow, height: "100%", width: `${pctVal}%`, borderRadius: 4 }} />
                            </div>
                            <div style={{ color: BRAND.yellow, fontSize: 13, fontWeight: 700, width: 40, textAlign: "right" }}>{fmt(n.count)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </ChartCard>
                ) : (
                  <ChartCard title="Notification Type Breakdown">
                    <p style={{ color: BRAND.faint, textAlign: "center", padding: "40px 0" }}>No notification type data available yet.</p>
                  </ChartCard>
                )}
                <ChartCard title="Delivery Health Benchmarks">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, paddingTop: 8 }}>
                    {[
                      { label: "Target Read Rate", value: "60%", color: BRAND.green, sub: "industry: 45%" },
                      { label: "Target Unsubscribe", value: "<2%", color: BRAND.yellow, sub: "keep churn low" },
                      { label: "Target Broadcast CTR", value: "8%+", color: BRAND.purple, sub: "for push" },
                    ].map(b => (
                      <div key={b.label} style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, textAlign: "center" }}>
                        <div style={{ color: b.color, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{b.value}</div>
                        <div style={{ color: BRAND.text, fontSize: 12, fontWeight: 700 }}>{b.label}</div>
                        <div style={{ color: BRAND.faint, fontSize: 11, marginTop: 2 }}>{b.sub}</div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            )}

            {/* ── CITY BREAKDOWN ── */}
            {activeTab === "cities" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <SectionHeader title="City Breakdown" sub="Geographic distribution of your community" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <StatCard label="Cities Represented" value={fmt(cityDist.length)} color={BRAND.yellow} />
                  <StatCard label="Top City Users" value={fmt(cityDist[0]?.users ?? 0)} sub={cityDist[0]?.city ?? "—"} color={BRAND.green} />
                  <StatCard label="Users w/ City Set" value={fmt(cityDist.reduce((s: number, c: any) => s + Number(c.users), 0))} color={BRAND.purple} />
                </div>
                {cityDist.length > 0 ? (
                  <ChartCard title="Top Cities by Member Count">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {cityDist.slice(0, 20).map((c: any, i: number) => {
                        const max = cityDist[0]?.users ?? 1;
                        const pctVal = Math.round((Number(c.users) / Number(max)) * 100);
                        return (
                          <div key={c.city} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#1a1a1a", borderRadius: 10 }}>
                            <span style={{ color: i < 3 ? BRAND.yellow : BRAND.faint, fontSize: 13, fontWeight: 800, width: 24, flexShrink: 0 }}>#{i + 1}</span>
                            <div style={{ flex: 1, color: BRAND.text, fontSize: 13, fontWeight: 600 }}>{c.city}</div>
                            <div style={{ width: 180, background: "#333", borderRadius: 4, height: 6, overflow: "hidden" }}>
                              <div style={{ background: i === 0 ? BRAND.yellow : i < 3 ? BRAND.green : BRAND.purple, height: "100%", width: `${pctVal}%`, borderRadius: 4 }} />
                            </div>
                            <div style={{ color: BRAND.yellow, fontSize: 13, fontWeight: 700, width: 40, textAlign: "right" }}>{fmt(c.users)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </ChartCard>
                ) : (
                  <ChartCard title="Top Cities by Member Count">
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🌍</div>
                      <p style={{ color: BRAND.muted, fontSize: 13 }}>No city data yet.</p>
                      <p style={{ color: BRAND.faint, fontSize: 11, marginTop: 6 }}>Members populate city when they complete their profile.</p>
                    </div>
                  </ChartCard>
                )}
                <ChartCard title="Regional Presence">
                  <p style={{ color: BRAND.faint, fontSize: 12, lineHeight: 1.7 }}>
                    City data is self-reported by members via their profile settings. Encourage profile completion to improve geographic insights.
                    Future: heat-map visualization and event targeting by metro area.
                  </p>
                </ChartCard>
              </div>
            )}
          </>
        )}

        {/* ── WHAT'S MOVING CONTROLS ── */}
        {activeTab === "whats_moving" && (
          <WhatsMovingAdminTab token={sessionStorage.getItem(TOKEN_KEY) ?? ""} />
        )}

        {/* ── MANAGEMENT TABS (lazy-loaded) ── */}
        {MANAGEMENT_TABS.includes(activeTab) && (() => {
          const tl = tabLoading[activeTab];
          const td2 = tabData[activeTab];
          const msg = tabMsg[activeTab];
          if (tl) return <div style={{ textAlign: "center", padding: 80, color: BRAND.muted }}>Loading…</div>;
          if (!td2) return <div style={{ textAlign: "center", padding: 80, color: BRAND.muted }}>No data. <button onClick={() => loadTab(activeTab, true)} style={{ color: BRAND.yellow, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Load</button></div>;
          const sharedProps = { data: td2, msg: msg ?? null, onAction: adminAction };
          if (activeTab === "concierge")   return <ConciergeTab   {...sharedProps} />;
          if (activeTab === "marketplace") return <MarketplaceTab {...sharedProps} />;
          if (activeTab === "partners")    return <PartnersTab    {...sharedProps} />;
          if (activeTab === "reputation")  return <ReputationTab  {...sharedProps} />;
          if (activeTab === "governance")  return <GovernanceTab  {...sharedProps} />;
          if (activeTab === "intelligence") return <IntelligenceTab {...sharedProps} />;
          return null;
        })()}
      </div>
    </div>
  );
}

// ───────────────────────────── Page ─────────────────────────────
export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    // A JWT token in sessionStorage means the user already authenticated this session
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) setUnlocked(true);
  }, []);
  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />;
  return <Dashboard />;
}
