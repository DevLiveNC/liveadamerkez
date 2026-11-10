import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import {
  BUSINESS_SECTORS,
  RETENTION_DAYS,
  WAITLIST_CITIES,
  parseStoredAttribution,
} from "@ada-merkez/shared";
import {
  isDatabaseConfigured,
  recordConsent,
  upsertBusinessApplication,
} from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../lib/http";
import { dispatchServerEvents, paramsFromAttribution } from "../../../lib/analytics";

export const dynamic = "force-dynamic";

const Touch = z.object({}).passthrough();

const Body = z.object({
  businessName: z.string().trim().min(2).max(160),
  sector: z.enum(BUSINESS_SECTORS),
  inTurkey: z.boolean(),
  city: z.enum(WAITLIST_CITIES).optional(),
  contactName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(24),
  email: z.string().trim().email(),
  whatsapp: z.string().trim().max(24).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
  consentGranted: z.literal(true),
  eventId: z.string().uuid().optional(),
  attribution: z
    .object({
      first: Touch.nullable().optional(),
      last: Touch.nullable().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const headers = corsHeaders(request);
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
  if (!parsed.data.inTurkey && !parsed.data.city) {
    return json({ ok: false, code: "INVALID", message: "Şehir gerekli." }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }

  const eventId = parsed.data.eventId ?? crypto.randomUUID();
  const attribution = parseStoredAttribution(parsed.data.attribution);
  try {
    const consent = await recordConsent({
      purpose: "business_apply",
      granted: true,
      subjectType: "business_application",
      retentionDays: RETENTION_DAYS.waitlist,
    });
    if (!consent) throw new Error("consent");
    const result = await upsertBusinessApplication({
      businessName: parsed.data.businessName,
      sector: parsed.data.sector,
      city: parsed.data.city,
      inTurkey: parsed.data.inTurkey,
      contactName: parsed.data.contactName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      notes: parsed.data.notes,
      consentId: consent.id,
      attribution,
      eventId,
    });
    await dispatchServerEvents({
      eventName: "business_apply_submit",
      eventId,
      params: paramsFromAttribution(eventId, attribution, {
        city: parsed.data.inTurkey ? "turkey" : parsed.data.city,
      }),
      email: parsed.data.email,
      phone: parsed.data.phone,
    });
    return json(
      {
        ok: true,
        created: result.created,
        id: result.row?.id,
        inTurkey: result.row?.inTurkey,
        includeInDiscovery: false,
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
