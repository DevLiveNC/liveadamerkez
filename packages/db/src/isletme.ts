import { and, count, eq, gte, isNull, lt } from "drizzle-orm";
import {
  TenantAccessError,
  assertSameTenant,
  nicosiaWallTimeToUtc,
  utcToNicosiaParts,
} from "@ada-merkez/shared";

type AppRole = "customer" | "business" | "admin";
import { getDb, withTenantDb } from "./client.js";
import { createAccount, findAccountByPhoneRole, getAccountById } from "./accounts.js";
import {
  appAccount,
  availabilityRule,
  booking,
  business,
  businessMember,
  category,
  location,
  service,
  staff,
} from "./schema.js";

export class BusinessPendingError extends Error {
  readonly status = 409;
  readonly code = "BUSINESS_EXISTS";

  constructor(message = "Bu telefon için işletme kaydı zaten var.") {
    super(message);
    this.name = "BusinessPendingError";
  }
}

export class ForbiddenRoleError extends Error {
  readonly status = 403;
  readonly code = "FORBIDDEN";

  constructor(message = "Bu işlem için yetkiniz yok.") {
    super(message);
    this.name = "ForbiddenRoleError";
  }
}

const CITY_IDS: Record<string, string> = {
  lefkosa: "a0000000-0000-4000-8000-000000000001",
  girne: "a0000000-0000-4000-8000-000000000002",
  magusa: "a0000000-0000-4000-8000-000000000003",
};

function slugify(name: string): string {
  const folded = name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
  const base = folded
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "isletme"}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function findUserByPhone(phone: string) {
  const business = await findAccountByPhoneRole(phone, "business");
  if (business) return business;
  const [row] = await getDb().select().from(appAccount).where(eq(appAccount.phone, phone)).limit(1);
  return row ?? null;
}

export async function findUserById(id: string) {
  return getAccountById(id);
}

export async function findOrCreateUser(input: {
  phone: string;
  displayName?: string | null;
  email?: string | null;
}) {
  const existing = await findUserByPhone(input.phone);
  if (existing) return existing;
  return createAccount({
    phone: input.phone,
    role: "customer",
    name: input.displayName ?? null,
    email: input.email ?? null,
  });
}

export async function membershipForUser(userId: string) {
  const [row] = await getDb()
    .select()
    .from(businessMember)
    .where(eq(businessMember.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function sessionSnapshot(userId: string) {
  const user = await findUserById(userId);
  if (!user) return null;
  const membership = await membershipForUser(userId);
  const biz = membership
    ? await getDb()
        .select()
        .from(business)
        .where(eq(business.id, membership.tenantId))
        .limit(1)
        .then((rows) => rows[0] ?? null)
    : null;
  return {
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      displayName: user.name,
      role: user.role as AppRole,
    },
    membership: membership
      ? { tenantId: membership.tenantId, memberRole: membership.memberRole }
      : null,
    business: biz
      ? {
          id: biz.id,
          name: biz.name,
          slug: biz.slug,
          status: biz.status,
          timezone: biz.timezone,
          phone: biz.phone,
          email: biz.email,
          whatsapp: biz.whatsapp,
          address: biz.address,
          description: biz.description,
          cityName: biz.cityName,
          sector: biz.sector,
          inTurkey: biz.inTurkey,
          categoryId: biz.categoryId,
          locationId: biz.locationId,
        }
      : null,
  };
}

export async function listBusinessMeta() {
  const [categories, cities] = await Promise.all([
    getDb()
      .select({ id: category.id, slug: category.slug, name: category.name, kind: category.kind })
      .from(category),
    getDb()
      .select({
        id: location.id,
        name: location.name,
        cityName: location.cityName,
      })
      .from(location)
      .where(isNull(location.tenantId)),
  ]);
  return { categories, cities };
}

export type RegisterBusinessInput = {
  userId: string;
  name: string;
  sector: string;
  city?: string | null;
  inTurkey: boolean;
  contactName: string;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
  notes?: string | null;
};

export async function registerBusiness(input: RegisterBusinessInput) {
  const user = await findUserById(input.userId);
  if (!user) throw new TenantAccessError("Oturum geçersiz.");
  if (user.role === "admin") {
    throw new ForbiddenRoleError("Yönetici hesabı işletme kaydı oluşturamaz.");
  }
  const existing = await membershipForUser(user.id);
  if (existing) throw new BusinessPendingError();

  const locationId = input.inTurkey ? null : (CITY_IDS[input.city ?? ""] ?? null);
  const cityName = input.inTurkey
    ? "Türkiye"
    : input.city === "lefkosa"
      ? "Lefkoşa"
      : input.city === "girne"
        ? "Girne"
        : input.city === "magusa"
          ? "Mağusa"
          : input.city
            ? "Diğer"
            : null;

  const [categoryRow] = await getDb()
    .select()
    .from(category)
    .where(eq(category.slug, input.sector === "kuafor" ? "kuafor" : input.sector))
    .limit(1);

  const [created] = await getDb()
    .insert(business)
    .values({
      name: input.name.trim(),
      slug: slugify(input.name),
      status: "pending",
      timezone: "Europe/Nicosia",
      phone: input.phone,
      email: input.email ?? null,
      whatsapp: input.whatsapp ?? null,
      description: input.notes ?? null,
      cityName,
      sector: input.sector,
      inTurkey: input.inTurkey,
      categoryId: categoryRow?.id ?? null,
      locationId,
      ownerUserId: user.id,
    })
    .returning();
  if (!created) throw new Error("İşletme kaydı oluşturulamadı.");

  await getDb().insert(businessMember).values({
    userId: user.id,
    tenantId: created.id,
    memberRole: "owner",
  });

  await getDb()
    .update(appAccount)
    .set({
      role: "business",
      name: input.contactName.trim() || user.name,
      email: input.email ?? user.email,
      tenantId: created.id,
      updatedAt: new Date(),
    })
    .where(eq(appAccount.id, user.id));

  return sessionSnapshot(user.id);
}

export async function updateBusinessProfile(
  tenantId: string,
  actorUserId: string,
  patch: {
    name?: string;
    phone?: string | null;
    email?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    description?: string | null;
    cityName?: string | null;
    sector?: string | null;
  },
) {
  await assertActorOwnsTenant(actorUserId, tenantId);
  return withTenantDb(tenantId, async (db) => {
    const [existing] = await db.select().from(business).where(eq(business.id, tenantId)).limit(1);
    if (!existing) throw new TenantAccessError();
    assertSameTenant(existing.id, tenantId);
    const [row] = await db
      .update(business)
      .set({
        name: patch.name?.trim() || existing.name,
        phone: patch.phone === undefined ? existing.phone : patch.phone,
        email: patch.email === undefined ? existing.email : patch.email,
        whatsapp: patch.whatsapp === undefined ? existing.whatsapp : patch.whatsapp,
        address: patch.address === undefined ? existing.address : patch.address,
        description: patch.description === undefined ? existing.description : patch.description,
        cityName: patch.cityName === undefined ? existing.cityName : patch.cityName,
        sector: patch.sector === undefined ? existing.sector : patch.sector,
        updatedAt: new Date(),
      })
      .where(eq(business.id, tenantId))
      .returning();
    return row;
  });
}

export async function assertActorOwnsTenant(userId: string, tenantId: string) {
  const membership = await membershipForUser(userId);
  if (!membership || membership.tenantId !== tenantId) {
    throw new TenantAccessError();
  }
  assertSameTenant(membership.tenantId, tenantId);
  return membership;
}

export async function listStaffForTenant(tenantId: string) {
  return withTenantDb(tenantId, (db) =>
    db.select().from(staff).where(eq(staff.tenantId, tenantId)),
  );
}

export async function createStaffForTenant(
  tenantId: string,
  actorUserId: string,
  input: { name: string; active?: boolean },
) {
  await assertActorOwnsTenant(actorUserId, tenantId);
  return withTenantDb(tenantId, async (db) => {
    const [row] = await db
      .insert(staff)
      .values({
        tenantId,
        name: input.name.trim(),
        active: input.active ?? true,
      })
      .returning();
    return row;
  });
}

export async function updateStaffForTenant(
  tenantId: string,
  actorUserId: string,
  staffId: string,
  patch: { name?: string; active?: boolean },
) {
  await assertActorOwnsTenant(actorUserId, tenantId);
  return withTenantDb(tenantId, async (db) => {
    const [existing] = await db
      .select()
      .from(staff)
      .where(and(eq(staff.id, staffId), eq(staff.tenantId, tenantId)))
      .limit(1);
    if (!existing) throw new TenantAccessError();
    const [row] = await db
      .update(staff)
      .set({
        name: patch.name?.trim() || existing.name,
        active: patch.active ?? existing.active,
      })
      .where(and(eq(staff.id, staffId), eq(staff.tenantId, tenantId)))
      .returning();
    return row;
  });
}

export async function listServicesForTenant(tenantId: string) {
  return withTenantDb(tenantId, (db) =>
    db.select().from(service).where(eq(service.tenantId, tenantId)),
  );
}

export async function createServiceForTenant(
  tenantId: string,
  actorUserId: string,
  input: {
    name: string;
    durationMinutes: number;
    staffId?: string | null;
    priceLabel?: string | null;
    description?: string | null;
    active?: boolean;
  },
) {
  await assertActorOwnsTenant(actorUserId, tenantId);
  if (input.staffId) await assertStaffInTenant(tenantId, input.staffId);
  return withTenantDb(tenantId, async (db) => {
    const [row] = await db
      .insert(service)
      .values({
        tenantId,
        name: input.name.trim(),
        durationMinutes: input.durationMinutes,
        staffId: input.staffId ?? null,
        priceLabel: emptyToNull(input.priceLabel),
        description: emptyToNull(input.description),
        active: input.active ?? true,
      })
      .returning();
    if (!row) throw new Error("Hizmet yazılamadı.");
    return row;
  });
}

export async function updateServiceForTenant(
  tenantId: string,
  actorUserId: string,
  serviceId: string,
  patch: {
    name?: string;
    durationMinutes?: number;
    staffId?: string | null;
    priceLabel?: string | null;
    description?: string | null;
    active?: boolean;
  },
) {
  await assertActorOwnsTenant(actorUserId, tenantId);
  if (patch.staffId) await assertStaffInTenant(tenantId, patch.staffId);
  return withTenantDb(tenantId, async (db) => {
    const [existing] = await db
      .select()
      .from(service)
      .where(and(eq(service.id, serviceId), eq(service.tenantId, tenantId)))
      .limit(1);
    if (!existing) throw new TenantAccessError();
    const [row] = await db
      .update(service)
      .set({
        name: patch.name?.trim() || existing.name,
        durationMinutes: patch.durationMinutes ?? existing.durationMinutes,
        staffId: patch.staffId === undefined ? existing.staffId : patch.staffId,
        priceLabel: patch.priceLabel === undefined ? existing.priceLabel : emptyToNull(patch.priceLabel),
        description:
          patch.description === undefined ? existing.description : emptyToNull(patch.description),
        active: patch.active ?? existing.active,
        updatedAt: new Date(),
      })
      .where(and(eq(service.id, serviceId), eq(service.tenantId, tenantId)))
      .returning();
    return row;
  });
}

export async function deleteServiceForTenant(
  tenantId: string,
  actorUserId: string,
  serviceId: string,
) {
  await assertActorOwnsTenant(actorUserId, tenantId);
  return withTenantDb(tenantId, async (db) => {
    const deleted = await db
      .delete(service)
      .where(and(eq(service.id, serviceId), eq(service.tenantId, tenantId)))
      .returning({ id: service.id });
    if (!deleted[0]) throw new TenantAccessError();
    return deleted[0];
  });
}

export async function listAvailabilityForTenant(tenantId: string) {
  return withTenantDb(tenantId, (db) =>
    db.select().from(availabilityRule).where(eq(availabilityRule.tenantId, tenantId)),
  );
}

export async function createAvailabilityForTenant(
  tenantId: string,
  actorUserId: string,
  input: {
    staffId?: string | null;
    resourceId?: string | null;
    weekday: number;
    startsAtMinutes: number;
    endsAtMinutes: number;
  },
) {
  await assertActorOwnsTenant(actorUserId, tenantId);
  if (input.staffId) await assertStaffInTenant(tenantId, input.staffId);
  return withTenantDb(tenantId, async (db) => {
    const [row] = await db
      .insert(availabilityRule)
      .values({
        tenantId,
        staffId: input.staffId ?? null,
        resourceId: input.resourceId ?? null,
        weekday: input.weekday,
        startsAtMinutes: input.startsAtMinutes,
        endsAtMinutes: input.endsAtMinutes,
        timezone: "Europe/Nicosia",
      })
      .returning();
    return row;
  });
}

export async function deleteAvailabilityForTenant(
  tenantId: string,
  actorUserId: string,
  ruleId: string,
) {
  await assertActorOwnsTenant(actorUserId, tenantId);
  return withTenantDb(tenantId, async (db) => {
    const deleted = await db
      .delete(availabilityRule)
      .where(and(eq(availabilityRule.id, ruleId), eq(availabilityRule.tenantId, tenantId)))
      .returning({ id: availabilityRule.id });
    if (!deleted[0]) throw new TenantAccessError();
    return deleted[0];
  });
}

export type SlotCell = {
  startsAt: string;
  endsAt: string;
  status: "free" | "busy";
  staffId: string | null;
};

export async function listSlotsForTenant(
  tenantId: string,
  options: { from: Date; to: Date; staffId?: string; serviceId?: string },
): Promise<SlotCell[]> {
  const [rules, bookings, services] = await Promise.all([
    listAvailabilityForTenant(tenantId),
    withTenantDb(tenantId, (db) =>
      db
        .select()
        .from(booking)
        .where(
          and(
            eq(booking.tenantId, tenantId),
            gte(booking.startsAt, options.from),
            lt(booking.startsAt, options.to),
          ),
        ),
    ),
    listServicesForTenant(tenantId),
  ]);
  const duration =
    services.find((row) => row.id === options.serviceId)?.durationMinutes ??
    services[0]?.durationMinutes ??
    30;
  const cells: SlotCell[] = [];
  const cursor = new Date(options.from);
  while (cursor < options.to) {
    const parts = utcToNicosiaParts(cursor);
    const civil = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0);
    const weekday = utcToNicosiaWeekday(civil);
    const dayRules = rules.filter(
      (rule) =>
        (rule.weekday === null || rule.weekday === weekday) &&
        (!options.staffId || rule.staffId === options.staffId || !rule.staffId),
    );
    for (const rule of dayRules) {
      for (
        let minutes = rule.startsAtMinutes;
        minutes + duration <= rule.endsAtMinutes;
        minutes += duration
      ) {
        const startH = Math.floor(minutes / 60);
        const startM = minutes % 60;
        const endMinutes = minutes + duration;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        const startsAt = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, startH, startM);
        const endsAt = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, endH, endM);
        if (startsAt < options.from || startsAt >= options.to) continue;
        const busy = bookings.some(
          (row) =>
            (row.status === "pending" || row.status === "confirmed") &&
            (!options.staffId || !row.staffId || row.staffId === options.staffId) &&
            row.startsAt < endsAt &&
            row.endsAt > startsAt,
        );
        cells.push({
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          status: busy ? "busy" : "free",
          staffId: rule.staffId,
        });
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return cells;
}

export async function bookingStatsForTenant(tenantId: string, now = new Date()) {
  const parts = utcToNicosiaParts(now);
  const todayStart = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 0, 0);
  const tomorrowStart = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + 1, 0, 0);
  const weekday = utcToNicosiaWeekday(todayStart);
  const mondayOffset = (weekday + 6) % 7;
  const weekStart = nicosiaWallTimeToUtc(
    parts.year,
    parts.month,
    parts.day - mondayOffset,
    0,
    0,
  );

  return withTenantDb(tenantId, async (db) => {
    const [todayConfirmed] = await db
      .select({ n: count() })
      .from(booking)
      .where(
        and(
          eq(booking.tenantId, tenantId),
          eq(booking.status, "confirmed"),
          gte(booking.startsAt, todayStart),
          lt(booking.startsAt, tomorrowStart),
        ),
      );
    const [todayPending] = await db
      .select({ n: count() })
      .from(booking)
      .where(
        and(
          eq(booking.tenantId, tenantId),
          eq(booking.status, "pending"),
          gte(booking.startsAt, todayStart),
          lt(booking.startsAt, tomorrowStart),
        ),
      );
    const [weekConfirmed] = await db
      .select({ n: count() })
      .from(booking)
      .where(
        and(
          eq(booking.tenantId, tenantId),
          eq(booking.status, "confirmed"),
          gte(booking.startsAt, weekStart),
        ),
      );
    const [pendingIncoming] = await db
      .select({ n: count() })
      .from(booking)
      .where(and(eq(booking.tenantId, tenantId), eq(booking.status, "pending")));
    return {
      todayConfirmed: Number(todayConfirmed?.n ?? 0),
      todayPending: Number(todayPending?.n ?? 0),
      weekConfirmed: Number(weekConfirmed?.n ?? 0),
      pendingIncoming: Number(pendingIncoming?.n ?? 0),
    };
  });
}

async function assertStaffInTenant(tenantId: string, staffId: string) {
  const rows = await withTenantDb(tenantId, (db) =>
    db
      .select({ id: staff.id })
      .from(staff)
      .where(and(eq(staff.id, staffId), eq(staff.tenantId, tenantId)))
      .limit(1),
  );
  if (!rows[0]) throw new TenantAccessError();
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function utcToNicosiaWeekday(date: Date): number {
  const parts = utcToNicosiaParts(date);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

export async function upsertSeedUser(input: {
  phone: string;
  role: AppRole;
  displayName: string;
}) {
  if (input.role === "admin" && process.env.ALLOW_ADMIN_SEED !== "true") {
    throw new ForbiddenRoleError("Yönetici hesabı yalnızca ALLOW_ADMIN_SEED=true iken yazılır.");
  }
  const existing = await findAccountByPhoneRole(input.phone, input.role);
  if (existing) {
    const [row] = await getDb()
      .update(appAccount)
      .set({
        name: input.displayName,
        updatedAt: new Date(),
      })
      .where(eq(appAccount.id, existing.id))
      .returning();
    return row ?? existing;
  }
  return createAccount({
    phone: input.phone,
    role: input.role,
    name: input.displayName,
  });
}
