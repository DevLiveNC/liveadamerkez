import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured, sessionSnapshot, updateBusinessProfile } from "@ada-merkez/db";
import { authCors, corsHeaders, json, readJson } from "../../../../lib/http";
import { requireBusinessMember } from "../../../../lib/auth";
import { isletmeErrorResponse } from "../../../../lib/isletme-errors";

export const dynamic = "force-dynamic";

const PatchBody = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(24).nullable().optional(),
  email: z.string().trim().max(120).nullable().optional(),
  whatsapp: z.string().trim().max(24).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  cityName: z.string().trim().max(80).nullable().optional(),
  sector: z.string().trim().max(40).nullable().optional(),
});

export async function GET(request: Request) {
  const headers = authCors(request);
  const auth = await requireBusinessMember(request, headers);
  if (!auth.ok) return auth.response;
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const me = await sessionSnapshot(auth.session.sub);
  if (!me?.business || me.business.id !== auth.tenantId) {
    return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
  }
  return json({ ok: true, me }, 200, headers);
}

export async function PATCH(request: Request) {
  const headers = authCors(request);
  const auth = await requireBusinessMember(request, headers);
  if (!auth.ok) return auth.response;
  const parsed = PatchBody.safeParse(await readJson(request));
  if (!parsed.success) return json({ ok: false, code: "INVALID" }, 400, headers);
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  try {
    const business = await updateBusinessProfile(auth.tenantId, auth.session.sub, parsed.data);
    return json({ ok: true, business }, 200, headers);
  } catch (error) {
    const mapped = isletmeErrorResponse(error, headers);
    if (mapped) return mapped;
    return json({ ok: false, code: "ERROR" }, 500, headers);
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
