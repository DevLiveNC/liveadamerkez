import { apiMessages } from "@ada-merkez/copy";
import { assertActorOwnsTenant, getAccountById, isDatabaseConfigured } from "@ada-merkez/db";
import { json, noStore } from "./http";
import {
  isAuthConfigured,
  isSessionRole,
  readBearerToken,
  verifySession,
  type SessionClaims,
  type SessionRole,
} from "@ada-merkez/shared/node";

export type { SessionClaims, SessionRole };

export function sessionOr401(
  request: Request,
  cors: Record<string, string>,
): { session: SessionClaims; ok: true } | { ok: false; response: ReturnType<typeof json> } {
  const headers = noStore(cors);
  if (!isAuthConfigured()) {
    return {
      ok: false,
      response: json(
        { ok: false, code: "AUTH_REQUIRED", message: "Kimlik doğrulama gerekli." },
        401,
        headers,
      ),
    };
  }
  const token = readBearerToken(request);
  const session = token ? verifySession(token) : null;
  if (!session) {
    return {
      ok: false,
      response: json(
        { ok: false, code: "UNAUTHORIZED", message: "Oturum geçersiz veya eksik." },
        401,
        headers,
      ),
    };
  }
  return { ok: true, session };
}

export function requireRole(
  session: SessionClaims,
  roles: SessionRole | SessionRole[],
  cors: Record<string, string>,
): { ok: true } | { ok: false; response: ReturnType<typeof json> } {
  const headers = noStore(cors);
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.role) || !isSessionRole(session.role)) {
    return {
      ok: false,
      response: json(
        { ok: false, code: "FORBIDDEN", message: "Bu işlem için yetkin yok." },
        403,
        headers,
      ),
    };
  }
  return { ok: true };
}

export function requireRoles(
  request: Request,
  cors: Record<string, string>,
  roles: readonly SessionRole[],
): { session: SessionClaims; ok: true } | { ok: false; response: ReturnType<typeof json> } {
  const headers = noStore(cors);
  const auth = sessionOr401(request, headers);
  if (!auth.ok) return auth;
  const role = requireRole(auth.session, [...roles], headers);
  if (!role.ok) return role;
  return { ok: true, session: auth.session };
}

export async function requireBusinessMember(
  request: Request,
  cors: Record<string, string>,
): Promise<
  | { session: SessionClaims; tenantId: string; ok: true }
  | { ok: false; response: ReturnType<typeof json> }
> {
  const headers = noStore(cors);
  const auth = requireRoles(request, headers, ["business"]);
  if (!auth.ok) return auth;
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      response: json(
        { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
        503,
        headers,
      ),
    };
  }
  const account = await getAccountById(auth.session.sub);
  if (!account || account.role !== "business") {
    return {
      ok: false,
      response: json(
        { ok: false, code: "FORBIDDEN", message: apiMessages.businessRequired },
        403,
        headers,
      ),
    };
  }
  const tenantId = auth.session.tenantId || account.tenantId || "";
  if (!tenantId) {
    return {
      ok: false,
      response: json(
        { ok: false, code: "FORBIDDEN", message: apiMessages.businessRequired },
        403,
        headers,
      ),
    };
  }
  try {
    await assertActorOwnsTenant(account.id, tenantId);
    return { ok: true, session: auth.session, tenantId: account.tenantId || tenantId };
  } catch {
    return {
      ok: false,
      response: json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers),
    };
  }
}
