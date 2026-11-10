import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { BUSINESS_SECTORS, WAITLIST_CITIES, toE164 } from "@ada-merkez/shared";
import { isAuthConfigured, signSession } from "@ada-merkez/shared/node";
import { isDatabaseConfigured, registerBusiness } from "@ada-merkez/db";
import { authCors, corsHeaders, json, readJson } from "../../../../lib/http";
import { requireRoles } from "../../../../lib/auth";
import { isletmeErrorResponse } from "../../../../lib/isletme-errors";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(2).max(120),
  sector: z.enum(BUSINESS_SECTORS),
  city: z.enum(WAITLIST_CITIES).optional(),
  inTurkey: z.boolean(),
  contactName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(24),
  email: z.string().trim().email().max(120).optional(),
  whatsapp: z.string().trim().max(24).optional(),
  notes: z.string().trim().max(500).optional(),
  role: z.string().optional(),
});

export async function POST(request: Request) {
  const headers = authCors(request);
  const auth = requireRoles(request, headers, ["customer", "business"]);
  if (!auth.ok) return auth.response;
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  if (parsed.data.role === "admin") {
    return json({ ok: false, code: "FORBIDDEN", message: apiMessages.forbidden }, 403, headers);
  }
  if (!parsed.data.inTurkey && !parsed.data.city) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  const phone = toE164(parsed.data.phone);
  if (!phone) return json({ ok: false, code: "INVALID" }, 400, headers);
  const whatsapp = parsed.data.whatsapp ? toE164(parsed.data.whatsapp) : null;
  if (parsed.data.whatsapp && !whatsapp) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  try {
    const me = await registerBusiness({
      userId: auth.session.sub,
      name: parsed.data.name,
      sector: parsed.data.sector,
      city: parsed.data.city,
      inTurkey: parsed.data.inTurkey,
      contactName: parsed.data.contactName,
      phone,
      email: parsed.data.email ?? null,
      whatsapp,
      notes: parsed.data.notes ?? null,
    });
    const token = isAuthConfigured()
      ? signSession({
          sub: auth.session.sub,
          role: "business",
          tenantId: me?.membership?.tenantId ?? "",
        })
      : undefined;
    return json({ ok: true, me, token }, 201, headers);
  } catch (error) {
    const mapped = isletmeErrorResponse(error, headers);
    if (mapped) return mapped;
    return json({ ok: false, code: "ERROR", message: apiMessages.notFound }, 500, headers);
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
