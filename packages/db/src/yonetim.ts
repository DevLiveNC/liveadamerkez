import { and, count, desc, eq, gte, lt, notInArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  TenantAccessError,
  canTransitionBookingStatus,
  maskPhone,
  nicosiaWallTimeToUtc,
  utcToNicosiaParts,
  nicosiaDateKey,
} from "@ada-merkez/shared";
import { BookingStatusError } from "./bookings.js";
import { checkDatabase, getPool, type Database } from "./client.js";
import { getAccountById } from "./accounts.js";
import * as schema from "./schema.js";
import {
  appAccount,
  auditLog,
  booking,
  business,
  businessApplication,
  category,
} from "./schema.js";

export async function withAdminDb<T>(
  fn: (db: Database) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.is_admin', 'true', true)");
    await client.query("SET LOCAL ROLE ada_app");
    const scoped = drizzle(client, { schema });
    const value = await fn(scoped);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function adminAccountSnapshot(userId: string) {
  const account = await getAccountById(userId);
  if (!account) return null;
  return {
    user: {
      id: account.id,
      phone: account.phone,
      email: account.email,
      displayName: account.name,
      role: account.role,
    },
  };
}

async function writeAudit(
  db: Database,
  actorUserId: string,
  action: string,
  entityKind: string,
  entityId: string | null,
  detail?: unknown,
) {
  await db.insert(auditLog).values({
    actorUserId,
    action,
    entityKind,
    entityId,
    detail: detail ?? null,
  });
}

export async function listAdminBusinesses(status?: string) {
  return withAdminDb(async (db) => {
    const rows = await db
      .select({
        id: business.id,
        name: business.name,
        slug: business.slug,
        status: business.status,
        cityName: business.cityName,
        sector: business.sector,
        inTurkey: business.inTurkey,
        phone: business.phone,
        createdAt: business.createdAt,
        categoryName: category.name,
      })
      .from(business)
      .leftJoin(category, eq(business.categoryId, category.id))
      .orderBy(desc(business.createdAt));
    if (!status) return rows;
    return rows.filter((row) => row.status === status);
  });
}

export async function setBusinessStatus(
  actorUserId: string,
  businessId: string,
  status: "approved" | "rejected",
) {
  return withAdminDb(async (db) => {
    const [existing] = await db
      .select()
      .from(business)
      .where(eq(business.id, businessId))
      .limit(1);
    if (!existing) throw new TenantAccessError();
    const [row] = await db
      .update(business)
      .set({ status, updatedAt: new Date() })
      .where(eq(business.id, businessId))
      .returning();
    await writeAudit(
      db,
      actorUserId,
      `business.${status}`,
      "business",
      businessId,
      {
        from: existing.status,
        to: status,
      },
    );
    return row;
  });
}

export async function listAdminApplications(status?: string) {
  const rows = await withAdminDb((db) =>
    db
      .select({
        id: businessApplication.id,
        businessName: businessApplication.businessName,
        sector: businessApplication.sector,
        city: businessApplication.city,
        inTurkey: businessApplication.inTurkey,
        contactName: businessApplication.contactName,
        status: businessApplication.status,
        createdAt: businessApplication.createdAt,
      })
      .from(businessApplication)
      .orderBy(desc(businessApplication.createdAt)),
  );
  if (!status) return rows;
  return rows.filter((row) => row.status === status);
}

export async function setApplicationStatus(
  actorUserId: string,
  applicationId: string,
  status: "approved" | "rejected" | "review",
) {
  return withAdminDb(async (db) => {
    const [existing] = await db
      .select()
      .from(businessApplication)
      .where(eq(businessApplication.id, applicationId))
      .limit(1);
    if (!existing) throw new TenantAccessError();
    const [row] = await db
      .update(businessApplication)
      .set({ status, updatedAt: new Date() })
      .where(eq(businessApplication.id, applicationId))
      .returning({
        id: businessApplication.id,
        businessName: businessApplication.businessName,
        status: businessApplication.status,
        updatedAt: businessApplication.updatedAt,
      });
    await writeAudit(
      db,
      actorUserId,
      `application.${status}`,
      "business_application",
      applicationId,
      {
        from: existing.status,
        to: status,
      },
    );
    return row;
  });
}

export const ADMIN_BOOKING_LIST_LIMIT = 200;
export const ADMIN_BOOKING_MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;

export function adminBookingRangeError(
  from?: Date,
  to?: Date,
): "invalid_range" | "range_too_large" | null {
  if (!from || !to) return null;
  if (from.getTime() >= to.getTime()) return "invalid_range";
  if (to.getTime() - from.getTime() > ADMIN_BOOKING_MAX_RANGE_MS)
    return "range_too_large";
  return null;
}

export async function listAdminUsers() {
  const rows = await withAdminDb((db) =>
    db
      .select({
        id: appAccount.id,
        phone: appAccount.phone,
        email: appAccount.email,
        displayName: appAccount.name,
        role: appAccount.role,
        createdAt: appAccount.createdAt,
      })
      .from(appAccount)
      .orderBy(desc(appAccount.createdAt)),
  );
  return rows.map((row) => ({ ...row, phone: maskPhone(row.phone) }));
}

export type AdminBookingFilters = {
  from?: Date;
  to?: Date;
  tenantId?: string;
  status?: "pending" | "confirmed" | "cancelled" | "no_show";
  channel?: "app" | "whatsapp";
};

export async function listAdminBookings(range?: AdminBookingFilters) {
  return withAdminDb(async (db) => {
    const filters = [];
    if (range?.from) filters.push(gte(booking.startsAt, range.from));
    if (range?.to) filters.push(lt(booking.startsAt, range.to));
    if (range?.tenantId) filters.push(eq(booking.tenantId, range.tenantId));
    if (range?.status) filters.push(eq(booking.status, range.status));
    if (range?.channel) filters.push(eq(booking.channel, range.channel));
    const where = filters.length ? and(...filters) : undefined;
    const active = notInArray(booking.status, ["cancelled", "no_show"]);
    const countedWhere = where ? and(where, active) : active;

    const [totalRow] = await db
      .select({ n: count() })
      .from(booking)
      .innerJoin(business, eq(booking.tenantId, business.id))
      .where(where);
    const [activeRow] = await db
      .select({ n: count() })
      .from(booking)
      .innerJoin(business, eq(booking.tenantId, business.id))
      .where(countedWhere);
    const [waRow] = await db
      .select({ n: count() })
      .from(booking)
      .innerJoin(business, eq(booking.tenantId, business.id))
      .where(and(countedWhere, eq(booking.channel, "whatsapp")));

    const bookings = await db
      .select({
        id: booking.id,
        tenantId: booking.tenantId,
        businessName: business.name,
        status: booking.status,
        kind: booking.kind,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        channel: booking.channel,
        customerName: booking.customerName,
        notes: booking.notes,
        createdAt: booking.createdAt,
      })
      .from(booking)
      .innerJoin(business, eq(booking.tenantId, business.id))
      .where(where)
      .orderBy(desc(booking.startsAt))
      .limit(ADMIN_BOOKING_LIST_LIMIT);

    const total = Number(totalRow?.n ?? 0);
    const countedTotal = Number(activeRow?.n ?? 0);
    const wa = Number(waRow?.n ?? 0);
    return {
      bookings,
      total,
      truncated: total > bookings.length,
      counted: { total: countedTotal, wa, app: countedTotal - wa },
    };
  });
}

export async function setAdminBookingStatus(
  actorUserId: string,
  bookingId: string,
  nextStatus: "pending" | "confirmed" | "cancelled" | "no_show",
) {
  return withAdminDb(async (db) => {
    const [existing] = await db
      .select()
      .from(booking)
      .where(eq(booking.id, bookingId))
      .limit(1);
    if (!existing) throw new TenantAccessError();
    if (!canTransitionBookingStatus(existing.status, nextStatus)) {
      throw new BookingStatusError();
    }
    const [row] = await db
      .update(booking)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(booking.id, bookingId))
      .returning({
        id: booking.id,
        tenantId: booking.tenantId,
        status: booking.status,
        kind: booking.kind,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        channel: booking.channel,
        customerName: booking.customerName,
        notes: booking.notes,
        updatedAt: booking.updatedAt,
      });
    await writeAudit(
      db,
      actorUserId,
      `booking.${nextStatus}`,
      "booking",
      bookingId,
      {
        from: existing.status,
        to: nextStatus,
      },
    );
    return row;
  });
}

export async function listAdminCategories() {
  return withAdminDb((db) => db.select().from(category).orderBy(category.name));
}

function slugifyCategory(name: string): string {
  const folded = name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
  return (
    folded
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "kategori"
  );
}

export async function createAdminCategory(
  actorUserId: string,
  input: { name: string; kind: string; slug?: string },
) {
  const slug = (input.slug?.trim() || slugifyCategory(input.name)).slice(0, 48);
  return withAdminDb(async (db) => {
    const [row] = await db
      .insert(category)
      .values({
        name: input.name.trim(),
        kind: input.kind.trim(),
        slug,
      })
      .returning();
    if (!row) throw new Error("Kategori yazılamadı.");
    await writeAudit(db, actorUserId, "category.create", "category", row.id);
    return row;
  });
}

export async function updateAdminCategory(
  actorUserId: string,
  categoryId: string,
  patch: { name?: string; kind?: string },
) {
  return withAdminDb(async (db) => {
    const [existing] = await db
      .select()
      .from(category)
      .where(eq(category.id, categoryId))
      .limit(1);
    if (!existing) throw new TenantAccessError();
    const [row] = await db
      .update(category)
      .set({
        name: patch.name?.trim() || existing.name,
        kind: patch.kind?.trim() || existing.kind,
        updatedAt: new Date(),
      })
      .where(eq(category.id, categoryId))
      .returning();
    await writeAudit(
      db,
      actorUserId,
      "category.update",
      "category",
      categoryId,
      {
        name: row?.name,
      },
    );
    return row;
  });
}

function nicosiaTodayWindow(now = new Date()) {
  const parts = utcToNicosiaParts(now);
  const start = nicosiaWallTimeToUtc(
    parts.year,
    parts.month,
    parts.day,
    0,
    0,
    0,
  );
  const end = nicosiaWallTimeToUtc(
    parts.year,
    parts.month,
    parts.day + 1,
    0,
    0,
    0,
  );
  return { start, end };
}

export async function adminReports() {
  const { start, end } = nicosiaTodayWindow();
  return withAdminDb(async (db) => {
    const [pendingBiz] = await db
      .select({ n: count() })
      .from(business)
      .where(eq(business.status, "pending"));
    const [approvedBiz] = await db
      .select({ n: count() })
      .from(business)
      .where(eq(business.status, "approved"));
    const [users] = await db.select({ n: count() }).from(appAccount);
    const [todayBookings] = await db
      .select({ n: count() })
      .from(booking)
      .where(and(gte(booking.startsAt, start), lt(booking.startsAt, end)));
    const [applications] = await db
      .select({ n: count() })
      .from(businessApplication);
    return {
      businessesPending: Number(pendingBiz?.n ?? 0),
      businessesApproved: Number(approvedBiz?.n ?? 0),
      usersTotal: Number(users?.n ?? 0),
      bookingsToday: Number(todayBookings?.n ?? 0),
      applicationsTotal: Number(applications?.n ?? 0),
    };
  });
}

export async function listAuditLog() {
  return withAdminDb((db) =>
    db
      .select({
        id: auditLog.id,
        actorUserId: auditLog.actorUserId,
        action: auditLog.action,
        entityKind: auditLog.entityKind,
        entityId: auditLog.entityId,
        detail: auditLog.detail,
        createdAt: auditLog.createdAt,
        actorName: appAccount.name,
        actorPhone: appAccount.phone,
      })
      .from(auditLog)
      .leftJoin(appAccount, eq(auditLog.actorUserId, appAccount.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(100),
  ).then((rows) =>
    rows.map((row) => ({
      ...row,
      actorPhone: row.actorPhone ? maskPhone(row.actorPhone) : null,
    })),
  );
}

export async function adminHealth() {
  const db = await checkDatabase();
  return {
    api: "ok" as const,
    db,
    timezone: process.env.APP_TIMEZONE?.trim() || "Europe/Nicosia",
    waitlistOpen: false,
    whatsapp: "not_connected" as const,
    queue: "closed" as const,
  };
}

export type DailyBookingSummary = {
  day: string;
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  noShow: number;
  app: number;
  whatsapp: number;
};

/** Bütün aralığı veritabanında sayar; listelerin 200 satır sınırı rapora sızmaz. */
export async function adminBookingReport(range: { from: Date; to: Date }) {
  const timezone = "Europe/Nicosia";
  const day =
    sql<string>`to_char(${booking.startsAt} AT TIME ZONE ${timezone}, 'YYYY-MM-DD')`.mapWith(
      String,
    );
  const total = count();
  const confirmed =
    sql<number>`count(*) filter (where ${booking.status} = 'confirmed')`.mapWith(
      Number,
    );
  const pending =
    sql<number>`count(*) filter (where ${booking.status} = 'pending')`.mapWith(
      Number,
    );
  const cancelled =
    sql<number>`count(*) filter (where ${booking.status} = 'cancelled')`.mapWith(
      Number,
    );
  const noShow =
    sql<number>`count(*) filter (where ${booking.status} = 'no_show')`.mapWith(
      Number,
    );
  const app =
    sql<number>`count(*) filter (where ${booking.channel} = 'app' and ${booking.status} in ('pending', 'confirmed'))`.mapWith(
      Number,
    );
  const whatsapp =
    sql<number>`count(*) filter (where ${booking.channel} = 'whatsapp' and ${booking.status} in ('pending', 'confirmed'))`.mapWith(
      Number,
    );
  const rows = await withAdminDb((db) =>
    db
      .select({
        day,
        total,
        confirmed,
        pending,
        cancelled,
        noShow,
        app,
        whatsapp,
      })
      .from(booking)
      .where(
        and(gte(booking.startsAt, range.from), lt(booking.startsAt, range.to)),
      )
      .groupBy(sql`1`)
      .orderBy(sql`1`),
  );
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const days: DailyBookingSummary[] = [];
  const cursor = new Date(range.from);
  while (cursor < range.to && days.length <= 31) {
    const key = nicosiaDateKey(cursor, timezone);
    days.push(
      byDay.get(key) ?? {
        day: key,
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        noShow: 0,
        app: 0,
        whatsapp: 0,
      },
    );
    const parts = utcToNicosiaParts(cursor, timezone);
    cursor.setTime(
      nicosiaWallTimeToUtc(
        parts.year,
        parts.month,
        parts.day + 1,
        0,
        0,
        0,
        timezone,
      ).getTime(),
    );
  }
  return {
    from: nicosiaDateKey(range.from, timezone),
    to: nicosiaDateKey(new Date(range.to.getTime() - 1), timezone),
    days,
    total: rows.reduce((sum, row) => sum + row.total, 0),
    active: rows.reduce((sum, row) => sum + row.confirmed + row.pending, 0),
    app: rows.reduce((sum, row) => sum + row.app, 0),
    whatsapp: rows.reduce((sum, row) => sum + row.whatsapp, 0),
  };
}
