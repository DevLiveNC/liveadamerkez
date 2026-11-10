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
    const processed = await processDeletionRequest(request!.id, phone);
    expect(processed?.status).toBe("processed");
    const pool = getPool();
    const row = await pool.query("SELECT name, phone FROM waitlist_entry WHERE id = $1", [
      entry!.id,
    ]);
    expect(row.rows[0].name).toBe("silindi");
    expect(row.rows[0].phone).toBe(`deleted:${entry!.id}`);
    expect(row.rowCount).toBe(1);
    const otpRows = await pool.query("SELECT id FROM otp_challenge WHERE phone = $1", [phone]);
    expect(otpRows.rowCount).toBe(0);
    expect(randomUUID()).toBeTruthy();
  });

  it("rejects confirm when OTP phone does not match the deletion request", async () => {
    const victimPhone = `+90532${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const attackerPhone = `+90533${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const consent = await recordConsent({
      purpose: "waitlist_contact",
      granted: true,
      subjectType: "waitlist",
    });
    const entry = await createWaitlistEntry({
      role: "customer",
      name: "Kurban",
      phone: victimPhone,
      city: "Girne",
      consentId: consent!.id,
    });
    const victimRequest = await createDeletionRequest({ phone: victimPhone });
    await createDeletionRequest({ phone: attackerPhone });
    const otp = await requestOtp(attackerPhone, "deletion");
    expect(otp.ok).toBe(true);
    const verified = await verifyOtp(attackerPhone, "deletion", otp.otpCode!);
    expect(verified.ok).toBe(true);

    const denied = await processDeletionRequest(victimRequest!.id, attackerPhone);
    expect(denied).toBeNull();

    const pool = getPool();
    const requestRow = await pool.query("SELECT status, phone FROM deletion_request WHERE id = $1", [
      victimRequest!.id,
    ]);
    expect(requestRow.rows[0].status).toBe("received");
    expect(requestRow.rows[0].phone).toBe(victimPhone);
    const waitlist = await pool.query("SELECT name, phone FROM waitlist_entry WHERE id = $1", [
      entry!.id,
    ]);
    expect(waitlist.rows[0].name).toBe("Kurban");
    expect(waitlist.rows[0].phone).toBe(victimPhone);
  });
});
