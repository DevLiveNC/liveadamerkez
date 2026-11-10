import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import {
  RETENTION_DAYS,
  WAITLIST_CITIES,
  WAITLIST_SEGMENTS,
  isWaitlistOpen,
  parseStoredAttribution,
  toE164,
} from "@ada-merkez/shared";
import {
  isDatabaseConfigured,
  recordConsent,
  upsertWaitlistEntry,
} from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../lib/http";
import { dispatchServerEvents, paramsFromAttribution } from "../../../lib/analytics";
import { limitRequest } from "../../../lib/rate-limit";

export const dynamic = "force-dynamic";

const Touch = z
  .object({
    source: z.string().nullable().optional(),
    medium: z.string().nullable().optional(),
    campaign: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    term: z.string().nullable().optional(),
    ref: z.string().nullable().optional(),
    businessId: z.string().nullable().optional(),
    capturedAt: z.string().optional(),
  })
  .passthrough();

const Body = z
  .object({
    name: z.string().trim().max(80).optional().or(z.literal("")),
    phone: z.string().trim().min(8).max(24).optional().or(z.literal("")),
    email: z.string().trim().email().optional().or(z.literal("")),
    city: z.enum(WAITLIST_CITIES),
    segment: z.enum(WAITLIST_SEGMENTS),
    consentGranted: z.literal(true),
    whatsappUpdatesGranted: z.boolean().optional(),
    analyticsConsent: z.boolean().optional(),
    marketingConsent: z.boolean().optional(),
    eventId: z.string().uuid().optional(),
    attribution: z
      .object({
        first: Touch.nullable().optional(),
        last: Touch.nullable().optional(),
      })
      .optional(),
  })
  .refine((value) => Boolean(value.phone || value.email), {
    message: "phone or email required",
  })
  .refine((value) => !value.name || value.name.length >= 2, {
    message: "name too short",
  });

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  if (!isWaitlistOpen()) {
    return json({ ok: false, code: "waitlist_closed" }, 503, headers);
  }
  const limited = await limitRequest(request, "waitlist", 10);
  if (!limited.ok) {
    return json({ ok: false, code: "RATE_LIMITED", retryAfterMs: limited.retryAfterMs }, 429, headers);
  }
  const raw = await readJson<unknown>(request);
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    const missingConsent =
      raw &&
      typeof raw === "object" &&
      "consentGranted" in raw &&
      (raw as { consentGranted?: unknown }).consentGranted !== true;
    return json(
      {
        ok: false,
        code: missingConsent ? "CONSENT_REQUIRED" : "INVALID",
        message: missingConsent ? apiMessages.consentRequired : "Geçersiz istek.",
      },
      400,
      headers,
    );
  }

  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }

  const phone = parsed.data.phone ? toE164(parsed.data.phone) : null;
  if (parsed.data.phone && !phone) {
    return json({ ok: false, code: "INVALID", message: "Geçerli bir telefon yazın." }, 400, headers);
  }

  const eventId = parsed.data.eventId ?? crypto.randomUUID();
  const attribution = parseStoredAttribution(parsed.data.attribution);
  const analyticsConsent = parsed.data.analyticsConsent === true;
  const marketingConsent = parsed.data.marketingConsent === true;

  try {
    const primary = await recordConsent({
      purpose: "waitlist_contact",
      granted: true,
      subjectType: "waitlist",
      retentionDays: RETENTION_DAYS.waitlist,
    });
    if (!primary) throw new Error("consent insert failed");
    if (parsed.data.whatsappUpdatesGranted) {
      await recordConsent({
        purpose: "whatsapp_updates",
        granted: true,
        subjectType: "waitlist",
        subjectId: primary.id,
        retentionDays: RETENTION_DAYS.waitlist,
      });
    }
    if (marketingConsent) {
      await recordConsent({
        purpose: "marketing",
        granted: true,
        subjectType: "waitlist",
        subjectId: primary.id,
        retentionDays: RETENTION_DAYS.waitlist,
      });
    }
    const result = await upsertWaitlistEntry({
      role: "customer",
      name: parsed.data.name || "",
      phone,
      email: parsed.data.email,
      city: parsed.data.city,
      segment: parsed.data.segment,
      consentId: primary.id,
      attribution,
      eventId,
    });
    await dispatchServerEvents({
      eventName: "waitlist_submit",
      eventId,
      params: paramsFromAttribution(eventId, attribution, {
        city: parsed.data.city,
        segment: parsed.data.segment,
      }),
      email: parsed.data.email,
      phone,
      analyticsConsent,
      marketingConsent,
    });
    if (result.created) {
      await dispatchServerEvents({
        eventName: "sign_up",
        eventId: `${eventId}-signup`,
        params: paramsFromAttribution(`${eventId}-signup`, attribution, {
          city: parsed.data.city,
          segment: parsed.data.segment,
        }),
        email: parsed.data.email,
        phone,
        analyticsConsent,
        marketingConsent,
      });
    }
    if (result.created && result.row?.referredByCode) {
      await dispatchServerEvents({
        eventName: "referral_signup",
        eventId: `${eventId}-ref`,
        params: paramsFromAttribution(`${eventId}-ref`, attribution, {
          ref: result.row.referredByCode,
        }),
        analyticsConsent,
        marketingConsent,
      });
    }
    return json(
      {
        ok: true,
        created: result.created,
        id: result.row?.id,
        referralCode: result.row?.referralCode,
        eventId,
      },
      result.created ? 201 : 200,
      headers,
    );
  } catch {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
