import { listApprovedBusinesses, isDatabaseConfigured } from "@ada-merkez/db";
import { corsHeaders, json } from "../../../../lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = corsHeaders(request);
  if (!isDatabaseConfigured()) {
    return json({ ok: true, businesses: [] }, 200, headers);
  }
  const url = new URL(request.url);
  const businesses = await listApprovedBusinesses({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    city: url.searchParams.get("city") ?? undefined,
  });
  return json({ ok: true, businesses }, 200, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
