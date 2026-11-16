import {
  adminBookingRangeError,
  adminBookingReport,
  adminReports,
} from "@ada-merkez/db";
import { authCors, json } from "../../../../lib/http";
import { requireAdminDb } from "../../../../lib/admin-guard";
import { nicosiaWallTimeToUtc, parseNicosiaDateKey } from "@ada-merkez/shared";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const fromKey = url.searchParams.get("from");
  const toKey = url.searchParams.get("to");
  if (!fromKey && !toKey) {
    const reports = await adminReports();
    return json({ ok: true, reports }, 200, auth.cors);
  }
  const from = fromKey ? parseNicosiaDateKey(fromKey, "Europe/Nicosia") : null;
  const to = toKey ? parseNicosiaDateKey(toKey, "Europe/Nicosia") : null;
  if (!from || !to)
    return json({ ok: false, code: "INVALID_RANGE" }, 400, auth.cors);
  const start = nicosiaWallTimeToUtc(
    from.year,
    from.month,
    from.day,
    0,
    0,
    0,
    "Europe/Nicosia",
  );
  const endParts = nicosiaWallTimeToUtc(
    to.year,
    to.month,
    to.day + 1,
    0,
    0,
    0,
    "Europe/Nicosia",
  );
  if (adminBookingRangeError(start, endParts))
    return json({ ok: false, code: "INVALID_RANGE" }, 400, auth.cors);
  const [reports, summary] = await Promise.all([
    adminReports(),
    adminBookingReport({ from: start, to: endParts }),
  ]);
  return json({ ok: true, reports, summary }, 200, auth.cors);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
