import { expect, test } from "@playwright/test";

test("landing exposes v3 semantic tokens and lazy GSAP on home only", async ({ page }) => {
  const gsapBodies: string[] = [];
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/_next/static/")) return;
    try {
      const text = await response.text();
      if (text.includes("ScrollTrigger") || text.includes("gsap.registerPlugin")) {
        gsapBodies.push(url);
      }
    } catch {
      /* ignore truncated or binary chunks */
    }
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Adada randevu ve rezervasyon/ })).toBeVisible();

  const brand = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      brand: styles.getPropertyValue("--color-brand").trim(),
      surface: styles.getPropertyValue("--color-surface").trim(),
      accent: styles.getPropertyValue("--color-accent-coral").trim(),
      motionBase: styles.getPropertyValue("--motion-duration-base").trim(),
      amSurface: styles.getPropertyValue("--am-color-surface").trim(),
      am3Bg: styles.getPropertyValue("--am3-bg").trim(),
      amSand: styles.getPropertyValue("--am-brand-sand").trim(),
    };
  });
  expect(brand.brand.toLowerCase()).toBe("#0f2c44");
  expect(brand.surface.toLowerCase()).toBe("#ffffff");
  expect(brand.accent.toLowerCase()).toBe("#e4572e");
  expect(brand.am3Bg.toLowerCase()).toBe("#fffbf2");
  expect(brand.amSand.toLowerCase()).toBe(brand.am3Bg.toLowerCase());
  expect(brand.motionBase.length).toBeGreaterThan(0);
  expect(brand.amSurface).toBe(brand.surface);
  expect((await page.request.get("/v3/desen/dalga.svg")).ok()).toBeTruthy();

  await expect(page.locator("html")).toHaveAttribute("data-gsap-ready", "true", { timeout: 10_000 });
  expect(gsapBodies.length).toBeGreaterThan(0);
});

test("app shell does not load GSAP", async ({ page }) => {
  const gsapBodies: string[] = [];
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/_next/static/")) return;
    try {
      const text = await response.text();
      if (text.includes("ScrollTrigger") || text.includes("gsap.registerPlugin")) {
        gsapBodies.push(url);
      }
    } catch {
      /* ignore */
    }
  });

  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Yarın için uygun saat" })).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-gsap-ready", "true");
  expect(gsapBodies).toEqual([]);
});

test("reduced motion skips GSAP scenes and zeros motion tokens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Adada randevu ve rezervasyon/ })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-gsap-ready", "true", { timeout: 10_000 });
  await expect(page.locator("html")).toHaveAttribute("data-gsap-reduced", "true");

  const duration = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--motion-duration-base").trim(),
  );
  expect(duration).toBe("0.01ms");
});
