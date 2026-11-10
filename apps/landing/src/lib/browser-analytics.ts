import { META_EVENT_MAP, type AnalyticsParams } from "@ada-merkez/shared";
import { apiBase } from "./api";
import { readTrackingConsent } from "./tracking-consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function pixelId(): string {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
}

export function ga4Id(): string {
  return process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() ?? "";
}

export function trackBrowserEvent(
  eventName: string,
  params: AnalyticsParams,
  opts?: { clientOnly?: boolean },
) {
  const eventId = params.event_id;
  try {
    if (pixelId() && typeof window.fbq === "function") {
      const meta = META_EVENT_MAP[eventName] ?? "Lead";
      window.fbq("track", meta, { content_name: eventName, ...params }, { eventID: eventId });
    }
  } catch {
    /* sessiz */
  }
  try {
    if (ga4Id() && typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        city: params.city,
        segment: params.segment,
        channel: params.channel,
        business_id: params.business_id,
        ref: params.ref,
        event_id: eventId,
      });
    }
  } catch {
    /* sessiz */
  }
  if (opts?.clientOnly) return;
  const consent = readTrackingConsent();
  if (!consent.analytics && !consent.marketing) return;
  const base = apiBase();
  if (!base) return;
  void fetch(`${base}/v1/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      eventName,
      eventId,
      ...params,
    }),
    keepalive: true,
  }).catch(() => undefined);
}
