import { apiMessages } from "@ada-merkez/copy";
import { getAccountById, isDatabaseConfigured } from "@ada-merkez/db";
import { authCors, json } from "../../../../lib/http";
import { sessionOr401 } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = authCors(request);
  const auth = sessionOr401(request, headers);
  if (!auth.ok) return auth.response;
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const account = await getAccountById(auth.session.sub);
  if (!account || account.role !== auth.session.role) {
    return json({ ok: false, code: "UNAUTHORIZED", message: apiMessages.unauthorized }, 401, headers);
  }
  return json(
    {
      ok: true,
      user: {
        id: account.id,
        role: account.role,
        name: account.name,
        phone: account.phone,
        tenantId: account.tenantId,
      },
    },
    200,
    headers,
  );
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
