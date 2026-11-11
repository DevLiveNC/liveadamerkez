import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { closePool, getPool, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";
import { createAccount } from "./accounts.js";
import { ForbiddenRoleError, upsertSeedUser } from "./isletme.js";
import { listAdminBookings, listAdminUsers, withAdminDb } from "./yonetim.js";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("yonetim seed, roller ve KVKK", () => {
  beforeAll(async () => {
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("createAccount customer yazar; admin yalnızca ALLOW_ADMIN_SEED", async () => {
    const phone = `+90552${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const user = await createAccount({ phone, role: "customer", name: "Deneme" });
    expect(user.role).toBe("customer");

    process.env.ALLOW_ADMIN_SEED = "false";
    await expect(
      upsertSeedUser({ phone, role: "admin", displayName: "Yönetici" }),
    ).rejects.toBeInstanceOf(ForbiddenRoleError);

    process.env.ALLOW_ADMIN_SEED = "true";
    const admin = await upsertSeedUser({ phone, role: "admin", displayName: "Yönetici" });
    expect(admin.role).toBe("admin");
  });

  it("listAdminBookings müşteri telefonu döndürmez", async () => {
    const tenantId = randomUUID();
    const phone = "+905551112233";
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
       VALUES ($1, 'slot', 'pending', $2, $3, $4, 'app', 'Örnek müşteri', $5)`,
      [tenantId, staff.rows[0]?.id, start, end, phone],
    );
    const rows = await listAdminBookings();
    const hit = rows.find((row) => row.tenantId === tenantId);
    expect(hit).toBeTruthy();
    expect(hit && "customerPhone" in hit).toBe(false);
    expect(JSON.stringify(rows)).not.toContain(phone);
  });

  it("listAdminUsers ada_app + app.is_admin yolundan okur", async () => {
    process.env.ALLOW_ADMIN_SEED = "true";
    const phone = `+90553${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const admin = await upsertSeedUser({ phone, role: "admin", displayName: "Yönetici" });
    const users = await listAdminUsers();
    expect(users.some((row) => row.id === admin.id && row.role === "admin")).toBe(true);
  });

  it("sertleştirme migrasyonu 0007 journal kimliği taşır", () => {
    const drizzleDir = fileURLToPath(new URL("../drizzle/", import.meta.url));
    expect(existsSync(`${drizzleDir}0007_sertlestirme.sql`)).toBe(true);
    expect(existsSync(`${drizzleDir}0006_sertlestirme.sql`)).toBe(false);
  });

  it("withAdminDb SET LOCAL ROLE hatasını yutmaz; callback çalışmaz", async () => {
    const pool = getPool();
    const connect = pool.connect.bind(pool);
    const spy = vi.spyOn(pool, "connect").mockImplementation(async () => {
      const client = await connect();
      const query = client.query.bind(client);
      const wrapped = ((...args: Parameters<typeof client.query>) => {
        const text =
          typeof args[0] === "string"
            ? args[0]
            : String((args[0] as { text?: string }).text ?? args[0]);
        if (text.includes("SET LOCAL ROLE ada_app")) {
          return Promise.reject(Object.assign(new Error("rol yok"), { code: "42704" }));
        }
        return query(...args);
      }) as typeof client.query;
      client.query = wrapped;
      return client;
    });
    let ran = false;
    try {
      await expect(
        withAdminDb(async () => {
          ran = true;
          return 1;
        }),
      ).rejects.toMatchObject({ code: "42704" });
      expect(ran).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });
});
