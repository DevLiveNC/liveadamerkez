import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAppPath } from "@ada-merkez/shared";

function isAppPublicStatic(pathname: string): boolean {
  if (
    pathname === "/app/manifest.json" ||
    pathname === "/app/offline.html" ||
    pathname === "/app/offline" ||
    pathname === "/app/sw.js"
  ) {
    return true;
  }
  return (
    pathname.startsWith("/app/icons/") ||
    pathname.startsWith("/app/splash/") ||
    pathname.startsWith("/app/bos-durum/") ||
    pathname.startsWith("/app/ana-ekrana-ekle/")
  );
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ada-path", request.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const path = request.nextUrl.pathname;
  if (!isAppPath(path)) return response;
  if (path === "/app/sw.js") {
    response.headers.set("Cache-Control", "no-cache");
    return response;
  }
  if (isAppPublicStatic(path)) return response;
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
