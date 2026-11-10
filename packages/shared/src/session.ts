import { createHmac, timingSafeEqual } from "node:crypto";
import { assertProductionSecrets } from "./secrets.js";

export type SessionRole = "business" | "admin";

export type SessionClaims = {
  tenantId: string;
  role: SessionRole;
  sub: string;
  exp: number;
};

export function isAuthConfigured(secret = process.env.AUTH_SECRET): boolean {
  return Boolean(secret?.trim());
}

function b64url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function signingSecret(explicit?: string): string | null {
  assertProductionSecrets();
  const secret = (explicit ?? process.env.AUTH_SECRET)?.trim();
  return secret || null;
}

export function signSession(
  claims: Omit<SessionClaims, "exp"> & { exp?: number },
  options?: { secret?: string; ttlMs?: number },
): string {
  const secret = signingSecret(options?.secret);
  if (!secret) {
    throw new Error("AUTH_SECRET tanımlı değil.");
  }
  const payload: SessionClaims = {
    tenantId: claims.tenantId,
    role: claims.role,
    sub: claims.sub,
    exp: claims.exp ?? Date.now() + (options?.ttlMs ?? 8 * 60 * 60 * 1000),
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(
  token: string,
  secret = process.env.AUTH_SECRET,
): SessionClaims | null {
  const key = signingSecret(secret);
  if (!key) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", key).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return null;
  if (!timingSafeEqual(left, right)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionClaims;
    if (!claims.tenantId || !claims.role || !claims.sub || typeof claims.exp !== "number") {
      return null;
    }
    if (claims.exp < Date.now()) return null;
    if (claims.role !== "business" && claims.role !== "admin") return null;
    return claims;
  } catch {
    return null;
  }
}

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")?.trim();
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}
