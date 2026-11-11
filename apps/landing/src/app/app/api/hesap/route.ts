import { proxyMe } from "../../../../lib/app-api";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  return proxyMe(request, "/v1/me", { method: "PATCH" });
}
