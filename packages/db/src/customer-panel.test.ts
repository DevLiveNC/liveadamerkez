import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "./migrate.js";
import { closePool, getPool, isDatabaseConfigured } from "./client.js";
import { TenantAccessError, createBooking } from "./bookings.js";
import {
  cancelBookingForAccount,
  getBookingForAccount,
  listBookingsForAccount,
} from "./customer-bookings.js";
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
       VALUES ($1, 'Örnek IDOR', $2, 'published', true)`,
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
    expect((await listFavoritesForAccount(accountB)).map((row) => row.businessId)).not.toContain(
      tenantId,
    );
    await expect(removeFavorite(accountB, tenantId)).rejects.toBeInstanceOf(FavoriteDeniedError);
    expect(await isFavorite(accountA, tenantId)).toBe(true);

    const cancelled = await cancelBookingForAccount(accountA, bookingA!.id);
    expect(cancelled?.status).toBe("cancelled");
  });
});
