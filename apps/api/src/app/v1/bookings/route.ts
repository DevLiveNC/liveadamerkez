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
