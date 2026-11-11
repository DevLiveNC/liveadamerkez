import { z } from "zod";
import { createAdminCategory, listAdminCategories } from "@ada-merkez/db";
import { authCors, json, readJson } from "../../../../lib/http";
import { requireAdminDb } from "../../../../lib/admin-guard";

export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  kind: z.string().trim().min(2).max(40),
  slug: z.string().trim().min(2).max(48).optional(),
});

export async function GET(request: Request) {
  const auth = await requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const categories = await listAdminCategories();
  return json({ ok: true, categories }, 200, auth.cors);
}

export async function POST(request: Request) {
  const auth = await requireAdminDb(request);
  if (!auth.ok) return auth.response;
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID" }, 400, auth.cors);
  }
  const row = await createAdminCategory(auth.session.sub, parsed.data);
  return json({ ok: true, category: row }, 201, auth.cors);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, authCors(request));
}
