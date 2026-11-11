import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import {
  deleteServiceForTenant,
  isDatabaseConfigured,
  updateServiceForTenant,
} from "@ada-merkez/db";
import { authCors, corsHeaders, json, readJson } from "../../../../../lib/http";
import { requireBusinessMember } from "../../../../../lib/auth";
import { isletmeErrorResponse } from "../../../../../lib/isletme-errors";

export const dynamic = "force-dynamic";

const PatchBody = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  staffId: z.string().uuid().nullable().optional(),
  priceLabel: z.string().trim().max(40).nullable().optional(),
  description: z.string().trim().max(200).nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
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
  const { id } = await context.params;
  try {
    const row = await updateServiceForTenant(auth.tenantId, auth.session.sub, id, parsed.data);
    return json({ ok: true, service: row }, 200, headers);
  } catch (error) {
    const mapped = isletmeErrorResponse(error, headers);
    if (mapped) return mapped;
    return json({ ok: false, code: "ERROR" }, 500, headers);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
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
  const { id } = await context.params;
  try {
    await deleteServiceForTenant(auth.tenantId, auth.session.sub, id);
    return json({ ok: true }, 200, headers);
  } catch (error) {
    const mapped = isletmeErrorResponse(error, headers);
    if (mapped) return mapped;
    return json({ ok: false, code: "ERROR" }, 500, headers);
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
