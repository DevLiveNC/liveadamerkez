import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { signSession } from "@ada-merkez/shared/node";

const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:3001";
const authSecret = process.env.AUTH_SECRET ?? "e2e-auth-secret";

test("yönetici paneli sunucuda kilitli, KKTC yazmaz, v2 kabuk ve yeni rotalar", async ({
  page,
  request,
}) => {
  await page.goto("/app/yonetim");
  await expect(page).toHaveURL(/\/app\/giris/);
  await expect(page.locator("body")).not.toContainText(/KKTC/i);
  await expect(page.locator("body")).not.toContainText("[CTA]");
  const emptyAsset = await page.request.get("/app/bos-durum/onay-bekliyor.webp");
  expect(emptyAsset.ok()).toBeTruthy();
  const empty2x = await page.request.get("/app/bos-durum/onay-bekliyor@2x.webp");
  expect(empty2x.ok()).toBeTruthy();

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
  await page.goto("/app/yonetim");
  await expect(page.locator("body")).toHaveAttribute("data-dekor", "app-yonetici");
  await expect(page.locator("body.landing")).toHaveCount(0);
  await expect(page.locator("body.am-app")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Genel bakış" })).toBeVisible();
  const panelIcon = page.locator(".am-icon").first();
  await expect(panelIcon).toBeVisible();
  expect(await panelIcon.evaluate((el) => getComputedStyle(el).flexShrink)).toBe("0");
  await expect(page.getByText("Kapalı", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Menü" })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/KKTC/i);
  await expect(page.locator("body")).not.toContainText("localStorage");

  await page.goto("/app/yonetim/onaylar");
  await expect(page.getByRole("heading", { name: "İşletme onayları", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Reddedilen" }).click();
  await expect(page.getByRole("heading", { name: "Bekleyen işletme yok" })).toBeVisible();
  const emptyImg = page.getByAltText("Kabuki, Ada Merkez maskotu, düşünüyor");
  await expect(emptyImg).toBeVisible();
  await expect(emptyImg).toHaveAttribute("width", "320");
  await expect(emptyImg).toHaveAttribute("height", "320");

  await page.goto("/app/yonetim/sistem-durumu");
  await expect(page).toHaveURL(/\/app\/yonetim\/sistem$/);
  await expect(page.getByRole("heading", { name: "Sistem", exact: true, level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sistem durumu", level: 2 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kiracılar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Denetim" })).toBeVisible();
  await page.getByRole("link", { name: "Kiracılar" }).click();
  await expect(page).toHaveURL(/\/app\/yonetim\/kiracilar$/);
});
