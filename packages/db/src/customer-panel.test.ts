import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "./migrate.js";
import { closePool, getPool, isDatabaseConfigured, withCustomerDb } from "./client.js";
import { favorite } from "./schema.js";
import { TenantAccessError, createBooking } from "./bookings.js";
import {
  SlotUnavailableError,
  cancelBookingForAccount,
  createCustomerBooking,
  getBookingForAccount,
  listBookingsForAccount,
} from "./customer-bookings.js";
import { InvalidServiceError } from "./slots.js";
import {
  FavoriteDeniedError,
  addFavorite,
  isFavorite,
  listFavoritesForAccount,
  removeFavorite,
} from "./favorites.js";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("customer panel ownership", () => {
  beforeAll(async () => {
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("does not leak another account's bookings or favorites", async () => {
    const pool = getPool();
    const tenantId = randomUUID();
    const staffId = randomUUID();
    const accountA = randomUUID();
    const accountB = randomUUID();
    const phoneA = `+90551${accountA.replace(/-/g, "").slice(0, 7)}`;
    const phoneB = `+90552${accountB.replace(/-/g, "").slice(0, 7)}`;
    await pool.query(
      `INSERT INTO business (id, name, slug, status, sample)
       VALUES ($1, 'Örnek IDOR', $2, 'approved', true)`,
      [tenantId, `idor-${tenantId.slice(0, 8)}`],
    );
    await pool.query(`INSERT INTO staff (id, tenant_id, name) VALUES ($1, $2, 'Personel')`, [
      staffId,
      tenantId,
    ]);
    await pool.query(
      `INSERT INTO app_account (id, phone, name, role)
       VALUES ($1, $2, 'A', 'customer'), ($3, $4, 'B', 'customer')`,
      [accountA, phoneA, accountB, phoneB],
    );
    const bookingA = await createBooking({
      tenantId,
      kind: "slot",
      staffId,
      accountId: accountA,
      startsAt: new Date("2026-09-01T10:00:00.000Z"),
      endsAt: new Date("2026-09-01T11:00:00.000Z"),
      status: "pending",
    });
    expect(bookingA?.id).toBeTruthy();

    const listedA = await listBookingsForAccount(accountA);
    const listedB = await listBookingsForAccount(accountB);
    expect(listedA.map((row) => row.id)).toContain(bookingA!.id);
    expect(listedB.map((row) => row.id)).not.toContain(bookingA!.id);

    await expect(getBookingForAccount(accountA, bookingA!.id)).resolves.toMatchObject({
      id: bookingA!.id,
      accountId: accountA,
    });
    await expect(getBookingForAccount(accountB, bookingA!.id)).rejects.toBeInstanceOf(
      TenantAccessError,
    );
    await expect(cancelBookingForAccount(accountB, bookingA!.id)).rejects.toBeInstanceOf(
      TenantAccessError,
    );

    await addFavorite(accountA, tenantId);
    expect(await isFavorite(accountA, tenantId)).toBe(true);
    expect(await isFavorite(accountB, tenantId)).toBe(false);
    expect((await listFavoritesForAccount(accountA)).map((row) => row.businessId)).toContain(tenantId);
    expect((await listFavoritesForAccount(accountB)).map((row) => row.businessId)).not.toContain(
      tenantId,
    );
    const seenByA = await withCustomerDb(accountA, (db) =>
      db.select({ accountId: favorite.accountId, tenantId: favorite.tenantId }).from(favorite),
    );
    expect(seenByA.some((row) => row.accountId === accountA && row.tenantId === tenantId)).toBe(true);
    expect(seenByA.some((row) => row.accountId === accountB)).toBe(false);
    await expect(removeFavorite(accountB, tenantId)).rejects.toBeInstanceOf(FavoriteDeniedError);
    expect(await isFavorite(accountA, tenantId)).toBe(true);

    const cancelled = await cancelBookingForAccount(accountA, bookingA!.id);
    expect(cancelled?.status).toBe("cancelled");
  });

  it("rejects past slots and unknown service ids", async () => {
    const pool = getPool();
    const tenantId = randomUUID();
    const accountId = randomUUID();
    const phone = `+90553${accountId.replace(/-/g, "").slice(0, 7)}`;
    await pool.query(
      `INSERT INTO business (id, name, slug, status, sample)
       VALUES ($1, 'Örnek geçmiş', $2, 'approved', true)`,
      [tenantId, `past-${tenantId.slice(0, 8)}`],
    );
    await pool.query(`INSERT INTO app_account (id, phone, name, role) VALUES ($1, $2, 'A', 'customer')`, [
      accountId,
      phone,
    ]);
    await expect(
      createCustomerBooking({
        accountId,
        phone,
        name: "A",
        businessId: tenantId,
        startsAt: new Date("2020-01-01T10:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(SlotUnavailableError);
    await expect(
      createCustomerBooking({
        accountId,
        phone,
        name: "A",
        businessId: tenantId,
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        serviceId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(InvalidServiceError);
  });

  it("favorite RLS hides another account for ada_app", async () => {
    const pool = getPool();
    const role = await pool.query(`SELECT 1 FROM pg_roles WHERE rolname = 'ada_app'`);
    if (!role.rowCount) {
      expect(role.rowCount).toBe(0);
      return;
    }
    const tenantId = randomUUID();
    const accountA = randomUUID();
    const accountB = randomUUID();
    const phoneA = `+90554${accountA.replace(/-/g, "").slice(0, 7)}`;
    const phoneB = `+90555${accountB.replace(/-/g, "").slice(0, 7)}`;
    await pool.query(
      `INSERT INTO business (id, name, slug, status, sample)
       VALUES ($1, 'Örnek RLS', $2, 'approved', true)`,
      [tenantId, `rls-${tenantId.slice(0, 8)}`],
    );
    await pool.query(
      `INSERT INTO app_account (id, phone, name, role)
       VALUES ($1, $2, 'A', 'customer'), ($3, $4, 'B', 'customer')`,
      [accountA, phoneA, accountB, phoneB],
    );
    await addFavorite(accountA, tenantId);
    await addFavorite(accountB, tenantId);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL ROLE ada_app");
      await client.query("SELECT set_config('app.account_id', $1, true)", [accountA]);
      const seen = await client.query("SELECT account_id FROM favorite");
      const ids = seen.rows.map((row: { account_id: string }) => row.account_id);
      expect(ids).toContain(accountA);
      expect(ids).not.toContain(accountB);
      await client.query("COMMIT");
    } finally {
      try {
        await client.query("ROLLBACK");
      } catch {
        /* ignore */
      }
      client.release();
    }
  });
});
