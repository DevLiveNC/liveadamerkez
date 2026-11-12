import { expect, test } from "@playwright/test";

test("uygulama kabuğu mobil ve masaüstünde durur", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Keşif" })).toBeVisible();
  await expect(page.getByRole("link", { name: "İçeriğe geç" })).toHaveAttribute("href", "#icerik");
  await expect(page.getByRole("main")).toHaveAttribute("id", "icerik");
  const mainPad = await page.locator("#icerik").evaluate((el) => getComputedStyle(el).paddingLeft);
  expect(Number.parseFloat(mainPad)).toBeGreaterThanOrEqual(16);
  const nav = page.getByRole("navigation", { name: "Müşteri gezinme" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Keşif" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Randevu" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Favori" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Hesap" })).toBeVisible();
  await expect(page.locator("header.am-header")).toBeVisible();
  await expect(page.locator("#icerik")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/KKTC/i);

  const shellTokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      safeTop: style.getPropertyValue("--am-safe-top").trim(),
      header: style.getPropertyValue("--am-shell-header-height").trim(),
      tabbar: style.getPropertyValue("--am-shell-tabbar-height").trim(),
    };
  });
  expect(shellTokens.safeTop.length).toBeGreaterThan(0);
  expect(shellTokens.header).toBe("56px");
  expect(shellTokens.tabbar).toBe("56px");
  const headerPad = await page.locator("header.am-header").evaluate((el) => getComputedStyle(el).paddingTop);
  expect(Number.parseFloat(headerPad)).toBeGreaterThanOrEqual(8);

  await page.screenshot({ path: "artifacts/app-shell-mobile-390.png", fullPage: false });
  await page.screenshot({ path: "artifacts/app-kesif-mobile-390.png", fullPage: false });

  await page.goto("/app?q=kuaf%C3%B6r");
  await expect(page.getByRole("heading", { name: "Arama" })).toBeVisible();
  await expect(page.getByRole("searchbox")).toHaveValue("kuaför");
  await expect(page.getByRole("heading", { name: "Örnek Kuaför" })).toBeVisible();
  await page.screenshot({ path: "artifacts/app-ara-mobile-390.png", fullPage: false });
  await page.goto("/app");

  await page.goto("/app?iskelet=1");
  await expect(page.getByRole("status")).toBeVisible();
  await page.screenshot({ path: "artifacts/app-skeleton-mobile-390.png", fullPage: false });
  await page.goto("/app");

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/app");
  await expect(page.getByRole("navigation", { name: "Müşteri gezinme" })).toBeVisible();
  await expect(page.locator(".am-shell")).toBeVisible();
  await page.screenshot({ path: "artifacts/app-shell-desktop.png", fullPage: false });

  await page.emulateMedia({ reducedMotion: "reduce" });
  const motion = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--am-motion-base").trim());
  expect(motion).toBe("80ms");
});

test("giriş kabuğu sekmesiz kalır ve sayfa geçişi çalışır", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/giris");
  await expect(page.getByRole("heading", { name: "Adada randevu ve rezervasyon dağılmasın." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Müşteri gezinme" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Müşteri" })).toBeVisible();
  await expect(page.getByRole("main")).toHaveAttribute("id", "icerik");
  await expect(page.getByRole("link", { name: "İçeriğe geç" })).toHaveAttribute("href", "#icerik");
  await page.screenshot({ path: "artifacts/app-giris-mobile-390.png", fullPage: false });
});

test("keşif → işletme detayı → geri: yığın korunur, alt şerit içeriği örtmez", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try {
      localStorage.setItem("am_onboarding_v3", "1");
      sessionStorage.setItem("am_splash_v3", "1");
    } catch {
      /* gizli */
    }
  });

  await page.goto("/app?category=kuafor");
  await expect(page.getByRole("heading", { name: "Keşif" })).toBeVisible();

  /* Alt şerit yüzen cam kapsül: içerik son satırı şeridin altında kalmamalı. */
  const metrics = await page.evaluate(() => {
    const main = document.getElementById("icerik");
    const nav = document.querySelector(".am-tabbar");
    if (!main || !nav) return null;
    const navBox = nav.getBoundingClientRect();
    const mainStyle = getComputedStyle(main);
    return {
      paddingBottom: Number.parseFloat(mainStyle.paddingBottom),
      navHeight: navBox.height,
      navBottom: window.innerHeight - navBox.bottom,
      mainScrolls: ["auto", "scroll"].includes(mainStyle.overflowY),
    };
  });
  expect(metrics).not.toBeNull();
  expect(metrics?.mainScrolls).toBe(true);
  expect(metrics?.navHeight).toBeGreaterThanOrEqual(56);
  expect(metrics?.paddingBottom).toBeGreaterThanOrEqual((metrics?.navHeight ?? 0));
  expect(metrics?.navBottom).toBeGreaterThanOrEqual(0);

  await page.getByRole("link", { name: "Örnek Kuaför" }).first().click();
  await expect(page).toHaveURL(/\/app\/isletmeler\/1/);
  const back = page.locator("[data-am-back]");
  await expect(back).toBeVisible();
  const backBox = await back.boundingBox();
  expect(backBox?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(backBox?.height ?? 0).toBeGreaterThanOrEqual(44);

  await back.click();
  await expect(page).toHaveURL(/\/app\?category=kuafor$/);
  await expect(page.getByRole("heading", { name: "Keşif" })).toBeVisible();
});

test("doğrudan girişte geri düğmesi üst rotaya iner (geçmiş yok)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    try {
      localStorage.setItem("am_onboarding_v3", "1");
      sessionStorage.setItem("am_splash_v3", "1");
    } catch {
      /* gizli */
    }
  });

  await page.goto("/app/isletmeler/2");
  await expect(page.getByRole("heading", { name: "Örnek Güzellik" })).toBeVisible();
  await page.locator("[data-am-back]").click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("navigation", { name: "Müşteri gezinme" })).toBeVisible();
});
