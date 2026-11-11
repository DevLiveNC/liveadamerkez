import { apiMessages } from "@ada-merkez/copy";
import { adminAccountSnapshot } from "@ada-merkez/db";
import { authCors, json } from "../../../../lib/http";
import { requireAdminDb } from "../../../../lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const me = await adminAccountSnapshot(auth.session.sub);
  if (!me || me.user.role !== "admin") {
    return json({ ok: false, code: "FORBIDDEN", message: apiMessages.forbidden }, 403, auth.cors);
  }
  return json({ ok: true, me }, 200, auth.cors);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
