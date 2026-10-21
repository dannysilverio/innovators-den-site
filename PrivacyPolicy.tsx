import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

const EFFECTIVE_DATE = "March 23, 2026";
const CONTACT_EMAIL = "danny@amicsconsultinggroup.com";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: "2.5rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFE600", borderBottom: "1px solid #333", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>{title}</h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "#ccc", lineHeight: 1.7, marginBottom: "0.75rem", fontSize: "0.95rem" }}>{children}</p>;
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ color: "#ccc", lineHeight: 1.7, paddingLeft: "1.5rem", marginBottom: "0.75rem" }}>
      {items.map((item, i) => <li key={i} style={{ marginBottom: "0.4rem", fontSize: "0.95rem" }}>{item}</li>)}
    </ul>
  );
}

function DataTable({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr>
            <th style={{ background: "#1a1a1a", color: "#FFE600", padding: "0.6rem 1rem", textAlign: "left", borderBottom: "1px solid #333", width: "30%" }}>Category</th>
            <th style={{ background: "#1a1a1a", color: "#FFE600", padding: "0.6rem 1rem", textAlign: "left", borderBottom: "1px solid #333" }}>Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([cat, detail], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#0d0d0d" : "#111" }}>
              <td style={{ padding: "0.6rem 1rem", color: "#fff", fontWeight: 600, borderBottom: "1px solid #222", verticalAlign: "top" }}>{cat}</td>
              <td style={{ padding: "0.6rem 1rem", color: "#bbb", borderBottom: "1px solid #222", verticalAlign: "top" }}>{detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#111", borderLeft: "3px solid #FFE600", padding: "1rem 1.25rem", marginBottom: "1.25rem", borderRadius: "0 6px 6px 0" }}>
      {children}
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — The Innovators Den</title>
        <meta name="description" content="Privacy Policy for The Innovators Den — how we collect, use, and protect your data." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div style={{ background: "#000", minHeight: "100vh", color: "#fff", fontFamily: "Arial, sans-serif" }}>
        {/* Nav bar */}
        <nav style={{ borderBottom: "1px solid #222", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", position: "sticky", top: 0, background: "#000", zIndex: 100 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ color: "#FFE600", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.05em" }}>THE INNOVATORS DEN</span>
          </Link>
          <Link href="/" style={{ color: "#999", fontSize: "0.875rem", textDecoration: "none" }}>← Back to Home</Link>
        </nav>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#FFE600", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Legal</div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>Privacy Policy</h1>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>Effective Date: {EFFECTIVE_DATE}</p>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>www.theinnovatorsden.net</p>
          </div>

          <InfoBox>
            <P><strong style={{ color: "#FFE600" }}>Your privacy matters to us.</strong></P>
            <P>This Privacy Policy explains what information The Innovators Den collects, how we use it, who we share it with, and the choices you have. Please read it carefully. By using our app, website, or services, you agree to the practices described in this document.</P>
            <P>Questions? Contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FFE600" }}>{CONTACT_EMAIL}</a></P>
          </InfoBox>

          {/* TOC */}
          <div style={{ background: "#0d0d0d", border: "1px solid #222", borderRadius: "8px", padding: "1.25rem 1.5rem", marginBottom: "3rem" }}>
            <p style={{ color: "#FFE600", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>TABLE OF CONTENTS</p>
            {[
              ["#who", "1. Who We Are"],
              ["#collect", "2. Information We Collect"],
              ["#use", "3. How We Use Your Information"],
              ["#legal-basis", "4. Legal Basis for Processing"],
              ["#share", "5. How We Share Your Information"],
              ["#retention", "6. Data Retention"],
              ["#security", "7. Data Security"],
              ["#cookies", "8. Cookies & Tracking Technologies"],
              ["#children", "9. Children's Privacy"],
              ["#transfers", "10. International Data Transfers"],
              ["#rights", "11. Your Privacy Rights"],
              ["#third-party", "12. Third-Party Services & Links"],
              ["#subscriptions", "13. Subscription-Specific Terms"],
              ["#contact", "14. Contact Us"],
              ["#updates", "15. Updates to This Policy"],
            ].map(([href, label]) => (
              <a key={href} href={href} style={{ display: "block", color: "#ccc", fontSize: "0.875rem", textDecoration: "none", padding: "0.2rem 0", lineHeight: 1.6 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFE600")}
                onMouseLeave={e => (e.currentTarget.style.color = "#ccc")}>
                {label}
              </a>
            ))}
          </div>

          {/* 1 */}
          <Section id="who" title="1. Who We Are">
            <P>The Innovators Den ("we," "us," or "our") is a next-generation media network and news aggregation platform owned and operated by Danny Silverio and Osvaldo Rodriguez, headquartered in New York, NY, United States. We operate through:</P>
            <Ul items={[
              "Our web platform at theinnovatorsden.net",
              "Our mobile application (The Innovators Den App)",
              "The Innovators Den Podcast and associated content",
              "Any related services, features, or communications (collectively, the Services)",
            ]} />
            <P>For purposes of this Privacy Policy, "you" or "user" refers to any person who accesses or uses our Services, whether as a free user, subscriber, content contributor, advertiser, or visitor.</P>
          </Section>

          {/* 2 */}
          <Section id="collect" title="2. Information We Collect">
            <P>We collect information in three ways: information you provide directly, information collected automatically, and information from third parties.</P>
            <Sub title="2.1 Information You Provide Directly">
              <P>When you create an account, subscribe, or interact with our Services, you may provide:</P>
              <DataTable rows={[
                ["Account Information", "Name, email address, username, password (hashed), profile photo, bio"],
                ["Subscription & Billing", "Payment method details (processed by Stripe), billing address, subscription tier, transaction history"],
                ["Profile Preferences", "Topic interests, followed categories (Innovation, Art, Culture, Music, Business, Sports, Food & Wine, Health, Travel, Astrology, Law)"],
                ["User-Generated Content", "Saved articles, curated collections, newsletter responses"],
                ["Communications", "Messages to our support team, responses to surveys, feedback submissions"],
                ["Identity Verification", "Date of birth (for age-restricted content), country of residence"],
              ]} />
            </Sub>
            <Sub title="2.2 Information Collected Automatically">
              <P>When you use our Services, we automatically collect:</P>
              <DataTable rows={[
                ["Device Information", "Device type, operating system and version, browser type, screen resolution, device identifiers (IDFA, GAID, or equivalent)"],
                ["Usage Data", "Pages and articles viewed, time spent per article, scroll depth, search queries, clicked links, features used, session duration"],
                ["Log Data", "IP address, access timestamps, referring URLs, error logs, API request logs"],
                ["Location Data", "General geographic location derived from IP address (city/country level). We do not collect precise GPS location unless explicitly granted."],
                ["Cookies & Tracking", "Session cookies, persistent cookies, pixel tags, local storage tokens. See Section 8 for full details."],
                ["Ad Interaction Data", "Impressions served, ad clicks, ad skip behavior, programmatic ad auction data"],
                ["Performance Metrics", "App crash reports, load times, feature error rates"],
              ]} />
            </Sub>
            <Sub title="2.3 Information from Third Parties">
              <P>We may receive information about you from:</P>
              <Ul items={[
                <><strong>Authentication Providers</strong> — If you sign in with Google or Apple, we receive your name, email address, and profile photo from that provider.</>,
                <><strong>Payment Processors</strong> — Stripe provides confirmation of successful transactions and subscription status. We do not store full card numbers.</>,
                <><strong>Analytics Partners</strong> — Aggregated or pseudonymized behavioral data to understand content performance.</>,
                <><strong>Advertising Partners</strong> — Our programmatic advertising infrastructure may share aggregate audience segment data for ad targeting.</>,
                <><strong>Content Sources</strong> — Our news aggregation engine collects publicly available article metadata (headline, summary, source URL, publication date) from third-party publishers.</>,
              ]} />
            </Sub>
          </Section>

          {/* 3 */}
          <Section id="use" title="3. How We Use Your Information">
            <Sub title="3.1 Providing and Improving the Services">
              <Ul items={[
                "Create and manage your user account and subscription",
                "Deliver personalized news feeds based on your topic interests and reading history",
                "Process payments, manage billing cycles, and enforce subscription access levels",
                "Enable saved articles, topic follows, and reading collections",
                "Send push notifications for followed topics (with your consent)",
                "Operate and improve our content moderation and editorial quality systems",
              ]} />
            </Sub>
            <Sub title="3.2 Communications">
              <Ul items={[
                "Send transactional emails (account confirmation, password reset, payment receipts)",
                "Deliver newsletter digest (only if subscribed)",
                "Send product updates and new feature announcements",
                "Respond to your support requests and feedback",
              ]} />
              <P>You may opt out of non-transactional communications at any time via the unsubscribe link in any email or through your account settings.</P>
            </Sub>
            <Sub title="3.3 Advertising">
              <P>The Innovators Den operates a freemium model supported in part by advertising. We use collected data to:</P>
              <Ul items={[
                "Serve contextual and interest-based advertisements through our programmatic advertising infrastructure",
                "Measure ad performance, including impressions, click-through rates, and viewability",
                "Share pseudonymized audience segments with SSP and DSP partners for ad targeting",
                "Enforce frequency capping to limit repetitive ad exposure",
              ]} />
            </Sub>
            <Sub title="3.4 Analytics and Research">
              <Ul items={[
                "Analyze content performance, readership trends, and platform health",
                "Build internal dashboards to monitor subscriber growth, engagement, and churn",
                "Conduct A/B testing of features, layouts, and content formats",
                "Generate anonymized aggregate reports about audience demographics and interests",
              ]} />
            </Sub>
            <Sub title="3.5 Safety, Security, and Compliance">
              <Ul items={[
                "Detect and prevent fraud, unauthorized access, and abuse of the Services",
                "Enforce our Terms of Service and Community Guidelines",
                "Respond to legal requests, court orders, or regulatory inquiries",
                "Protect the rights, property, and safety of The Innovators Den, our users, and the public",
              ]} />
            </Sub>
          </Section>

          {/* 4 */}
          <Section id="legal-basis" title="4. Legal Basis for Processing Your Data">
            <P>For users in the European Economic Area (EEA), United Kingdom, or other jurisdictions with similar laws, we rely on the following legal bases under GDPR:</P>
            <DataTable rows={[
              ["Contractual Necessity", "Processing required to fulfill your subscription and deliver the Services you requested (account management, content delivery, billing)"],
              ["Legitimate Interests", "Analytics, product improvement, fraud prevention, and direct marketing to existing users (where permitted and not overridden by your rights)"],
              ["Consent", "Interest-based advertising, push notifications, non-essential cookies, and marketing communications — you may withdraw consent at any time"],
              ["Legal Obligation", "Processing required to comply with applicable law, regulation, or court order"],
            ]} />
            <P>For California residents, please see Section 11 for additional CCPA/CPRA disclosures and rights.</P>
          </Section>

          {/* 5 */}
          <Section id="share" title="5. How We Share Your Information">
            <P><strong style={{ color: "#fff" }}>We do not sell your personal information.</strong> We share your information only in the following circumstances:</P>
            <Sub title="5.1 Service Providers">
              <Ul items={[
                <><strong>Cloud Infrastructure:</strong> Database, authentication, and storage providers</>,
                <><strong>Payments:</strong> Stripe (billing, subscription management, fraud detection)</>,
                <><strong>Email & Communications:</strong> Email service providers for transactional and marketing messages</>,
                <><strong>Analytics:</strong> Crash reporting, performance monitoring, and behavioral analytics platforms</>,
                <><strong>Content Delivery:</strong> CDN providers for fast asset delivery</>,
                <><strong>Advertising Technology:</strong> SSP partners for programmatic ad serving</>,
              ]} />
              <P>All service providers are contractually required to use your data only to provide services to us and to maintain appropriate security measures.</P>
            </Sub>
            <Sub title="5.2 Advertising Partners">
              <Ul items={[
                "We share pseudonymized identifiers and interest segments (not your name or email) with advertising partners",
                "Ad partners may set their own cookies or pixels subject to their own privacy policies",
                "You may opt out of interest-based advertising through your account settings or via the NAI opt-out at optout.networkadvertising.org",
              ]} />
            </Sub>
            <Sub title="5.3 Business Transfers">
              <P>If The Innovators Den is involved in a merger, acquisition, asset sale, or bankruptcy proceeding, your information may be transferred as part of that transaction. We will notify you via email or a prominent notice on the platform prior to any such transfer.</P>
            </Sub>
            <Sub title="5.4 Legal Requirements">
              <Ul items={[
                "Comply with a valid legal process (subpoena, court order, or warrant)",
                "Respond to verified government or regulatory requests",
                "Protect the safety, rights, or property of The Innovators Den, our users, or the public",
                "Detect, prevent, or address fraud, security, or technical issues",
              ]} />
            </Sub>
            <Sub title="5.5 With Your Consent">
              <P>We may share information for other purposes with your explicit consent, which you may withdraw at any time.</P>
            </Sub>
          </Section>

          {/* 6 */}
          <Section id="retention" title="6. Data Retention">
            <P>We retain your information for as long as necessary to provide the Services, comply with legal obligations, resolve disputes, and enforce our agreements.</P>
            <DataTable rows={[
              ["Active Account Data", "Retained for the lifetime of your account plus 30 days after deletion request"],
              ["Billing & Transaction Records", "7 years (required for tax and accounting compliance)"],
              ["Usage Logs & Analytics", "Aggregated: indefinitely. Raw event logs: 12 months rolling"],
              ["Advertising Data", "Pseudonymized: 12 months. Aggregated campaign reports: indefinitely"],
              ["Support Communications", "3 years from last interaction"],
              ["Inactive Accounts", "Accounts with no login activity for 24 consecutive months may be archived or deleted after 30 days' notice"],
            ]} />
            <P>When you delete your account, we will remove your personal data from our active systems within 30 days, except where retention is required by law or for legitimate business purposes such as fraud prevention.</P>
          </Section>

          {/* 7 */}
          <Section id="security" title="7. Data Security">
            <P>We implement the following security measures to protect your personal data:</P>
            <Ul items={[
              <><strong>Encryption in transit:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher</>,
              <><strong>Encryption at rest:</strong> Personal data is encrypted at rest using AES-256</>,
              <><strong>Authentication security:</strong> Passwords are hashed using bcrypt. We support multi-factor authentication (MFA) for all accounts.</>,
              <><strong>Access controls:</strong> Row-Level Security (RLS) policies ensure users can only access their own data. Admin access is restricted and logged.</>,
              <><strong>Vulnerability management:</strong> Regular security reviews, dependency audits, and penetration testing</>,
              <><strong>Incident response:</strong> In the event of a data breach affecting your rights, we will notify you and relevant authorities within 72 hours as required by applicable law.</>,
            ]} />
            <P>No method of transmission over the internet or electronic storage is 100% secure. While we use commercially reasonable means to protect your data, we cannot guarantee absolute security.</P>
          </Section>

          {/* 8 */}
          <Section id="cookies" title="8. Cookies & Tracking Technologies">
            <P>We use cookies, pixels, and similar technologies to operate and improve the Services:</P>
            <DataTable rows={[
              ["Strictly Necessary", "Session management, authentication tokens, security (CSRF protection). Cannot be disabled — required for the platform to function."],
              ["Functional / Preference", "Remembering your theme setting, language preference, notification preferences."],
              ["Analytics", "Measuring page views, session lengths, feature usage, and content engagement. Data is aggregated and pseudonymized."],
              ["Advertising", "Enabling programmatic ad serving, frequency capping, and audience segmentation. Only on the free tier. Requires your consent in applicable jurisdictions."],
            ]} />
            <Sub title="8.1 Managing Cookies">
              <Ul items={[
                "Our cookie consent banner (shown on first visit in applicable jurisdictions)",
                "Your browser settings — most browsers allow you to refuse or delete cookies",
                "Your account privacy settings (to manage advertising preferences)",
                "The NAI opt-out tool at optout.networkadvertising.org",
              ]} />
              <P>Note: disabling certain cookies may impair the functionality of the Services.</P>
            </Sub>
          </Section>

          {/* 9 */}
          <Section id="children" title="9. Children's Privacy">
            <InfoBox>
              <P><strong style={{ color: "#FFE600" }}>The Innovators Den is not directed to children under the age of 13 (or under 16 in the EEA/UK).</strong></P>
              <P>We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FFE600" }}>{CONTACT_EMAIL}</a> and we will promptly delete that information from our systems.</P>
              <P>We comply with the Children's Online Privacy Protection Act (COPPA) and applicable international equivalents.</P>
            </InfoBox>
          </Section>

          {/* 10 */}
          <Section id="transfers" title="10. International Data Transfers">
            <P>The Innovators Den is based in the United States. If you access our Services from outside the United States, your information will be transferred to and processed in the United States, where data protection laws may differ from those in your country.</P>
            <P>For users in the EEA or UK, we rely on the following transfer mechanisms:</P>
            <Ul items={[
              "Standard Contractual Clauses (SCCs) adopted by the European Commission, incorporated into our agreements with service providers located outside the EEA",
              "The UK International Data Transfer Agreement (IDTA) where applicable",
            ]} />
          </Section>

          {/* 11 */}
          <Section id="rights" title="11. Your Privacy Rights">
            <Sub title="11.1 Rights for All Users">
              <Ul items={[
                <><strong>Access:</strong> Request a copy of the personal information we hold about you</>,
                <><strong>Correction:</strong> Ask us to correct inaccurate or incomplete information</>,
                <><strong>Deletion:</strong> Request deletion of your account and personal data (subject to legal retention requirements)</>,
                <><strong>Data Portability:</strong> Receive a machine-readable copy of your data</>,
                <><strong>Opt-Out of Marketing:</strong> Unsubscribe from marketing emails at any time</>,
                <><strong>Withdraw Consent:</strong> Withdraw previously given consent for non-essential data processing</>,
              ]} />
            </Sub>
            <Sub title="11.2 California Residents (CCPA / CPRA)">
              <P>If you are a California resident, you have additional rights:</P>
              <Ul items={[
                <><strong>Right to Know:</strong> Request disclosure of the categories and specific pieces of personal information collected about you</>,
                <><strong>Right to Delete:</strong> Request deletion of personal information we have collected (subject to exceptions)</>,
                <><strong>Right to Correct:</strong> Request correction of inaccurate personal information</>,
                <><strong>Right to Opt-Out of Sale/Sharing:</strong> We do not sell personal information. You may opt out of cross-context behavioral advertising via our privacy settings or the Global Privacy Control (GPC) signal.</>,
                <><strong>Non-Discrimination:</strong> You will not receive discriminatory treatment for exercising your privacy rights.</>,
              ]} />
              <P>To submit a CCPA/CPRA request, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FFE600" }}>{CONTACT_EMAIL}</a>. We will respond within 45 days.</P>
            </Sub>
            <Sub title="11.3 EEA, UK & Swiss Residents (GDPR / UK GDPR)">
              <P>If you are located in the EEA, United Kingdom, or Switzerland, you have the following rights under GDPR:</P>
              <Ul items={[
                "Right of access (Article 15)",
                "Right to rectification (Article 16)",
                "Right to erasure / right to be forgotten (Article 17)",
                "Right to restriction of processing (Article 18)",
                "Right to data portability (Article 20)",
                "Right to object to processing based on legitimate interests or for direct marketing (Article 21)",
                "Rights related to automated decision-making and profiling (Article 22)",
              ]} />
              <P>You also have the right to lodge a complaint with your local data protection authority. In the UK, the relevant authority is the Information Commissioner's Office (ICO) at ico.org.uk.</P>
              <P>Our Data Protection contact for GDPR purposes is: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FFE600" }}>{CONTACT_EMAIL}</a></P>
            </Sub>
            <Sub title="11.4 How to Submit a Privacy Request">
              <Ul items={[
                <>Email us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FFE600" }}>{CONTACT_EMAIL}</a> with the subject line "Privacy Request"</>,
                "Include your full name, the email address associated with your account, and a description of your request",
                "We may ask you to verify your identity before processing the request",
                "We will respond within 30 days (or 45 days for CCPA requests)",
              ]} />
            </Sub>
          </Section>

          {/* 12 */}
          <Section id="third-party" title="12. Third-Party Services and Links">
            <P>Our Services contain links to third-party websites, podcasts, and content sources. When you click a link to a third-party site, you leave our platform and their privacy policy governs the collection of your data. We are not responsible for the privacy practices of third parties.</P>
            <P>Our application integrates with the following categories of third-party services, each subject to their own privacy policy:</P>
            <Ul items={[
              "Podcast platforms (Spotify, Apple Podcasts, iHeart Radio, YouTube)",
              "Social media platforms (Instagram, Facebook, TikTok, LinkedIn)",
              "Payment processing (Stripe)",
              "Authentication providers (Google, Apple Sign-In)",
              "Cloud infrastructure providers",
              "Programmatic advertising technology (SSP and DSP partners)",
            ]} />
          </Section>

          {/* 13 */}
          <Section id="subscriptions" title="13. Subscription-Specific Privacy Terms">
            <Sub title="13.1 Free Tier">
              <P>Free-tier users are subject to interest-based advertising. We use behavioral data (reading history, topics followed, device information) to serve relevant ads through our programmatic advertising infrastructure. You may opt out of interest-based advertising in your account settings.</P>
            </Sub>
            <Sub title="13.2 Paid Subscribers">
              <P>Paid subscribers benefit from enhanced privacy controls including the ability to limit the use of reading history for ad targeting and download their data archive in a machine-readable format.</P>
            </Sub>
            <Sub title="13.3 AI Features">
              <P>Where AI features are used to generate summaries or recommendations:</P>
              <Ul items={[
                "Your reading history and topic preferences may be processed to generate personalized output",
                "Article text submitted for summarization is processed and not stored beyond the immediate session",
                "We do not use your personal data to train third-party AI models without your explicit consent",
              ]} />
            </Sub>
          </Section>

          {/* 14 */}
          <Section id="contact" title="14. Contact Us">
            <P>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</P>
            <InfoBox>
              <P><strong style={{ color: "#fff" }}>The Innovators Den — Privacy Team</strong></P>
              <P style={{ margin: 0 }}>Attn: Danny Silverio</P>
              <P style={{ margin: 0 }}>New York, NY, United States</P>
              <P style={{ margin: 0 }}>Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FFE600" }}>{CONTACT_EMAIL}</a></P>
              <P style={{ margin: 0 }}>Website: <a href="https://theinnovatorsden.net" style={{ color: "#FFE600" }}>www.theinnovatorsden.net</a></P>
            </InfoBox>
          </Section>

          {/* 15 */}
          <Section id="updates" title="15. Updates to This Privacy Policy">
            <P>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:</P>
            <Ul items={[
              "Post the updated policy on this page with a new effective date",
              "Send an email notification to registered users at least 14 days before the change takes effect",
              "Display a prominent in-app notice for significant changes",
            ]} />
            <P>Your continued use of the Services after the effective date of any update constitutes your acceptance of the revised Privacy Policy. Previous versions are available upon request by emailing <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#FFE600" }}>{CONTACT_EMAIL}</a>.</P>
          </Section>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #222", paddingTop: "1.5rem", textAlign: "center", color: "#555", fontSize: "0.8rem" }}>
            © 2026 The Innovators Den. Effective: {EFFECTIVE_DATE}. All Rights Reserved.
          </div>
        </div>
      </div>
    </>
  );
}
