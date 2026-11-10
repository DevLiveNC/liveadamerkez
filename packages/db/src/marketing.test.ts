import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ATTRIBUTION_WINDOW_DAYS } from "@ada-merkez/shared";
import { closePool, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";
import { recordConsent } from "./privacy.js";
import {
  incrementReferralClick,
  listWaitlistForExport,
  upsertBusinessApplication,
  upsertWaitlistEntry,
} from "./marketing.js";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("waitlist UTM persistence and duplicate handling", () => {
  beforeAll(async () => {
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("stores first and last touch and updates last touch on duplicate contact", async () => {
    expect(ATTRIBUTION_WINDOW_DAYS).toBe(30);
    const consent = await recordConsent({
      purpose: "waitlist_contact",
      granted: true,
      subjectType: "waitlist",
    });
    const phone = `+90533${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const first = {
      source: "instagram",
      medium: "organic",
      campaign: "evre_a_teaser",
      content: "gun1_duyuru",
      term: null,
      ref: null,
      businessId: null,
      capturedAt: "2026-11-10T10:00:00.000Z",
    };
    const created = await upsertWaitlistEntry({
      name: "Deneme",
      phone,
      email: `deneme-${randomUUID().slice(0, 8)}@example.com`,
      city: "lefkosa",
      segment: "tr_ziyaretci",
      consentId: consent!.id,
      attribution: { first, last: first },
      eventId: randomUUID(),
    });
    expect(created.created).toBe(true);
    expect(created.row?.referralCode).toMatch(/^AM/);

    const last = { ...first, source: "google", campaign: "soft_launch" };
    const updated = await upsertWaitlistEntry({
      name: "Deneme",
      phone,
      city: "lefkosa",
      segment: "tr_ziyaretci",
      consentId: consent!.id,
      attribution: { first: last, last },
    });
    expect(updated.created).toBe(false);
    expect(updated.row?.id).toBe(created.row?.id);
    const storedFirst = updated.row?.firstTouch as { source?: string };
    const storedLast = updated.row?.lastTouch as { source?: string };
    expect(storedFirst.source).toBe("instagram");
    expect(storedLast.source).toBe("google");

    const exportRows = await listWaitlistForExport();
    expect(exportRows.some((row) => row.id === created.row?.id)).toBe(true);
  });

  it("flags Turkey business applications and keeps them out of discovery", async () => {
    const consent = await recordConsent({
      purpose: "business_apply",
      granted: true,
      subjectType: "business_application",
    });
    const phone = `+90532${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const result = await upsertBusinessApplication({
      businessName: "Başvuru deneme",
      sector: "kuafor",
      inTurkey: true,
      contactName: "Yetkili",
      phone,
      email: `biz-${randomUUID().slice(0, 8)}@example.com`,
      consentId: consent!.id,
    });
    expect(result.row?.inTurkey).toBe(true);
    expect(result.row?.includeInDiscovery).toBe(false);
  });

  it("counts referral clicks on the hook without a reward amount", async () => {
    const consent = await recordConsent({
      purpose: "waitlist_contact",
      granted: true,
      subjectType: "waitlist",
    });
    const created = await upsertWaitlistEntry({
      name: "Davet",
      email: `ref-${randomUUID().slice(0, 8)}@example.com`,
      consentId: consent!.id,
    });
    const code = created.row?.referralCode;
    expect(code).toBeTruthy();
    const after = await incrementReferralClick(code!);
    expect(after?.clickCount).toBe(1);
    expect(after).not.toHaveProperty("rewardAmount");
  });
});
