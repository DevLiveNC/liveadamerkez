import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { closePool, getPool, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";
import { createAccount } from "./accounts.js";
import { ForbiddenRoleError, upsertSeedUser } from "./isletme.js";
import {
  ADMIN_BOOKING_LIST_LIMIT,
  adminBookingRangeError,
  listAdminBookings,
  listAdminUsers,
  withAdminDb,
} from "./yonetim.js";

const hasDb = isDatabaseConfigured();

describe("admin booking range", () => {
  it("from < to ister; 31 günden uzun aralığı reddeder", () => {
    expect(adminBookingRangeError(new Date("2026-01-08T00:00:00Z"), new Date("2026-01-01T00:00:00Z"))).toBe(
      "invalid_range",
    );
    expect(adminBookingRangeError(new Date("2026-01-01T00:00:00Z"), new Date("2026-02-15T00:00:00Z"))).toBe(
      "range_too_large",
    );
    expect(adminBookingRangeError(new Date("2026-01-01T00:00:00Z"), new Date("2026-01-08T00:00:00Z"))).toBeNull();
    expect(adminBookingRangeError(new Date("2026-01-01T00:00:00Z"))).toBeNull();
  });
});

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
    const listed = await listAdminBookings();
    const hit = listed.bookings.find((row) => row.tenantId === tenantId);
    expect(hit).toBeTruthy();
    expect(hit && "customerPhone" in hit).toBe(false);
    expect(JSON.stringify(listed)).not.toContain(phone);
    expect(listed.counted.total).toBeGreaterThanOrEqual(1);
  });

  it("listAdminUsers ada_app + app.is_admin yolundan okur", async () => {
    process.env.ALLOW_ADMIN_SEED = "true";
    const phone = `+90553${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const admin = await upsertSeedUser({ phone, role: "admin", displayName: "Yönetici" });
    const users = await listAdminUsers();
    const row = users.find((item) => item.id === admin.id);
    expect(row?.role).toBe("admin");
    expect(row?.phone).not.toBe(phone);
    expect(row?.phone).toContain("•••");
    expect(JSON.stringify(users)).not.toContain(phone);
  });

  it("listAdminBookings 200 üstünü kesmez: total ve truncated döner", async () => {
    const tenantId = randomUUID();
    const offsetMs = Number.parseInt(tenantId.replace(/-/g, "").slice(0, 8), 16) * 1000;
    const from = new Date(Date.UTC(2040, 0, 1) + offsetMs);
    const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
    await getPool().query(
      `INSERT INTO business (id, name, slug, status) VALUES ($1, $2, $3, 'approved')`,
      [tenantId, "Sayım işletme", `sayim-${tenantId.slice(0, 8)}`],
    );
    const staff = await getPool().query<{ id: string }>(
      `INSERT INTO staff (tenant_id, name) VALUES ($1, 'Örnek personel') RETURNING id`,
      [tenantId],
    );
    await getPool().query(
      `INSERT INTO booking (tenant_id, kind, status, staff_id, starts_at, ends_at, channel, customer_name)
       SELECT $1, 'slot', 'pending', $2,
         $3::timestamptz + (g * interval '31 minutes'),
         $3::timestamptz + (g * interval '31 minutes') + interval '30 minutes',
         'app', 'Örnek'
       FROM generate_series(0, $4) AS g`,
      [tenantId, staff.rows[0]?.id, from, ADMIN_BOOKING_LIST_LIMIT],
    );
    const listed = await listAdminBookings({ from, to });
    expect(listed.bookings).toHaveLength(ADMIN_BOOKING_LIST_LIMIT);
    expect(listed.truncated).toBe(true);
    expect(listed.total).toBeGreaterThanOrEqual(ADMIN_BOOKING_LIST_LIMIT + 1);
    expect(listed.counted.total).toBeGreaterThanOrEqual(ADMIN_BOOKING_LIST_LIMIT + 1);
    expect(listed.bookings.some((row) => row.tenantId === tenantId)).toBe(true);
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
