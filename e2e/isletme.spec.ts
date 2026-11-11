import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { signSession } from "@ada-merkez/shared/node";

const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:3001";
const authSecret = process.env.AUTH_SECRET ?? "e2e-auth-secret";

test("işletme paneli sunucuda kilitli, KKTC yazmaz, v2 kabuk ve yeni rotalar", async ({
  page,
  request,
}) => {
  await page.goto("/app/isletme");
  await expect(page).toHaveURL(/\/app\/giris/);
  await expect(page.locator("body")).not.toContainText(/KKTC/i);
  await expect(page.locator("body")).not.toContainText("[CTA]");
  await expect(page.locator("body")).not.toContainText(/önizleme/i);
  const emptyAsset = await page.request.get("/app/bos-durum/rezervasyon-yok.webp");
  expect(emptyAsset.ok()).toBeTruthy();
  const empty2x = await page.request.get("/app/bos-durum/rezervasyon-yok@2x.webp");
  expect(empty2x.ok()).toBeTruthy();

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
  await page.goto("/app/isletme");
  await expect(page.locator("body")).toHaveAttribute("data-dekor", "app-isletme");
  await expect(page.locator("body.landing")).toHaveCount(0);
  await expect(page.locator("body.am-app")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Genel bakış" })).toBeVisible();
  const panelIcon = page.locator(".am-icon").first();
  await expect(panelIcon).toBeVisible();
  expect(await panelIcon.evaluate((el) => getComputedStyle(el).flexShrink)).toBe("0");
  const kicker = page.locator(".am-kicker").first();
  if (await kicker.count()) {
    expect(await kicker.evaluate((el) => getComputedStyle(el).fontSize)).toBe("12px");
  }
  await expect(page.getByText("Örnek").first()).toBeVisible();
  await expect(page.locator(".am-dash-tabbar")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Menü" })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/KKTC/i);

  await page.goto("/app/isletme/takvim");
  await expect(page.getByRole("heading", { name: "Takvim", level: 1 })).toBeVisible();
  await page.goto("/app/isletme/talepler");
  await expect(page.getByRole("heading", { name: "Gelen talepler", level: 1 })).toBeVisible();
  await page.goto("/app/isletme/hizmetler");
  await expect(page.getByRole("heading", { name: "Hizmetler", level: 1 })).toBeVisible();
  await page.goto("/app/isletme/profil");
  await expect(page.getByRole("heading", { name: "Ayarlar", level: 1 })).toBeVisible();

  await page.goto("/app/isletme/istatistik");
  await expect(page).toHaveURL(/\/app\/isletme\/?$/);
  await page.goto("/app/isletme/gelen");
  await expect(page).toHaveURL(/\/app\/isletme\/talepler/);
});
