import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders } from "./lib/http";

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
  }
  const response = NextResponse.next();
  const cors = corsHeaders(request);
  for (const [key, value] of Object.entries(cors)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/:path*"],
};
