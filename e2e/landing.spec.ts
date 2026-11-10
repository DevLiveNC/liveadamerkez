import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const artifactDir = path.join(process.cwd(), "artifacts");

test.beforeAll(() => {
  fs.mkdirSync(artifactDir, { recursive: true });
});

test("landing smoke: copy, PWA, closed waitlist, legal placeholder", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  await expect(page.getByRole("heading", { name: /Kuzey Kıbrıs ve Türkiye için/ })).toBeVisible();
  await expect(page.getByText("Lefkoşa", { exact: true })).toBeVisible();
  await expect(page.getByText("Girne", { exact: true })).toBeVisible();
  await expect(page.getByText("Mağusa", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bekleme listesi" })).toBeVisible();
  await expect(page.getByText("QR menü")).toBeVisible();
  await expect(page.getByText("Yakında").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/KKTC/i);
  await expect(page.locator("body")).not.toContainText(/ücretsiz kurulum/i);
  await expect(page.locator("body")).not.toContainText(/ilk ve tek/i);

  await expect(page.getByText("Bekleme listesi çok yakında açılıyor")).toBeVisible();
  await expect(page.getByRole("link", { name: /KVKK aydınlatma metni yakında/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Listeye yazıl" })).toHaveCount(0);

  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  const manifestBody = await manifest.json();
  expect(manifestBody.name).toBe("Ada Merkez");
  expect(JSON.stringify(manifestBody)).not.toMatch(/KKTC/i);
  expect(manifestBody.display).toBe("standalone");
  expect(manifestBody.icons?.length).toBeGreaterThan(0);

  const sw = await page.request.get("/sw.js");
  expect(sw.ok()).toBeTruthy();
  expect(await sw.text()).toMatch(/ada-merkez-landing/);

  const swReady = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  expect(swReady).toBe(true);

  await page.goto("/yasal/aydinlatma");
  await expect(page.getByText("Kullanıcı onayı bekliyor")).toBeVisible();
});

test("desktop screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(artifactDir, "landing-desktop.png"),
    fullPage: true,
  });
});

test("mobile screenshot and PWA meta", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const apple = page.locator('link[rel="apple-touch-icon"]');
  await expect(apple).toHaveAttribute("href", /apple-touch-icon/);
  await page.screenshot({
    path: path.join(artifactDir, "landing-mobile.png"),
    fullPage: true,
  });
});
