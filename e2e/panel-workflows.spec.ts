import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { signSession } from "@ada-merkez/shared/node";
import { nicosiaDateKey, utcToNicosiaParts } from "@ada-merkez/shared";

const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:3001";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";
const authSecret =
  process.env.E2E_AUTH_SECRET ?? process.env.AUTH_SECRET ?? "e2e-auth-secret";

async function requireDb(request: APIRequestContext) {
  const health = await request.get(`${apiURL}/health`);
  expect(health.ok()).toBeTruthy();
  const body = (await health.json()) as { db?: string };
  test.skip(body.db !== "connected", "DATABASE_URL gerekli");
  const url = process.env.DATABASE_URL;
  test.skip(!url, "DATABASE_URL gerekli");
  return url!;
}

async function login(
  page: Page,
  session: { sub: string; role: "business" | "admin"; tenantId?: string },
) {
  await page.context().clearCookies();
  const token = signSession(session, {
    secret: authSecret,
    ttlMs: 60 * 60 * 1000,
  });
  await page.context().addCookies([
    {
      name: "am_session",
      value: token,
      domain: new URL(baseURL).hostname,
      path: "/app",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

async function seed(databaseUrl: string) {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  const marker = `panel-e2e-${randomUUID().slice(0, 8)}`;
  const tenantId = randomUUID();
  const otherTenantId = randomUUID();
  const userId = randomUUID();
  const adminId = randomUUID();
  const customerId = randomUUID();
  const staffId = randomUUID();
  const otherStaffId = randomUUID();
  const serviceId = randomUUID();
  const bookingId = randomUUID();
  const otherBookingId = randomUUID();
  const applicationId = randomUUID();
  const consentId = randomUUID();
  const startsAt = new Date(Date.now() + 2 * 86_400_000);
  startsAt.setUTCHours(9, 0, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 30 * 60_000);
  const phone = (id: string) => `+90538${id.replace(/-/g, "").slice(0, 7)}`;
  try {
    await client.query(
      `INSERT INTO business (id, name, slug, status, city_name, sector)
       VALUES ($1, $2, $3, 'approved', 'Lefkoşa', 'kuafor'),
              ($4, $5, $6, 'approved', 'Girne', 'klinik')`,
      [
        tenantId,
        marker,
        marker,
        otherTenantId,
        `${marker}-other`,
        `${marker}-other`,
      ],
    );
    await client.query(
      `INSERT INTO app_account (id, phone, name, role, tenant_id)
       VALUES ($1, $2, 'E2E işletme', 'business', $3),
              ($4, $5, 'E2E yönetici', 'admin', NULL),
              ($6, $7, 'E2E müşteri', 'customer', NULL)`,
      [
        userId,
        phone(userId),
        tenantId,
        adminId,
        phone(adminId),
        customerId,
        phone(customerId),
      ],
    );
    await client.query(
      `INSERT INTO business_member (user_id, tenant_id, member_role) VALUES ($1, $2, 'owner')`,
      [userId, tenantId],
    );
    await client.query(
      `INSERT INTO staff (id, tenant_id, name) VALUES ($1, $2, 'E2E personel'), ($3, $4, 'Diğer personel')`,
      [staffId, tenantId, otherStaffId, otherTenantId],
    );
    await client.query(
      `INSERT INTO service (id, tenant_id, name, duration_minutes, staff_id)
       VALUES ($1, $2, 'E2E hizmet', 30, $3)`,
      [serviceId, tenantId, staffId],
    );
    await client.query(
      `INSERT INTO booking (id, tenant_id, kind, status, staff_id, service_id, account_id, starts_at, ends_at, channel, customer_name, customer_phone, notes)
       VALUES ($1, $2, 'slot', 'pending', $3, $4, $5, $6, $7, 'app', $8, $9, $10),
              ($11, $12, 'slot', 'pending', $13, NULL, NULL, $6, $7, 'whatsapp', 'Diğer müşteri', '+905551112233', 'other')`,
      [
        bookingId,
        tenantId,
        staffId,
        serviceId,
        customerId,
        startsAt,
        endsAt,
        `${marker} müşteri`,
        phone(customerId),
        marker,
        otherBookingId,
        otherTenantId,
        otherStaffId,
      ],
    );
    await client.query(
      `INSERT INTO consent (id, tenant_id, subject_type, subject_id, purpose, granted, text_version, retention_days, retain_until)
       VALUES ($1, $2, 'business_application', $3, 'marketing', true, 'e2e', 30, now() + interval '30 days')`,
      [consentId, tenantId, applicationId],
    );
    await client.query(
      `INSERT INTO business_application (id, business_name, sector, city, contact_name, phone, consent_id, status)
       VALUES ($1, $2, 'kuafor', 'Lefkoşa', 'E2E başvuru', $3, $4, 'received')`,
      [applicationId, `${marker} başvuru`, phone(customerId), consentId],
    );
  } catch (error) {
    await client.end();
    throw error;
  }
  return {
    client,
    marker,
    tenantId,
    otherTenantId,
    userId,
    adminId,
    customerId,
    staffId,
    serviceId,
    bookingId,
    otherBookingId,
    applicationId,
    startsAt,
    async cleanup() {
      try {
        await client.query(
          "DELETE FROM app_notification WHERE account_id = $1",
          [customerId],
        );
        await client.query(
          "DELETE FROM booking WHERE tenant_id = ANY($1::uuid[])",
          [[tenantId, otherTenantId]],
        );
        await client.query("DELETE FROM business_application WHERE id = $1", [
          applicationId,
        ]);
        await client.query("DELETE FROM consent WHERE id = $1", [consentId]);
        await client.query(
          "DELETE FROM availability_rule WHERE tenant_id = $1",
          [tenantId],
        );
        await client.query(
          "DELETE FROM service WHERE tenant_id = ANY($1::uuid[])",
          [[tenantId, otherTenantId]],
        );
        await client.query(
          "DELETE FROM staff WHERE tenant_id = ANY($1::uuid[])",
          [[tenantId, otherTenantId]],
        );
        await client.query("DELETE FROM business_member WHERE tenant_id = $1", [
          tenantId,
        ]);
        await client.query(
          "DELETE FROM audit_log WHERE actor_user_id = ANY($1::uuid[])",
          [[userId, adminId, customerId]],
        );
        await client.query(
          "DELETE FROM app_account WHERE id = ANY($1::uuid[])",
          [[userId, adminId, customerId]],
        );
        await client.query("DELETE FROM business WHERE id = ANY($1::uuid[])", [
          [tenantId, otherTenantId],
        ]);
      } finally {
        await client.end();
      }
    },
  };
}

test("işletme CRUD, talep onayı, saat önerisi ve çevrimdışı koruma", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(120_000);
  const fixture = await seed(await requireDb(request));
  try {
    await login(page, {
      sub: fixture.userId,
      role: "business",
      tenantId: fixture.tenantId,
    });
    await page.goto("/app/isletme/hizmetler");
    await expect(
      page.getByRole("heading", { name: "Hizmetler ve fiyatlar", level: 2 }),
    ).toBeVisible();

    const serviceName = `${fixture.marker} hizmet`;
    await page
      .getByRole("button", { name: "Hizmet ekle", exact: true })
      .click();
    let sheet = page.getByRole("dialog");
    await sheet.getByLabel("Hizmet adı").fill(serviceName);
    await sheet.getByLabel("Süre (dakika)").fill("30");
    await sheet.getByRole("button", { name: "Kaydet", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: serviceName, level: 4 }),
    ).toBeVisible();
    let entity = page.locator(".pn-entity").filter({
      has: page.getByRole("heading", { name: serviceName, level: 4 }),
    });
    await entity.getByRole("button", { name: "Düzenle", exact: true }).click();
    sheet = page.getByRole("dialog");
    const editedName = `${serviceName} düzenlendi`;
    await sheet.getByLabel("Hizmet adı").fill(editedName);
    await sheet.getByRole("button", { name: "Kaydet", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: editedName, level: 4 }),
    ).toBeVisible();
    entity = page.locator(".pn-entity").filter({
      has: page.getByRole("heading", { name: editedName, level: 4 }),
    });
    await entity
      .getByRole("button", { name: "Pasifleştir", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Pasifleştir", exact: true })
      .click();
    await expect(entity.getByText("Pasif", { exact: true })).toBeVisible();

    const staffName = `${fixture.marker} personel`;
    await page
      .getByRole("button", { name: "Personel ekle", exact: true })
      .click();
    sheet = page.getByRole("dialog");
    await sheet.getByLabel("Ad", { exact: true }).fill(staffName);
    await sheet.getByRole("button", { name: "Kaydet", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: staffName, level: 4 }),
    ).toBeVisible();

    await context.setOffline(true);
    await expect(page.locator(".pn-offline")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Hizmet ekle", exact: true }),
    ).toBeDisabled();
    await context.setOffline(false);
    await expect(page.locator(".pn-offline")).toHaveCount(0);

    await page.goto("/app/isletme/profil");
    const nameInput = page.getByLabel("İşletme adı");
    await expect(nameInput).toHaveValue(fixture.marker);
    await nameInput.fill(`  ${fixture.marker} kaydedildi  `);
    await page.getByRole("button", { name: "Kaydet", exact: true }).click();
    await expect(nameInput).toHaveValue(`${fixture.marker} kaydedildi`);
    await page.getByLabel("Başlangıç", { exact: true }).fill("18:00");
    await page.getByLabel("Bitiş", { exact: true }).fill("09:00");
    await page.getByRole("button", { name: "Saat ekle", exact: true }).click();
    await expect(
      page.getByText("Bitiş saati başlangıçtan sonra olmalı."),
    ).toBeVisible();
    await page.getByLabel("Başlangıç", { exact: true }).fill("09:00");
    await page.getByLabel("Bitiş", { exact: true }).fill("12:00");
    await page
      .getByLabel("Personel", { exact: true })
      .selectOption({ label: staffName });
    await page.getByRole("button", { name: "Saat ekle", exact: true }).click();
    const hours = page.locator(".pn-entity").filter({ hasText: "09:00–12:00" });
    await expect(hours).toBeVisible();
    await hours.getByRole("button", { name: "Kaldır", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Kaldır", exact: true })
      .click();
    await expect(hours).toHaveCount(0);

    await page.goto("/app/isletme/talepler");
    await page.getByRole("searchbox", { name: "Ara" }).fill(fixture.marker);
    const record = page
      .locator(".pn-record")
      .filter({ hasText: fixture.marker });
    await expect(record).toBeVisible();
    await record
      .getByRole("button", { name: "Başka saat öner", exact: true })
      .click();
    sheet = page.getByRole("dialog", { name: "Başka saat öner" });
    await sheet.getByLabel("Önerilen saat").fill("2020-01-01T10:00");
    await sheet
      .getByRole("button", { name: "Öneriyi gönder", exact: true })
      .click();
    await expect(
      sheet.getByText("Gelecekte bir tarih ve saat seç."),
    ).toBeVisible();
    const future = utcToNicosiaParts(new Date(Date.now() + 3 * 86_400_000));
    const pad = (n: number) => String(n).padStart(2, "0");
    await sheet
      .getByLabel("Önerilen saat")
      .fill(`${future.year}-${pad(future.month)}-${pad(future.day)}T10:00`);
    await sheet
      .getByRole("button", { name: "Öneriyi gönder", exact: true })
      .click();
    await expect(
      page.getByText("Saat önerisi müşteriye iletildi."),
    ).toBeVisible();
    const notice = await fixture.client.query<{ type: string }>(
      "SELECT type FROM app_notification WHERE booking_id = $1",
      [fixture.bookingId],
    );
    expect(notice.rows.some((row) => row.type === "slot_suggested")).toBe(true);

    await record.getByRole("button", { name: "Onayla", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Randevuyu onayla" })
      .getByRole("button", { name: "Onayla", exact: true })
      .click();
    await page
      .getByRole("group", { name: "Durum" })
      .getByRole("button", { name: "Tümü", exact: true })
      .click();
    await expect(record.getByText("Onaylı", { exact: true })).toBeVisible();
    const confirmed = await fixture.client.query<{ status: string }>(
      "SELECT status FROM booking WHERE id = $1",
      [fixture.bookingId],
    );
    expect(confirmed.rows[0]?.status).toBe("confirmed");
  } finally {
    await fixture.cleanup();
  }
});

test("kiracı/rol sınırı, yönetici başvuru akışı ve sunucu toplamlı CSV", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const fixture = await seed(await requireDb(request));
  try {
    await login(page, {
      sub: fixture.userId,
      role: "business",
      tenantId: fixture.tenantId,
    });
    const forbidden = await page.request.get("/app/api/yonetim/admin/users");
    expect(forbidden.status()).toBe(403);
    const crossTenant = await page.request.patch(
      `/app/api/isletme/bookings/${fixture.otherBookingId}`,
      {
        headers: { origin: baseURL, "sec-fetch-site": "same-origin" },
        data: { status: "confirmed" },
      },
    );
    expect(crossTenant.status()).toBe(404);
    const own = await page.request.get("/app/api/isletme/bookings");
    const ownBody = (await own.json()) as { bookings: { id: string }[] };
    expect(
      ownBody.bookings.some((row) => row.id === fixture.otherBookingId),
    ).toBe(false);

    await login(page, { sub: fixture.adminId, role: "admin" });
    const asAdmin = await page.request.get("/app/api/isletme/business/me");
    expect(asAdmin.status()).toBe(403);
    await page.goto("/app/yonetim/rezervasyonlar");
    await expect(page.locator(".pn-record").first()).toBeVisible();
    await page
      .getByLabel("İşletme", { exact: true })
      .selectOption(fixture.tenantId);
    await expect(
      page.locator(".pn-record").filter({ hasText: fixture.marker }),
    ).toBeVisible();
    await expect(
      page.locator(".pn-record").filter({ hasText: "Diğer müşteri" }),
    ).toHaveCount(0);

    await page.goto("/app/yonetim/onaylar");
    await page
      .getByRole("searchbox", { name: "Ara" })
      .fill(`${fixture.marker} başvuru`);
    const application = page
      .locator(".pn-record")
      .filter({ hasText: `${fixture.marker} başvuru` });
    await expect(
      application.getByText(
        "Pazarlama başvurusu. Onaylamak işletme hesabı açmaz veya keşifte yayımlamaz.",
      ),
    ).toBeVisible();
    await application
      .getByRole("button", { name: "İncelemede", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "İncelemede", exact: true })
      .click();
    await expect(
      application.getByText("İncelemede", { exact: true }),
    ).toBeVisible();
    await application
      .getByRole("button", { name: "Onayla", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Onayla", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("group", { name: "Durum" })
      .getByRole("button", { name: "Onaylı", exact: true })
      .click();
    await expect(
      application.getByText("Onaylı", { exact: true }),
    ).toBeVisible();
    const approved = await fixture.client.query<{ status: string }>(
      "SELECT status FROM business_application WHERE id = $1",
      [fixture.applicationId],
    );
    expect(approved.rows[0]?.status).toBe("approved");
    const published = await fixture.client.query(
      "SELECT id FROM business WHERE name = $1",
      [`${fixture.marker} başvuru`],
    );
    expect(published.rowCount).toBe(0);

    await page.goto("/app/yonetim/raporlar");
    await page
      .getByLabel("Başlangıç", { exact: true })
      .fill(nicosiaDateKey(new Date()));
    await page
      .getByLabel("Bitiş", { exact: true })
      .fill(nicosiaDateKey(new Date(Date.now() + 3 * 86_400_000)));
    await page
      .getByRole("button", { name: "Aralığı uygula", exact: true })
      .click();
    const exportButton = page.getByRole("button", {
      name: "CSV indir",
      exact: true,
    });
    await expect(exportButton).toBeEnabled();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      exportButton.click(),
    ]);
    const path = await download.path();
    expect(path).toBeTruthy();
    const csv = await readFile(path!, "utf8");
    expect(csv).toContain("Gün,Toplam,Onaylı,Bekleyen");
    expect(csv).toContain(nicosiaDateKey(fixture.startsAt));
    expect(csv).not.toContain(fixture.marker);
    expect(csv).not.toContain("E2E müşteri");
  } finally {
    await fixture.cleanup();
  }
});
