import { expect, test } from "@playwright/test";

function readTokens() {
  const styles = getComputedStyle(document.documentElement);
  const seen = new Set<string>();
  const resolve = (name: string): string => {
    const raw = styles.getPropertyValue(name).trim();
    const match = raw.match(/^var\(\s*(--[\w-]+)/);
    if (!match) return raw;
    if (seen.has(match[1])) return raw;
    seen.add(match[1]);
    return resolve(match[1]);
  };
  return {
    brand: resolve("--color-brand"),
    surface: resolve("--color-surface"),
    accent: resolve("--color-accent-coral"),
    motionBase: resolve("--motion-duration-base"),
    amSurface: resolve("--am-color-surface"),
    am3Bg: resolve("--am3-bg"),
    amSand: resolve("--am-brand-sand"),
  };
}

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
  await expect(page.getByRole("heading", { name: /Adanın saati/ })).toBeVisible();

  const brand = await page.evaluate(readTokens);
  expect(brand.brand.toLowerCase()).toBe("#0f2c44");
  expect(brand.surface.toLowerCase()).toBe("#ffffff");
  expect(brand.accent.toLowerCase()).toBe("#e4572e");
  expect(brand.am3Bg.toLowerCase()).toBe("#fffbf2");
  expect(brand.amSand.toLowerCase()).toBe(brand.am3Bg.toLowerCase());
  expect(brand.motionBase.length).toBeGreaterThan(0);
  expect(brand.amSurface.toLowerCase()).toBe(brand.surface.toLowerCase());
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

  await page.addInitScript(() => {
    try {
      localStorage.setItem("am_onboarding_v3", "1");
      sessionStorage.setItem("am_splash_v3", "1");
    } catch {
      /* gizli */
    }
  });
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Keşif" })).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-gsap-ready", "true");
  expect(gsapBodies).toEqual([]);
});

test("reduced motion skips GSAP scenes and zeros motion tokens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Adanın saati/ })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-gsap-ready", "true", { timeout: 10_000 });
  await expect(page.locator("html")).toHaveAttribute("data-gsap-reduced", "true");

  const duration = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--motion-duration-base").trim(),
  );
  expect(duration).toMatch(/^(0\.01ms|80ms)$/);
});
