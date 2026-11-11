import { and, eq, gte, lt, ne } from "drizzle-orm";
import {
  nicosiaWallTimeToUtc,
  parseNicosiaDateKey,
  nicosiaWeekday,
} from "@ada-merkez/shared";
import { getDb } from "./client.js";
import { booking } from "./schema.js";
import { getPublishedBusiness, listPublicAvailability, listPublicServices } from "./catalog.js";

export class InvalidServiceError extends Error {
  readonly status = 400;
  readonly code = "INVALID_SERVICE";
  constructor(message = "Hizmet bulunamadı.") {
    super(message);
    this.name = "InvalidServiceError";
  }
}

export type OpenSlot = {
  startsAt: string;
  endsAt: string;
  staffId: string | null;
  serviceId: string | null;
  label: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function listOpenSlots(input: {
  businessId: string;
  date: string;
  serviceId?: string;
}): Promise<{ timezone: string; slots: OpenSlot[]; serviceName: string | null } | null> {
  const parsed = parseNicosiaDateKey(input.date);
  if (!parsed) return null;
  const biz = await getPublishedBusiness(input.businessId);
  if (!biz) return null;
  const timezone = biz.timezone || "Europe/Nicosia";
  const services = await listPublicServices(biz.id);
  const matched = input.serviceId ? services.find((item) => item.id === input.serviceId) : undefined;
  if (input.serviceId && !matched) throw new InvalidServiceError();
  const chosen = matched ?? services[0] ?? null;
  const duration = chosen?.durationMinutes ?? 60;
  const rules = await listPublicAvailability(biz.id);
  const noon = nicosiaWallTimeToUtc(parsed.year, parsed.month, parsed.day, 12, 0, 0, timezone);
  const weekday = nicosiaWeekday(noon, timezone);
  const dayRules = rules.filter((rule) => rule.weekday === null || rule.weekday === weekday);
  const dayStart = nicosiaWallTimeToUtc(parsed.year, parsed.month, parsed.day, 0, 0, 0, timezone);
  const dayEnd = nicosiaWallTimeToUtc(parsed.year, parsed.month, parsed.day + 1, 0, 0, 0, timezone);

  const taken = await getDb()
    .select({
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      staffId: booking.staffId,
    })
    .from(booking)
    .where(
      and(
        eq(booking.tenantId, biz.id),
        gte(booking.startsAt, dayStart),
        lt(booking.startsAt, dayEnd),
        ne(booking.status, "cancelled"),
      ),
    );

  const slots: OpenSlot[] = [];
  for (const rule of dayRules) {
    const staffId = chosen?.staffId ?? rule.staffId ?? null;
    for (let minute = rule.startsAtMinutes; minute + duration <= rule.endsAtMinutes; minute += duration) {
      const hour = Math.floor(minute / 60);
      const min = minute % 60;
      const startsAt = nicosiaWallTimeToUtc(parsed.year, parsed.month, parsed.day, hour, min, 0, timezone);
      const endsAt = new Date(startsAt.getTime() + duration * 60 * 1000);
      if (startsAt.getTime() <= Date.now()) continue;
      const overlap = taken.some((row) => {
        if (staffId && row.staffId && row.staffId !== staffId) return false;
        return row.startsAt < endsAt && row.endsAt > startsAt;
      });
      if (overlap) continue;
      slots.push({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        staffId,
        serviceId: chosen?.id ?? null,
        label: `${pad(hour)}:${pad(min)}`,
      });
    }
  }
  slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return { timezone, slots, serviceName: chosen?.name ?? null };
}

export async function slotStillOpen(input: {
  businessId: string;
  startsAt: Date;
  endsAt: Date;
  staffId?: string | null;
}): Promise<boolean> {
  if (!(input.endsAt > input.startsAt)) return false;
  if (input.startsAt.getTime() <= Date.now()) return false;
  const all = await getDb()
    .select({
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      staffId: booking.staffId,
    })
    .from(booking)
    .where(and(eq(booking.tenantId, input.businessId), ne(booking.status, "cancelled")));
  return !all.some((row) => {
    if (input.staffId && row.staffId && row.staffId !== input.staffId) return false;
    return row.startsAt < input.endsAt && row.endsAt > input.startsAt;
  });
}
