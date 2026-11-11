import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "./migrate.js";
import { closePool, getPool, isDatabaseConfigured } from "./client.js";
import {
  BookingConflictError,
  BookingStatusError,
  createBooking,
  listBookingsForTenant,
  updateBookingStatus,
} from "./bookings.js";

const hasDb = isDatabaseConfigured();

async function seedTenant(label: string) {
  const pool = getPool();
  const tenantId = randomUUID();
  const staffId = randomUUID();
  const resourceId = randomUUID();
  const slug = `test-${label}-${tenantId.slice(0, 8)}`;
  await pool.query(
    `INSERT INTO business (id, name, slug, status) VALUES ($1, $2, $3, 'draft')`,
    [tenantId, `İşletme ${label}`, slug],
  );
  await pool.query(
    `INSERT INTO staff (id, tenant_id, name) VALUES ($1, $2, $3)`,
    [staffId, tenantId, `Personel ${label}`],
  );
  await pool.query(
    `INSERT INTO resource (id, tenant_id, name, kind) VALUES ($1, $2, $3, 'table')`,
    [resourceId, tenantId, `Masa ${label}`],
  );
  return { tenantId, staffId, resourceId };
}

describe.skipIf(!hasDb)("DB-level double booking protection", () => {
  beforeAll(async () => {
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("rejects overlapping staff slots via exclusion constraint", async () => {
    const { tenantId, staffId } = await seedTenant("slot");
    const starts = new Date("2026-07-15T10:00:00.000Z");
    const ends = new Date("2026-07-15T11:00:00.000Z");
    await createBooking({
      tenantId,
      kind: "slot",
      staffId,
      startsAt: starts,
      endsAt: ends,
      status: "confirmed",
    });
    await expect(
      createBooking({
        tenantId,
        kind: "slot",
        staffId,
        startsAt: new Date("2026-07-15T10:30:00.000Z"),
        endsAt: new Date("2026-07-15T11:30:00.000Z"),
        status: "pending",
      }),
    ).rejects.toBeInstanceOf(BookingConflictError);
  });

  it("allows adjacent [) ranges and cancelled overlaps", async () => {
    const { tenantId, staffId } = await seedTenant("adjacent");
    await createBooking({
      tenantId,
      kind: "slot",
      staffId,
      startsAt: new Date("2026-07-15T10:00:00.000Z"),
      endsAt: new Date("2026-07-15T11:00:00.000Z"),
      status: "confirmed",
    });
    const adjacent = await createBooking({
      tenantId,
      kind: "slot",
      staffId,
      startsAt: new Date("2026-07-15T11:00:00.000Z"),
      endsAt: new Date("2026-07-15T12:00:00.000Z"),
      status: "confirmed",
    });
    expect(adjacent?.id).toBeTruthy();
    const cancelled = await createBooking({
      tenantId,
      kind: "slot",
      staffId,
      startsAt: new Date("2026-07-15T10:15:00.000Z"),
      endsAt: new Date("2026-07-15T10:45:00.000Z"),
      status: "cancelled",
    });
    expect(cancelled?.id).toBeTruthy();
  });

  it("rejects overlapping table resources independently of staff", async () => {
    const { tenantId, resourceId } = await seedTenant("table");
    await createBooking({
      tenantId,
      kind: "table",
      resourceId,
      startsAt: new Date("2026-07-15T18:00:00.000Z"),
      endsAt: new Date("2026-07-15T20:00:00.000Z"),
      status: "pending",
    });
    await expect(
      createBooking({
        tenantId,
        kind: "table",
        resourceId,
        startsAt: new Date("2026-07-15T19:00:00.000Z"),
        endsAt: new Date("2026-07-15T21:00:00.000Z"),
        status: "confirmed",
      }),
    ).rejects.toBeInstanceOf(BookingConflictError);
  });

  it("does not let tenant A list tenant B bookings", async () => {
    const a = await seedTenant("iso-a");
    const b = await seedTenant("iso-b");
    await createBooking({
      tenantId: a.tenantId,
      kind: "slot",
      staffId: a.staffId,
      startsAt: new Date("2026-08-01T08:00:00.000Z"),
      endsAt: new Date("2026-08-01T09:00:00.000Z"),
      status: "confirmed",
    });
    await createBooking({
      tenantId: b.tenantId,
      kind: "slot",
      staffId: b.staffId,
      startsAt: new Date("2026-08-01T08:00:00.000Z"),
      endsAt: new Date("2026-08-01T09:00:00.000Z"),
      status: "confirmed",
    });
    const onlyA = await listBookingsForTenant(a.tenantId);
    expect(onlyA.every((row) => row.tenantId === a.tenantId)).toBe(true);
    expect(onlyA.some((row) => row.tenantId === b.tenantId)).toBe(false);
    expect(onlyA.every((row) => !("customerPhone" in row))).toBe(true);
  });

  it("does not return customerPhone on tenant booking lists", async () => {
    const { tenantId, staffId } = await seedTenant("kvkk");
    await createBooking({
      tenantId,
      kind: "slot",
      staffId,
      startsAt: new Date("2026-08-02T08:00:00.000Z"),
      endsAt: new Date("2026-08-02T09:00:00.000Z"),
      customerName: "Ada",
      customerPhone: "+905551112233",
    });
    const rows = await listBookingsForTenant(tenantId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.customerName).toBe("Ada");
    expect(rows[0] && "customerPhone" in rows[0]).toBe(false);
    expect(JSON.stringify(rows)).not.toContain("+905551112233");
  });

  it("rejects illegal status transitions", async () => {
    const { tenantId, staffId } = await seedTenant("status");
    const row = await createBooking({
      tenantId,
      kind: "slot",
      staffId,
      startsAt: new Date("2026-09-01T10:00:00.000Z"),
      endsAt: new Date("2026-09-01T11:00:00.000Z"),
      status: "pending",
    });
    const confirmed = await updateBookingStatus(tenantId, row!.id, "confirmed");
    expect(confirmed?.status).toBe("confirmed");
    await expect(updateBookingStatus(tenantId, row!.id, "pending")).rejects.toBeInstanceOf(
      BookingStatusError,
    );
  });
});
