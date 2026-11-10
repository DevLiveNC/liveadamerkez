import { expect, test } from "@playwright/test";

test("PWA app shell is guest-visible and login is role-tabbed", async ({ page }) => {
  const home = await page.goto("/app");
  expect(home?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Yarın için uygun saat" })).toBeVisible();
  await expect(page.getByText("Örnek").first()).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-dekor", "app-musteri");
  await expect(page.locator("body")).toHaveAttribute("data-dekor", "app-musteri");
  await expect(page.locator('script[src*="dekor.js"]')).toHaveCount(0);
  await expect(page.locator(".am-dekor-band--wave")).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText(/KKTC/i);
  await expect(page.locator("body")).not.toContainText("[CTA]");
  await expect(page.locator('link[rel="apple-touch-startup-image"]').first()).toHaveAttribute(
    "href",
    /\/app\/splash\/splash-/,
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/app/icons/apple-touch-180.png",
  );

  const manifest = await page.request.get("/app/manifest.json");
  expect(manifest.ok()).toBeTruthy();
  const manifestBody = (await manifest.json()) as {
    start_url?: string;
    scope?: string;
    display?: string;
    shortcuts?: { url?: string }[];
    icons?: { src?: string }[];
  };
  expect(manifestBody.start_url).toBe("/app");
  expect(manifestBody.scope).toBe("/app");
  expect(manifestBody.display).toBe("standalone");
  expect(manifestBody.shortcuts?.some((item) => item.url === "/app/randevular")).toBe(true);
  expect(manifestBody.icons?.every((icon) => icon.src?.startsWith("/app/icons/"))).toBe(true);
  expect(JSON.stringify(manifestBody)).not.toMatch(/KKTC/i);

  const sw = await page.request.get("/app/sw.js");
  expect(sw.ok()).toBeTruthy();
  expect(await sw.text()).toMatch(/ada-merkez-app/);

  await page.goto("/app/giris");
  await expect(page.locator("html")).toHaveAttribute("data-dekor", "app-giris");
  await expect(page.locator("body")).toHaveAttribute("data-dekor", "app-giris");
  await expect(page.getByRole("tab", { name: "Müşteri" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "İşletme" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Yönetici" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kayıt" })).toBeVisible();

  await page.getByRole("tab", { name: "Yönetici" }).click();
  await expect(page.getByText("Yönetici kaydı yoktur")).toBeVisible();
  await expect(page.getByRole("button", { name: "Kayıt" })).toHaveCount(0);

  await page.goto("/app/giris?rol=isletme&kayit=1");
  await expect(page.getByRole("tab", { name: "İşletme" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: "Kayıt" })).toHaveAttribute("aria-pressed", "true");

  await page.goto("/app/giris?next=https://evil.test/steal");
  await expect(page.locator("body")).not.toContainText("evil.test");

  await page.goto("/app/randevular");
  await expect(page.getByRole("heading", { name: "Henüz rezervasyonun yok" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Randevu için giriş yap." })).toBeVisible();
  await expect(page.locator(".am-empty-art")).toHaveAttribute("width", "320");

  await page.goto("/app/favoriler");
  await expect(page.getByRole("heading", { name: "Favorin henüz yok" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Favori için giriş yap." })).toBeVisible();

  await page.goto("/app/isletmeler/1");
  await expect(page.locator("html")).toHaveAttribute("data-dekor", "app-musteri");
  await expect(page.locator("body")).toHaveAttribute("data-dekor", "app-musteri");
});

test("landing CTAs point at the app and waitlist stays closed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Uygulamayı ana ekrana ekle" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "iPhone ve iPad" })).toBeVisible();
  await expect(page.getByText("Paylaş düğmesine dokun.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Android" })).toBeVisible();
  await expect(page.locator("#uygulama img.am-add-shot")).toHaveAttribute("srcset", /ana-ekrana-ekle@2x/);
  await expect(page.getByRole("link", { name: "Giriş" }).first()).toHaveAttribute("href", "/app/giris");
  await expect(page.getByRole("link", { name: "Uygulamayı aç" }).first()).toHaveAttribute("href", "/app");
  await expect(page.getByRole("link", { name: "Kendi işletmeni ekle" }).first()).toHaveAttribute(
    "href",
    "/app/giris?rol=isletme&kayit=1",
  );
  await expect(page.getByText("Bekleme listesi çok yakında açılıyor")).toBeVisible();
  await expect(page.getByRole("button", { name: "Listeye yazıl" })).toHaveCount(0);
});
