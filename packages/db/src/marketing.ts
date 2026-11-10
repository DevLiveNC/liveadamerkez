import { randomBytes } from "node:crypto";
import { and, eq, or, sql } from "drizzle-orm";
import {
  generateReferralCode,
  type AttributionState,
  type TouchPoint,
} from "@ada-merkez/shared";
import { getDb } from "./client.js";
import { businessApplication, referral, waitlistEntry } from "./schema.js";

function normalizePhone(input?: string | null): string | null {
  if (!input) return null;
  const digits = input.replace(/[^\d+]/g, "");
  return digits || null;
}

function normalizeEmail(input?: string | null): string | null {
  if (!input) return null;
  const value = input.trim().toLowerCase();
  return value || null;
}

async function uniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 8; i += 1) {
    const code = generateReferralCode(randomBytes(8));
    const [exists] = await getDb()
      .select({ id: referral.id })
      .from(referral)
      .where(eq(referral.code, code))
      .limit(1);
    if (!exists) return code;
  }
  return generateReferralCode(randomBytes(16));
}

async function ensureReferral(ownerKind: string, ownerId: string, existing?: string | null) {
  if (existing) return existing;
  const code = await uniqueReferralCode();
  await getDb().insert(referral).values({
    code,
    ownerKind,
    ownerId,
    hookStatus: "issued",
  });
  return code;
}

export type WaitlistInput = {
  role?: "customer" | "business";
  name: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  segment?: string | null;
  consentId: string;
  attribution?: AttributionState | null;
  eventId?: string | null;
};

export async function upsertWaitlistEntry(input: WaitlistInput) {
  const db = getDb();
  const phone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);
  if (!phone && !email) {
    throw new Error("CONTACT_REQUIRED");
  }

  const clauses = [];
  if (phone) clauses.push(eq(waitlistEntry.phone, phone));
  if (email) clauses.push(eq(waitlistEntry.email, email));
  const [existing] = await db
    .select()
    .from(waitlistEntry)
    .where(or(...clauses))
    .limit(1);

  const last = input.attribution?.last ?? null;
  const first = existing?.firstTouch ?? input.attribution?.first ?? last;
  const referredBy =
    (last as TouchPoint | null)?.ref ??
    (input.attribution?.first as TouchPoint | null)?.ref ??
    existing?.referredByCode ??
    null;

  if (existing) {
    const [row] = await db
      .update(waitlistEntry)
      .set({
        name: input.name,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        city: input.city ?? existing.city,
        segment: input.segment ?? existing.segment,
        lastTouch: last ?? existing.lastTouch,
        referredByCode: referredBy,
        eventId: input.eventId ?? existing.eventId,
        updatedAt: new Date(),
      })
      .where(eq(waitlistEntry.id, existing.id))
      .returning();
    if (referredBy && referredBy !== existing.referredByCode) {
      await incrementReferralSignup(referredBy);
    }
    return { row, created: false };
  }

  const [row] = await db
    .insert(waitlistEntry)
    .values({
      role: input.role ?? "customer",
      name: input.name,
      phone,
      email,
      city: input.city ?? null,
      segment: input.segment ?? null,
      consentId: input.consentId,
      firstTouch: first,
      lastTouch: last,
      referredByCode: referredBy,
      eventId: input.eventId ?? null,
    })
    .returning();
  if (!row) throw new Error("waitlist insert failed");
  const code = await ensureReferral("waitlist", row.id, null);
  const [withCode] = await db
    .update(waitlistEntry)
    .set({ referralCode: code, updatedAt: new Date() })
    .where(eq(waitlistEntry.id, row.id))
    .returning();
  if (referredBy) await incrementReferralSignup(referredBy);
  return { row: withCode ?? row, created: true };
}

export type BusinessApplicationInput = {
  businessName: string;
  sector: string;
  city?: string | null;
  inTurkey: boolean;
  contactName: string;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
  notes?: string | null;
  consentId: string;
  attribution?: AttributionState | null;
  eventId?: string | null;
};

export async function upsertBusinessApplication(input: BusinessApplicationInput) {
  const db = getDb();
  const phone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);
  if (!phone) throw new Error("CONTACT_REQUIRED");

  const clauses = [eq(businessApplication.phone, phone)];
  if (email) clauses.push(eq(businessApplication.email, email));
  const [existing] = await db
    .select()
    .from(businessApplication)
    .where(or(...clauses))
    .limit(1);

  const last = input.attribution?.last ?? null;
  const first = existing?.firstTouch ?? input.attribution?.first ?? last;
  const payload = {
    businessName: input.businessName,
    sector: input.sector,
    city: input.inTurkey ? null : input.city ?? null,
    inTurkey: input.inTurkey,
    includeInDiscovery: false,
    contactName: input.contactName,
    phone,
    email,
    whatsapp: input.whatsapp ?? null,
    notes: input.notes ?? null,
    lastTouch: last,
    eventId: input.eventId ?? null,
    updatedAt: new Date(),
  };

  if (existing) {
    const [row] = await db
      .update(businessApplication)
      .set(payload)
      .where(eq(businessApplication.id, existing.id))
      .returning();
    return { row, created: false };
  }

  const [row] = await db
    .insert(businessApplication)
    .values({
      ...payload,
      consentId: input.consentId,
      firstTouch: first,
      referredByCode: (last as TouchPoint | null)?.ref ?? null,
      status: "received",
    })
    .returning();
  if (!row) throw new Error("application insert failed");
  const code = await ensureReferral("business_application", row.id, null);
  const [withCode] = await db
    .update(businessApplication)
    .set({ referralCode: code })
    .where(eq(businessApplication.id, row.id))
    .returning();
  return { row: withCode ?? row, created: true };
}

export async function listWaitlistForExport() {
  return getDb().select().from(waitlistEntry);
}

export async function listBusinessApplicationsForExport(opts?: { inTurkey?: boolean }) {
  if (opts?.inTurkey === true) {
    return getDb()
      .select()
      .from(businessApplication)
      .where(eq(businessApplication.inTurkey, true));
  }
  if (opts?.inTurkey === false) {
    return getDb()
      .select()
      .from(businessApplication)
      .where(eq(businessApplication.inTurkey, false));
  }
  return getDb().select().from(businessApplication);
}

export async function incrementReferralClick(code: string) {
  const normalized = code.trim().toUpperCase();
  const [row] = await getDb()
    .update(referral)
    .set({
      clickCount: sql`${referral.clickCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(referral.code, normalized))
    .returning();
  return row ?? null;
}

export async function incrementReferralSignup(code: string) {
  const normalized = code.trim().toUpperCase();
  await getDb()
    .update(referral)
    .set({
      signupCount: sql`${referral.signupCount} + 1`,
      hookStatus: "signed_up",
      updatedAt: new Date(),
    })
    .where(eq(referral.code, normalized));
}

export async function markReferralFirstBooking(code: string, at = new Date()) {
  const normalized = code.trim().toUpperCase();
  await getDb()
    .update(referral)
    .set({
      firstBookingAt: at,
      hookStatus: "first_booking",
      updatedAt: at,
    })
    .where(and(eq(referral.code, normalized), sql`${referral.firstBookingAt} is null`));
}

export async function listReferralsForExport() {
  return getDb().select().from(referral);
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const value = row[col];
        const text =
          value === null || value === undefined
            ? ""
            : typeof value === "object"
              ? JSON.stringify(value)
              : String(value);
        return `"${text.replaceAll('"', '""')}"`;
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}
