/**
 * Amics Consulting Group house ad units for The Innovators Den web app.
 *
 * Four formats that drop into the existing Den ad slots:
 *   AmicsBillboard     W-HOME-001 (between Spotlight and Latest Stories)
 *   AmicsNativeCard    W-HOME-002 and in-feed (matches Den story cards)
 *   AmicsRailCard      W-SIGNAL-002 / right rail
 *   AmicsMobileAnchor  W-HOME-005 (sticky bottom, Free tier only)
 *
 * Membership suppression follows the same ad-load promise as AdUnit.tsx.
 * Every unit is clearly labeled SPONSORED and discloses the founder link.
 * All clicks carry UTM tags so Amics can attribute Den traffic in GA4.
 */

import type { Tier } from "@/components/AdUnit";

const TIER_RANK: Record<Tier, number> = { free: 0, member: 1, pro: 2, inner_circle: 3, founding: 4 };
const atLeast = (tier: Tier, min: Tier) => TIER_RANK[tier] >= TIER_RANK[min];

const AMICS = "https://amicsconsultinggroup.com";

function amicsUrl(path: string, content: string) {
  const q = new URLSearchParams({
    utm_source: "theinnovatorsden",
    utm_medium: "house_ad",
    utm_campaign: "den_x_amics",
    utm_content: content,
  });
  return `${AMICS}${path}?${q.toString()}`;
}

export const AMICS_LINKS = {
  billboard: amicsUrl("/teardown/", "billboard"),
  native: amicsUrl("/teardown/", "native_card"),
  rail: amicsUrl("/growth/", "rail"),
  anchor: amicsUrl("/teardown/", "mobile_anchor"),
};

const SERVICES = [
  "Paid Media",
  "Programmatic & CTV",
  "AI Receptionist",
  "Creative Studio",
  "Websites & Shopify",
  "Email & Retention",
];

// ---------------------------------------------------------------------------
// Shared styles (scoped with the amx- prefix, injected once)
// ---------------------------------------------------------------------------
const AMX_CSS = `
.amx{--amx-ink:#000;--amx-panel:#0b0b0b;--amx-line:#1f1f1f;--amx-y:#FFE600;--amx-p:#FF4F8B;--amx-fg:#fff;--amx-mute:rgba(255,255,255,.58);--amx-dim:rgba(255,255,255,.34);
  font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--amx-fg);text-decoration:none;display:block}
.amx *{box-sizing:border-box}
.amx:focus-visible{outline:2px solid var(--amx-y);outline-offset:3px;border-radius:16px}
.amx-tag{display:inline-flex;align-items:center;gap:8px;font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--amx-dim)}
.amx-tag b{color:var(--amx-y);background:rgba(255,230,0,.1);border:1px solid rgba(255,230,0,.28);padding:2px 6px;border-radius:3px;letter-spacing:1.5px}
.amx-rec{display:inline-flex;align-items:center;gap:6px;font:700 10px/1 Menlo,ui-monospace,monospace;letter-spacing:1.5px;color:var(--amx-mute)}
.amx-rec i{width:7px;height:7px;border-radius:50%;background:var(--amx-p);box-shadow:0 0 10px var(--amx-p);animation:amx-blink 1.4s steps(2,start) infinite}
@keyframes amx-blink{to{visibility:hidden}}
.amx-mark{background:linear-gradient(transparent 58%,rgba(255,230,0,.9) 58%,rgba(255,230,0,.9) 92%,transparent 92%);color:#fff;padding:0 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.amx-cta{display:inline-flex;align-items:center;gap:8px;background:var(--amx-y);color:#000;font-weight:900;font-size:13px;letter-spacing:.2px;padding:13px 20px;border-radius:999px;white-space:nowrap;transition:transform .2s,box-shadow .2s}
.amx-cta span{transition:transform .2s}
.amx:hover .amx-cta{box-shadow:0 0 0 4px rgba(255,230,0,.18)}
.amx:hover .amx-cta span{transform:translateX(3px)}
.amx-fine{font-size:11px;color:var(--amx-dim);letter-spacing:.2px}

/* Billboard */
.amx-bb{position:relative;overflow:hidden;background:radial-gradient(120% 140% at 100% 0%,rgba(255,79,139,.16),transparent 55%),var(--amx-panel);border:1px solid var(--amx-line);border-radius:18px;margin:0 0 24px;transition:border-color .25s}
.amx-bb:hover{border-color:#333}
.amx-bb-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:end;padding:26px 28px 22px}
.amx-bb-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.amx-bb h3{margin:0 0 10px;font-size:clamp(24px,3.4vw,38px);line-height:1.04;font-weight:900;letter-spacing:-1.2px;text-wrap:balance;max-width:20ch}
.amx-bb p{margin:0;font-size:14px;line-height:1.55;color:var(--amx-mute);max-width:56ch}
.amx-bb-side{display:flex;flex-direction:column;align-items:flex-end;gap:10px}
.amx-proof{display:flex;gap:22px;margin-top:18px;flex-wrap:wrap}
.amx-proof div{display:flex;flex-direction:column;gap:2px}
.amx-proof strong{font-size:20px;font-weight:900;letter-spacing:-.5px;color:var(--amx-y);font-variant-numeric:tabular-nums}
.amx-proof span{font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:var(--amx-dim)}
.amx-ticker{border-top:1px solid var(--amx-line);overflow:hidden;white-space:nowrap;padding:10px 0;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.amx-ticker div{display:inline-block;animation:amx-scroll 32s linear infinite}
.amx-ticker span{font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--amx-dim);padding:0 14px}
.amx-ticker em{color:var(--amx-p);font-style:normal}
@keyframes amx-scroll{to{transform:translateX(-50%)}}

/* Native card (mirrors Den story cards) */
.amx-nc{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;overflow:hidden;transition:border-color .25s,transform .25s}
.amx-nc:hover{border-color:rgba(255,255,255,.22);transform:translateY(-4px)}
.amx-nc-art{position:relative;aspect-ratio:16/9;max-width:100%;background:#000;overflow:hidden;display:flex;align-items:flex-end;padding:14px}
.amx-nc-art::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 22px),radial-gradient(80% 90% at 85% 15%,rgba(255,230,0,.22),transparent 60%),radial-gradient(70% 80% at 0% 100%,rgba(255,79,139,.25),transparent 60%)}
.amx-nc-art .amx-rec{position:absolute;top:12px;left:14px}
.amx-nc-art .amx-tc{position:absolute;top:12px;right:14px;font:700 10px/1 Menlo,ui-monospace,monospace;color:var(--amx-dim);letter-spacing:1px}
.amx-nc-big{position:relative;font-size:clamp(26px,4.4vw,40px);font-weight:900;letter-spacing:-1.5px;line-height:.95}
.amx-nc-big small{display:block;font-size:11px;font-weight:800;letter-spacing:2px;color:var(--amx-y);margin-bottom:6px}
.amx-nc-body{padding:16px}
.amx-nc h3{margin:10px 0 8px;font-size:16px;font-weight:800;line-height:1.3}
.amx-nc p{margin:0 0 14px;font-size:12.5px;line-height:1.5;color:var(--amx-mute)}
.amx-nc .amx-go{font-size:12px;font-weight:900;color:var(--amx-y)}
/* Full-width slots: card goes side by side so the art never balloons */
.amx-ncw{container-type:inline-size;margin-bottom:12px}
@container (min-width:620px){
  .amx-nc{display:grid;grid-template-columns:minmax(0,0.9fr) minmax(0,1.1fr)}
  .amx-nc-art{aspect-ratio:auto;min-height:220px}
  .amx-nc-body{padding:24px 26px;display:flex;flex-direction:column;justify-content:center}
  .amx-nc h3{font-size:20px}
}

/* Rail */
.amx-rl{background:#000;border:1px solid var(--amx-line);border-radius:18px;padding:22px;position:relative;overflow:hidden}
.amx-rl::after{content:"";position:absolute;right:-60px;top:-60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,79,139,.28),transparent 70%)}
.amx-rl h3{position:relative;margin:16px 0 10px;font-size:24px;font-weight:900;letter-spacing:-.8px;line-height:1.05}
.amx-rl p{position:relative;margin:0 0 16px;font-size:13px;line-height:1.55;color:var(--amx-mute)}
.amx-seats{position:relative;display:flex;gap:6px;margin-bottom:6px}
.amx-seats i{flex:1;height:6px;border-radius:3px;background:var(--amx-y)}
.amx-seats i.open{background:transparent;border:1px solid rgba(255,230,0,.5)}
.amx-rl ul{position:relative;list-style:none;margin:16px 0 18px;padding:0;display:grid;gap:8px}
.amx-rl li{font-size:12.5px;color:#fff;display:flex;gap:8px}
.amx-rl li::before{content:"✦";color:var(--amx-y);font-size:10px;line-height:18px}
.amx-rl .amx-cta{width:100%;justify-content:center}

/* Mobile anchor */
.amx-an{display:flex;align-items:center;gap:12px;background:#0b0b0b;border-top:1px solid var(--amx-line);padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px))}
.amx-an-txt{flex:1;min-width:0}
.amx-an-txt div{font-size:9px;letter-spacing:1.6px;color:var(--amx-dim);font-weight:800}
.amx-an-txt strong{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.amx-an .amx-cta{padding:9px 14px;font-size:11.5px}

@media (max-width:720px){
  .amx-bb-grid{grid-template-columns:1fr;gap:18px;padding:22px 20px 18px}
  .amx-bb-side{align-items:stretch}
  .amx-bb-side .amx-cta{justify-content:center}
}
@media (prefers-reduced-motion:reduce){
  .amx-rec i,.amx-ticker div{animation:none}
  .amx-nc:hover{transform:none}
}
`;

function AmxStyles() {
  // React dedupes identical <style> children poorly, so key on an id and let the
  // browser ignore repeats. Cheap: the block is under 6KB.
  return <style data-amx="1">{AMX_CSS}</style>;
}

function SponsoredTag() {
  return (
    <span className="amx-tag">
      <b>SPONSORED</b> Amics Consulting Group
    </span>
  );
}

function Rec({ label = "AMICS CAM 01" }: { label?: string }) {
  return (
    <span className="amx-rec" aria-hidden="true">
      <i /> REC · {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Billboard: W-HOME-001
// ---------------------------------------------------------------------------
export function AmicsBillboard({ tier = "free" }: { tier?: Tier }) {
  if (atLeast(tier, "member")) return null;
  const loop = [...SERVICES, ...SERVICES];
  return (
    <a className="amx" href={AMICS_LINKS.billboard} target="_blank" rel="noopener sponsored"
       aria-label="Sponsored: Amics Consulting Group. Get a free marketing teardown.">
      <AmxStyles />
      <div className="amx-bb">
        <div className="amx-bb-grid">
          <div style={{ minWidth: 0 }}>
            <div className="amx-bb-top">
              <SponsoredTag />
              <Rec />
            </div>
            <h3>
              Great brands still get scrolled past. Make yours <span className="amx-mark">impossible to ignore.</span>
            </h3>
            <p>
              Paid media, AI systems and creative from a founder-operated NYC growth firm.
              Built for the brands this community is building. In English y en Español.
            </p>
            <div className="amx-proof">
              <div><strong>14 days</strong><span>Signature to live</span></div>
              <div><strong>$500M+</strong><span>Ad spend managed</span></div>
              <div><strong>EN / ES</strong><span>Fully bilingual</span></div>
            </div>
          </div>
          <div className="amx-bb-side">
            <span className="amx-cta">Get my free teardown <span>→</span></span>
            <span className="amx-fine">Free. No pitch deck. A plan you can use.</span>
          </div>
        </div>
        <div className="amx-ticker" aria-hidden="true">
          <div>{loop.map((s, i) => <span key={i}>{s} <em>✦</em></span>)}</div>
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Native card: W-HOME-002 / in-feed. Same footprint as a Den story card.
// ---------------------------------------------------------------------------
export function AmicsNativeCard({ tier = "free" }: { tier?: Tier }) {
  if (atLeast(tier, "inner_circle")) return null;
  return (
    <a className="amx" href={AMICS_LINKS.native} target="_blank" rel="noopener sponsored"
       aria-label="Sponsored: Amics Consulting Group. Find where your ad budget leaks.">
      <AmxStyles />
      <div className="amx-ncw">
      <article className="amx-nc">
        <div className="amx-nc-art">
          <Rec label="TEARDOWN" />
          <span className="amx-tc" aria-hidden="true">00:00:07:00</span>
          <div className="amx-nc-big"><small>FREE TEARDOWN</small>Find the leak.</div>
        </div>
        <div className="amx-nc-body">
          <SponsoredTag />
          <h3>Where is your ad budget actually going?</h3>
          <p>
            Most brands lose money in places they never check. Amics traces every dollar
            across Meta, Google, TikTok and email, then shows you the fixes. On the house.
          </p>
          <span className="amx-go">Get the free teardown →</span>
        </div>
      </article>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Right rail: honest scarcity + risk reversal
// ---------------------------------------------------------------------------
/** Pass the real number of filled Growth Partner seats to show the meter; omit it to hide the meter. */
export function AmicsRailCard({ tier = "free", seatsTaken }: { tier?: Tier; seatsTaken?: number }) {
  if (atLeast(tier, "pro")) return null;
  const showSeats = typeof seatsTaken === "number";
  const taken = Math.max(0, Math.min(3, seatsTaken ?? 0));
  return (
    <a className="amx" href={AMICS_LINKS.rail} target="_blank" rel="noopener sponsored"
       aria-label="Sponsored: Amics Consulting Group Growth Audit.">
      <AmxStyles />
      <div className="amx-rl">
        <SponsoredTag />
        <h3>Three partner seats. That's the whole roster.</h3>
        <p>Amics caps its Growth Partner roster so every brand gets the operators, not an account manager.</p>
        {showSeats && (
          <>
            <div className="amx-seats" aria-label={`${taken} of 3 seats taken`}>
              {[0, 1, 2].map(i => <i key={i} className={i < taken ? "" : "open"} />)}
            </div>
            <span className="amx-fine">{3 - taken} of 3 open</span>
          </>
        )}
        <ul>
          <li>Growth Audit in 7 business days</li>
          <li>Fee credited 100% to month one</li>
          <li>Live dashboards, 1-business-day replies</li>
        </ul>
        <span className="amx-cta">See the Growth Audit <span>→</span></span>
        <div className="amx-fine" style={{ marginTop: 12, position: "relative" }}>
          From the founder of The Innovators Den.
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Mobile anchor: W-HOME-005, Free tier only
// ---------------------------------------------------------------------------
export function AmicsMobileAnchor({ tier = "free" }: { tier?: Tier }) {
  if (atLeast(tier, "member")) return null;
  return (
    <a className="amx" href={AMICS_LINKS.anchor} target="_blank" rel="noopener sponsored"
       aria-label="Sponsored: Amics Consulting Group free teardown.">
      <AmxStyles />
      <div className="amx-an">
        <div className="amx-an-txt">
          <div>AD · AMICS</div>
          <strong>Make your brand impossible to ignore.</strong>
        </div>
        <span className="amx-cta">Free teardown <span>→</span></span>
      </div>
    </a>
  );
}
