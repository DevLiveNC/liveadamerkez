import { apiMessages } from "@ada-merkez/copy";
import { FavoriteDeniedError, isDatabaseConfigured, removeFavorite } from "@ada-merkez/db";
import { corsHeaders, json } from "../../../../../lib/http";
import { customerOr401 } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ businessId: string }> }) {
  const headers = corsHeaders(request);
  const auth = customerOr401(request, headers);
  if (!auth.ok) return auth.response;
  const { businessId } = await context.params;
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  try {
    await removeFavorite(auth.session.sub, businessId);
    return json({ ok: true }, 200, headers);
  } catch (error) {
    if (error instanceof FavoriteDeniedError) {
      return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
    }
    throw error;
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
