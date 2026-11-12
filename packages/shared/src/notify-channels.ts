export type NotificationDraft = {
  accountId: string;
  type: string;
  title: string;
  body: string;
  bookingId?: string | null;
  payload?: Record<string, unknown> | null;
};

export type ChannelSendResult = {
  ok: true;
  delivered: boolean;
  skipped: boolean;
  channel: "whatsapp" | "in_app";
};

export function isWhatsAppNotifyEnabled(value = process.env.WHATSAPP_NOTIFY): boolean {
  return value?.trim() === "true";
}

/** WhatsApp gönderimi yok. Env açık olsa da HTTP çağrısı yapılmaz. */
export async function sendWhatsAppNotification(
  _draft: NotificationDraft,
  enabled = isWhatsAppNotifyEnabled(),
): Promise<ChannelSendResult> {
  void _draft;
  if (!enabled) {
    return { ok: true, delivered: false, skipped: true, channel: "whatsapp" };
  }
  return { ok: true, delivered: false, skipped: true, channel: "whatsapp" };
}
