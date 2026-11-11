import { expect, test } from "@playwright/test";

test("PWA launch plays skippable splash then onboarding without KKTC", async ({ page }) => {
  await page.goto("/app?source=pwa");
  await expect(page.locator(".am-splash")).toBeVisible();
  await expect(page.getByRole("dialog", { name: /Adanın saati/ })).toBeVisible();
  expect((await page.request.get("/app/v3/maskot/kabuki-selam-512.png")).ok()).toBeTruthy();
  expect((await page.request.get("/app/v3/logo/ada-merkez-a-isaret-renk-seffaf-acik.svg")).ok()).toBeTruthy();
  await page.getByRole("button", { name: "Açılış animasyonunu atla" }).click();
  await expect(page.locator(".am-splash")).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Nasıl çalışır" })).toBeVisible();
  await page.getByRole("button", { name: "Atla" }).click();
  await expect(page.getByRole("heading", { name: "Keşif" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/KKTC/i);
});

test("browser /app skips splash so the home heading stays the LCP", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("am_onboarding_v3", "1");
    } catch {
      /* gizli */
    }
  });
  await page.goto("/app");
  await expect(page.locator(".am-splash")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Keşif" })).toBeVisible();
});

test("reduced motion splash is last-frame opacity only", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/app?source=pwa");
  await expect(page.locator(".am-splash")).toBeVisible();
  const duration = await page.locator(".am-splash").evaluate((el) => getComputedStyle(el).animationDuration);
  expect(duration).toMatch(/0\.2s|200ms/);
  await page.getByRole("button", { name: "Açılış animasyonunu atla" }).click();
  const onboarding = page.getByRole("dialog", { name: "Nasıl çalışır" });
  if (await onboarding.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Atla" }).click();
  }
  await expect(page.getByRole("heading", { name: "Keşif" })).toBeVisible();
});
