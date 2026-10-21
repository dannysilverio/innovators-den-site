const API_BASE = import.meta.env.VITE_API_URL ?? "";

type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: {
      track(name: string, data?: AnalyticsData): void;
    };
  }
}

export type TidEventType =
  | "upgrade_click"
  | "subscription_success"
  | "paywall_shown"
  | "paywall_dismissed"
  | "billing_toggle";

function hasTrackingConsent(): boolean {
  try {
    return localStorage.getItem("tid_cookie_consent") === "accepted";
  } catch {
    return false;
  }
}

export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === "undefined" || !hasTrackingConsent()) return;
  try {
    window.umami?.track(name, data);
  } catch {
    // Analytics must never interrupt the user's action.
  }
}

export function trackTid(
  userId: string | undefined,
  eventType: TidEventType,
  metadata?: Record<string, unknown>
): void {
  if (!userId) return;
  if (!hasTrackingConsent()) return;
  fetch(`${API_BASE}/api/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: userId, eventType, metadata: metadata ?? {} }),
  }).catch(() => {});
}
