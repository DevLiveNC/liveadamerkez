import { NextResponse } from "next/server";
import { apiMessages } from "@ada-merkez/copy";
import { isTestLoginPhone, isSessionRole, SESSION_COOKIE } from "@ada-merkez/shared";
import { apiBase } from "../../../../lib/api";
import { isTrustedSameOrigin } from "../../../../lib/bff-origin";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" } as const;

function cookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === "false") return false;
  if (process.env.COOKIE_SECURE === "true") return true;
  return process.env.NODE_ENV === "production";
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(),
    path: "/app",
    maxAge: 8 * 60 * 60,
  };
}

function forbidden() {
  return NextResponse.json(
    { ok: false, code: "FORBIDDEN", message: apiMessages.forbidden },
    { status: 403, headers: NO_STORE },
  );
}

export async function POST(request: Request) {
  if (!isTrustedSameOrigin(request)) return forbidden();
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const role = body.role;
  const mode = body.mode === "register" ? "register" : "login";
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const testLogin = isTestLoginPhone(phone, { enabledFlag: process.env.AUTH_TEST_LOGIN, phones: process.env.AUTH_TEST_PHONES });
  if (!phone || (!testLogin && !/^\d{6}$/.test(code)) || !isSessionRole(role)) {
    return NextResponse.json(
      { ok: false, code: "INVALID", message: apiMessages.invalidAuth },
      { status: 400, headers: NO_STORE },
    );
  }
  const base = apiBase();
  if (!base) {
    return NextResponse.json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.authRequired },
      { status: 503, headers: NO_STORE },
    );
  }
  const upstream = await fetch(`${base}/v1/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, code, role, mode, name }),
    cache: "no-store",
  });
  const payload = (await upstream.json().catch(() => null)) as
    | { ok?: boolean; token?: string; user?: unknown; code?: string; message?: string }
    | null;
  if (!upstream.ok || !payload?.ok || !payload.token) {
    return NextResponse.json(
      {
        ok: false,
        code: payload?.code ?? "UNAUTHORIZED",
        message: payload?.message ?? apiMessages.unauthorized,
      },
      { status: upstream.status || 401, headers: NO_STORE },
    );
  }
  const res = NextResponse.json({ ok: true, user: payload.user }, { headers: NO_STORE });
  res.cookies.set(SESSION_COOKIE, payload.token, cookieOptions());
  return res;
}

export async function DELETE(request: Request) {
  if (!isTrustedSameOrigin(request)) return forbidden();
  const res = NextResponse.json(
    { ok: true },
    {
      headers: {
        ...NO_STORE,
        "Clear-Site-Data": '"cache"',
      },
    },
  );
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return res;
}
