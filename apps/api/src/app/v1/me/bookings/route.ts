import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import {
  BookingConflictError,
  InvalidServiceError,
  SlotUnavailableError,
  TenantAccessError,
  createCustomerBooking,
  getAccountById,
  isDatabaseConfigured,
  listBookingsForAccount,
} from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../../lib/http";
import { customerOr401 } from "../../../../lib/auth";
import { consumeRateLimit, limitRequest } from "../../../../lib/rate-limit";

export const dynamic = "force-dynamic";

const Body = z.object({
  businessId: z.string().uuid(),
  startsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  serviceId: z.string().uuid().optional(),
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
  const bookings = await listBookingsForAccount(auth.session.sub);
  return json({ ok: true, bookings }, 200, headers);
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const auth = customerOr401(request, headers);
  if (!auth.ok) return auth.response;
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID", message: apiMessages.invalidAuth }, 400, headers);
  }
  const limitedAccount = await consumeRateLimit(`booking:account:${auth.session.sub}`, 8, 10 * 60 * 1000);
  const limitedIp = await limitRequest(request, "booking", 12, 10 * 60 * 1000);
  if (!limitedAccount.ok || !limitedIp.ok) {
    const retryAfterMs =
      (!limitedAccount.ok ? limitedAccount.retryAfterMs : 0) ||
      (!limitedIp.ok ? limitedIp.retryAfterMs : 0);
    return json({ ok: false, code: "RATE_LIMITED", message: apiMessages.rateLimited, retryAfterMs }, 429, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const account = await getAccountById(auth.session.sub);
  if (!account) {
    return json({ ok: false, code: "UNAUTHORIZED", message: apiMessages.unauthorized }, 401, headers);
  }
  try {
    const booking = await createCustomerBooking({
      accountId: account.id,
      phone: account.phone,
      name: account.name,
      businessId: parsed.data.businessId,
      startsAt: new Date(parsed.data.startsAt),
      serviceId: parsed.data.serviceId,
    });
    return json({ ok: true, booking }, 201, headers);
  } catch (error) {
    if (error instanceof TenantAccessError) {
      return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
    }
    if (error instanceof InvalidServiceError) {
      return json({ ok: false, code: error.code, message: apiMessages.invalidService }, 400, headers);
    }
    if (error instanceof SlotUnavailableError) {
      return json(
        { ok: false, code: error.code, message: apiMessages.slotUnavailable },
        409,
        headers,
      );
    }
    if (error instanceof BookingConflictError) {
      return json({ ok: false, code: "SLOT_TAKEN", message: apiMessages.slotTaken }, 409, headers);
    }
    throw error;
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
