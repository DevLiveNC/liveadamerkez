import { and, count, desc, eq, gte, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  TenantAccessError,
  canTransitionBookingStatus,
  nicosiaWallTimeToUtc,
  utcToNicosiaParts,
} from "@ada-merkez/shared";
import { BookingStatusError } from "./bookings.js";
import { checkDatabase, getPool, type Database } from "./client.js";
import { getAccountById } from "./accounts.js";
import * as schema from "./schema.js";
import { appAccount, auditLog, booking, business, businessApplication, category } from "./schema.js";

export async function withAdminDb<T>(fn: (db: Database) => Promise<T>): Promise<T> {
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
    const [existing] = await db.select().from(business).where(eq(business.id, businessId)).limit(1);
    if (!existing) throw new TenantAccessError();
    const [row] = await db
      .update(business)
      .set({ status, updatedAt: new Date() })
      .where(eq(business.id, businessId))
      .returning();
    await writeAudit(db, actorUserId, `business.${status}`, "business", businessId, {
      from: existing.status,
      to: status,
    });
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
    await writeAudit(db, actorUserId, `application.${status}`, "business_application", applicationId, {
      from: existing.status,
      to: status,
    });
    return row;
  });
}

export async function listAdminUsers() {
  return withAdminDb((db) =>
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
}

export async function listAdminBookings(range?: { from?: Date; to?: Date }) {
  return withAdminDb((db) => {
    const filters = [];
    if (range?.from) filters.push(gte(booking.startsAt, range.from));
    if (range?.to) filters.push(lt(booking.startsAt, range.to));
    return db
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
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(booking.startsAt))
      .limit(200);
  });
}

export async function setAdminBookingStatus(
  actorUserId: string,
  bookingId: string,
  nextStatus: "pending" | "confirmed" | "cancelled" | "no_show",
) {
  return withAdminDb(async (db) => {
    const [existing] = await db.select().from(booking).where(eq(booking.id, bookingId)).limit(1);
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
    await writeAudit(db, actorUserId, `booking.${nextStatus}`, "booking", bookingId, {
      from: existing.status,
      to: nextStatus,
    });
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
    const [existing] = await db.select().from(category).where(eq(category.id, categoryId)).limit(1);
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
    await writeAudit(db, actorUserId, "category.update", "category", categoryId, {
      name: row?.name,
    });
    return row;
  });
}

function nicosiaTodayWindow(now = new Date()) {
  const parts = utcToNicosiaParts(now);
  const start = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 0, 0, 0);
  const end = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + 1, 0, 0, 0);
  return { start, end };
}

export async function adminReports() {
  const { start, end } = nicosiaTodayWindow();
  return withAdminDb(async (db) => {
    const [pendingBiz] = await db.select({ n: count() }).from(business).where(eq(business.status, "pending"));
    const [approvedBiz] = await db.select({ n: count() }).from(business).where(eq(business.status, "approved"));
    const [users] = await db.select({ n: count() }).from(appAccount);
    const [todayBookings] = await db
      .select({ n: count() })
      .from(booking)
      .where(and(gte(booking.startsAt, start), lt(booking.startsAt, end)));
    const [applications] = await db.select({ n: count() }).from(businessApplication);
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
