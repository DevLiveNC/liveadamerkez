import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  closePool,
  createDeletionRequest,
  createWaitlistEntry,
  isDatabaseConfigured,
  migrate,
  recordConsent,
  requestOtp,
} from "@ada-merkez/db";
import { POST } from "./route";

const hasDb = isDatabaseConfigured();

function phone(): string {
  return `+9053${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(7, "0")}`;
}

describe.skipIf(!hasDb)("deletion confirm IDOR", () => {
  beforeAll(async () => {
    process.env.OTP_PEPPER = process.env.OTP_PEPPER ?? "test-otp-pepper";
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("returns generic 404 when OTP phone does not own the request", async () => {
    const victimPhone = phone();
    const attackerPhone = phone();
    const consent = await recordConsent({
      purpose: "waitlist_contact",
      granted: true,
      subjectType: "waitlist",
    });
    await createWaitlistEntry({
      role: "customer",
      name: "Kurban",
      phone: victimPhone,
      consentId: consent!.id,
    });
    const victimRequest = await createDeletionRequest({ phone: victimPhone });
    const otp = await requestOtp(attackerPhone, "deletion");
    expect(otp.ok).toBe(true);

    const response = await POST(
      new Request("http://api.test/v1/privacy/deletion-requests/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: victimRequest!.id,
          phone: attackerPhone,
          code: otp.otpCode,
        }),
      }),
    );
    expect(response.status).toBe(404);
    const body = (await response.json()) as { ok?: boolean; code?: string; id?: string };
    expect(body.ok).toBe(false);
    expect(body.code).toBe("NOT_FOUND");
    expect(body).not.toHaveProperty("id");
    expect(randomUUID()).toBeTruthy();
  });
});
