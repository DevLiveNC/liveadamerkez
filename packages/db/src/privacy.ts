import {
  CONSENT_TEXT_VERSION,
  RETENTION_DAYS,
} from "@ada-merkez/shared";
import { getDb } from "./client.js";
import { consent, deletionRequest, waitlistEntry } from "./schema.js";

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
  phone: string;
  city?: string | null;
  consentId: string;
}) {
  const [row] = await getDb()
    .insert(waitlistEntry)
    .values({
      role: input.role,
      name: input.name,
      phone: input.phone,
      city: input.city ?? null,
      consentId: input.consentId,
    })
    .returning();
  return row;
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

export { RETENTION_DAYS, CONSENT_TEXT_VERSION };
