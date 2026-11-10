import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { createStaffForTenant, isDatabaseConfigured, listStaffForTenant } from "@ada-merkez/db";
import { authCors, corsHeaders, json, readJson } from "../../../../lib/http";
import { requireBusinessMember } from "../../../../lib/auth";
import { isletmeErrorResponse } from "../../../../lib/isletme-errors";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
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
  const staff = await listStaffForTenant(auth.tenantId);
  return json({ ok: true, staff }, 200, headers);
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
    const row = await createStaffForTenant(auth.tenantId, auth.session.sub, parsed.data);
    return json({ ok: true, staff: row }, 201, headers);
  } catch (error) {
    const mapped = isletmeErrorResponse(error, headers);
    if (mapped) return mapped;
    return json({ ok: false, code: "ERROR" }, 500, headers);
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
