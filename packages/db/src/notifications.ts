import { desc, eq } from "drizzle-orm";
import { sendWhatsAppNotification, type NotificationDraft } from "@ada-merkez/shared";
import { getDb } from "./client.js";
import { appNotification, booking, business } from "./schema.js";

export type AppNotificationType = "booking_confirmed" | "slot_suggested";

export async function createInAppNotification(input: NotificationDraft) {
  const [row] = await getDb()
    .insert(appNotification)
    .values({
      accountId: input.accountId,
      type: input.type,
      title: input.title,
      body: input.body,
      bookingId: input.bookingId ?? null,
      payload: input.payload ?? null,
      channel: "in_app",
    })
    .returning();
  return row;
}

export async function listNotificationsForAccount(accountId: string, limit = 50) {
  return getDb()
    .select()
    .from(appNotification)
    .where(eq(appNotification.accountId, accountId))
    .orderBy(desc(appNotification.createdAt))
    .limit(limit);
}

export async function dispatchCustomerNotice(input: NotificationDraft) {
  const inApp = await createInAppNotification(input);
  const whatsapp = await sendWhatsAppNotification(input);
  return { inApp, whatsapp };
}

export async function notifyBookingAccount(input: {
  bookingId: string;
  type: AppNotificationType;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
}) {
  const [row] = await getDb()
    .select({
      id: booking.id,
      accountId: booking.accountId,
      businessName: business.name,
    })
    .from(booking)
    .innerJoin(business, eq(booking.tenantId, business.id))
    .where(eq(booking.id, input.bookingId))
    .limit(1);
  if (!row?.accountId) {
    return {
      inApp: null,
      whatsapp: { ok: true as const, delivered: false, skipped: true as const, channel: "whatsapp" as const },
    };
  }
  return dispatchCustomerNotice({
    accountId: row.accountId,
    type: input.type,
    title: input.title,
    body: `${row.businessName} ${input.body}`.trim(),
    bookingId: row.id,
    payload: { businessName: row.businessName, ...input.payload },
  });
}
