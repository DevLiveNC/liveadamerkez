import { z } from "zod";
import {
  BookingStatusError,
  TenantAccessError,
  getBookingForTenant,
  isDatabaseConfigured,
  markReferralFirstBooking,
  notifyBookingAccount,
  toPublicBooking,
  updateBookingStatus,
} from "@ada-merkez/db";
import { apiMessages, app } from "@ada-merkez/copy";
import { formatInNicosia } from "@ada-merkez/shared";
import { authCors, corsHeaders, json, readJson } from "../../../../lib/http";
import { requireRole, sessionOr401 } from "../../../../lib/auth";
import { dispatchServerEvents } from "../../../../lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const headers = authCors(request);
  const auth = sessionOr401(request, headers);
  if (!auth.ok) return auth.response;
  const role = requireRole(auth.session, ["business", "admin"], headers);
  if (!role.ok) return role.response;
  if (!auth.session.tenantId) {
    return json({ ok: false, code: "FORBIDDEN", message: apiMessages.forbidden }, 403, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const { id } = await context.params;
  try {
    const row = await getBookingForTenant(auth.session.tenantId, id);
    return json({ ok: true, booking: toPublicBooking(row) }, 200, headers);
  } catch (error: unknown) {
    if (error instanceof TenantAccessError) {
      return json({ ok: false, code: error.code, message: apiMessages.notFound }, 404, headers);
    }
    return json({ ok: false, code: "ERROR" }, 500, headers);
  }
}

const PatchBody = z
  .object({
    status: z.enum(["pending", "confirmed", "cancelled", "no_show"]).optional(),
    suggestStartsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))).optional(),
    eventId: z.string().uuid().optional(),
    analyticsConsent: z.boolean().optional(),
    marketingConsent: z.boolean().optional(),
  })
  .refine((value) => Boolean(value.status) !== Boolean(value.suggestStartsAt), {
    message: "status or suggestStartsAt",
  });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const headers = authCors(request);
  const auth = sessionOr401(request, headers);
  if (!auth.ok) return auth.response;
  const role = requireRole(auth.session, ["business", "admin"], headers);
  if (!role.ok) return role.response;
  if (!auth.session.tenantId) {
    return json({ ok: false, code: "FORBIDDEN", message: apiMessages.forbidden }, 403, headers);
  }
  const parsed = PatchBody.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const { id } = await context.params;
  try {
    if (parsed.data.suggestStartsAt) {
      const existing = await getBookingForTenant(auth.session.tenantId, id);
      const suggested = new Date(parsed.data.suggestStartsAt);
      await notifyBookingAccount({
        bookingId: existing.id,
        type: "slot_suggested",
        title: app.notifySuggestTitle,
        body: `${app.notifySuggestBody} ${formatInNicosia(suggested)}`,
        payload: { suggestedStartsAt: suggested.toISOString() },
      });
      return json({ ok: true, booking: toPublicBooking(existing), suggestedStartsAt: suggested.toISOString() }, 200, headers);
    }
    const row = await updateBookingStatus(auth.session.tenantId, id, parsed.data.status!);
    const eventId = parsed.data.eventId ?? crypto.randomUUID();
    if (parsed.data.status === "cancelled") {
      await dispatchServerEvents({
        eventName: "booking_cancelled",
        eventId,
        params: { event_id: eventId, business_id: auth.session.tenantId },
        request,
      });
    }
    if (parsed.data.status === "confirmed") {
      await dispatchServerEvents({
        eventName: "booking_confirmed",
        eventId,
        params: {
          event_id: eventId,
          business_id: auth.session.tenantId,
          ref: row?.referredByCode,
        },
        request,
      });
      if (row?.referredByCode) await markReferralFirstBooking(row.referredByCode);
      if (row) {
        await notifyBookingAccount({
          bookingId: row.id,
          type: "booking_confirmed",
          title: app.notifyConfirmedTitle,
          body: app.notifyConfirmedBody,
        });
      }
    }
    return json({ ok: true, booking: row ? toPublicBooking(row) : row }, 200, headers);
  } catch (error: unknown) {
    if (error instanceof TenantAccessError) {
      return json({ ok: false, code: error.code, message: apiMessages.notFound }, 404, headers);
    }
    if (error instanceof BookingStatusError) {
      return json({ ok: false, code: error.code, message: error.message }, error.status, headers);
    }
    return json({ ok: false, code: "ERROR" }, 500, headers);
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
