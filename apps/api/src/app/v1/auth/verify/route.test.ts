import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closePool, isDatabaseConfigured, migrate, requestOtp } from "@ada-merkez/db";
import { hashClientIp, verifySession } from "@ada-merkez/shared/node";
import { POST } from "./route";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("auth verify issues session", () => {
  const prevSecret = process.env.AUTH_SECRET;
  const prevPepper = process.env.OTP_PEPPER;

  beforeAll(async () => {
    process.env.AUTH_SECRET = "test-auth-secret";
    process.env.OTP_PEPPER = "test-otp-pepper";
    await migrate();
  });

  afterAll(async () => {
    process.env.AUTH_SECRET = prevSecret;
    process.env.OTP_PEPPER = prevPepper;
    await closePool();
  });

  it("registers a customer and rejects admin register", async () => {
    const phone = `+90535${randomUUID().replace(/\D/g, "").slice(0, 7).padEnd(7, "1")}`;
    const sent = await requestOtp(phone, "login", Date.now(), hashClientIp("127.0.0.1"));
    expect(sent.ok).toBe(true);
    const created = await POST(
      new Request("http://api.test/v1/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone,
          code: sent.otpCode,
          role: "customer",
          mode: "register",
          name: "Deneme",
        }),
      }),
    );
    expect(created.status).toBe(200);
    const body = (await created.json()) as { token?: string; user?: { role?: string } };
    expect(body.user?.role).toBe("customer");
    const claims = verifySession(body.token ?? "", "test-auth-secret");
    expect(claims?.role).toBe("customer");
    expect(claims?.sub).toBeTruthy();

    const adminPhone = `+90536${randomUUID().replace(/\D/g, "").slice(0, 7).padEnd(7, "2")}`;
    const adminOtp = await requestOtp(adminPhone, "login", Date.now(), hashClientIp("127.0.0.2"));
    const admin = await POST(
      new Request("http://api.test/v1/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: adminPhone,
          code: adminOtp.otpCode,
          role: "admin",
          mode: "register",
        }),
      }),
    );
    expect(admin.status).toBe(403);
    expect((await admin.json()) as { code?: string }).toMatchObject({ code: "ADMIN_REGISTER_DISABLED" });
  });

  it("does not log in without an account", async () => {
    const phone = `+90537${randomUUID().replace(/\D/g, "").slice(0, 7).padEnd(7, "3")}`;
    const sent = await requestOtp(phone, "login", Date.now(), hashClientIp("127.0.0.3"));
    const res = await POST(
      new Request("http://api.test/v1/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone,
          code: sent.otpCode,
          role: "customer",
          mode: "login",
        }),
      }),
    );
    expect(res.status).toBe(401);
    expect((await res.json()) as { code?: string }).toMatchObject({ code: "ACCOUNT_NOT_FOUND" });
  });
});
