import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "./migrate.js";
import { closePool, getPool, isDatabaseConfigured } from "./client.js";
import { TenantAccessError } from "@ada-merkez/shared";
import { getBookingForTenant } from "./bookings.js";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("tenant isolation at API and DB layers", () => {
  beforeAll(async () => {
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("getBookingForTenant hides another tenant's booking", async () => {
    const pool = getPool();
    const tenantA = randomUUID();
    const tenantB = randomUUID();
    const staffA = randomUUID();
    const bookingA = randomUUID();
    await pool.query(
      `INSERT INTO business (id, name, slug) VALUES ($1, 'A', $2), ($3, 'B', $4)`,
      [tenantA, `a-${tenantA.slice(0, 8)}`, tenantB, `b-${tenantB.slice(0, 8)}`],
    );
    await pool.query(`INSERT INTO staff (id, tenant_id, name) VALUES ($1, $2, 'A')`, [
      staffA,
      tenantA,
    ]);
    await pool.query(
      `INSERT INTO booking (id, tenant_id, kind, staff_id, status, starts_at, ends_at)
       VALUES ($1, $2, 'slot', $3, 'confirmed', '2026-09-01T10:00:00Z', '2026-09-01T11:00:00Z')`,
      [bookingA, tenantA, staffA],
    );

    await expect(getBookingForTenant(tenantA, bookingA)).resolves.toMatchObject({
      id: bookingA,
      tenantId: tenantA,
    });
    await expect(getBookingForTenant(tenantB, bookingA)).rejects.toBeInstanceOf(
      TenantAccessError,
    );
  });

  it("RLS session variable hides other tenant rows for ada_app role when present", async () => {
    const pool = getPool();
    const role = await pool.query(`SELECT 1 FROM pg_roles WHERE rolname = 'ada_app'`);
    if (!role.rowCount) {
      expect(role.rowCount).toBe(0);
      return;
    }

    const tenantA = randomUUID();
    const tenantB = randomUUID();
    const staffA = randomUUID();
    const staffB = randomUUID();
    await pool.query(
      `INSERT INTO business (id, name, slug) VALUES ($1, 'RA', $2), ($3, 'RB', $4)`,
      [tenantA, `ra-${tenantA.slice(0, 8)}`, tenantB, `rb-${tenantB.slice(0, 8)}`],
    );
    await pool.query(
      `INSERT INTO staff (id, tenant_id, name) VALUES ($1, $2, 'SA'), ($3, $4, 'SB')`,
      [staffA, tenantA, staffB, tenantB],
    );

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL ROLE ada_app");
      await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantA]);
      const seen = await client.query("SELECT tenant_id FROM staff ORDER BY name");
      const ids = seen.rows.map((r: { tenant_id: string }) => r.tenant_id);
      expect(ids).toContain(tenantA);
      expect(ids).not.toContain(tenantB);
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
