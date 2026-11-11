import { listAdminBookings } from "@ada-merkez/db";
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
  const bookings = await listAdminBookings({ from, to });
  return json({ ok: true, bookings }, 200, auth.cors);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
