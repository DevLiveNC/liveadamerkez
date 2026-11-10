import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_STORAGE_KEY,
  ATTRIBUTION_WINDOW_DAYS,
  isReferralCode,
  mergeAttribution,
  parseStoredAttribution,
  touchFromSearchParams,
  type AttributionState,
  type TouchPoint,
} from "@ada-merkez/shared";
import { readTrackingConsent } from "./tracking-consent";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  const maxAge = ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

function sanitizeTouch(touch: TouchPoint | null): TouchPoint | null {
  if (!touch) return null;
  if (touch.ref && !isReferralCode(touch.ref)) {
    return { ...touch, ref: null };
  }
  return touch;
}

function readStored(): AttributionState | null {
  if (!readTrackingConsent().analytics) return null;
  try {
    const fromCookie = readCookie(ATTRIBUTION_COOKIE);
    if (fromCookie) return parseStoredAttribution(JSON.parse(fromCookie));
  } catch {
    /* bozuk çerez yok sayılır */
  }
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (raw) return parseStoredAttribution(JSON.parse(raw));
  } catch {
    /* yok say */
  }
  return null;
}

function persist(state: AttributionState) {
  if (!readTrackingConsent().analytics) return;
  const json = JSON.stringify({
    first: sanitizeTouch(state.first),
    last: sanitizeTouch(state.last),
  });
  writeCookie(ATTRIBUTION_COOKIE, json);
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, json);
  } catch {
    /* gizli mod */
  }
}

export function captureAttribution(injected?: TouchPoint | null): AttributionState {
  const stored = readStored();
  const fromUrl = touchFromSearchParams(new URLSearchParams(window.location.search));
  const incoming = sanitizeTouch(injected ?? fromUrl);
  const next = mergeAttribution(stored, incoming);
  next.first = sanitizeTouch(next.first);
  next.last = sanitizeTouch(next.last);
  persist(next);
  return next;
}

export function readAttribution(): AttributionState {
  return readStored() ?? { first: null, last: null };
}
