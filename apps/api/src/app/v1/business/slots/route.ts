import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured, listSlotsForTenant } from "@ada-merkez/db";
import { nicosiaWallTimeToUtc, utcToNicosiaParts } from "@ada-merkez/shared";
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
  const url = new URL(request.url);
  const fromParam = url.searchParams.get("from");
  const days = Math.min(14, Math.max(1, Number(url.searchParams.get("days") ?? "7") || 7));
  const staffId = url.searchParams.get("staffId") ?? undefined;
  const serviceId = url.searchParams.get("serviceId") ?? undefined;
  const now = fromParam && !Number.isNaN(Date.parse(fromParam)) ? new Date(fromParam) : new Date();
  const parts = utcToNicosiaParts(now);
  const from = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 0, 0);
  const to = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + days, 0, 0);
  const slots = await listSlotsForTenant(auth.tenantId, {
    from,
    to,
    staffId,
    serviceId,
  });
  return json({ ok: true, from: from.toISOString(), to: to.toISOString(), slots }, 200, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
