/** İlk/son temas penceresi. Parametresiz gezide ilk temas bu süre unutulmaz. */
export const ATTRIBUTION_WINDOW_DAYS = 30;
export const ATTRIBUTION_COOKIE = "am_attr";
export const ATTRIBUTION_STORAGE_KEY = "am_attr_v1";

export type TouchPoint = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  ref: string | null;
  businessId: string | null;
  capturedAt: string;
};

export type AttributionState = {
  first: TouchPoint | null;
  last: TouchPoint | null;
};

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"] as const;

export function sanitizeAttrValue(raw: unknown, max = 80): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, max);
  return cleaned || null;
}

export function hasTouchPayload(touch: Partial<TouchPoint> | null | undefined): boolean {
  if (!touch) return false;
  return Boolean(
    touch.source || touch.medium || touch.campaign || touch.content || touch.term || touch.ref || touch.businessId,
  );
}

export function touchFromSearchParams(
  params: URLSearchParams | Record<string, string | undefined>,
  now = new Date(),
): TouchPoint | null {
  const get = (key: string) => {
    if (params instanceof URLSearchParams) return params.get(key);
    return params[key];
  };
  const touch: TouchPoint = {
    source: sanitizeAttrValue(get("utm_source")),
    medium: sanitizeAttrValue(get("utm_medium")),
    campaign: sanitizeAttrValue(get("utm_campaign")),
    content: sanitizeAttrValue(get("utm_content")),
    term: sanitizeAttrValue(get("utm_term")),
    ref: sanitizeAttrValue(get("ref"), 32),
    businessId: sanitizeAttrValue(get("business_id") ?? get("isletme"), 64),
    capturedAt: now.toISOString(),
  };
  return hasTouchPayload(touch) ? touch : null;
}

export function emptyTouch(now = new Date()): TouchPoint {
  return {
    source: null,
    medium: null,
    campaign: null,
    content: null,
    term: null,
    ref: null,
    businessId: null,
    capturedAt: now.toISOString(),
  };
}

function isExpired(touch: TouchPoint | null, now: Date): boolean {
  if (!touch?.capturedAt) return true;
  const at = Date.parse(touch.capturedAt);
  if (Number.isNaN(at)) return true;
  return now.getTime() - at > ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export function mergeAttribution(
  stored: AttributionState | null,
  incoming: TouchPoint | null,
  now = new Date(),
): AttributionState {
  const prev: AttributionState = stored ?? { first: null, last: null };
  if (!incoming) {
    return {
      first: isExpired(prev.first, now) ? null : prev.first,
      last: prev.last,
    };
  }
  const firstExpired = isExpired(prev.first, now);
  return {
    first: !prev.first || firstExpired ? incoming : prev.first,
    last: incoming,
  };
}

export function parseStoredAttribution(raw: unknown): AttributionState | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as { first?: TouchPoint | null; last?: TouchPoint | null };
  return { first: obj.first ?? null, last: obj.last ?? null };
}

export function channelFromTouch(touch: TouchPoint | null): string | null {
  if (!touch) return null;
  if (touch.source === "qr") return `qr:${touch.content ?? touch.campaign ?? "unknown"}`;
  return touch.source ?? touch.medium ?? null;
}

export { KEYS as ATTRIBUTION_QUERY_KEYS };
