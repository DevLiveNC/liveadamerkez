import { getPublishedBusiness, isDatabaseConfigured } from "@ada-merkez/db";
import { apiMessages } from "@ada-merkez/copy";
import { corsHeaders, json } from "../../../../../lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = corsHeaders(request);
  const { id } = await context.params;
  if (!isDatabaseConfigured()) {
    return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
  }
  const row = await getPublishedBusiness(id);
  if (!row) {
    return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
  }
  return json(
    {
      ok: true,
      business: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        sample: row.sample,
        city: row.city,
        category: row.category,
        categorySlug: row.categorySlug,
        timezone: row.timezone,
        services: row.services,
      },
    },
    200,
    headers,
  );
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
