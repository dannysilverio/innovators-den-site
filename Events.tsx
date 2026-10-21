import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { FeaturedRoomCard, type Tier } from "@/components/AdUnit";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";

interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  location: string;
  address: string | null;
  city: string | null;
  eventDate: string;
  eventEndDate: string | null;
  type: string;
  category: string;
  rsvpUrl: string | null;
  price: string;
  isPremium: boolean;
  isFeatured: boolean;
  organizer: string | null;
  tags: string[];
}

const TYPE_COLORS: Record<string, string> = {
  "in-person": "#10B981",
  virtual: "#3B82F6",
  hybrid: "#8B5CF6",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function EventCard({ event }: { event: Event }) {
  const typeColor = TYPE_COLORS[event.type] ?? "#FFE600";
  const [, setLocation] = useLocation();

  return (
    <article
      onClick={() => setLocation(`/events/${event.id}`)}
      style={{
        background: "#111111",
        border: "1px solid #222222",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#333333")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#222222")}
    >
      {event.imageUrl && (
        <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
          <img
            src={event.imageUrl}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {event.isFeatured && (
            <span style={{
              position: "absolute", top: 12, left: 12,
              background: "#FFE600", color: "#000", fontSize: 10,
              fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: 1,
            }}>FEATURED</span>
          )}
        </div>
      )}
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{
            background: typeColor + "20", color: typeColor,
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: 1,
            textTransform: "uppercase",
          }}>{event.type}</span>
          <span style={{
            background: "#1a1a1a", color: "#888",
            fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
          }}>{event.category}</span>
          {event.price !== "Free" && (
            <span style={{ marginLeft: "auto", color: "#FFE600", fontSize: 13, fontWeight: 700 }}>{event.price}</span>
          )}
          {event.price === "Free" && (
            <span style={{ marginLeft: "auto", color: "#10B981", fontSize: 13, fontWeight: 700 }}>Free</span>
          )}
        </div>

        <h3 style={{ color: "#ffffff", fontSize: 17, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3 }}>
          {event.title}
        </h3>

        <p style={{ color: "#888888", fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>
          {event.description.slice(0, 120)}{event.description.length > 120 ? "…" : ""}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>📅</span>
            <span style={{ color: "#cccccc", fontSize: 13 }}>
              {formatDate(event.eventDate)} · {formatTime(event.eventDate)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span style={{ color: "#cccccc", fontSize: 13 }}>{event.location}</span>
          </div>
          {event.organizer && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>🏢</span>
              <span style={{ color: "#888888", fontSize: 12 }}>by {event.organizer}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
          {event.rsvpUrl && (
            <a
              href={event.rsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                flex: 1, display: "block", textAlign: "center",
                background: "#FFE600", color: "#000000",
                fontWeight: 700, fontSize: 14, padding: "10px",
                borderRadius: 8, textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              RSVP →
            </a>
          )}
          <button
            onClick={e => { e.stopPropagation(); setLocation(`/events/${event.id}`); }}
            style={{ padding: "10px 14px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#888", fontSize: 12, cursor: "pointer" }}>
            Details
          </button>
        </div>
      </div>
    </article>
  );
}

// Fallback sample events when API has none
const SAMPLE_EVENTS: Event[] = [
  {
    id: "1", title: "Black Founders Summit 2026", description: "A premier gathering of Black entrepreneurs, investors, and innovators across industries. Network, learn, and build connections that last.",
    imageUrl: null, location: "The Shed, New York, NY", address: null, city: "New York",
    eventDate: new Date(Date.now() + 17 * 86400000).toISOString(), eventEndDate: null,
    type: "in-person", category: "Innovation", rsvpUrl: "#", price: "Free",
    isPremium: false, isFeatured: true, organizer: "New Voices Foundation", tags: ["founders", "networking"],
  },
  {
    id: "2", title: "AI & The Future of Black Media", description: "Exploring how artificial intelligence is reshaping media production, distribution, and ownership for Black creators and media companies.",
    imageUrl: null, location: "Online (Zoom)", address: null, city: null,
    eventDate: new Date(Date.now() + 31 * 86400000).toISOString(), eventEndDate: null,
    type: "virtual", category: "Innovation", rsvpUrl: "#", price: "Free",
    isPremium: false, isFeatured: false, organizer: "Color of Change + Reboot", tags: ["AI", "media"],
  },
  {
    id: "3", title: "Creative Economy Networking Night", description: "Monthly mixer for creators, freelancers, and entrepreneurs in the creative economy. Connect, collaborate, grow.",
    imageUrl: null, location: "Culture Lab, Brooklyn, NY", address: null, city: "Brooklyn",
    eventDate: new Date(Date.now() + 24 * 86400000).toISOString(), eventEndDate: null,
    type: "in-person", category: "Culture", rsvpUrl: "#", price: "$15",
    isPremium: false, isFeatured: false, organizer: "The Innovators Den", tags: ["networking", "creative"],
  },
  {
    id: "4", title: "Bronx Music & Art Fair 2026", description: "A two-day celebration of Bronx-born music, visual art, and street culture. Live performances, gallery showcases, and artist pop-ups.",
    imageUrl: null, location: "Bronx Terminal Market Plaza, Bronx, NY", address: null, city: "Bronx",
    eventDate: new Date(Date.now() + 40 * 86400000).toISOString(), eventEndDate: null,
    type: "in-person", category: "Art & Music", rsvpUrl: "#", price: "$10",
    isPremium: false, isFeatured: false, organizer: "BronxArtSpace", tags: ["music", "art", "culture"],
  },
  {
    id: "5", title: "Women of Color in Business Panel", description: "A hybrid forum spotlighting WOC executives, founders, and investors sharing real talk on funding, scaling, and navigating corporate America.",
    imageUrl: null, location: "Online + 1 World Trade, NYC", address: null, city: "New York",
    eventDate: new Date(Date.now() + 47 * 86400000).toISOString(), eventEndDate: null,
    type: "hybrid", category: "Business Growth", rsvpUrl: "#", price: "Free",
    isPremium: false, isFeatured: false, organizer: "She Did That", tags: ["women", "business", "leadership"],
  },
  {
    id: "6", title: "The Den Inner Circle Kickoff", description: "Exclusive launch gathering for Den Inner Circle members. Private networking, product demos, and a fireside chat with TID founders. Inner Circle members only.",
    imageUrl: null, location: "Dream Hotel Rooftop, NYC", address: null, city: "New York",
    eventDate: new Date(Date.now() + 52 * 86400000).toISOString(), eventEndDate: null,
    type: "in-person", category: "Innovation", rsvpUrl: "#", price: "Included with Inner Circle",
    isPremium: true, isFeatured: true, organizer: "The Innovators Den", tags: ["inner circle", "exclusive", "networking"],
  },
  {
    id: "7", title: "HBCU Entrepreneurship Summit", description: "A national summit bringing together HBCU students, alumni, and mentors to pitch, connect, and access funding from Black-led VCs and angels.",
    imageUrl: null, location: "Morehouse College, Atlanta, GA", address: null, city: "Atlanta",
    eventDate: new Date(Date.now() + 60 * 86400000).toISOString(), eventEndDate: null,
    type: "in-person", category: "Innovation", rsvpUrl: "#", price: "Free",
    isPremium: false, isFeatured: false, organizer: "HBCU Founders Network", tags: ["HBCU", "startups", "VC"],
  },
  {
    id: "8", title: "Black in Fashion Week: Business Edition", description: "Three days of panels, masterclasses, and brand showcases celebrating Black designers, stylists, and fashion entrepreneurs building for the future.",
    imageUrl: null, location: "Spring Studios, New York, NY", address: null, city: "New York",
    eventDate: new Date(Date.now() + 68 * 86400000).toISOString(), eventEndDate: null,
    type: "in-person", category: "Culture", rsvpUrl: "#", price: "$75",
    isPremium: true, isFeatured: false, organizer: "Black in Fashion Council", tags: ["fashion", "design", "entrepreneurship"],
  },
  {
    id: "9", title: "Music Business Masterclass: From Streams to Equity", description: "An interactive virtual workshop on music licensing, catalog ownership, streaming royalties, and how to build generational wealth in music.",
    imageUrl: null, location: "Online (Zoom)", address: null, city: null,
    eventDate: new Date(Date.now() + 35 * 86400000).toISOString(), eventEndDate: null,
    type: "virtual", category: "Art & Music", rsvpUrl: "#", price: "$25",
    isPremium: false, isFeatured: false, organizer: "A3C + Music Biz Academy", tags: ["music", "licensing", "wealth"],
  },
  {
    id: "10", title: "Dominican Diaspora Innovation Forum", description: "A community forum celebrating Dominican-American entrepreneurs, athletes, artists, and activists shaping culture and business in the diaspora.",
    imageUrl: null, location: "Made in NY Media Center, Brooklyn, NY", address: null, city: "Brooklyn",
    eventDate: new Date(Date.now() + 45 * 86400000).toISOString(), eventEndDate: null,
    type: "in-person", category: "Culture", rsvpUrl: "#", price: "Free",
    isPremium: false, isFeatured: true, organizer: "Dominicanos USA", tags: ["Dominican", "diaspora", "community"],
  },
  {
    id: "11", title: "Pitch Black: Startup Competition", description: "High-stakes pitch competition for Black and Brown founders. $25K in prizes, live judging from top VCs, and press coverage from The Innovators Den.",
    imageUrl: null, location: "WeWork 5th Ave, New York, NY", address: null, city: "New York",
    eventDate: new Date(Date.now() + 75 * 86400000).toISOString(), eventEndDate: null,
    type: "in-person", category: "Business Growth", rsvpUrl: "#", price: "Free to attend",
    isPremium: false, isFeatured: true, organizer: "New Voices Foundation + TID", tags: ["pitch", "startup", "competition"],
  },
  {
    id: "12", title: "Wellness & the Hustle: Mental Health for Entrepreneurs", description: "A candid hybrid conversation about burnout, boundaries, and building businesses without losing yourself. Facilitated by therapists and founders.",
    imageUrl: null, location: "Online + Harlem, NYC", address: null, city: "Harlem",
    eventDate: new Date(Date.now() + 55 * 86400000).toISOString(), eventEndDate: null,
    type: "hybrid", category: "Health", rsvpUrl: "#", price: "Free",
    isPremium: false, isFeatured: false, organizer: "Therapy for Black Girls + TID", tags: ["wellness", "mental health", "entrepreneurship"],
  },
];

const EVENT_TYPES = ["All", "in-person", "virtual", "hybrid"];
const CATEGORIES = ["All", "Innovation", "Culture", "Business Growth", "Art & Music", "Health", "Sports"];

export default function EventsPage() {
  const { user } = useAuth();
  const adTier = (user?.subscriptionTier ?? "free") as Tier;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/events?limit=50`)
      .then(r => r.json())
      .then(data => {
        setEvents(data.events?.length ? data.events : SAMPLE_EVENTS);
      })
      .catch(() => setEvents(SAMPLE_EVENTS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(e =>
    (selectedType === "All" || e.type === selectedType) &&
    (selectedCategory === "All" || e.category === selectedCategory)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#ffffff", fontFamily: "system-ui, sans-serif" }}>
      <Seo
        title="Events | The Innovators Den"
        description="Upcoming events for Black entrepreneurs, creators, and innovators."
        type="website"
      />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #111111 0%, #000000 100%)", borderBottom: "1px solid #222222", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>THE INNOVATORS DEN</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, margin: "0 0 12px", letterSpacing: -1 }}>
            Events 📅
          </h1>
          <p style={{ color: "#888888", fontSize: 16, margin: 0, maxWidth: 540 }}>
            Summits, mixers, workshops, and virtual sessions for the culture.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "0 24px", overflowX: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 24, alignItems: "center", paddingTop: 16, paddingBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EVENT_TYPES.map(t => (
              <button key={t} onClick={() => setSelectedType(t)} style={{
                background: selectedType === t ? "#FFE600" : "#111111",
                color: selectedType === t ? "#000000" : "#888888",
                border: "1px solid " + (selectedType === t ? "#FFE600" : "#222222"),
                borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize",
              }}>
                {t === "All" ? "All Types" : t}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{
              background: "#111111", color: "#ffffff", border: "1px solid #222222",
              borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer",
            }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* W-ROOMS-001: Featured Room — top of events board */}
        <FeaturedRoomCard tier={adTier} index={0} />
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#888" }}>Loading events…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>📅</p>
            <p style={{ color: "#888888", fontSize: 16 }}>No events match your filters.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {filtered.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </div>
    </div>
  );
}
