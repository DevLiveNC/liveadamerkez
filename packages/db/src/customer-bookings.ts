import { and, desc, eq } from "drizzle-orm";
import { canTransitionBookingStatus, nicosiaDateKey, TenantAccessError } from "@ada-merkez/shared";
import { getDb, withTenantDb } from "./client.js";
import { BookingConflictError, BookingStatusError, createBooking } from "./bookings.js";
import { booking, business, category, customer, location, service } from "./schema.js";
import { findApprovedBusinessId, getApprovedBusiness, listPublicServices } from "./catalog.js";
import { InvalidServiceError, listOpenSlots, slotStillOpen } from "./slots.js";

export { TenantAccessError };

export class SlotUnavailableError extends Error {
  readonly status = 409;
  readonly code = "SLOT_UNAVAILABLE";
  constructor(message = "Bu saat artık boş değil.") {
    super(message);
    this.name = "SlotUnavailableError";
  }
}

export async function listBookingsForAccount(accountId: string) {
  return getDb()
    .select({
      id: booking.id,
      tenantId: booking.tenantId,
      status: booking.status,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      displayTimezone: booking.displayTimezone,
      businessName: business.name,
      sample: business.sample,
      city: location.cityName,
      category: category.name,
      serviceName: service.name,
    })
    .from(booking)
    .innerJoin(business, eq(booking.tenantId, business.id))
    .leftJoin(location, eq(business.locationId, location.id))
    .leftJoin(category, eq(business.categoryId, category.id))
    .leftJoin(service, eq(booking.serviceId, service.id))
    .where(eq(booking.accountId, accountId))
    .orderBy(desc(booking.startsAt));
}

export async function getBookingForAccount(accountId: string, bookingId: string) {
  const [row] = await getDb()
    .select()
    .from(booking)
    .where(and(eq(booking.id, bookingId), eq(booking.accountId, accountId)))
    .limit(1);
  if (!row) throw new TenantAccessError();
  return row;
}

async function upsertTenantCustomer(input: {
  tenantId: string;
  phone: string;
  name: string | null;
}) {
  return withTenantDb(input.tenantId, async (db) => {
    const [existing] = await db
      .select()
      .from(customer)
      .where(and(eq(customer.tenantId, input.tenantId), eq(customer.phone, input.phone)))
      .limit(1);
    if (existing) return existing;
    const [created] = await db
      .insert(customer)
      .values({ tenantId: input.tenantId, phone: input.phone, name: input.name })
      .returning();
    return created;
  });
}

export async function createCustomerBooking(input: {
  accountId: string;
  phone: string;
  name: string | null;
  businessId: string;
  startsAt: Date;
  serviceId?: string;
}) {
  const published = await findApprovedBusinessId(input.businessId);
  if (!published) throw new TenantAccessError();
  const biz = await getApprovedBusiness(published);
  if (!biz) throw new TenantAccessError();
  if (input.startsAt.getTime() <= Date.now()) {
    throw new SlotUnavailableError();
  }
  const services = await listPublicServices(published);
  if (input.serviceId && !services.some((item) => item.id === input.serviceId)) {
    throw new InvalidServiceError();
  }
  const date = nicosiaDateKey(input.startsAt, biz.timezone);
  const open = await listOpenSlots({
    businessId: published,
    date,
    serviceId: input.serviceId,
  });
  const match = open?.slots.find((slot) => slot.startsAt === input.startsAt.toISOString());
  if (!match) {
    throw new SlotUnavailableError();
  }
  const endsAt = new Date(match.endsAt);
  const still = await slotStillOpen({
    businessId: published,
    startsAt: input.startsAt,
    endsAt,
    staffId: match.staffId,
  });
  if (!still) {
    throw new BookingConflictError();
  }
  const crm = await upsertTenantCustomer({
    tenantId: published,
    phone: input.phone,
    name: input.name,
  });
  return createBooking({
    tenantId: published,
    kind: "slot",
    startsAt: input.startsAt,
    endsAt,
    staffId: match.staffId,
    serviceId: input.serviceId ?? match.serviceId,
    customerId: crm?.id ?? null,
    accountId: input.accountId,
    status: "pending",
    displayTimezone: biz.timezone,
  });
}

export async function cancelBookingForAccount(accountId: string, bookingId: string) {
  const existing = await getBookingForAccount(accountId, bookingId);
  if (!canTransitionBookingStatus(existing.status, "cancelled")) {
    throw new BookingStatusError();
  }
  return withTenantDb(existing.tenantId, async (db) => {
    const [row] = await db
      .update(booking)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(booking.id, existing.id), eq(booking.accountId, accountId)))
      .returning();
    if (!row) throw new TenantAccessError();
    return row;
  });
}
