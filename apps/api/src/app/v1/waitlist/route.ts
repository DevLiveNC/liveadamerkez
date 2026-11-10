import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { RETENTION_DAYS, isWaitlistOpen, toE164 } from "@ada-merkez/shared";
import {
  isDatabaseConfigured,
  recordConsent,
  createWaitlistEntry,
} from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../lib/http";

export const dynamic = "force-dynamic";

const Body = z.object({
  role: z.enum(["customer", "business"]),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(24),
  city: z.string().trim().max(80).optional(),
  consentGranted: z.literal(true),
  whatsappUpdatesGranted: z.boolean().optional(),
});

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  if (!isWaitlistOpen()) {
    return json({ ok: false, code: "waitlist_closed" }, 503, headers);
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
      {
        ok: false,
        code: "SERVICE_UNAVAILABLE",
        message: apiMessages.dbUnavailable,
      },
      503,
      headers,
    );
  }

  const phone = toE164(parsed.data.phone);
  if (!phone) {
    return json({ ok: false, code: "INVALID", message: "Geçerli bir telefon yazın." }, 400, headers);
  }
  try {
    const primary = await recordConsent({
      purpose: "waitlist_contact",
      granted: true,
      subjectType: "waitlist",
      retentionDays: RETENTION_DAYS.waitlist,
    });
    if (!primary) {
      throw new Error("consent insert failed");
    }
    if (parsed.data.whatsappUpdatesGranted) {
      await recordConsent({
        purpose: "whatsapp_updates",
        granted: true,
        subjectType: "waitlist",
        subjectId: primary.id,
        retentionDays: RETENTION_DAYS.waitlist,
      });
    }
    const entry = await createWaitlistEntry({
      role: parsed.data.role,
      name: parsed.data.name,
      phone,
      city: parsed.data.city,
      consentId: primary.id,
    });
    return json(
      { ok: true, id: entry?.id, retainUntil: primary.retainUntil },
      201,
      headers,
    );
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "23505") {
      return json(
        {
          ok: false,
          code: "DUPLICATE",
          message: "Bu telefon bu kayıt türü için zaten listede.",
        },
        409,
        headers,
      );
    }
    const dbDown =
      error instanceof Error && /DATABASE_URL|ECONNREFUSED|connect/i.test(error.message);
    return json(
      {
        ok: false,
        code: dbDown ? "SERVICE_UNAVAILABLE" : "ERROR",
        message: apiMessages.dbUnavailable,
      },
      dbDown ? 503 : 500,
      headers,
    );
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
