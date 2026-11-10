import { createHash } from "node:crypto";
import {
  META_EVENT_MAP,
  channelFromTouch,
  consentFromCookieHeader,
  toE164,
  type AnalyticsParams,
  type AttributionState,
  type TrackingConsent,
} from "@ada-merkez/shared";
import { analyticsDispatch, getDb, isDatabaseConfigured } from "@ada-merkez/db";

function sha256(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash("sha256").update(normalized).digest("hex");
}

function sha256Phone(value: string | null | undefined): string | undefined {
  const e164 = toE164(value ?? null);
  if (!e164) return undefined;
  return createHash("sha256").update(e164).digest("hex");
}

function metaEnabled() {
  return Boolean(process.env.META_PIXEL_ID?.trim() && process.env.META_CAPI_ACCESS_TOKEN?.trim());
}

function ga4Enabled() {
  return Boolean(
    process.env.GA4_MEASUREMENT_ID?.trim() || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim(),
  ) && Boolean(process.env.GA4_API_SECRET?.trim());
}

export function newEventId(): string {
  return crypto.randomUUID();
}

export function paramsFromAttribution(
  eventId: string,
  attribution?: AttributionState | null,
  extra?: Partial<AnalyticsParams>,
): AnalyticsParams {
  const last = attribution?.last;
  return {
    event_id: eventId,
    channel: extra?.channel ?? channelFromTouch(last ?? attribution?.first ?? null),
    ref: extra?.ref ?? last?.ref ?? attribution?.first?.ref ?? null,
    business_id: extra?.business_id ?? last?.businessId ?? null,
    city: extra?.city ?? null,
    segment: extra?.segment ?? null,
    content: extra?.content ?? last?.content ?? null,
  };
}

async function rememberDispatch(eventName: string, eventId: string, channel: string | null, payload: unknown) {
  if (!isDatabaseConfigured()) return;
  try {
    await getDb()
      .insert(analyticsDispatch)
      .values({ eventName, eventId, channel, payload })
      .onConflictDoNothing();
  } catch {
    /* atlama: ölçüm kaydı asla isteği düşürmez */
  }
}

export function serverTrackingConsent(request?: Request): TrackingConsent {
  return consentFromCookieHeader(request?.headers.get("cookie") ?? null);
}

export async function dispatchServerEvents(input: {
  eventName: string;
  eventId: string;
  params: AnalyticsParams;
  email?: string | null;
  phone?: string | null;
  request?: Request;
}): Promise<void> {
  const cookie = serverTrackingConsent(input.request);
  const analyticsConsent = cookie.analytics === true;
  const marketingConsent = cookie.marketing === true;
  await rememberDispatch(input.eventName, input.eventId, input.params.channel ?? null, {
    params: input.params,
    analyticsConsent,
    marketingConsent,
  });
  const metaName = META_EVENT_MAP[input.eventName] ?? input.eventName;
  const hashed = marketingConsent
    ? { email: input.email, phone: input.phone }
    : { email: undefined, phone: undefined };
  await Promise.all([
    marketingConsent ? sendMetaCapi(metaName, { ...input, ...hashed }) : Promise.resolve(),
    analyticsConsent ? sendGa4(input.eventName, input) : Promise.resolve(),
  ]);
}

async function sendMetaCapi(
  eventName: string,
  input: { eventId: string; params: AnalyticsParams; email?: string | null; phone?: string | null },
) {
  if (!metaEnabled()) return;
  const pixelId = process.env.META_PIXEL_ID!.trim();
  const token = process.env.META_CAPI_ACCESS_TOKEN!.trim();
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
        user_data: {
          em: sha256(input.email),
          ph: sha256Phone(input.phone),
        },
        custom_data: {
          content_name: input.params.content ?? input.params.channel,
          city: input.params.city,
          status: input.params.segment,
        },
      },
    ],
  };
  if (testCode) payload.test_event_code = testCode;
  try {
    await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    /* sessiz */
  }
}

async function sendGa4(
  eventName: string,
  input: { eventId: string; params: AnalyticsParams },
) {
  if (!ga4Enabled()) return;
  const measurementId =
    process.env.GA4_MEASUREMENT_ID?.trim() || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  const apiSecret = process.env.GA4_API_SECRET?.trim();
  if (!measurementId || !apiSecret) return;
  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: input.eventId,
          events: [
            {
              name: eventName,
              params: {
                engagement_time_msec: 1,
                session_id: input.eventId.replaceAll("-", "").slice(0, 10),
                city: input.params.city ?? undefined,
                segment: input.params.segment ?? undefined,
                channel: input.params.channel ?? undefined,
                business_id: input.params.business_id ?? undefined,
                ref: input.params.ref ?? undefined,
                event_id: input.eventId,
              },
            },
          ],
        }),
      },
    );
  } catch {
    /* sessiz */
  }
}
