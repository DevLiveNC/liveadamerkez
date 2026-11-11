import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { getAccountById, isDatabaseConfigured, updateAccountName } from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../lib/http";
import { sessionOr401 } from "../../../lib/auth";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function PATCH(request: Request) {
  const headers = corsHeaders(request);
  const auth = sessionOr401(request, headers);
  if (!auth.ok) return auth.response;
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID", message: apiMessages.invalidAuth }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const existing = await getAccountById(auth.session.sub);
  if (!existing) {
    return json({ ok: false, code: "UNAUTHORIZED", message: apiMessages.unauthorized }, 401, headers);
  }
  const account = await updateAccountName(existing.id, parsed.data.name);
  if (!account) {
    return json({ ok: false, code: "INVALID", message: apiMessages.invalidAuth }, 400, headers);
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
  return json({ ok: true }, 204, corsHeaders(request));
}
