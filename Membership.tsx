import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import { trackEvent, trackTid } from "@/lib/track";

const APP_STORE_URL = "https://apps.apple.com/app/the-innovators-den";
const TOKEN_KEY = "tid_jwt";

type BillingCycle = "monthly" | "annual";

const TIERS = [
  {
    id: "free",
    name: "Free",
    tagline: "Inside the front door.",
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualNote: "",
    color: "#888888",
    badge: "FREE",
    recommended: false,
    ctaLabel: "You're Inside",
    ctaDisabled: true,
    link: "",
    outcomes: [
      "Personalized Signal feed, curated for your industry",
      "Browse 11 culture + innovation topic channels",
      "Preview the People directory",
      "Explore public Rooms and open Doors",
      "Save up to 10 Signals",
      "Weekly briefing drop",
    ],
    locked: [
      "Ad-free reading",
      "Full AM & PM Briefings",
      "Tracked Doors (opportunity tracking)",
      "Unlimited saves",
      "Rise Profile visibility",
    ],
  },
  {
    id: "member",
    name: "Den Member",
    tagline: "Your daily edge, every morning.",
    monthlyPrice: "$9",
    annualPrice: "$7.50",
    annualNote: "$90/yr · save $18",
    color: "#10B981",
    badge: "MEMBER",
    recommended: false,
    ctaLabel: "Access The Den",
    ctaDisabled: false,
    link: APP_STORE_URL,
    outcomes: [
      "AM & PM Briefings — wake up sharper than everyone else",
      "Ad-free reading from the moment you open the app",
      "Unlimited Signal saves — never lose an insight again",
      "Full Doors board — every opportunity, unfiltered",
      "Tracked Doors — follow up to 15 Doors you're pursuing",
      "Priority RSVP to every public Room",
      "AI summaries — always have the signal, even when rushed",
      "Verified Member badge",
    ],
    locked: [
      "Pro Rooms (private gatherings)",
      "Deep Intelligence reports",
      "Governance voting rights",
      "Rise Profile spotlight",
    ],
  },
  {
    id: "pro",
    name: "Den Pro",
    tagline: "Access, momentum, and visibility.",
    monthlyPrice: "$19",
    annualPrice: "$15.83",
    annualNote: "$190/yr · save $38",
    color: "#FFE600",
    badge: "MOST POPULAR",
    recommended: true,
    ctaLabel: "Elevate to Pro",
    ctaDisabled: false,
    link: APP_STORE_URL,
    outcomes: [
      "Pro Rooms — gatherings where real decisions happen",
      "Tracked Doors — unlimited opportunity tracking",
      "Rise Profile spotlight — be seen by the right people",
      "Deep Intelligence briefings — beyond what the feed shows",
      "Governance voting rights — shape the Den's direction",
      "Full People directory — know who to know",
      "Early access when new features drop",
      "Priority support — you're never waiting",
      "Pro badge that signals your commitment",
      "Everything in Den Member",
    ],
    locked: [
      "Private founder Rooms (unlisted)",
      "Concierge support",
      "Inner Circle badge",
    ],
  },
  {
    id: "inner_circle",
    name: "Den Inner Circle",
    tagline: "The room behind the room.",
    monthlyPrice: "$49",
    annualPrice: "$40.83",
    annualNote: "$490/yr · save $98",
    color: "#FF4D7E",
    badge: "ELITE",
    recommended: false,
    ctaLabel: "Enter the Inner Circle",
    ctaDisabled: false,
    link: APP_STORE_URL,
    outcomes: [
      "Private founder Rooms — not listed, not advertised",
      "Private intel briefings you won't find anywhere else",
      "Concierge support — we move so you don't have to",
      "Governance proposal rights — put issues on the agenda",
      "Highest-tier Rise Profile with curated introductions",
      "Your name in the app credits",
      "Elite badge that marks rare, serious commitment",
      "Everything in Den Pro",
    ],
    locked: [],
  },
  {
    id: "founding",
    name: "Founding Patron",
    tagline: "Back the mission. Leave a legacy.",
    monthlyPrice: "—",
    annualPrice: "$999",
    annualNote: "Annual only · one-time founding rate",
    color: "#C084FC",
    badge: "FOUNDING",
    recommended: false,
    isFoundingTier: true,
    ctaLabel: "Back the Mission",
    ctaDisabled: false,
    link: APP_STORE_URL,
    outcomes: [
      "All Den Inner Circle access, fully unlocked",
      "Founding badge — permanent early-believer status",
      "Your name in the app credits as a founding backer",
      "Exclusive annual Founders Update from the TID team",
      "Recognition as a mission champion inside the Den",
      "Priority access to every new product and drop",
      "Concierge support at the highest level",
    ],
    locked: [],
  },
];

const MATRIX = [
  { label: "Signal feed (personalized)",              free: true,  member: true,  pro: true,  inner: true,  founding: true  },
  { label: "Topic channels (11)",                     free: true,  member: true,  pro: true,  inner: true,  founding: true  },
  { label: "Public Rooms & open Doors",               free: true,  member: true,  pro: true,  inner: true,  founding: true  },
  { label: "People directory (preview)",              free: true,  member: true,  pro: true,  inner: true,  founding: true  },
  { label: "Ad-free reading",                         free: false, member: true,  pro: true,  inner: true,  founding: true  },
  { label: "Unlimited Signal saves",                  free: false, member: true,  pro: true,  inner: true,  founding: true  },
  { label: "AI summaries",                            free: false, member: true,  pro: true,  inner: true,  founding: true  },
  { label: "AM & PM Briefings",                       free: false, member: true,  pro: true,  inner: true,  founding: true  },
  { label: "Full Doors board",                        free: false, member: true,  pro: true,  inner: true,  founding: true  },
  { label: "Tracked Doors (15 limit)",                free: false, member: true,  pro: false, inner: false, founding: false },
  { label: "Tracked Doors (unlimited)",               free: false, member: false, pro: true,  inner: true,  founding: true  },
  { label: "Priority RSVP",                           free: false, member: true,  pro: true,  inner: true,  founding: true  },
  { label: "Pro Rooms (private gatherings)",          free: false, member: false, pro: true,  inner: true,  founding: true  },
  { label: "Rise Profile spotlight",                  free: false, member: false, pro: true,  inner: true,  founding: true  },
  { label: "Full People directory",                   free: false, member: false, pro: true,  inner: true,  founding: true  },
  { label: "Intelligence reports",                    free: false, member: true,  pro: true,  inner: true,  founding: true  },
  { label: "Deep Intelligence briefings",             free: false, member: false, pro: true,  inner: true,  founding: true  },
  { label: "Governance voting rights",                free: false, member: false, pro: true,  inner: true,  founding: true  },
  { label: "Early feature access",                    free: false, member: false, pro: true,  inner: true,  founding: true  },
  { label: "Private founder Rooms (unlisted)",        free: false, member: false, pro: false, inner: true,  founding: true  },
  { label: "Private intel briefings",                 free: false, member: false, pro: false, inner: true,  founding: true  },
  { label: "Concierge support",                       free: false, member: false, pro: false, inner: true,  founding: true  },
  { label: "Governance proposal rights",              free: false, member: false, pro: false, inner: true,  founding: true  },
  { label: "Curated introductions",                   free: false, member: false, pro: false, inner: true,  founding: true  },
  { label: "App credits + team access",               free: false, member: false, pro: false, inner: true,  founding: true  },
  { label: "Founding badge (permanent)",              free: false, member: false, pro: false, inner: false, founding: true  },
  { label: "Annual Founders Update",                  free: false, member: false, pro: false, inner: false, founding: true  },
  { label: "Mission backer recognition",              free: false, member: false, pro: false, inner: false, founding: true  },
];

function Cell({ yes }: { yes: boolean }) {
  return (
    <span style={{ color: yes ? "#10B981" : "#2a2a2a", fontSize: 18, fontWeight: 700 }}>
      {yes ? "✓" : "–"}
    </span>
  );
}

export default function MembershipPage() {
  const [, setLocation] = useLocation();
  const { user, refresh, token } = useAuth();
  const [billing, setBilling] = useState<BillingCycle>("annual");
  const [promoCode, setPromoCode] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleBillingToggle = (cycle: BillingCycle) => {
    setBilling(cycle);
    trackTid(user?.id, "billing_toggle", { cycle, screen: "membership" });
  };

  const handleCtaClick = (tierId: string, ctaLabel: string) => {
    trackEvent("membership_cta_clicked", { tier: tierId, billing });
    trackTid(user?.id, "upgrade_click", {
      tier: tierId,
      billing,
      screen: "membership",
      cta: ctaLabel,
      from_tier: user?.subscriptionTier ?? "free",
    });
  };

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoState("loading");
    setPromoError(null);
    try {
      const res = await fetch("/api/promo-codes/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoState("error");
        setPromoError(data.error ?? "That code wasn't recognized. Try again.");
        setTimeout(() => setPromoState("idle"), 3000);
        return;
      }
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        await refresh();
      }
      setPromoState("success");
      trackEvent("promo_redeemed", { tier: data.newTier ?? "inner_circle" });
      trackTid(user?.id, "subscription_success", { tier: data.newTier ?? "inner_circle", method: "promo_code", screen: "membership" });
    } catch {
      setPromoState("error");
      setPromoError("Network error. Please try again.");
      setTimeout(() => setPromoState("idle"), 3000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#ffffff", fontFamily: "system-ui, sans-serif" }}>
      <Seo
        title="Membership | The Innovators Den"
        description="Signals. Rooms. Doors. Tracked Doors. Rise Profiles. Built for Black, Brown, and underrepresented innovators who move with intention."
        type="website"
      />

      {/* Hero */}
      <div style={{
        background: "linear-gradient(160deg, #0a0a0a 0%, #000000 60%)",
        borderBottom: "1px solid #1a1a1a",
        padding: "64px 24px 52px",
        textAlign: "center",
      }}>
        <p style={{ color: "#FFE600", fontSize: 10, fontWeight: 800, letterSpacing: 3, marginBottom: 18, textTransform: "uppercase" }}>
          The Innovators Den · Membership
        </p>
        <h1 style={{
          fontSize: "clamp(34px, 5.5vw, 60px)",
          fontWeight: 900,
          margin: "0 auto 20px",
          letterSpacing: -1.5,
          maxWidth: 740,
          lineHeight: 1.1,
        }}>
          Your Level of Access
        </h1>
        <p style={{ color: "#666666", fontSize: 17, margin: "0 auto 32px", maxWidth: 500, lineHeight: 1.65 }}>
          Discovery is free. The edge is earned. Choose how far in you want to go.
        </p>

        {/* Billing toggle */}
        <div style={{
          display: "inline-flex",
          background: "#111111",
          border: "1px solid #222222",
          borderRadius: 50,
          padding: 4,
          gap: 4,
          position: "relative",
        }}>
          <button
            onClick={() => handleBillingToggle("monthly")}
            style={{
              padding: "8px 22px",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              background: billing === "monthly" ? "#1a1a1a" : "transparent",
              color: billing === "monthly" ? "#ffffff" : "#555555",
              transition: "all 0.2s",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => handleBillingToggle("annual")}
            style={{
              padding: "8px 22px",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              background: billing === "annual" ? "#FFE600" : "transparent",
              color: billing === "annual" ? "#000000" : "#555555",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            Annual
            {billing !== "annual" && (
              <span style={{
                background: "#10B981",
                color: "#000",
                fontSize: 9,
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: 50,
                letterSpacing: 0.5,
              }}>SAVE 17%</span>
            )}
          </button>
        </div>
        {billing === "annual" && (
          <p style={{ color: "#10B981", fontSize: 12, fontWeight: 700, marginTop: 12, letterSpacing: 0.5 }}>
            ✓ Annual pricing — 2 months free on every plan
          </p>
        )}
      </div>

      {/* Tier cards */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 24px 0" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}>
          {TIERS.map(tier => {
            const isFoundingTier = "isFoundingTier" in tier;
            const displayPrice = billing === "annual" || isFoundingTier ? tier.annualPrice : tier.monthlyPrice;
            const pricePeriod = isFoundingTier
              ? "per year"
              : billing === "annual"
              ? "per month"
              : "per month";

            return (
              <div
                key={tier.id}
                style={{
                  background: tier.recommended ? "#0b0b00" : "#0e0e0e",
                  border: `2px solid ${tier.recommended ? tier.color : tier.color + "35"}`,
                  borderRadius: 18,
                  padding: "26px 22px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: tier.recommended ? `0 0 48px ${tier.color}14` : "none",
                  transform: tier.recommended ? "translateY(-4px)" : "none",
                  transition: "transform 0.2s",
                }}
              >
                {/* Badge */}
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: tier.recommended ? tier.color : tier.color + "22",
                  color: tier.recommended ? "#000000" : tier.color,
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
                  padding: "5px 14px", borderRadius: "0 16px 0 8px",
                  border: tier.recommended ? "none" : `1px solid ${tier.color}40`,
                }}>{tier.badge}</div>

                {/* Tier name + tagline */}
                <h2 style={{ color: tier.color, fontSize: 18, fontWeight: 900, margin: "0 0 4px", lineHeight: 1.2 }}>{tier.name}</h2>
                <p style={{ color: "#444444", fontSize: 12, margin: "0 0 18px", lineHeight: 1.4, fontStyle: "italic" }}>{tier.tagline}</p>

                {/* Price */}
                <div style={{ marginBottom: 6, display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ color: "#ffffff", fontSize: isFoundingTier ? 26 : 34, fontWeight: 900, letterSpacing: -1 }}>
                    {displayPrice}
                  </span>
                  {displayPrice !== "$0" && displayPrice !== "—" && (
                    <span style={{ color: "#555555", fontSize: 12, marginLeft: 2 }}>/ {pricePeriod}</span>
                  )}
                </div>
                {billing === "annual" && tier.annualNote && !isFoundingTier && (
                  <p style={{ color: "#10B981", fontSize: 11, fontWeight: 700, margin: "0 0 20px", letterSpacing: 0.3 }}>
                    {tier.annualNote}
                  </p>
                )}
                {billing === "monthly" && tier.annualNote && !isFoundingTier && (
                  <p style={{ color: "#444444", fontSize: 11, margin: "0 0 20px" }}>
                    Or {tier.annualNote.split(" · ")[0]} billed annually
                  </p>
                )}
                {isFoundingTier && (
                  <p style={{ color: "#C084FC", fontSize: 11, fontWeight: 700, margin: "0 0 20px", letterSpacing: 0.5 }}>
                    ✦ Annual only · Support the mission
                  </p>
                )}
                {!tier.annualNote && !isFoundingTier && <div style={{ marginBottom: 20 }} />}

                {/* Outcomes */}
                <ul style={{ margin: "0 0 22px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                  {tier.outcomes.map(o => (
                    <li key={o} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: tier.color, fontSize: 13, marginTop: 1, flexShrink: 0, fontWeight: 700 }}>✓</span>
                      <span style={{ color: "#cccccc", fontSize: 12.5, lineHeight: 1.45 }}>{o}</span>
                    </li>
                  ))}
                  {tier.locked.map(l => (
                    <li key={l} style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: 0.28 }}>
                      <span style={{ color: "#444444", fontSize: 13, marginTop: 1, flexShrink: 0 }}>–</span>
                      <span style={{ color: "#777777", fontSize: 12.5, lineHeight: 1.45, textDecoration: "line-through" }}>{l}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {tier.ctaDisabled ? (
                  <div style={{
                    textAlign: "center", background: "#111111", color: "#444444",
                    fontWeight: 800, fontSize: 13, padding: "13px",
                    borderRadius: 11, border: "1px solid #1e1e1e",
                  }}>{tier.ctaLabel}</div>
                ) : (
                  <a
                    href={tier.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCtaClick(tier.id, tier.ctaLabel)}
                    style={{
                      display: "block", textAlign: "center",
                      background: tier.recommended ? tier.color : tier.color + "18",
                      color: tier.recommended ? "#000000" : tier.color,
                      fontWeight: 800, fontSize: 13, padding: "13px",
                      borderRadius: 11, textDecoration: "none",
                      border: tier.recommended ? "none" : `1px solid ${tier.color}50`,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    {tier.ctaLabel} →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Value proof bar */}
      <div style={{ maxWidth: 1000, margin: "56px auto 0", padding: "0 24px" }}>
        <div style={{
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 14,
          padding: "28px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 24,
        }}>
          {[
            { stat: "Signals",       desc: "stories + intelligence reports curated daily" },
            { stat: "Doors",         desc: "opportunities, grants, and partnerships listed" },
            { stat: "Rooms",         desc: "events and private founder gatherings every month" },
            { stat: "Rise Profiles", desc: "innovator profiles live in the People directory" },
          ].map(({ stat, desc }) => (
            <div key={stat} style={{ textAlign: "center" }}>
              <div style={{ color: "#FFE600", fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{stat}</div>
              <div style={{ color: "#444444", fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison matrix */}
      <div style={{ maxWidth: 1040, margin: "60px auto 0", padding: "0 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, textAlign: "center", letterSpacing: -0.5 }}>
          Full Access Comparison
        </h2>
        <p style={{ color: "#444444", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
          Every feature, every tier — no fine print.
        </p>
        <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a1a", background: "#0a0a0a" }}>
                <th style={{ textAlign: "left", padding: "14px 20px", color: "#555555", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, width: "34%" }}>FEATURE</th>
                <th style={{ textAlign: "center", padding: "14px 8px", color: "#555555", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>FREE</th>
                <th style={{ textAlign: "center", padding: "14px 8px", color: "#10B981", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>MEMBER</th>
                <th style={{ textAlign: "center", padding: "14px 8px", color: "#FFE600", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>PRO</th>
                <th style={{ textAlign: "center", padding: "14px 8px", color: "#FF4D7E", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>INNER CIRCLE</th>
                <th style={{ textAlign: "center", padding: "14px 8px", color: "#C084FC", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>FOUNDING</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr
                  key={row.label}
                  style={{
                    borderBottom: i < MATRIX.length - 1 ? "1px solid #141414" : "none",
                    background: i % 2 === 0 ? "transparent" : "#09090900",
                  }}
                >
                  <td style={{ padding: "10px 20px", color: "#888888", fontSize: 12.5 }}>{row.label}</td>
                  <td style={{ textAlign: "center", padding: "10px 8px" }}><Cell yes={row.free} /></td>
                  <td style={{ textAlign: "center", padding: "10px 8px" }}><Cell yes={row.member} /></td>
                  <td style={{ textAlign: "center", padding: "10px 8px" }}><Cell yes={row.pro} /></td>
                  <td style={{ textAlign: "center", padding: "10px 8px" }}><Cell yes={row.inner} /></td>
                  <td style={{ textAlign: "center", padding: "10px 8px" }}><Cell yes={row.founding} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mission statement */}
      <div style={{ maxWidth: 680, margin: "64px auto 0", padding: "0 24px", textAlign: "center" }}>
        <div style={{
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 18,
          padding: "36px 40px",
        }}>
          <p style={{ fontSize: 36, marginBottom: 14 }}>✊</p>
          <h3 style={{ color: "#FFE600", fontSize: 22, fontWeight: 900, marginBottom: 12, letterSpacing: -0.5 }}>For Us. By Us.</h3>
          <p style={{ color: "#555555", fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>
            Every subscription funds independent Black media, community infrastructure, and real economic opportunity
            for Black, Brown, Latino, and underrepresented entrepreneurs and creators.
            We don't chase clicks. We don't sell your data. We build for the culture.
          </p>
        </div>
      </div>

      {/* Promo code */}
      <div style={{ maxWidth: 480, margin: "40px auto 0", padding: "0 24px 90px", textAlign: "center" }}>
        {promoState === "success" ? (
          <div style={{
            background: "#0d0007", border: "1px solid #FF4D7E40", borderRadius: 14,
            padding: "20px 24px", display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 28 }}>💎</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#FF4D7E", fontSize: 14, fontWeight: 800, marginBottom: 3 }}>Access Granted · Inner Circle</div>
              <div style={{ color: "#555555", fontSize: 13 }}>
                Every door inside the Den is open.{" "}
                <a href="/inner-circle" style={{ color: "#FF4D7E", textDecoration: "none", fontWeight: 700 }}>
                  Go to your hub →
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: "#333333", fontSize: 13, marginBottom: 12 }}>Have an invitation code?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="Enter code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePromo()}
                style={{
                  flex: 1, padding: "12px 16px", background: "#0e0e0e",
                  border: `1px solid ${promoState === "error" ? "#FF4D7E" : "#222222"}`,
                  borderRadius: 10, color: "#fff", fontSize: 14,
                  outline: "none", letterSpacing: 2, textTransform: "uppercase",
                  transition: "border-color 0.2s",
                }}
              />
              <button
                onClick={handlePromo}
                disabled={promoState === "loading"}
                style={{
                  background: "#111111", border: "1px solid #2a2a2a",
                  borderRadius: 10, padding: "12px 20px",
                  color: "#ffffff", fontSize: 13, fontWeight: 800,
                  cursor: promoState === "loading" ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  opacity: promoState === "loading" ? 0.6 : 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                onMouseLeave={e => (e.currentTarget.style.background = "#111111")}
              >
                Unlock
              </button>
            </div>
            {promoState === "error" && (
              <p style={{ color: "#FF4D7E", fontSize: 12, marginTop: 8 }}>{promoError ?? "That code wasn't recognized. Try again."}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
