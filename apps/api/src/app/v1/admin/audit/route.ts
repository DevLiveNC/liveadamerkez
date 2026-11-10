import { listAuditLog } from "@ada-merkez/db";
import { authCors, json } from "../../../../lib/http";
import { requireAdminDb } from "../../../../lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const audit = await listAuditLog();
  return json({ ok: true, audit }, 200, auth.cors);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
