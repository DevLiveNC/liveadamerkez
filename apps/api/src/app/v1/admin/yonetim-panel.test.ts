import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signSession } from "@ada-merkez/shared/node";
import { closePool, createAccount, getPool, isDatabaseConfigured, migrate, upsertSeedUser } from "@ada-merkez/db";
import { GET as businessesGet } from "./businesses/route";
import { PATCH as businessPatch } from "./businesses/[id]/route";
import { GET as usersGet } from "./users/route";
import { GET as reportsGet } from "./reports/route";
import { GET as healthGet } from "./health/route";
import { GET as meGet } from "./me/route";
import { GET as bookingsGet } from "./bookings/route";
import { POST as categoryPost } from "./categories/route";
import { POST as authVerify } from "../auth/verify/route";

const hasDb = isDatabaseConfigured();
const SECRET = process.env.AUTH_SECRET || "e2e-auth-secret";

function auth(userId: string, role: "admin" | "business" | "customer", tenantId = "") {
  const token = signSession({ tenantId, role, sub: userId }, { secret: SECRET, ttlMs: 60_000 });
  return { Authorization: `Bearer ${token}` };
}

describe.skipIf(!hasDb)("yönetici paneli yetki", () => {
  beforeAll(async () => {
    process.env.AUTH_SECRET = SECRET;
    process.env.OTP_PEPPER = process.env.OTP_PEPPER || "e2e-otp-pepper";
    process.env.OTP_RETURN_CODE = "true";
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("müşteri admin uçlarına giremez; yönetici onaylar ve rezervasyon telefonu sızmaz", async () => {
    process.env.ALLOW_ADMIN_SEED = "true";
    const adminPhone = `+90555${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const customerPhone = `+90554${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const admin = await upsertSeedUser({
      phone: adminPhone,
      role: "admin",
      displayName: "Yönetici",
    });
    const customer = await createAccount({ phone: customerPhone, role: "customer", name: "Müşteri" });

    const forbidden = await businessesGet(
      new Request("http://api.test/v1/admin/businesses", {
        headers: auth(customer.id, "customer"),
      }),
    );
    expect(forbidden.status).toBe(403);
    expect(forbidden.headers.get("cache-control")).toBe("no-store");

    const stolenAdminJwt = await businessesGet(
      new Request("http://api.test/v1/admin/businesses", {
        headers: auth(customer.id, "admin"),
      }),
    );
    expect(stolenAdminJwt.status).toBe(403);

    const tenantId = randomUUID();
    await getPool().query(
      `INSERT INTO business (id, name, slug, status) VALUES ($1, $2, $3, 'pending')`,
      [tenantId, "Örnek işletme", `ornek-${tenantId.slice(0, 8)}`],
    );
    const staff = await getPool().query<{ id: string }>(
      `INSERT INTO staff (tenant_id, name) VALUES ($1, 'Örnek personel') RETURNING id`,
      [tenantId],
    );
    const start = new Date();
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    await getPool().query(
      `INSERT INTO booking (tenant_id, kind, status, staff_id, starts_at, ends_at, channel, customer_name, customer_phone)
       VALUES ($1, 'slot', 'pending', $2, $3, $4, 'app', 'Örnek müşteri', '+905551112233')`,
      [tenantId, staff.rows[0]?.id, start, end],
    );

    const listed = await businessesGet(
      new Request("http://api.test/v1/admin/businesses?status=pending", {
        headers: auth(admin.id, "admin"),
      }),
    );
    expect(listed.status).toBe(200);
    expect(listed.headers.get("cache-control")).toBe("no-store");
    const listedBody = (await listed.json()) as { businesses?: { id?: string; status?: string }[] };
    expect(listedBody.businesses?.some((row) => row.id === tenantId && row.status === "pending")).toBe(
      true,
    );

    const approved = await businessPatch(
      new Request(`http://api.test/v1/admin/businesses/${tenantId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", ...auth(admin.id, "admin") },
        body: JSON.stringify({ status: "approved" }),
      }),
      { params: Promise.resolve({ id: tenantId }) },
    );
    expect(approved.status).toBe(200);

    const bookings = await bookingsGet(
      new Request("http://api.test/v1/admin/bookings", { headers: auth(admin.id, "admin") }),
    );
    expect(bookings.status).toBe(200);
    const bookingBody = await bookings.text();
    expect(bookingBody).not.toContain("+905551112233");
    expect(bookingBody).not.toContain("customerPhone");

    const users = await usersGet(
      new Request("http://api.test/v1/admin/users", { headers: auth(admin.id, "admin") }),
    );
    expect(users.status).toBe(200);

    const reports = await reportsGet(
      new Request("http://api.test/v1/admin/reports", { headers: auth(admin.id, "admin") }),
    );
    expect(reports.status).toBe(200);
    const reportBody = (await reports.json()) as { reports?: { businessesApproved?: number } };
    expect((reportBody.reports?.businessesApproved ?? 0) >= 1).toBe(true);

    const health = await healthGet(
      new Request("http://api.test/v1/admin/health", { headers: auth(admin.id, "admin") }),
    );
    expect(health.status).toBe(200);
    const healthBody = (await health.json()) as { health?: { whatsapp?: string; queue?: string } };
    expect(healthBody.health?.whatsapp).toBe("not_connected");
    expect(healthBody.health?.queue).toBe("closed");

    const me = await meGet(
      new Request("http://api.test/v1/admin/me", { headers: auth(admin.id, "admin") }),
    );
    expect(me.status).toBe(200);

    const created = await categoryPost(
      new Request("http://api.test/v1/admin/categories", {
        method: "POST",
        headers: { "content-type": "application/json", ...auth(admin.id, "admin") },
        body: JSON.stringify({ name: `Örnek kategori ${tenantId.slice(0, 4)}`, kind: "service" }),
      }),
    );
    expect(created.status).toBe(201);
  });

  it("yönetici kaydı auth/verify ile açılamaz", async () => {
    const blocked = await authVerify(
      new Request("http://api.test/v1/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: "+905531112233",
          code: "000000",
          role: "admin",
          mode: "register",
          name: "Yetkili",
        }),
      }),
    );
    expect(blocked.status).toBe(403);
  });
});
