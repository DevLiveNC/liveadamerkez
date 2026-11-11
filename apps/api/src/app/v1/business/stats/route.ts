import { apiMessages } from "@ada-merkez/copy";
import { bookingStatsForTenant, isDatabaseConfigured } from "@ada-merkez/db";
import { authCors, corsHeaders, json } from "../../../../lib/http";
import { requireBusinessMember } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

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
  const stats = await bookingStatsForTenant(auth.tenantId);
  return json({ ok: true, stats }, 200, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
