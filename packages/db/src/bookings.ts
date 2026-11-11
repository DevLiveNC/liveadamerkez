import { and, count, eq, gte, lt } from "drizzle-orm";
import type { BookingKind, BookingStatus } from "@ada-merkez/shared";
import {
  TenantAccessError,
  assertSameTenant,
  canTransitionBookingStatus,
} from "@ada-merkez/shared";

export { TenantAccessError };
import { withTenantDb } from "./client.js";
import { booking } from "./schema.js";

export class BookingConflictError extends Error {
  readonly status = 409;
  readonly code = "BOOKING_CONFLICT";

  constructor(message = "Bu saat aralığı dolu.") {
    super(message);
    this.name = "BookingConflictError";
  }
}

export class BookingStatusError extends Error {
  readonly status = 422;
  readonly code = "INVALID_STATUS_TRANSITION";

  constructor(message = "Bu durum geçişi geçerli değil.") {
    super(message);
    this.name = "BookingStatusError";
  }
}

export type NewBooking = {
  tenantId: string;
  kind: BookingKind;
  startsAt: Date;
  endsAt: Date;
  staffId?: string | null;
  resourceId?: string | null;
  serviceId?: string | null;
  customerId?: string | null;
  accountId?: string | null;
  locationId?: string | null;
  status?: BookingStatus;
  displayTimezone?: string;
  notes?: string | null;
  channel?: "app" | "whatsapp";
  customerName?: string | null;
  customerPhone?: string | null;
  firstTouch?: unknown;
  lastTouch?: unknown;
  referredByCode?: string | null;
  eventId?: string | null;
};

function isExclusionViolation(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const code = "code" in current ? String(current.code) : "";
    const constraint = "constraint" in current ? String(current.constraint) : "";
    const message = "message" in current ? String(current.message) : "";
    if (
      code === "23P01" ||
      constraint.includes("overlap_excl") ||
      /exclusion|23P01|overlap_excl/i.test(message)
    ) {
      return true;
    }
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}

export async function createBooking(input: NewBooking) {
  try {
    return await withTenantDb(input.tenantId, async (db) => {
      const [row] = await db
        .insert(booking)
        .values({
          tenantId: input.tenantId,
          kind: input.kind,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          staffId: input.staffId ?? null,
          resourceId: input.resourceId ?? null,
          serviceId: input.serviceId ?? null,
          customerId: input.customerId ?? null,
          accountId: input.accountId ?? null,
          locationId: input.locationId ?? null,
          status: input.status ?? "pending",
          displayTimezone: input.displayTimezone ?? "Europe/Nicosia",
          notes: input.notes ?? null,
          channel: input.channel ?? "app",
          customerName: input.customerName ?? null,
          customerPhone: input.customerPhone ?? null,
          firstTouch: input.firstTouch ?? null,
          lastTouch: input.lastTouch ?? null,
          referredByCode: input.referredByCode ?? null,
          eventId: input.eventId ?? null,
        })
        .returning();
      return row;
    });
  } catch (error) {
    if (isExclusionViolation(error)) {
      throw new BookingConflictError();
    }
    throw error;
  }
}

export async function updateBookingStatus(
  tenantId: string,
  bookingId: string,
  status: BookingStatus,
) {
  return withTenantDb(tenantId, async (db) => {
    const [existing] = await db
      .select()
      .from(booking)
      .where(and(eq(booking.id, bookingId), eq(booking.tenantId, tenantId)))
      .limit(1);
    if (!existing) {
      throw new TenantAccessError();
    }
    assertSameTenant(existing.tenantId, tenantId);
    if (!canTransitionBookingStatus(existing.status, status)) {
      throw new BookingStatusError();
    }
    const [row] = await db
      .update(booking)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(booking.id, existing.id), eq(booking.tenantId, tenantId)))
      .returning();
    return row;
  });
}

const bookingPublicColumns = {
  id: booking.id,
  tenantId: booking.tenantId,
  locationId: booking.locationId,
  kind: booking.kind,
  staffId: booking.staffId,
  serviceId: booking.serviceId,
  resourceId: booking.resourceId,
  customerId: booking.customerId,
  status: booking.status,
  startsAt: booking.startsAt,
  endsAt: booking.endsAt,
  displayTimezone: booking.displayTimezone,
  notes: booking.notes,
  channel: booking.channel,
  customerName: booking.customerName,
  firstTouch: booking.firstTouch,
  lastTouch: booking.lastTouch,
  referredByCode: booking.referredByCode,
  eventId: booking.eventId,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
};

export function toPublicBooking<T extends { customerPhone?: string | null }>(row: T): Omit<T, "customerPhone"> {
  const { customerPhone: _phone, ...rest } = row;
  return rest;
}

export async function listBookingsForTenant(
  tenantId: string,
  options?: {
    from?: Date;
    to?: Date;
    channel?: "app" | "whatsapp";
    status?: "pending" | "confirmed" | "cancelled" | "no_show";
  },
) {
  return withTenantDb(tenantId, (db) => {
    const filters = [eq(booking.tenantId, tenantId)];
    if (options?.from) filters.push(gte(booking.startsAt, options.from));
    if (options?.to) filters.push(lt(booking.startsAt, options.to));
    if (options?.channel) filters.push(eq(booking.channel, options.channel));
    if (options?.status) filters.push(eq(booking.status, options.status));
    return db.select(bookingPublicColumns).from(booking).where(and(...filters));
  });
}

export async function getBookingForTenant(tenantId: string, bookingId: string) {
  const row = await withTenantDb(tenantId, async (db) => {
    const [found] = await db
      .select()
      .from(booking)
      .where(and(eq(booking.id, bookingId), eq(booking.tenantId, tenantId)))
      .limit(1);
    return found ?? null;
  });
  if (!row) {
    throw new TenantAccessError();
  }
  assertSameTenant(row.tenantId, tenantId);
  return row;
}

export async function bookingCountForTenant(tenantId: string): Promise<number> {
  return withTenantDb(tenantId, async (db) => {
    const [row] = await db
      .select({ n: count() })
      .from(booking)
      .where(eq(booking.tenantId, tenantId));
    return Number(row?.n ?? 0);
  });
}
