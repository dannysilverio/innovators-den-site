import { useLocation, Link } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/governance", label: "Governance" },
  { href: "/circles", label: "Circles" },
  { href: "/innovators", label: "Directory" },
  { href: "/cities", label: "Cities" },
  { href: "/collaborate", label: "Collaborate" },
  { href: "/partners", label: "Partners" },
  { href: "/briefing", label: "Briefing" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/membership", label: "Membership" },
];

function NotificationBell({ userId }: { userId: string }) {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/inbox?deviceId=${userId}`);
      const d = await r.json();
      setNotifications(d.notifications ?? []);
      setUnread(d.unreadCount ?? 0);
    } catch { }
  }, [userId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/inbox/read-all`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deviceId: userId }) });
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`${API_BASE}/inbox/${id}/read`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deviceId: userId }) });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { }
  };

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 8px", color: "rgba(255,255,255,0.6)", position: "relative", lineHeight: 1 }}
        aria-label="Notifications"
      >
        <span style={{ fontSize: 18 }}>🔔</span>
        {unread > 0 && (
          <span style={{ position: "absolute", top: 2, right: 2, background: "#FF4D7E", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 10, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 340, background: "#111", border: "1px solid #222", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.8)", overflow: "hidden", zIndex: 200 }}>
          <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1a1a1a" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ marginLeft: "auto", background: "none", border: "none", color: "#FFE600", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "2px 6px" }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p style={{ color: "#555", fontSize: 13, textAlign: "center", padding: "32px 16px", margin: 0 }}>No notifications yet</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    if (n.actionUrl) setLocation(n.actionUrl);
                    setOpen(false);
                  }}
                  style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", cursor: n.actionUrl ? "pointer" : "default", background: n.read ? "transparent" : "#FFE60008", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                  onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : "#FFE60008")}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFE600", marginTop: 5, flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>{n.title}</p>
                      {n.body && <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888", lineHeight: 1.4 }}>{n.body}</p>}
                      <p style={{ margin: 0, fontSize: 11, color: "#444" }}>{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WebNav() {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(o => !o);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        setLocation(`/search?q=${encodeURIComponent(q.trim())}`);
        setSearchOpen(false);
        setSearchQuery("");
      }, 600);
    }
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(0, 0, 0, 0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 20px",
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          textDecoration: "none", flexShrink: 0,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <img
            src="/web/logo.jpeg"
            alt="The Innovators Den"
            style={{
              height: 44, width: 44,
              objectFit: "cover",
              objectPosition: "center 20%",
              mixBlendMode: "screen",
              borderRadius: 6,
            }}
          />
          <span style={{ fontWeight: 800, fontSize: 13, color: "#FFE600", letterSpacing: 0.5, lineHeight: 1.15, whiteSpace: "nowrap" }}>
            THE<br />INNOVATORS DEN
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{
          display: "flex", gap: 2, alignItems: "center",
          flex: 1, overflow: "hidden",
        }} className="desktop-nav">
          {NAV_LINKS.map(link => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  color: isActive ? "#FFE600" : "rgba(255,255,255,0.65)",
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  padding: "6px 9px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Search + Auth + App download */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }} className="desktop-actions">
          {/* Search icon / inline input */}
          {searchOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #333", borderRadius: 8, padding: "4px 10px" }}>
              <span style={{ color: "#666", fontSize: 14 }}>⌕</span>
              <input
                ref={searchInputRef}
                autoFocus
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) { setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(""); } if (e.key === "Escape") setSearchOpen(false); }}
                placeholder="Search…"
                style={{ background: "none", border: "none", color: "#f0f0f0", fontSize: 13, outline: "none", width: 160, fontFamily: "system-ui, sans-serif" }}
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>
            </div>
          ) : (
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              title="Search (⌘K)"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 8px", color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1 }}
            >
              ⌕
            </button>
          )}

          {user ? (
            <>
              <NotificationBell userId={user.id} />
              {user.isPro && (
                <Link href="/submit"
                  style={{ textDecoration: "none", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,230,0,0.3)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,230,0,0.7)"; (e.currentTarget as HTMLElement).style.color = "#FFE600"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,230,0,0.3)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
                  title="Submit your own Signal for publication"
                >
                  ✦ Write
                </Link>
              )}
              <Link href="/profile"
                style={{ textDecoration: "none", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, padding: "6px 10px", borderRadius: 6 }}>
                {user.displayName.split(" ")[0]}
              </Link>
              {user && (
                <Link href="/saved" style={{ textDecoration: "none", fontSize: 12, color: "rgba(255,255,255,0.5)", padding: "6px 6px" }} title="Saved articles">
                  🔖
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/sign-in"
                style={{ textDecoration: "none", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, padding: "6px 10px", borderRadius: 6 }}>
                Sign In
              </Link>
            </>
          )}
          <a
            href="https://apps.apple.com/app/the-innovators-den"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#FFE600", color: "#000000",
              fontWeight: 700, fontSize: 12, padding: "7px 14px",
              borderRadius: 7, textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Get the App
          </a>
        </div>

        {/* Hamburger for mobile */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 6, color: "#ffffff", marginLeft: "auto",
            display: "none",
          }}
          className="hamburger"
          aria-label="Toggle menu"
        >
          <span style={{ fontSize: 20 }}>{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: "#0D0D0D", borderTop: "1px solid #1a1a1a",
          padding: "12px 20px 20px",
        }}>
          <div style={{ padding: "8px 0 12px", borderBottom: "1px solid #1a1a1a", marginBottom: 8 }}>
            <input
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) { setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setMenuOpen(false); setSearchQuery(""); } }}
              placeholder="Search the Den…"
              style={{ width: "100%", boxSizing: "border-box", background: "#111", border: "1px solid #222", borderRadius: 8, color: "#f0f0f0", fontSize: 14, padding: "10px 14px", outline: "none", fontFamily: "system-ui, sans-serif" }}
            />
          </div>
          {NAV_LINKS.map(link => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block", padding: "12px 0",
                  textDecoration: "none",
                  color: isActive ? "#FFE600" : "rgba(255,255,255,0.7)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 15,
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {user ? (
              <>
                {user.isPro && (
                  <Link href="/submit" onClick={() => setMenuOpen(false)}
                    style={{ display: "block", padding: "12px 20px", background: "#FFE60010", border: "1px solid #FFE60030", color: "#FFE600", fontWeight: 700, fontSize: 14, borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
                    ✦ Submit a Signal
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "12px 20px", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
                  My Profile
                </Link>
                <Link href="/saved" onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "12px 20px", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
                  Saved Articles 🔖
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ display: "block", width: "100%", padding: "12px 20px", background: "none", border: "1px solid #2a2a2a", color: "#888", fontWeight: 600, fontSize: 14, borderRadius: 8, cursor: "pointer", textAlign: "center" }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "12px 20px", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#fff", fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
                  Sign In
                </Link>
                <Link href="/sign-up" onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "12px 20px", background: "#FFE600", color: "#000", fontWeight: 700, fontSize: 14, borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
                  Join Free
                </Link>
              </>
            )}
            <a href="https://apps.apple.com/app/the-innovators-den" target="_blank" rel="noopener noreferrer"
              style={{ display: "block", padding: "12px 20px", background: "#FFE600", color: "#000000", fontWeight: 700, fontSize: 14, borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
              Download the App
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
