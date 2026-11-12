import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured, listNotificationsForAccount } from "@ada-merkez/db";
import { corsHeaders, json } from "../../../../lib/http";
import { customerOr401 } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = corsHeaders(request);
  const auth = customerOr401(request, headers);
  if (!auth.ok) return auth.response;
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const notifications = await listNotificationsForAccount(auth.session.sub);
  return json({ ok: true, notifications }, 200, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
