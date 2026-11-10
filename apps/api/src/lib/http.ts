import { NextResponse } from "next/server";

export function json(body: unknown, status = 200, extra?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: extra,
  });
}

export function parseOriginList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function corsHeaders(request: Request): Record<string, string> {
  const allowed = parseOriginList(process.env.CORS_ORIGINS);
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Tenant-Id",
  };
  if (origin && (allowed.length === 0 || allowed.includes(origin) || allowed.includes("*"))) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (allowed.length === 1 && allowed[0]) {
    headers["Access-Control-Allow-Origin"] = allowed[0];
  }
  return headers;
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
