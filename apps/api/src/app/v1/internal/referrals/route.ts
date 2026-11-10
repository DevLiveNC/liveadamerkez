import { isDatabaseConfigured, listReferralsForExport, toCsv } from "@ada-merkez/db";
import { corsHeaders, json } from "../../../../lib/http";
import { assertInternalAccess } from "../../../../lib/internal-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = corsHeaders(request);
  if (!process.env.INTERNAL_EXPORT_TOKEN?.trim()) {
    return json({ ok: false, code: "NOT_CONFIGURED" }, 503, headers);
  }
  if (!assertInternalAccess(request)) {
    return json({ ok: false, code: "FORBIDDEN" }, 403, headers);
  }
  if (!isDatabaseConfigured()) {
    return json({ ok: false, code: "SERVICE_UNAVAILABLE" }, 503, headers);
  }
  const rows = await listReferralsForExport();
  const csv = toCsv(rows as unknown as Record<string, unknown>[], [
    "code",
    "ownerKind",
    "ownerId",
    "clickCount",
    "signupCount",
    "firstBookingAt",
    "hookStatus",
    "createdAt",
  ]);
  return new Response(csv, {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=referrals.csv",
    },
  });
}
