import { eq } from "drizzle-orm";
import { business, getDb, isDatabaseConfigured } from "@ada-merkez/db";
import { corsHeaders, json } from "../../../../../lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = corsHeaders(request);
  const { id } = await context.params;
  if (!isDatabaseConfigured()) {
    return json({ ok: false, code: "NOT_FOUND" }, 404, headers);
  }
  const [row] = await getDb()
    .select({ id: business.id, name: business.name, status: business.status })
    .from(business)
    .where(eq(business.id, id))
    .limit(1);
  if (!row || row.status === "draft") {
    return json({ ok: false, code: "NOT_FOUND" }, 404, headers);
  }
  return json({ ok: true, business: { id: row.id, name: row.name } }, 200, headers);
}
