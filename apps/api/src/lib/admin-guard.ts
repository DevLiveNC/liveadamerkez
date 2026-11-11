import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured } from "@ada-merkez/db";
import { authCors, json } from "./http";
import { requireRole, sessionOr401, type SessionClaims } from "./auth";

export function requireAdmin(request: Request):
  | { ok: true; session: SessionClaims; cors: Record<string, string> }
  | { ok: false; response: ReturnType<typeof json>; cors: Record<string, string> } {
  const cors = authCors(request);
  const auth = sessionOr401(request, cors);
  if (!auth.ok) return { ...auth, cors };
  const role = requireRole(auth.session, "admin", cors);
  if (!role.ok) return { ok: false, response: role.response, cors };
  return { ok: true, session: auth.session, cors };
}

export function requireAdminDb(request: Request):
  | { ok: true; session: SessionClaims; cors: Record<string, string> }
  | { ok: false; response: ReturnType<typeof json>; cors: Record<string, string> } {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth;
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      cors: auth.cors,
      response: json(
        { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
        503,
        auth.cors,
      ),
    };
  }
  return auth;
}
