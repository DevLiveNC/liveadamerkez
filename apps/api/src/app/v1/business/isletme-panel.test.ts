import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signSession } from "@ada-merkez/shared/node";
import {
  closePool,
  findOrCreateUser,
  isDatabaseConfigured,
  migrate,
  registerBusiness,
} from "@ada-merkez/db";
import { POST as registerPost } from "./register/route";
import { GET as servicesGet, POST as servicesPost } from "./services/route";
import { GET as statsGet } from "./stats/route";
import { GET as meGet } from "./me/route";
import { POST as otpRequest } from "../otp/request/route";
import { POST as authVerify } from "../auth/verify/route";

const hasDb = isDatabaseConfigured();
const SECRET = process.env.AUTH_SECRET || "e2e-auth-secret";

function auth(userId: string, tenantId: string, role: "business" | "admin" | "customer" = "business") {
  const token = signSession({ tenantId, role, sub: userId }, { secret: SECRET, ttlMs: 60_000 });
  return { Authorization: `Bearer ${token}` };
}

describe.skipIf(!hasDb)("işletme paneli yetki ve IDOR", () => {
  beforeAll(async () => {
    process.env.AUTH_SECRET = SECRET;
    process.env.OTP_PEPPER = process.env.OTP_PEPPER || "e2e-otp-pepper";
    process.env.OTP_RETURN_CODE = "true";
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("OTP doğrulama oturum üretir; müşteri işletme uçlarına giremez", async () => {
    const phone = `+90538${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const requested = await otpRequest(
      new Request("http://api.test/v1/otp/request", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": "203.0.113.10" },
        body: JSON.stringify({ phone }),
      }),
    );
    expect(requested.status).toBe(202);
    const sent = (await requested.json()) as { debugCode?: string };
    expect(sent.debugCode).toMatch(/^\d{6}$/);
    const verified = await authVerify(
      new Request("http://api.test/v1/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone,
          code: sent.debugCode,
          role: "customer",
          mode: "register",
          name: "Müşteri",
        }),
      }),
    );
    expect(verified.status).toBe(200);
    const body = (await verified.json()) as {
      token?: string;
      user?: { role?: string };
    };
    expect(body.token).toBeTruthy();
    expect(body.user?.role).toBe("customer");
    expect(verified.headers.get("cache-control")).toBe("no-store");

    const forbidden = await servicesGet(
      new Request("http://api.test/v1/business/services", {
        headers: { Authorization: `Bearer ${body.token}` },
      }),
    );
    expect(forbidden.status).toBe(403);
  });

  it("işletme yalnızca kendi hizmetini görür; admin kendini UI ile atayamaz", async () => {
    const phoneA = `+90539${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const phoneB = `+90530${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const userA = await findOrCreateUser({ phone: phoneA, displayName: "A" });
    const userB = await findOrCreateUser({ phone: phoneB, displayName: "B" });
    const a = await registerBusiness({
      userId: userA.id,
      name: `Panel A ${randomUUID().slice(0, 6)}`,
      sector: "kuafor",
      city: "lefkosa",
      inTurkey: false,
      contactName: "A",
      phone: phoneA,
    });
    const b = await registerBusiness({
      userId: userB.id,
      name: `Panel B ${randomUUID().slice(0, 6)}`,
      sector: "klinik",
      city: "girne",
      inTurkey: false,
      contactName: "B",
      phone: phoneB,
    });
    const tenantA = a?.membership?.tenantId ?? "";
    const tenantB = b?.membership?.tenantId ?? "";

    const created = await servicesPost(
      new Request("http://api.test/v1/business/services", {
        method: "POST",
        headers: { "content-type": "application/json", ...auth(userA.id, tenantA) },
        body: JSON.stringify({ name: "Kesim", durationMinutes: 30, priceLabel: "200 TL" }),
      }),
    );
    expect(created.status).toBe(201);

    const listB = await servicesGet(
      new Request("http://api.test/v1/business/services", {
        headers: auth(userB.id, tenantB),
      }),
    );
    expect(listB.status).toBe(200);
    const listBody = (await listB.json()) as { services?: { name?: string }[] };
    expect(listBody.services?.some((row) => row.name === "Kesim")).toBe(false);

    const stolenTenant = await servicesGet(
      new Request("http://api.test/v1/business/services", {
        headers: auth(userB.id, tenantA),
      }),
    );
    expect(stolenTenant.status).toBe(404);

    const adminAttempt = await registerPost(
      new Request("http://api.test/v1/business/register", {
        method: "POST",
        headers: { "content-type": "application/json", ...auth(userA.id, tenantA, "business") },
        body: JSON.stringify({
          name: "Hack",
          sector: "kuafor",
          city: "lefkosa",
          inTurkey: false,
          contactName: "Yetkili",
          phone: phoneA,
          role: "admin",
        }),
      }),
    );
    expect(adminAttempt.status).toBe(403);

    const stats = await statsGet(
      new Request("http://api.test/v1/business/stats", { headers: auth(userA.id, tenantA) }),
    );
    expect(stats.status).toBe(200);
    const statsBody = (await stats.json()) as { stats?: Record<string, number> };
    expect(statsBody.stats?.todayConfirmed).toBe(0);
    expect(statsBody.stats?.pendingIncoming).toBe(0);

    const me = await meGet(new Request("http://api.test/v1/business/me", { headers: auth(userA.id, tenantA) }));
    expect(me.status).toBe(200);
    const meBody = (await me.json()) as { me?: { user?: { role?: string } } };
    expect(meBody.me?.user?.role).toBe("business");
  });
});
