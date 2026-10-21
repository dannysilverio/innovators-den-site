import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

const ORG_TYPES = [
  { key: "employer",  label: "Employer",   desc: "Post jobs and career opportunities" },
  { key: "brand",     label: "Brand",      desc: "Brand deals and collaboration campaigns" },
  { key: "partner",   label: "Partner",    desc: "Strategic partner with broader access" },
  { key: "organizer", label: "Organizer",  desc: "Run events and rooms inside the Den" },
  { key: "recruiter", label: "Recruiter",  desc: "Recruit talent from within the network" },
];

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  pending:   { label: "Under Review",  color: "#FFE600" },
  approved:  { label: "Active",        color: "#34D399" },
  suspended: { label: "Suspended",     color: "#FF5B5B" },
  rejected:  { label: "Not Approved",  color: "#666" },
};

const VERIFICATION_DISPLAY: Record<string, { label: string; color: string }> = {
  unverified: { label: "Unverified",  color: "#555" },
  verified:   { label: "✓ Verified",  color: "#34D399" },
  featured:   { label: "✦ Featured",  color: "#FFE600" },
};

const F: React.CSSProperties = {
  display: "block", width: "100%", boxSizing: "border-box",
  padding: "12px 14px", background: "#181818", border: "1px solid #2a2a2a",
  borderRadius: 10, color: "#f0f0f0", fontSize: 14, outline: "none",
  fontFamily: "system-ui, sans-serif",
};

type PartnerAccount = {
  id: string; orgName: string; orgType: string; website: string | null;
  contactEmail: string | null; bio: string | null;
  status: string; verificationStatus: string; createdAt: string;
};
type Listing = {
  id: string; title: string; type: string; status: string;
  isPremium: boolean; isFeatured: boolean; deadline?: string | null;
  eventDate?: string | null; createdAt: string;
};
type ListingSummary = {
  totalOpportunities: number; totalEvents: number;
  publishedOpportunities: number; publishedEvents: number; featuredListings: number;
};

export default function PartnersPage() {
  const { user, authHeader, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [account, setAccount] = useState<PartnerAccount | null>(null);
  const [listings, setListings] = useState<{ opportunities: Listing[]; events: Listing[]; summary: ListingSummary } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("partner");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadAccount = useCallback(async () => {
    if (!user) { setPageLoading(false); return; }
    try {
      const res = await fetch("/api/partner/me", { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setAccount(data.account);
        const lRes = await fetch("/api/partner/listings", { headers: authHeader() });
        if (lRes.ok) {
          const lData = await lRes.json();
          setListings(lData.listings);
        }
      }
    } catch { /* silent */ }
    finally { setPageLoading(false); }
  }, [user, authHeader]);

  useEffect(() => {
    if (!authLoading) loadAccount();
  }, [authLoading, loadAccount]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) { setError("Organization name is required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/partner/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ orgName, orgType, website, contactEmail, bio }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setAccount(data.account);
        setSuccess(true);
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const S: React.CSSProperties = {
    minHeight: "100vh", background: "#000", color: "#fff",
    fontFamily: "system-ui, sans-serif",
  };
  const INNER: React.CSSProperties = { maxWidth: 700, margin: "0 auto", padding: "0 24px 80px" };

  if (authLoading || pageLoading) {
    return (
      <div style={S}>
        <div style={{ ...INNER, paddingTop: 80, textAlign: "center", color: "#555" }}>Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={S}>
        <Seo title="Partner Portal | The Innovators Den" description="Apply to become a Den partner — post opportunities, host events, and reach underrepresented innovators." type="website" />
        <div style={{ ...INNER, paddingTop: 80, textAlign: "center" }}>
          <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 16 }}>✦ PARTNER PORTAL</p>
          <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 800 }}>Sign in to apply</h1>
          <p style={{ color: "#666", marginBottom: 28 }}>Create an account to apply for partner access.</p>
          <button
            onClick={() => setLocation("/sign-in?next=/partners")}
            style={{ background: "#FFE600", color: "#000", border: "none", borderRadius: 12, padding: "13px 28px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}
          >
            Sign In or Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S}>
      <Seo title="Partner Portal | The Innovators Den" description="Apply to become a Den partner — post opportunities, host events, and reach underrepresented innovators." type="website" />

      {/* Hero */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "48px 24px 36px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ color: "#FFE600", fontSize: 11, fontWeight: 700, letterSpacing: 3, margin: "0 0 10px" }}>✦ PARTNER PORTAL</p>
          <h1 style={{ margin: "0 0 10px", fontSize: 32, fontWeight: 800 }}>
            {account ? account.orgName : "Become a Den Partner"}
          </h1>
          {!account && (
            <p style={{ color: "#666", margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
              Post doors, host rooms, and reach the most intentional community of underestimated innovators anywhere.
            </p>
          )}
          {account && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 13, color: "#555" }}>
                {ORG_TYPES.find(t => t.key === account.orgType)?.label ?? account.orgType}
              </span>
              <span style={{ color: "#222" }}>·</span>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                border: `1px solid ${STATUS_DISPLAY[account.status]?.color ?? "#555"}`,
                color: STATUS_DISPLAY[account.status]?.color ?? "#555",
              }}>
                {STATUS_DISPLAY[account.status]?.label ?? account.status}
              </span>
              <span style={{ color: VERIFICATION_DISPLAY[account.verificationStatus]?.color ?? "#555", fontSize: 12, fontWeight: 700 }}>
                {VERIFICATION_DISPLAY[account.verificationStatus]?.label}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={INNER}>
        {!account ? (
          /* ── Registration Form ── */
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 36 }}>
            {success && (
              <div style={{ background: "#34D39915", border: "1px solid #34D39940", borderRadius: 12, padding: "14px 18px", marginBottom: 24, color: "#34D399", fontWeight: 600 }}>
                ✓ Application submitted! We review within 3 business days.
              </div>
            )}

            <div style={{ borderLeft: "3px solid #FFE600", paddingLeft: 16, marginBottom: 28 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Your Organization</h2>
              <p style={{ margin: 0, color: "#555", fontSize: 13 }}>Tell us about who you represent.</p>
            </div>

            <div style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 18, marginBottom: 20 }}>
              <div>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>ORGANIZATION NAME *</label>
                <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Black Tech Pipeline" style={F} />
              </div>

              <div>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8 }}>ORGANIZATION TYPE *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  {ORG_TYPES.map(t => (
                    <button
                      key={t.key} type="button"
                      onClick={() => setOrgType(t.key)}
                      style={{
                        padding: "8px 16px", borderRadius: 100, cursor: "pointer",
                        border: orgType === t.key ? "1.5px solid #FFE600" : "1px solid #2a2a2a",
                        background: orgType === t.key ? "#FFE60010" : "transparent",
                        color: orgType === t.key ? "#FFE600" : "#888",
                        fontWeight: orgType === t.key ? 700 : 500, fontSize: 13, transition: "all 0.15s",
                      }}
                    >{t.label}</button>
                  ))}
                </div>
                {orgType && (
                  <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{ORG_TYPES.find(t => t.key === orgType)?.desc}</p>
                )}
              </div>

              <div>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>WEBSITE</label>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourorg.com" style={F} />
              </div>

              <div>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>CONTACT EMAIL</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="partnerships@yourorg.com" style={F} />
              </div>

              <div>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6 }}>ABOUT YOUR ORGANIZATION</label>
                <textarea
                  value={bio} onChange={e => setBio(e.target.value.slice(0, 400))}
                  placeholder="What do you do and why does it matter to this community?"
                  rows={4} maxLength={400}
                  style={{ ...F, resize: "vertical", minHeight: 90 }}
                />
                <p style={{ color: "#444", fontSize: 11, margin: "4px 0 0" }}>{400 - bio.length} characters remaining</p>
              </div>
            </div>

            {error && (
              <p style={{ color: "#FF6B6B", fontSize: 13, background: "#FF6B6B10", border: "1px solid #FF6B6B30", borderRadius: 8, padding: "10px 14px", margin: "0 0 16px" }}>{error}</p>
            )}

            <button type="submit" disabled={submitting}
              style={{ padding: "14px", background: "#FFE600", color: "#000", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Submitting…" : "Apply for Partner Access →"}
            </button>

            <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
              Applications are reviewed within 3 business days. We prioritize partners aligned with our community values.
            </p>
          </form>
        ) : (
          /* ── Partner Dashboard ── */
          <div style={{ marginTop: 36 }}>
            {account.status === "pending" && (
              <div style={{ background: "#FFE60008", border: "1px solid #FFE60025", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 10, marginBottom: 28, alignItems: "flex-start" }}>
                <span style={{ color: "#FFE600", marginTop: 1 }}>ℹ</span>
                <p style={{ margin: 0, color: "#888", fontSize: 13, lineHeight: 1.6 }}>
                  Your application is under review. We'll reach out to your contact email once approved.
                </p>
              </div>
            )}

            {/* Listing summary */}
            {listings && (
              <>
                <div style={{ borderLeft: "3px solid #FFE600", paddingLeft: 16, marginBottom: 20 }}>
                  <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Listing Summary</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
                  {[
                    { label: "Opportunities", value: listings.summary.totalOpportunities },
                    { label: "Rooms", value: listings.summary.totalEvents },
                    { label: "Featured", value: listings.summary.featuredListings },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16, textAlign: "center" }}>
                      <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800 }}>{stat.value}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {(listings.opportunities.length > 0 || listings.events.length > 0) && (
                  <>
                    <div style={{ borderLeft: "3px solid #FFE600", paddingLeft: 16, marginBottom: 16 }}>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Your Listings</h2>
                    </div>
                    <div style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden", marginBottom: 28 }}>
                      {[...listings.opportunities, ...listings.events].map((item, i, arr) => {
                        const statusColor = item.status === "published" ? "#34D399" : "#555";
                        return (
                          <div key={item.id} style={{
                            display: "flex", alignItems: "center", padding: "14px 18px",
                            borderBottom: i < arr.length - 1 ? "1px solid #1a1a1a" : "none",
                          }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>{item.title}</p>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 0.5 }}>{item.type?.toUpperCase()}</span>
                                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#333" }} />
                                <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                                {item.isFeatured && (
                                  <>
                                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#333" }} />
                                    <span style={{ fontSize: 11, color: "#FFE600", fontWeight: 600 }}>Featured</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <span style={{ color: "#444" }}>›</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {account.status === "approved" && (
                  <>
                    <div style={{ borderLeft: "3px solid #FFE600", paddingLeft: 16, marginBottom: 16 }}>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Actions</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <button
                        onClick={() => setLocation("/opportunities/submit")}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", background: "#FFE600", color: "#000", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                      >
                        + Post Opportunity
                      </button>
                      <button
                        onClick={() => setLocation("/events/submit")}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", background: "#FFE60010", color: "#FFE600", border: "1px solid #FFE60040", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                      >
                        📅 Submit Room
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
