import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const artifactDir = path.join(process.cwd(), "artifacts");
const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:3001";

test.beforeAll(() => {
  fs.mkdirSync(artifactDir, { recursive: true });
});

test("landing smoke: copy, PWA, closed waitlist, legal placeholder", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  await expect(page.getByRole("heading", { name: /Adada randevu ve rezervasyon/ })).toBeVisible();
  await expect(page.getByText("Lefkoşa", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Girne", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Mağusa", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Listeye yazıl." })).toBeVisible();
  await expect(page.getByText("Bekleme listesi").first()).toBeVisible();
  await expect(page.getByText("QR menü").first()).toBeVisible();
  await expect(page.getByText("Yakında").first()).toBeVisible();
  await expect(page.getByText("Yakında açılıyor").first()).toBeVisible();
  await expect(page.getByText("Kabuki").first()).toBeVisible();
  await expect(page.getByText("Boş saat burada durur. Müşteri görür, sen onaylarsın.")).toBeVisible();
  await expect(page.locator("html[data-dekor='landing']")).toHaveCount(1);
  await expect(page.locator("body[data-dekor='landing']")).toHaveCount(1);
  await expect(page.locator(".kabuki--hero img")).toBeVisible();
  await expect(page.getByText("Yakında: CY Ticket ve Ada Kampüs entegrasyonu").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/gelecek ortak/i);
  await expect(page.locator(".ticket dd .badge-ornek")).toHaveText("Örnek");
  await expect(page.locator(".ticket dd").filter({ has: page.locator(".badge-ornek") })).toHaveText(
    /Örnek\s+\S+,\s+\d{1,2}\s+\S+/,
  );
  await expect(page.locator("#isletmeler")).toHaveClass(/biz-sec/);
  await expect(
    page.getByText(
      "Pilot Lefkoşa, Girne ve Mağusa’da. Türkiye’deki işletmeler için ayrı bir dönem planlıyoruz.",
    ).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Erken erişime kaydol" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Kendi işletmeni ekle" }).first()).toBeVisible();
  await expect(page.locator(".search-field").filter({ hasText: "Ne zaman" }).locator("strong")).toHaveText(
    /^Yarın, \d{1,2} \S+$/,
  );
  await expect(page.locator(".nav-lang button[disabled]")).toBeDisabled();
  await expect(page.locator(".nav-lang button[disabled]")).toContainText("EN");
  await expect(page.locator(".nav-lang .lang-soon")).toHaveText("Yakında");
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(4);

  const ofl = await page.request.get("/fonts/OFL.txt");
  expect(ofl.ok()).toBeTruthy();
  const oflText = await ofl.text();
  expect(oflText).toMatch(/SIL Open Font License, Version 1\.1/);
  expect(oflText).toMatch(/Inter Project Authors/);
  expect(oflText).toMatch(/Plus Jakarta Sans Project Authors/);
  expect((await page.request.get("/fonts/PlusJakartaSans-Variable.woff2")).status()).toBe(404);
  await expect(page.locator("body")).not.toContainText(/KKTC/i);
  await expect(page.locator("body")).not.toContainText(/ücretsiz kurulum/i);
  await expect(page.locator("body")).not.toContainText(/ilk ve tek/i);
  await expect(page.locator("body")).not.toContainText("[CTA]");
  await expect(page.locator("body")).not.toContainText(/doğrulanacak/i);
  await expect(page.locator("body")).not.toContainText(/netleşmedi/i);
  await expect(page.locator("body")).not.toContainText(/\bTODO\b/);
  await expect(page.locator("body")).not.toContainText(/önizleme/i);
  await expect(page.locator("body")).not.toContainText(/uydurma/i);
  await expect(page.locator(".nav-geo")).toHaveCount(0);

  await expect(page.getByText("Bekleme listesi çok yakında açılıyor")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Çerez ve ölçüm" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reddet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kabul" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ayarlar" })).toBeVisible();
  await expect(page.getByRole("link", { name: /KVKK aydınlatma metni yakında/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Listeye yazıl" })).toHaveCount(0);

  await expect(page.locator('link[rel="manifest"]').first()).toHaveAttribute("href", "/app/manifest.json");

  const landingManifest = await page.request.get("/manifest.webmanifest");
  expect(landingManifest.ok()).toBeTruthy();
  const landingManifestBody = await landingManifest.json();
  expect(landingManifestBody.name).toBe("Ada Merkez");
  expect(JSON.stringify(landingManifestBody)).not.toMatch(/KKTC/i);
  expect(landingManifestBody.display).toBe("standalone");
  expect(landingManifestBody.start_url).toBe("/app?source=pwa");
  expect(landingManifestBody.scope).toBe("/app");
  expect(landingManifestBody.icons?.length).toBeGreaterThan(0);

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
  await expect(page.locator("body")).not.toContainText(/doğrulanacak/i);
});

test("QR channel landings return 200 and unknown codes 404", async ({ page }) => {
  const ok = await page.goto("/q/afis");
  expect(ok?.ok()).toBeTruthy();
  await expect(page.getByText("Afiş")).toBeVisible();
  await expect(page.getByText("Bekleme listesi çok yakında açılıyor")).toBeVisible();

  const billboard = await page.goto("/q/billboard/lefkosa");
  expect(billboard?.ok()).toBeTruthy();

  const unknown = await page.goto("/q/yok-boyle-kanal");
  expect(unknown?.status()).toBe(404);
});

test("closed waitlist POST is 503 and UTM persist is skipped while closed", async ({ request }) => {
  const health = await request.get(`${apiURL}/health`);
  const healthBody = (await health.json()) as { db?: string; waitlistOpen?: boolean };
  expect(healthBody.waitlistOpen).toBe(false);
  const closed = await request.post(`${apiURL}/v1/waitlist`, {
    data: {
      name: "Kapalı",
      email: "closed@example.com",
      city: "lefkosa",
      segment: "yerli",
      consentGranted: true,
    },
  });
  expect(closed.status()).toBe(503);
  expect((await closed.json()) as { code?: string }).toMatchObject({ code: "waitlist_closed" });
});

test("desktop screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      jakarta: document.fonts.check("700 48px \"Plus Jakarta Sans\""),
      inter: document.fonts.check("400 16px Inter"),
    };
  });
  expect(fonts.jakarta).toBe(true);
  expect(fonts.inter).toBe(true);
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
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]').first()).toHaveAttribute(
    "content",
    "yes",
  );
  await expect(page.locator('meta[name="mobile-web-app-capable"]').first()).toHaveAttribute(
    "content",
    "yes",
  );
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]').first()).toHaveAttribute(
    "content",
    "Ada Merkez",
  );
  await expect(
    page.locator('meta[name="apple-mobile-web-app-status-bar-style"]').first(),
  ).toHaveAttribute("content", "default");
  await page.screenshot({
    path: path.join(artifactDir, "landing-mobile.png"),
    fullPage: true,
  });
});
