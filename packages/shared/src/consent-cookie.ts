export const CONSENT_COOKIE = "am_consent";

export type TrackingConsent = {
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
};

export const DENIED_TRACKING_CONSENT: TrackingConsent = {
  analytics: false,
  marketing: false,
  decided: false,
};

export function parseTrackingConsentJson(raw: string | null | undefined): TrackingConsent {
  if (!raw) return { ...DENIED_TRACKING_CONSENT };
  try {
    const parsed = JSON.parse(raw) as TrackingConsent;
    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return { ...DENIED_TRACKING_CONSENT };
    }
    return {
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      decided: parsed.decided === true,
    };
  } catch {
    return { ...DENIED_TRACKING_CONSENT };
  }
}

export function consentFromCookieHeader(cookieHeader: string | null | undefined): TrackingConsent {
  if (!cookieHeader) return { ...DENIED_TRACKING_CONSENT };
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    if (name !== CONSENT_COOKIE) continue;
    try {
      return parseTrackingConsentJson(decodeURIComponent(part.slice(idx + 1).trim()));
    } catch {
      return { ...DENIED_TRACKING_CONSENT };
    }
  }
  return { ...DENIED_TRACKING_CONSENT };
}

export function encodeConsentCookie(value: TrackingConsent): string {
  return `${CONSENT_COOKIE}=${encodeURIComponent(
    JSON.stringify({
      analytics: value.analytics,
      marketing: value.marketing,
      decided: value.decided,
    }),
  )}`;
}
