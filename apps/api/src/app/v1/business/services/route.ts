import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import {
  createServiceForTenant,
  isDatabaseConfigured,
  listServicesForTenant,
} from "@ada-merkez/db";
import { authCors, corsHeaders, json, readJson } from "../../../../lib/http";
import { requireBusinessMember } from "../../../../lib/auth";
import { isletmeErrorResponse } from "../../../../lib/isletme-errors";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  durationMinutes: z.number().int().min(5).max(480),
  staffId: z.string().uuid().nullable().optional(),
  priceLabel: z.string().trim().max(40).nullable().optional(),
  description: z.string().trim().max(200).nullable().optional(),
  active: z.boolean().optional(),
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
  const services = await listServicesForTenant(auth.tenantId);
  return json({ ok: true, services }, 200, headers);
}

export async function POST(request: Request) {
  const headers = authCors(request);
  const auth = await requireBusinessMember(request, headers);
  if (!auth.ok) return auth.response;
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) return json({ ok: false, code: "INVALID" }, 400, headers);
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  try {
    const row = await createServiceForTenant(auth.tenantId, auth.session.sub, parsed.data);
    return json({ ok: true, service: row }, 201, headers);
  } catch (error) {
    const mapped = isletmeErrorResponse(error, headers);
    if (mapped) return mapped;
    return json({ ok: false, code: "ERROR" }, 500, headers);
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
