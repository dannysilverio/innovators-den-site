import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import { timeAgo } from "@/lib/api";

const API_BASE = "/api";
const base = import.meta.env.BASE_URL;

const CITIES = [
  { id: "NYC", label: "New York",      emoji: "🗽", state: "NY", aliases: ["new york", "nyc", "brooklyn", "harlem", "bronx", "queens", "manhattan"] },
  { id: "ATL", label: "Atlanta",       emoji: "🍑", state: "GA", aliases: ["atlanta", "atl", "decatur"] },
  { id: "LA",  label: "Los Angeles",   emoji: "🌴", state: "CA", aliases: ["los angeles", "la", "compton", "inglewood", "long beach"] },
  { id: "CHI", label: "Chicago",       emoji: "🏙️", state: "IL", aliases: ["chicago", "chi", "oak park"] },
  { id: "HOU", label: "Houston",       emoji: "🚀", state: "TX", aliases: ["houston", "hou", "sugar land"] },
  { id: "MIA", label: "Miami",         emoji: "🌊", state: "FL", aliases: ["miami", "mia", "fort lauderdale", "coral gables"] },
  { id: "DC",  label: "Washington DC", emoji: "🏛️", state: "DC", aliases: ["washington", "dc", "dmv", "alexandria", "bethesda"] },
];

type Tab = "events" | "opportunities" | "innovators";

function matchesCity(text: string, city: typeof CITIES[number]): boolean {
  const lower = (text ?? "").toLowerCase();
  return city.aliases.some(a => lower.includes(a)) || lower.includes(city.state.toLowerCase());
}

function daysLeft(isoDate: string): number {
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86400000));
}

export default function Cities() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [events, setEvents] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [innovators, setInnovators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/events`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_BASE}/opportunities`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_BASE}/innovators`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([evs, opps, inns]) => {
      setEvents(Array.isArray(evs) ? evs : evs.events ?? []);
      setOpportunities(Array.isArray(opps) ? opps : opps.opportunities ?? []);
      setInnovators(Array.isArray(inns) ? inns : inns.innovators ?? []);
      setLoading(false);
    });
  }, []);

  const cityEvents = useMemo(
    () => events.filter(e => matchesCity((e.location ?? "") + " " + (e.title ?? ""), selectedCity)),
    [events, selectedCity],
  );
  const cityOpps = useMemo(
    () => opportunities.filter(o => matchesCity((o.location ?? "") + " " + (o.title ?? ""), selectedCity)),
    [opportunities, selectedCity],
  );
  const cityInnovators = useMemo(
    () => innovators.filter(i => matchesCity((i.location ?? "") + " " + (i.city ?? ""), selectedCity)),
    [innovators, selectedCity],
  );

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "events",      label: "Events",      count: cityEvents.length },
    { key: "opportunities", label: "Doors",     count: cityOpps.length },
    { key: "innovators",  label: "Innovators",  count: cityInnovators.length },
  ];

  const avatarColors = ["#FFE600", "#FF4D7E", "#3B82F6", "#10B981", "#8B5CF6"];

  return (
    <>
      <Seo
        title={`${selectedCity.label} — City Hubs | The Innovators Den`}
        description={`Discover innovators, events, and opportunities in ${selectedCity.label}. The Innovators Den city hub.`}
        canonical="/cities"
      />
      <div className="min-h-screen bg-black text-white">

        {/* Header */}
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 rounded-full bg-[#FFE600]" />
            <h1 className="text-3xl font-black tracking-tight">City Hubs</h1>
          </div>
          <p className="text-white/40 text-sm">Find innovators, events, and opportunities in your city.</p>
        </div>

        {/* City selector */}
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {CITIES.map(city => (
              <button
                key={city.id}
                onClick={() => { setSelectedCity(city); setActiveTab("events"); }}
                style={{
                  flexShrink: 0,
                  padding: "10px 18px",
                  borderRadius: 100,
                  border: selectedCity.id === city.id ? "1.5px solid #FFE600" : "1px solid rgba(255,255,255,0.1)",
                  background: selectedCity.id === city.id ? "#FFE60012" : "transparent",
                  color: selectedCity.id === city.id ? "#FFE600" : "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 16 }}>{city.emoji}</span>
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {/* City hero */}
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div
            className="rounded-3xl p-8 text-center"
            style={{ background: "linear-gradient(135deg, #0d0d00 0%, #0a0a0a 100%)", border: "1px solid rgba(255,230,0,0.15)" }}
          >
            <div style={{ fontSize: 56, marginBottom: 10 }}>{selectedCity.emoji}</div>
            <h2 className="text-4xl font-black tracking-tight mb-2">{selectedCity.label}</h2>
            {loading ? (
              <p className="text-white/30 text-sm">Loading…</p>
            ) : (
              <p className="text-white/40 text-sm">
                {cityEvents.length} events · {cityOpps.length} doors · {cityInnovators.length} innovators
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 w-fit">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: activeTab === tab.key ? "#FFE600" : "transparent",
                  color: activeTab === tab.key ? "#000" : "rgba(255,255,255,0.5)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: activeTab === tab.key ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)",
                    color: activeTab === tab.key ? "#000" : "rgba(255,255,255,0.4)",
                    borderRadius: 100,
                    padding: "1px 6px",
                    minWidth: 18,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-5xl mx-auto px-4 pb-24">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Events tab */}
              {activeTab === "events" && (
                cityEvents.length === 0 ? (
                  <Empty label="events" city={selectedCity.label} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cityEvents.map(ev => (
                      <Link key={ev.id} href={`${base}events/${ev.id}`}>
                        <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:border-[#FFE600]/30 hover:bg-[#FFE600]/[0.03] transition-all cursor-pointer group">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#FFE600] bg-[#FFE600]/10 px-2 py-0.5 rounded-full">{ev.type ?? "Event"}</span>
                            {ev.eventDate && (
                              <span className="text-[10px] text-white/30 flex-shrink-0">{new Date(ev.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#FFE600] transition-colors line-clamp-2 mb-2">{ev.title}</h3>
                          <p className="text-white/40 text-xs">{ev.organizer ?? ev.sourceName ?? ""}{ev.location ? ` · ${ev.location}` : ""}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              )}

              {/* Doors tab */}
              {activeTab === "opportunities" && (
                cityOpps.length === 0 ? (
                  <Empty label="opportunities" city={selectedCity.label} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cityOpps.map(opp => (
                      <Link key={opp.id} href={`${base}opportunities/${opp.id}`}>
                        <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:border-[#FF4D7E]/30 hover:bg-[#FF4D7E]/[0.03] transition-all cursor-pointer group">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4D7E] bg-[#FF4D7E]/10 px-2 py-0.5 rounded-full">{opp.type ?? "Opportunity"}</span>
                            {opp.deadline && (
                              <span className={`text-[10px] font-bold flex-shrink-0 ${daysLeft(opp.deadline) <= 7 ? "text-[#FF4D7E]" : "text-white/30"}`}>
                                {daysLeft(opp.deadline)}d left
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#FF4D7E] transition-colors line-clamp-2 mb-2">{opp.title}</h3>
                          <p className="text-white/40 text-xs">{opp.organization ?? ""}{opp.amount ? ` · ${opp.amount}` : ""}{opp.location ? ` · ${opp.location}` : ""}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              )}

              {/* Innovators tab */}
              {activeTab === "innovators" && (
                cityInnovators.length === 0 ? (
                  <Empty label="innovators" city={selectedCity.label} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cityInnovators.map(inn => {
                      const initials = inn.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";
                      const color = avatarColors[inn.name?.charCodeAt(0) % avatarColors.length ?? 0];
                      return (
                        <Link key={inn.id} href={`${base}innovators/${inn.id}`}>
                          <div className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:border-[#10B981]/30 hover:bg-[#10B981]/[0.03] transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black flex-shrink-0" style={{ background: color + "22", color }}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors truncate">{inn.name}</p>
                                {inn.isVerified && <span className="text-[#FFE600] text-xs flex-shrink-0">✓</span>}
                                {inn.isFeatured && <span className="text-[9px] font-black text-[#FFE600] bg-[#FFE600]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">✦</span>}
                              </div>
                              <p className="text-white/40 text-xs truncate">{inn.title}</p>
                              {inn.location && <p className="text-white/25 text-xs mt-0.5 truncate">📍 {inn.location}</p>}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Empty({ label, city }: { label: string; city: string }) {
  return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">🏙️</p>
      <p className="text-white/50 text-sm">No {label} listed for {city} yet.</p>
      <p className="text-white/25 text-xs mt-2">Check back as the community grows.</p>
    </div>
  );
}
