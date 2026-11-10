import { json } from "./http";
import {
  isAuthConfigured,
  readBearerToken,
  verifySession,
  type SessionClaims,
} from "@ada-merkez/shared/node";

export function sessionOr401(
  request: Request,
  cors: Record<string, string>,
): { session: SessionClaims; ok: true } | { ok: false; response: ReturnType<typeof json> } {
  if (!isAuthConfigured()) {
    return {
      ok: false,
      response: json(
        { ok: false, code: "AUTH_REQUIRED", message: "Kimlik doğrulama gerekli." },
        401,
        cors,
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
        cors,
      ),
    };
  }
  return { ok: true, session };
}
