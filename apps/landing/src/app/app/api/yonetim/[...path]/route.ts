import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiMessages } from "@ada-merkez/copy";
import { SESSION_COOKIE } from "@ada-merkez/shared";
import { apiBase } from "../../../../../lib/api";
import { isTrustedSameOrigin } from "../../../../../lib/bff-origin";

export const dynamic = "force-dynamic";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (MUTATING.has(request.method) && !isTrustedSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, code: "FORBIDDEN", message: apiMessages.forbidden },
      { status: 403, headers },
    );
  }
  const base = apiBase();
  if (!base) {
    return NextResponse.json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.authRequired },
      { status: 503, headers },
    );
  }
  const { path } = await context.params;
  const suffix = path.join("/");
  const search = new URL(request.url).search;
  const token = (await cookies()).get(SESSION_COOKIE)?.value?.trim();
  const upstreamHeaders: Record<string, string> = {};
  const contentType = request.headers.get("content-type");
  if (contentType) upstreamHeaders["content-type"] = contentType;
  if (token) upstreamHeaders.authorization = `Bearer ${token}`;
  const body = MUTATING.has(request.method) ? await request.text() : undefined;
  const upstream = await fetch(`${base}/v1/${suffix}${search}`, {
    method: request.method,
    headers: upstreamHeaders,
    body: body && body.length ? body : undefined,
    cache: "no-store",
  });
  const raw = await upstream.text();
  const content = upstream.headers.get("content-type");
  if (content) headers["content-type"] = content;
  return new NextResponse(raw, { status: upstream.status, headers });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
