import { expect, test, type Page } from "@playwright/test";
import { devices } from "@playwright/test";

const IOS_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

function manifestScopeCoversPath(scope: string, pathname: string): boolean {
  const path = pathname.split("?")[0] || "/";
  if (path === scope) return true;
  const directory = scope.endsWith("/") ? scope : `${scope}/`;
  return path.startsWith(directory);
}

async function emulateAndroidStandalone(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setEmulatedMedia", {
    features: [{ name: "display-mode", value: "standalone" }],
  });
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = ((query: string) => {
      if (String(query).includes("display-mode: standalone")) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
          dispatchEvent() {
            return false;
          },
        } as MediaQueryList;
      }
      return original(query);
    }) as typeof window.matchMedia;
  });
}

async function expectAppShell(page: Page) {
  await expect(page).toHaveURL(/\/app\/?(\?|$)/);
  await expect(page.getByRole("navigation", { name: "Müşteri gezinme" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Keşif" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("body")).not.toContainText(/Adada randevu ve rezervasyon dağılmasın/i);
}

test("landing HTML redirects standalone before body and links the app manifest", async ({
  request,
}) => {
  const landing = await request.get("/");
  expect(landing.ok()).toBeTruthy();
  const html = await landing.text();
  const scriptIdx = html.indexOf("display-mode: standalone");
  const bodyIdx = html.indexOf("<body");
  expect(scriptIdx).toBeGreaterThan(-1);
  expect(bodyIdx).toBeGreaterThan(-1);
  expect(scriptIdx).toBeLessThan(bodyIdx);
  expect(html).toContain("navigator.standalone===true");
  expect(html).toContain('location.replace("/app")');
  expect(html).toContain('p!=="/"');
  expect(html).toContain("1500");
  expect(html).toMatch(/rel="manifest"[^>]*href="\/app\/manifest\.json"|href="\/app\/manifest\.json"[^>]*rel="manifest"/);
  expect(html).toContain('name="apple-mobile-web-app-capable"');
  expect(html).toContain('name="mobile-web-app-capable"');
  expect(html).toContain('name="apple-mobile-web-app-status-bar-style"');
  expect(html).toContain('name="apple-mobile-web-app-title"');
  expect(html).not.toMatch(/KKTC/i);

  const appHtml = await (await request.get("/app")).text();
  expect(appHtml).not.toContain('location.replace("/app")');

  for (const path of ["/yasal/gizlilik", "/yasal/kvkk", "/yasal/aydinlatma"]) {
    const legalHtml = await (await request.get(path)).text();
    expect(legalHtml).not.toContain('location.replace("/app")');
  }
});

test("app manifest is installable and scope covers /app root", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]').first()).toHaveAttribute(
    "href",
    "/app/manifest.json",
  );

  const manifest = await page.request.get("/app/manifest.json");
  expect(manifest.ok()).toBeTruthy();
  const body = (await manifest.json()) as {
    start_url?: string;
    scope?: string;
    display?: string;
    icons?: { src?: string; sizes?: string }[];
    shortcuts?: { url?: string }[];
  };
  expect(body.start_url).toBe("/app?source=pwa");
  expect(body.scope).toBe("/app");
  expect(body.display).toBe("standalone");
  expect(manifestScopeCoversPath(body.scope, "/app")).toBe(true);
  expect(manifestScopeCoversPath(body.scope, "/app/")).toBe(true);
  expect(manifestScopeCoversPath(body.scope, "/app/randevular")).toBe(true);
  expect(manifestScopeCoversPath("/app/", "/app")).toBe(false);
  expect(body.icons?.some((icon) => icon.sizes === "192x192")).toBe(true);
  expect(body.icons?.some((icon) => icon.sizes === "512x512")).toBe(true);
  expect(body.shortcuts?.some((item) => item.url === "/app/randevular")).toBe(true);
  expect(JSON.stringify(body)).not.toMatch(/KKTC/i);

  const startPath = new URL(body.start_url ?? "", "https://ada.invalid").pathname;
  expect(manifestScopeCoversPath(body.scope, startPath)).toBe(true);

  const sw = await page.request.get("/app/sw.js");
  expect(sw.headers()["service-worker-allowed"] ?? "").toBe("/app");
  expect(await sw.text()).toMatch(/ada-merkez-app-v4/);

  const client = await page.context().newCDPSession(page);
  const appManifest = (await client.send("Page.getAppManifest")) as {
    url?: string;
    data?: string;
    errors?: { error?: string; critical?: boolean }[];
  };
  expect(appManifest.url ?? "").toMatch(/\/app\/manifest\.json/);
  expect(appManifest.data ?? "").toContain("/app?source=pwa");
  expect(appManifest.data ?? "").toMatch(/"scope"\s*:\s*"\/app"/);
  expect(JSON.stringify(appManifest.errors ?? [])).not.toMatch(/start-url|scope/i);

  const installability = (await client.send("Page.getInstallabilityErrors")) as {
    errors?: { errorId?: string }[];
  };
  const errorIds = (installability.errors ?? []).map((item) => item.errorId ?? "");
  expect(errorIds).not.toContain("manifest-start-url-is-not-valid");
  expect(errorIds).not.toContain("start-url-not-valid");
  expect(errorIds.some((id) => /scope/i.test(id))).toBe(false);

  await page.goto("/app?source=pwa");
  await expectAppShell(page);
});

test("landing SW cache of / does not shadow /app", async ({ page }) => {
  await page.goto("/");
  const swReady = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  expect(swReady).toBe(true);

  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          const match = await cache.match("/");
          if (match) return true;
        }
        return false;
      });
    })
    .toBe(true);

  const cachedLanding = await page.evaluate(async () => {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      const match = await cache.match("/");
      if (match) return match.text();
    }
    return "";
  });
  expect(cachedLanding).toContain("display-mode: standalone");
  expect(cachedLanding).toContain('location.replace("/app")');

  await page.evaluate(async () => {
    const cache = await caches.open("probe-landing-shadow");
    await cache.put(
      "/",
      new Response("<!doctype html><html><body>LANDING_SHADOW_PROBE</body></html>", {
        headers: { "content-type": "text/html" },
      }),
    );
  });

  await page.goto("/app");
  await expectAppShell(page);
  await expect(page.locator("body")).not.toContainText("LANDING_SHADOW_PROBE");

  const appHtml = await page.evaluate(async () => {
    const res = await fetch("/app", { method: "GET" });
    return res.text();
  });
  expect(appHtml).not.toContain("LANDING_SHADOW_PROBE");
  expect(appHtml).toContain("Keşif");
  expect(appHtml).toContain('data-dekor="app-musteri"');
});

test("unregisters leftover /app/ service worker scope", async ({ page }) => {
  await page.goto("/app");
  await expectAppShell(page);
  const scopesAfterLegacy = await page.evaluate(async () => {
    await navigator.serviceWorker.register("/app/sw.js", { scope: "/app/" });
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.map((reg) => new URL(reg.scope).pathname);
  });
  expect(scopesAfterLegacy.some((path) => path === "/app" || path === "/app/")).toBe(true);
  if (!scopesAfterLegacy.includes("/app/")) {
    return;
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const regs = await navigator.serviceWorker.getRegistrations();
        const paths = regs.map((reg) => new URL(reg.scope).pathname);
        return paths.includes("/app") && !paths.includes("/app/");
      });
    })
    .toBe(true);
});

test.describe("Android Chrome standalone display-mode", () => {
  const pixel = devices["Pixel 7"];
  test.use({
    viewport: pixel.viewport,
    userAgent: pixel.userAgent,
    isMobile: pixel.isMobile,
    hasTouch: pixel.hasTouch,
    deviceScaleFactor: pixel.deviceScaleFactor,
  });

  test("home-screen launch opens /app, not landing", async ({ page }) => {
    await emulateAndroidStandalone(page);
    await page.goto("/", { waitUntil: "commit" }).catch(() => undefined);
    await page.waitForURL((url) => url.pathname === "/app" || url.pathname === "/app/");
    await expectAppShell(page);
  });

  test("already on /app does not loop", async ({ page }) => {
    await emulateAndroidStandalone(page);
    await page.goto("/app", { waitUntil: "domcontentloaded" });
    await expectAppShell(page);
    expect(new URL(page.url()).pathname).toMatch(/^\/app\/?$/);
  });

  test("legal pages stay in standalone without redirect", async ({ page }) => {
    await emulateAndroidStandalone(page);
    await page.goto("/yasal/gizlilik", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/yasal\/gizlilik/);
    await expect(page.getByRole("heading", { name: "Gizlilik" })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/yasal/gizlilik");
  });
});

test.describe("iOS Safari UA + navigator.standalone", () => {
  const iphone = devices["iPhone 14"];
  test.use({
    viewport: iphone.viewport,
    userAgent: IOS_SAFARI_UA,
    isMobile: iphone.isMobile,
    hasTouch: iphone.hasTouch,
    deviceScaleFactor: iphone.deviceScaleFactor,
  });

  test("Add to Home Screen from landing opens /app", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "standalone", {
        configurable: true,
        get: () => true,
      });
    });
    await page.goto("/", { waitUntil: "commit" }).catch(() => undefined);
    await page.waitForURL((url) => url.pathname === "/app" || url.pathname === "/app/");
    await expectAppShell(page);
  });

  test("KVKK page stays open in standalone", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "standalone", {
        configurable: true,
        get: () => true,
      });
    });
    await page.goto("/yasal/kvkk", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/yasal\/kvkk/);
    expect(new URL(page.url()).pathname).toBe("/yasal/kvkk");
  });
});
