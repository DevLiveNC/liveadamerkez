import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { setBusinessStatus, TenantAccessError } from "@ada-merkez/db";
import { authCors, json, readJson } from "../../../../../lib/http";
import { requireAdminDb } from "../../../../../lib/admin-guard";

export const dynamic = "force-dynamic";

const PatchBody = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const parsed = PatchBody.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID" }, 400, auth.cors);
  }
  const { id } = await context.params;
  try {
    const row = await setBusinessStatus(auth.session.sub, id, parsed.data.status);
    return json({ ok: true, business: row }, 200, auth.cors);
  } catch (error) {
    if (error instanceof TenantAccessError) {
      return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, auth.cors);
    }
    return json({ ok: false, code: "ERROR" }, 500, auth.cors);
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
