import { proxyMe } from "../../../../lib/app-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return proxyMe(request, "/v1/me/bookings");
}
