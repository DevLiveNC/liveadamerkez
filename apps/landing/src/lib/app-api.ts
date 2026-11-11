import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiMessages } from "@ada-merkez/copy";
import { SESSION_COOKIE } from "@ada-merkez/shared";
import { apiBase } from "./api";
import { isTrustedSameOrigin } from "./bff-origin";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export function bffForbidden() {
  return NextResponse.json(
    { ok: false, code: "FORBIDDEN", message: apiMessages.forbidden },
    { status: 403, headers: NO_STORE },
  );
}

export async function proxyMe(
  request: Request,
  apiPath: string,
  init?: { method?: string; body?: unknown },
): Promise<NextResponse> {
  if (!isTrustedSameOrigin(request)) return bffForbidden();
  const token = (await cookies()).get(SESSION_COOKIE)?.value?.trim();
  if (!token) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHORIZED", message: apiMessages.unauthorized },
      { status: 401, headers: NO_STORE },
    );
  }
  const base = apiBase();
  if (!base) {
    return NextResponse.json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.authRequired },
      { status: 503, headers: NO_STORE },
    );
  }
  const method = init?.method ?? request.method;
  const headers: Record<string, string> = { authorization: `Bearer ${token}` };
  let body: string | undefined;
  if (init?.body !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(init.body);
  } else if (method !== "GET" && method !== "DELETE") {
    const raw = await request.text();
    if (raw) {
      headers["content-type"] = request.headers.get("content-type") ?? "application/json";
      body = raw;
    }
  }
  const upstream = await fetch(`${base}${apiPath}`, { method, headers, body, cache: "no-store" });
  const payload = await upstream.json().catch(() => ({ ok: false }));
  return NextResponse.json(payload, { status: upstream.status, headers: NO_STORE });
}

export async function serverApi<T>(path: string, init?: RequestInit): Promise<T | null> {
  const base = apiBase();
  if (!base) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value?.trim();
  const headers = new Headers(init?.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  try {
    const res = await fetch(`${base}${path}`, { ...init, headers, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
