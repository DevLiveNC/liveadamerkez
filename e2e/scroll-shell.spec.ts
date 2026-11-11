import { expect, test, devices, type Locator, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { signSession } from "@ada-merkez/shared/node";

const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:3001";
const authSecret = process.env.AUTH_SECRET ?? "e2e-auth-secret";

async function assertScrollport(locator: Locator) {
  const overflowY = await locator.evaluate((el) => getComputedStyle(el).overflowY);
  expect(["auto", "scroll"]).toContain(overflowY);
  const minHeight = await locator.evaluate((el) => getComputedStyle(el).minHeight);
  expect(minHeight).toBe("0px");
}

async function sendButtonReachable(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.goto("/app/giris");
  await expect(page.getByRole("button", { name: "Kod gönder" })).toBeVisible();
  const main = page.locator("main#icerik");
  await expect(main).toBeVisible();
  await assertScrollport(main);

  await page.getByLabel("Telefon").focus();
  const keyboardHeight = Math.round(viewport.height * 0.48);
  await page.setViewportSize({ width: viewport.width, height: Math.max(280, viewport.height - keyboardHeight) });

  const send = page.getByRole("button", { name: "Kod gönder" });
  await send.scrollIntoViewIfNeeded();
  await expect(send).toBeVisible();
  const box = await send.boundingBox();
  expect(box).toBeTruthy();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);
}

test("iPhone SE (375×667): kabuk taşmaz, Kod gönder klavye yüksekliğinde kaydırılır", async ({ page }) => {
  const se = devices["iPhone SE (3rd gen)"];
  await page.setViewportSize(se.viewport);
  expect(se.viewport).toEqual({ width: 375, height: 667 });
  await sendButtonReachable(page, se.viewport);
});

test("Pixel 5: kabuk taşmaz, Kod gönder klavye yüksekliğinde kaydırılır", async ({ page }) => {
  const pixel = devices["Pixel 5"];
  await page.setViewportSize(pixel.viewport);
  await sendButtonReachable(page, pixel.viewport);
});

test("işletme talepler tablosu ve profil formu am-main içinde kayar", async ({ page, request }) => {
  const health = await request.get(`${apiURL}/health`);
  expect(health.ok()).toBeTruthy();
  const body = (await health.json()) as { db?: string };
  test.skip(body.db !== "connected", "DATABASE_URL gerekli");
  const databaseUrl = process.env.DATABASE_URL;
  test.skip(!databaseUrl, "DATABASE_URL gerekli");

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  const tenantId = randomUUID();
  const userId = randomUUID();
  const phone = `+90533${tenantId.replace(/-/g, "").slice(0, 7)}`;
  try {
    await client.query(
      `INSERT INTO business (id, name, slug, status, city_name, sector) VALUES ($1, 'Örnek işletme', $2, 'approved', 'Lefkoşa', 'kuafor')`,
      [tenantId, `ornek-e2e-${tenantId.slice(0, 8)}`],
    );
    await client.query(
      `INSERT INTO app_account (id, phone, name, role, tenant_id) VALUES ($1, $2, 'E2E işletme', 'business', $3)`,
      [userId, phone, tenantId],
    );
    await client.query(
      `INSERT INTO business_member (user_id, tenant_id, member_role) VALUES ($1, $2, 'owner')`,
      [userId, tenantId],
    );
  } finally {
    await client.end();
  }

  const token = signSession(
    { tenantId, role: "business", sub: userId },
    { secret: authSecret, ttlMs: 60 * 60 * 1000 },
  );
  await page.context().addCookies([
    {
      name: "am_session",
      value: token,
      domain: "127.0.0.1",
      path: "/app",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.setViewportSize(devices["iPhone SE"].viewport);
  await page.goto("/app/isletme/talepler");
  const isletmeMain = page.locator("#isletme-icerik");
  await expect(isletmeMain).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gelen talepler", level: 1 })).toBeVisible();
  await assertScrollport(isletmeMain);
  await isletmeMain.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });

  await page.goto("/app/isletme/profil");
  await expect(page.getByRole("heading", { name: "Ayarlar", level: 1 })).toBeVisible();
  await assertScrollport(page.locator("#isletme-icerik"));
  const profileEnd = page.locator("#isletme-icerik").locator("button, [type=submit], h2").last();
  await profileEnd.scrollIntoViewIfNeeded();
  await expect(profileEnd).toBeVisible();
});

test("yönetim onaylar listesi am-main içinde kayar", async ({ page, request }) => {
  const health = await request.get(`${apiURL}/health`);
  expect(health.ok()).toBeTruthy();
  const body = (await health.json()) as { db?: string };
  test.skip(body.db !== "connected", "DATABASE_URL gerekli");
  const databaseUrl = process.env.DATABASE_URL;
  test.skip(!databaseUrl, "DATABASE_URL gerekli");

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  const userId = randomUUID();
  const phone = `+90533${userId.replace(/-/g, "").slice(0, 7)}`;
  try {
    await client.query(
      `INSERT INTO app_account (id, phone, name, role) VALUES ($1, $2, 'E2E yönetici', 'admin')`,
      [userId, phone],
    );
  } finally {
    await client.end();
  }

  const token = signSession(
    { role: "admin", sub: userId },
    { secret: authSecret, ttlMs: 60 * 60 * 1000 },
  );
  await page.context().addCookies([
    {
      name: "am_session",
      value: token,
      domain: "127.0.0.1",
      path: "/app",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.setViewportSize(devices["Pixel 5"].viewport);
  await page.goto("/app/yonetim/onaylar");
  const yonetimMain = page.locator("#yonetim-icerik");
  await expect(yonetimMain).toBeVisible();
  await expect(page.getByRole("heading", { name: "İşletme onayları", level: 1 })).toBeVisible();
  await assertScrollport(yonetimMain);
  await yonetimMain.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
});
