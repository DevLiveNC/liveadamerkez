import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import {
  FavoriteDeniedError,
  addFavorite,
  isDatabaseConfigured,
  listFavoritesForAccount,
} from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../../lib/http";
import { customerOr401 } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

const Body = z.object({
  businessId: z.string().uuid(),
});

export async function GET(request: Request) {
  const headers = corsHeaders(request);
  const auth = customerOr401(request, headers);
  if (!auth.ok) return auth.response;
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const favorites = await listFavoritesForAccount(auth.session.sub);
  return json({ ok: true, favorites }, 200, headers);
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const auth = customerOr401(request, headers);
  if (!auth.ok) return auth.response;
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID", message: apiMessages.notFound }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  try {
    const favorite = await addFavorite(auth.session.sub, parsed.data.businessId);
    return json({ ok: true, favorite }, 201, headers);
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
