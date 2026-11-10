import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closePool, getPool, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";
import {
  createDeletionRequest,
  createWaitlistEntry,
  processDeletionRequest,
  recordConsent,
} from "./privacy.js";
import { requestOtp, verifyOtp } from "./otp.js";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("deletion anonymizes personal fields", () => {
  beforeAll(async () => {
    process.env.OTP_PEPPER = "test-otp-pepper";
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("keeps the row after verified anonymize", async () => {
    const phone = `+90532${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const consent = await recordConsent({
      purpose: "waitlist_contact",
      granted: true,
      subjectType: "waitlist",
    });
    const entry = await createWaitlistEntry({
      role: "customer",
      name: "Silinecek Kişi",
      phone,
      city: "Lefkoşa",
      consentId: consent!.id,
    });
    const request = await createDeletionRequest({ phone });
    const otp = await requestOtp(phone, "deletion");
    expect(otp.ok).toBe(true);
    const verified = await verifyOtp(phone, "deletion", otp.otpCode!);
    expect(verified.ok).toBe(true);
    const processed = await processDeletionRequest(request!.id);
    expect(processed?.status).toBe("processed");
    const pool = getPool();
    const row = await pool.query("SELECT name, phone FROM waitlist_entry WHERE id = $1", [
      entry!.id,
    ]);
    expect(row.rows[0].name).toBe("silindi");
    expect(row.rows[0].phone).toBe(`deleted:${entry!.id}`);
    expect(row.rowCount).toBe(1);
    expect(randomUUID()).toBeTruthy();
  });
});
