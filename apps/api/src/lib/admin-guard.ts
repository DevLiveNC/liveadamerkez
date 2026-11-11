import { apiMessages } from "@ada-merkez/copy";
import { getAccountById, isDatabaseConfigured } from "@ada-merkez/db";
import { authCors, json } from "./http";
import { requireRole, sessionOr401, type SessionClaims } from "./auth";

export async function requireAdmin(request: Request): Promise<
  | { ok: true; session: SessionClaims; cors: Record<string, string> }
  | { ok: false; response: ReturnType<typeof json>; cors: Record<string, string> }
> {
  const cors = authCors(request);
  const auth = sessionOr401(request, cors);
  if (!auth.ok) return { ...auth, cors };
  const role = requireRole(auth.session, "admin", cors);
  if (!role.ok) return { ok: false, response: role.response, cors };
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      cors,
      response: json(
        { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
        503,
        cors,
      ),
    };
  }
  const account = await getAccountById(auth.session.sub);
  if (!account || account.role !== "admin") {
    return {
      ok: false,
      cors,
      response: json(
        { ok: false, code: "FORBIDDEN", message: apiMessages.forbidden },
        403,
        cors,
      ),
    };
  }
  return { ok: true, session: auth.session, cors };
}

export async function requireAdminDb(request: Request): Promise<
  | { ok: true; session: SessionClaims; cors: Record<string, string> }
  | { ok: false; response: ReturnType<typeof json>; cors: Record<string, string> }
> {
  return requireAdmin(request);
}
