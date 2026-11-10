import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import {
  BookingConflictError,
  createBooking,
  isDatabaseConfigured,
  listBookingsForTenant,
} from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../lib/http";
import { sessionOr401 } from "../../../lib/auth";
import { dispatchServerEvents, paramsFromAttribution } from "../../../lib/analytics";
import { parseStoredAttribution } from "@ada-merkez/shared";

export const dynamic = "force-dynamic";

const Body = z.object({
  kind: z.enum(["slot", "table"]),
  startsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  endsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  staffId: z.string().uuid().optional(),
  resourceId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  referredByCode: z.string().max(16).optional(),
  analyticsConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  attribution: z
    .object({
      first: z.object({}).passthrough().nullable().optional(),
      last: z.object({}).passthrough().nullable().optional(),
    })
    .optional(),
});

export async function GET(request: Request) {
  const headers = corsHeaders(request);
  const auth = sessionOr401(request, headers);
  if (!auth.ok) return auth.response;
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const rows = await listBookingsForTenant(auth.session.tenantId);
  return json({ ok: true, bookings: rows }, 200, headers);
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const auth = sessionOr401(request, headers);
  if (!auth.ok) return auth.response;
  const parsed = Body.safeParse(await readJson(request));
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
  try {
    const attribution = parseStoredAttribution(parsed.data.attribution);
    const eventId = parsed.data.eventId ?? crypto.randomUUID();
    const referredByCode =
      parsed.data.referredByCode ?? attribution?.last?.ref ?? attribution?.first?.ref ?? null;
    const row = await createBooking({
      tenantId: auth.session.tenantId,
      kind: parsed.data.kind,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      staffId: parsed.data.staffId,
      resourceId: parsed.data.resourceId,
      serviceId: parsed.data.serviceId,
      customerId: parsed.data.customerId,
      locationId: parsed.data.locationId,
      status: "pending",
      firstTouch: attribution?.first ?? null,
      lastTouch: attribution?.last ?? null,
      referredByCode,
      eventId,
    });
    await dispatchServerEvents({
      eventName: "begin_booking",
      eventId,
      params: paramsFromAttribution(eventId, attribution),
      analyticsConsent: parsed.data.analyticsConsent === true,
      marketingConsent: parsed.data.marketingConsent === true,
    });
    return json({ ok: true, booking: row }, 201, headers);
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return json({ ok: false, code: error.code, message: error.message }, 409, headers);
    }
    return json({ ok: false, code: "ERROR", message: apiMessages.notFound }, 500, headers);
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
