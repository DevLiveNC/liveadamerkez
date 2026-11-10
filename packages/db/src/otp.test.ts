import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OTP_POLICY } from "@ada-merkez/shared";
import { hashClientIp } from "@ada-merkez/shared/node";
import { closePool, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";
import { requestOtp, verifyOtp } from "./otp.js";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("OTP hashed verify", () => {
  beforeAll(async () => {
    process.env.OTP_PEPPER = "test-otp-pepper";
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("stores a hash and verifies the issued code", async () => {
    const phone = `+90533${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const sent = await requestOtp(phone, "login", Date.now(), hashClientIp("127.0.0.1"));
    expect(sent.ok).toBe(true);
    expect(sent.otpCode).toMatch(/^\d{6}$/);
    const wrong = await verifyOtp(phone, "login", "000000");
    expect(wrong.ok).toBe(false);
    const ok = await verifyOtp(phone, "login", sent.otpCode!);
    expect(ok.ok).toBe(true);
    const reuse = await verifyOtp(phone, "login", sent.otpCode!);
    expect(reuse.ok).toBe(false);
  });

  it("rate-limits by IP across phones", async () => {
    const ip = hashClientIp(`203.0.113.${Math.floor(Math.random() * 200)}`);
    const now = Date.now();
    let last: Awaited<ReturnType<typeof requestOtp>> | null = null;
    for (let i = 0; i < OTP_POLICY.maxSendsPerIpWindow; i += 1) {
      last = await requestOtp(`+90534${String(i).padStart(7, "0")}`, "login", now, ip);
      expect(last.ok).toBe(true);
    }
    const blocked = await requestOtp("+905349999999", "login", now + 10, ip);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.code).toBe("RATE_LIMITED");
  });
});
