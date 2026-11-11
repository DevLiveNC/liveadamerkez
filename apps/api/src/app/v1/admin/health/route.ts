import { adminHealth } from "@ada-merkez/db";
import { authCors, json } from "../../../../lib/http";
import { requireAdminDb } from "../../../../lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const health = await adminHealth();
  return json({ ok: true, health }, 200, auth.cors);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
