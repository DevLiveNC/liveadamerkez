import { listAdminUsers } from "@ada-merkez/db";
import { authCors, json } from "../../../../lib/http";
import { requireAdminDb } from "../../../../lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const users = await listAdminUsers();
  return json({ ok: true, users }, 200, auth.cors);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
