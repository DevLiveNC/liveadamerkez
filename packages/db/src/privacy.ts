import { and, eq, or } from "drizzle-orm";
import {
  CONSENT_TEXT_VERSION,
  RETENTION_DAYS,
  toE164,
} from "@ada-merkez/shared";
import { getDb } from "./client.js";
import {
  booking,
  businessApplication,
  consent,
  customer,
  deletionRequest,
  otpChallenge,
  waitlistEntry,
} from "./schema.js";

export function retainUntil(days: number, from = new Date()): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function recordConsent(input: {
  purpose: string;
  granted: boolean;
  subjectType: string;
  subjectId?: string | null;
  tenantId?: string | null;
  channel?: string;
  retentionDays?: number;
}) {
  const retentionDays = input.retentionDays ?? RETENTION_DAYS.waitlist;
  const [row] = await getDb()
    .insert(consent)
    .values({
      purpose: input.purpose,
      granted: input.granted,
      subjectType: input.subjectType,
      subjectId: input.subjectId ?? null,
      tenantId: input.tenantId ?? null,
      channel: input.channel ?? "web",
      textVersion: CONSENT_TEXT_VERSION,
      retentionDays,
      retainUntil: retainUntil(retentionDays),
    })
    .returning();
  return row;
}

export async function createWaitlistEntry(input: {
  role: "customer" | "business";
  name: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  segment?: string | null;
  consentId: string;
}) {
  const { upsertWaitlistEntry } = await import("./marketing.js");
  const result = await upsertWaitlistEntry(input);
  return result.row;
}

export async function createDeletionRequest(input: {
  phone?: string | null;
  email?: string | null;
  details?: string | null;
}) {
  const [row] = await getDb()
    .insert(deletionRequest)
    .values({
      phone: input.phone ?? null,
      email: input.email ?? null,
      details: input.details ?? null,
      status: "received",
    })
    .returning();
  return row;
}

const ANON_NAME = "silindi";

export async function anonymizePersonalData(input: {
  phone?: string | null;
  email?: string | null;
}) {
  const db = getDb();
  const phone = input.phone ?? null;
  const email = input.email ?? null;
  if (!phone && !email) return { waitlist: 0, customers: 0, bookings: 0, otp: 0 };

  const waitlistClauses = [];
  if (phone) waitlistClauses.push(eq(waitlistEntry.phone, phone));
  if (email) waitlistClauses.push(eq(waitlistEntry.email, email));
  const waitlistRows = waitlistClauses.length
    ? await db.select().from(waitlistEntry).where(or(...waitlistClauses))
    : [];

  let waitlistCount = 0;
  for (const row of waitlistRows) {
    await db
      .update(waitlistEntry)
      .set({
        name: ANON_NAME,
        phone: `deleted:${row.id}`,
        email: null,
      })
      .where(eq(waitlistEntry.id, row.id));
    waitlistCount += 1;
  }

  const applyClauses = [];
  if (phone) applyClauses.push(eq(businessApplication.phone, phone));
  if (email) applyClauses.push(eq(businessApplication.email, email));
  if (applyClauses.length) {
    const apps = await db.select().from(businessApplication).where(or(...applyClauses));
    for (const row of apps) {
      await db
        .update(businessApplication)
        .set({
          contactName: ANON_NAME,
          phone: `deleted:${row.id}`,
          email: null,
          whatsapp: null,
          notes: null,
        })
        .where(eq(businessApplication.id, row.id));
    }
  }

  let customerCount = 0;
  if (phone) {
    const customers = await db.select().from(customer).where(eq(customer.phone, phone));
    for (const row of customers) {
      await db
        .update(customer)
        .set({
          name: ANON_NAME,
          phone: `deleted:${row.id}`,
        })
        .where(and(eq(customer.id, row.id), eq(customer.tenantId, row.tenantId)));
      customerCount += 1;
      await db
        .update(booking)
        .set({ notes: null })
        .where(eq(booking.customerId, row.id));
    }
  }

  let otpCount = 0;
  if (phone) {
    const deletedOtp = await db
      .delete(otpChallenge)
      .where(eq(otpChallenge.phone, phone))
      .returning({ id: otpChallenge.id });
    otpCount = deletedOtp.length;
  }

  return { waitlist: waitlistCount, customers: customerCount, bookings: customerCount, otp: otpCount };
}

export async function processDeletionRequest(id: string, verifiedPhone: string) {
  const db = getDb();
  const phone = toE164(verifiedPhone);
  if (!phone) return null;
  const [row] = await db.select().from(deletionRequest).where(eq(deletionRequest.id, id)).limit(1);
  if (!row) return null;
  const requestPhone = toE164(row.phone);
  if (!requestPhone || requestPhone !== phone) return null;
  await anonymizePersonalData({ phone: requestPhone, email: row.email });
  const [updated] = await db
    .update(deletionRequest)
    .set({
      status: "processed",
      processedAt: new Date(),
      phone: row.phone ? `deleted:${row.id}` : null,
      email: row.email ? `deleted:${row.id}` : null,
      details: null,
    })
    .where(eq(deletionRequest.id, id))
    .returning();
  return updated;
}

export { RETENTION_DAYS, CONSENT_TEXT_VERSION };
