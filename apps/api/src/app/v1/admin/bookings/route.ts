import { adminBookingRangeError, listAdminBookings } from "@ada-merkez/db";
import { authCors, json } from "../../../../lib/http";
import { requireAdminDb } from "../../../../lib/admin-guard";

export const dynamic = "force-dynamic";

function parseBound(value: string | null): Date | undefined | "invalid" {
  if (!value) return undefined;
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? "invalid" : at;
}

export async function GET(request: Request) {
  const auth = await requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const from = parseBound(url.searchParams.get("from"));
  const to = parseBound(url.searchParams.get("to"));
  if (from === "invalid" || to === "invalid") {
    return json({ ok: false, code: "invalid_range" }, 400, auth.cors);
  }
  const fromAt = from instanceof Date ? from : undefined;
  const toAt = to instanceof Date ? to : undefined;
  const rangeErr = adminBookingRangeError(fromAt, toAt);
  if (rangeErr) {
    return json({ ok: false, code: rangeErr }, 400, auth.cors);
  }
  const result = await listAdminBookings({ from: fromAt, to: toAt });
  return json({ ok: true, ...result }, 200, auth.cors);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
