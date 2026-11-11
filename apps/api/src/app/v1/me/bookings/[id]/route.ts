import { apiMessages } from "@ada-merkez/copy";
import {
  BookingStatusError,
  TenantAccessError,
  cancelBookingForAccount,
  isDatabaseConfigured,
} from "@ada-merkez/db";
import { corsHeaders, json } from "../../../../../lib/http";
import { sessionOr401 } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = corsHeaders(request);
  const auth = sessionOr401(request, headers);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  try {
    const booking = await cancelBookingForAccount(auth.session.sub, id);
    return json({ ok: true, booking }, 200, headers);
  } catch (error) {
    if (error instanceof TenantAccessError) {
      return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
    }
    if (error instanceof BookingStatusError) {
      return json({ ok: false, code: "FORBIDDEN", message: apiMessages.forbidden }, 409, headers);
    }
    throw error;
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
