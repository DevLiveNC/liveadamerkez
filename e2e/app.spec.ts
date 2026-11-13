import { randomInt, randomUUID } from "node:crypto";
import pg from "pg";
import { expect, test, type Page } from "@playwright/test";
import { hashOtp } from "@ada-merkez/shared/node";

const apiURL = process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:3001";

async function cacheDump(
  page: Page,
): Promise<{ names: string[]; urls: string[]; body: string }> {
  return page.evaluate(async () => {
    const names = await caches.keys();
    const urls: string[] = [];
    const chunks: string[] = [];
    for (const name of names) {
      const cache = await caches.open(name);
      for (const req of await cache.keys()) {
        urls.push(req.url);
        const res = await cache.match(req);
        chunks.push(res ? await res.text() : "");
      }
    }
    return { names, urls, body: chunks.join("\n") };
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("am_onboarding_v3", "1");
      sessionStorage.setItem("am_splash_v3", "1");
    } catch {
      /* gizli */
    }
  });
});

test("PWA app shell is guest-visible and login is role-tabbed", async ({
  page,
}) => {
  const home = await page.goto("/app");
  expect(home?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Keşif" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Kuaför", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Klinik", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".am-chip[aria-disabled='true']").filter({ hasText: "Kafe" }),
  ).toBeVisible();
  await expect(
    page.locator(".am-chip[aria-disabled='true']").filter({ hasText: "Spor" }),
  ).toBeVisible();
  await expect(
    page.locator(".am-chip[aria-disabled='true']").filter({ hasText: "Sahil" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^Kafe/ })).toHaveCount(0);
  await expect(page.locator(".am-greet-img")).toHaveCount(0);
  await expect(page.getByText("Örnek").first()).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-dekor",
    "app-musteri",
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-dekor",
    "app-musteri",
  );
  await expect(page.locator('script[src*="dekor.js"]')).toHaveCount(0);
  await expect(page.locator(".am-dekor-band--wave")).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText(/KKTC/i);
  await expect(page.locator("body")).not.toContainText("[CTA]");
  await expect(
    page.locator('link[rel="apple-touch-startup-image"]').first(),
  ).toHaveAttribute("href", /\/app\/splash\/splash-/);
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
  expect(manifestBody.start_url).toBe("/app?source=pwa");
  expect(manifestBody.scope).toBe("/app");
  expect(manifestBody.display).toBe("standalone");
  expect(
    manifestBody.shortcuts?.some((item) => item.url === "/app/randevular"),
  ).toBe(true);
  expect(
    manifestBody.icons?.every((icon) => icon.src?.startsWith("/app/icons/")),
  ).toBe(true);
  expect(JSON.stringify(manifestBody)).not.toMatch(/KKTC/i);

  const sw = await page.request.get("/app/sw.js");
  expect(sw.ok()).toBeTruthy();
  const swText = await sw.text();
  expect(swText).toMatch(/ada-merkez-app-v6/);
  expect(swText).toMatch(/CLEAR_CACHES/);
  expect(swText).toMatch(/offline\.html/);
  const offline = await page.request.get("/app/offline.html");
  expect(offline.ok()).toBeTruthy();
  expect(await offline.text()).not.toMatch(/KvkkProbe|\+90\d{10}/);

  const hesapHeaders = await page.request.get("/app/hesap");
  expect(hesapHeaders.headers()["cache-control"] ?? "").toMatch(/no-store/i);

  await page.goto("/app/giris");
  await expect(page.locator("html")).toHaveAttribute("data-dekor", "app-giris");
  await expect(page.locator("body")).toHaveAttribute("data-dekor", "app-giris");
  await expect(page.getByRole("tab", { name: "Müşteri" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tab", { name: "İşletme" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Yönetici" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kayıt" })).toBeVisible();

  await page.getByRole("tab", { name: "Yönetici" }).click();
  await expect(page.getByRole("button", { name: "Kayıt" })).toBeVisible();
  await page.getByRole("button", { name: "Kayıt" }).click();
  await expect(page.getByText("Yönetici hesabı davetle açılır")).toBeVisible();
  await expect(page.getByLabel("Telefon")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Kod gönder" })).toHaveCount(0);

  await page.goto("/app/giris?rol=yonetici&mod=kayit&next=/app/yonetim");
  await expect(page.getByRole("tab", { name: "Yönetici" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("Yönetici hesabı davetle açılır")).toBeVisible();
  await expect(page).toHaveURL(/next=(%2Fapp%2Fyonetim|\/app\/yonetim)/);
  await page.getByRole("button", { name: "Girişe dön" }).click();
  await expect(page.getByLabel("Telefon")).toBeVisible();
  await expect(page).toHaveURL(/next=(%2Fapp%2Fyonetim|\/app\/yonetim)/);

  await page.goto("/app/giris?rol=isletme&kayit=1&next=/app/isletme");
  await expect(page.getByRole("tab", { name: "İşletme" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("button", { name: "Kayıt" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page).toHaveURL(/next=(%2Fapp%2Fisletme|\/app\/isletme)/);
  await page.getByRole("tab", { name: "Müşteri" }).click();
  await expect(page).toHaveURL(/next=(%2Fapp%2Fisletme|\/app\/isletme)/);

  await page.goto("/app/giris?next=https://evil.test/steal");
  await expect(page.locator("body")).not.toContainText("evil.test");

  await page.goto("/app/randevular");
  await expect(page).toHaveURL(/\/app\/giris/);
  await page.goto("/app/favoriler");
  await expect(page).toHaveURL(/\/app\/giris/);
  await page.goto("/app/hesap");
  await expect(page).toHaveURL(/\/app\/giris/);
  const kabuki = await page.request.get("/app/bos-durum/rezervasyon-yok.webp");
  expect(kabuki.ok()).toBeTruthy();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/isletmeler/1");
  await expect(page.locator("html")).toHaveAttribute(
    "data-dekor",
    "app-musteri",
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-dekor",
    "app-musteri",
  );
  await expect(page.getByText("Puan veya yorum yoktur")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/⭐|★|rating/i);
  await expect(page.locator(".am-gallery-slide")).toHaveCount(3);
  await page.screenshot({
    path: "artifacts/app-isletme-mobile-390.png",
    fullPage: false,
  });
  await page.getByRole("button", { name: "Rezervasyon yap" }).click();
  await expect(page.getByRole("dialog", { name: "Rezervasyon" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Talep gönder" }),
  ).toHaveAttribute("href", /\/app\/giris/);
  await expect(page).toHaveURL(/rezervasyon=1/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/app-rezervasyon-sheet-mobile-390.png",
    fullPage: false,
  });
  await page.goto("/app/isletmeler/1?rezervasyon=1");
  await expect(page.getByRole("dialog", { name: "Rezervasyon" })).toBeVisible();
  await page.goto("/app/randevular/11111111-1111-4111-8111-111111111111");
  await expect(page).toHaveURL(/\/app\/giris/);
});

test("landing CTAs point at the app and waitlist stays closed", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Uygulamayı ana ekrana ekle" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "iPhone ve iPad" }),
  ).toBeVisible();
  await expect(page.getByText("Paylaş düğmesine dokun.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Android" })).toBeVisible();
  await expect(page.locator("#uygulama img.am-add-shot")).toHaveAttribute(
    "srcset",
    /ana-ekrana-ekle@2x/,
  );
  await expect(
    page.getByRole("link", { name: "Giriş" }).first(),
  ).toHaveAttribute("href", "/app/giris");
  await expect(
    page.getByRole("link", { name: "Uygulamayı aç" }).first(),
  ).toHaveAttribute("href", "/app");
  await expect(
    page.getByRole("link", { name: "Kendi işletmeni ekle" }).first(),
  ).toHaveAttribute("href", "/app/giris?rol=isletme&kayit=1");
  await expect(
    page.getByText("Bekleme listesi çok yakında açılıyor"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Listeye yazıl" })).toHaveCount(
    0,
  );
});

test("logout does not leave personal data in Cache Storage", async ({
  page,
  request,
}) => {
  test.setTimeout(90_000);
  const health = await request.get(`${apiURL}/health`);
  expect(health.ok()).toBeTruthy();
  const healthBody = (await health.json()) as { db?: string };
  test.skip(!process.env.DATABASE_URL, "DATABASE_URL gerekli");
  expect(healthBody.db, JSON.stringify(healthBody)).toBe("connected");

  const landingOrigin = new URL(
    page.url() === "about:blank" ? "http://127.0.0.1:3100/" : page.url(),
  ).origin;
  const forged = await request.post("/app/api/oturum", {
    headers: {
      origin: "https://evil.test",
      "sec-fetch-site": "cross-site",
    },
    data: {
      phone: "05551234567",
      code: "000000",
      role: "customer",
      mode: "login",
    },
  });
  expect(forged.status()).toBe(403);

  const clearProbe = await request.delete("/app/api/oturum", {
    headers: {
      origin: landingOrigin,
      "sec-fetch-site": "same-origin",
    },
  });
  expect(clearProbe.status()).toBe(200);
  expect(clearProbe.headers()["cache-control"] ?? "").toMatch(/no-store/i);
  expect(clearProbe.headers()["clear-site-data"] ?? "").toMatch(/cache/i);

  const marker = `KvkkProbe-${randomUUID().slice(0, 8)}`;
  const phoneE164 = `+90555${String(randomInt(0, 10_000_000)).padStart(7, "0")}`;
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  process.env.OTP_PEPPER =
    process.env.E2E_OTP_PEPPER ?? process.env.OTP_PEPPER ?? "e2e-otp-pepper";
  process.env.AUTH_SECRET ??= "e2e-auth-secret";
  const databaseUrl = process.env.DATABASE_URL!;
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO app_account (phone, name, role) VALUES ($1, $2, 'customer')`,
      [phoneE164, marker],
    );
    const now = new Date();
    const expires = new Date(now.getTime() + 60 * 60 * 1000);
    await client.query(
      `INSERT INTO otp_challenge (phone, purpose, code_hash, send_count, attempt_count, window_started_at, last_sent_at, expires_at)
       VALUES ($1, 'login', $2, 1, 0, $3, $3, $4)`,
      [phoneE164, hashOtp(phoneE164, "login", code), now, expires],
    );
  } finally {
    await client.end();
  }

  await page.goto("/app");
  const login = await page.evaluate(
    async ({ phone, code: otp }) => {
      const res = await fetch("/app/api/oturum", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone,
          code: otp,
          role: "customer",
          mode: "login",
        }),
      });
      return { ok: res.ok, body: await res.json().catch(() => null) };
    },
    { phone: phoneE164, code },
  );
  expect(login.ok, JSON.stringify(login.body)).toBeTruthy();

  await page.goto("/app/hesap");
  await expect(page.getByRole("button", { name: "Çıkış" })).toBeVisible();
  await expect(page.getByText(marker)).toBeVisible();
  await expect(page.getByText(phoneE164)).toBeVisible();

  const loggedIn = await cacheDump(page);
  expect(loggedIn.body).not.toContain(marker);
  expect(loggedIn.body).not.toContain(phoneE164);
  expect(loggedIn.urls.join("\n")).not.toMatch(/\/app\/hesap/);

  const [logoutRes] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/app/api/oturum") &&
        res.request().method() === "DELETE",
    ),
    page.getByRole("button", { name: "Çıkış" }).click(),
  ]);
  expect(logoutRes.headers()["cache-control"] ?? "").toMatch(/no-store/i);
  await page.waitForURL(
    (url) => url.pathname === "/app" || url.pathname === "/app/",
  );

  const after = await cacheDump(page);
  expect(after.body).not.toContain(marker);
  expect(after.body).not.toContain(phoneE164);
  expect(after.urls.join("\n")).not.toMatch(/\/app\/hesap|\?_rsc=/);
});
