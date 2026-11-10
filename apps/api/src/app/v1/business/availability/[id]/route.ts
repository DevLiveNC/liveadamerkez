import { apiMessages } from "@ada-merkez/copy";
import { deleteAvailabilityForTenant, isDatabaseConfigured } from "@ada-merkez/db";
import { authCors, corsHeaders, json } from "../../../../../lib/http";
import { requireBusinessMember } from "../../../../../lib/auth";
import { isletmeErrorResponse } from "../../../../../lib/isletme-errors";

export const dynamic = "force-dynamic";

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
    await deleteAvailabilityForTenant(auth.tenantId, auth.session.sub, id);
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
