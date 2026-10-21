/**
 * Web Ad Unit Components — Premium, membership-aware ad placements for the web app.
 * All components fall back to static house ads when no live campaign is running.
 * Clear "SPONSORED" or "ADVERTISEMENT" labeling on every unit.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";

const API_BASE = "/api";

// ---------------------------------------------------------------------------
// Static fallback catalogue — premium brands, rotated deterministically
// ---------------------------------------------------------------------------
const FALLBACK_ADS = [
  {
    id: "amex-1", brand: "American Express", logoChar: "AMEX", category: "FINANCE",
    headline: "Fuel Your Business. Earn While You Spend.",
    body: "The Business Gold Card gives entrepreneurs 4x points on top spending categories.",
    cta: "Apply Now", targetUrl: "https://americanexpress.com/business", accentColor: "#B8870B",
  },
  {
    id: "shopify-1", brand: "Shopify", logoChar: "S", category: "BUSINESS",
    headline: "Build the Business You've Been Dreaming Of",
    body: "Start, run, and grow your business with the all-in-one commerce platform.",
    cta: "Start Free Trial", targetUrl: "https://shopify.com", accentColor: "#96BF48",
  },
  {
    id: "fidelity-1", brand: "Fidelity", logoChar: "FID", category: "INVESTING",
    headline: "Build Generational Wealth Starting Today",
    body: "$0 commission trades. No account minimums. Your money, your rules.",
    cta: "Start Investing", targetUrl: "https://fidelity.com", accentColor: "#52A350",
  },
  {
    id: "linkedin-1", brand: "LinkedIn Premium", logoChar: "in", category: "NETWORKING",
    headline: "See Who's Viewing Your Profile. Reach Anyone.",
    body: "Get InMail credits, AI-powered insights, and stand out to 1B+ professionals.",
    cta: "Try Free Month", targetUrl: "https://linkedin.com/premium", accentColor: "#0A66C2",
  },
  {
    id: "google-1", brand: "Google Workspace", logoChar: "G", category: "TECH",
    headline: "Run Your Entire Business From One Place",
    body: "Gmail, Docs, Drive, Meet — all integrated for $6/user/month.",
    cta: "Get Started", targetUrl: "https://workspace.google.com", accentColor: "#4285F4",
  },
  {
    id: "squarespace-1", brand: "Squarespace", logoChar: "SQ", category: "BUSINESS",
    headline: "Your Story Deserves a Beautiful Website",
    body: "Award-winning designer templates. Custom domains. Powerful commerce tools.",
    cta: "Start Building", targetUrl: "https://squarespace.com", accentColor: "#333",
  },
];

function getFallback(index = 0) {
  return FALLBACK_ADS[index % FALLBACK_ADS.length];
}

// ---------------------------------------------------------------------------
// Membership-aware suppression helper
// ---------------------------------------------------------------------------
// Tier hierarchy (lowest → highest):
//   free → member → pro → inner_circle → founding
// Ad-load promise:
//   Free          — ad-supported (all ad units visible)
//   Member        — reduced load (no billboard, native/display still visible)
//   Pro           — near ad-free (no billboard, no display/rail, native suppressed)
//   Inner Circle  — fully ad-free (all units suppressed)
//   Founding      — fully ad-free (all units suppressed)
// ---------------------------------------------------------------------------
export type Tier = "free" | "member" | "pro" | "inner_circle" | "founding";

const TIER_RANK: Record<Tier, number> = {
  free: 0, member: 1, pro: 2, inner_circle: 3, founding: 4,
};
function atLeast(tier: Tier, min: Tier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[min];
}

function shouldSuppressBillboard(tier: Tier)   { return atLeast(tier, "member"); }
function shouldSuppressDisplay(tier: Tier)      { return atLeast(tier, "pro"); }
function shouldSuppressNative(tier: Tier)       { return atLeast(tier, "inner_circle"); }
function shouldSuppressMobileBanner(tier: Tier) { return atLeast(tier, "member"); }

// ---------------------------------------------------------------------------
// Label components
// ---------------------------------------------------------------------------
function SponsoredLabel({ label = "ADVERTISEMENT" }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
      <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

export function PresentedByLabel({ sponsor }: { sponsor: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(255,230,0,0.06)", border: "1px solid rgba(255,230,0,0.15)",
      borderRadius: 6, padding: "4px 10px",
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,230,0,0.6)", letterSpacing: 1.5 }}>PRESENTED BY</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#FFE600" }}>{sponsor}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero Sponsor Banner — W-HOME-001 (billboard, below top nav)
// ---------------------------------------------------------------------------
export function HeroSponsorBanner({ tier = "free", index = 0 }: { tier?: Tier; index?: number }) {
  if (shouldSuppressBillboard(tier)) return null;

  const ad = getFallback(index);

  return (
    <a
      href={ad.targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          background: "#0d0d0d",
          border: "1px solid #1e1e1e",
          borderLeft: `3px solid ${ad.accentColor}`,
          borderRadius: 12,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          cursor: "pointer",
          transition: "border-color 0.2s",
          margin: "0 0 24px",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = ad.accentColor)}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.borderLeftColor = ad.accentColor; }}
      >
        <div style={{
          minWidth: 56, height: 56, borderRadius: 10,
          background: ad.accentColor + "18", border: `1px solid ${ad.accentColor}44`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: ad.accentColor, letterSpacing: 0.5 }}>{ad.logoChar}</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: ad.accentColor, letterSpacing: 1.5, opacity: 0.8 }}>{ad.category}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SponsoredLabel />
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{ad.brand}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.3, letterSpacing: -0.3, marginBottom: 6 }}>{ad.headline}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{ad.body}</div>
        </div>
        <div style={{
          flexShrink: 0, background: ad.accentColor, color: "#000",
          fontSize: 12, fontWeight: 800, padding: "10px 18px", borderRadius: 8, whiteSpace: "nowrap",
        }}>
          {ad.cta} →
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Native Ad Card — W-HOME-002 and in-feed (fluid, native)
// ---------------------------------------------------------------------------
export function WebNativeAdCard({ tier = "free", index = 0, context = "home" }: { tier?: Tier; index?: number; context?: string }) {
  if (shouldSuppressNative(tier)) return null;

  const ad = getFallback(index + 2);

  return (
    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#111", border: "1px solid #222", borderRadius: 12,
        padding: "16px 18px", display: "flex", gap: 16, alignItems: "flex-start",
        cursor: "pointer", transition: "border-color 0.2s", marginBottom: 12,
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#333")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "#222")}
      >
        <div style={{
          minWidth: 52, height: 52, borderRadius: 10,
          background: ad.accentColor + "18", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: ad.accentColor }}>{ad.logoChar}</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: ad.accentColor, letterSpacing: 1, opacity: 0.8 }}>{ad.category}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{
              background: "rgba(255,230,0,0.1)", border: "1px solid rgba(255,230,0,0.25)",
              fontSize: 8, fontWeight: 800, color: "#FFE600", padding: "2px 6px", borderRadius: 3, letterSpacing: 1.5,
            }}>SPONSORED</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{ad.brand}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.35, marginBottom: 5 }}>{ad.headline}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 8 }}>{ad.body}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: ad.accentColor }}>{ad.cta} →</div>
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Mid-Feed Display Rectangle — W-HOME-003, W-HOME-004, W-SIGNAL-001
// ---------------------------------------------------------------------------
export function DisplayRectangle({ tier = "free", index = 0 }: { tier?: Tier; index?: number }) {
  if (shouldSuppressDisplay(tier)) return null;

  const ad = getFallback(index + 4);

  return (
    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10,
        padding: "16px 18px", cursor: "pointer", transition: "border-color 0.2s",
        margin: "16px 0",
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#333")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e1e")}
      >
        <SponsoredLabel />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            minWidth: 42, height: 42, borderRadius: 8,
            background: ad.accentColor + "18", border: `1px solid ${ad.accentColor}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: ad.accentColor }}>{ad.logoChar}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{ad.headline}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{ad.body?.slice(0, 80)}…</div>
          </div>
          <div style={{
            flexShrink: 0, border: `1px solid ${ad.accentColor}`, borderRadius: 6,
            padding: "7px 14px", fontSize: 11, fontWeight: 700, color: ad.accentColor, whiteSpace: "nowrap",
          }}>
            {ad.cta}
          </div>
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Right Rail Sponsor — W-SIGNAL-002, W-DOORS-003, W-PEOPLE-002
// ---------------------------------------------------------------------------
export function RailSponsorCard({ tier = "free", index = 0 }: { tier?: Tier; index?: number }) {
  if (shouldSuppressDisplay(tier)) return null;

  const ad = getFallback(index + 1);

  return (
    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#111", border: "1px solid #222", borderRadius: 12,
        padding: 20, width: "100%", cursor: "pointer", transition: "border-color 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#333")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "#222")}
      >
        <SponsoredLabel />
        <div style={{
          width: 60, height: 60, borderRadius: 12, background: ad.accentColor + "18",
          border: `1px solid ${ad.accentColor}44`, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 14,
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: ad.accentColor }}>{ad.logoChar}</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: ad.accentColor, letterSpacing: 1.5, opacity: 0.7 }}>{ad.category}</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: 0.5 }}>{ad.brand}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>{ad.headline}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 14 }}>{ad.body}</div>
        <div style={{
          background: ad.accentColor, color: "#000", textAlign: "center",
          fontSize: 12, fontWeight: 800, padding: "10px", borderRadius: 8,
        }}>
          {ad.cta} →
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Featured Door Card — W-DOORS-001 (top of opportunities board)
// ---------------------------------------------------------------------------
export function FeaturedDoorCard({ tier = "free", index = 0 }: { tier?: Tier; index?: number }) {
  const ad = getFallback(index);

  return (
    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#0d0d0d",
        border: "1px solid #2a2a00",
        borderLeft: `3px solid #FFE600`,
        borderRadius: 14, padding: "20px 22px",
        display: "flex", gap: 18, alignItems: "center",
        cursor: "pointer", transition: "border-color 0.2s", marginBottom: 20,
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#333300")}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a00"; e.currentTarget.style.borderLeftColor = "#FFE600"; }}
      >
        <div style={{
          minWidth: 52, height: 52, borderRadius: 10, background: ad.accentColor + "18",
          border: `1px solid ${ad.accentColor}44`, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: ad.accentColor }}>{ad.logoChar}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{
              background: "#FFE60018", border: "1px solid #FFE60040",
              fontSize: 8, fontWeight: 800, color: "#FFE600",
              padding: "2px 7px", borderRadius: 3, letterSpacing: 1.5,
            }}>✦ FEATURED DOOR</span>
            <PresentedByLabel sponsor={ad.brand} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{ad.headline}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{ad.body}</div>
        </div>
        <div style={{
          flexShrink: 0, background: "#FFE600", color: "#000",
          fontSize: 12, fontWeight: 800, padding: "10px 18px", borderRadius: 8, whiteSpace: "nowrap",
        }}>
          {ad.cta} →
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Featured Room Card — W-ROOMS-001 (top of events board)
// ---------------------------------------------------------------------------
export function FeaturedRoomCard({ tier = "free", index = 0 }: { tier?: Tier; index?: number }) {
  const ad = getFallback(index + 3);

  return (
    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#0a0f14",
        border: "1px solid #0a2040",
        borderLeft: "3px solid #60A5FA",
        borderRadius: 14, padding: "20px 22px",
        display: "flex", gap: 18, alignItems: "center",
        cursor: "pointer", transition: "border-color 0.2s", marginBottom: 20,
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#1a3060")}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#0a2040"; e.currentTarget.style.borderLeftColor = "#60A5FA"; }}
      >
        <div style={{
          minWidth: 52, height: 52, borderRadius: 10, background: "#60A5FA18",
          border: "1px solid #60A5FA44", display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#60A5FA" }}>{ad.logoChar}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{
              background: "#60A5FA18", border: "1px solid #60A5FA40",
              fontSize: 8, fontWeight: 800, color: "#60A5FA",
              padding: "2px 7px", borderRadius: 3, letterSpacing: 1.5,
            }}>✦ FEATURED ROOM</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>
            PRESENTED BY {ad.brand.toUpperCase()}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{ad.headline}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{ad.body}</div>
        </div>
        <div style={{
          flexShrink: 0, background: "#60A5FA", color: "#000",
          fontSize: 12, fontWeight: 800, padding: "10px 18px", borderRadius: 8, whiteSpace: "nowrap",
        }}>
          {ad.cta} →
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// House Ad Card — membership upgrade or event promo (H-001, H-002)
// ---------------------------------------------------------------------------
export function HouseAdCard({ variant = "membership" }: { variant?: "membership" | "event" }) {
  if (variant === "membership") {
    return (
      <Link href="/membership" style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          background: "rgba(255,230,0,0.04)", border: "1px solid rgba(255,230,0,0.15)",
          borderRadius: 12, padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
          transition: "border-color 0.2s", margin: "16px 0",
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,230,0,0.35)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,230,0,0.15)")}
        >
          <div style={{ fontSize: 28 }}>✦</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#FFE600", letterSpacing: 2, marginBottom: 4 }}>INNOVATORS DEN</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Unlock Pro or Founding Access</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
              Get full access to every room, door, intelligence report, and community signal.
            </div>
          </div>
          <div style={{
            flexShrink: 0, background: "#FFE600", color: "#000",
            fontSize: 11, fontWeight: 800, padding: "9px 16px", borderRadius: 8, whiteSpace: "nowrap",
          }}>
            Upgrade →
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/events" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "rgba(96,165,250,0.04)", border: "1px solid rgba(96,165,250,0.15)",
        borderRadius: 12, padding: "18px 20px",
        display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
        transition: "border-color 0.2s", margin: "16px 0",
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.35)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.15)")}
      >
        <div style={{ fontSize: 28 }}>🏛</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#60A5FA", letterSpacing: 2, marginBottom: 4 }}>DEN EVENTS</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Rooms Worth Being In</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
            Summits, mixers, masterclasses, and private gatherings for the community.
          </div>
        </div>
        <div style={{
          flexShrink: 0, border: "1px solid #60A5FA", color: "#60A5FA",
          fontSize: 11, fontWeight: 800, padding: "9px 16px", borderRadius: 8, whiteSpace: "nowrap",
        }}>
          View Rooms →
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Mobile Web Anchor — W-HOME-005 (sticky bottom, Free users only)
// ---------------------------------------------------------------------------
export function MobileAnchorBanner({ tier = "free", index = 0 }: { tier?: Tier; index?: number }) {
  if (shouldSuppressMobileBanner(tier)) return null;

  const ad = getFallback(index + 5);

  return (
    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <div style={{
        background: "#111", borderTop: "1px solid #222",
        padding: "10px 16px", display: "flex", alignItems: "center", gap: 12,
        cursor: "pointer",
      }}>
        <div style={{
          minWidth: 32, height: 32, borderRadius: 6, background: ad.accentColor + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: ad.accentColor }}>{ad.logoChar}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginBottom: 1 }}>AD · {ad.brand}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {ad.headline.slice(0, 50)}{ad.headline.length > 50 ? "…" : ""}
          </div>
        </div>
        <div style={{
          flexShrink: 0, border: `1px solid ${ad.accentColor}`, borderRadius: 6,
          padding: "6px 12px", fontSize: 10, fontWeight: 800, color: ad.accentColor,
        }}>
          {ad.cta}
        </div>
      </div>
    </a>
  );
}
