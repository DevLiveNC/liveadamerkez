import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiMessages } from "@ada-merkez/copy";
import { isSessionRole, SESSION_COOKIE } from "@ada-merkez/shared";
import { apiBase } from "../../../../lib/api";

export const dynamic = "force-dynamic";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/app",
    maxAge: 8 * 60 * 60,
  };
}

export async function POST(request: Request) {
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
  if (!phone || !code || !isSessionRole(role)) {
    return NextResponse.json({ ok: false, code: "INVALID", message: apiMessages.invalidAuth }, { status: 400 });
  }
  const base = apiBase();
  if (!base) {
    return NextResponse.json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.authRequired },
      { status: 503 },
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
      { status: upstream.status || 401 },
    );
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, payload.token, cookieOptions());
  return NextResponse.json({ ok: true, user: payload.user });
}

export async function DELETE() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return NextResponse.json({ ok: true });
}
