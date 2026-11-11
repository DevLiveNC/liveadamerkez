import { InvalidServiceError, listOpenSlots, isDatabaseConfigured } from "@ada-merkez/db";
import { nicosiaTomorrowDateKey } from "@ada-merkez/shared";
import { apiMessages } from "@ada-merkez/copy";
import { corsHeaders, json } from "../../../../../../lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = corsHeaders(request);
  const { id } = await context.params;
  if (!isDatabaseConfigured()) {
    return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
  }
  const url = new URL(request.url);
  const date = url.searchParams.get("date")?.trim() || nicosiaTomorrowDateKey();
  const serviceId = url.searchParams.get("serviceId")?.trim() || undefined;
  try {
    const result = await listOpenSlots({ businessId: id, date, serviceId });
    if (!result) {
      return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
    }
    return json({ ok: true, date, ...result }, 200, headers);
  } catch (error) {
    if (error instanceof InvalidServiceError) {
      return json({ ok: false, code: error.code, message: apiMessages.invalidService }, 400, headers);
    }
    throw error;
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
