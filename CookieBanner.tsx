import { useState, useEffect } from "react";
import { Link } from "wouter";

const STORAGE_KEY = "tid_cookie_consent";

type ConsentState = "accepted" | "declined" | null;

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState;
    if (!stored) {
      // Slight delay so page renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    } else {
      setConsent(stored);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setConsent("declined");
    setVisible(false);
  }

  if (!visible || consent !== null) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: "#111",
      borderTop: "1px solid #222",
      padding: "1rem 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      flexWrap: "wrap",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color: "#ccc", fontSize: "0.85rem", margin: 0, flex: 1, minWidth: "240px", lineHeight: 1.6 }}>
        We use cookies to improve your experience and serve relevant ads.{" "}
        <Link href="/privacy#cookies" style={{ color: "#FFE600", textDecoration: "underline" }}>
          Learn more
        </Link>
        . By clicking "Accept All", you consent to our use of cookies. You can manage your preferences at any time.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: "transparent",
            border: "1px solid #444",
            color: "#aaa",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            background: "#FFE600",
            border: "none",
            color: "#000",
            padding: "0.5rem 1.25rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
