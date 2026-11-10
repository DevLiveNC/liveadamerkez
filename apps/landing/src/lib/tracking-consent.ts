import {
  CONSENT_COOKIE,
  parseTrackingConsentJson,
  type TrackingConsent,
} from "@ada-merkez/shared";

export { CONSENT_COOKIE };
export type { TrackingConsent };

export const CONSENT_STORAGE_KEY = "am_consent_v1";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${60 * 60 * 24 * 400}; Path=/; SameSite=Lax${secure}`;
}

export function defaultTrackingConsent(): TrackingConsent {
  return { analytics: false, marketing: false, decided: false };
}

export function readTrackingConsent(): TrackingConsent {
  try {
    const fromCookie = readCookie(CONSENT_COOKIE);
    if (fromCookie) return parseTrackingConsentJson(fromCookie);
  } catch {
    /* yok say */
  }
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) return parseTrackingConsentJson(raw);
  } catch {
    /* yok say */
  }
  return defaultTrackingConsent();
}

export function persistTrackingConsent(next: TrackingConsent) {
  const json = JSON.stringify(next);
  writeCookie(CONSENT_COOKIE, json);
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, json);
  } catch {
    /* gizli mod */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("am-consent", { detail: next }));
  }
}

export function acceptTrackingConsent() {
  persistTrackingConsent({ analytics: true, marketing: true, decided: true });
}

export function rejectTrackingConsent() {
  persistTrackingConsent({ analytics: false, marketing: false, decided: true });
}

export function saveTrackingPreferences(input: { analytics: boolean; marketing: boolean }) {
  persistTrackingConsent({
    analytics: input.analytics,
    marketing: input.marketing,
    decided: true,
  });
}
