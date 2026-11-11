import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured, listBusinessMeta } from "@ada-merkez/db";
import { authCors, corsHeaders, json } from "../../../../lib/http";
import { requireRoles } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = authCors(request);
  const auth = requireRoles(request, headers, ["customer", "business"]);
  if (!auth.ok) return auth.response;
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const meta = await listBusinessMeta();
  return json({ ok: true, ...meta }, 200, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
