import { describe, expect, it } from "vitest";
import { isWhatsAppNotifyEnabled, sendWhatsAppNotification } from "./notify-channels.js";

describe("WhatsApp notify stub", () => {
  const draft = {
    accountId: "00000000-0000-4000-8000-000000000001",
    type: "booking_confirmed",
    title: "Randevun onaylandı",
    body: "İşletme talebini onayladı.",
  };

  it("env kapalıyken atlar ve göndermez", async () => {
    expect(isWhatsAppNotifyEnabled("")).toBe(false);
    expect(isWhatsAppNotifyEnabled("false")).toBe(false);
    const result = await sendWhatsAppNotification(draft, false);
    expect(result).toEqual({
      ok: true,
      delivered: false,
      skipped: true,
      channel: "whatsapp",
    });
  });

  it("env açık olsa da gerçek mesaj göndermez", async () => {
    expect(isWhatsAppNotifyEnabled("true")).toBe(true);
    const result = await sendWhatsAppNotification(draft, true);
    expect(result.delivered).toBe(false);
    expect(result.skipped).toBe(true);
  });
});
