import { expect, test } from "@playwright/test";

test("uygulama kabuğu mobil ve masaüstünde durur", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Yarın için uygun saat" })).toBeVisible();
  await expect(page.getByRole("link", { name: "İçeriğe geç" })).toHaveAttribute("href", "#icerik");
  const nav = page.getByRole("navigation", { name: "Müşteri gezinme" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Keşif" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Randevu" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Favori" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Hesap" })).toBeVisible();
  await expect(page.locator("header.am-top")).toBeVisible();
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
  const headerPad = await page.locator("header.am-top").evaluate((el) => getComputedStyle(el).paddingTop);
  expect(Number.parseFloat(headerPad)).toBeGreaterThanOrEqual(8);

  await page.screenshot({ path: "artifacts/app-shell-mobile-390.png", fullPage: false });

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
  await page.screenshot({ path: "artifacts/app-giris-mobile-390.png", fullPage: false });
});
