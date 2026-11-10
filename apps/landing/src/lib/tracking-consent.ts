export const CONSENT_COOKIE = "am_consent";
export const CONSENT_STORAGE_KEY = "am_consent_v1";

export type TrackingConsent = {
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
};

const DENIED: TrackingConsent = { analytics: false, marketing: false, decided: false };

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
  return { ...DENIED };
}

export function readTrackingConsent(): TrackingConsent {
  try {
    const fromCookie = readCookie(CONSENT_COOKIE);
    if (fromCookie) {
      const parsed = JSON.parse(fromCookie) as TrackingConsent;
      if (typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
        return { ...parsed, decided: parsed.decided === true };
      }
    }
  } catch {
    /* yok say */
  }
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TrackingConsent;
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
