import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { signSession } from "@ada-merkez/shared/node";

const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:3001";
const authSecret = process.env.AUTH_SECRET ?? "e2e-auth-secret";

test("booking endpoints require a session and reject overlap", async ({ request }) => {
  const health = await request.get(`${apiURL}/health`);
  expect(health.ok()).toBeTruthy();
  const body = (await health.json()) as { db?: string; waitlistOpen?: boolean };
  expect(body.waitlistOpen).toBe(false);
  test.skip(body.db !== "connected", "DATABASE_URL gerekli");

  const unauth = await request.post(`${apiURL}/v1/bookings`, {
    data: {
      kind: "slot",
      startsAt: "2026-10-01T10:00:00.000Z",
      endsAt: "2026-10-01T11:00:00.000Z",
    },
  });
  expect(unauth.status()).toBe(401);

  const headerTenant = await request.get(`${apiURL}/v1/bookings`, {
    headers: { "x-tenant-id": randomUUID() },
  });
  expect(headerTenant.status()).toBe(401);

  const databaseUrl = process.env.DATABASE_URL;
  test.skip(!databaseUrl, "DATABASE_URL gerekli");
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  const tenantId = randomUUID();
  const staffId = randomUUID();
  try {
    await client.query(
      `INSERT INTO business (id, name, slug, status) VALUES ($1, 'E2E', $2, 'draft')`,
      [tenantId, `e2e-${tenantId.slice(0, 8)}`],
    );
    await client.query(`INSERT INTO staff (id, tenant_id, name) VALUES ($1, $2, 'E2E')`, [
      staffId,
      tenantId,
    ]);
  } finally {
    await client.end();
  }

  const token = signSession(
    { tenantId, role: "business", sub: "e2e" },
    { secret: authSecret, ttlMs: 60 * 60 * 1000 },
  );
  const auth = { Authorization: `Bearer ${token}` };
  const created = await request.post(`${apiURL}/v1/bookings`, {
    headers: auth,
    data: {
      kind: "slot",
      staffId,
      startsAt: "2026-10-01T10:00:00.000Z",
      endsAt: "2026-10-01T11:00:00.000Z",
      status: "confirmed",
    },
  });
  expect(created.status()).toBe(201);
  const createdBody = (await created.json()) as { booking?: { status?: string; id?: string } };
  expect(createdBody.booking?.status).toBe("pending");

  const overlap = await request.post(`${apiURL}/v1/bookings`, {
    headers: auth,
    data: {
      kind: "slot",
      staffId,
      startsAt: "2026-10-01T10:30:00.000Z",
      endsAt: "2026-10-01T11:30:00.000Z",
    },
  });
  expect(overlap.status()).toBe(409);

  const confirmed = await request.patch(`${apiURL}/v1/bookings/${createdBody.booking?.id}`, {
    headers: auth,
    data: { status: "confirmed" },
  });
  expect(confirmed.status()).toBe(200);

  const invalid = await request.patch(`${apiURL}/v1/bookings/${createdBody.booking?.id}`, {
    headers: auth,
    data: { status: "pending" },
  });
  expect(invalid.status()).toBe(422);

  const closed = await request.post(`${apiURL}/v1/waitlist`, {
    data: {
      role: "customer",
      name: "Kapalı",
      phone: "+905331110000",
      consentGranted: true,
    },
  });
  expect(closed.status()).toBe(503);
  expect((await closed.json()) as { code?: string }).toMatchObject({ code: "waitlist_closed" });
});
